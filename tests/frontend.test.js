const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {readFrontendSource}=require('../scripts/frontend-source');

const source=readFrontendSource(path.join(__dirname,'..'));
const names=[...source.matchAll(/^function (\w+)/gm)].map(m=>m[1]);
const context={React,ReactDOM:{createRoot:()=>({render:()=>{}}),createPortal:x=>x},
  console,document:{getElementById:()=>null,body:{},documentElement:{clientWidth:1280}},
  window:{innerWidth:1280,innerHeight:900,location:{hash:'',pathname:'/',search:''},__TRACKER_RUNTIME__:{mode:'local-demo',label:'DEV · v0.2.3'}},
  location:{hash:'',pathname:'/',search:''},history:{},sessionStorage:{getItem:()=>null,setItem(){}},setTimeout,clearTimeout};
vm.createContext(context);
vm.runInContext(babel.transformSync(source,{presets:['@babel/preset-react'],filename:'index.jsx'}).code+
  '\nglobalThis.api={'+names.join(',')+',cloudLoad,cloudSave,DEFAULT_STAGES,DEFAULT_STAGE_GROUPS,StagesCtx,HolidaysCtx,DEMO_ROLES};',context);
const api=context.api;
const data=api.makeDemoData();
data.achievements=[];data.personAbsences=[];data.templates=[];data.changelog=[];
data.stages=api.DEFAULT_STAGES;data.stageGroups=api.DEFAULT_STAGE_GROUPS;
data.projects.forEach(p=>{p.managers=[];p.dossier=p.dossier||{};});
data.series.forEach(s=>{s.customMilestones=[];s.manualStatus='';s.stageRanges={};s.transitVariants=['','',''];s.assets=[];s.checklists=[];});

test('invalid calendar dates do not silently roll into the following month',()=>{
  for(const value of ['31.02.2026','29.02.2025','00.01.2026','01.13.2026','bad',null,42])assert.equal(api.parseDate(value),null,String(value));
  assert.equal(api.formatDate(api.parseDate('29.02.2024')),'29.02.2024');
});
test('Sunday broadcast dates remain Sundays',()=>{
  const dates=api.generateSeriesAirDates({airMode:'weekly',airDay:0,editStart:'05.10.2026',otkDate:'20.10.2026'});
  assert.deepEqual(Array.from(dates),['11.10.2026','18.10.2026']);
});
test('half-hour shifts, midnight and working-day boundaries',()=>{
  assert.equal(api.fmtHour(0),'0:00');assert.equal(api.fmtHour(10.5),'10:30');
  assert.equal(api.fmtDur(10.5,14),'3ч 30мин');
  assert.equal(api.addWorkdays('09.10.2026',1,['12.10.2026']),'13.10.2026');
});
test('birthday leap days and December to January transition',()=>{
  assert.equal(api.normalizeBirthday('31.02'),null);
  assert.equal(api.normalizeBirthday('29.02'),'29.02');
  assert.equal(api.formatDate(api.birthdayNextDate('01.01',api.parseDate('31.12.2026'))),'01.01.2027');
});
const today=api.formatDate(new Date());
const task={id:1,person:'Тест',project:'p',status:'монтаж',day:today,from:10,to:18};
const person={id:'p1',name:'Тест',active:true,roles:['монтаж']};
test('overlap is found; adjacent shifts are allowed',()=>{
  const conflicts=api.getConflicts([task,{...task,id:2,from:17,to:20}],[person],api.DEFAULT_STAGES,[]);
  assert.equal(conflicts.details.filter(x=>x.type==='overlap').length,1);
  assert.equal(api.getConflicts([task,{...task,id:2,from:18,to:20}],[person],api.DEFAULT_STAGES,[]).details.length,0);
});
test('parallel shifts and no-impact stages suppress time conflicts',()=>{
  assert.equal(api.getConflicts([task,{...task,id:2}],[{...person,allowParallel:true}],api.DEFAULT_STAGES,[]).details.length,0);
  assert.equal(api.getConflicts([task,{...task,id:2}],[person],[{id:'монтаж',noImpact:true}],[]).details.length,0);
});
test('deleted and cancelled tasks never create conflicts',()=>{
  assert.equal(api.getConflicts([task,{...task,id:2,cancelled:true},{...task,id:3,deleted:true}],[person],api.DEFAULT_STAGES,[]).details.length,0);
});
test('executor is required only for stages which require one',()=>{
  for(const status of ['съемки','промо','титры'])assert.equal(api.getConflicts([{...task,person:'',status}],[],api.DEFAULT_STAGES,[]).details.filter(x=>x.type==='unfilled').length,0);
  assert.equal(api.getConflicts([{...task,person:''}],[],api.DEFAULT_STAGES,[]).details.filter(x=>x.type==='unfilled').length,1);
});
test('absence matches by ID or by name; other people are unaffected',()=>{
  const absence={id:'a',personId:'p1',personName:'Тест',type:'vacation',startDay:today,endDay:today};
  assert.equal(api.getConflicts([task],[person],api.DEFAULT_STAGES,[],[absence]).details.filter(x=>x.type==='absence').length,1);
  assert.equal(api.absencePersonMatches(absence,{id:'p2',name:'Другой'}),false);
});
test('missing optional arrays do not break loading and employee filtering',()=>{
  const empty=api.normalizeLoadedData({});assert.ok(Array.isArray(empty.tasks));assert.ok(Array.isArray(empty.people));
  assert.equal(api.filterPeopleByStatus([{id:'x',active:true}], 'монтаж',api.DEFAULT_STAGES).length,0);
  assert.notEqual(api.accountBackupKey({sam_name:'one'}),api.accountBackupKey({sam_name:'two'}));
});
test('client state, save payload and JSON export omit project credentials',async()=>{
  const markers={login:'client-login-marker',password:'client-password-marker',token:'client-token-marker'};
  const input={projects:[{id:'secure',name:'Secure',dossier:{
    accesses:[{label:'Архив',login:markers.login,password:markers.password}],
    integration:{label:'API',token:markers.token},notes:'Обычная заметка'
  }}]};
  const normalized=api.normalizeLoadedData(input);
  const stateJson=JSON.stringify(normalized);
  for(const marker of Object.values(markers))assert.equal(stateJson.includes(marker),false);
  assert.equal(normalized.projects[0].dossier.notes,'Обычная заметка');
  assert.deepEqual(JSON.parse(JSON.stringify(normalized.projects[0].dossier.accesses)),[{label:'Архив',credentialsStored:true}]);
  assert.equal(input.projects[0].dossier.accesses[0].password,markers.password);

  let sent;
  context.fetch=async(url,request)=>{sent=request.body;return {ok:true,json:async()=>({data:{projects:[],_revision:1}})};};
  await api.cloudSave(input,'client');
  for(const marker of Object.values(markers))assert.equal(sent.includes(marker),false);
  const exported=api.serializeExportData(input);
  for(const marker of Object.values(markers))assert.equal(exported.includes(marker),false);
});
test('HTML spreadsheet export escapes user text',()=>{
  assert.equal(api.xlsEscape('<script>&"'),'&lt;script&gt;&amp;&quot;');
});
test('save queue preserves order and publishes only the latest response',async()=>{
  const events=[];let firstResolve;
  const queue=api.createSaveQueue(value=>{events.push('save'+value);return value===1?new Promise(r=>firstResolve=r):Promise.resolve(value);},value=>events.push('result'+value),error=>events.push('error'));
  const first=queue.enqueue(1);const second=queue.enqueue(2);
  await new Promise(r=>setImmediate(r));assert.equal(queue.pending,true);assert.deepEqual(events,['save1']);
  firstResolve(1);await Promise.all([first,second]);
  assert.deepEqual(events,['save1','save2','result2']);assert.equal(queue.pending,false);
});
test('save queue recovers after a failed save',async()=>{
  const events=[];const queue=api.createSaveQueue(v=>v===1?Promise.reject(new Error('offline')):Promise.resolve(v),v=>events.push(v),e=>events.push(e.message));
  await queue.enqueue(1);await queue.enqueue(2);assert.deepEqual(events,['offline',2]);
});

