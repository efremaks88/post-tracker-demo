const {test,before,after,beforeEach} = require('node:test');
const assert = require('node:assert/strict');
const {PGlite} = require('@electric-sql/pglite');
const express = require('express');
const {runMigrations} = require('../lib/migrate');
const {withTransaction} = require('../lib/db');
const createRBAC = require('../lib/rbac');
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
async function request(url,method='GET',body,user=1){
  if(url==='/api/data'&&['POST','PUT'].includes(method)&&body&&!Object.hasOwn(body,'_revision')) {
    const current=await request('/api/data','GET',undefined,user);
    body={...body,_revision:current.body._revision};
  }
  const response=await fetch(base+url,{method,headers:{'Content-Type':'application/json','x-test-user':String(user)},body:body===undefined?undefined:JSON.stringify(body)});
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
test('all SQL migrations apply twice without losing data',async()=>{
  const first=(await pool.query('SELECT count(*)::int AS n FROM _migrations')).rows[0].n;
  assert.equal(first,12);await runMigrations(pool);assert.equal((await pool.query('SELECT count(*)::int AS n FROM _migrations')).rows[0].n,first);
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

test('bulk saves produce an audit entry in the same transaction; rejected saves produce none',async()=>{
  assert.equal((await request('/api/data','PUT',{projects:[project()]})).status,200);
  const entry=(await pool.query("SELECT user_id,details FROM audit_log WHERE entity='bulk'")).rows;
  assert.equal(entry.length,1);assert.equal(entry[0].user_id,1);assert.equal(entry[0].details.counts.projects,1);
  assert.equal((await request('/api/data','PUT',{series:[series('bad','missing')]})).status,400);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE entity='bulk'")).rows[0].n,1);
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
