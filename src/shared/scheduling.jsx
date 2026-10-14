function isNonWorkday(dateStr, holidays){
  const d=parseDate(dateStr); if(!d) return false;
  const dow=d.getDay();
  if(dow===0||dow===6) return true;
  return (holidays||[]).includes(dateStr);
}

function parseDate(str){
  if(!str||typeof str!=="string") return null;
  const m=str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if(!m) return null;
  const date=new Date(+m[3],+m[2]-1,+m[1]);
  return date.getFullYear()===+m[3]&&date.getMonth()===+m[2]-1&&date.getDate()===+m[1]?date:null;
}
function formatDate(d){
  if(!d) return "";
  const dd=String(d.getDate()).padStart(2,"0");
  const mm=String(d.getMonth()+1).padStart(2,"0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}
function toInput(dmy){
  if(!dmy) return "";
  const m=dmy.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m?`${m[3]}-${m[2]}-${m[1]}`:"";
}
function fromInput(ymd){
  if(!ymd) return "";
  const [y,mo,d]=ymd.split("-");
  return `${d}.${mo}.${y}`;
}
function normalizeBirthday(value){
  const raw=String(value||"").trim();
  if(!raw) return "";
  const m=raw.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
  if(!m) return null;
  const day=+m[1], month=+m[2];
  const test=new Date(2000,month-1,day);
  if(test.getMonth()!==month-1||test.getDate()!==day) return null;
  return `${String(day).padStart(2,"0")}.${String(month).padStart(2,"0")}`;
}
function birthdayDateForYear(birthday,year){
  const b=normalizeBirthday(birthday);
  if(!b) return "";
  const [d,m]=b.split(".");
  return `${d}.${m}.${year}`;
}
function birthdayNextDate(birthday,fromDate=new Date()){
  const b=normalizeBirthday(birthday);
  if(!b) return null;
  const from=new Date(fromDate);from.setHours(0,0,0,0);
  const [d,m]=b.split(".").map(Number);
  let next=new Date(from.getFullYear(),m-1,d);
  if(next<from) next=new Date(from.getFullYear()+1,m-1,d);
  return next;
}
function birthdayDiffDays(birthday,fromDate=new Date()){
  const next=birthdayNextDate(birthday,fromDate);
  if(!next) return null;
  const from=new Date(fromDate);from.setHours(0,0,0,0);
  return Math.round((next-from)/86400000);
}

const ABSENCE_TYPES = [
  {id:"dayoff",label:"Выходной",short:"Вых",color:"#fdba74"},
  {id:"vacation",label:"Отпуск",short:"Отп",color:"#38bdf8"},
  {id:"sick",label:"Болезнь",short:"Бол",color:"#f87171"},
];
function absenceTypeInfo(type){
  return ABSENCE_TYPES.find(a=>a.id===type)||ABSENCE_TYPES[0];
}
function normalizeAbsence(a){
  const start=a?.startDay||a?.day||formatDate(new Date());
  return {
    id:String(a?.id||"abs_"+Date.now()),
    personId:String(a?.personId||""),
    personName:String(a?.personName||""),
    type:a?.type||"dayoff",
    startDay:start,
    endDay:a?.endDay||start,
    note:String(a?.note||""),
    deleted:a?.deleted===true,
    updatedAt:a?.updatedAt||"",
    _updatedAt:a?._updatedAt||0,
  };
}
function absencePersonMatches(absence, person){
  if(!absence||!person) return false;
  const vals=[person.id,person.name,person.login,person.email].filter(Boolean).map(v=>String(v).trim().toLowerCase());
  const aVals=[absence.personId,absence.personName].filter(Boolean).map(v=>String(v).trim().toLowerCase());
  return aVals.some(v=>vals.includes(v));
}
function absencesForPersonDay(absences, people, personName, day){
  const person=(people||[]).find(p=>p.name===personName)||{name:personName};
  const dk=daySort(day);
  return (absences||[]).filter(a=>{
    if(a.deleted) return false;
    if(!absencePersonMatches(a,person)) return false;
    const from=daySort(a.startDay||a.day);
    const to=daySort(a.endDay||a.startDay||a.day);
    return dk>=from&&dk<=to;
  });
}
function birthdayPeopleOnDate(people,dateStr){
  const d=parseDate(dateStr); if(!d) return [];
  const key=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
  return (people||[]).filter(p=>p.active!==false&&!p.deleted&&normalizeBirthday(p.birthday)===key);
}
function upcomingBirthdays(people,fromDate=new Date(),days=7){
  return (people||[]).filter(p=>p.active!==false&&!p.deleted&&normalizeBirthday(p.birthday)).map(p=>{
    const next=birthdayNextDate(p.birthday,fromDate);
    const diff=birthdayDiffDays(p.birthday,fromDate);
    return {person:p,date:formatDate(next),diff};
  }).filter(x=>x.diff>=0&&x.diff<=days).sort((a,b)=>a.diff-b.diff||a.person.name.localeCompare(b.person.name));
}
function birthdayWhenText(diff){
  if(diff===0) return "сегодня";
  if(diff===1) return "завтра";
  return `через ${diff} дн.`;
}
function dayLabel(str){
  const d=parseDate(str); if(!d) return str;
  return `${WDAYS[d.getDay()]} ${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
}
function weekKey(str){
  const d=parseDate(str); if(!d) return str;
  const day=d.getDay()||7;
  const mon=new Date(d); mon.setDate(d.getDate()-day+1);
  return mon.toISOString().slice(0,10);
}
function weekLabel(str){
  const d=parseDate(str); if(!d) return str;
  const day=d.getDay()||7;
  const mon=new Date(d); mon.setDate(d.getDate()-day+1);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  const fmt=dt=>`${String(dt.getDate()).padStart(2,"0")}.${String(dt.getMonth()+1).padStart(2,"0")}`;
  return `${fmt(mon)} – ${fmt(sun)}`;
}
function monthKey(str){
  const d=parseDate(str); if(!d) return str;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function addDays(str,n){
  const d=parseDate(str); if(!d) return str;
  d.setDate(d.getDate()+n);
  return formatDate(d);
}

const OLD_TASK_EDIT_LIMIT_DAYS=14;
function isDayOlderThanLimit(day,limit=OLD_TASK_EDIT_LIMIT_DAYS){
  const d=parseDate(day);
  if(!d) return false;
  d.setHours(0,0,0,0);
  const now=new Date(); now.setHours(0,0,0,0);
  return (now-d)/86400000>limit;
}
function addWorkdays(str,n,holidays){
  const h=new Set(holidays||[]);
  let d=parseDate(str); if(!d) return str;
  let added=0;
  while(added<n){
    d.setDate(d.getDate()+1);
    const dow=d.getDay();
    if(dow!==0&&dow!==6&&!h.has(formatDate(d))) added++;
  }
  return formatDate(d);
}
function generateAirDates(proj){
  if(proj.air_mode==="custom") return proj.air_dates||[];
  if(proj.air_mode!=="weekly") return [];
  const start=parseDate(proj.edit_start);
  const end=parseDate(proj.otk);
  if(!start||!end) return [];
  const jsDay=(proj.air_weekday??1)%7;
  const d=new Date(start);
  while(d.getDay()!==jsDay) d.setDate(d.getDate()+1);
  const dates=[];
  while(d<=end){dates.push(formatDate(d));d.setDate(d.getDate()+7);}
  return dates;
}
function generateSeriesAirDates(series){
  if(!series) return [];
  if(series.airDate) return [series.airDate];
  if(series.airMode!=="weekly") return [];
  if(!series.editStart||!series.otkDate) return [];
  const jsDay=(series.airDay??1)%7;
  const start=parseDate(series.editStart);
  const end=parseDate(series.otkDate);
  if(!start||!end) return [];
  const d=new Date(start);
  while(d.getDay()!==jsDay) d.setDate(d.getDate()+1);
  const dates=[];
  while(d<=end){dates.push(formatDate(d));d.setDate(d.getDate()+7);}
  return dates;
}
function filterPeopleByStatus(people, status, stages){
  const stage=(stages||[]).find(s=>s.id===status);
  const roles=stage?.rolesRequired||[];
  if(!roles.length) return people.filter(p=>p.active!==false);
  return people.filter(p=>p.active!==false&&(p.roles||[]).some(r=>roles.includes(r)));
}
function getConflicts(tasks,people,stages,projects,personAbsences){
  tasks=(tasks||[]).filter(t=>!t.deleted&&!t.cancelled);
  const ids=new Set(); const details=[];
  const today=new Date(); today.setHours(0,0,0,0);
  const todayStr=formatDate(today);
  const in7=new Date(today); in7.setDate(today.getDate()+7);
  const in7Str=formatDate(in7);
  const byPD={};
  tasks.filter(t=>t.person&&!((stages||[]).find(s=>s.id===t.status)?.noImpact)).forEach(t=>{
    const k=t.person+"||"+t.day;
    if(!byPD[k]) byPD[k]=[];
    byPD[k].push(t);
  });
  Object.values(byPD).forEach(group=>{
    const personObj=(people||[]).find(p=>p.name===group[0]?.person);
    if(personObj?.allowParallel) return;
    for(let i=0;i<group.length;i++) for(let j=i+1;j<group.length;j++){
      const a=group[i],b=group[j];
      const af=a.from||0,at=a.to||0,bf=b.from||0,bt=b.to||0;
      if(af<bt&&bf<at){
        ids.add(a.id);ids.add(b.id);
        const key=[a.id,b.id].sort().join("-");
        if(!details.find(d=>d.key===key))
          details.push({type:"overlap",notify:true,key,person:a.person,dayStr:a.day,taskA:a,taskB:b,
            overlapFrom:Math.max(af,bf),overlapTo:Math.min(at,bt)});
      }
    }
  });
  tasks.forEach(t=>{
    const stage=(stages||[]).find(s=>s.id===t.status);
    if(!t.person&&stage?.needsExecutor&&!stage.noImpact&&daySort(t.day)>=daySort(todayStr)&&daySort(t.day)<=daySort(in7Str)){
      ids.add(t.id);
      details.push({type:"unfilled",notify:true,key:"unfilled-"+t.id,task:t});
    }
  });
  tasks.forEach(t=>{
    if(t.deleted||t.cancelled) return;
    const stage=(stages||[]).find(s=>s.id===t.status);
    if(stage?.noImpact) return;
    const hours=taskHours(t);
    if(hours>12){
      ids.add(t.id);
      details.push({type:"long-shift",notify:false,key:"long-shift-"+t.id,task:t,hours});
    }
  });
  (tasks||[]).forEach(t=>{
    if(!t.person) return;
    const hits=absencesForPersonDay(personAbsences,people,t.person,t.day);
    hits.forEach(a=>{
      ids.add(t.id);
      details.push({type:"absence",notify:true,key:"absence-"+t.id+"-"+a.id,task:t,person:t.person,absence:a});
    });
  });
  if(people&&stages){
    tasks.forEach(t=>{
      if(!t.person) return;
      const stage=(stages||[]).find(s=>s.id===t.status);
      if(!stage||!stage.rolesRequired||!stage.rolesRequired.length) return;
      if(stage.noImpact) return;
      const person=(people||[]).find(p=>p.name===t.person);
      if(!person) return;
      const personRoles=person.roles||[];
      const match=stage.rolesRequired.some(r=>personRoles.includes(r));
      if(!match){
        ids.add(t.id);
        details.push({type:"role",notify:true,key:"role-"+t.id,task:t,person:t.person,
          stage:stage.label,requiredRoles:stage.rolesRequired,personRoles});
      }
    });
  }
  (projects||[]).filter(p=>p.status!=="\u0430\u0440\u0445\u0438\u0432"&&!p.deleted).forEach(p=>{
    const managers=(p.managers||[]).filter(m=>String(m?.uid||m?.name||m||"").trim());
    if(!managers.length) details.push({type:"project-manager",notify:false,key:"project-manager-"+p.id,project:p});
  });
  return {ids,details};
}
function enrichTasks(tasks){
  return tasks.filter(t=>!t.deleted).map(t=>({...t,
    _dayKey:t.day,
    _weekKey:weekKey(t.day),
    _monthKey:monthKey(t.day),
  }));
}
function projColor(projects,projId){
  return (projects.find(p=>p.id===projId)||{}).color||"#3b82f6";
}
function projName(projects,projId){
  return (projects.find(p=>p.id===projId)||{}).name||projId;
}
function projAbbr(projects,projId){
  const p=projects.find(pr=>pr.id===projId);
  return p?(p.abbr||p.name):projId;
}

