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

function shiftLegacyProducerPlan(value) {
  if (typeof value === 'string' && /^2026-10-(1[7-9]|2\d|30)$/.test(value)) {
    const date = new Date(value + 'T12:00:00');
    date.setDate(date.getDate() + 13);
    return date.toISOString().slice(0,10);
  }
  if (Array.isArray(value)) return value.map(shiftLegacyProducerPlan);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,shiftLegacyProducerPlan(item)]));
  return value;
}

for (const name of ['dashboard.json','my_work.json','control.json','team.json','analytics.json']) {
  const file = path.join(FIXTURES,name);
  write(file,shiftLegacyProducerPlan(read(file)));
}
for (const directory of ['projects','blocks','tasks','people']) {
  const root = path.join(FIXTURES,directory);
  for (const name of fs.readdirSync(root).filter(name=>name.endsWith('.json'))) {
    const file = path.join(root,name);
    write(file,shiftLegacyProducerPlan(read(file)));
  }
}

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
  page.postSummary = {totalSeries:project.series.length,inPost:project.series.filter(item=>['editing','premaster','master'].includes(item.stageKey)).length,ready:project.summary.ready,atRisk:project.summary.atRisk,nextAir:project.summary.nextAir};
  write(file,page);
}

console.log(`Synchronized ${enriched.length} series across post, producer and marketing fixtures.`);
