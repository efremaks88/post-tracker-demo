const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'pages-fixtures');

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8').replace(/^\uFEFF/, ''));
}

function write(name, value) {
  fs.writeFileSync(path.join(ROOT, name), JSON.stringify(value) + '\n', 'utf8');
}

const dashboard = read('dashboard.json');
dashboard.projects = dashboard.projects.filter(project=>String(project.id).startsWith('demo-'));
const projectIds = new Set(dashboard.projects.map(project=>project.id));
write('dashboard.json', dashboard);

const data = read('data.json');
data.projects = data.projects.filter(project=>projectIds.has(project.id));
data.series = data.series.filter(series=>projectIds.has(series.projectId));
data.tasks = data.tasks.filter(task=>projectIds.has(task.project));
data._revision = 0;
data._clientId = '';
write('data.json', data);

const control = read('control.json');
control.items = control.items.filter(item=>projectIds.has(item.projectId));
control.summary = {
  total: control.items.length,
  overdue: control.items.filter(item=>item.state==='overdue').length,
  today: control.items.filter(item=>item.state==='today').length,
  soon: control.items.filter(item=>item.state==='soon').length,
  upcoming: control.items.filter(item=>item.state==='upcoming').length,
  approvals: control.items.filter(item=>item.kind==='approval').length,
};
write('control.json', control);

const analytics = read('analytics.json');
analytics.projects = analytics.projects.filter(project=>projectIds.has(project.id));
const average = (key)=>analytics.projects.length ? Math.round(analytics.projects.reduce((sum,project)=>sum+(Number(project[key])||0),0)/analytics.projects.length) : 0;
analytics.summary = {
  projectCount: analytics.projects.length,
  averageElapsedDays: average('elapsedDays'),
  averageForecastDays: average('forecastTotalDays'),
  averageProgress: average('progress'),
  riskCount: analytics.projects.filter(project=>project.risk).length,
};
write('analytics.json', analytics);

const team = read('team.json');
for (const person of team.people) person.projects = (person.projects||[]).filter(project=>projectIds.has(project.id));
write('team.json', team);

const me = read('me.json');
me.csrfToken = 'github-pages-demo';
write('me.json', me);

const history = {
  events: [
    {id:'demo-history-1',userId:1,userName:'Локальный администратор',action:'update',entity:'productionTask',entityId:'demo-pt-north-draft',projectId:'demo-north',seriesId:'',projectName:'Северный ветер',seriesName:'',changes:[{field:'deadline',before:'2026-10-17',after:'2026-10-18'}],details:{bulk:false,label:'Получить первый драфт сценария',changedFields:['deadline']},source:'user',reason:'',visibility:'standard',occurredAt:'2026-10-18T09:40:00.000Z'},
    {id:'demo-history-2',userId:1,userName:'Локальный администратор',action:'create',entity:'productionApproval',entityId:'demo-pa-stage-legal',projectId:'demo-stage',seriesId:'',projectName:'За кулисами',seriesName:'',changes:[],details:{bulk:false,label:'Юридический отдел · согласовать договор',changedFields:[]},source:'user',reason:'',visibility:'standard',occurredAt:'2026-10-18T08:15:00.000Z'},
    {id:'demo-history-3',userId:1,userName:'Локальный администратор',action:'update',entity:'productionBlock',entityId:'demo-pb-home-edit',projectId:'demo-home',seriesId:'',projectName:'Дом, который помнит',seriesName:'',changes:[{field:'owner_person_id',before:null,after:'demo-elena'}],details:{bulk:false,label:'Монтаж истории',changedFields:['owner_person_id']},source:'user',reason:'',visibility:'standard',occurredAt:'2026-10-17T14:20:00.000Z'},
    {id:'demo-history-4',userId:1,userName:'Локальный администратор',action:'update',entity:'productionTask',entityId:'demo-pt-city-topic',projectId:'demo-city',seriesId:'',projectName:'Город говорит',seriesName:'',changes:[{field:'internal_comment',before:'',after:'Добавлен контекст для команды'}],details:{bulk:false,label:'Утвердить главную тему выпуска',changedFields:['internal_comment']},source:'user',reason:'',visibility:'standard',occurredAt:'2026-10-17T11:05:00.000Z'},
  ],
  actors:[{id:1,name:'Локальный администратор'}],
  page:1,pageSize:30,total:4,totalPages:1,
};
write('history.json', history);

for (const entry of fs.readdirSync(path.join(ROOT,'projects'))) {
  if (!entry.endsWith('.json')) continue;
  const file=path.join(ROOT,'projects',entry); const project=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
  if (!projectIds.has(project.project.id)) fs.rmSync(file);
}
for (const folder of ['blocks','tasks']) {
  const directory=path.join(ROOT,folder);
  for (const entry of fs.readdirSync(directory)) {
    if (!entry.endsWith('.json')) continue;
    const file=path.join(directory,entry); const value=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
    if (!projectIds.has(value.project.id)) fs.rmSync(file);
  }
}

console.log(`Curated ${projectIds.size} GitHub Pages demo projects`);