function render(name,props={}){
  const stageMap=Object.fromEntries(data.stages.map(s=>[s.id,s]));
  const groupMap=Object.fromEntries(data.stageGroups.map(s=>[s.id,s]));
  return renderToStaticMarkup(React.createElement(api.StagesCtx.Provider,{value:{stageMap,sorted:data.stages,stageGroups:data.stageGroups,groupMap}},
    React.createElement(api.HolidaysCtx.Provider,{value:data.holidays||[]},React.createElement(api[name],{data,...props}))));
}
const noop=()=>{};
const shared={onUpdate:noop,onBatchUpdate:noop,onLog:noop,onPersonSelect:noop,onProjectSelect:noop,onSeriesSelect:noop,onBack:noop,
  canEdit:true,canDeleteStructure:true,canEditProject:true,canManageProjectAssignments:true,canEditProjectById:()=>true,
  conflictIds:new Set(),conflictDetails:[],user:{id:1,sam_name:'demo',display_name:'Демо',role:'admin'}};
for(const name of ['TodayView','ProjectsView','CalendarView','GanttView','DaysView','PeopleView','AnalyticsView','DirectoryView']){
  test('React rendering: '+name,()=>assert.ok(render(name,shared).length>100));
}
for(const [name,props] of [
  ['ConflictsView',{details:[]}],['ProjectCard',{projectId:data.projects[0].id}],
  ['SeriesCard',{seriesId:data.series[0].id}],['PersonCard',{personId:data.people[0].id}],
  ['MobileToday',{conflictDetails:[]}],['MobileCalendar',{}],['MobileProjects',{}],['MobilePeople',{}],
  ['ProjectModal',{project:data.projects[0]}],['SeriesModal',{series:data.series[0]}],
  ['TaskModal',{task:data.tasks[0]}],['PersonModal',{person:data.people[0],roles:data.roles}],
  ['LoginForm',{}],['MobileTopbar',{}],['CommandPalette',{}],['ChangelogModal',{entries:[]}],['DayShiftsModal',{}],
])test('React rendering: '+name,()=>assert.ok(render(name,{...shared,...props}).length>50));
test('desktop login and mobile show new branding and author credit',()=>{
  for(const name of ['LoginForm','MobileTopbar']){
    const html=render(name,shared);assert.ok(html.includes('ПОСТ ТРЕКЕР'));assert.ok(html.includes('Создано Максимом Ефремовым'));
  }
});
test('local build marker is visible in the main interface',()=>{
  const mobile=render('MobileTopbar',shared);
  assert.ok(mobile.includes('DEV · v0.2.3'));
  assert.equal(mobile.includes('Выйти'),false);
  assert.ok(source.includes('{RUNTIME.label&&'));
});
for(const name of ['TodayView','ProjectsView','CalendarView','GanttView','DaysView','PeopleView','AnalyticsView','DirectoryView']){
  test('empty data rendering: '+name,()=>{
    const empty=api.normalizeLoadedData({stages:data.stages,stageGroups:data.stageGroups,roles:data.roles});
    assert.ok(render(name,{...shared,data:empty}).length>50);
  });
}
test('shift summary and exported shift rule agree at exactly six hours',()=>{
  const summary=api.computeShifts([{...task,from:10,to:16},{...task,id:2,cancelled:true,from:10,to:24}],[person]);
  assert.equal(summary[0].shifts,api.shiftFactFromHours(6));assert.equal(summary[0].shifts,1);
});
test('malformed navigation hash does not crash the application',()=>{
  context.window.location.hash='#project/%broken';assert.equal(api.parseHash(),null);
  context.window.location.hash='';
});
test('logout clears the CSRF token',()=>{
  api.setCsrfToken('secret');assert.equal(api.csrfHeaders({})['X-CSRF-Token'],'secret');
  api.setCsrfToken('');assert.equal(api.csrfHeaders({})['X-CSRF-Token'],undefined);
});
test('save accepts both legacy and local API response formats',async()=>{
  for(const result of [{tasks:[],_revision:1},{data:{tasks:[],_revision:1}}]){
    context.fetch=async()=>({ok:true,json:async()=>result});
    assert.equal((await api.cloudSave({},'test'))._revision,1);
  }
});
test('save does not acknowledge failed server responses',async()=>{
  context.fetch=async()=>({ok:false,status:500,json:async()=>({error:'disk unavailable'})});
  await assert.rejects(api.cloudSave({},'test'),/disk unavailable/);
});

