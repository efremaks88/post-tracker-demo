const VERSION = "1.4.2";
const BUILD_DATE = "11.10.2026";
const STORAGE_MODE = "server";

//  SERVER_URL — адрес вашего сервера.
//  Если браузер открывает страницу с того же сервера — оставьте "".
//  Если разработка на отдельной машине — укажите, например: "http://192.168.1.50:3000"
const SERVER_URL = "";
const RUNTIME = typeof window!=="undefined"&&window.__TRACKER_RUNTIME__ ? window.__TRACKER_RUNTIME__ : {};
const DATA_ARRAY_KEYS=["projects","series","tasks","people","roles","stages","stageGroups","holidays","achievements","personAbsences","templates","changelog"];
const CLIENT_SECRET_KEY=/^(?:login|username|user|password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credentials?)$/i;
const CLIENT_ACCESS_SECRET_KEY=/^(?:login|username|user|password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credentials?)$/i;
function clientPlainObject(value){return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function clientMeaningfulValue(value){
  if(value===null||value===undefined||value==="")return false;
  if(Array.isArray(value))return value.some(clientMeaningfulValue);
  if(clientPlainObject(value))return Object.values(value).some(clientMeaningfulValue);
  return true;
}
function clientAccessHasCredential(access){
  if(!clientPlainObject(access))return clientMeaningfulValue(access);
  return Object.entries(access).some(([key,value])=>
    (CLIENT_ACCESS_SECRET_KEY.test(key)&&clientMeaningfulValue(value))||
    ((Array.isArray(value)||clientPlainObject(value))&&clientAccessHasCredential(value))
  );
}
function sanitizeClientNode(value){
  if(Array.isArray(value))return value.map(sanitizeClientNode);
  if(!clientPlainObject(value))return value;
  const safe={};
  for(const [key,item] of Object.entries(value)){
    if(key==="accesses"){
      safe.accesses=Array.isArray(item)?item.map(access=>{
        const entry={};
        if(clientPlainObject(access)&&typeof access.id==="string")entry.id=access.id;
        if(clientPlainObject(access)&&typeof access.label==="string")entry.label=access.label;
        if(clientPlainObject(access)&&typeof access.name==="string"&&!entry.label)entry.label=access.name;
        if(clientAccessHasCredential(access)||access?.credentialsStored===true)entry.credentialsStored=true;
        return entry;
      }).filter(entry=>entry.id||entry.label||entry.credentialsStored):[];
    }else if(!CLIENT_SECRET_KEY.test(key))safe[key]=sanitizeClientNode(item);
  }
  return safe;
}
function sanitizeClientData(record){
  const source=clientPlainObject(record)?record:{};
  const safe={...source};
  safe.projects=Array.isArray(source.projects)?source.projects.map(project=>({
    ...project,dossier:sanitizeClientNode(clientPlainObject(project?.dossier)?project.dossier:{})
  })):[];
  return safe;
}
function normalizeLoadedData(record){
  const result=sanitizeClientData(record);
  DATA_ARRAY_KEYS.forEach(key=>{if(!Array.isArray(result[key]))result[key]=[];});
  return result;
}
function accountBackupKey(user){return "post_tracker_backup:"+String(user?.sam_name||user?.id||"anonymous");}
function persistAccountBackup(user,data){
  const safe=sanitizeClientData(data);
  localStorage.setItem(accountBackupKey(user),JSON.stringify({ts:safe._savedAt,data:safe}));
}
function undoSnapshot(previous,current,now=Date.now()){
  const restored={...previous,_revision:current?._revision,changelog:current?.changelog||previous.changelog||[]};
  for(const key of SOFT_DELETE_KEYS){
    const old=Array.isArray(previous[key])?previous[key]:[];
    const ids=new Set(old.map(item=>String(item.id)));
    restored[key]=[
      ...old.map(item=>({...item,_updatedAt:now})),
      ...(current?.[key]||[]).filter(item=>!ids.has(String(item.id))).map(item=>({...item,deleted:true,_updatedAt:now})),
    ];
  }
  return restored;
}
function deleteSeriesSnapshot(data,id,now=Date.now()){
  return {
    series:(data.series||[]).map(s=>s.id===id?{...s,deleted:true,_updatedAt:now}:s),
    tasks:(data.tasks||[]).map(t=>t.seriesId===id?{...t,deleted:true,_updatedAt:now}:t),
  };
}
function personWeeklyHours(tasks,today,weeks=12){
  const end=parseDate(today);
  if(!end||!Number.isInteger(weeks)||weeks<1)return 0;
  const start=new Date(end);
  start.setDate(start.getDate()-(weeks*7-1));
  const first=daySort(formatDate(start)),last=daySort(today);
  return (tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&parseDate(t.day)&&daySort(t.day)>=first&&daySort(t.day)<=last)
    .reduce((sum,t)=>sum+Math.max(0,taskHours(t)),0)/weeks;
}
function mergeChangelog(...lists){
  const unique=new Map();
  for(const entry of lists.flat()){
    if(entry&&typeof entry.text==="string")unique.set(String(entry.ts)+":"+entry.text,entry);
  }
  return Array.from(unique.values()).sort((a,b)=>(Number(b.ts)||0)-(Number(a.ts)||0)).slice(0,200);
}
function createSaveQueue(save,onResult,onError){
  let tail=Promise.resolve(),version=0,pending=false;
  return {
    get pending(){return pending;},
    enqueue(payload){
      const current=++version;
      pending=true;
      tail=tail.catch(()=>{}).then(()=>save(payload)).then(result=>{
        if(current===version){pending=false;onResult(result);}
      },error=>{if(current===version){pending=false;onError(error);}});
      return tail;
    }
  };
}
let csrfToken = "";
function setCsrfToken(token){ csrfToken = token || ""; }
function csrfHeaders(headers){
  const h = {...(headers||{})};
  if(csrfToken) h["X-CSRF-Token"] = csrfToken;
  return h;
}
async function csrfFetch(url, options){
  const opts = {...(options||{})};
  const method = (opts.method||"GET").toUpperCase();
  if(["POST","PUT","PATCH","DELETE"].includes(method)) opts.headers = csrfHeaders(opts.headers);
  return fetch(url, opts);
}

async function cloudLoad() {
  const res = await fetch(SERVER_URL + "/api/data", {credentials:"include"});
  if (!res.ok) throw new Error("Server error: " + res.status);
  return normalizeLoadedData(await res.json());
}

async function cloudSave(data, clientId) {
  const safeData=sanitizeClientData(data);
  const headers = {"Content-Type": "application/json"};
  if (clientId) headers["x-client-id"] = clientId;
  const res = await csrfFetch(SERVER_URL + "/api/data", {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(safeData),
  });
  if (!res.ok) {
    const problem=await res.json().catch(()=>({}));
    throw new Error(problem.error||("Не удалось сохранить изменения ("+res.status+")"));
  }
  const result = await res.json();
  return normalizeLoadedData(result.data || result);
}

// ── ИНКРЕМЕНТАЛЬНЫЕ СОХРАНЕНИЯ (точечные POST/DELETE) ──────────────
const INCR_TYPES = { project: "project", series: "series", task: "task", person: "person", role: "role", achievement: "achievement" };

async function incrSave(type, item) {
  // UI changes are saved once by the bulk queue, including deletions.
}

async function incrDelete(type, id) {
  // Individual API endpoints remain available to integrations.
}

// ── SEED ─────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h=>h.trim().toLowerCase());
  return lines.slice(1).map((line,idx)=>{
    const cols=[]; let cur="", inQ=false;
    for(const ch of line){
      if(ch==='"') inQ=!inQ;
      else if(ch===',' && !inQ){cols.push(cur.trim());cur="";}
      else cur+=ch;
    }
    cols.push(cur.trim());
    const obj={_id:idx};
    headers.forEach((h,i)=>{obj[h]=(cols[i]||"").replace(/^"|"$/g,"").trim();});
    return obj;
  }).filter(r=>r["проект"]&&r["серия"]&&r["кто"]);
}

