const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(ROOT, 'pages-fixtures');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value), 'utf8');

const schedule = {
  'demo-north-01': {editStart:'27.10.2026',preOtkDate:'02.11.2026',otkDate:'03.11.2026',sendDate:'04.11.2026',airDate:'06.11.2026',airTime:'21:00'},
  'demo-north-02': {editStart:'03.11.2026',preOtkDate:'09.11.2026',otkDate:'10.11.2026',sendDate:'11.11.2026',airDate:'13.11.2026',airTime:'21:00'},
  'demo-north-03': {editStart:'10.11.2026',preOtkDate:'16.11.2026',otkDate:'17.11.2026',sendDate:'18.11.2026',airDate:'20.11.2026',airTime:'21:00'},
  'demo-city-01': {editStart:'20.10.2026',preOtkDate:'28.10.2026',otkDate:'29.10.2026',sendDate:'30.10.2026',airDate:'03.11.2026',airTime:'19:00'},
  'demo-city-02': {editStart:'30.10.2026',preOtkDate:'06.11.2026',otkDate:'07.11.2026',sendDate:'08.11.2026',airDate:'10.11.2026',airTime:'19:00'},
  'demo-science-01': {editStart:'23.10.2026',preOtkDate:'29.10.2026',otkDate:'30.10.2026',sendDate:'31.10.2026',airDate:'08.11.2026',airTime:'18:30'},
  'demo-science-02': {editStart:'31.10.2026',preOtkDate:'12.11.2026',otkDate:'14.11.2026',sendDate:'15.11.2026',airDate:'22.11.2026',airTime:'18:30'},
  'demo-stage-01': {editStart:'01.11.2026',preOtkDate:'',otkDate:'',sendDate:'',airDate:'07.11.2026',airTime:'20:00'},
  'demo-expedition-01': {editStart:'05.11.2026',preOtkDate:'18.11.2026',otkDate:'20.11.2026',sendDate:'21.11.2026',airDate:'28.11.2026',airTime:'20:00'},
  'demo-expedition-02': {editStart:'18.11.2026',preOtkDate:'',otkDate:'',sendDate:'',airDate:'',airTime:'20:00'},
};

const taskDays = {
  1:'31.10.2026',2:'04.11.2026',3:'05.11.2026',4:'11.11.2026',5:'27.10.2026',6:'29.10.2026',7:'04.11.2026',8:'29.10.2026',9:'03.11.2026',10:'04.11.2026',
};

