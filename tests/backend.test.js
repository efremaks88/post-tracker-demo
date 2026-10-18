const {test,before,after,beforeEach} = require('node:test');
const assert = require('node:assert/strict');
const {PGlite} = require('@electric-sql/pglite');
const express = require('express');
const {runMigrations} = require('../lib/migrate');
const {withTransaction} = require('../lib/db');
const {auditMutation} = require('../lib/audit');
const createRBAC = require('../lib/rbac');
const {PERMISSIONS,FUTURE_PERMISSIONS,roleHasPermission,createPolicy} = require('../lib/policy');
const registerRoutes = require('../routes/data');
const createData = require('../lib/models/state');
const createUsers = require('../lib/models/users');
const createLDAP = require('../lib/ldap');
const {validDay,validBirthday} = require('../lib/validation');
let pg,pool,server,base;
const broadcasts=[];
before(async()=>{
  pg=await PGlite.create();
  pool={query:async(sql,params)=>params?pg.query(sql,params):(await pg.exec(sql)).at(-1),
    connect:async()=>({query:(sql,params)=>pool.query(sql,params),release(){}})};
  await runMigrations(pool);
  for(const [i,role] of ['admin','lead','manager','editor','viewer','na','unexpected'].entries())
    await pool.query('INSERT INTO users(id,sam_name,display_name,email,role) VALUES($1,$2,$3,$4,$5)',[i+1,'user'+(i+1),'Пользователь '+(i+1),'',role]);
  await pool.query("INSERT INTO users(id,sam_name,display_name,role,ad_enabled) VALUES(8,'disabled','Отключён','admin',false)");
  const app=express();app.use(express.json());
  app.use((req,res,next)=>{const id=Number(req.headers['x-test-user']||1);req.session={userId:id,samName:'user'+id,displayName:'Пользователь '+id,role:'admin',csrfToken:'test-token',regenerate(callback){req.session={};callback();},destroy(callback){callback();}};if(id===0)delete req.session.userId;next();});
  const rbac=createRBAC(pool);
  registerRoutes(app,pool,{...rbac,broadcast:event=>broadcasts.push(event),handleSSE:(req,res)=>res.json({ok:true}),loginLimiter:(req,res,next)=>next(),
    ldapBind:async()=>({unbind(){}}),ldapSearchUser:async()=>({samaccountname:'user1',useraccountcontrol:'512'}),
    syncADUser:async name=>(await pool.query('SELECT * FROM users WHERE sam_name=$1',[name])).rows[0],
    isUserEnabled:value=>(Number(value)&2)===0,listADUsers:async()=>[],syncAllADUsers:async()=>0});
  app.use((error,req,res,next)=>res.status(500).json({error:'Internal error'}));
  await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});
  base='http://127.0.0.1:'+server.address().port;
});
after(async()=>{if(server)await new Promise(r=>server.close(r));if(pg)await pg.close();});
beforeEach(async()=>{
  await pool.query('TRUNCATE project_managers,series,tasks,people,projects,user_projects,person_absences,roles,stages,stage_groups,holidays,app_state,audit_log RESTART IDENTITY CASCADE');
  await pool.query("INSERT INTO app_state(key,value) VALUES('revision','0'::jsonb)");
  await pool.query("UPDATE users SET role=CASE id WHEN 1 THEN 'admin' WHEN 2 THEN 'lead' WHEN 3 THEN 'manager' WHEN 4 THEN 'editor' WHEN 5 THEN 'viewer' WHEN 6 THEN 'na' WHEN 7 THEN 'unexpected' ELSE 'admin' END");
  broadcasts.length=0;
});
async function request(url,method='GET',body,user=1,extraHeaders={}){
  if(url==='/api/data'&&['POST','PUT'].includes(method)&&body&&!Object.hasOwn(body,'_revision')) {
    const current=await request('/api/data','GET',undefined,user);
    body={...body,_revision:current.body._revision};
  }
  const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json','x-test-user':String(user),...extraHeaders},body:body===undefined?undefined:JSON.stringify(body)});
  return {status:response.status,body:await response.json()};
}
const project=(id='p')=>({id,name:'Проект '+id,color:'#3b82f6',managers:[]});
const series=(id='s',projectId='p')=>({id,name:'С01',projectId,airDay:0});
const task=(id=1,projectId='p')=>({id,project:projectId,status:'монтаж',day:'11.10.2026',from:10.5,to:18,person:'Тест'});
async function fixture(){
  await request('/api/data/project','POST',project('p'));await request('/api/data/project','POST',project('other'));
  await request('/api/data/series','POST',series());await request('/api/data/task','POST',task());
  await pool.query("INSERT INTO project_managers(project_id,user_uid,user_name) VALUES('p','user3','Пользователь 3')");
  await pool.query("INSERT INTO user_projects(user_id,project_id,can_view,can_edit) VALUES(4,'p',true,true),(5,'p',true,false)");
}
test('central permission matrix preserves current roles and denies future permissions',()=>{
  const expected={
    admin:[true,true,true,true,true],
    lead:[true,true,true,true,false],
    manager:[true,true,false,true,false],
    editor:[true,true,false,false,false],
    viewer:[true,false,false,false,false],
    na:[false,false,false,false,false],
    unexpected:[false,false,false,false,false],
  };
  for(const [role,grants] of Object.entries(expected)){
    assert.deepEqual([
      roleHasPermission(role,PERMISSIONS.POST_READ),
      roleHasPermission(role,PERMISSIONS.POST_WRITE),
      roleHasPermission(role,PERMISSIONS.POST_DIRECTORY_WRITE),
      roleHasPermission(role,PERMISSIONS.AUDIT_VIEW),
      roleHasPermission(role,PERMISSIONS.USERS_MANAGE),
    ],grants,role);
    for(const permission of FUTURE_PERMISSIONS) assert.equal(roleHasPermission(role,permission),false,role+' '+permission);
  }
  for(const role of ['admin','lead','manager']){
    assert.equal(roleHasPermission(role,PERMISSIONS.PRODUCER_READ),true,role);
    assert.equal(roleHasPermission(role,PERMISSIONS.PRODUCER_WRITE),true,role);
  }
  for(const role of ['editor','viewer','na','unexpected'])assert.equal(roleHasPermission(role,PERMISSIONS.PRODUCER_READ),false,role);
  for(const role of ['admin','lead'])assert.equal(roleHasPermission(role,PERMISSIONS.APPROVAL_DECIDE),true,role);
  for(const role of ['manager','editor','viewer','na','unexpected'])assert.equal(roleHasPermission(role,PERMISSIONS.APPROVAL_DECIDE),false,role);
});
test('central project and audit scopes enforce manager, editor and viewer boundaries',async()=>{
  await fixture();
  const policy=createPolicy(pool);
  assert.equal(await policy.can({userId:3,role:'manager'},PERMISSIONS.POST_PROJECT_EDIT,{projectId:'p'}),true);
  assert.equal(await policy.can({userId:3,role:'manager'},PERMISSIONS.POST_PROJECT_EDIT,{projectId:'other'}),false);
  assert.equal(await policy.can({userId:4,role:'editor'},PERMISSIONS.POST_PROJECT_EDIT,{projectId:'p'}),true);
  assert.equal(await policy.can({userId:5,role:'viewer'},PERMISSIONS.POST_PROJECT_VIEW,{projectId:'p'}),true);
  assert.equal(await policy.can({userId:5,role:'viewer'},PERMISSIONS.POST_PROJECT_EDIT,{projectId:'p'}),false);
  const managerAudit=await policy.auditScope({userId:3,role:'manager'});
  assert.deepEqual(managerAudit.projectIds,['p']);assert.equal(managerAudit.includeRestricted,false);
  const leadAudit=await policy.auditScope({userId:2,role:'lead'});
  assert.equal(leadAudit.projectIds,null);assert.equal(leadAudit.includeRestricted,true);
  assert.equal(await policy.auditScope({userId:4,role:'editor'}),null);
});
test('route permissions keep user management and directories at their previous boundaries',async()=>{
  for(const user of [1,2,3]) assert.equal((await request('/api/users','GET',undefined,user)).status,200);
  for(const user of [4,5,6,7]) assert.equal((await request('/api/users','GET',undefined,user)).status,403);
  assert.equal((await request('/api/data/person','POST',{id:'lead-person',name:'Создан руководителем'},2)).status,200);
  assert.equal((await request('/api/data/person','POST',{id:'manager-person',name:'Запрещено'},3)).status,403);
  assert.equal((await request('/api/data/achievement','POST',{id:'admin-achievement',title:'Разрешено'},1)).status,200);
  assert.equal((await request('/api/data/achievement','POST',{id:'lead-achievement',title:'Запрещено'},2)).status,403);
});
test('all SQL migrations apply twice without losing data',async()=>{
  const first=(await pool.query('SELECT count(*)::int AS n FROM _migrations')).rows[0].n;
  assert.equal(first,17);await runMigrations(pool);assert.equal((await pool.query('SELECT count(*)::int AS n FROM _migrations')).rows[0].n,first);
});