function nsStatus(s){
  if(!s) return "";
  const l=s.trim().toLowerCase();
  return l==="цвет / звук"?"цвет/звук":l;
}

function makeDemoData(){
  const raw=parseCSV(DEMO_CSV);
  const tasks=raw.map((t,i)=>{
    const projId=NAME_TO_ID[t["проект"]]||t["проект"];
    const serName=t["серия"];
    const ser=DEMO_SERIES.find(s=>s.projectId===projId&&s.name===serName);
    return {
      id:i+1,
      project:projId,
      series:serName,
      seriesId:ser?ser.id:null,
      status:nsStatus(t["статус"]),
      person:t["кто"],
      day:t["день"],
      from:parseInt(t["с"])??10,
      to:parseInt(t["до"])??19,
      note:t["заметка / факт"]||"",
      unplanned:false, shifts_tail:false, autogenerated:false,
    };
  });
  return {roles:DEMO_ROLES, people:DEMO_PEOPLE, projects:DEMO_PROJECTS,
    series:DEMO_SERIES, tasks, stages:DEFAULT_STAGES, holidays:DEFAULT_HOLIDAYS};
}

function serializeExportData(data){return JSON.stringify(sanitizeClientData(data),null,2);}
function exportJSON(data){
  const blob=new Blob([serializeExportData(data)],{type:"application/json"});
  const a=document.createElement("a");
  const url=URL.createObjectURL(blob);
  a.href=url;
  a.download="tracker_backup_"+formatDate(new Date())+".json";
  a.click();
  URL.revokeObjectURL(url);
}