function iso(value) {
  const match = String(value || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

const today = '2026-10-31';
const diff = day => day ? Math.round((new Date(day+'T12:00:00')-new Date(today+'T12:00:00'))/86400000) : null;

// Keep the static Pages demo anchored to one explicit production week.  The old
// migration shifted every October date by 13 days on every run, so the text
// could still say «просрочено» while the date was already in the future.  ID maps make
// the fixture sync repeatable and keep labels, counters and dates in agreement.
const producerTaskDeadlines = {
  'demo-pt-stage-contract':'2026-10-30',
  'demo-pt-factory-budget':'2026-10-30',
  'demo-pt-science-expert':'2026-10-29',
  'demo-pt-exp-tickets':'2026-10-31',
  'demo-pt-north-draft':'2026-10-31',
  'demo-pt-city-topic':'2026-10-31',
  'demo-pt-home-structure':'2026-10-31',
  'demo-pt-stage-call':'2026-10-31',
  'demo-pt-factory-legal':'2026-10-31',
  'demo-pt-home-archive':'2026-11-01',
  'demo-pt-city-guest':'2026-11-01',
  'demo-pt-north-location':'2026-11-01',
  'demo-pt-stage-questions':'2026-11-01',
  'demo-pt-exp-permit':'2026-11-01',
  'demo-pt-north-call':'2026-11-02',
  'demo-pt-north-crew':'2026-11-02',
  'demo-pt-exp-gear':'2026-11-02',
  'demo-pt-science-facts':'2026-11-02',
  'demo-pt-home-cut':'2026-11-03',
  'demo-pt-factory-plan':'2026-11-03',
  'demo-pt-north-equipment':'2026-11-03',
};

const producerBlockDeadlines = {
  'demo-pb-factory-contract':'2026-10-30',
  'demo-pb-science-research':'2026-10-30',
  'demo-pb-factory-post':'2026-10-31',
  'demo-pb-city-dev':'2026-11-01',
  'demo-pb-stage-prep':'2026-11-01',
  'demo-pb-north-prep':'2026-11-02',
  'demo-pb-exp-route':'2026-11-02',
  'demo-pb-home-edit':'2026-11-03',
  'demo-pb-stage-shoot':'2026-11-04',
  'demo-pb-north-shoot-01':'2026-11-04',
  'demo-pb-factory-shoot':'2026-11-05',
  'demo-pb-science-shoot':'2026-11-06',
  'demo-pb-city-release':'2026-11-07',
  'demo-pb-exp-kar':'2026-11-07',
  'demo-pb-stage-edit':'2026-11-09',
  'demo-pb-north-shoot-02':'2026-11-09',
  'demo-pb-home-finish':'2026-11-11',
  'demo-pb-north-post-01':'2026-11-12',
  'demo-pb-exp-altai':'2026-11-12',
};

const producerApprovalDeadlines = {
  'demo-pa-factory-budget':'2026-10-30',
  'demo-pa-stage-contract':'2026-10-31',
  'demo-pa-exp-budget':'2026-11-01',
  'demo-pa-north-script':'2026-11-01',
  'demo-pa-north-format':'2026-10-30',
};

function objectId(value, prefix) {
  const id = String(value || '');
  if (id.startsWith(prefix)) return id;
  const colon = id.indexOf(':');
  return colon >= 0 && id.slice(colon + 1).startsWith(prefix) ? id.slice(colon + 1) : '';
}

function normalizeProducerPlan(value) {
  if (Array.isArray(value)) return value.map(normalizeProducerPlan);
  if (!value || typeof value !== 'object') return value;
  const next = Object.fromEntries(Object.entries(value).map(([key,item])=>[key,normalizeProducerPlan(item)]));
  const approvalId = next.approvalId || objectId(next.id, 'demo-pa-');
  const taskId = next.taskId || objectId(next.id, 'demo-pt-');
  const blockId = next.blockId || objectId(next.id, 'demo-pb-');
  const deadline = (approvalId && producerApprovalDeadlines[approvalId])
    || (taskId && producerTaskDeadlines[taskId])
    || (blockId && producerBlockDeadlines[blockId]);
  if (deadline && Object.prototype.hasOwnProperty.call(next, 'deadline')) next.deadline = deadline;
  if (deadline && Object.prototype.hasOwnProperty.call(next, 'dueDate')) next.dueDate = deadline;
  return next;
}

const normalizedFixtureFiles = [];
for (const name of ['dashboard.json','my_work.json','control.json','team.json','analytics.json']) {
  normalizedFixtureFiles.push(path.join(FIXTURES,name));
}
for (const directory of ['projects','blocks','tasks','people']) {
  const root = path.join(FIXTURES,directory);
  for (const name of fs.readdirSync(root).filter(name=>name.endsWith('.json'))) normalizedFixtureFiles.push(path.join(root,name));
}
for (const file of normalizedFixtureFiles) write(file, normalizeProducerPlan(read(file)));

function controlState(day) {
  const days = diff(day);
  if (days === null) return null;
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 3) return 'soon';
  if (days <= 14) return 'upcoming';
  return null;
}

function controlReason(kind, state) {
  const labels = {
    task:{overdue:'Задача просрочена',today:'Срок задачи сегодня',soon:'Срок задачи близко',upcoming:'Задача в ближайшие 14 дней'},
    block:{overdue:'Блок просрочен',today:'Срок блока сегодня',soon:'Срок блока близко',upcoming:'Срок блока в ближайшие 14 дней'},
    approval:{overdue:'Согласование просрочено',today:'Согласование нужно сегодня',soon:'Срок согласования близко',upcoming:'Согласование в ближайшие 14 дней'},
  };
  return labels[kind]?.[state] || '';
}

const controlPath = path.join(FIXTURES, 'control.json');
const control = read(controlPath);
control.items = control.items.map(item => {
  const state = controlState(item.deadline);
  return state ? {...item,state,severity:state==='overdue'?'high':state==='today'||state==='soon'?'medium':'low',reason:controlReason(item.kind,state)} : null;
}).filter(Boolean).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)) || String(a.title).localeCompare(String(b.title),'ru'));
control.summary = {
  total:control.items.length,
  overdue:control.items.filter(item=>item.state==='overdue').length,
  today:control.items.filter(item=>item.state==='today').length,
  soon:control.items.filter(item=>item.state==='soon').length,
  upcoming:control.items.filter(item=>item.state==='upcoming').length,
  approvals:control.items.filter(item=>item.kind==='approval').length,
};
write(controlPath, control);