test('producer vertical slice persists blocks, groups, assignments, completion and audit',async()=>{
  await fixture();
  await request('/api/data/person','POST',{id:'producer-a',name:'Продюсер А',login:'user1'});
  await request('/api/data/person','POST',{id:'producer-b',name:'Продюсер Б'});
  await pool.query('TRUNCATE audit_log RESTART IDENTITY');
  const created=await request('/api/producer/projects/p/blocks','POST',{
    name:'Препродакшн',description:'Подготовка проекта',seriesId:'s',ownerPersonId:'producer-a',deadline:'2026-10-20',status:'active',
  });
  assert.equal(created.status,200);assert.ok(created.body.id);
  const blockId=created.body.id;
  const group=await request('/api/producer/blocks/'+blockId+'/groups','POST',{name:'Сценарий'});
  assert.equal(group.status,200);assert.ok(group.body.id);
  const taskCreated=await request('/api/producer/blocks/'+blockId+'/tasks','POST',{
    title:'Утвердить синопсис',groupId:group.body.id,assigneePersonId:'producer-a',deadline:'2026-10-18',
  });
  assert.equal(taskCreated.status,200);assert.ok(taskCreated.body.id);
  assert.equal((await request('/api/producer/tasks/'+taskCreated.body.id,'PATCH',{assigneePersonId:'producer-b'})).status,200);
  assert.equal((await request('/api/producer/tasks/'+taskCreated.body.id,'PATCH',{completed:true})).status,200);
  const loaded=await request('/api/producer/blocks/'+blockId);
  assert.equal(loaded.status,200);assert.equal(loaded.body.groups[0].name,'Сценарий');
  assert.equal(loaded.body.tasks[0].assigneeName,'Продюсер Б');assert.equal(loaded.body.tasks[0].completed,true);
  assert.ok(loaded.body.history.length>=5);
  const audit=(await pool.query("SELECT entity,action,project_id FROM audit_log WHERE entity LIKE 'production%' ORDER BY id")).rows;
  assert.deepEqual(audit.map(row=>row.action),['create','create','create','assign','complete']);
  assert.ok(audit.every(row=>row.project_id==='p'));
  const map=await request('/api/producer/projects/p');
  assert.equal(map.body.blocks[0].completedTasks,1);assert.equal(map.body.blocks[0].totalTasks,1);
  assert.equal((await request('/api/producer/dashboard')).body.projects.find(item=>item.id==='p').progress,100);
  assert.equal((await request('/api/producer/projects/p','GET',undefined,4)).status,403);
  assert.equal((await request('/api/producer/projects/p/blocks','POST',{name:'Блок менеджера',ownerPersonId:'producer-a'},3)).status,200);
  assert.equal((await request('/api/producer/projects/other/blocks','POST',{name:'Чужой блок',ownerPersonId:'producer-a'},3)).status,403);
});
test('D1 edits tasks and blocks and removes groups without losing their tasks',async()=>{
  await fixture();
  await request('/api/data/person','POST',{id:'producer-a',name:'Продюсер А',login:'user1'});
  await request('/api/data/person','POST',{id:'producer-b',name:'Продюсер Б'});
  await pool.query('TRUNCATE audit_log RESTART IDENTITY');
  const blockId=(await request('/api/producer/projects/p/blocks','POST',{
    name:'Подготовка',description:'Черновик',ownerPersonId:'producer-a',startDate:'2026-10-16',deadline:'2026-10-20',status:'active',
  })).body.id;
  const firstGroup=(await request('/api/producer/blocks/'+blockId+'/groups','POST',{name:'Сценарий'})).body.id;
  const secondGroup=(await request('/api/producer/blocks/'+blockId+'/groups','POST',{name:'Документы'})).body.id;
  const taskId=(await request('/api/producer/blocks/'+blockId+'/tasks','POST',{
    title:'Черновая задача',internalComment:'Первая внутренняя заметка',groupId:firstGroup,assigneePersonId:'producer-a',
  })).body.id;

  assert.equal((await request('/api/producer/tasks/'+taskId,'PATCH',{
    title:'Подготовить договор',internalComment:'Юристы ждут приложение № 2',groupId:secondGroup,assigneePersonId:'producer-b',responsiblePersonId:'producer-a',deadline:'2026-10-19',
  })).status,200);
  assert.equal((await request('/api/producer/groups/'+secondGroup,'PATCH',{name:'Договоры'})).status,200);
  assert.equal((await request('/api/producer/tasks/'+taskId,'PATCH',{groupId:firstGroup})).status,200);
  assert.equal((await request('/api/producer/blocks/'+blockId,'PATCH',{
    name:'Подготовка проекта',description:'Обновлено',ownerPersonId:'producer-b',startDate:'2026-10-17',deadline:'2026-10-21',status:'active',
  })).status,200);
  const removed=await request('/api/producer/groups/'+firstGroup,'DELETE');
  assert.equal(removed.status,200);assert.equal(removed.body.movedTasks,1);

  let loaded=(await request('/api/producer/blocks/'+blockId)).body;
  assert.equal(loaded.block.name,'Подготовка проекта');assert.equal(loaded.block.ownerName,'Продюсер Б');
  assert.equal(loaded.block.startDate,'2026-10-17');assert.equal(loaded.block.deadline,'2026-10-21');
  assert.deepEqual(loaded.groups.map(item=>item.name),['Договоры']);
  assert.equal(loaded.tasks[0].title,'Подготовить договор');assert.equal(loaded.tasks[0].groupId,null);
  assert.equal(loaded.tasks[0].internalComment,'Юристы ждут приложение № 2');
  assert.equal(loaded.tasks[0].assigneeName,'Продюсер Б');assert.equal(loaded.tasks[0].responsibleName,'Продюсер А');
  assert.equal(loaded.tasks[0].deadline,'2026-10-19');

  assert.equal((await request('/api/producer/tasks/'+taskId,'PATCH',{completed:true})).status,200);
  let projectMap=(await request('/api/producer/projects/p')).body;
  assert.equal(projectMap.blocks.find(item=>item.id===blockId).completedTasks,1);
  assert.equal((await request('/api/producer/dashboard')).body.projects.find(item=>item.id==='p').progress,100);
  assert.equal((await request('/api/producer/tasks/'+taskId,'PATCH',{completed:false})).status,200);
  loaded=(await request('/api/producer/blocks/'+blockId)).body;
  assert.equal(loaded.tasks[0].completed,false);assert.ok(loaded.history.some(event=>event.action==='delete'&&event.entity==='productionGroup'));
  assert.ok(loaded.history.some(event=>event.action==='move'&&event.entity==='productionTask'));
  assert.ok(loaded.history.some(event=>event.action==='complete'));
  assert.ok(loaded.history.some(event=>event.action==='restore'));
  assert.ok(loaded.history.some(event=>event.entity==='productionTask'&&event.changes.some(change=>change.field==='internal_comment'&&change.after==='Юристы ждут приложение № 2')));

  const otherBlock=(await request('/api/producer/projects/other/blocks','POST',{name:'Чужой',ownerPersonId:'producer-a'})).body.id;
  const foreignGroup=(await request('/api/producer/blocks/'+otherBlock+'/groups','POST',{name:'Чужая группа'})).body.id;
  assert.equal((await request('/api/producer/tasks/'+taskId,'PATCH',{groupId:foreignGroup})).status,400);
  const auditBefore=(await pool.query('SELECT count(*)::int AS n FROM audit_log')).rows[0].n;
  assert.equal((await request('/api/producer/blocks/'+blockId,'PATCH',{startDate:'2026-10-30',deadline:'2026-10-20'})).status,400);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM audit_log')).rows[0].n,auditBefore);
  assert.equal((await request('/api/producer/tasks/'+taskId,'PATCH',{deadline:'2026-02-30'})).status,400);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM audit_log')).rows[0].n,auditBefore);
});
test('producer project creation persists the project, assigns its creator and writes audit',async()=>{
  const created=await request('/api/producer/projects','POST',{
    name:'Новый тестовый проект',description:'Создан из продюсерской',status:'подготовка',color:'#4b8f82',
  },3);
  assert.equal(created.status,201);assert.ok(created.body.id);assert.equal(created.body.name,'Новый тестовый проект');
  const stored=(await pool.query('SELECT name,abbr,description,status,color FROM projects WHERE id=$1',[created.body.id])).rows[0];
  assert.deepEqual(stored,{name:'Новый тестовый проект',abbr:'НТ',description:'Создан из продюсерской',status:'подготовка',color:'#4b8f82'});
  const manager=(await pool.query('SELECT user_uid,user_name FROM project_managers WHERE project_id=$1',[created.body.id])).rows[0];
  assert.deepEqual(manager,{user_uid:'user3',user_name:'Пользователь 3'});
  assert.equal((await request('/api/producer/projects/'+created.body.id,'GET',undefined,3)).status,200);
  const audit=(await pool.query("SELECT action,entity,project_id,user_id,user_name FROM audit_log WHERE entity='project' AND entity_id=$1",[created.body.id])).rows[0];
  assert.deepEqual(audit,{action:'create',entity:'project',project_id:created.body.id,user_id:3,user_name:'Пользователь 3'});
  const before=(await pool.query('SELECT count(*)::int AS n FROM projects')).rows[0].n;
  assert.equal((await request('/api/producer/projects','POST',{name:'',status:'подготовка',color:'#4b8f82'},3)).status,400);
  assert.equal((await pool.query('SELECT count(*)::int AS n FROM projects')).rows[0].n,before);
});
test('D2 approvals use decision rights, drive warnings and retain an audited decision trail',async()=>{
  await fixture();
  await request('/api/data/person','POST',{id:'producer-a',name:'Продюсер А',login:'user1'});
  await pool.query('TRUNCATE audit_log RESTART IDENTITY');
  const blockId=(await request('/api/producer/projects/p/blocks','POST',{
    name:'Сдача проекта',ownerPersonId:'producer-a',deadline:'2000-01-02',status:'active',
  })).body.id;
  const taskId=(await request('/api/producer/blocks/'+blockId+'/tasks','POST',{
    title:'Подготовить мастер',assigneePersonId:'producer-a',deadline:'2000-01-01',
  })).body.id;
  const approval=(await request('/api/producer/blocks/'+blockId+'/approvals','POST',{
    title:'Утвердить мастер',taskId,required:true,dueDate:'2000-01-02',
  },3));
  assert.equal(approval.status,200);assert.ok(approval.body.id);

  let loaded=await request('/api/producer/blocks/'+blockId,'GET',undefined,3);
  assert.equal(loaded.status,200);assert.equal(loaded.body.permissions.canDecideApprovals,false);
  assert.equal(loaded.body.approvals[0].status,'pending');assert.equal(loaded.body.approvals[0].requestedByName,'Пользователь 3');
  assert.ok(loaded.body.warnings.some(item=>item.type==='task_overdue'));
  assert.ok(loaded.body.warnings.some(item=>item.type==='block_overdue'));
  assert.ok(loaded.body.warnings.some(item=>item.type==='approval_overdue'));
  assert.equal((await request('/api/producer/approvals/'+approval.body.id+'/decision','PATCH',{decision:'approved',comment:'Готово'},3)).status,403);

  assert.equal((await request('/api/producer/approvals/'+approval.body.id+'/decision','PATCH',{decision:'approved',comment:'Принято руководителем'},2)).status,200);
  loaded=await request('/api/producer/blocks/'+blockId);
  assert.equal(loaded.body.permissions.canDecideApprovals,true);
  assert.equal(loaded.body.approvals[0].decision,'approved');assert.equal(loaded.body.approvals[0].decidedByName,'Пользователь 2');
  assert.equal(loaded.body.approvals[0].decisionComment,'Принято руководителем');
  assert.equal(loaded.body.warnings.some(item=>item.type.startsWith('approval_')),false);

  assert.equal((await request('/api/producer/approvals/'+approval.body.id+'/decision','PATCH',{decision:null,comment:''},1)).status,200);
  assert.equal((await request('/api/producer/approvals/'+approval.body.id+'/decision','PATCH',{decision:'rejected',comment:'Нужны правки'},1)).status,200);
  loaded=await request('/api/producer/blocks/'+blockId);
  assert.ok(loaded.body.warnings.some(item=>item.type==='approval_rejected'));
  const projectMap=(await request('/api/producer/projects/p')).body;
  assert.equal(projectMap.blocks.find(item=>item.id===blockId).warningCount,loaded.body.warnings.length);
  const dashboard=(await request('/api/producer/dashboard')).body;
  assert.equal(dashboard.projects.find(item=>item.id==='p').warningCount,loaded.body.warnings.length);
  assert.deepEqual(dashboard.projects.find(item=>item.id==='p').team,[{id:'producer-a',name:'Продюсер А'}]);
  assert.ok(dashboard.attention.some(item=>item.kind==='task'&&item.reason==='Задача просрочена'));
  assert.ok(dashboard.attention.some(item=>item.kind==='block'&&item.reason==='Просрочен срок блока'));
  assert.ok(dashboard.attention.some(item=>item.kind==='approval'&&item.reason==='Согласование отклонено'));
  const actions=(await pool.query("SELECT action,user_name FROM audit_log WHERE entity='productionApproval' ORDER BY id")).rows;
  assert.deepEqual(actions.map(item=>item.action),['create','approve','restore','reject']);
  assert.deepEqual(actions.map(item=>item.user_name),['Пользователь 3','Пользователь 2','Пользователь 1','Пользователь 1']);

  const otherBlock=(await request('/api/producer/projects/other/blocks','POST',{name:'Чужой блок',ownerPersonId:'producer-a'})).body.id;
  const otherTask=(await request('/api/producer/blocks/'+otherBlock+'/tasks','POST',{title:'Чужая задача',assigneePersonId:'producer-a'})).body.id;
  const before=(await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE entity='productionApproval'")).rows[0].n;
  assert.equal((await request('/api/producer/blocks/'+blockId+'/approvals','POST',{title:'Ошибка',taskId:otherTask,required:true})).status,400);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE entity='productionApproval'")).rows[0].n,before);
});

test('D2.6 team profiles expose concrete work, persist self-authored highlights and calculate project forecasts',async()=>{
  await fixture();
  await request('/api/data/person','POST',{id:'producer-a',name:'Продюсер А',login:'user1',roles:['продюсер']});
  await request('/api/data/person','POST',{id:'producer-manager',name:'Пользователь 3',login:'user3',roles:['продюсер']});
  const blockId=(await request('/api/producer/projects/p/blocks','POST',{
    name:'Производство',ownerPersonId:'producer-a',startDate:'2026-10-01',deadline:'2026-10-30',status:'active',
  })).body.id;
  await request('/api/producer/blocks/'+blockId+'/tasks','POST',{
    title:'Подготовить съёмочный план',assigneePersonId:'producer-a',deadline:'2026-10-20',
  });
  await request('/api/producer/blocks/'+blockId+'/tasks','POST',{
    title:'Утвердить смету',assigneePersonId:'producer-manager',deadline:'2026-10-22',
  });
  await request('/api/data/task','POST',{id:7001,project:'p',seriesId:'s',series:'С01',status:'монтаж',day:'20.10.2026',from:10,to:18,person:'Продюсер А',note:'Сборка выпуска'});

  const team=await request('/api/producer/team');
  assert.equal(team.status,200);
  const producer=team.body.people.find(item=>item.id==='producer-a');
  assert.equal(producer.openTasks,1);assert.equal(producer.ownedBlocks,1);
  assert.ok(producer.currentItems.some(item=>item.title==='Подготовить съёмочный план'));
  assert.ok(producer.currentItems.some(item=>item.kind==='shift'&&item.title==='монтаж'));
  assert.match(team.body.methodNote,/Индекс загрузки/);

  const saved=await request('/api/producer/people/producer-manager/profile','PATCH',{
    headline:'Продюсер документальных проектов',achievements:[{id:'first_film',icon:'★',title:'Первый фильм',description:'Сдал в срок'}],
  },3);
  assert.equal(saved.status,200);
  assert.equal((await request('/api/producer/people/producer-a/profile','PATCH',{headline:'Чужая карточка',achievements:[]},3)).status,403);
  const profile=await request('/api/producer/people/producer-manager','GET',undefined,3);
  assert.equal(profile.status,200);assert.equal(profile.body.headline,'Продюсер документальных проектов');
  assert.equal(profile.body.achievements[0].title,'Первый фильм');assert.equal(profile.body.canEditProfile,true);
  assert.ok((await pool.query("SELECT id FROM audit_log WHERE entity='person' AND entity_id='producer-manager' AND action='update'")).rows.length===1);

  const analytics=await request('/api/producer/analytics');
  assert.equal(analytics.status,200);
  const projectAnalytics=analytics.body.projects.find(item=>item.id==='p');
  assert.equal(projectAnalytics.totalTasks,2);assert.equal(projectAnalytics.completedTasks,0);
  assert.equal(projectAnalytics.forecastSource,'plan');assert.ok(projectAnalytics.forecastTotalDays>0);
  assert.match(analytics.body.methodNote,/Прогноз/);
});
test('individual project/series/task writes commit and are visible to a subsequent load',async()=>{
  assert.equal((await request('/api/data/project','POST',project())).status,200);
  assert.equal((await request('/api/data/series','POST',series())).status,200);
  assert.equal((await request('/api/data/task','POST',{...task(),seriesId:'s'})).status,200);
  const loaded=(await request('/api/data')).body;
  assert.equal(loaded.projects.length,1);assert.equal(loaded.series[0].airDay,0);assert.equal(loaded.tasks[0].from,10.5);
  assert.equal(typeof loaded.tasks[0].id,'number');assert.equal(broadcasts.length,3);
});
test('transaction response is held until commit; failed commit never acknowledges success',async()=>{
  const events=[];
  const res={statusCode:200,json(body){events.push(body.ok?'response':'error');return this;}};
  await withTransaction({connect:async()=>({query:async sql=>events.push(sql),release:()=>events.push('release')})},async(req,res)=>{req._afterCommit.push(()=>events.push('broadcast'));res.json({ok:true});})({},res);
  assert.deepEqual(events,['BEGIN','COMMIT','broadcast','response','release']);
  let error;
  await withTransaction({connect:async()=>({query:async sql=>{if(sql==='COMMIT')throw new Error('disk');},release(){}})},async(req,res)=>res.json({ok:true}))({},res,e=>error=e);
  assert.equal(error.message,'disk');assert.equal(events.filter(x=>x==='response').length,1);
});
test('500 responses roll back already executed writes',async()=>{
  const app=express();app.get('/rollback',withTransaction(pool,async(req,res)=>{await req._tx.query("INSERT INTO projects(id,name) VALUES('rollback','temporary')");res.status(500).json({error:'fail'});}));
  const local=await new Promise(r=>{const s=app.listen(0,'127.0.0.1',()=>r(s));});
  try{assert.equal((await fetch('http://127.0.0.1:'+local.address().port+'/rollback')).status,500);assert.equal((await pool.query("SELECT id FROM projects WHERE id='rollback'")).rows.length,0);}finally{await new Promise(r=>local.close(r));}
});
test('bulk failure rolls back the whole save and returns an error',async()=>{
  const result=await request('/api/data','PUT',{projects:[project()],series:[series('bad','missing')]});
  assert.equal(result.status,400);assert.equal((await pool.query('SELECT id FROM projects')).rows.length,0);assert.equal(broadcasts.length,0);
});

test('bulk saves produce confirmed entity events in the same transaction; rejected saves produce none',async()=>{
  assert.equal((await request('/api/data','PUT',{projects:[project()]})).status,200);
  const entry=(await pool.query("SELECT user_id,action,project_id,details,changes FROM audit_log WHERE entity='project'")).rows;
  assert.equal(entry.length,1);assert.equal(entry[0].user_id,1);assert.equal(entry[0].action,'create');
  assert.equal(entry[0].project_id,'p');assert.equal(entry[0].details.bulk,true);assert.ok(entry[0].changes.length>0);
  assert.equal((await request('/api/data','PUT',{series:[series('bad','missing')]})).status,400);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM audit_log")).rows[0].n,1);
});
test('shift creation, assignment, reschedule and deletion retain actor and old/new values',async()=>{
  await fixture();
  await pool.query('TRUNCATE audit_log RESTART IDENTITY');
  const now=Date.now()+10000;
  assert.equal((await request('/api/data/task','POST',{...task(2),person:'Анна',_updatedAt:now})).status,200);
  assert.equal((await request('/api/data/task','POST',{...task(2),person:'Мария',_updatedAt:now+1000},1,{'x-change-reason':'staff-change'})).status,200);
  assert.equal((await request('/api/data/task','POST',{...task(2),person:'Мария',day:'12.10.2026',_updatedAt:now+2000})).status,200);
  assert.equal((await request('/api/data/task','POST',{...task(2),person:'Мария',day:'12.10.2026',cancelled:true,_updatedAt:now+3000})).status,200);
  assert.equal((await request('/api/data/task','POST',{...task(2),person:'Мария',day:'12.10.2026',cancelled:false,_updatedAt:now+4000})).status,200);
  assert.equal((await request('/api/data/task/2','DELETE')).status,200);
  const rows=(await pool.query("SELECT user_id,user_name,action,project_id,changes,reason,source FROM audit_log WHERE entity='task' ORDER BY id")).rows;
  assert.deepEqual(rows.map(row=>row.action),['create','assign','reschedule','cancel','restore','delete']);
  assert.equal(rows[1].user_id,1);assert.equal(rows[1].user_name,'Пользователь 1');assert.equal(rows[1].source,'user');
  assert.equal(rows[1].reason,'staff-change');
  const assignment=rows[1].changes.find(change=>change.field==='person');
  assert.equal(assignment.before,'Анна');assert.equal(assignment.after,'Мария');assert.equal(rows[1].project_id,'p');
});
test('mass saves create grouped events only for rows that actually changed',async()=>{
  await fixture();await pool.query('TRUNCATE audit_log RESTART IDENTITY');
  const snapshot=(await request('/api/data')).body;
  snapshot.projects.find(item=>item.id==='p').description='Новое описание';
  snapshot.tasks[0]={...snapshot.tasks[0],day:'13.10.2026',_updatedAt:Date.now()+10000};
  snapshot.stages=[{id:'review',label:'Отсмотр',order:1}];
  assert.equal((await request('/api/data','PUT',snapshot)).status,200);
  const rows=(await pool.query('SELECT entity,action,request_id,details FROM audit_log ORDER BY id')).rows;
  assert.deepEqual(rows.map(row=>row.entity).sort(),['project','settings','stage','task']);
  assert.equal(new Set(rows.map(row=>row.request_id)).size,1);
  assert.ok(rows.every(row=>row.details.bulk===true));
});
test('audit failure rolls the business change back instead of acknowledging success',async()=>{
  const failingPool={
    connect:async()=>{
      const client=await pool.connect();
      return {query:(sql,params)=>/^\s*INSERT INTO audit_log/i.test(sql)?Promise.reject(new Error('audit unavailable')):client.query(sql,params),release:()=>client.release()};
    }
  };
  const isolated=express();isolated.use(express.json());isolated.use((req,res,next)=>{req.session={userId:1,displayName:'Пользователь 1'};next();});
  isolated.post('/write',withTransaction(failingPool,async(req,res)=>{
    await auditMutation(req,['project'],()=>req._tx.query("INSERT INTO projects(id,name) VALUES('atomic-audit','Временный')"));
    res.json({ok:true});
  }));
  isolated.use((error,req,res,next)=>res.status(500).json({error:error.message}));
  const listener=await new Promise(resolve=>{const item=isolated.listen(0,'127.0.0.1',()=>resolve(item));});
  try{
    assert.equal((await fetch('http://127.0.0.1:'+listener.address().port+'/write',{method:'POST'})).status,500);
    assert.equal((await pool.query("SELECT count(*)::int AS n FROM projects WHERE id='atomic-audit'")).rows[0].n,0);
    assert.equal((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE entity_id='atomic-audit'")).rows[0].n,0);
  }finally{await new Promise(resolve=>listener.close(resolve));}
});
test('history API filters and paginates while enforcing view permissions',async()=>{
  await fixture();
  for(let id=10;id<22;id++)await request('/api/data/task','POST',{...task(id),_updatedAt:Date.now()+id});
  await request('/api/data/task','POST',{...task(),note:'закрытая заметка',_updatedAt:Date.now()+10000});
  const restricted=(await pool.query("SELECT event_id FROM audit_log WHERE visibility='restricted' ORDER BY id DESC LIMIT 1")).rows[0];
  const filtered=await request('/api/audit/events?projectId=p&action=create&pageSize=10');
  assert.equal(filtered.status,200);assert.ok(filtered.body.total>=10);assert.equal(filtered.body.events.length,10);
  assert.ok(filtered.body.events.every(event=>event.projectId==='p'&&event.action==='create'));
  assert.equal((await request('/api/audit/events','GET',undefined,4)).status,403);
  assert.equal((await request('/api/audit/events','GET',undefined,5)).status,403);
  const manager=await request('/api/audit/events','GET',undefined,3);
  assert.equal(manager.status,200);assert.ok(manager.body.events.length>0);assert.ok(manager.body.events.every(event=>event.projectId==='p'));
  assert.equal(manager.body.events.some(event=>event.id===restricted.event_id),false);
  assert.equal((await request('/api/audit/events','GET')).body.events.some(event=>event.id===restricted.event_id),true);
  assert.equal((await fetch(base+'/api/audit/events/'+restricted.event_id,{method:'DELETE',headers:{'x-test-user':'1'}})).status,404);
});
test('templates, account history and no-impact stage flags survive reload',async()=>{
  const result=await request('/api/data','PUT',{projects:[project()],templates:[{id:'template',name:'Шаблон'}],changelog:[{ts:1,text:'Создан проект'}],stages:[{id:'stage',label:'Отсмотр',order:1,noImpact:true}],people:[{id:'person',name:'Тест',allowParallel:true}]});
  assert.equal(result.status,200);
  const loaded=(await request('/api/data')).body;
  assert.equal(loaded.templates[0].name,'Шаблон');assert.equal(loaded.changelog[0].text,'Создан проект');assert.equal(loaded.stages[0].noImpact,true);assert.equal(loaded.people[0].allowParallel,true);
  assert.equal((await request('/api/data','GET',undefined,2)).body.changelog.length,0);
});
test('cancelled flags, soft deletes and directory removals survive reload',async()=>{
  await fixture();let result=await request('/api/data','PUT',{tasks:[{...task(),cancelled:true}],roles:[{id:'r',label:'Роль'}]});assert.equal(result.status,200);
  assert.equal((await request('/api/data')).body.tasks[0].cancelled,true);
  result=await request('/api/data','PUT',{tasks:[{...task(),deleted:true,_updatedAt:Date.now()+10}],roles:[]});assert.equal(result.status,200);
  assert.equal((await request('/api/data')).body.tasks.length,0);assert.equal((await request('/api/data')).body.roles.length,0);
});
test('renaming an employee also updates assigned tasks and absences',async()=>{
  await fixture();await request('/api/data/person','POST',{id:'person',name:'Тест'});
  await request('/api/data','PUT',{personAbsences:[{id:'a',personId:'person',personName:'Тест',startDay:'12.10.2026',endDay:'13.10.2026'}]});
  assert.equal((await request('/api/data/person','POST',{id:'person',name:'Новое имя'})).status,200);
  const loaded=(await request('/api/data')).body;assert.equal(loaded.tasks[0].person,'Новое имя');assert.equal(loaded.personAbsences[0].personName,'Новое имя');
});
test('deleting a series also removes its tasks from active views',async()=>{
  await fixture();await request('/api/data/task','POST',{...task(),seriesId:'s',_updatedAt:Date.now()+10});
  assert.equal((await request('/api/data/series/s','DELETE')).status,200);assert.equal((await request('/api/data')).body.tasks.length,0);
});
for(const user of [0,5,6,7,8])test('write access denied for user '+user,async()=>{
  const result=await request('/api/data/project','POST',project(),user);assert.ok([401,403].includes(result.status));
});
test('database role overrides stale session role immediately',async()=>{
  await pool.query("UPDATE users SET role='viewer' WHERE id=1");assert.equal((await request('/api/data/project','POST',project())).status,403);
});
test('manager can edit owned projects but cannot assign self to another project',async()=>{
  await fixture();assert.equal((await request('/api/data/task','POST',task(2),3)).status,200);
  assert.equal((await request('/api/data/task','POST',task(3,'other'),3)).status,403);
  assert.equal((await request('/api/data/project','POST',{...project('other'),managers:[{uid:'user3'}]},3)).status,403);
});
for(const user of [3,4])test('bulk project, series and task protection for user '+user,async()=>{
  await fixture();await request('/api/data/series','POST',series('hidden','other'));await request('/api/data/task','POST',task(9,'other'));
  const result=await request('/api/data','PUT',{projects:[{...project('other'),name:'HACK'}],series:[{...series('hidden','p'),name:'HACK'}],tasks:[{...task(9,'p'),note:'HACK'}]},user);
  assert.equal(result.status,200);assert.equal((await pool.query("SELECT name FROM projects WHERE id='other'")).rows[0].name,'Проект other');
  assert.equal((await pool.query("SELECT project_id FROM series WHERE id='hidden'")).rows[0].project_id,'other');
  assert.equal((await pool.query('SELECT project_id FROM tasks WHERE id=9')).rows[0].project_id,'other');
});
test('editor cannot move a hidden task or series into an editable project',async()=>{
  await fixture();await request('/api/data/task','POST',task(9,'other'));await request('/api/data/series','POST',series('hidden','other'));
  assert.equal((await request('/api/data/task','POST',task(9),4)).status,403);
  assert.equal((await request('/api/data/series','POST',series('hidden'),4)).status,403);
});
test('bulk saves cannot change global directories without admin or lead',async()=>{
  await fixture();await request('/api/data/person','POST',{id:'person',name:'Тест'});
  await request('/api/data','PUT',{roles:[{id:'r',label:'Оригинал'}]});
  assert.equal((await request('/api/data','PUT',{people:[{id:'person',name:'HACK'}],roles:[{id:'r',label:'HACK'}]},3)).status,200);
  assert.equal((await pool.query("SELECT name FROM people WHERE id='person'")).rows[0].name,'Тест');assert.equal((await pool.query("SELECT label FROM roles WHERE id='r'")).rows[0].label,'Оригинал');
  assert.equal((await request('/api/data/role','POST',{id:'r',label:'HACK'},4)).status,403);
});
test('empty identity values never match unrelated staff with empty email',async()=>{
  await fixture();await request('/api/data/person','POST',{id:'unrelated',name:'Чужой',email:'',login:''});
  await pool.query("INSERT INTO project_managers(project_id,user_uid,user_name) VALUES('other','unrelated','Чужой')");
  assert.equal(await createRBAC(pool).checkProjectAccess(3,'manager','other',true),false);
});
test('project access assignments are atomic',async()=>{
  await fixture();await assert.rejects(createUsers(pool).setProjects(4,[{project_id:'other'},{project_id:'other'}],1));
  assert.deepEqual((await pool.query('SELECT project_id FROM user_projects WHERE user_id=4')).rows.map(r=>r.project_id),['p']);
});
test('older task snapshots cannot overwrite newer edits',async()=>{
  await fixture();await request('/api/data/task','POST',{...task(),note:'new',_updatedAt:Date.now()+100});
  await request('/api/data/task','POST',{...task(),note:'old',_updatedAt:1});
  assert.equal((await request('/api/data')).body.tasks[0].note,'new');
});
for(const invalid of [
  {...task(),day:'31.02.2026'},{...task(),from:18,to:10},{...task(),to:25},{...task(),id:'sql injection'},
])test('invalid task rejected: '+JSON.stringify(invalid),async()=>assert.equal((await request('/api/data/task','POST',invalid)).status,400));
test('bulk payload is validated before writing any row',async()=>{
  assert.equal((await request('/api/data','PUT',{projects:[project()],tasks:[{...task(),day:'31.02.2026'}]})).status,400);
  assert.equal((await pool.query('SELECT id FROM projects')).rows.length,0);
});
test('birthday and absence range validation',async()=>{
  assert.equal((await request('/api/data/person','POST',{id:'person',name:'Тест',birthday:'31.02'})).status,400);
  assert.equal((await request('/api/data','PUT',{personAbsences:[{id:'a',startDay:'13.10.2026',endDay:'12.10.2026'}]})).status,400);
  assert.ok(validDay('29.02.2024'));assert.ok(!validDay('29.02.2025'));assert.ok(validBirthday('29.02'));
});
test('task series must belong to the selected project',async()=>{
  await fixture();assert.equal((await request('/api/data/task','POST',{...task(4,'other'),seriesId:'s'})).status,400);
});
test('LDAP group comparison is case insensitive and disabled bit is recognised',()=>{
  const ldap=createLDAP(pool,{});assert.equal(ldap.initialRoleFromGroups(['TRACKER_ADMIN']),'admin');assert.equal(ldap.isUserEnabled('514'),false);assert.equal(ldap.isUserEnabled('512'),true);
});
test('login accepts a canonical directory account and returns a fresh CSRF token',async()=>{
  const result=await request('/api/auth/login','POST',{login:'user1@example.local',password:'test'});
  assert.equal(result.status,200);assert.equal(result.body.user.sam_name,'user1');assert.ok(result.body.csrfToken.length>=32);
});
test('outdated browser snapshot is rejected rather than overwriting newer data',async()=>{
  await fixture();const old=(await request('/api/data')).body;
  const newer=structuredClone(old);newer.projects[0].description='новая правка';
  assert.equal((await request('/api/data','PUT',newer)).status,200);
  old.projects[0].description='устаревшая правка';
  assert.equal((await request('/api/data','PUT',old)).status,409);
  assert.equal((await request('/api/data')).body.projects[0].description,'новая правка');
});
test('deletion can be undone by a current snapshot without reviving stale snapshots',async()=>{
  await fixture();const before=(await request('/api/data')).body;
  const removed=structuredClone(before);removed.projects=removed.projects.map(p=>p.id==='p'?{...p,deleted:true}:p);
  assert.equal((await request('/api/data','PUT',removed)).status,200);
  assert.equal((await request('/api/data','PUT',before)).status,409);
  const latest=(await request('/api/data')).body;
  const undo={...before,_revision:latest._revision,tasks:before.tasks.map(t=>({...t,_updatedAt:Date.now()+1000}))};
  assert.equal((await request('/api/data','PUT',undo)).status,200);
  const restored=(await request('/api/data')).body;
  assert.ok(restored.projects.some(p=>p.id==='p'));assert.ok(restored.series.some(s=>s.id==='s'));assert.equal(restored.tasks.length,1);
});
test('bulk task cannot point to a series in another project',async()=>{
  await fixture();assert.equal((await request('/api/data','PUT',{tasks:[{...task(7,'other'),seriesId:'s'}]})).status,400);
  assert.equal((await pool.query('SELECT id FROM tasks WHERE id=7')).rows.length,0);
});
test('private task notes are hidden from viewers and editors and survive their edits',async()=>{
  await fixture();await request('/api/data/task','POST',{...task(),note:'private',_updatedAt:Date.now()+10});
  for(const user of [4,5])assert.equal((await request('/api/data','GET',undefined,user)).body.tasks[0].note,'');
  await request('/api/data/task','POST',{...task(),note:'overwrite',_updatedAt:Date.now()+20},4);
  assert.equal((await request('/api/data')).body.tasks[0].note,'private');
  await request('/api/data','PUT',{tasks:[{...task(),note:'overwrite',_updatedAt:Date.now()+30}]},4);
  assert.equal((await request('/api/data')).body.tasks[0].note,'private');
});

test('project credentials are absent for every application role and survive safe saves',async()=>{
  await fixture();
  const markers={login:'credential-login-marker',password:'credential-password-marker',token:'credential-token-marker',reason:'reason-secret-marker'};
  const stored={
    info:{type:'Документальный'},
    accesses:[{label:'Монтажная станция',login:markers.login,password:markers.password}],
    integration:{label:'Служебная интеграция',token:markers.token},
    links:[{label:'Материалы',url:'https://example.test/materials'}],
  };
  await pool.query('UPDATE projects SET dossier=$2::jsonb WHERE id=$1',['p',JSON.stringify(stored)]);

  for(const user of [1,2,3,4,5]){
    const loaded=(await request('/api/data','GET',undefined,user)).body;
    const json=JSON.stringify(loaded);
    for(const marker of Object.values(markers))assert.equal(json.includes(marker),false);
    const visible=loaded.projects.find(item=>item.id==='p');
    assert.equal(visible.dossier.info.type,'Документальный');
    assert.deepEqual(visible.dossier.accesses,[{label:'Монтажная станция',credentialsStored:true}]);
    assert.equal(visible.dossier.integration.token,undefined);
  }

  const snapshot=(await request('/api/data')).body;
  snapshot.projects.find(item=>item.id==='p').description='Безопасная правка';
  assert.equal((await request('/api/data','PUT',snapshot)).status,200);
  const direct=(await request('/api/data')).body.projects.find(item=>item.id==='p');
  direct.name='Обновлённый проект';
  assert.equal((await request('/api/data/project','POST',direct,1,{'x-change-reason':'token='+markers.reason})).status,200);

  const raw=(await pool.query('SELECT dossier FROM projects WHERE id=$1',['p'])).rows[0].dossier;
  assert.equal(raw.accesses[0].login,markers.login);
  assert.equal(raw.accesses[0].password,markers.password);
  assert.equal(raw.integration.token,markers.token);
  const audit=JSON.stringify((await pool.query('SELECT * FROM audit_log')).rows);
  for(const marker of Object.values(markers))assert.equal(audit.includes(marker),false);
});

test('shared project endpoints reject new credential values without changing stored data',async()=>{
  await fixture();
  const marker='rejected-credential-marker';
  const before=JSON.stringify((await pool.query('SELECT dossier FROM projects WHERE id=$1',['p'])).rows[0].dossier);
  assert.equal((await request('/api/data/project','POST',{...project('p'),dossier:{accesses:[{label:'Новый доступ',password:marker}]}})).status,400);
  assert.equal(JSON.stringify((await pool.query('SELECT dossier FROM projects WHERE id=$1',['p'])).rows[0].dossier),before);
  assert.equal((await request('/api/data','PUT',{projects:[{...project('blocked'),dossier:{integration:{token:marker}}}]})).status,400);
  assert.equal((await pool.query('SELECT id FROM projects WHERE id=$1',['blocked'])).rows.length,0);
});

test('duplicate IDs and unsafe numeric task IDs are rejected without changing the revision',async()=>{
  await fixture();const before=(await request('/api/data')).body;
  const bad={...before,tasks:[before.tasks[0],{...before.tasks[0],id:String(before.tasks[0].id)}]};
  assert.equal((await request('/api/data','PUT',bad)).status,400);
  assert.equal((await request('/api/data/task','POST',{...task(),id:'9007199254740992'})).status,400);
  const after=(await request('/api/data')).body;
  assert.equal(after._revision,before._revision);assert.equal(after.tasks.length,before.tasks.length);
});

test('creation undo explicitly deletes created tasks, series, people and absences in SQL',async()=>{
  await fixture();const now=Date.now()+1000;
  await request('/api/data','PUT',{series:[series('added')],tasks:[{...task(12),seriesId:'added',_updatedAt:now}],people:[{id:'added',name:'New'}],personAbsences:[{id:'added',personId:'added',startDay:'11.10.2026',endDay:'12.10.2026',_updatedAt:now}]});
  const saved=(await request('/api/data')).body;
  const undo={...saved,tasks:saved.tasks.map(t=>t.id===12?{...t,deleted:true,_updatedAt:now+100}:t),
    series:saved.series.map(s=>s.id==='added'?{...s,deleted:true}:s),people:saved.people.map(p=>({...p,deleted:true})),
    personAbsences:saved.personAbsences.map(a=>({...a,deleted:true,_updatedAt:now+100}))};
  assert.equal((await request('/api/data','PUT',undo)).status,200);
  const loaded=(await request('/api/data')).body;
  assert.deepEqual(loaded.tasks.map(t=>t.id),[1]);assert.equal(loaded.series.length,1);assert.equal(loaded.people.length,0);assert.equal(loaded.personAbsences.length,0);
});