function taskHours(t){
  return Math.max(0,(Number(t?.to)||0)-(Number(t?.from)||0));
}
function shiftFactFromHours(hours){
  const h=Number(hours)||0;
  if(h>12) return Number((h/12).toFixed(2));
  if(h>=6) return 1;
  if(h>=3) return 0.5;
  if(h>=1) return 0.2;
  return 0;
}
function xlsEscape(v){
  return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function xlsFilePart(v){
  return String(v||"").replace(/[^0-9A-Za-zА-Яа-я._-]+/g,"_").replace(/^_+|_+$/g,"")||"all";
}
function downloadAnalyticsXls(tasks,data,stageMap,filters={}){
  const rows=(tasks||[]).filter(t=>!t.deleted&&!t.cancelled).slice().sort((a,b)=>
    daySort(a.day).localeCompare(daySort(b.day))||
    String(a.person||"").localeCompare(String(b.person||""),"ru")||
    String(projName(data.projects||[],a.project)).localeCompare(String(projName(data.projects||[],b.project)),"ru")||
    String(a.series||"").localeCompare(String(b.series||""),"ru")
  );
  if(!rows.length){alert("Нет данных для выгрузки");return;}
  const thStyle="background:#1f4e78;color:#ffffff;font-weight:700;border:1px solid #9e9e9e;padding:6px;";
  const tdStyle="border:1px solid #b7b7b7;padding:5px;mso-number-format:'\\@';";
  const headers=["Дата","ФИО","Вид работ","Проект","Выпуск","Задача факт (комментарий)","Смена факт"];
  const htmlRows=rows.map(t=>{
    const hours=taskHours(t);
    const fact=shiftFactFromHours(hours);
    const bg=fact>1?"#f4cccc":fact<1?"#fff2cc":"#ffffff";
    const proj=(data.projects||[]).find(p=>p.id===t.project);
    const stage=stageMap?.[t.status];
    const cells=[t.day||"",t.person||"",stage?.label||t.status||"",proj?.name||t.project||"",t.series||"",t.note||"",fact];
    const tds=cells.map((c,i)=>'<td style="'+tdStyle+(i===6?"mso-number-format:'0.00';":"")+'">'+xlsEscape(c)+'</td>').join("");
    return '<tr style="background:'+bg+'">'+tds+'</tr>';
  }).join("\n");
  const head=headers.map(h=>'<th style="'+thStyle+'">'+xlsEscape(h)+'</th>').join("");
  const html='<!doctype html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:11pt;} td,th{vertical-align:top;} .note{color:#666;font-size:10pt;}</style></head><body><table><thead><tr>'+head+'</tr></thead><tbody>'+htmlRows+'</tbody></table><br><div class="note">Желтый: меньше 1 смены. Красный: больше 1 смены. 1 смена = 6-12 ч; 0.5 = 3-6 ч; 0.2 = 1-3 ч; 0 = до 1 ч.</div></body></html>';
  const blob=new Blob(["\ufeff"+html],{type:"application/vnd.ms-excel;charset=utf-8"});
  const a=document.createElement("a");
  const url=URL.createObjectURL(blob);
  const from=xlsFilePart(filters.from||"all");
  const to=xlsFilePart(filters.to||"all");
  const project=xlsFilePart(filters.projectName||"all_projects");
  a.href=url;
  a.download="tracker_analytics_"+project+"_"+from+"_"+to+".xls";
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(onLoad){
  const inp=document.createElement("input");
  inp.type="file"; inp.accept=".json,application/json";
  inp.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const parsed=JSON.parse(ev.target.result);
        if(!parsed||typeof parsed!=="object"||!Array.isArray(parsed.projects)||!Array.isArray(parsed.tasks))
          {alert("Файл не похож на бэкап ПОСТ ТРЕКЕРА — ожидаются массивы projects и tasks");return;}
        onLoad(parsed);
      }catch{alert("Ошибка чтения файла — невалидный JSON");}
    };
    reader.onerror=()=>alert("Ошибка чтения файла");
    reader.readAsText(file);
  };
  inp.click();
}

function genId(arr){
  const nums=(arr||[]).map(x=>Number(x.id)).filter(Number.isFinite);
  return nums.length?Math.max(...nums)+1:1;
}
function genTaskId(arr){
  let id;
  do { id=Date.now()*1000+Math.floor(Math.random()*1000); }
  while((arr||[]).some(x=>String(x.id)===String(id)));
  return id;
}

// ── УТИЛИТЫ ──────────────────────────────────────────────────────────
function colorToBg(hex){
  if(!hex||hex.length<7) return "rgba(100,116,139,0.12)";
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},0.12)`;
}
function hexToRgba(hex,alpha=0.12){
  if(!hex||typeof hex!=="string"||hex.length<7) return `rgba(100,116,139,${alpha})`;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  if([r,g,b].some(Number.isNaN)) return `rgba(100,116,139,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}
function stageBg(hex){return (hex||"#64748b")+"33";}
function stageBorder(hex){return (hex||"#64748b")+"66";}