const dashboardPath = path.join(FIXTURES, 'dashboard.json');
const dashboard = read(dashboardPath);
dashboard.attention = control.items.filter(item=>['overdue','today','soon'].includes(item.state));
dashboard.myTasks = dashboard.myTasks.filter(item=>item.deadline===today);
dashboard.deadlines = dashboard.deadlines.filter(item=>{const days=diff(item.deadline);return days!==null&&days>=0&&days<=14;}).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)));
dashboard.calendarItems = dashboard.calendarItems.filter(item=>{const days=diff(item.deadline);return days!==null&&days>=-31&&days<=62;}).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)));
dashboard.projects = dashboard.projects.map(project=>{
  const projectControl = control.items.filter(item=>item.projectId===project.id);
  const nextDeadline = dashboard.deadlines.filter(item=>item.projectId===project.id).map(item=>item.deadline).sort()[0] || project.nextDeadline;
  return {...project,nextDeadline,warningCount:projectControl.filter(item=>['overdue','today','soon'].includes(item.state)).length};
});
write(dashboardPath, dashboard);

function enrich(series, tasks) {
  const config = schedule[series.id] || {};
  const editStart=iso(config.editStart),preMaster=iso(config.preOtkDate),qualityControl=iso(config.otkDate),master=iso(config.sendDate),airDate=iso(config.airDate);
  const rows=tasks.filter(task=>task.seriesId===series.id).map(task=>({id:task.id,status:task.status,day:iso(task.day),person:task.person,note:task.note||''})).sort((a,b)=>String(a.day).localeCompare(String(b.day)));
  const milestones=[['edit','Монтаж',editStart],['premaster','Предмастер',preMaster],['quality','ОТК',qualityControl],['master','Мастер',master],['air','Эфир',airDate]].filter(item=>item[2]).map(item=>({key:item[0],label:item[1],date:item[2]}));
  const labels={монтаж:'Монтаж',графика:'Графика','цвет/звук':'Цвет и звук',отсмотр:'Редакторский отсмотр',правки:'Правки',предотк:'Предмастер',отк:'ОТК',сдача:'Сдача мастера',синхра:'Подготовка материалов'};
  const latestPast=rows.filter(item=>item.day&&item.day<=today).at(-1)||null;
  let stage='Ожидает монтажа',stageKey='waiting';
  if(master&&master<=today){stage='Мастер передан';stageKey='master';}
  else if((qualityControl&&qualityControl<=today)||(preMaster&&preMaster<=today)){stage='Предмастер и ОТК';stageKey='premaster';}
  else if((editStart&&editStart<=today)||latestPast){stage=labels[String(latestPast?.status||'монтаж').toLowerCase()]||latestPast?.status||'Монтаж';stageKey='editing';}
  const daysToAir=diff(airDate);let marketingState='no-date',marketingLabel='Нужна дата эфира',marketingNote='Без даты нельзя собрать график запуска.';
  if(airDate){
    if(daysToAir<0){marketingState='risk';marketingLabel='Эфир прошёл — нет мастера';marketingNote='Нужно срочно уточнить фактическую сдачу.';}
    else if(master&&master<=today){marketingState='ready';marketingLabel='Материал готов';marketingNote='Маркетинг может планировать публикации и размещения.';}
    else if(daysToAir<=7&&(!preMaster||preMaster>today)){marketingState='risk';marketingLabel='Риск к эфиру';marketingNote='До эфира меньше недели, а предмастер ещё не готов.';}
    else if(daysToAir<=21){marketingState='prepare';marketingLabel='Пора запускать маркетинг';marketingNote=preMaster?'Дата материала известна — можно собирать план запуска.':'Нужно подтвердить дату предмастера.';}
    else{marketingState='early';marketingLabel='Пока рано';marketingNote='Контекст уже виден, активный запуск можно начать позже.';}
  }
  return {id:series.id,projectId:series.projectId,name:series.name,order:series.order||0,editStart,preMaster,qualityControl,master,airDate,airTime:config.airTime||series.airTime||'',delivered:false,stage,stageKey,milestones,nextMilestone:milestones.find(item=>item.date>=today)||null,daysToAir,marketingState,marketingLabel,marketingNote,postWork:{scheduledShifts:rows.length,nextShift:rows.find(item=>item.day>=today)||null,latestShift:rows.at(-1)||null,people:[...new Set(rows.map(item=>item.person).filter(Boolean))].slice(0,4)}};
}