test('weekly average uses only twelve weeks, excludes cancelled tasks and includes the first day',()=>{
  const end='11.10.2026';
  const start=api.addDays(end,-83);
  const tasks=[{...task,day:start,from:10,to:18},{...task,id:2,day:end,from:10,to:18},
    {...task,id:3,day:api.addDays(start,-1),from:0,to:24},{...task,id:4,day:end,cancelled:true,from:0,to:24},
    {...task,id:5,day:end,deleted:true,from:0,to:24},{...task,id:6,day:api.addDays(end,1),from:0,to:24}];
  assert.equal(api.personWeeklyHours(tasks,end),16/12);
  assert.equal(api.personWeeklyHours([],end),0);
});

test('undo marks new records deleted and restores old timestamps for tasks and absences',()=>{
  const previous=api.normalizeLoadedData({tasks:[task],personAbsences:[{id:'a',startDay:today,endDay:today}]});
  const current=api.normalizeLoadedData({_revision:5,tasks:[{...task,deleted:true},{...task,id:2}],personAbsences:[{id:'b'}],projects:[{id:'new'}]});
  const restored=api.undoSnapshot(previous,current,123456);
  assert.equal(restored.tasks[0]._updatedAt,123456);assert.equal(restored.tasks[0].deleted,undefined);
  assert.equal(restored.tasks[1].deleted,true);assert.equal(restored.projects[0].deleted,true);
  assert.equal(restored.personAbsences[0]._updatedAt,123456);assert.equal(restored.personAbsences[1].deleted,true);
  assert.equal(restored._revision,5);assert.equal(current.tasks[0].deleted,true);
});

test('series deletion covers all its tasks regardless of date or generation flag',()=>{
  const other={...task,id:3,seriesId:'other'};
  const input={series:[{id:'s'},{id:'other'}],tasks:[{...task,seriesId:'s'},{...task,id:2,seriesId:'s',day:'01.01.2020',autogenerated:true},other]};
  const result=api.deleteSeriesSnapshot(input,'s',100);
  assert.equal(result.tasks[0].deleted,true);assert.equal(result.tasks[1].deleted,true);assert.equal(result.tasks[2],other);
  assert.equal(result.series[0].deleted,true);assert.equal(input.series[0].deleted,undefined);
});

test('shared directories explicitly show read-only controls to managers',()=>{
  const html=render('DirectoryView',{...shared,user:{...shared.user,role:'manager'}});
  assert.match(html,/<fieldset disabled=""/);assert.ok(html.includes('Справочники доступны для просмотра'));
  assert.doesNotMatch(render('DirectoryView',shared),/<fieldset disabled=""/);
});
