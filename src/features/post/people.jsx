function PeopleView({data,conflictIds,onPersonSelect,canEdit,onUpdate,onLog,canEditProjectById}){
  const {stageMap}=useContext(StagesCtx);
  const [weekOffset,setWeekOffset]=useState(0);
  const [roleFilter,setRoleFilter]=useState("");
  const [query,setQuery]=useState("");
  const [taskModal,setTaskModal]=useState(null);
  const [hovTask,setHovTask]=useState(null);
  const [peopleContextMenu,setPeopleContextMenu]=useState(null);
  const dragTaskRef=useRef(null);
  const dragAbsenceRef=useRef(null);
  const [selectedPeopleTasks,setSelectedPeopleTasks]=useState(new Set());
  const [selectedPeopleAbsences,setSelectedPeopleAbsences]=useState(new Set());
  const [selectedPeopleNames,setSelectedPeopleNames]=useState(new Set());
  const [showSelectedPeopleOnly,setShowSelectedPeopleOnly]=useState(false);
  const roleMap=useMemo(()=>Object.fromEntries((data.roles||[]).map(r=>[r.id,r])),[data.roles]);
  const canWriteProject=projectId=>!canEditProjectById||canEditProjectById(projectId);
  function roleRank(role,id){
    const text=String((role?.label||"")+" "+(id||role?.id||"")).toLowerCase();
    if(text.includes("\u043c\u043e\u043d\u0442\u0430\u0436")||text.includes("\u0440\u0435\u0434\u0430\u043a\u0442\u043e\u0440")) return 10;
    if(text.includes("\u0432\u044b\u043f\u0443\u0441\u043a\u0430")) return 20;
    if(text.includes("\u0441\u0438\u043d\u0445")) return 30;
    if(text.includes("\u0437\u0432\u0443\u043a")) return 40;
    if(text.includes("\u0446\u0432\u0435\u0442")||text.includes("\u043a\u043e\u043b\u043e\u0440\u0438\u0441\u0442")) return 50;
    if(text.includes("\u043c\u0435\u043d\u0435\u0434\u0436")) return 900;
    return 100;
  }
  function primaryRoleId(person){const roles=Array.isArray(person?.roles)?person.roles:[];if(!roles.length)return "";return [...roles].sort((a,b)=>roleRank(roleMap[b],b)-roleRank(roleMap[a],a)||String(roleMap[a]?.label||a).localeCompare(String(roleMap[b]?.label||b),"ru"))[0]||"";}
  const refMonday=useMemo(()=>{const d=new Date();const wd=d.getDay()||7;d.setDate(d.getDate()-wd+1+weekOffset*7);d.setHours(0,0,0,0);return d;},[weekOffset]);
  const days=useMemo(()=>Array.from({length:14},(_,i)=>{const d=new Date(refMonday);d.setDate(refMonday.getDate()+i);return formatDate(d);}),[refMonday]);
  const todayStr=formatDate(new Date());
  const weekTitle=weekLabel(days[0]);
  const tasks=useMemo(()=>enrichTasks(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&days.includes(t.day)),[data.tasks,days]);
  const visibleRoles=useMemo(()=>[...(data.roles||[])].sort((a,b)=>roleRank(a,a.id)-roleRank(b,b.id)||String(a.label||a.id).localeCompare(String(b.label||b.id),"ru")),[data.roles]);
  const peopleTaskTemplates=useMemo(()=>["монтаж","синхра","цветокор","сведение_звука","правки"].map(status=>GANTT_TEMPLATES.find(t=>t.status===status)||{status,label:stageMap[status]?.label||status}).filter(Boolean),[stageMap]);
  const people=useMemo(()=>{const merged=new Map();(data.people||[]).forEach(p=>{if(p.active===false||p.deleted)return;const name=String(p.name||"").trim();if(!name)return;const key=name.toLowerCase();const roles=Array.isArray(p.roles)?p.roles:[];if(!merged.has(key)){merged.set(key,{...p,name,roles:[...roles]});return;}const prev=merged.get(key);merged.set(key,{...prev,...(!prev.id&&p.id?{id:p.id}:{}),name:prev.name||name,roles:[...new Set([...(prev.roles||[]),...roles])]});});const q=query.trim().toLowerCase();return Array.from(merged.values()).filter(p=>!showSelectedPeopleOnly||selectedPeopleNames.has(p.name)).filter(p=>{const roles=Array.isArray(p.roles)?p.roles:[];if(roleFilter&&!roles.includes(roleFilter))return false;if(q&&!String(p.name||"").toLowerCase().includes(q))return false;return true;}).sort((a,b)=>{const ar=primaryRoleId(a);const br=primaryRoleId(b);return roleRank(roleMap[ar],ar)-roleRank(roleMap[br],br)||String(a.name||"").localeCompare(String(b.name||""),"ru");});},[data.people,roleFilter,query,roleMap,showSelectedPeopleOnly,selectedPeopleNames]);
  const groupedPeople=useMemo(()=>{const idx={};people.forEach(p=>{const rid=primaryRoleId(p)||"__none";const role=roleMap[rid]||{id:rid,label:"\u0411\u0435\u0437 \u0440\u043e\u043b\u0438",color:"#64748b",order:999};if(!idx[rid])idx[rid]={role,people:[]};idx[rid].people.push(p);});return Object.values(idx).sort((a,b)=>roleRank(a.role,a.role.id)-roleRank(b.role,b.role.id)||String(a.role.label).localeCompare(String(b.role.label),"ru"));},[people,roleMap]);
  const taskMap=useMemo(()=>{const m={};tasks.forEach(t=>{const k=(t.person||"")+"||"+t.day;if(!m[k])m[k]=[];m[k].push(t);});Object.values(m).forEach(list=>list.sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)||projName(data.projects,a.project).localeCompare(projName(data.projects,b.project),"ru")));return m;},[tasks,data.projects]);
  const cellAbsences=(person,day)=>absencesForPersonDay(data.personAbsences||[],data.people||[],person.name,day);
  function daysBetweenIncl(start,end){const a=parseDate(start),b=parseDate(end);if(!a||!b)return[];const step=a<=b?1:-1;const out=[];let cur=formatDate(a);while(true){out.push(cur);if(cur===formatDate(b))break;cur=addDays(cur,step);}return out;}
  function personTasksOnDay(person,day){return taskMap[(person.name||person.personName||"")+"||"+day]||[];}
  function personHasTasksInRange(person,start,end){return daysBetweenIncl(start,end).some(d=>personTasksOnDay(person,d).length);}
  function personHasAbsenceInRange(person,start,end,ignoreId){return daysBetweenIncl(start,end).some(d=>cellAbsences(person,d).some(a=>String(a.id)!==String(ignoreId||"")));}
  function showAbsenceBlockedByTasks(type){alert(type==="dayoff"?"\u0427\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432\u044b\u0445\u043e\u0434\u043d\u043e\u0439, \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0441\u043c\u0435\u043d \u043d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c":"\u0427\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435, \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u0441\u043c\u0435\u043d \u043d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c");}
  function showAbsenceDuplicate(){alert("\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u0443\u0436\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435");}
  function shiftBlockedByAbsence(){alert("\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u043e \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435");}
  function addPersonAbsence(person,day,type){if(!canEdit||!onUpdate||!person||!day)return;if(personHasTasksInRange(person,day,day)){showAbsenceBlockedByTasks(type);return;}if(personHasAbsenceInRange(person,day,day)){showAbsenceDuplicate();return;}const ts=Date.now();const item=normalizeAbsence({id:"abs_"+ts+"_"+Math.random().toString(36).slice(2,7),personId:person.id||null,personName:person.name,type,startDay:day,endDay:day,note:"",createdAt:new Date(ts).toISOString(),updatedAt:new Date(ts).toISOString(),_updatedAt:ts});onUpdate("personAbsences",[...(data.personAbsences||[]),item]);onLog?.("\u041e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435: "+person.name+" / "+absenceTypeInfo(type).label+" / "+day);setPeopleContextMenu(null);}
  function dropPeopleTask(source,person,day,stretch,copy){if(!source||!person||!day||!onUpdate||!canWriteProject(source.project))return;const ts=Date.now();const stamp=t=>({...t,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""});let all=[...(data.tasks||[])];if(stretch){const start=parseDate(source.day),end=parseDate(day);if(!start||!end)return;const diff=Math.round((end-start)/(1000*60*60*24));if(diff===0){if(source.person===person.name)return;if(personHasAbsenceInRange(person,day,day)){shiftBlockedByAbsence();return;}const changed=stamp({...source,day,person:person.name});onUpdate("tasks",all.map(t=>String(t.id)===String(source.id)?changed:t));return;}const step=diff>=0?1:-1;const checkFrom=diff>0?addDays(source.day,1):day;const checkTo=diff>0?day:addDays(source.day,-1);if(personHasAbsenceInRange(person,checkFrom,checkTo)){shiftBlockedByAbsence();return;}const copies=[];for(let i=step;step>0?i<=diff:i>=diff;i+=step){copies.push(stamp({...source,id:"task_"+ts+"_"+Math.abs(i)+"_"+Math.random().toString(36).slice(2,5),day:addDays(source.day,i),person:person.name}));}if(copies.length)onUpdate("tasks",[...all,...copies]);return;}if(personHasAbsenceInRange(person,day,day)){shiftBlockedByAbsence();return;}if(copy){const nt=stamp({...source,id:"task_"+ts+"_"+Math.random().toString(36).slice(2,7),day,person:person.name});onUpdate("tasks",[...all,nt]);return;}const changed=stamp({...source,day,person:person.name});onUpdate("tasks",all.map(t=>String(t.id)===String(source.id)?changed:t));}
  function openTemplateTask(status,person,day){if(!canEdit||!onUpdate)return;if(personHasAbsenceInRange(person,day,day)){shiftBlockedByAbsence();return;}setTaskModal({person:person.name,day,status,from:10,to:19,_fixedPerson:true});}
  function openNewTask(person,day){openTemplateTask("",person,day);}
  function saveTask(task){if(!onUpdate||!canWriteProject(task.project))return;const taskPerson=(data.people||[]).find(p=>p.name===task.person)||{name:task.person};if(task.person&&task.day&&personHasAbsenceInRange(taskPerson,task.day,task.day)){shiftBlockedByAbsence();return;}if(task.id){const old=(data.tasks||[]).find(t=>String(t.id)===String(task.id));if(old&&!canWriteProject(old.project))return;}let all=[...(data.tasks||[])];let saved;if(task._cascadeAll){const clean={...task};delete clean._cascadeAll;delete clean._fixedPerson;all=task._cascadeAll.map(t=>String(t.id)===String(clean.id)?clean:t);saved=all.find(t=>String(t.id)===String(clean.id))||{...clean,id:genTaskId(data.tasks||[])};if(!all.some(t=>String(t.id)===String(saved.id)))all.push(saved);}else{const clean={...task};delete clean._fixedPerson;const exists=clean.id&&all.find(t=>String(t.id)===String(clean.id));saved=exists?clean:{...clean,id:genTaskId(data.tasks||[])};all=exists?all.map(t=>String(t.id)===String(saved.id)?saved:t):[...all,saved];}const ts=Date.now();saved={...saved,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""};all=all.map(t=>String(t.id)===String(saved.id)?saved:t);onUpdate("tasks",all);const stLabel=(data.stages||[]).find(st=>st.id===saved.status)?.label||saved.status||"";onLog?.("Смена: "+stLabel+" ? "+(saved.series||"")+" / "+(saved.person||"без исполнителя")+" ? "+saved.day);incrSave("task",saved);setTaskModal(null);}
  function deleteTask(id){const t=(data.tasks||[]).find(x=>String(x.id)===String(id));if(t&&!canWriteProject(t.project))return;const ts=Date.now();onUpdate?.("tasks",(data.tasks||[]).map(x=>String(x.id)===String(id)?{...x,deleted:true,_updatedAt:ts}:x));if(t)onLog?.("Удалена смена: "+(t.series||"")+" / "+(t.person||"")+" ? "+t.day);incrDelete("task",id);setTaskModal(null);}
  function deletePeopleTasks(ids){const allowed=(ids||[]).filter(id=>{const t=(data.tasks||[]).find(x=>String(x.id)===String(id));return t&&canWriteProject(t.project);});if(!allowed.length)return;const idSet=new Set(allowed.map(String));const ts=Date.now();const changed=[];const all=(data.tasks||[]).map(t=>{if(!idSet.has(String(t.id)))return t;const nt={...t,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts};changed.push(nt);return nt;});onUpdate?.("tasks",all);changed.forEach(t=>incrDelete("task",t.id));setSelectedPeopleTasks(new Set());setPeopleContextMenu(null);}
  function deletePersonAbsence(id){if(!id||!onUpdate)return;const ts=Date.now();onUpdate("personAbsences",(data.personAbsences||[]).map(a=>String(a.id)===String(id)?{...a,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts}:a));setPeopleContextMenu(null);}
  function deletePeopleAbsences(ids){if(!ids?.length&&!ids?.size)return;const idSet=new Set([...ids].map(String));const ts=Date.now();onUpdate?.("personAbsences",(data.personAbsences||[]).map(a=>idSet.has(String(a.id))?{...a,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts}:a));setSelectedPeopleAbsences(new Set());setPeopleContextMenu(null);}
  function dropPersonAbsence(source,person,day,stretch,copy){if(!source||!person||!day||!onUpdate)return;const ts=Date.now();const all=[...(data.personAbsences||[])];const start=source.startDay||source.day;const end=source.endDay||start;const len=Math.max(0,Math.round((parseDate(end)-parseDate(start))/(1000*60*60*24)));const stamp=a=>normalizeAbsence({...a,updatedAt:new Date(ts).toISOString(),_updatedAt:ts});const blocked=(from,to,ignoreId)=>{if(personHasTasksInRange(person,from,to)){showAbsenceBlockedByTasks(source.type);return true;}if(personHasAbsenceInRange(person,from,to,ignoreId)){showAbsenceDuplicate();return true;}return false;};if(stretch){const from=daySort(start)<=daySort(day)?start:day;const to=daySort(start)<=daySort(day)?day:start;if(blocked(from,to,source.id))return;const updated=stamp({...source,personId:person.id||"",personName:person.name,startDay:from,endDay:to});onUpdate("personAbsences",all.map(a=>String(a.id)===String(source.id)?updated:a));return;}const targetEnd=addDays(day,len);if(blocked(day,targetEnd,copy?null:source.id))return;if(copy){const item=stamp({...source,id:"abs_"+ts+"_"+Math.random().toString(36).slice(2,7),personId:person.id||"",personName:person.name,startDay:day,endDay:targetEnd,deleted:false});onUpdate("personAbsences",[...all,item]);return;}const moved=stamp({...source,personId:person.id||"",personName:person.name,startDay:day,endDay:targetEnd});onUpdate("personAbsences",all.map(a=>String(a.id)===String(source.id)?moved:a));}
  useEffect(()=>{const h=e=>{if(e.key==="Escape"){setQuery("");setRoleFilter("");setTaskModal(null);setPeopleContextMenu(null);setSelectedPeopleTasks(new Set());setSelectedPeopleAbsences(new Set());setSelectedPeopleNames(new Set());setShowSelectedPeopleOnly(false);}if((e.key==="Delete"||e.key==="Backspace")&&(selectedPeopleTasks.size||selectedPeopleAbsences.size)){e.preventDefault();if(selectedPeopleTasks.size)deletePeopleTasks([...selectedPeopleTasks]);else deletePeopleAbsences([...selectedPeopleAbsences]);}};const close=()=>setPeopleContextMenu(null);document.addEventListener("keydown",h);window.addEventListener("click",close);window.addEventListener("scroll",close,true);return()=>{document.removeEventListener("keydown",h);window.removeEventListener("click",close);window.removeEventListener("scroll",close,true);};},[selectedPeopleTasks,selectedPeopleAbsences]);
  const freeCount=people.reduce((sum,p)=>sum+days.filter(d=>!(taskMap[p.name+"||"+d]||[]).length&&!cellAbsences(p,d).length).length,0);
  const absenceCount=people.reduce((sum,p)=>sum+days.filter(d=>cellAbsences(p,d).length).length,0);
  return <div>
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:12}}><Btn small variant="ghost" onClick={()=>setWeekOffset(w=>w-1)}>← Неделя</Btn><Btn small variant="ghost" onClick={()=>setWeekOffset(0)}>Сегодня</Btn><Btn small variant="ghost" onClick={()=>setWeekOffset(w=>w+1)}>Неделя →</Btn><div style={{fontSize:14,fontWeight:900,color:"#93c5fd",marginLeft:6}}>Неделя {weekTitle}</div><div style={{fontSize:10,color:"#64748b",marginLeft:"auto"}}>{tasks.length} смен ? {freeCount} свободных ? {absenceCount} отсутствий</div></div>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}><Inp value={query} onChange={setQuery} placeholder="Поиск человека..." style={{maxWidth:220}}/><Btn small variant={showSelectedPeopleOnly?"primary":"ghost"} disabled={!selectedPeopleNames.size} onClick={()=>setShowSelectedPeopleOnly(v=>!v)}>{showSelectedPeopleOnly?"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435\u0445":"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0445"}</Btn><button onClick={()=>setRoleFilter("")} style={{padding:"4px 10px",borderRadius:999,border:"1px solid "+(!roleFilter?"#3b82f6":"#334155"),background:!roleFilter?"rgba(59,130,246,.2)":"transparent",color:!roleFilter?"#bfdbfe":"#64748b",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}>Все роли</button>{visibleRoles.map(r=><button key={r.id} onClick={()=>setRoleFilter(roleFilter===r.id?"":r.id)} style={{padding:"4px 10px",borderRadius:999,border:"1px solid "+(roleFilter===r.id?(r.color||"#3b82f6"):"#334155"),background:roleFilter===r.id?((r.color||"#3b82f6")+"22"):"transparent",color:roleFilter===r.id?(r.color||"#93c5fd"):"#64748b",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}>{r.label||r.id}</button>)}{canEdit&&<div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}><span style={{fontSize:10,color:"#64748b",fontWeight:900}}>{"\u0417\u0430\u0433\u043e\u0442\u043e\u0432\u043a\u0438"}</span>{ABSENCE_TYPES.map(t=><button key={t.id} type="button" draggable onDragStart={e=>{dragAbsenceRef.current={templateType:t.id};e.dataTransfer.effectAllowed="copy";e.dataTransfer.setData("text/plain",t.id);}} onDragEnd={()=>{dragAbsenceRef.current=null;}} style={{height:22,padding:"2px 8px",borderRadius:8,border:"1px solid "+t.color+"99",borderLeft:"4px solid "+t.color,background:hexToRgba(t.color,.14),color:t.color,fontSize:10,cursor:"grab",fontFamily:"inherit",fontWeight:900,lineHeight:1}}>{t.label}</button>)}{peopleTaskTemplates.map(t=>{const st=stageMap[t.status]||{};const color=st.color||"#60a5fa";return <button key={t.status} type="button" draggable onDragStart={e=>{dragTaskRef.current={templateStatus:t.status};e.dataTransfer.effectAllowed="copy";e.dataTransfer.setData("text/plain",t.status);}} onDragEnd={()=>{dragTaskRef.current=null;}} style={{height:22,padding:"2px 8px",borderRadius:8,border:"1px solid "+color+"99",borderLeft:"4px solid "+color,background:hexToRgba(color,.14),color,fontSize:10,cursor:"grab",fontFamily:"inherit",fontWeight:900,lineHeight:1}}>{t.label}</button>;})}</div>}</div>
    <div style={{overflowX:"auto",border:"1px solid rgba(148,163,184,.18)",borderRadius:14,background:"rgba(15,23,42,.36)"}}><div style={{display:"grid",gridTemplateColumns:"220px repeat(14,minmax(92px,1fr))",minWidth:1510}}><div style={{position:"sticky",left:0,zIndex:3,background:"#111c2e",borderBottom:"1px solid #334155",padding:"10px 12px",fontSize:10,color:"#94a3b8",fontWeight:900}}>СОТРУДНИК</div>{days.map(d=>{const pd=parseDate(d);const isToday=d===todayStr;return <div key={d} style={{borderBottom:"1px solid #334155",borderLeft:"1px solid rgba(148,163,184,.14)",padding:"8px 10px",background:isToday?"rgba(59,130,246,.18)":"#111c2e"}}><div style={{fontSize:10,color:isToday?"#7dd3fc":"#94a3b8",fontWeight:900}}>{WDAYS[pd.getDay()]} {String(pd.getDate()).padStart(2,"0")}.{String(pd.getMonth()+1).padStart(2,"0")}</div></div>;})}{groupedPeople.map(group=><React.Fragment key={group.role.id}><div style={{gridColumn:"1 / -1",background:"rgba(30,41,59,.78)",borderTop:"1px solid rgba(148,163,184,.16)",borderBottom:"1px solid rgba(148,163,184,.12)",padding:"7px 12px",display:"flex",alignItems:"center",gap:8}}><span style={{width:8,height:8,borderRadius:999,background:group.role.color||"#64748b"}}/><span style={{fontSize:10,color:group.role.color||"#94a3b8",fontWeight:900,letterSpacing:.5}}>{group.role.label}</span><span style={{fontSize:8,color:"#64748b"}}>{group.people.length}</span></div>{group.people.map(person=><React.Fragment key={person.id||person.name}><div onClick={e=>{if(e.shiftKey){e.preventDefault();e.stopPropagation();setSelectedPeopleNames(prev=>{const n=new Set(prev);n.has(person.name)?n.delete(person.name):n.add(person.name);return n;});}}} onDoubleClick={()=>onPersonSelect?.(person.id||person.name)} style={{position:"sticky",left:0,zIndex:2,background:selectedPeopleNames.has(person.name)?"rgba(59,130,246,.22)":"#0f172a",borderTop:"1px solid rgba(148,163,184,.12)",padding:"10px 12px",display:"flex",alignItems:"center",gap:9,cursor:onPersonSelect?"pointer":"default"}}><div style={{width:26,height:26,borderRadius:999,display:"flex",alignItems:"center",justifyContent:"center",background:(group.role.color||"#64748b")+"22",border:"1px solid "+(group.role.color||"#64748b")+"66",color:group.role.color||"#94a3b8",fontWeight:900,fontSize:12}}>{String(person.name||"?")[0]}</div><div style={{minWidth:0}}><div style={{fontSize:12,color:"#e2e8f0",fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{person.name}</div><div style={{fontSize:8,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{(Array.isArray(person.roles)?person.roles:[]).map(r=>roleMap[r]?.label||r).join(", ")||"без роли"}</div></div></div>{days.map(day=>{const list=taskMap[person.name+"||"+day]||[];const abs=cellAbsences(person,day);const free=!list.length&&!abs.length;const primaryAbs=abs[0]?absenceTypeInfo(abs[0].type):null;const past=daySort(day)<daySort(todayStr);const bg=free?(past?"rgba(250,204,21,.018)":"rgba(250,204,21,.045)"):primaryAbs?(primaryAbs.color+"14"):"rgba(15,23,42,.56)";const border=free?(past?"rgba(250,204,21,.08)":"rgba(250,204,21,.18)"):primaryAbs?(primaryAbs.color+"66"):"rgba(148,163,184,.12)";const tip=[...abs.map(a=>absenceTypeInfo(a.type).label+(a.note?": "+a.note:"")),...list.map(t=>{const p=data.projects.find(p=>p.id===t.project);const st=stageMap[t.status]||{};return ((p?.name||p?.abbr||t.project||"")+(t.series?" / "+t.series:"")+(t.status?" / "+(st.label||t.status):"")+" "+(t.from||"")+"-"+(t.to||"")).trim();})].join("\n");return <div key={person.name+day} title={tip||"Свободен"} onDoubleClick={()=>openNewTask(person,day)} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setPeopleContextMenu({x:Math.min(e.clientX,Math.max(8,window.innerWidth-230)),y:Math.min(e.clientY,Math.max(8,window.innerHeight-168)),person,day});}} onDragOver={e=>{if(dragTaskRef.current||dragAbsenceRef.current)e.preventDefault();}} onDrop={e=>{e.preventDefault();e.stopPropagation();const d=dragTaskRef.current;const a=dragAbsenceRef.current;dragTaskRef.current=null;dragAbsenceRef.current=null;if(d){if(d.templateStatus)openTemplateTask(d.templateStatus,person,day);else dropPeopleTask(d.task,person,day,e.shiftKey||d.shift,e.altKey||d.alt);}if(a){if(a.templateType)addPersonAbsence(person,day,a.templateType);else dropPersonAbsence(a.absence,person,day,e.shiftKey||a.shift,e.altKey||a.alt);}}} style={{minHeight:54,borderTop:"1px solid rgba(148,163,184,.12)",borderLeft:"1px solid rgba(148,163,184,.08)",background:bg,boxShadow:"inset 0 0 0 1px "+border,padding:3,cursor:canEdit?"cell":"default"}}>{abs.map(a=>{const ai=absenceTypeInfo(a.type);const isAbsSel=selectedPeopleAbsences.has(a.id);return <div key={a.id} draggable={canEdit} onClick={e=>{e.stopPropagation();setSelectedPeopleAbsences(prev=>{const n=new Set(prev);if(e.shiftKey||e.ctrlKey||e.metaKey){n.has(a.id)?n.delete(a.id):n.add(a.id);}else{n.clear();n.add(a.id);}return n;});}} onDragStart={e=>{e.stopPropagation();dragAbsenceRef.current={absence:a,alt:e.altKey,shift:e.shiftKey};e.dataTransfer.effectAllowed=(e.altKey||e.shiftKey)?"copy":"move";e.dataTransfer.setData("text/plain",String(a.id));}} onDragEnd={()=>{dragAbsenceRef.current=null;}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setPeopleContextMenu({x:Math.min(e.clientX,Math.max(8,window.innerWidth-230)),y:Math.min(e.clientY,Math.max(8,window.innerHeight-168)),person,day,absence:a});}} style={{minHeight:list.length?22:46,height:list.length?22:"calc(100% - 2px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:ai.color,border:"1px solid "+(isAbsSel?ai.color:ai.color+"88"),background:isAbsSel?("linear-gradient(135deg,"+hexToRgba(ai.color,.38)+","+hexToRgba(ai.color,.16)+")"):("linear-gradient(135deg,"+ai.color+"24,"+ai.color+"0f)"),boxShadow:isAbsSel?("0 0 0 2px "+hexToRgba(ai.color,.28)):undefined,borderRadius:9,padding:"2px 6px",marginBottom:2,fontWeight:900,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:canEdit?"grab":"default"}}>{ai.label}</div>;})}{list.map(t=>{const proj=data.projects.find(p=>p.id===t.project);const st=stageMap[t.status]||{};const c=st.color||proj?.color||"#64748b";const hasC=conflictIds.has(t.id);const isSel=selectedPeopleTasks.has(t.id);return <button key={t.id} draggable={canEdit&&canWriteProject(t.project)} onDragStart={e=>{dragTaskRef.current={task:t,alt:e.altKey,shift:e.shiftKey};e.dataTransfer.effectAllowed=(e.altKey||e.shiftKey)?"copy":"move";e.dataTransfer.setData("text/plain",String(t.id));}} onDragEnd={()=>{dragTaskRef.current=null;}} onMouseEnter={e=>setHovTask({task:t,rect:e.currentTarget.getBoundingClientRect()})} onMouseLeave={()=>setHovTask(null)} onClick={e=>{e.stopPropagation();if(e.shiftKey||e.ctrlKey||e.metaKey){setSelectedPeopleTasks(prev=>{const n=new Set(prev);n.has(t.id)?n.delete(t.id):n.add(t.id);return n;});return;}setTaskModal(t);}} onContextMenu={e=>{e.preventDefault();e.stopPropagation();const ids=selectedPeopleTasks.has(t.id)&&selectedPeopleTasks.size>1?[...selectedPeopleTasks]:[t.id];setSelectedPeopleTasks(new Set(ids));setPeopleContextMenu({x:Math.min(e.clientX,Math.max(8,window.innerWidth-230)),y:Math.min(e.clientY,Math.max(8,window.innerHeight-168)),person,day,task:t,ids});}} style={{display:"block",width:"100%",textAlign:"left",background:hasC?"rgba(239,68,68,.14)":isSel?"rgba(59,130,246,.26)":"rgba(30,41,59,.86)",border:"1px solid "+(hasC?"rgba(239,68,68,.55)":isSel?"rgba(96,165,250,.9)":c+"66"),borderLeft:"3px solid "+c,borderRadius:8,padding:"5px 6px",marginBottom:3,cursor:"grab",fontFamily:"inherit"}}><div style={{display:"flex",gap:4,alignItems:"center",minWidth:0}}><span style={{fontSize:8,color:c,fontWeight:900,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj?.abbr||proj?.name||t.project||"Проект"}</span><span style={{fontSize:8,color:"#94a3b8",marginLeft:"auto",whiteSpace:"nowrap"}}>{t.from}-{t.to}</span></div><div style={{fontSize:8,color:"#e2e8f0",fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.series||"-"} ? {st.label||t.status}</div></button>;})}{free&&<div style={{fontSize:8,color:past?"#8a7a28":"#c6a91a",fontWeight:800,opacity:past?.42:.68}}>Свободен</div>}</div>;})}</React.Fragment>)}</React.Fragment>)}</div></div>
    {peopleContextMenu&&(()=>{const menuItem={display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",color:"#dbeafe",padding:"8px 10px",fontSize:12,fontWeight:800,cursor:"pointer",borderRadius:9,fontFamily:"inherit"};const danger={...menuItem,color:"#fecaca"};const types=[{id:"dayoff",label:"\u0412\u044b\u0445\u043e\u0434\u043d\u043e\u0439"},{id:"vacation",label:"\u041e\u0442\u043f\u0443\u0441\u043a"},{id:"sick",label:"\u0411\u043e\u043b\u044c\u043d\u0438\u0447\u043d\u044b\u0439"}];return <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left:peopleContextMenu.x,top:peopleContextMenu.y,zIndex:2147483200,width:220,background:"linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98))",border:"1px solid rgba(148,163,184,.28)",borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.55)",padding:6}}>{peopleContextMenu.task&&<><div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>{peopleContextMenu.ids?.length===1?"1 \u0441\u043c\u0435\u043d\u0430":(peopleContextMenu.ids?.length||1)+" \u0441\u043c\u0435\u043d"}</div><button type="button" style={menuItem} onClick={()=>{setTaskModal(peopleContextMenu.task);setPeopleContextMenu(null);}}>{"\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u043c\u0435\u043d\u0443"}</button><button type="button" style={danger} onClick={()=>deletePeopleTasks(peopleContextMenu.ids||[peopleContextMenu.task.id])}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</button></>}{peopleContextMenu.absence&&<><div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>{absenceTypeInfo(peopleContextMenu.absence.type).label}</div><button type="button" style={danger} onClick={()=>deletePersonAbsence(peopleContextMenu.absence.id)}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</button></>}{!peopleContextMenu.task&&!peopleContextMenu.absence&&<><div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>{"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435"}</div>{types.map(a=><button key={a.id} type="button" style={menuItem} onClick={()=>addPersonAbsence(peopleContextMenu.person,peopleContextMenu.day,a.id)}>{a.label}</button>)}</>}</div>;})()}
    {people.length===0&&<div style={{fontSize:13,color:"#64748b",padding:"18px 0"}}>Люди не найдены</div>}
    {hovTask&&<TaskTooltip task={hovTask.task} rect={hovTask.rect} projects={data.projects}/>} {taskModal&&<TaskModal task={taskModal} data={data} onSave={saveTask} onDelete={deleteTask} onClose={()=>setTaskModal(null)} canEdit={canEdit&&(!taskModal.project||canWriteProject(taskModal.project))} canEditOldTasks canEditProjectById={canEditProjectById}/> }
  </div>;
}

function PeopleViewLegacy({data,conflictIds,onPersonSelect,canEdit}){
  const [selPeople,setSelPeople]=useState([]);
  const [filterProject,setFilterProject]=useState("");
  const [groupBy,setGroupBy]=useState("day");
  const [hovTask,setHovTask]=useState(null);
  const tasks=useMemo(()=>enrichTasks(data.tasks),[data.tasks]);
  const people=useMemo(()=>[...new Set(tasks.map(t=>t.person).filter(Boolean))].filter(p=>data.people.some(dp=>dp.name===p)).sort(),[tasks,data.people]);
  const containerRef=useRef(null);

  useEffect(()=>{
    const h=(e)=>{if(e.key==="Escape") setSelPeople([]);};
    document.addEventListener("keydown",h);
    return ()=>document.removeEventListener("keydown",h);
  },[]);
  useEffect(()=>{const t=setTimeout(scrollToToday,150);return()=>clearTimeout(t);},[]);

  function togglePerson(name){
    setSelPeople(prev=>prev.includes(name)?prev.filter(p=>p!==name):[...prev,name]);
  }

  const baseTasks=useMemo(()=>{
    let r=tasks;
    if(filterProject) r=r.filter(t=>t.project===filterProject);
    return r;
  },[tasks,filterProject]);

  const showPeople=selPeople.length?selPeople:people;

  function scrollToToday(){
    if(!containerRef.current) return;
    const today=formatDate(new Date());
    const el=containerRef.current.querySelector(`[data-day="${today}"]`);
    if(el) el.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  }

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={()=>setSelPeople([])}
          style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
            borderColor:selPeople.length===0?"#3b82f6":"#334155",
            background:selPeople.length===0?"rgba(59,130,246,0.2)":"transparent",
            color:selPeople.length===0?"#93c5fd":"#64748b"}}>
          все
        </button>
        {people.map(p=>{
          const active=selPeople.includes(p);
          const hasConflict=tasks.some(t=>t.person===p&&conflictIds.has(t.id));
          return (
            <button key={p} onClick={()=>togglePerson(p)}
              style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
                borderColor:active?"#3b82f6":"#334155",
                background:active?"rgba(59,130,246,0.2)":"transparent",
                color:active?"#93c5fd":"#64748b"}}>
              {p}{hasConflict&&<span style={{width:5,height:5,borderRadius:"50%",background:"#ef4444",display:"inline-block",marginLeft:4}}/>}
            </button>
          );
        })}
        <span style={{color:"#263352",margin:"0 4px"}}>│</span>
        {[["day","Дни"],["week","Нед"],["month","Мес"]].map(([v,l])=>(
          <button key={v} onClick={()=>setGroupBy(v)}
            style={{padding:"3px 10px",borderRadius:4,border:"1px solid",cursor:"pointer",fontSize:10,
              borderColor:groupBy===v?"#475569":"#263352",background:groupBy===v?"#334155":"transparent",
              color:groupBy===v?"#cbd5e1":"#475569"}}>{l}</button>
        ))}
        <Btn small variant="ghost" onClick={scrollToToday}>→ Сегодня</Btn>
        {selPeople.length>0&&<span style={{fontSize:11,color:"#475569"}}>ESC — снять выделение</span>}
      </div>

      <div ref={containerRef} style={{display:"flex",flexDirection:"column",gap:20}}>
        {showPeople.map(person=>{
          const pTasks=baseTasks.filter(t=>t.person===person);
          if(!pTasks.length) return null;
          const cDays=[...new Set(pTasks.filter(t=>conflictIds.has(t.id)).map(t=>t._dayKey))];
          const groups={};
          pTasks.forEach(t=>{
            const k=groupBy==="week"?t._weekKey:groupBy==="month"?t._monthKey:t._dayKey;
            if(!groups[k]) groups[k]=[];
            groups[k].push(t);
          });
          const pInfo=data.people.find(p=>p.name===person);
          return (
            <div key={person}>
              <div
                onDoubleClick={()=>onPersonSelect&&onPersonSelect(pInfo?.id||person)}
                style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,
                  cursor:onPersonSelect?"pointer":"default"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#1e293b",
                  border:"2px solid #3b82f6",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:13,fontWeight:700,color:"#3b82f6"}}>
                  {person[0]}
                </div>
                <span style={{fontSize:15,fontWeight:700}}>{person}</span>
                {onPersonSelect&&<span style={{fontSize:10,color:"#334155",marginLeft:2}}>2× клик → профиль</span>}
                {cDays.length>0&&(
                  <span style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.4)",
                    borderRadius:12,padding:"2px 10px",fontSize:11,color:"#f87171"}}>
                    ⚡ конфликты: {cDays.map(d=>dayLabel(d)).join(", ")}
                  </span>
                )}
              </div>
              <div style={{display:"grid",
                gridTemplateColumns:`repeat(${Math.min(Object.keys(groups).length,7)},1fr)`,gap:6}}>
                {Object.entries(groups).sort(([a],[b])=>daySort(a).localeCompare(daySort(b))).map(([gk,gtasks])=>{
                  const hasC=gtasks.some(t=>conflictIds.has(t.id));
                  const label=groupBy==="day"?dayLabel(gk):groupBy==="week"?`Нед ${weekLabel(gtasks[0].day)}`:`${MONTHS[parseInt(gk.split("-")[1])-1]}`;
                  return (
                    <div key={gk} data-day={groupBy==="day"?gk:undefined}
                      style={{background:hasC?"rgba(239,68,68,0.05)":"#1e293b",
                        border:`1px solid ${hasC?"rgba(239,68,68,0.35)":"#334155"}`,
                        borderRadius:12,padding:"8px 10px",minHeight:60}}>
                      <div style={{fontSize:9,color:hasC?"#f87171":"#475569",marginBottom:5,letterSpacing:0.5}}>
                        {label}{hasC&&" ⚡"}
                      </div>
                      {gtasks.map(t=><TaskCard key={t.id} task={t} projects={data.projects} isConflict={conflictIds.has(t.id)} large onHover={(t,r)=>setHovTask(t?{task:t,rect:r}:null)}/>)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {hovTask&&<TaskTooltip task={hovTask.task} rect={hovTask.rect} projects={data.projects}/>}
    </div>
  );
}

// ── КОНФЛИКТЫ ────────────────────────────────────────────────────────
function ConflictsView({details,data}){
  const today=new Date(); today.setHours(0,0,0,0);
  const todayStr=formatDate(today);
  const in7=new Date(today); in7.setDate(today.getDate()+7);
  const in7Str=formatDate(in7);

  const unfilledTasks=useMemo(()=>
    data.tasks.filter(t=>!t.person&&daySort(t.day)>=daySort(todayStr)&&daySort(t.day)<=daySort(in7Str)&&t.status!=="съёмки")
      .sort((a,b)=>daySort(a.day).localeCompare(daySort(b.day))||a.status.localeCompare(b.status)),
  [data.tasks,todayStr,in7Str]);

  const overlapDetails=details.filter(d=>d.type==="overlap"||!d.type);
  const roleDetails=details.filter(d=>d.type==="role");
  const absenceDetails=details.filter(d=>d.type==="absence");
  const passiveDetails=details.filter(d=>d.notify===false);

  const byDay={};
  overlapDetails.forEach(c=>{if(!byDay[c.dayStr]) byDay[c.dayStr]=[];byDay[c.dayStr].push(c);});

  const hasAnything=details.length>0||unfilledTasks.length>0;
  if(!hasAnything) return (
    <div style={{textAlign:"center",padding:"60px 20px",color:"#475569"}}>
      <div style={{fontSize:40,marginBottom:12}}>OK</div>
      <div style={{fontSize:16,fontWeight:700,color:"#94a3b8"}}>Всё в порядке</div>
      <div style={{fontSize:13,marginTop:6}}>Конфликтов нет, все смены на 7 дней заполнены</div>
    </div>
  );
  return (
    <div>
      {/* Незаполненные смены */}
      {unfilledTasks.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.35)",
              borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flex:1}}>
              <span style={{fontSize:18}}>!</span>
              <span style={{fontWeight:700,color:"#fb923c",fontSize:14}}>Без исполнителя: {unfilledTasks.length}</span>
              <span style={{color:"#64748b",fontSize:12}}>смены на 7 дней без назначенного сотрудника</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {unfilledTasks.map(t=>{
              const proj=data.projects.find(p=>p.id===t.project);
              const isToday=t.day===todayStr;
              const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
              const tomorrowStr=formatDate(tomorrow);
              const isUrgent=daySort(t.day)<=daySort(tomorrowStr);
              return (
                <div key={t.id} style={{background:"#1e293b",
                  border:`1px solid ${isUrgent?"rgba(249,115,22,0.4)":"#334155"}`,
                  borderLeft:`3px solid ${isUrgent?"#f97316":"#475569"}`,
                  borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{minWidth:70,fontSize:11,fontWeight:700,
                    color:isToday?"#f97316":isUrgent?"#fb923c":"#64748b"}}>
                    {isToday?"Сегодня":dayLabel(t.day)}
                  </div>
                  <ProjectMark project={proj} size={8}/>
                  <div style={{fontWeight:600,fontSize:12,color:"#e2e8f0"}}>
                    {proj?.name||t.project} · {t.series}
                  </div>
                  <StatusBadge s={t.status} small/>
                  <div style={{marginLeft:"auto",fontSize:11,color:"#475569"}}>{fmtHour(t.from)}–{fmtHour(t.to)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Отсутствия */}
      {absenceDetails.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.32)",
            borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:18}}>!</span>
            <span style={{fontWeight:700,color:"#fca5a5",fontSize:14}}>Смена в отсутствие: {absenceDetails.length}</span>
            <span style={{color:"#64748b",fontSize:12}}>человек отмечен как выходной / отпуск / болезнь</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {absenceDetails.map(c=>{
              const proj=data.projects.find(p=>p.id===c.task.project);
              const ai=absenceTypeInfo(c.absence.type);
              return (
                <div key={c.key} style={{background:"#1e293b",border:"1px solid "+ai.color+"55",borderLeft:"3px solid "+ai.color,
                  borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{minWidth:70,fontSize:11,fontWeight:700,color:ai.color}}>{dayLabel(c.task.day)}</div>
                  <ProjectMark project={proj} size={8}/>
                  <div style={{fontWeight:600,fontSize:12,color:"#e2e8f0"}}>{proj?.name||c.task.project} · {c.task.series}</div>
                  <StatusBadge s={c.task.status} small/>
                  <div style={{fontSize:12,color:"#f8fafc",fontWeight:700}}>{c.person}</div>
                  <span style={{fontSize:11,color:ai.color,border:"1px solid "+ai.color+"66",background:ai.color+"18",borderRadius:999,padding:"2px 8px",fontWeight:800}}>{ai.label}</span>
                  <div style={{fontSize:11,color:"#64748b",marginLeft:"auto"}}>{c.absence.startDay}{c.absence.endDay&&c.absence.endDay!==c.absence.startDay?" - "+c.absence.endDay:""}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Несоответствие ролей */}
      {roleDetails.length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:18}}>🚫</span>
            <span style={{fontWeight:700,color:"#f87171",fontSize:14}}>Несоответствие ролей: {roleDetails.length}</span>
            <span style={{color:"#64748b",fontSize:12}}>назначен специалист без нужной роли</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {roleDetails.map(c=>{
              const proj=data.projects.find(p=>p.id===c.task.project);
              return (
                <div key={c.key} style={{background:"#1e293b",
                  border:"1px solid rgba(239,68,68,0.3)",borderLeft:"3px solid #ef4444",
                  borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <div style={{minWidth:70,fontSize:11,fontWeight:700,color:"#64748b"}}>{dayLabel(c.task.day)}</div>
                  <ProjectMark project={proj} size={8}/>
                  <div style={{fontWeight:600,fontSize:12,color:"#e2e8f0"}}>{proj?.name||c.task.project} · {c.task.series}</div>
                  <StatusBadge s={c.task.status} small/>
                  <div style={{fontSize:12,color:"#f87171",fontWeight:600}}>{c.person}</div>
                  <div style={{fontSize:11,color:"#475569",marginLeft:"auto"}}>
                    нужно: <span style={{color:"#94a3b8"}}>{c.requiredRoles.join(", ")}</span>
                    {" · "}есть: <span style={{color:"#94a3b8"}}>{c.personRoles.join(", ")||"—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Пересечения смен */}
      {overlapDetails.length>0&&(
      <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,flex:1}}>
          <span style={{fontSize:18}}>⚡</span>
          <span style={{fontWeight:700,color:"#f87171",fontSize:14}}>Пересечений: {overlapDetails.length}</span>
          <span style={{color:"#64748b",fontSize:12}}>один человек — несколько задач в пересекающееся время</span>
        </div>
      </div>
      {Object.entries(byDay).sort(([a],[b])=>daySort(a).localeCompare(daySort(b))).map(([day,pairs])=>(
        <div key={day} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:700,color:"#f87171"}}>{dayLabel(day)}</span>
            <div style={{flex:1,height:1,background:"rgba(239,68,68,0.2)"}}/>
          </div>
          {pairs.map((p,i)=>{
            const colorA=projColor(data.projects,p.taskA.project);
            const colorB=projColor(data.projects,p.taskB.project);
            const minT=8,maxT=22,range=maxT-minT;
            const pct=v=>`${((v-minT)/range)*100}%`;
            return (
              <div key={i} style={{background:"#1e293b",border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:12,padding:"12px 16px",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:10,background:"#0f172a",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:800,fontSize:12,color:"#ef4444",border:"1px solid rgba(239,68,68,0.4)"}}>
                    {p.person[0]}
                  </div>
                  <span style={{fontWeight:700,fontSize:13}}>{p.person}</span>
                  <span style={{color:"#64748b",fontSize:11}}>
                    — пересечение {p.overlapFrom}:00–{p.overlapTo}:00 ({p.overlapTo-p.overlapFrom}ч)
                  </span>
                </div>
                <div style={{position:"relative",height:46,marginBottom:10}}>
                  {[8,10,12,14,16,18,20,22].map(h=>(
                    <div key={h} style={{position:"absolute",left:pct(h),top:0,bottom:0,
                      borderLeft:"1px solid #1e293b",pointerEvents:"none"}}>
                      <span style={{position:"absolute",bottom:0,fontSize:8,color:"#334155",paddingLeft:2}}>{h}</span>
                    </div>
                  ))}
                  {[{t:p.taskA,c:colorA,top:4},{t:p.taskB,c:colorB,top:24}].map(({t,c,top})=>(
                    <div key={t.id} style={{position:"absolute",
                      left:pct(t.from||0),width:`${((t.to-t.from)/range)*100}%`,
                      top,height:16,background:c,borderRadius:3,opacity:0.9,
                      display:"flex",alignItems:"center",paddingLeft:4,overflow:"hidden"}}>
                      <span style={{fontSize:8,color:"#fff",fontWeight:700,whiteSpace:"nowrap"}}>
                        {projName(data.projects,t.project)} {t.series}
                      </span>
                    </div>
                  ))}
                  <div style={{position:"absolute",left:pct(p.overlapFrom),
                    width:`${((p.overlapTo-p.overlapFrom)/range)*100}%`,
                    top:0,height:46,background:"rgba(239,68,68,0.12)",
                    border:"1px solid rgba(239,68,68,0.35)",borderRadius:3}}/>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>
      )}

      {passiveDetails.length>0&&(
        <div style={{marginTop:24}}>
          <div style={{background:"rgba(148,163,184,0.08)",border:"1px solid rgba(148,163,184,0.22)",
            borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:18}}>i</span>
            <span style={{fontWeight:700,color:"#94a3b8",fontSize:14}}>{"\u0411\u0435\u0437 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u044f"}: {passiveDetails.length}</span>
            <span style={{color:"#64748b",fontSize:12}}>{"\u043d\u0435 \u0433\u043e\u0440\u0438\u0442 \u0432 \u0441\u0447\u0435\u0442\u0447\u0438\u043a\u0435, \u043d\u043e \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u044f"}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {passiveDetails.map(c=>{
              if(c.type==="long-shift"){
                const t=c.task||{};
                const proj=(data.projects||[]).find(p=>p.id===t.project);
                return (
                  <div key={c.key} style={{background:"#1e293b",border:"1px solid rgba(248,113,113,0.22)",borderLeft:"3px solid #f87171",
                    borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:10,fontSize:12}}>
                    <span style={{color:"#94a3b8",minWidth:78}}>{dayLabel(t.day)}</span>
                    <ProjectMark project={proj} size={8}/>
                    <span style={{fontWeight:700,color:"#e2e8f0"}}>{proj?.name||t.project||"—"}</span>
                    <span style={{color:"#94a3b8"}}>{t.series||"—"}</span>
                    <StatusBadge s={t.status} small/>
                    <span style={{color:"#cbd5e1",marginLeft:"auto"}}>{t.person||"без исполнителя"}</span>
                    <span style={{color:"#fca5a5",fontWeight:700}}>длинная смена: {Number(c.hours||0).toFixed(1)} ч</span>
                  </div>
                );
              }
              if(c.type==="project-manager"){
                const proj=c.project;
                return (
                  <div key={c.key} style={{background:"#1e293b",border:"1px solid rgba(148,163,184,0.2)",borderLeft:"3px solid #64748b",
                    borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                    <ProjectMark project={proj} size={8}/>
                    <div style={{fontWeight:700,fontSize:12,color:"#e2e8f0"}}>{proj?.name||proj?.id}</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{"\u043f\u0440\u043e\u0435\u043a\u0442 \u0431\u0435\u0437 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0430"}</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── АНАЛИТИКА ────────────────────────────────────────────────────────