const dataPath = path.join(FIXTURES, 'data.json');
const data = read(dataPath);
data.series = data.series.map(series => ({...series,...(schedule[series.id] || {})}));
data.tasks = data.tasks.map(task => taskDays[task.id] ? {...task,day:taskDays[task.id]} : task);
write(dataPath, data);

const enriched = data.series.map(series => enrich(series, data.tasks || []));
const projects = data.projects.map(project => {
  const series = enriched.filter(item=>item.projectId===project.id);
  if (!series.length) return null;
  return {id:project.id,name:project.name,abbr:project.abbr,description:project.description,color:project.color,status:project.status,series,summary:{total:series.length,ready:series.filter(item=>item.marketingState==='ready').length,atRisk:series.filter(item=>item.marketingState==='risk').length,nextAir:series.map(item=>item.airDate).filter(day=>day&&day>=today).sort()[0]||null}};
}).filter(Boolean);

const marketing = {today,summary:{series:enriched.length,nextAir:enriched.filter(item=>item.daysToAir!==null&&item.daysToAir>=0&&item.daysToAir<=14).length,ready:enriched.filter(item=>item.marketingState==='ready').length,atRisk:enriched.filter(item=>item.marketingState==='risk').length,noDate:enriched.filter(item=>item.marketingState==='no-date').length},projects,methodNote:'Маркетинг видит те же даты, что и постпродакшн: монтаж, предмастер, ОТК, мастер и эфир. Ничего не копируется вручную.'};
write(path.join(FIXTURES, 'marketing.json'), marketing);

for (const project of projects) {
  const file = path.join(FIXTURES, 'projects', `${project.id}.json`);
  if (!fs.existsSync(file)) continue;
  const page = read(file);
  page.series = project.series;
  page.controlItems = control.items.filter(item=>item.projectId===project.id);
  page.postSummary = {totalSeries:project.series.length,inPost:project.series.filter(item=>['editing','premaster','master'].includes(item.stageKey)).length,ready:project.summary.ready,atRisk:project.summary.atRisk,nextAir:project.summary.nextAir};
  write(file,page);
}

console.log(`Synchronized ${enriched.length} series across post, producer and marketing fixtures.`);
