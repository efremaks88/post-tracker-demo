function ChangelogModal({entries,onClose}){
  function fmtTs(ts){
    const d=new Date(ts);
    const pad=n=>String(n).padStart(2,"0");
    return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return (
    <Modal title="История изменений" onClose={onClose}>
      {!entries.length?(
        <div style={{padding:"24px 0",textAlign:"center",color:"#475569",fontSize:13}}>
          Изменений пока нет
        </div>
      ):(
        <div style={{maxHeight:480,overflowY:"auto",display:"flex",flexDirection:"column",gap:1}}>
          {entries.map((e,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"7px 4px",
              borderBottom:"1px solid #1e293b",alignItems:"flex-start"}}>
              <span style={{fontSize:11,color:"#475569",whiteSpace:"nowrap",flexShrink:0,marginTop:1}}>
                {fmtTs(e.ts)}
              </span>
              <span style={{fontSize:13,color:"#cbd5e1"}}>{e.text}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
      </div>
    </Modal>
  );
}

// ── СМЕНЫ НА ДЕНЬ ────────────────────────────────────────────────────
function DayShiftsModal({data,onClose}){
  const {stageMap}=useContext(StagesCtx);
  const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const [targetDay,setTargetDay]=useState(formatDate(tomorrow));
  const [copied,setCopied]=useState(false);

  const shifts=useMemo(()=>{
    const tasks=data.tasks.filter(t=>t.day===targetDay&&t.person)
      .sort((a,b)=>a.from-b.from);
    const byPerson={};
    tasks.forEach(t=>{
      if(!byPerson[t.person]) byPerson[t.person]=[];
      byPerson[t.person].push(t);
    });
    return Object.entries(byPerson).sort(([a],[b])=>a.localeCompare(b))
      .map(([person,tasks])=>({person,tasks}));
  },[data.tasks,targetDay]);

  const pd=parseDate(targetDay);
  const dateLabel=pd?`${WDAYS_LONG[pd.getDay()]}, ${targetDay}`:"—";

  function buildText(){
    let s=` Смены — ${dateLabel}\n${"─".repeat(32)}\n\n`;
    if(!shifts.length){s+="Смен нет\n";return s;}
    shifts.forEach(({person,tasks})=>{
      const totalH=tasks.reduce((acc,t)=>(Number(t.to)||0)-(Number(t.from)||0)+acc,0);
      s+=`👤 ${person}  (${totalH}ч)\n`;
      tasks.forEach(t=>{
        const proj=data.projects.find(p=>p.id===t.project);
        const st=stageMap[t.status];
        s+=`   • ${proj?.name||t.project}  ${t.series}  ·  ${st?.label||t.status}  ·  ${fmtHour(t.from)}–${fmtHour(t.to)}`;
        if(canSeeTaskNotes()&&t.note) s+=`  — ${t.note}`;
        s+="\n";
      });
      s+="\n";
    });
    return s;
  }

  function copyText(){
    navigator.clipboard.writeText(buildText()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  }

  return (
    <Modal title="Смены на день" onClose={onClose} wide>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
        <InpDate value={targetDay} onChange={setTargetDay}/>
        <span style={{fontSize:13,color:"#64748b"}}>{pd?WDAYS_LONG[pd.getDay()]:""}</span>
        <div style={{flex:1}}/>
        <Btn variant="ghost" small onClick={copyText}>{copied?"OK Скопировано":" Копировать текст"}</Btn>
        <Btn variant="ghost" small onClick={()=>window.print()}>🖨 Печать</Btn>
      </div>

      {shifts.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:"#475569",fontSize:14}}>
          На этот день смен нет
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {shifts.map(({person,tasks})=>{
            const totalH=tasks.reduce((acc,t)=>(Number(t.to)||0)-(Number(t.from)||0)+acc,0);
            const pInfo=data.people.find(p=>p.name===person);
            const roleId=pInfo?.roles?.[0];
            const role=roleId?data.roles.find(r=>r.id===roleId):null;
            return (
              <div key={person} style={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"10px 16px",background:"#1e293b",display:"flex",alignItems:"center",gap:10,
                  borderBottom:"1px solid #334155"}}>
                  <div style={{width:34,height:34,borderRadius:"50%",
                    background:`${role?.color||"#3b82f6"}22`,border:`2px solid ${role?.color||"#3b82f6"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:800,color:role?.color||"#3b82f6"}}>
                    {person[0]}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{person}</div>
                    {role&&<div style={{fontSize:11,color:role.color}}>{role.label}</div>}
                  </div>
                  <div style={{marginLeft:"auto",fontSize:12,color:"#64748b"}}>
                    {totalH} ч · {tasks.length} {tasks.length===1?"задача":tasks.length<=4?"задачи":"задач"}
                  </div>
                </div>
                {tasks.map((t,ti)=>{
                  const proj=data.projects.find(p=>p.id===t.project);
                  const st=stageMap[t.status];
                  return (
                    <div key={t.id} style={{padding:"10px 16px",
                      borderBottom:ti<tasks.length-1?"1px solid #1e293b":"none",
                      display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:3,alignSelf:"stretch",borderRadius:2,
                        background:proj?.color||"#334155",flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                          <span style={{fontWeight:600,fontSize:13}}>{proj?.name||t.project}</span>
                          <span style={{fontSize:11,color:"#475569"}}>· {t.series}</span>
                          {st&&<span style={{fontSize:10,background:`${st.color}22`,color:st.color,
                            border:`1px solid ${st.color}44`,borderRadius:4,padding:"1px 7px",fontWeight:600}}>
                            {st.abbr||st.label}
                          </span>}
                        </div>
                        {canSeeTaskNotes()&&t.note&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{t.note}</div>}
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",flexShrink:0}}>
                        {fmtHour(t.from)}–{fmtHour(t.to)}
                        <span style={{fontSize:10,color:"#475569",marginLeft:4}}>
                          ({fmtDur(t.from,t.to)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ── ПЕРСОНА ──────────────────────────────────────────────────────────
function PersonCard({personId,data,onBack,onUpdatePeople,canEditBirthday,canEditAbsences}){
  const {stageMap}=useContext(StagesCtx);
  const [tab,setTab]=useState("load");
  const person=useMemo(()=>data.people.find(p=>p.id===personId)||data.people.find(p=>p.name===personId),[data.people,personId]);
  const personName=person?.name||personId;
  const [birthdayEdit,setBirthdayEdit]=useState(false);
  const [birthdayDraft,setBirthdayDraft]=useState(person?.birthday||"");
  const [absenceDraft,setAbsenceDraft]=useState({type:"dayoff",startDay:formatDate(new Date()),endDay:formatDate(new Date()),note:""});
  const [loadMonthOffset,setLoadMonthOffset]=useState(0);
  useEffect(()=>setBirthdayDraft(person?.birthday||""),[person?.birthday]);
  const roleMap=useMemo(()=>Object.fromEntries(data.roles.map(r=>[r.id,r])),[data.roles]);
  const todayStr=formatDate(new Date());
  const tasks=useMemo(()=>
    data.tasks.filter(t=>t.person===personName&&!t.deleted&&!t.cancelled).sort((a,b)=>daySort(a.day).localeCompare(daySort(b.day)))
  ,[data.tasks,personName]);
  const futureTasks=useMemo(()=>tasks.filter(t=>daySort(t.day)>=daySort(todayStr)),[tasks,todayStr]);
  const pastTasks=useMemo(()=>[...tasks.filter(t=>daySort(t.day)<daySort(todayStr))].reverse().slice(0,50),[tasks,todayStr]);
  const doneAndTodayTasks=useMemo(()=>tasks.filter(t=>daySort(t.day)<=daySort(todayStr)),[tasks,todayStr]);
  const roleColor=person?.roles?.[0]?roleMap[person.roles[0]]?.color||"#3b82f6":"#3b82f6";
  const totalHrs=doneAndTodayTasks.reduce((s,t)=>s+(Number(t.to)-Number(t.from)),0);
  const avgHrsW=personWeeklyHours(tasks,todayStr,12);
  const activeProjs=new Set(futureTasks.map(t=>t.project)).size;
  const stageCounts={};
  doneAndTodayTasks.forEach(t=>{stageCounts[t.status]=(stageCounts[t.status]||0)+1;});
  const topSt=Object.entries(stageCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const todayPersonTasks=useMemo(()=>tasks.filter(t=>t.day===todayStr).sort((a,b)=>Number(a.from)-Number(b.from)),[tasks,todayStr]);
  const projectStats=useMemo(()=>{
    const m={};
    doneAndTodayTasks.forEach(t=>{if(!t.project)return;if(!m[t.project])m[t.project]={id:t.project,count:0,hours:0};m[t.project].count++;m[t.project].hours+=Number(t.to)-Number(t.from);});
    return Object.values(m).sort((a,b)=>b.count-a.count||b.hours-a.hours);
  },[doneAndTodayTasks]);
  const topProjects=projectStats.slice(0,5);
  const projectBadges=projectStats.map(ps=>data.projects.find(p=>p.id===ps.id)).filter(Boolean);
  const achievementMetrics=useMemo(()=>buildAchievementMetrics(doneAndTodayTasks,projectStats,stageMap,data,person),[doneAndTodayTasks,projectStats,stageMap]);
  const achievements=useMemo(()=>earnedAchievements(data,achievementMetrics),[data,achievementMetrics]);
  const personAbsences=useMemo(()=>(data.personAbsences||[]).filter(a=>!a.deleted&&absencePersonMatches(a,person||{id:personId,name:personName})).sort((a,b)=>daySort(a.startDay).localeCompare(daySort(b.startDay))),[data.personAbsences,person,personId,personName]);
  const birthdayNorm=normalizeBirthday(person?.birthday);
  const birthdayDiff=birthdayDiffDays(birthdayNorm);
  function saveBirthdayFromCard(){
    if(!canEditBirthday||!onUpdatePeople||!person) return;
    const bd=normalizeBirthday(birthdayDraft);
    if(bd===null){alert("День рождения укажите в формате ДД.ММ");return;}
    onUpdatePeople("people",(data.people||[]).map(p=>p.id===person.id?{...p,birthday:bd}:p));
    setBirthdayEdit(false);
  }
  function saveAbsenceFromCard(){
    if(!canEditAbsences||!onUpdatePeople||!person) return;
    if(!absenceDraft.startDay){alert("Укажите дату начала");return;}
    const start=absenceDraft.startDay;
    const end=absenceDraft.endDay||start;
    if(daySort(end)<daySort(start)){alert("Дата окончания раньше начала");return;}
    const ts=Date.now();
    const item=normalizeAbsence({
      id:"abs_"+ts+"_"+Math.random().toString(36).slice(2,7),
      personId:person.id||"",
      personName:person.name||personName,
      type:absenceDraft.type,
      startDay:start,
      endDay:end,
      note:absenceDraft.note,
      updatedAt:new Date(ts).toISOString(),
      _updatedAt:ts,
    });
    onUpdatePeople("personAbsences",[...(data.personAbsences||[]),item]);
    setAbsenceDraft(f=>({...f,note:""}));
  }
  function removeAbsenceFromCard(id){
    if(!canEditAbsences||!onUpdatePeople) return;
    const ts=Date.now();
    onUpdatePeople("personAbsences",(data.personAbsences||[]).map(a=>a.id===id?{...a,deleted:true,updatedAt:new Date(ts).toISOString(),_updatedAt:ts}:a));
  }

  const loadCalendar=useMemo(()=>{
    const monthStart=d=>new Date(d.getFullYear(),d.getMonth(),1);
    const addMonths=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,1);
    const today=new Date();today.setHours(0,0,0,0);
    const cur=addMonths(monthStart(today),loadMonthOffset);
    const daysInMonth=new Date(cur.getFullYear(),cur.getMonth()+1,0).getDate();
    const offset=(cur.getDay()+6)%7;
    const days=[];
    for(let i=0;i<offset;i++)days.push(null);
    for(let day=1;day<=daysInMonth;day++){
      const dt=new Date(cur.getFullYear(),cur.getMonth(),day);
      const ds=formatDate(dt);
      const dayTasks=tasks.filter(t=>t.day===ds);
      const hrs=dayTasks.reduce((sum,t)=>sum+(Number(t.to)-Number(t.from)),0);
      const absences=personAbsences.filter(a=>daySort(ds)>=daySort(a.startDay)&&daySort(ds)<=daySort(a.endDay||a.startDay));
      days.push({ds,day,hrs,tasks:dayTasks,absences,isToday:ds===todayStr});
    }
    while(days.length%7)days.push(null);
    return [{key:String(cur.getFullYear())+"-"+String(cur.getMonth()+1).padStart(2,"0"),label:(MONTHS[cur.getMonth()]||"")+" "+cur.getFullYear(),days}];
  },[tasks,personAbsences,todayStr,loadMonthOffset]);
  const loadCalendarMaxHrs=Math.max(1,...loadCalendar.flatMap(m=>m.days.map(c=>c?.hrs||0)));
  const loadMonth=loadCalendar[0];


  const tabS={display:"inline-flex",background:"#0f172a",borderRadius:10,border:"1px solid #334155",overflow:"hidden",marginBottom:20};
  const tabBtn=(id,lbl)=>(
    <button key={id} onClick={()=>setTab(id)} style={{padding:"6px 16px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",
      background:tab===id?"#3b82f6":"transparent",color:tab===id?"#fff":"#64748b",fontWeight:tab===id?700:400}}>{lbl}</button>
  );
  const TD={padding:"8px 12px",fontSize:13,borderBottom:"1px solid #1e293b"};

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <Btn variant="ghost" small onClick={onBack}>← Назад</Btn>
        <div style={{width:44,height:44,borderRadius:"50%",background:roleColor+"22",
          border:`2px solid ${roleColor}`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:18,fontWeight:800,color:roleColor}}>{personName[0]}</div>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>{personName}</div>
          <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
            {(person?.roles||[]).map(r=>{const rl=roleMap[r];const rk2 = typeof r === "string" ? r : (r.id || JSON.stringify(r)); return(
              <span key={rk2} style={{fontSize:10,background:"transparent",color:rl?.color||"#64748b",
                border:`1.5px solid ${rl?.color||"#64748b"}`,borderRadius:3,padding:"1px 6px"}}>{rl?.label||r}</span>
            );})}
            {person?.active===false&&<span style={{fontSize:10,color:"#475569",marginLeft:4}}>неактивен</span>}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:18}}>
        <div className={`ppt-birthday-card ${birthdayDiff===0?"ppt-birthday-today":""}`}>
          <div className="ppt-birthday-kicker">ДЕНЬ РОЖДЕНИЯ</div>
          {birthdayEdit?(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Inp value={birthdayDraft} onChange={setBirthdayDraft} placeholder="ДД.ММ" style={{maxWidth:100}}/>
              <Btn small variant="primary" onClick={saveBirthdayFromCard}>OK</Btn>
              <Btn small variant="ghost" onClick={()=>{setBirthdayEdit(false);setBirthdayDraft(person?.birthday||"");}}>×</Btn>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span className={birthdayNorm?"ppt-birthday-profile-value":"ppt-birthday-empty"}>{birthdayNorm?`ДР ${birthdayNorm}`:"не указан"}</span>
              {birthdayNorm&&birthdayDiff!=null&&<span className={birthdayDiff<=7?"ppt-birthday-profile-when":"ppt-birthday-profile-when ppt-birthday-muted"}>· {birthdayWhenText(birthdayDiff)}</span>}
              {canEditBirthday&&<Btn small variant="ghost" onClick={()=>setBirthdayEdit(true)}>Изм</Btn>}
            </div>
          )}
        </div>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:6}}>СЕГОДНЯ</div>
          {todayPersonTasks.length?todayPersonTasks.map(t=>{
            const proj=data.projects.find(p=>p.id===t.project);
            return <div key={t.id} style={{display:"flex",gap:7,alignItems:"center",fontSize:12,marginBottom:4}}>
              <span style={{width:7,height:7,borderRadius:2,background:proj?.color||"#64748b",flexShrink:0}}/>
              <span style={{color:"#e2e8f0",fontWeight:700}}>{proj?.abbr||proj?.name||t.project}</span>
              <span style={{color:"#64748b"}}>{t.series}</span>
              <StatusBadge s={t.status} small/>
            </div>;
          }):<div style={{fontSize:13,color:"#475569"}}>Сегодня задач нет</div>}
        </div>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:6}}>ПРОЕКТНЫЕ НАШИВКИ</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {projectBadges.length?projectBadges.map(p=><span key={p.id} title={p.name} style={{fontSize:10,color:p.color,border:`1px solid ${p.color}66`,background:`${p.color}22`,borderRadius:999,padding:"2px 7px",fontWeight:700}}>{p.abbr||p.name}</span>):<span style={{fontSize:13,color:"#475569"}}>пока нет</span>}
          </div>
        </div>
      </div>
      <div style={tabS}>
        {tabBtn("load","Загрузка")}
        {tabBtn("current","Текущие задачи")}
        {tabBtn("history","История")}
        {tabBtn("stats","Статистика")}
      </div>

      {tab==="load"&&(
        <div>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12,marginBottom:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:12,color:"#93c5fd",fontWeight:900,letterSpacing:.4}}>КАЛЕНДАРЬ ЗАГРУЗКИ</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{loadMonth?.label||""} · {loadMonth?.days.filter(c=>c?.tasks.length).length||0} дн. · {loadMonth?.days.reduce((sum,c)=>sum+(c?.hrs||0),0)||0} ч · {loadMonth?.days.filter(c=>c?.absences.length).length||0} отсутствий</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Btn variant="ghost" small onClick={()=>setLoadMonthOffset(v=>v-1)}>?</Btn>
              <Btn variant="ghost" small onClick={()=>setLoadMonthOffset(0)}>Сегодня</Btn>
              <Btn variant="ghost" small onClick={()=>setLoadMonthOffset(v=>v+1)}>?</Btn>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"minmax(320px,520px)",gap:12,alignItems:"start"}}>
            {loadCalendar.map(month=>(
              <div key={month.key} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:10,boxShadow:"0 12px 30px rgba(0,0,0,.12)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:13,color:"#e2e8f0",fontWeight:900}}>{month.label}</div>
                  <div style={{fontSize:10,color:"#64748b"}}>{month.days.filter(c=>c?.tasks.length).length} дн.</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
                  {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d=><div key={d} style={{fontSize:9,color:"#64748b",textAlign:"center",fontWeight:800}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {month.days.map((cell,idx)=>{
                    if(!cell)return <div key={idx} style={{minHeight:52,borderRadius:8,background:"rgba(15,23,42,.18)"}}/>;
                    const intensity=Math.min(1,cell.hrs/loadCalendarMaxHrs);
                    const primaryAbs=cell.absences[0]?absenceTypeInfo(cell.absences[0].type):null;
                    const hasAbs=Boolean(primaryAbs);
                    const bg=hasAbs?(primaryAbs.color+"18"):(cell.hrs?("rgba(99,102,241,"+(0.13+intensity*.25)+")"):"rgba(15,23,42,.58)");
                    const border=cell.isToday?"#38bdf8":(hasAbs?(primaryAbs.color+"88"):(cell.hrs?"rgba(129,140,248,.5)":"rgba(148,163,184,.14)"));
                    const details=[...cell.tasks.map(t=>{const p=data.projects.find(p=>p.id===t.project);const st=stageMap[t.status]||{};return ((p?.name||p?.abbr||t.project||"")+(t.series?" / "+t.series:"")+(t.status?" / "+(st.label||t.status):"")+" "+(t.from||"")+"-"+(t.to||"")).trim();}),...cell.absences.map(a=>absenceTypeInfo(a.type).label+(a.note?": "+a.note:""))].join("\n");
                    return <button key={cell.ds} type="button" title={details||cell.ds}
                      onClick={()=>canEditAbsences&&setAbsenceDraft(f=>({...f,startDay:cell.ds,endDay:cell.ds}))}
                      style={{minHeight:52,borderRadius:8,border:"1px solid "+border,background:bg,color:"#e2e8f0",padding:"4px 4px",textAlign:"left",fontFamily:"inherit",cursor:canEditAbsences?"pointer":"default",boxShadow:cell.isToday?"0 0 0 1px rgba(56,189,248,.35)":"none",overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:3}}>
                        <span style={{fontSize:12,color:cell.isToday?"#7dd3fc":"#94a3b8",fontWeight:900}}>{cell.day}</span>
                        {cell.hrs>0&&<span style={{fontSize:10,color:"#cbd5e1",fontWeight:800}}>{cell.hrs}ч</span>}
                      </div>
                      <div style={{display:"flex",gap:2,flexWrap:"wrap",marginTop:4,minHeight:8}}>
                        {cell.absences.slice(0,2).map(a=>{const ai=absenceTypeInfo(a.type);return <span key={a.id} style={{fontSize:8,lineHeight:"12px",height:12,borderRadius:4,padding:"0 3px",background:ai.color+"22",border:"1px solid "+ai.color+"77",color:ai.color,fontWeight:900}}>{ai.short}</span>;})}
                        {cell.tasks.slice(0,3).map(t=>{const st=stageMap[t.status]||{};return <span key={t.id} style={{width:9,height:9,borderRadius:3,background:st.color||roleColor,display:"inline-block",marginTop:2}}/>;})}
                      </div>
                    </button>;
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:18,background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontSize:12,color:"#93c5fd",fontWeight:900,letterSpacing:.4}}>ОТСУТСТВИЯ</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:2}}>выходной, отпуск, болезнь</div>
              </div>
            </div>
            {canEditAbsences&&<div style={{display:"grid",gridTemplateColumns:"160px 140px 140px 1fr auto",gap:8,alignItems:"end",marginBottom:14}}>
              <Field label="Тип"><Sel value={absenceDraft.type} onChange={v=>setAbsenceDraft(f=>({...f,type:v}))} options={ABSENCE_TYPES.map(a=>({value:a.id,label:a.label}))}/></Field>
              <Field label="С"><InpDate value={absenceDraft.startDay} onChange={v=>setAbsenceDraft(f=>({...f,startDay:v,endDay:f.endDay||v}))}/></Field>
              <Field label="По"><InpDate value={absenceDraft.endDay} onChange={v=>setAbsenceDraft(f=>({...f,endDay:v}))}/></Field>
              <Field label="Комментарий"><Inp value={absenceDraft.note} onChange={v=>setAbsenceDraft(f=>({...f,note:v}))} placeholder="необязательно"/></Field>
              <Btn variant="primary" onClick={saveAbsenceFromCard}>Добавить</Btn>
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {personAbsences.length?personAbsences.map(a=>{
                const ai=absenceTypeInfo(a.type);
                return <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,background:"#0f172a",border:"1px solid "+ai.color+"44",borderLeft:"3px solid "+ai.color,borderRadius:10,padding:"9px 12px"}}>
                  <span style={{fontSize:11,color:ai.color,fontWeight:900,minWidth:70}}>{ai.label}</span>
                  <span style={{fontSize:13,color:"#e2e8f0",fontWeight:700}}>{a.startDay}{a.endDay&&a.endDay!==a.startDay?" - "+a.endDay:""}</span>
                  {a.note&&<span style={{fontSize:12,color:"#64748b"}}>{a.note}</span>}
                  {canEditAbsences&&<button onClick={()=>removeAbsenceFromCard(a.id)} style={{marginLeft:"auto",background:"transparent",border:"1px solid rgba(248,113,113,.35)",color:"#fca5a5",borderRadius:8,padding:"3px 7px",cursor:"pointer"}}>Удалить</button>}
                </div>;
              }):<div style={{fontSize:13,color:"#64748b"}}>Отсутствий нет</div>}
            </div>
          </div>
        </div>
      )}

      {tab==="current"&&(
        <div style={{display:"flex",flexDirection:"column",gap:2}}>
          {futureTasks.length===0?(
            <div style={{color:"#475569",padding:"40px 0",textAlign:"center",fontSize:13}}>Нет предстоящих задач</div>
          ):(()=>{
            const byDay={};
            futureTasks.forEach(t=>{if(!byDay[t.day])byDay[t.day]=[];byDay[t.day].push(t);});
            return Object.entries(byDay).sort(([a],[b])=>daySort(a).localeCompare(daySort(b))).map(([day,dt])=>(
              <div key={day} style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:"#64748b",padding:"6px 0 4px",
                  borderBottom:"1px solid #1e293b",marginBottom:4,letterSpacing:0.5}}>
                  {dayLabel(day)}
                </div>
                {dt.map(t=><TaskCard key={t.id} task={t} projects={data.projects}/>)}
              </div>
            ));
          })()}
        </div>
      )}

      {tab==="history"&&(
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,overflow:"hidden"}}>
          {pastTasks.length===0?(
            <div style={{color:"#475569",padding:"40px 0",textAlign:"center",fontSize:13}}>Нет истории</div>
          ):(
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#0f172a"}}>
                  {["Дата","Проект","Серия","Этап","Часов","Заметка"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,color:"#64748b",
                      letterSpacing:1,borderBottom:"1px solid #334155",fontWeight:600,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pastTasks.map((t,i)=>{
                  const proj=data.projects.find(p=>p.id===t.project);
                  return (
                    <tr key={t.id} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                      <td style={{...TD,color:"#94a3b8"}}>{dayLabel(t.day)}</td>
                      <td style={TD}><span style={{color:proj?.color||"#94a3b8"}}>{proj?.abbr||proj?.name||t.project}</span></td>
                      <td style={{...TD,color:"#64748b"}}>{t.series}</td>
                      <td style={TD}><StatusBadge s={t.status} small/></td>
                      <td style={{...TD,color:"#94a3b8"}}>{(Number(t.to)-Number(t.from))}ч</td>
                      <td style={{...TD,color:"#475569",fontSize:12}}>{canSeeTaskNotes()?(t.note||"—"):"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab==="stats"&&(
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[{l:"ЗАПИСЕЙ",v:doneAndTodayTasks.length},{l:"ПЛАН, Ч",v:totalHrs},
            {l:"СЕЙЧАС В ПРОЕКТАХ",v:activeProjs||"—"},{l:"ПЛАН Ч/НЕД · 12 НЕД",v:avgHrsW.toFixed(1)}
          ].map(({l,v})=>(
            <div key={l} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>{l}</div>
              <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0"}}>{v}</div>
            </div>
          ))}
          {topSt&&stageMap[topSt]&&(
            <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>ЧАЩЕ ВСЕГО</div>
              <StatusBadge s={topSt}/>
              <div style={{fontSize:11,color:"#475569",marginTop:4}}>{stageCounts[topSt]} задач</div>
            </div>
          )}
          <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:260,flex:"1 1 260px"}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>БОЛЬШЕ ВСЕГО РАБОТАЛ НА</div>
            {topProjects.length?topProjects.map(ps=>{const proj=data.projects.find(p=>p.id===ps.id);return(
              <div key={ps.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <ProjectMark project={proj} size={8}/>
                <span style={{fontSize:12,color:"#e2e8f0",fontWeight:700,flex:1}}>{proj?.name||ps.id}</span>
                <span style={{fontSize:11,color:"#64748b"}}>{ps.count} смен</span>
              </div>
            );}):<div style={{fontSize:13,color:"#475569"}}>Пока нет истории по проектам</div>}
          </div>
          <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:260,flex:"1 1 260px"}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>АЧИВКИ</div>
            {achievements.length?(
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {achievements.map(a=><span key={a.id} title={`${a.description||a.title}: ${a.value}/${a.threshold}`} style={{fontSize:11,color:a.color,border:`1px solid ${a.color}66`,background:`${a.color}22`,borderRadius:999,padding:"4px 9px",fontWeight:800,display:"inline-flex",alignItems:"center",gap:5}}>
                  {a.image?<img src={a.image} alt="" style={{width:16,height:16,borderRadius:"50%",objectFit:"cover"}}/>:<span>{a.icon||"?"}</span>}
                  <span>{a.title}</span>
                </span>)}
              </div>
            ):<div style={{fontSize:13,color:"#475569"}}>Ачивки появятся по мере истории</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── СЕГОДНЯ ──────────────────────────────────────────────────────────
function TodayView({data,conflictDetails,onNavigateConflicts,canEdit}){
  const {stageMap}=useContext(StagesCtx);
  const today=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);
  const todayStr=useMemo(()=>formatDate(today),[today]);
  const tomorrowStr=useMemo(()=>formatDate(new Date(today.getTime()+86400000)),[today]);
  const datStr=useMemo(()=>formatDate(new Date(today.getTime()+2*86400000)),[today]);
  const in7Str=useMemo(()=>formatDate(new Date(today.getTime()+7*86400000)),[today]);

  const todayTasks=useMemo(()=>data.tasks.filter(t=>!t.deleted&&!t.cancelled&&t.day===todayStr),[data.tasks,todayStr]);
  const tmrTasks=useMemo(()=>data.tasks.filter(t=>!t.deleted&&!t.cancelled&&t.day===tomorrowStr),[data.tasks,tomorrowStr]);
  const datTasks=useMemo(()=>data.tasks.filter(t=>!t.deleted&&!t.cancelled&&t.day===datStr),[data.tasks,datStr]);

  const deadlines=useMemo(()=>{
    const items=[];
    (data.series||[]).forEach(ser=>{
      const proj=data.projects.find(p=>p.id===ser.projectId);
      if(!proj) return;
      getSeriesMilestoneEvents(ser,proj).forEach(m=>{
        const d=m.date;
        if(d&&daySort(d)>=daySort(todayStr)&&daySort(d)<=daySort(in7Str))
          items.push({ser,proj,date:d,type:m.label,color:m.color});
      });
    });
    return items.sort((a,b)=>daySort(a.date).localeCompare(daySort(b.date)));
  },[data.series,data.projects,todayStr,in7Str]);

  const busyNames=useMemo(()=>new Set(todayTasks.map(t=>t.person).filter(Boolean)),[todayTasks]);
  const freePeople=useMemo(()=>data.people.filter(p=>p.active!==false&&!busyNames.has(p.name)),[data.people,busyNames]);
  const birthdayItems=useMemo(()=>upcomingBirthdays(data.people,today,7),[data.people,today]);
  const notifyConflicts=useMemo(()=>conflictDetails.filter(d=>d.notify!==false),[conflictDetails]);

  function groupByProj(tasks){
    const m={};tasks.forEach(t=>{if(t.deleted||t.cancelled)return;if(!m[t.project])m[t.project]=[];m[t.project].push(t);});
    return Object.entries(m);
  }
  function groupTodayTasks(tasks){
    const m={};
    (tasks||[]).filter(t=>!t.deleted&&!t.cancelled).forEach(t=>{
      const key=[t.project||"",t.series||"",t.status||"",t.from||0,t.to||0].join("|");
      if(!m[key]) m[key]={...t,ids:[],people:[],tasks:[]};
      m[key].ids.push(t.id);
      m[key].tasks.push(t);
      if(t.person&&!m[key].people.includes(t.person)) m[key].people.push(t.person);
    });
    return Object.values(m).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)||String(a.series||"").localeCompare(String(b.series||""))||String(a.status||"").localeCompare(String(b.status||"")));
  }
  function daysDiff(ds){
    const d=parseDate(ds);if(!d)return"";
    const diff=Math.round((d-today)/86400000);
    return diff===0?"\u0441\u0435\u0433\u043e\u0434\u043d\u044f":diff===1?"\u0437\u0430\u0432\u0442\u0440\u0430":`\u0447\u0435\u0440\u0435\u0437 ${diff} \u0434\u043d.`;
  }
  function Block({title,count,color,children}){
    return (
      <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #334155",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:12,color:"#64748b",letterSpacing:1,textTransform:"uppercase"}}>{title}</span>
          {count!=null&&<span style={{fontSize:22,fontWeight:800,color:color||"#e2e8f0"}}>{count}</span>}
        </div>
        <div style={{padding:"14px 18px"}}>{children}</div>
      </div>
    );
  }
  function TasksBlock({tasks}){
    const byProj=groupByProj(tasks);
    if(!byProj.length) return <div style={{color:"#475569",fontSize:14}}>{"\u0421\u043c\u0435\u043d \u043d\u0435\u0442"}</div>;
    return byProj.map(([pid,pts])=>{
      const proj=data.projects.find(p=>p.id===pid);
      const grouped=groupTodayTasks(pts);
      return (
        <div key={pid} style={{marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <ProjectMark project={proj} size={8}/>
            <span style={{fontSize:13,fontWeight:600,color:proj?.color||"#94a3b8"}}>{proj?.name||pid}</span>
          </div>
          {grouped.map(g=>{
            const st=stageMap[g.status];
            return (
              <div key={g.ids.join("-")} style={{display:"grid",gridTemplateColumns:"minmax(62px,78px) minmax(120px,1fr) auto",alignItems:"center",gap:8,
                padding:"6px 0 6px 14px",borderBottom:"1px solid #1e293b"}}>
                <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>{fmtHour(g.from)}-{fmtHour(g.to)}</span>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <StatusBadge s={g.status} small/>
                    <span style={{fontSize:13,color:"#e2e8f0",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.series||"-"}</span>
                    {g.tasks.length>1&&<span style={{fontSize:10,color:st?.color||"#64748b",border:`1px solid ${st?.color||"#64748b"}55`,borderRadius:999,padding:"0 6px"}}>x{g.tasks.length}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:220}}>
                  {(g.people.length?g.people:["\u043d\u0435 \u043d\u0430\u0437\u043d."]).map(name=>(
                    <span key={name} style={{fontSize:11,color:name===g.people[0]?"#cbd5e1":"#94a3b8",background:"rgba(148,163,184,0.09)",border:"1px solid #334155",borderRadius:999,padding:"2px 7px",whiteSpace:"nowrap"}}>{name}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  }


  const pd=today;
  const dateTitle=`${WDAYS_LONG[pd.getDay()]}, ${String(pd.getDate()).padStart(2,"0")} ${MONTHS[pd.getMonth()].toLowerCase()}`;

  return (
    <div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:20,color:"#e2e8f0"}}>{dateTitle}</div>
      {birthdayItems.length>0&&(
        <div className={`ppt-birthday-banner ${birthdayItems.some(b=>b.diff===0)?"ppt-birthday-today":""}`}>
          <span className="ppt-birthday-chip">ДР</span>
          <span className="ppt-birthday-banner-title">Дни рождения 7 дней</span>
          {birthdayItems.map(b=><span key={b.person.id||b.person.name} className="ppt-birthday-pill">
            {b.person.name} · {normalizeBirthday(b.person.birthday)} · {birthdayWhenText(b.diff)}
          </span>)}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,400px),1fr))",gap:16,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Block title="Сегодня" count={todayTasks.length} color={todayTasks.length?"#e2e8f0":"#475569"}>
            <TasksBlock tasks={todayTasks}/>
          </Block>
          <Block title="Завтра" count={tmrTasks.length} color="#64748b">
            <TasksBlock tasks={tmrTasks}/>
          </Block>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Block title="Конфликты" count={notifyConflicts.length} color={notifyConflicts.length?"#f87171":"#22c55e"}>
            {notifyConflicts.length===0?(
              <div style={{color:"#22c55e",fontSize:15,fontWeight:600}}>OK Конфликтов нет</div>
            ):(
              <div>
                <div style={{fontSize:14,color:"#f87171",marginBottom:10}}>
                  Требуют внимания: {notifyConflicts.length}
                </div>
                <Btn variant="ghost" small onClick={onNavigateConflicts}>Смотреть все →</Btn>
              </div>
            )}
          </Block>
          <Block title="Важное 7 дней" count={deadlines.length+birthdayItems.length} color={(deadlines.length+birthdayItems.length)?"#f59e0b":"#475569"}>
            {deadlines.length===0&&birthdayItems.length===0?(
              <div style={{color:"#475569",fontSize:14}}>Важных событий нет</div>
            ):(
              <div>
                {birthdayItems.map(b=>(
                  <div key={`bd-${b.person.id||b.person.name}`} className={`ppt-birthday-important ${b.diff===0?"ppt-birthday-today":""}`}>
                    <span className="ppt-birthday-chip ppt-birthday-chip-small">ДР</span>
                    <span className="ppt-birthday-important-name">{b.person.name}</span>
                    <span className="ppt-birthday-important-label">День рождения</span>
                    <span className="ppt-birthday-important-when">{birthdayWhenText(b.diff)}</span>
                  </div>
                ))}
                {deadlines.map((u,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                    padding:"7px 0",borderBottom:"1px solid #1e293b"}}>
                    <ProjectMark project={u.proj} size={8}/>
                    <span style={{fontSize:14,color:"#e2e8f0",flex:1,fontWeight:500}}>{u.proj.abbr||u.proj.name} · {u.ser.name}</span>
                    <span style={{fontSize:12,color:u.color,fontWeight:700}}>{u.type}</span>
                    <span style={{fontSize:12,color:"#475569"}}>{daysDiff(u.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </Block>
          <Block title="Послезавтра" count={datTasks.length} color="#64748b">
            <TasksBlock tasks={datTasks}/>
          </Block>
        </div>
      </div>
    </div>
  );
}

// ── КАРТОЧКА СЕРИИ ───────────────────────────────────────────────────
function SeriesCard({seriesId,data,onBatchUpdate}){
  const holidays=useContext(HolidaysCtx);
  const [tab,setTab]=useState("general");
  const [newCLForm,setNewCLForm]=useState(null);
  const [editCLId,setEditCLId]=useState(null);
  const [editCLName,setEditCLName]=useState("");
  const [openCmts,setOpenCmts]=useState({});

  const ser=(data.series||[]).find(s=>s.id===seriesId);
  const proj=ser?data.projects.find(p=>p.id===ser.projectId):null;
  if(!ser||!proj) return <div style={{padding:40,color:"#475569",textAlign:"center"}}>Серия не найдена.</div>;

  const checklists=ser.checklists||[];
  const allItems=checklists.flatMap(cl=>cl.items||[]);
  const doneCount=allItems.filter(i=>i.done).length;
  const totalCount=allItems.length;
  const undoneCount=totalCount-doneCount;
  const canDeliver=totalCount===0||undoneCount===0;
  const preOtkWarn=ser.preOtkDate&&isNonWorkday(ser.preOtkDate,holidays);
  const otkWarn=ser.otkDate&&isNonWorkday(ser.otkDate,holidays);

  function upSer(ch){
    onBatchUpdate({series:(data.series||[]).map(s=>s.id===seriesId?{...s,...ch}:s),tasks:data.tasks});
  }
  function updCL(clId,ch){upSer({checklists:checklists.map(cl=>cl.id===clId?{...cl,...ch}:cl)});}
  function toggleItem(clId,itemId){
    const cl=checklists.find(c=>c.id===clId);
    updCL(clId,{items:(cl.items||[]).map(it=>it.id===itemId?{...it,done:!it.done}:it)});
  }
  function updItem(clId,itemId,ch){
    const cl=checklists.find(c=>c.id===clId);
    updCL(clId,{items:(cl.items||[]).map(it=>it.id===itemId?{...it,...ch}:it)});
  }
  function delItem(clId,itemId){
    const cl=checklists.find(c=>c.id===clId);
    updCL(clId,{items:(cl.items||[]).filter(it=>it.id!==itemId)});
  }
  function addItem(clId){
    const cl=checklists.find(c=>c.id===clId);
    if(!cl) return;
    updCL(clId,{items:[...(cl.items||[]),{id:"i"+Date.now(),text:"Новый пункт",done:false,comment:""}]});
  }
  function delChecklist(clId){
    if(!window.confirm("Удалить чек-лист?")) return;
    upSer({checklists:checklists.filter(cl=>cl.id!==clId)});
  }
  function createChecklist(){
    const {name,lines}=newCLForm;
    const items=lines.split("\n").filter(l=>l.trim()).map((text,i)=>
      ({id:"i"+Date.now()+i,text:text.trim(),done:false,comment:""}));
    upSer({checklists:[...checklists,{id:"cl"+Date.now(),name:name.trim()||"Без названия",items}]});
    setNewCLForm(null);
  }
  function deliverSeries(){
    if(!window.confirm("Отметить серию как сданную?")) return;
    upSer({delivered:true,deliveredAt:formatDate(new Date())});
  }
  function reopenSeries(){
    if(!window.confirm("Открыть серию заново?")) return;
    upSer({delivered:false,deliveredAt:""});
  }

  const iSt={background:"#0f172a",border:"1px solid #334155",borderRadius:10,
    color:"#e2e8f0",padding:"7px 10px",fontSize:13,outline:"none",fontFamily:"inherit",
    width:"100%",boxSizing:"border-box"};
  const lSt={fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:3,display:"block"};
  const cSt={background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"};

  const TABS=[
    {id:"general",label:"Общее"},
    {id:"checklists",label:totalCount?`Чек-листы (${doneCount}/${totalCount})`:"Чек-листы"},
    {id:"notes",label:"Заметки"},
  ];

  return (
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:20}}>
      <div style={{display:"flex",gap:1,background:"#0f172a",borderRadius:12,
        border:"1px solid #334155",overflow:"hidden",width:"fit-content"}}>
        {TABS.map(({id,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"6px 16px",border:"none",borderRight:"1px solid #334155",cursor:"pointer",
            fontSize:12,fontFamily:"inherit",
            background:tab===id?"#3b82f6":"transparent",
            color:tab===id?"#fff":"#64748b",fontWeight:tab===id?700:400}}>
            {label}
          </button>
        ))}
      </div>
        <Btn variant="primary" small onClick={()=>upSer({_updatedAt:Date.now()})}>Сохранить</Btn>
      </div>

      {tab==="general"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:16,alignItems:"start"}}>
          <div style={cSt}>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={lSt}>НАЗВАНИЕ</label>
                <input defaultValue={ser.name} style={iSt}
                  onBlur={e=>{const v=e.target.value.trim();if(v&&v!==ser.name)upSer({name:v});}}/>
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— СЪЁМКИ ———</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={lSt}>НАЧАЛО</label>
                  <InpDate value={ser.shootStart||""} onChange={v=>upSer({shootStart:v})}/></div>
                <div><label style={lSt}>КОНЕЦ</label>
                  <InpDate value={ser.shootEnd||""} onChange={v=>upSer({shootEnd:v})}/></div>
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— ПОСТПРОДАКШН ———</div>
              <div>
                <label style={lSt}>МОНТАЖ С</label>
                <InpDate value={ser.editStart||""} onChange={v=>upSer({editStart:v})}/>
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— КЛЮЧЕВЫЕ СОБЫТИЯ ———</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{...lSt,color:"#a855f7"}}>{"\u0417\u0430\u043a\u0430\u0437 \u041e\u0422\u041f\u0420\u0410\u0412\u041a\u0410"}</label>
                  <InpDate value={ser.sendDate||""} onChange={v=>upSer({sendDate:v})}/></div>
                <div><label style={{...lSt,color:getProjectMilestoneMeta(proj,"preOtkDate",SERIES_MILESTONES.find(m=>m.key==="preOtkDate")).color}}>{getProjectMilestoneMeta(proj,"preOtkDate",SERIES_MILESTONES.find(m=>m.key==="preOtkDate")).label}</label>
                  <InpDate value={ser.preOtkDate||""} onChange={v=>upSer({preOtkDate:v})} warn={preOtkWarn}/></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><label style={{...lSt,color:getProjectMilestoneMeta(proj,"otkDate",SERIES_MILESTONES.find(m=>m.key==="otkDate")).color}}>{getProjectMilestoneMeta(proj,"otkDate",SERIES_MILESTONES.find(m=>m.key==="otkDate")).label}</label>
                  <InpDate value={ser.otkDate||""} onChange={v=>upSer({otkDate:v})} warn={otkWarn}/></div>
                <div><label style={{...lSt,color:"#f59e0b"}}>ЭФ ЭФИР</label>
                  <InpDate value={ser.airDate||""} onChange={v=>upSer({airDate:v})}/></div>
              </div>
              {getProjectCustomMilestones(proj).length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {getProjectCustomMilestones(proj).map(def=>{
                    const vals=ser.customMilestones||[];
                    const cur=vals.find(v=>v.id===def.id)?.date||"";
                    function setCustomDate(v){
                      const next=vals.filter(x=>x.id!==def.id);
                      if(v) next.push({id:def.id,date:v});
                      upSer({customMilestones:next});
                    }
                    return <div key={def.id}><label style={{...lSt,color:def.color||"#f59e0b"}}>{def.label||"Контрольная точка"}</label><InpDate value={cur} onChange={setCustomDate}/></div>;
                  })}
                </div>
              )}
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— ТРАНЗИТНЫЕ КОДЫ ———</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <label style={lSt}>РЕКЛАМНЫЙ</label>
                  <input defaultValue={ser.transitCodeAd||""} style={iSt}
                    onBlur={e=>{if(e.target.value!==(ser.transitCodeAd||""))upSer({transitCodeAd:e.target.value});}}/>
                </div>
                <div>
                  <label style={lSt}>БЕЗРЕКЛАМНЫЙ</label>
                  <input defaultValue={ser.transitCodeNoAd||""} style={iSt}
                    onBlur={e=>{if(e.target.value!==(ser.transitCodeNoAd||""))upSer({transitCodeNoAd:e.target.value});}}/>
                </div>
              </div>
            </div>
          </div>
          <div style={cSt}>
            <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:12}}>СТАТУС СЕРИИ</div>
            {ser.delivered?(
              <div>
                <div style={{background:"#22c55e1a",border:"1px solid #22c55e44",borderRadius:12,
                  padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>OK</span>
                  <div>
                    <div style={{fontWeight:700,color:"#22c55e",fontSize:15}}>Сдана</div>
                    {ser.deliveredAt&&<div style={{fontSize:11,color:"#475569",marginTop:2}}>{ser.deliveredAt}</div>}
                  </div>
                </div>
                <button onClick={reopenSeries}
                  style={{width:"100%",padding:"9px",borderRadius:7,cursor:"pointer",
                    background:"transparent",color:"#64748b",border:"1px solid #334155",
                    fontSize:13,fontFamily:"inherit"}}>
                  Открыть серию заново
                </button>
              </div>
            ):(
              <div>
                <div style={{background:"#3b82f61a",border:"1px solid #3b82f644",borderRadius:12,
                  padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>◉</span>
                  <div style={{fontWeight:700,color:"#3b82f6",fontSize:15}}>В работе</div>
                </div>
                {totalCount>0&&(
                  <div style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:11,color:"#64748b"}}>
                      <span>Чек-листы</span>
                      <span style={{color:undoneCount===0?"#22c55e":"#94a3b8"}}>
                        {doneCount}/{totalCount} готово
                      </span>
                    </div>
                    <div style={{height:6,background:"#0f172a",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:3,transition:"width 0.3s",
                        width:`${totalCount?Math.round(doneCount/totalCount*100):0}%`,
                        background:undoneCount===0?"#22c55e":"#3b82f6"}}/>
                    </div>
                  </div>
                )}
                <button disabled={!canDeliver} onClick={deliverSeries}
                  title={!canDeliver?`Закройте все пункты: открыто ${undoneCount}`:""}
                  style={{width:"100%",padding:"10px",borderRadius:12,
                    cursor:canDeliver?"pointer":"not-allowed",fontFamily:"inherit",
                    background:canDeliver?"#22c55e1a":"#0f172a",
                    color:canDeliver?"#22c55e":"#334155",
                    border:`1px solid ${canDeliver?"#22c55e44":"#1e293b"}`,
                    fontSize:14,fontWeight:700,transition:"all 0.2s"}}>
                  {canDeliver?"OK Сдать серию":` Сдать серию (открыто ${undoneCount})`}
                </button>
                {!canDeliver&&<div style={{fontSize:11,color:"#475569",marginTop:6,textAlign:"center"}}>
                  Закройте все пункты чек-листов
                </div>}
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="checklists"&&(
        <div>
          {totalCount>0&&(
            <div style={{...cSt,marginBottom:14,padding:"14px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700}}>Общий прогресс</span>
                <span style={{fontSize:14,fontWeight:700,
                  color:undoneCount===0?"#22c55e":"#94a3b8"}}>
                  {doneCount} / {totalCount} OK ({totalCount?Math.round(doneCount/totalCount*100):0}%)
                </span>
              </div>
              <div style={{height:8,background:"#0f172a",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,transition:"width 0.3s",
                  width:`${totalCount?Math.round(doneCount/totalCount*100):0}%`,
                  background:undoneCount===0?"#22c55e":"#3b82f6"}}/>
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <Btn variant="primary" small
              onClick={()=>setNewCLForm({name:"",lines:""})}>+ Добавить чек-лист</Btn>
          </div>
          {checklists.length===0&&(
            <div style={{color:"#475569",padding:"40px 0",textAlign:"center",fontSize:14}}>
              Нет чек-листов — нажмите «+ Добавить чек-лист»
            </div>
          )}
          {checklists.map(cl=>{
            const clDone=(cl.items||[]).filter(i=>i.done).length;
            const clTotal=(cl.items||[]).length;
            return (
              <div key={cl.id} style={{...cSt,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:12}}>
                  {editCLId===cl.id?(
                    <input autoFocus value={editCLName}
                      onChange={e=>setEditCLName(e.target.value)}
                      onBlur={()=>{if(editCLName.trim())updCL(cl.id,{name:editCLName.trim()});
                        setEditCLId(null);}}
                      onKeyDown={e=>{
                        if(e.key==="Enter"){if(editCLName.trim())updCL(cl.id,{name:editCLName.trim()});
                          setEditCLId(null);}
                        if(e.key==="Escape")setEditCLId(null);
                      }}
                      style={{...iSt,fontSize:14,fontWeight:700,padding:"3px 8px",flex:1,marginRight:8}}/>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontWeight:700,fontSize:14}}>{cl.name}</span>
                      <span style={{fontSize:11,
                        color:clDone===clTotal&&clTotal>0?"#22c55e":"#475569"}}>
                        {clDone}/{clTotal}
                      </span>
                    </div>
                  )}
                  <div style={{display:"flex",gap:2}}>
                    <button onClick={()=>{setEditCLId(cl.id);setEditCLName(cl.name);}}
                      style={{background:"none",border:"none",cursor:"pointer",
                        color:"#475569",fontSize:14,padding:"2px 7px"}}>✏</button>
                    <button onClick={()=>delChecklist(cl.id)}
                      style={{background:"none",border:"none",cursor:"pointer",
                        color:"#ef4444",fontSize:15,padding:"2px 7px"}}></button>
                  </div>
                </div>
                {(cl.items||[]).map(item=>{
                  const ck=`${cl.id}|${item.id}`;
                  const cmtOpen=openCmts[ck];
                  return (
                    <div key={item.id} style={{marginBottom:cmtOpen?6:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,
                        padding:"3px 0",borderBottom:"1px solid #0f172a"}}>
                        <button onClick={()=>toggleItem(cl.id,item.id)}
                          style={{background:"none",border:"none",cursor:"pointer",
                            color:item.done?"#22c55e":"#475569",
                            fontSize:19,padding:0,flexShrink:0,lineHeight:1,width:24}}>
                          {item.done?"☑":"☐"}
                        </button>
                        <input defaultValue={item.text}
                          style={{background:"none",border:"none",outline:"none",
                            color:item.done?"#475569":"#e2e8f0",fontFamily:"inherit",
                            fontSize:13,flex:1,padding:"2px 0",cursor:"text",
                            textDecoration:item.done?"line-through":"none"}}
                          onBlur={e=>{
                            const v=e.target.value.trim();
                            if(v&&v!==item.text)updItem(cl.id,item.id,{text:v});
                          }}/>
                        <button onClick={()=>setOpenCmts(p=>({...p,[ck]:!p[ck]}))}
                          title="Комментарий"
                          style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",
                            flexShrink:0,fontSize:13,
                            color:item.comment?cmtOpen?"#3b82f6":"#f59e0b":"#334155"}}>💬</button>
                        <button onClick={()=>delItem(cl.id,item.id)}
                          style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px",
                            flexShrink:0,color:"#475569",fontSize:13}}>✕</button>
                      </div>
                      {cmtOpen&&(
                        <textarea defaultValue={item.comment||""}
                          rows={2} placeholder="Комментарий..."
                          style={{...iSt,fontSize:12,resize:"none",marginTop:3,
                            marginLeft:30,width:"calc(100% - 30px)",boxSizing:"border-box"}}
                          onBlur={e=>{
                            if(e.target.value!==(item.comment||""))
                              updItem(cl.id,item.id,{comment:e.target.value});
                          }}/>
                      )}
                    </div>
                  );
                })}
                <button onClick={()=>addItem(cl.id)}
                  style={{background:"none",border:"1px dashed #334155",borderRadius:10,
                    color:"#475569",cursor:"pointer",padding:"5px 12px",fontSize:11,
                    fontFamily:"inherit",marginTop:10,width:"100%"}}>
                  + Добавить пункт
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab==="notes"&&(
        <div style={cSt}>
          <label style={lSt}>ЗАМЕТКИ</label>
          <textarea defaultValue={ser.notes||""} rows={16} style={{...iSt,resize:"vertical"}}
            onBlur={e=>{if(e.target.value!==(ser.notes||""))upSer({notes:e.target.value});}}/>
        </div>
      )}

      {newCLForm&&(
        <Modal title="Новый чек-лист" onClose={()=>setNewCLForm(null)} onSubmit={createChecklist}>
          <Field label="Название">
            <Inp value={newCLForm.name}
              onChange={v=>setNewCLForm(p=>({...p,name:v}))}
              placeholder="Монтаж, Сдача мастера, Интеграции..."/>
          </Field>
          <Field label="Пункты (каждая строка — отдельный пункт)">
            <textarea value={newCLForm.lines}
              onChange={e=>setNewCLForm(p=>({...p,lines:e.target.value}))}
              placeholder={"Проверить цветокоррекцию\nЗвук сведён\nСинхра принята"}
              rows={7} style={{background:"#0f172a",border:"1px solid #334155",
                borderRadius:10,color:"#e2e8f0",padding:"8px 10px",fontSize:13,
                width:"100%",fontFamily:"inherit",resize:"vertical",outline:"none"}}/>
          </Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8,
            borderTop:"1px solid #334155",paddingTop:14}}>
            <Btn variant="ghost" onClick={()=>setNewCLForm(null)}>Отмена</Btn>
            <Btn variant="primary" onClick={createChecklist}>Сохранить</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── КАРТОЧКА ПРОЕКТА ─────────────────────────────────────────────────
function ProjectCard({projectId,data,onUpdate,onBatchUpdate,onBack,onSeriesSelect,onDelete,onLog,canDeleteStructure,canEditProject,canManageProjectAssignments}){
  const {sorted:stages,stageGroups,groupMap}=useContext(StagesCtx);
  const [tab,setTab]=useState("general");
  const [editSeries,setEditSeries]=useState(null);
  const kppDragRef=useRef(null);

  const proj=data.projects.find(p=>p.id===projectId);
  if(!proj) return <div style={{padding:24,color:"#475569"}}>Проект не найден.</div>;

  const projSeries=(data.series||[]).filter(s=>s.projectId===projectId).sort((a,b)=>(a.order||0)-(b.order||0));
  const pTasks=data.tasks.filter(t=>t.project===projectId);
  const dossier=proj.dossier||{};
  const info=dossier.info||{};

  function upProj(ch){if(!canEditProject) return;if(!canManageProjectAssignments&&(Object.prototype.hasOwnProperty.call(ch,"managers")||Object.prototype.hasOwnProperty.call(ch,"status"))) return;onUpdate("projects",data.projects.map(p=>p.id===projectId?{...p,...ch}:p));}
  function upInfo(f,v){upProj({dossier:{...dossier,info:{...info,[f]:v}}});}
  function upDoss(f,v){upProj({dossier:{...dossier,[f]:v}});}
  function upSer(sid,ch){if(!canEditProject) return;onBatchUpdate({series:(data.series||[]).map(s=>s.id===sid?{...s,...ch}:s),tasks:data.tasks});}

  function saveSeries(serData){
    if(!canEditProject) return;
    let allS=[...(data.series||[])];
    let final;
    const existing=allS.find(s=>s.id===serData.id);
    const oldName=existing?.name;
    const isNew=!serData.id||!existing;
    if(!isNew){
      final={...serData,_updatedAt:Date.now()};
      allS=allS.map(s=>s.id===serData.id?final:s);
    } else {
      // Map series dates → КПП stageRanges using group label matching
      const findGid=kw=>stageGroups.find(g=>new RegExp(kw,"i").test(g.label))?.id;
      const sr={};
      if(serData.shootStart){
        const gid=findGid("съём");
        if(gid) sr[gid]={from:serData.shootStart,to:addDays(serData.shootStart,2)};
      }
      if(serData.syncStart){
        const gid=findGid("синхр");
        if(gid) sr[gid]={from:serData.syncStart,to:addDays(serData.syncStart,1)};
      }
      if(serData.editStart){
        const gid=findGid("монтаж");
        if(gid) sr[gid]={from:serData.editStart,to:""};
      }
      if(serData.otkDate){
        const gid=findGid("отк");
        if(gid) sr[gid]={from:serData.otkDate,to:""};
      }
      final={...serData,id:"s"+Date.now(),projectId,
        order:allS.filter(s=>s.projectId===projectId).length,
        syncStart:serData.syncStart||"",
        transitCode:"",transitVariants:["","",""],
        checklists:[],notes:"",delivered:false,deliveredAt:"",assets:[],
        stageRanges:{...sr},_updatedAt:Date.now()};
      allS.push(final);
    }
    let newTasks=data.tasks;
    if(!isNew&&oldName&&oldName!==final.name)
      newTasks=newTasks.map(t=>t.seriesId===final.id&&t.series===oldName?{...t,series:final.name}:t);
    onLog?.(isNew?`Создана серия «${final.name}» → ${proj.name}`:`Серия «${final.name}» обновлена`);
    onBatchUpdate({series:allS,tasks:newTasks});
    setEditSeries(null);
  }

  function deleteSeries(id){
    if(!canDeleteStructure) return;
    if(!window.confirm("Удалить серию и все её задачи? Действие можно отменить через Ctrl+Z.")) return;
    const serName=(data.series||[]).find(s=>s.id===id)?.name||id;
    onLog?.(`Удалена серия «${serName}» → ${proj.name}`);
    onBatchUpdate(deleteSeriesSnapshot(data,id));
  }

  const iSt={background:"#0f172a",border:"1px solid #334155",borderRadius:10,
    color:"#e2e8f0",padding:"7px 10px",fontSize:13,outline:"none",fontFamily:"inherit",
    width:"100%",boxSizing:"border-box"};
  const lSt={fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:3,display:"block"};

  const TABS=[
    {id:"general",label:"Общее"},
    {id:"kpp",label:`КПП (${projSeries.length})`},
    {id:"info",label:"Информация"},
    {id:"transits",label:"Транзиты"},
    {id:"access",label:"Доступы и ссылки"},
    {id:"notes",label:"Заметки"},
  ];

  return (
    <div style={{maxWidth:960,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",gap:1,background:"#0f172a",borderRadius:12,
          border:"1px solid #334155",overflow:"hidden",width:"fit-content"}}>
          {TABS.map(({id,label})=>(
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:"6px 16px",border:"none",borderRight:"1px solid #334155",cursor:"pointer",
              fontSize:12,fontFamily:"inherit",
              background:tab===id?"#3b82f6":"transparent",
              color:tab===id?"#fff":"#64748b",
              fontWeight:tab===id?700:400}}>
              {label}
            </button>
          ))}
        </div>
        {onDelete&&canDeleteStructure&&<Btn variant="danger" small onClick={()=>onDelete(projectId)}>Удалить проект</Btn>}
      </div>

      {tab==="general"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,360px),1fr))",gap:16,alignItems:"start"}}>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,
            border:`1px solid ${proj.color}66`,borderTop:`3px solid ${proj.color}`}}>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={lSt}>НАЗВАНИЕ</label>
                <input defaultValue={proj.name} style={iSt}
                  onBlur={e=>{const v=e.target.value.trim();if(v&&v!==proj.name)upProj({name:v});}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <label style={lSt}>АББРЕВИАТУРА</label>
                  <input defaultValue={proj.abbr||""} style={iSt}
                    onBlur={e=>{if(e.target.value.trim()!==(proj.abbr||""))upProj({abbr:e.target.value.trim()});}}/>
                </div>
                <div>
                  <label style={lSt}>СЕЗОН</label>
                  <input defaultValue={proj.season||""} style={iSt}
                    onBlur={e=>{if(e.target.value.trim()!==(proj.season||""))upProj({season:e.target.value.trim()});}}/>
                </div>
              </div>
              <div>
                <label style={lSt}>ОПИСАНИЕ</label>
                <textarea defaultValue={proj.description||""} rows={3} style={{...iSt,resize:"vertical"}}
                  onBlur={e=>{if(e.target.value!==(proj.description||""))upProj({description:e.target.value});}}/>
              </div>
              <div>
                <label style={lSt}>{PROJECT_VISUAL_TEXT.preview.toUpperCase()}</label>
                <ProjectVisualPicker project={proj}
                  onColor={c=>upProj({color:c})}
                  onVisual={visual=>upDoss("visual",visual)}/>
              </div>
              <div>
                <label style={lSt}>{"\u041c\u0415\u041d\u0415\u0414\u0416\u0415\u0420\u042b"}</label>
                {canManageProjectAssignments?<ManagerPicker value={proj.managers||[]} options={(data.people||[]).filter(p=>p.active!==false&&p.roles&&(p.roles.includes("\u043c\u043d\u0434\u0436\u0440")||p.roles.includes("\u043f\u0440\u043e\u0434\u044e\u0441\u0435\u0440")))} onChange={v=>upProj({managers:v})}/>:<div style={{fontSize:13,color:"#94a3b8",padding:"7px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10}}>{(proj.managers||[]).map(m=>m.name||m.uid||m).filter(Boolean).join(", ")||"-"}</div>}
              </div>
              <div style={{fontSize:10,color:"#475569",letterSpacing:1}}>——— КЛЮЧЕВЫЕ СОБЫТИЯ ———</div>
              {SERIES_MILESTONES.filter(m=>m.configurable).map(base=>{
                const meta=getProjectMilestoneMeta(proj,base.key,base);
                function setMeta(ch){upDoss("milestoneMeta",{...(dossier.milestoneMeta||{}),[base.key]:{...((dossier.milestoneMeta||{})[base.key]||{}),...ch}});}
                return <div key={base.key} style={{display:"grid",gridTemplateColumns:"1fr 44px",gap:8,alignItems:"end"}}>
                  <div><label style={lSt}>{base.label}</label><input value={meta.label} style={iSt} onChange={e=>setMeta({label:e.target.value,abbr:e.target.value})}/></div>
                  <input type="color" value={meta.color} onChange={e=>setMeta({color:e.target.value})} style={{width:40,height:36,border:"none",background:"none",cursor:"pointer",padding:2,borderRadius:4}}/>
                </div>;
              })}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <label style={lSt}>ДОП. ТОЧКИ</label>
                  {(dossier.customMilestones||[]).length<CUSTOM_MILESTONE_LIMIT&&<Btn small variant="ghost" onClick={()=>upDoss("customMilestones",[...(dossier.customMilestones||[]),{id:"m"+Date.now(),label:"Контрольная точка",color:"#f59e0b"}])}>+ Добавить</Btn>}
                </div>
                {(dossier.customMilestones||[]).map((m,idx)=>{
                  const items=dossier.customMilestones||[];
                  function upd(ch){const next=[...items];next[idx]={...next[idx],...ch};upDoss("customMilestones",next);}
                  return <div key={m.id} style={{display:"grid",gridTemplateColumns:"1fr 44px auto",gap:8,alignItems:"center",marginBottom:6}}>
                    <input value={m.label||""} style={iSt} onChange={e=>upd({label:e.target.value})}/>
                    <input type="color" value={m.color||"#f59e0b"} onChange={e=>upd({color:e.target.value})} style={{width:40,height:36,border:"none",background:"none",cursor:"pointer",padding:2,borderRadius:4}}/>
                    <button onClick={()=>upDoss("customMilestones",items.filter((_,i)=>i!==idx))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18}}>×</button>
                  </div>;
                })}
              </div>
            </div>
          </div>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:10,letterSpacing:1}}>СЕРИИ</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {projSeries.map(ser=>{
                const todayStr=formatDate(new Date());
                const sTasks=pTasks.filter(t=>(t.seriesId===ser.id||t.series===ser.name)&&t.day===todayStr);
                const maxIdx=Math.max(...sTasks.map(t=>stages.findIndex(s=>s.id===t.status)).filter(x=>x>=0),-1);
                const autoStage=maxIdx>=0?stages[maxIdx]:null;
                const autoGroupId=autoStage?.groupId||"";
                const autoGroup=autoGroupId?groupMap[autoGroupId]:null;
                const autoGroupOrder=autoGroup?.order||0;
                const manualGroupId=ser.manualStatus||"";
                const manualGroup=manualGroupId?groupMap[manualGroupId]:null;
                const displayGroup=manualGroupId?manualGroup:autoGroup;
                const isManual=!!manualGroupId;
                const bc=autoStage?autoStage.color:proj.color;
                return (
                  <div key={ser.id}
                    onDoubleClick={()=>onSeriesSelect&&onSeriesSelect(ser.id)}
                    title="Двойной клик — открыть карточку серии"
                    style={{borderLeft:`3px solid ${bc}`,background:"#0f172a",cursor:"pointer",
                      borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:5}}>
                        {ser.name}
                        {isManual&&<span title="Ручной статус" style={{fontSize:9,color:"#f59e0b"}}></span>}
                        {ser.delivered&&<span title="Сдана" style={{fontSize:9,color:"#22c55e"}}>OK</span>}
                      </div>
                      {displayGroup&&<div style={{fontSize:10,color:bc,marginTop:2}}>{displayGroup.label}</div>}
                    </div>
                    <div style={{fontSize:11,color:"#475569"}}>{sTasks.length} задач</div>
                  </div>
                );
              })}
              {projSeries.length===0&&<div style={{color:"#475569",fontSize:13}}>Нет серий</div>}
            </div>
          </div>
        </div>
      )}

      {tab==="kpp"&&(()=>{
        const milestoneDefs=getProjectMilestoneDefinitions(proj);
        const stageRows=[...stageGroups].sort((a,b)=>(b.order||0)-(a.order||0)).map(g=>{
          const stg=stages.find(s=>s.groupId===g.id);
          return {kind:"stage",id:g.id,label:g.label,color:stg?.color||proj.color,group:g};
        });
        const milestoneRows=milestoneDefs.map(def=>({kind:"milestone",id:def.key,label:def.label,color:def.color||proj.color,def}));
        const rows=[...stageRows,...milestoneRows];
        function updateMilestone(ser,def,date){
          upSer(ser.id,seriesMilestonePatch(ser,def,date));
        }
        return (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>
              {"\u041a\u041f\u041f: \u044d\u0442\u0430\u043f\u044b \u043f\u043e \u0444\u0430\u043a\u0442\u0443 \u0441\u043c\u0435\u043d, \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u044b\u0435 \u0442\u043e\u0447\u043a\u0438 \u0438\u0437 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044f"}
            </div>
            <Btn variant="primary" small disabled={!canEditProject}
              onClick={()=>canEditProject&&setEditSeries({name:"",projectId,shootStart:"",shootEnd:"",syncStart:"",
                editStart:"",preOtkDate:"",otkDate:"",sendDate:"",airDate:"",
                airMode:"weekly",airDay:1,airTime:"21:00"})}>
              {"\u002b \u041d\u043e\u0432\u0430\u044f \u0441\u0435\u0440\u0438\u044f"}
            </Btn>
          </div>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,border:"1px solid rgba(148,163,184,.18)",overflowX:"auto"}}>
            {projSeries.length===0?(
              <div style={{padding:32,color:"#64748b",fontSize:14,textAlign:"center"}}>
                {"\u041d\u0435\u0442 \u0441\u0435\u0440\u0438\u0439. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab+ \u041d\u043e\u0432\u0430\u044f \u0441\u0435\u0440\u0438\u044f\u00bb"}
              </div>
            ):(
              <table style={{borderCollapse:"separate",borderSpacing:0,minWidth:Math.max(720,220+projSeries.length*190)}}>
                <thead>
                  <tr>
                    <th style={{padding:"9px 14px",fontSize:11,color:"#94a3b8",letterSpacing:1,
                      textAlign:"left",borderBottom:"1px solid #334155",borderRight:"1px solid #334155",
                      position:"sticky",left:0,background:"#1e293b",zIndex:3,whiteSpace:"nowrap",minWidth:220}}>
                      {"\u042d\u0422\u0410\u041f / \u041a\u041e\u041d\u0422\u0420\u041e\u041b\u042c\u041d\u0410\u042f \u0422\u041e\u0427\u041a\u0410"}
                    </th>
                    {projSeries.map(ser=>(
                      <th key={ser.id}
                        draggable
                        onDragStart={e=>{kppDragRef.current=ser.id;e.dataTransfer.effectAllowed="move";}}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={e=>{
                          e.preventDefault();
                          const srcId=kppDragRef.current;
                          if(!srcId||srcId===ser.id) return;
                          const arr=[...projSeries];
                          const si=arr.findIndex(s=>s.id===srcId),ti=arr.findIndex(s=>s.id===ser.id);
                          if(si===-1||ti===-1) return;
                          const item=arr.splice(si,1)[0];arr.splice(ti,0,item);
                          const others=(data.series||[]).filter(s=>s.projectId!==projectId);
                          onBatchUpdate({series:[...others,...arr.map((s,i)=>({...s,order:i}))],tasks:data.tasks});
                          kppDragRef.current=null;
                        }}
                        onDragEnd={()=>{kppDragRef.current=null;}}
                        style={{padding:"8px 10px",fontSize:12,fontWeight:800,textAlign:"left",
                          borderBottom:"1px solid #334155",borderLeft:"1px solid #334155",minWidth:190,maxWidth:220,
                          background:"rgba(15,23,42,.48)",cursor:"grab"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                          <span style={{fontSize:10,color:"#64748b",flexShrink:0}}>::</span>
                          <span onDoubleClick={()=>onSeriesSelect&&onSeriesSelect(ser.id)} title={ser.name}
                            style={{cursor:"pointer",flex:"1 1 0",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:ser.delivered?"#22c55e":"#e2e8f0"}}>
                            {ser.name}{ser.delivered?" \u00b7 \u0441\u0434\u0430\u043d\u0430":""}
                          </span>
                          <button title="Edit" disabled={!canEditProject} onClick={()=>canEditProject&&setEditSeries(ser)}
                            style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:11,padding:"0 2px",lineHeight:1,flexShrink:0}}>{"\u0438\u0437\u043c"}</button>
                          <button title="Delete" disabled={!canDeleteStructure} onClick={()=>canDeleteStructure&&deleteSeries(ser.id)}
                            style={{background:"none",border:"none",color:"#ef444466",cursor:"pointer",fontSize:14,padding:"0 2px",lineHeight:1,flexShrink:0}}>x</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row,idx)=>(
                    <tr key={row.kind+"-"+row.id}>
                      <td style={{padding:"9px 12px",position:"sticky",left:0,zIndex:2,background:"#1e293b",
                        borderLeft:"4px solid "+row.color,borderRight:"1px solid #334155",borderBottom:"1px solid rgba(51,65,85,.72)",whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:10,fontWeight:900,color:row.kind==="milestone"?"#fbbf24":"#93c5fd",
                            background:"rgba(15,23,42,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:999,padding:"2px 7px"}}>
                            {row.kind==="milestone"?"\u041a\u0422":"\u042d\u0422\u0410\u041f"}
                          </span>
                          <span style={{fontSize:12,fontWeight:900,color:row.kind==="milestone"?row.color:"#e2e8f0"}}>{row.label}</span>
                        </div>
                      </td>
                      {projSeries.map(ser=>{
                        if(row.kind==="milestone"){
                          const val=getSeriesMilestoneValue(ser,row.def);
                          return <td key={ser.id} style={{padding:"7px 8px",borderLeft:"1px solid #0f172a",borderBottom:"1px solid rgba(51,65,85,.48)",background:val?(row.color+"14"):"transparent"}}>
                            <input type="date" value={toInput(val)} disabled={!canEditProject}
                              onChange={e=>updateMilestone(ser,row.def,fromInput(e.target.value))}
                              style={{background:"rgba(8,13,26,.68)",border:"1px solid rgba(148,163,184,.22)",borderRadius:9,
                                color:val?"#e2e8f0":"#64748b",fontSize:12,outline:"none",width:"100%",minWidth:130,
                                cursor:canEditProject?"pointer":"default",fontFamily:"inherit",padding:"5px 8px"}}/>
                          </td>;
                        }
                        const actual=getSeriesGroupTaskRange(ser,row.group,stages,data.tasks);
                        const manual=(ser.stageRanges||{})[row.group.id]||{};
                        function setManual(field,date){
                          const old=ser.stageRanges||{};
                          const next={...old,[row.group.id]:{...(old[row.group.id]||{}),[field]:date}};
                          upSer(ser.id,{stageRanges:next});
                        }
                        return <td key={ser.id} style={{padding:"7px 8px",borderLeft:"1px solid #0f172a",borderBottom:"1px solid rgba(51,65,85,.48)",
                          background:actual.count?`linear-gradient(135deg, ${row.color}22, rgba(15,23,42,.72))`:"transparent",
                          boxShadow:actual.count?`inset 3px 0 0 ${row.color}`:"none",verticalAlign:"top"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:170}}>
                            {actual.count?(
                              <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",borderRadius:10,
                                background:"rgba(8,13,26,.50)",border:`1px solid ${row.color}66`}}>
                                <span style={{width:18,height:18,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",
                                  background:row.color,color:"#06111f",fontSize:10,fontWeight:950,flexShrink:0}}>OK</span>
                                <div style={{minWidth:0}}>
                                  <div style={{fontSize:11,color:"#f8fafc",fontWeight:950,whiteSpace:"nowrap"}}>{"\u042d\u0442\u0430\u043f \u043f\u0440\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d"}</div>
                                  <div style={{fontSize:10,color:"#cbd5e1",fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                                    {actual.from}{actual.to&&actual.to!==actual.from?(" - "+actual.to):""}{" / "}{actual.count} {"\u0441\u043c\u0435\u043d"}
                                  </div>
                                </div>
                              </div>
                            ):(
                              <div style={{fontSize:10,color:"#475569",fontWeight:800,whiteSpace:"nowrap",padding:"2px 0"}}>{"\u0424\u0430\u043a\u0442\u0430 \u043d\u0435\u0442"}</div>
                            )}
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,opacity:actual.count?0.72:1}}>
                              <input type="date" value={toInput(manual.from||"")} disabled={!canEditProject}
                                title={"\u041f\u043b\u0430\u043d/\u0440\u0443\u0447\u043d\u043e\u0435 \u043d\u0430\u0447\u0430\u043b\u043e"}
                                onChange={e=>setManual("from",fromInput(e.target.value))}
                                style={{background:"rgba(8,13,26,.52)",border:"1px solid rgba(148,163,184,.16)",borderRadius:8,color:manual.from?"#e2e8f0":"#64748b",fontSize:11,padding:"4px 5px",minWidth:0}}/>
                              <input type="date" value={toInput(manual.to||"")} disabled={!canEditProject}
                                title={"\u041f\u043b\u0430\u043d/\u0440\u0443\u0447\u043d\u043e\u0439 \u043a\u043e\u043d\u0435\u0446"}
                                onChange={e=>setManual("to",fromInput(e.target.value))}
                                style={{background:"rgba(8,13,26,.52)",border:"1px solid rgba(148,163,184,.16)",borderRadius:8,color:manual.to?"#e2e8f0":"#64748b",fontSize:11,padding:"4px 5px",minWidth:0}}/>
                            </div>
                          </div>
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        );
      })()}

      {tab==="info"&&(
        <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              ["ТИП КОНТЕНТА","type"],
              ["ХРОНОМЕТРАЖ","duration"],
              ["ПУТЬ НА СЕРВЕРЕ","serverPath"],
              ["ПРИНИМАЮЩИЙ ПРОДЮСЕР","receivingProducer"],
              ["ТЕЛЕФОН ПР. ПРОДЮСЕРА","receivingProducerPhone"],
              ["ТЕЛЕФОН МЕНЕДЖЕРА","managerPhone"],
              ["КОЛ-ВО ВЕРСИЙ","versions"],
              ["РЕКЛАМНЫЙ ХРОНОМЕТРАЖ","adRules"],
              ["РАСПИСАНИЕ ЭФИРА","airSchedule"],
              ["СПОСОБ ДОСТАВКИ","deliveryMethod"],
            ].map(([l,f])=>(
              <div key={f}>
                <label style={lSt}>{l}</label>
                <input defaultValue={info[f]||""} style={iSt}
                  onBlur={e=>{if(e.target.value!==(info[f]||""))upInfo(f,e.target.value);}}/>
              </div>
            ))}
            <div style={{gridColumn:"1 / -1"}}>
              <label style={lSt}>ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ</label>
              <textarea defaultValue={info.technicalRequirements||""} rows={4}
                style={{...iSt,resize:"vertical"}}
                onBlur={e=>{if(e.target.value!==(info.technicalRequirements||""))upInfo("technicalRequirements",e.target.value);}}/>
            </div>
          </div>
        </div>
      )}

      {tab==="transits"&&(
        <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)",overflowX:"auto"}}>
          {projSeries.length===0?
            <div style={{color:"#475569",fontSize:14}}>Нет серий</div>
          :(
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:320}}>
              <thead>
                <tr>
                  {["Серия","Рекламный","Безрекламный"].map((h,i)=>(
                    <th key={i} style={{textAlign:"left",padding:"6px 10px",fontSize:11,
                      color:"#64748b",letterSpacing:1,borderBottom:"1px solid #334155",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projSeries.map(ser=>(
                  <tr key={ser.id} style={{borderBottom:"1px solid #1e293b"}}>
                    <td style={{padding:"6px 10px",fontWeight:700,fontSize:13,whiteSpace:"nowrap"}}>{ser.name}</td>
                    <td style={{padding:"4px 6px",minWidth:200}}>
                      <input defaultValue={ser.transitCodeAd||""} style={{...iSt,fontSize:12,padding:"4px 8px"}}
                        onBlur={e=>{if(e.target.value!==(ser.transitCodeAd||""))upSer(ser.id,{transitCodeAd:e.target.value});}}/>
                    </td>
                    <td style={{padding:"4px 6px",minWidth:200}}>
                      <input defaultValue={ser.transitCodeNoAd||""} style={{...iSt,fontSize:12,padding:"4px 8px"}}
                        onBlur={e=>{if(e.target.value!==(ser.transitCodeNoAd||""))upSer(ser.id,{transitCodeNoAd:e.target.value});}}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab==="access"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(245,158,11,.35)"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fbbf24",marginBottom:8}}>Реквизиты доступа скрыты</div>
            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
              Сохранённые ранее логины, пароли и токены не передаются в приложение. До согласования переноса они остаются в исходной базе без изменений.
            </div>
            {(dossier.accesses||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
              {(dossier.accesses||[]).map((item,idx)=><span key={item.id||idx} style={{fontSize:11,color:"#cbd5e1",background:"#0f172a",border:"1px solid #334155",borderRadius:999,padding:"5px 9px"}}>
                {item.label||`Запись ${idx+1}`}{item.credentialsStored?" · сохранено в защищённом контуре":""}
              </span>)}
            </div>}
          </div>
          {[
            {key:"paths",title:"Пути на сервере",
              fields:[{k:"label",ph:"Название"},{k:"path",ph:"Путь"}],
              empty:{label:"",path:""}},
            {key:"links",title:"Ссылки",
              fields:[{k:"label",ph:"Название"},{k:"url",ph:"URL"}],
              empty:{label:"",url:""}},
          ].map(({key,title,fields,empty})=>{
            const items=dossier[key]||[];
            return (
              <div key={key} style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#94a3b8"}}>{title}</span>
                  <Btn small variant="default" onClick={()=>upDoss(key,[...items,{...empty}])}>+ Добавить</Btn>
                </div>
                {items.length===0&&<div style={{color:"#475569",fontSize:12}}>Пусто</div>}
                {items.map((item,idx)=>(
                  <div key={idx} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                    {fields.map(({k,ph})=>{
                      return (
                        <div key={k} style={{flex:1,position:"relative"}}>
                          <input type="text"
                            defaultValue={item[k]||""} placeholder={ph} style={iSt}
                            onBlur={e=>{
                              if(e.target.value!==(item[k]||"")){
                                const ni=[...items];ni[idx]={...ni[idx],[k]:e.target.value};
                                upDoss(key,ni);
                              }
                            }}/>
                        </div>
                      );
                    })}
                    <button onClick={()=>upDoss(key,items.filter((_,i)=>i!==idx))}
                      style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",
                        fontSize:18,padding:"0 4px",flexShrink:0,lineHeight:1}}>×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab==="notes"&&(
        <div style={{background:"rgba(30,41,59,.72)",borderRadius:16,padding:20,border:"1px solid rgba(148,163,184,.18)"}}>
          <label style={lSt}>ЗАМЕТКИ</label>
          <textarea defaultValue={dossier.notes||""} rows={14} style={{...iSt,resize:"vertical"}}
            onBlur={e=>{if(e.target.value!==(dossier.notes||""))upDoss("notes",e.target.value);}}/>
        </div>
      )}

      {editSeries&&(
        <SeriesModal series={editSeries} project={proj} data={data}
          templates={data.templates||[]}
          onSave={saveSeries}
          onClose={()=>setEditSeries(null)}/>
      )}
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────
// ── COMMAND PALETTE ──────────────────────────────────────────────────
function CommandPalette({data,onClose,onNavigate,onSetView,onSetGanttDay}){
  const [query,setQuery]=useState("");
  const [selIdx,setSelIdx]=useState(0);
  const inputRef=useRef(null);
  const listRef=useRef(null);

  useEffect(()=>{inputRef.current?.focus();},[]);
  useEffect(()=>{setSelIdx(0);},[query]);

  const NAV_CMDS=[
    {id:"today",    label:"Сегодня",   sub:"расписание на сегодня",   icon:"📅"},
    {id:"gantt",    label:"Гант",      sub:"диаграмма Ганта",         icon:"📊"},
    {id:"calendar", label:"Календарь", sub:"календарный вид",         icon:"🗓"},
    {id:"projects", label:"Проекты",   sub:"список проектов",         icon:"📁"},
    {id:"people",   label:"По людям",  sub:"нагрузка людей",          icon:"👥"},
    {id:"days",     label:"\u041d\u0415\u0414\u0415\u041b\u042f", sub:"\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0432\u0438\u0434", icon:""},
    {id:"analytics",label:"Аналитика", sub:"статистика и отчёты",     icon:"📈"},
    {id:"directory",label:"Настройки", sub:"этапы, роли, праздники",  icon:"⚙"},
  ];

  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return [];
    const words=q.split(/\s+/);
    const score=(text)=>{
      const t=(text||"").toLowerCase();
      if(!words.every(w=>t.includes(w))) return 0;
      if(t.startsWith(q)) return 3;
      if(t.includes(q)) return 2;
      return 1;
    };

    // Detect "create" intent
    const CREATE_TRIGGERS=["создать","создат","добавить","новый","новая","новое","новую"];
    const isCreate=words.some(w=>CREATE_TRIGGERS.some(ct=>ct.startsWith(w)||w===ct));

    const items=[];

    if(isCreate){
      // Parse target entity
      const isSmen=words.some(w=>["смену","смены","смен","задачу","задач","задачи","шифт"].includes(w));
      const isProj=words.some(w=>["проект","проекта","проекты"].includes(w));
      const isSer=words.some(w=>["серию","серии","серий","серия"].includes(w));

      // Parse task prefill: stage, project, date
      const parsePrefill=()=>{
        const today=new Date();
        const dateMap={"сегодня":0,"завтра":1,"послезавтра":2};
        let day=null,stageId=null,projectId=null;
        const STAGES=data.stages||DEFAULT_STAGES;
        words.forEach(w=>{
          if(dateMap[w]!==undefined){
            const d=new Date(today);d.setDate(d.getDate()+dateMap[w]);
            day=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
          }
          const dm=w.match(/^(\d{1,2})\.(\d{2})$/);
          if(dm) day=`${dm[1].padStart(2,"0")}.${dm[2]}.${today.getFullYear()}`;
          STAGES.forEach(s=>{
            const sl=s.label.toLowerCase();
            if(sl.includes(w)||w.includes(sl.slice(0,4))||s.id.includes(w)) stageId=s.id;
          });
          (data.projects||[]).forEach(p=>{
            const pl=(p.name||'').toLowerCase(),al=(p.abbr||"").toLowerCase();
            if(pl.includes(w)||al===w||w.includes(al)) projectId=p.id;
          });
        });
        return {day,stageId,projectId};
      };

      if(isSmen||(!isProj&&!isSer&&words.length>1)){
        const pf=parsePrefill();
        const proj=pf.projectId?(data.projects||[]).find(p=>p.id===pf.projectId):null;
        const stg=(data.stages||DEFAULT_STAGES).find(s=>s.id===pf.stageId);
        const hints=[stg?.label,proj?.name,pf.day].filter(Boolean);
        items.push({type:"create",createType:"task",score:20,icon:"",
          label:"Создать смену"+(hints.length?` — ${hints.join(", ")}`:""),
          sub:"Открыть Гант с заполненной формой",
          prefill:{status:pf.stageId||"",project:pf.projectId||"",day:pf.day||""},
        });
      }
      if(isProj||!isSmen){
        items.push({type:"create",createType:"project",score:18,icon:"📁",
          label:"Создать проект",sub:"Перейти в раздел Проекты → +",
        });
      }
      if(isSer||!isSmen){
        items.push({type:"create",createType:"series",score:17,icon:"🎬",
          label:"Создать серию",sub:"Перейти в Проекты и добавить серию",
        });
      }
    }

    NAV_CMDS.forEach(cmd=>{
      const s=score(`${cmd.label} ${cmd.sub} ${cmd.id}`);
      if(s>0) items.push({type:"nav",id:cmd.id,label:cmd.label,sub:cmd.sub,icon:cmd.icon,score:s+10});
    });
    (data.projects||[]).forEach(p=>{
      const s=score(`${p.name} ${p.abbr||""} ${p.description||""}`);
      if(s>0) items.push({type:"project",id:p.id,label:p.name,
        sub:[p.abbr,p.description].filter(Boolean).join(" · "),color:p.color,score:s});
    });
    (data.series||[]).forEach(ser=>{
      const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
      const s=score(`${ser.name} ${proj?.name||""} ${proj?.abbr||""}`);
      if(s>0) items.push({type:"series",id:ser.id,
        label:`${proj?.abbr||proj?.name||""} · ${ser.name}`,
        sub:proj?.name||"",color:proj?.color,score:s});
    });
    (data.people||[]).filter(p=>p.active!==false).forEach(p=>{
      const s=score(p.name);
      if(s>0) items.push({type:"person",id:p.id,label:p.name,
        sub:(p.roles||[]).join(", "),score:s});
    });
    // Tasks + notes search
    const STAGES=data.stages||DEFAULT_STAGES;
    (data.tasks||[]).filter(t=>!t.cancelled).forEach(t=>{
      const proj=(data.projects||[]).find(p=>p.id===t.project);
      const stg=STAGES.find(s=>s.id===t.status);
      const searchText=[t.series,t.person,proj?.name,proj?.abbr,stg?.label,canSeeTaskNotes()?t.note:"",t.day].filter(Boolean).join(" ");
      const s=score(searchText);
      if(s>0) items.push({type:"task",id:t.id,task:t,
        label:`${t.series}${t.person?" · "+t.person:""}`,
        sub:[t.day,stg?.label,canSeeTaskNotes()?t.note:""].filter(Boolean).join(" · "),
        color:proj?.color,score:s});
    });
    const ORDER={create:-1,nav:0,project:1,series:2,person:3,task:4};
    return items.sort((a,b)=>b.score-a.score||(ORDER[a.type]||9)-(ORDER[b.type]||9)).slice(0,30);
  },[query,data]);

  useEffect(()=>{
    if(!listRef.current) return;
    const el=listRef.current.querySelector("[data-sel=true]");
    el?.scrollIntoView({block:"nearest"});
  },[selIdx]);

  function handleKey(e){
    if(e.key==="Escape"){e.stopPropagation();onClose();return;}
    if(e.key==="ArrowDown"){e.preventDefault();setSelIdx(i=>Math.min(i+1,results.length-1));}
    if(e.key==="ArrowUp"){e.preventDefault();setSelIdx(i=>Math.max(i-1,0));}
    if(e.key==="Enter"){e.preventDefault();if(results[selIdx]) pick(results[selIdx]);}
  }
  function pick(item){
    if(item.type==="nav"){onSetView(item.id);onNavigate(null);}
    else if(item.type==="project") onNavigate({type:"project",id:item.id});
    else if(item.type==="series")  onNavigate({type:"series", id:item.id});
    else if(item.type==="person")  onNavigate({type:"person", id:item.id});
    else if(item.type==="task"){
      onSetGanttDay?.(item.task.day);
      onSetView("gantt");onNavigate(null);
      setTimeout(()=>window.dispatchEvent(new CustomEvent("gantt-new-task",{detail:item.task})),80);
    }
    else if(item.type==="create"){
      if(item.createType==="task"){
        onSetView("gantt");onNavigate(null);
        setTimeout(()=>window.dispatchEvent(new CustomEvent("gantt-new-task",{detail:item.prefill||{}})),80);
      } else if(item.createType==="project"||item.createType==="series"){
        onSetView("projects");onNavigate(null);
      }
    }
    onClose();
  }

  const TYPE_LABELS={create:"СОЗДАТЬ",nav:"НАВИГАЦИЯ",project:"ПРОЕКТЫ",series:"СЕРИИ",person:"ЛЮДИ",task:"ЗАДАЧИ"};
  const displayList=useMemo(()=>{
    const out=[];let lastType=null;
    results.forEach((r,idx)=>{
      if(r.type!==lastType){out.push({isHeader:true,label:TYPE_LABELS[r.type]||r.type,key:"h-"+r.type});lastType=r.type;}
      out.push({...r,flatIdx:idx});
    });
    return out;
  },[results]);

  const kbd={fontSize:10,color:"#475569",background:"#0f172a",border:"1px solid #334155",
    borderRadius:4,padding:"1px 5px",fontFamily:"inherit",display:"inline-block"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:9999,
      display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"8vh"}}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,
        width:"min(640px,92vw)",maxHeight:"70vh",display:"flex",flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.65)",overflow:"hidden"}}>

        <div style={{display:"flex",alignItems:"center",padding:"12px 16px",
          borderBottom:"1px solid #334155",gap:10}}>
          <span style={{fontSize:14,color:"#475569",flexShrink:0}}>🔍</span>
          <input ref={inputRef} value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Поиск или «создать смену монтажа СВ завтра»..."
            style={{flex:1,background:"none",border:"none",outline:"none",
              fontSize:15,color:"#e2e8f0",fontFamily:"inherit"}}/>
          {query&&<button onClick={()=>setQuery("")}
            style={{background:"none",border:"none",color:"#475569",cursor:"pointer",
              fontSize:13,padding:"2px 4px",lineHeight:1}}>✕</button>}
          <span style={kbd}>ESC</span>
        </div>

        <div ref={listRef} style={{overflowY:"auto",flex:1}}>
          {!query.trim()&&(
            <div style={{padding:"18px 16px"}}>
              <div style={{fontSize:12,color:"#475569",marginBottom:10}}>
                Поиск по проектам, сериям и людям. Или напишите «создать смену монтажа СВ завтра»
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
                <span><span style={kbd}>↑</span> <span style={kbd}>↓</span> навигация</span>
                <span><span style={kbd}>Enter</span> открыть</span>
                <span><span style={kbd}>Esc</span> закрыть</span>
                <span><span style={kbd}>Ctrl+K</span> открыть</span>
              </div>
            </div>
          )}
          {query.trim()&&results.length===0&&(
            <div style={{padding:"28px 16px",textAlign:"center",color:"#475569",fontSize:13}}>
              Ничего не найдено по запросу «{query}»
            </div>
          )}
          {displayList.map((item,i)=>{
            if(item.isHeader) return (
              <div key={item.key} style={{padding:"8px 16px 3px",fontSize:10,
                color:"#334155",letterSpacing:2,fontWeight:700}}>{item.label}</div>
            );
            const sel=item.flatIdx===selIdx;
            return (
              <div key={item.type+(item.id||item.createType||i)} data-sel={sel}
                onMouseEnter={()=>setSelIdx(item.flatIdx)}
                onClick={()=>pick(item)}
                style={{padding:"7px 16px",cursor:"pointer",display:"flex",
                  alignItems:"center",gap:10,background:sel?"#334155":"transparent"}}>
                {item.icon?(
                  <span style={{fontSize:13,width:18,textAlign:"center",flexShrink:0}}>{item.icon}</span>
                ):item.color?(
                  <span style={{width:8,height:8,borderRadius:"50%",background:item.color,
                    flexShrink:0,display:"inline-block"}}/>
                ):(
                  <span style={{width:18,fontSize:11,color:"#475569",flexShrink:0,textAlign:"center"}}>·</span>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
                  {item.sub&&<div style={{fontSize:11,color:"#64748b",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.sub}</div>}
                </div>
                {sel&&<span style={{fontSize:11,color:"#475569",flexShrink:0}}>↵</span>}
              </div>
            );
          })}
        </div>

        {results.length>0&&(
          <div style={{padding:"5px 16px",borderTop:"1px solid #1e293b",
            fontSize:10,color:"#334155"}}>
            Найдено: {results.length}
          </div>
        )}
      </div>
    </div>
  );
}

// Массивы сущностей, у которых возможен soft-delete
const SOFT_DELETE_KEYS=["tasks","projects","series","people","personAbsences"];

// ── АВТОРИЗАЦИЯ ────────────────────────────────────────────────────
async function doLogin(login,password){
  const res=await fetch("/api/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({login,password})
  });
  const data=await res.json();
  setCsrfToken(data.csrfToken);
  return data;
}

async function doLogout(){
  await csrfFetch("/api/auth/logout",{method:"POST",credentials:"include"});
  setCsrfToken("");
}

// ── СЧЁТЧИК (одометр / механический счётчик пробега) ──────────
function FlipUnit({digit}){
  const [rolling,setRolling]=React.useState(false);
  const curRef=React.useRef(digit);
  
  React.useEffect(()=>{
    if(curRef.current!==digit){
      setRolling(true);
      const t=setTimeout(()=>{
        curRef.current=digit;
        setRolling(false);
      },220);
      return ()=>clearTimeout(t);
    }
  },[digit]);

  const d=rolling?curRef.current:digit;

  return (
    <span style={{display:"inline-flex",flexDirection:"column",width:16,height:24,
      position:"relative",overflow:"hidden",textAlign:"center",flexShrink:0,
      fontFamily:"'Space Grotesk','Courier New',monospace",fontWeight:700,fontSize:16,
      color:"#e2e8f0",background:"#1e293b",borderRadius:3,border:"1px solid #334155",
      margin:"0 1px"}}>
      <span style={{
        display:"flex",flexDirection:"column",
        transform:rolling?"translateY(-50%)":"translateY(0)",
        transition:rolling?"transform 0.22s ease-out":"none"
      }}>
        <span style={{height:24,lineHeight:"24px"}}>{d}</span>
        <span style={{height:24,lineHeight:"24px"}}>{digit}</span>
      </span>
    </span>
  );
}

function FlipClock(){
  const [time,setTime]=React.useState(new Date());
  React.useEffect(()=>{
    const id=setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(id);
  },[]);
  const h=time.getHours(), m=time.getMinutes(), s=time.getSeconds();

  const Sep=()=><span style={{color:"#60a5fa",fontWeight:700,fontSize:14,
    lineHeight:'24px',margin:'0 1px',userSelect:'none'}}>:</span>;

  return (
    <span style={{display:"flex",alignItems:"center",gap:0,flexShrink:0,marginRight:8}}>
      <FlipUnit digit={Math.floor(h/10)}/>
      <FlipUnit digit={h%10}/>
      <Sep/>
      <FlipUnit digit={Math.floor(m/10)}/>
      <FlipUnit digit={m%10}/>
      <Sep/>
      <FlipUnit digit={Math.floor(s/10)}/>
      <FlipUnit digit={s%10}/>
    </span>
  );
}

function LoginForm({onLogin,error}){
  const [l,setL]=React.useState("");
  const [p,setP]=React.useState("");
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",
      background:"#0f172a",color:"#e2e8f0"}}>
      <div style={{background:"#1e293b",borderRadius:12,padding:32,width:320,
        border:"1px solid #334155"}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:1,textAlign:"center",marginBottom:4}}>
          ПОСТ ТРЕКЕР
        </div>
        <div style={{fontSize:12,color:"#475569",textAlign:"center",marginBottom:24}}>
          Вход в систему
          <div className="ppt-author">Создано Максимом Ефремовым</div>
        </div>
        {error&&<div style={{background:"#7f1d1d",color:"#fca5a5",padding:"6px 12px",
          borderRadius:10,fontSize:12,marginBottom:12}}>{error}</div>}
        <input value={l} onChange={e=>setL(e.target.value)} placeholder="Логин"
          style={{width:"100%",padding:"8px 12px",background:"#0f172a",border:"1px solid #334155",
            borderRadius:10,color:"#e2e8f0",fontSize:14,fontFamily:"inherit",marginBottom:8,
            boxSizing:"border-box"}}
          onKeyDown={e=>e.key==="Enter"&&document.getElementById("login-pw").focus()}/>
        <input id="login-pw" value={p} onChange={e=>setP(e.target.value)} type="password"
          placeholder="Пароль"
          style={{width:"100%",padding:"8px 12px",background:"#0f172a",border:"1px solid #334155",
            borderRadius:10,color:"#e2e8f0",fontSize:14,fontFamily:"inherit",marginBottom:16,
            boxSizing:"border-box"}}
          onKeyDown={e=>{if(e.key==="Enter")onLogin(l,p);}}/>
        <button onClick={()=>onLogin(l,p)}
          style={{width:"100%",padding:"8px",background:"#2563eb",border:"none",borderRadius:10,
            color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
          Войти
        </button>
      </div>
    </div>
  );
}

function UsersView({user,onUserUpdate}){
  const [users,setUsers]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [syncing,setSyncing]=React.useState(false);

  React.useEffect(()=>{loadUsers();},[]);

  async function loadUsers(){
    try{
      const r=await fetch("/api/users",{credentials:"include"});
      if(r.ok)setUsers(await r.json());
    }catch(e){}
    setLoading(false);
  }

  async function changeRole(id,role){
    const r=await csrfFetch(`/api/users/${id}/role`,{method:"PUT",
      headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify({role})});
    if(r.ok){
      const updated=await r.json();
      setUsers(u=>u.map(x=>x.id===id?{...x,role:updated.role}:x));
    }
  }

  async function syncAD(){
    setSyncing(true);
    try{
      await csrfFetch("/api/users/sync",{method:"POST",credentials:"include"});
      await loadUsers();
    }catch(e){}
    setSyncing(false);
  }

  const [showDisabled,setShowDisabled]=React.useState(false);
  const filteredUsers=users.filter(u=>showDisabled||u.ad_enabled!==false);
  const roleGroups={};
  for(const u of filteredUsers){
    const role=u.role||"viewer";
    if(!roleGroups[role]) roleGroups[role]=[];
    roleGroups[role].push(u);
  }
  const roleOrder=["admin","lead","manager","editor","viewer","na"];
  const roleLabels={admin:"\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u044b",lead:"LEAD",manager:"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b",editor:"\u0420\u0435\u0434\u0430\u043a\u0442\u043e\u0440\u044b",viewer:"\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0449\u0438\u043a\u0438",na:"\u0411\u0435\u0437 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 (NA)"};

  return (
    <div style={{padding:"20px 24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h3 style={{margin:0,fontSize:16}}>👥 Роли</h3>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#64748b"}}>Всего: {filteredUsers.length}</span>
          <button onClick={()=>setShowDisabled(!showDisabled)}
            style={{background:showDisabled?"#1e3a5f":"#1e293b",border:"1px solid #334155",borderRadius:10,
              padding:"5px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {showDisabled?"OK Все":" Только активные"}
          </button>
          {RUNTIME.mode!=="local-demo"&&<button onClick={syncAD} disabled={syncing}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
              padding:"5px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {syncing?"⏳ Синхронизация...":"🔄 Синхр. AD"}
          </button>}
        </div>
      </div>
      {loading?<div style={{color:"#475569"}}>Загрузка...</div>:
      roleOrder.map(role=>{
        const items=roleGroups[role]||[];
        if(!items.length) return null;
        return (
          <div key={role} style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:8,
              borderBottom:"1px solid #1e293b",paddingBottom:4}}>
              {roleLabels[role]||role} <span style={{fontWeight:400,fontSize:11,color:"#475569"}}>({items.length})</span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{color:"#64748b",fontSize:11}}>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Имя</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Логин</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Группы AD</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Роль</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Статус</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Вход</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u=>(
                  <tr key={u.id} style={{borderBottom:"1px solid #0f172a",opacity:u.ad_enabled===false?0.5:1}}>
                    <td style={{padding:"4px 8px"}}>{u.display_name}</td>
                    <td style={{padding:"4px 8px",color:"#64748b",fontSize:11}}>{u.sam_name}</td>
                    <td style={{padding:"4px 8px",color:"#64748b",fontSize:11}}>
                      {(u.ad_groups||[]).slice(0,3).join(", ")}{(u.ad_groups||[]).length>3?", ...":""}
                    </td>
                    <td style={{padding:"4px 8px"}}>
                      <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                        style={{background:"#0f172a",color:"#e2e8f0",border:"1px solid #334155",
                          borderRadius:4,padding:"2px 4px",fontSize:12,fontFamily:"inherit"}}>
                        <option value="admin">admin</option>
                        <option value="lead">lead</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="viewer">viewer</option>
                        <option value="na">na (без доступа)</option>
                      </select>
                    </td>
                    <td style={{padding:"4px 8px",fontSize:11}}>
                      <span style={{color:u.ad_enabled===false?"#ef4444":"#22c55e"}}>
                        {u.ad_enabled===false?"! Заблокирован":"🟢 Активен"}
                      </span>
                    </td>
                    <td style={{padding:"4px 8px",fontSize:11,color:"#475569"}}>
                      {u.last_login?new Date(u.last_login).toLocaleDateString("ru-RU"):"—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ── ОСНОВНОЕ ПРИЛОЖЕНИЕ ─────────────────────────────────────────────


const MT={
  search:"\u041f\u043e\u0438\u0441\u043a",
  shifts:"\u0421\u043c\u0435\u043d\u044b",
  logout:"\u0412\u044b\u0439\u0442\u0438",
  today:"\u0421\u0435\u0433\u043e\u0434\u043d\u044f",
  tomorrow:"\u0417\u0430\u0432\u0442\u0440\u0430",
  calendar:"\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c",
  projects:"\u041f\u0440\u043e\u0435\u043a\u0442\u044b",
  people:"\u041b\u044e\u0434\u0438",
  conflicts:"\u041a\u043e\u043d\u0444\u043b.",
  conflictsFull:"\u041a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u044b",
  birthdays:"\u0414\u043d\u0438 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f",
  birthdayShort:"\u0414\u0420",
  checkConflicts:"\u041d\u0443\u0436\u043d\u043e \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u043a\u043e\u043d\u0444\u043b\u0438\u043a\u0442\u044b",
  noShifts:"\u0421\u043c\u0435\u043d \u043d\u0435\u0442",
  noEvents:"\u041d\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c \u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435\u0442",
  series:"\u0441\u0435\u0440\u0438\u0439",
  todayLower:"\u0441\u0435\u0433\u043e\u0434\u043d\u044f",
  shiftShort:"\u0441\u043c\u0435\u043d",
  more:"\u0435\u0449\u0435",
  air:"\u042d\u0444\u0438\u0440",
  searchPerson:"\u041f\u043e\u0438\u0441\u043a \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430",
  noPeople:"\u041d\u0438\u043a\u043e\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",
  archive:"\u0430\u0440\u0445\u0438\u0432",
  close:"\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
};

function useIsMobile(maxWidth=760){
  const [isMobile,setIsMobile]=useState(()=>typeof window!=="undefined"?window.innerWidth<=maxWidth:false);
  useEffect(()=>{
    const mq=window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange=()=>setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?mq.addEventListener("change",onChange):mq.addListener(onChange);
    return ()=>mq.removeEventListener?mq.removeEventListener("change",onChange):mq.removeListener(onChange);
  },[maxWidth]);
  return isMobile;
}
function MobilePanel({children,style,onClick}){
  return <div className="ppt-mobile-panel" onClick={onClick} style={style}>{children}</div>;
}
function MobileTopbar({user,syncState,onSearch,onLogout,onShifts}){
  return (
    <div className="ppt-mobile-topbar">
      <div>
        <div className="ppt-title ppt-mobile-brand">ПОСТ ТРЕКЕР</div>
        <div className="ppt-author">Создано Максимом Ефремовым</div>
        {RUNTIME.label&&<div style={{fontSize:10,color:"#fbbf24",fontWeight:800,letterSpacing:.8,marginTop:2}}>{RUNTIME.label}</div>}
        <div className="ppt-mobile-subtitle">{user?.display_name||""}</div>
      </div>
      <div className="ppt-mobile-actions">
        <button className="ppt-mobile-icon-btn" onClick={onSearch} title={MT.search}>{MT.search}</button>
        <button className="ppt-mobile-icon-btn" onClick={onShifts} title={MT.shifts}>{MT.shifts}</button>
        <span className={`ppt-mobile-sync ppt-mobile-sync-${syncState}`}>{syncState==="error"?"!":syncState==="saving"?"...":"OK"}</span>
        {RUNTIME.mode!=="local-demo"&&<button className="ppt-mobile-logout" onClick={onLogout}>{MT.logout}</button>}
      </div>
    </div>
  );
}
function MobileBottomNav({tabs,view,setView,navigate}){
  const allowed=new Set(["today","calendar","projects","people","conflicts"]);
  const items=tabs.filter(t=>allowed.has(t.id)).slice(0,5);
  const labels={today:MT.today,calendar:MT.calendar,projects:MT.projects,people:MT.people,conflicts:MT.conflicts};
  return (
    <div className="ppt-mobile-bottom-nav">
      {items.map(t=>(
        <button key={t.id} onClick={()=>{setView(t.id);navigate(null);}} className={view===t.id?"active":""}>
          <b>{labels[t.id]||t.label}</b>
        </button>
      ))}
    </div>
  );
}
function groupMobileTasks(tasks){
  const m={};
  (tasks||[]).forEach(t=>{
    const key=[t.project||"",t.series||"",t.status||"",t.from||0,t.to||0].join("|");
    if(!m[key]) m[key]={...t,tasks:[],people:[]};
    m[key].tasks.push(t);
    if(t.person&&!m[key].people.includes(t.person)) m[key].people.push(t.person);
  });
  return Object.values(m).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)||String(a.project||"").localeCompare(String(b.project||""))||String(a.series||"").localeCompare(String(b.series||"")));
}
function MobileTaskGroup({group,data,onOpenProject,onOpenPerson}){
  const proj=(data.projects||[]).find(p=>p.id===group.project);
  const people=group.people||[];
  return (
    <div className="ppt-mobile-task ppt-mobile-task-group" style={{borderLeftColor:proj?.color||"#64748b"}}>
      <div className="ppt-mobile-task-time">{fmtHour(group.from)}-{fmtHour(group.to)}</div>
      <div className="ppt-mobile-task-main">
        <button onClick={()=>proj&&onOpenProject(proj.id)} className="ppt-mobile-link">
          <ProjectMark project={proj} size={10}/><span>{proj?.abbr||proj?.name||group.project}</span>
        </button>
        <div className="ppt-mobile-task-title">{group.series||"-"}</div>
        <div className="ppt-mobile-task-meta"><StatusBadge s={group.status} small/>{group.tasks.length>1&&<span className="ppt-mobile-count">x{group.tasks.length}</span>}</div>
        <div className="ppt-mobile-people-row">
          {(people.length?people:["-"]).map(name=>{
            const person=(data.people||[]).find(p=>p.name===name);
            return <button key={name} onClick={()=>person&&onOpenPerson(person.id)}>{name}</button>;
          })}
        </div>
      </div>
    </div>
  );
}
function MobileTaskRow({task,data,onOpenProject,onOpenPerson}){
  return <MobileTaskGroup group={{...task,tasks:[task],people:task.person?[task.person]:[]}} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>;
}

function mobileDayInfo(data,day){
  const tasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.day===day);
  const airs=[];
  (data.series||[]).forEach(ser=>{
    const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
    if(!proj) return;
    if(generateSeriesAirDates(ser).includes(day)) airs.push({proj,ser});
  });
  const milestones=[];
  (data.series||[]).forEach(ser=>{
    const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
    if(!proj) return;
    getSeriesMilestoneEvents(ser,proj).filter(m=>m.date===day).forEach(m=>milestones.push({...m,proj,ser}));
  });
  const bdays=birthdayPeopleOnDate(data.people,day);
  return {day,tasks,airs,milestones,bdays,count:tasks.length+airs.length+milestones.length+bdays.length};
}
function MobileToday({data,conflictDetails,onOpenProject,onOpenPerson,onConflicts}){
  const todayStr=formatDate(new Date());
  const tomorrowStr=addDays(todayStr,1);
  const todayTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.day===todayStr).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0));
  const notifyConflicts=(conflictDetails||[]).filter(d=>d.notify!==false);
  const tomorrowTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.day===tomorrowStr).sort((a,b)=>(Number(a.from)||0)-(Number(b.from)||0)).slice(0,8);
  const birthdays=upcomingBirthdays(data.people,new Date(),7);
  return (
    <div className="ppt-mobile-stack">
      <div className="ppt-mobile-hero">
        <div><span>{MT.today}</span><strong>{todayTasks.length}</strong></div>
        <div><span>{MT.conflictsFull}</span><strong className={notifyConflicts.length?"danger":""}>{notifyConflicts.length}</strong></div>
        <div><span>{MT.tomorrow}</span><strong>{tomorrowTasks.length}</strong></div>
      </div>
      {birthdays.length>0&&<MobilePanel><div className="ppt-mobile-section-title">{MT.birthdays}</div><div className="ppt-mobile-chip-row">{birthdays.map(b=><span key={b.person.id||b.person.name} className="ppt-mobile-birthday-chip">{b.person.name} - {birthdayWhenText(b.diff)}</span>)}</div></MobilePanel>}
      {notifyConflicts.length>0&&<MobilePanel onClick={onConflicts} style={{borderColor:"rgba(248,113,113,.45)"}}><div className="ppt-mobile-alert">{MT.checkConflicts}: {notifyConflicts.length}</div></MobilePanel>}
      <MobilePanel><div className="ppt-mobile-section-title">{MT.today}</div>{todayTasks.length?groupMobileTasks(todayTasks).map(g=><MobileTaskGroup key={g.tasks.map(t=>t.id).join("-")} group={g} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>):<div className="ppt-mobile-empty">{MT.noShifts}</div>}</MobilePanel>
      <MobilePanel><div className="ppt-mobile-section-title">{MT.tomorrow}</div>{tomorrowTasks.length?groupMobileTasks(tomorrowTasks).map(g=><MobileTaskGroup key={g.tasks.map(t=>t.id).join("-")} group={g} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>):<div className="ppt-mobile-empty">{MT.noShifts}</div>}</MobilePanel>
    </div>
  );
}
function MobileCalendar({data,onOpenProject,onOpenPerson}){
  const today=new Date(); today.setHours(0,0,0,0);
  const [cursor,setCursor]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1));
  const [selected,setSelected]=useState(()=>formatDate(today));
  const year=cursor.getFullYear(), month=cursor.getMonth();
  const cells=useMemo(()=>{
    const first=new Date(year,month,1);
    const offset=(first.getDay()+6)%7;
    const start=new Date(year,month,1-offset);
    return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d;});
  },[year,month]);
  const selectedInfo=mobileDayInfo(data,selected);
  function shiftMonth(delta){setCursor(d=>new Date(d.getFullYear(),d.getMonth()+delta,1));}
  return (
    <div className="ppt-mobile-stack">
      <MobilePanel>
        <div className="ppt-mobile-month-head">
          <button onClick={()=>shiftMonth(-1)}>Prev</button>
          <strong>{MONTHS[month]} {year}</strong>
          <button onClick={()=>shiftMonth(1)}>Next</button>
        </div>
        <div className="ppt-mobile-weekdays">{["\u041f\u043d","\u0412\u0442","\u0421\u0440","\u0427\u0442","\u041f\u0442","\u0421\u0431","\u0412\u0441"].map(d=><span key={d}>{d}</span>)}</div>
        <div className="ppt-mobile-month-grid">
          {cells.map(d=>{
            const ds=formatDate(d);
            const info=mobileDayInfo(data,ds);
            const inMonth=d.getMonth()===month;
            const isToday=ds===formatDate(today);
            const isSelected=ds===selected;
            const projIds=[...new Set(info.tasks.map(t=>t.project))].slice(0,4);
            return (
              <button key={ds} className={`${inMonth?"":"muted"} ${isToday?"today":""} ${isSelected?"selected":""}`} onClick={()=>setSelected(ds)}>
                <span>{d.getDate()}</span>
                <div className="ppt-mobile-day-dots">
                  {info.bdays.length>0&&<i className="birthday"/>}
                  {info.airs.length>0&&<i className="air"/>}
                  {info.milestones.length>0&&<i className="milestone"/>}
                  {projIds.map(pid=>{const p=(data.projects||[]).find(x=>x.id===pid);return <i key={pid} style={{background:p?.color||"#64748b"}}/>;})}
                </div>
                {info.count>0&&<em>{info.count}</em>}
              </button>
            );
          })}
        </div>
      </MobilePanel>
      <MobilePanel>
        <div className="ppt-mobile-day-head"><strong>{dayLabel(selected)}</strong><span>{selectedInfo.count}</span></div>
        {selectedInfo.bdays.map(p=><div key={`b${p.id||p.name}`} className="ppt-mobile-calendar-note birthday">{MT.birthdayShort} {p.name}</div>)}
        {selectedInfo.airs.map(({proj,ser},i)=><div key={`a${proj.id}${ser.id}${i}`} className="ppt-mobile-calendar-note air" onClick={()=>onOpenProject(proj.id)}>{MT.air}: {proj.abbr||proj.name} {ser.name}</div>)}
        {selectedInfo.milestones.map((m,i)=><div key={`m${i}`} className="ppt-mobile-calendar-note" style={{borderLeftColor:m.color,color:"#f8fafc"}} onClick={()=>onOpenProject(m.proj.id)}>{m.label} - {m.proj.abbr||m.proj.name} {m.ser.name}</div>)}
        {groupMobileTasks(selectedInfo.tasks).map(g=><MobileTaskGroup key={g.tasks.map(t=>t.id).join("-")} group={g} data={data} onOpenProject={onOpenProject} onOpenPerson={onOpenPerson}/>) }
        {selectedInfo.count===0&&<div className="ppt-mobile-empty">{MT.noEvents}</div>}
      </MobilePanel>
    </div>
  );
}
function MobileProjects({data,onOpenProject}){
  const today=formatDate(new Date());
  const projects=(data.projects||[]).filter(p=>p.status!==MT.archive);
  return <div className="ppt-mobile-stack">{projects.map(p=>{
    const tasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.project===p.id);
    const todayCount=tasks.filter(t=>t.day===today).length;
    const seriesCount=(data.series||[]).filter(s=>s.projectId===p.id&&!s.deleted).length;
    return <MobilePanel key={p.id} onClick={()=>onOpenProject(p.id)} style={{borderTop:`3px solid ${p.color||"#64748b"}`}}>
      <div className="ppt-mobile-project-title"><ProjectMark project={p} size={12}/><strong>{p.name}</strong></div>
      <div className="ppt-mobile-chip-row"><span>{seriesCount} {MT.series}</span><span>{todayCount} {MT.todayLower}</span><span>{tasks.length} {MT.shiftShort}</span></div>
    </MobilePanel>;
  })}</div>;
}
function MobilePeople({data,onOpenPerson}){
  const [q,setQ]=useState("");
  const today=formatDate(new Date());
  const people=(data.people||[]).filter(p=>p.active!==false&&!p.deleted).filter(p=>!q.trim()||String(p.name||"").toLowerCase().includes(q.trim().toLowerCase()));
  return <div className="ppt-mobile-stack"><input className="ppt-mobile-search" value={q} onChange={e=>setQ(e.target.value)} placeholder={MT.searchPerson}/>{people.map(p=>{
    const todayTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.person===p.name&&t.day===today);
    const diff=birthdayDiffDays(p.birthday,new Date());
    return <MobilePanel key={p.id||p.name} onClick={()=>onOpenPerson(p.id)}>
      <div className="ppt-mobile-person"><div>{(p.name||"?")[0]}</div><strong>{p.name}</strong></div>
      <div className="ppt-mobile-chip-row"><span>{todayTasks.length} {MT.todayLower}</span>{diff!=null&&diff<=7&&<span>{MT.birthdayShort} {birthdayWhenText(diff)}</span>}</div>
    </MobilePanel>;
  })}{people.length===0&&<MobilePanel><div className="ppt-mobile-empty">{MT.noPeople}</div></MobilePanel>}</div>;
}
function MobileWorkspace({view,data,conflictDetails,setView,navigate}){
  const openProject=id=>navigate({type:"project",id});
  const openPerson=id=>id&&navigate({type:"person",id});
  if(view==="calendar") return <MobileCalendar data={data} onOpenProject={openProject} onOpenPerson={openPerson}/>;
  if(view==="projects") return <MobileProjects data={data} onOpenProject={openProject}/>;
  if(view==="people") return <MobilePeople data={data} onOpenPerson={openPerson}/>;
  if(view==="conflicts") return <ConflictsView details={conflictDetails} data={data}/>;
  return <MobileToday data={data} conflictDetails={conflictDetails} onOpenProject={openProject} onOpenPerson={openPerson} onConflicts={()=>setView("conflicts")}/>;
}

function App(){
  const [rawData,setRawData]=useState(null);
  const [view,setView]=useState("today");
  const [navState,setNavState]=useState(()=>parseHash());
  const [syncState,setSyncState]=useState("ok");
  const [syncError,setSyncError]=useState("");
  const [dayShiftsModal,setDayShiftsModal]=useState(false);
  const [ganttDay,setGanttDay]=useState(null);
  const [cmdPaletteOpen,setCmdPaletteOpen]=useState(false);
  const isMobile=useIsMobile(760);

  const [user,setUser]=useState(null);
  const [loginError,setLoginError]=useState(null);
  const saveTimer=useRef(null);
  const clientIdRef=useRef(Math.random().toString(36).slice(2));
  const saveQueueRef=useRef(null);
  const unsavedRef=useRef(false);
  const serverRevisionRef=useRef(null);
  const backupAccountRef=useRef(null);
  const logHistoryRef=useRef([]);
  const rawDataRef=useRef(null);
  rawDataRef.current=rawData;
  backupAccountRef.current=user;
  if(!saveQueueRef.current) saveQueueRef.current=createSaveQueue(
    payload=>cloudSave({...payload,_revision:serverRevisionRef.current??payload._revision},clientIdRef.current).then(result=>{serverRevisionRef.current=result._revision;return result;}),
    merged=>{
      if(saveTimer.current) return;
      unsavedRef.current=false;
      logHistoryRef.current=merged.changelog||[];
      setSyncState("ok");setSyncError("");setRawData(merged);
      try{persistAccountBackup(backupAccountRef.current,merged);}catch(e){}
    },
    error=>{if(!saveTimer.current){setSyncState("error");setSyncError(error.message);}}
  );

  // Чистые данные без удалённых — передаются во все дочерние компоненты
  const data=useMemo(()=>{
    if(!rawData) return null;
    const d={...rawData};
    for(const key of SOFT_DELETE_KEYS){
      if(Array.isArray(rawData[key])) d[key]=rawData[key].filter(x=>!x.deleted);
    }
    return d;
  },[rawData]);

  useEffect(()=>{
    setSyncState("saving");
    let currentAccount=null;
    fetch("/api/auth/me",{credentials:"include"})
      .then(r=>r.ok?r.json():null)
      .then(d=>{if(d){setCsrfToken(d.csrfToken);if(d.user){currentAccount=d.user;setUser(d.user);}}})
      .catch(()=>{})
      .then(()=>cloudLoad())
      .then(record=>{
        serverRevisionRef.current=record?._revision;
        // Сид только если бин реально пустой (нет ни проектов, ни задач, ни людей)
        const isReallyEmpty=!record||(!record.projects?.length&&!record.tasks?.length&&!record.people?.length);
        if(isReallyEmpty){
          record=normalizeLoadedData({_revision:record?._revision,projects:[],tasks:[],people:[],series:[],roles:DEMO_ROLES,stages:DEFAULT_STAGES,stageGroups:DEFAULT_STAGE_GROUPS,holidays:DEFAULT_HOLIDAYS,personAbsences:[],templates:[],changelog:[]});
          setRawData(record);
          if(["admin","lead"].includes(currentAccount?.role)) return cloudSave(record);
          return;
        }
        let migrated=false;
        if(!record.roles){record.roles=DEMO_ROLES;migrated=true;}
        if(!record.stages||!record.stages.length){record.stages=DEFAULT_STAGES;migrated=true;}
        if(!record.stageGroups||!record.stageGroups.length){record.stageGroups=DEFAULT_STAGE_GROUPS;migrated=true;}
        if(!record.holidays){record.holidays=DEFAULT_HOLIDAYS;migrated=true;}
        if(!record.personAbsences){record.personAbsences=[];migrated=true;}
        if(!record.templates){record.templates=[];migrated=true;}
        if(!record.changelog){record.changelog=[];migrated=true;}
        if(!record.series){
          record.series=[];
          (record.projects||[]).forEach(proj=>{
            (proj.series||[]).forEach((name,idx)=>{
              record.series.push({
                id:proj.id+"-"+name.toLowerCase().replace(/\s/g,"_"),
                projectId:proj.id,name,order:idx,
                shootStart:proj.shoot_start||"",shootEnd:proj.shoot_end||"",
                editStart:proj.edit_start||"",preOtkDate:proj.pre_otk||"",
                otkDate:proj.otk||"",airDate:"",
                airMode:proj.air_mode||"weekly",airDay:proj.air_weekday||1,airTime:proj.air_time||"21:00",
              });
            });
          });
          migrated=true;
        }
        if((record.tasks||[]).some(t=>t.seriesId===undefined)){
          record.tasks=(record.tasks||[]).map(t=>{
            if(t.seriesId!==undefined) return t;
            const ser=(record.series||[]).find(s=>s.projectId===t.project&&s.name===t.series);
            return{...t,seriesId:ser?ser.id:null,autogenerated:t.autogenerated||false};
          });
          migrated=true;
        }
        if((record.series||[]).some(s=>!s.checklists||s.stageRanges===undefined)){
          record.series=(record.series||[]).map(s=>({
            checklists:[],notes:"",delivered:false,deliveredAt:"",
            stageRanges:{},
            ...s,
          }));
          migrated=true;
        }
        if((record.projects||[]).some(p=>!p.dossier)){
          record.projects=(record.projects||[]).map(p=>p.dossier?p:
            {...p,dossier:{info:{},paths:[],accesses:[],links:[],notes:""}});
          migrated=true;
        }
        if((record.series||[]).some(s=>s.transitCode===undefined)){
          record.series=(record.series||[]).map(s=>s.transitCode!==undefined?s:
            {...s,transitCode:"",transitVariants:["","",""]});
          migrated=true;
        }
        if((record.series||[]).some(s=>s.syncStart===undefined)){
          record.series=(record.series||[]).map(s=>s.syncStart!==undefined?s:
            {...s,syncStart:""});
          migrated=true;
        }
        if((record.series||[]).some(s=>!s.assets)){
          record.series=(record.series||[]).map(s=>s.assets?s:{...s,assets:[]});
          migrated=true;
        }
        // Online data is authoritative; never overwrite it with another session's backup.
        setRawData(record);
        if(migrated&&["admin","lead"].includes(currentAccount?.role)) return cloudSave(record);
      })
      .then(saved=>{if(saved){serverRevisionRef.current=saved._revision;setRawData(saved);}setSyncState("ok");})
      .catch(error=>{
        // Если облако недоступно — пробуем локальный бэкап
        try{
          const raw=currentAccount?localStorage.getItem(accountBackupKey(currentAccount)):null;
          if(raw){const bk=JSON.parse(raw);if(bk?.data){const safeBackup=normalizeLoadedData(bk.data);persistAccountBackup(currentAccount,safeBackup);unsavedRef.current=true;serverRevisionRef.current=safeBackup._revision??null;setRawData(safeBackup);setSyncState("error");setSyncError("Открыта локальная копия. Связь с сервером недоступна.");return;}}
        }catch(e){}
        setRawData(normalizeLoadedData(null));
        setSyncState("error");
        if(currentAccount)setSyncError("Не удалось загрузить данные: "+error.message);
      })
      .catch(()=>{});
  },[]);

  const histRef=useRef([]);
  const viewRef=useRef(view);
  viewRef.current=view;
  const pendingLogRef=useRef([]);
  const [changelogOpen,setChangelogOpen]=useState(false);

  useEffect(()=>{
    const protectUnsaved=event=>{
      if(unsavedRef.current||saveTimer.current||saveQueueRef.current?.pending){event.preventDefault();event.returnValue="";}
    };
    window.addEventListener("beforeunload",protectUnsaved);
    return()=>window.removeEventListener("beforeunload",protectUnsaved);
  },[]);

  function addLog(text){
    pendingLogRef.current=[...pendingLogRef.current,{ts:Date.now(),text}];
  }

  function pushHistory(prev){
    histRef.current=[...histRef.current.slice(-30),prev];
  }
  function doSave(d){
    const newEntries=pendingLogRef.current;
    pendingLogRef.current=[];
    const prevLog=Array.isArray(d.changelog)?d.changelog:[];
    const changelog=mergeChangelog(newEntries,logHistoryRef.current,prevLog);
    logHistoryRef.current=changelog;
    const payload={...d,changelog,_savedAt:Date.now(),_clientId:clientIdRef.current};
    if(!user) return;
    unsavedRef.current=true;
    clearTimeout(saveTimer.current);
    setSyncState("saving");
    setSyncError("");
    try{persistAccountBackup(user,payload);}catch(e){}
    saveTimer.current=setTimeout(()=>{
      saveTimer.current=null;
      const outgoing={...payload,changelog:mergeChangelog(pendingLogRef.current,logHistoryRef.current,payload.changelog)};
      logHistoryRef.current=outgoing.changelog;
      pendingLogRef.current=[];
      try{persistAccountBackup(user,outgoing);}catch(e){}
      saveQueueRef.current.enqueue(outgoing);
    },1000);
  }
  function undo(){
    if(!histRef.current.length) return;
    const previous=histRef.current[histRef.current.length-1];
    const prev=undoSnapshot(previous,rawDataRef.current);
    histRef.current=histRef.current.slice(0,-1);
    setRawData(prev);
    doSave(prev);
  }

  async function handleLogout(){
    if(saveTimer.current||saveQueueRef.current?.pending){alert("Дождитесь завершения сохранения перед выходом.");return;}
    if(unsavedRef.current&&!window.confirm("Изменения ещё не сохранены на сервере. Локальная резервная копия останется на этом компьютере. Выйти?"))return;
    await doLogout();
    histRef.current=[];pendingLogRef.current=[];logHistoryRef.current=[];serverRevisionRef.current=null;unsavedRef.current=false;
    setRawData(normalizeLoadedData(null));setUser(null);setLoginError(null);setSyncError("");
  }

  function navigate(state){
    setNavState(state);
    if(state) window.location.hash=`#${state.type}/${encodeURIComponent(state.id)}`;
    else history.pushState(null,"",location.pathname+location.search);
  }
  useEffect(()=>{
    const onPop=()=>setNavState(parseHash());
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);

  useEffect(()=>{
    function handle(e){
      const ctrl=e.ctrlKey||e.metaKey;
      const inInput=e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT";
      if(e.key==="Escape"){
        if(cmdPaletteOpen){e.preventDefault();setCmdPaletteOpen(false);return;}
        window.dispatchEvent(new CustomEvent("ppt-escape"));
      }
      if(ctrl&&(e.key==="z"||e.code==="KeyZ")&&!e.shiftKey&&!inInput){e.preventDefault();undo();}
      if(ctrl&&(e.key==="k"||e.code==="KeyK")&&!inInput){e.preventDefault();setCmdPaletteOpen(o=>!o);}
      if(e.altKey&&(e.code==="KeyN")&&viewRef.current==="gantt"){
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("gantt-new-task"));
      }
    }
    document.addEventListener("keydown",handle);
    return ()=>document.removeEventListener("keydown",handle);
  },[cmdPaletteOpen,user]);

    useEffect(()=>{
    if(STORAGE_MODE!=="server") return;
    var reconnectTimer=null;
    var reconnectAttempts=0;
    var currentES=null;
    function connectSSE(){
      if(currentES){ try{ currentES.close(); }catch(e){} }
      var es=new EventSource(`${SERVER_URL}/api/events`);
      currentES=es;
      es.onmessage=function(e){
        reconnectAttempts=0;
        try{
          var msg=JSON.parse(e.data);
          if(msg.clientId&&msg.clientId!==clientIdRef.current&&!unsavedRef.current&&!saveTimer.current&&!saveQueueRef.current?.pending){
            cloudLoad().then(function(d){if(d&&!unsavedRef.current&&!saveTimer.current&&!saveQueueRef.current?.pending){serverRevisionRef.current=d._revision;histRef.current=[];logHistoryRef.current=d.changelog||[];setRawData(d);}}).catch(function(){});
          }
        }catch(e){}
      };
      es.onerror=function(){
        es.close();
        currentES=null;
        reconnectAttempts++;
        var delay=Math.min(1000*Math.pow(2,reconnectAttempts),30000);
        clearTimeout(reconnectTimer);
        reconnectTimer=setTimeout(connectSSE,delay);
      };
    }
    connectSSE();
    return function(){
      if(currentES){ try{ currentES.close(); }catch(e){} }
      if(reconnectTimer)clearTimeout(reconnectTimer);
    };
  },[]);


  function updateData(key,val){
    setRawData(d=>{
      pushHistory(d);
      let mergedVal=val;
      if(SOFT_DELETE_KEYS.includes(key)&&Array.isArray(val)){
        const deletedItems=(d[key]||[]).filter(x=>x.deleted&&key!=="people");
        mergedVal=[...val,...deletedItems.filter(x=>!val.some(v=>String(v.id)===String(x.id)))];
      }
      const newData={...d,[key]:mergedVal};
      doSave(newData);
      return newData;
    });
  }

  function deleteProject(projId){
    if(!window.confirm("Удалить проект, его серии и задачи? Действие можно отменить через Ctrl+Z.")) return;
    const ts=Date.now();
    setRawData(d=>{
      pushHistory(d);
      const newData={
        ...d,
        projects:d.projects.map(p=>p.id===projId?{...p,deleted:true,_updatedAt:ts}:p),
        series:(d.series||[]).map(s=>s.projectId===projId?{...s,deleted:true,_updatedAt:ts}:s),
        tasks:(d.tasks||[]).map(t=>t.project===projId?{...t,deleted:true,_updatedAt:ts}:t),
      };
      doSave(newData);
      return newData;
    });
    incrDelete("project", projId);
  }

  function batchUpdate(changes){
    setRawData(d=>{
      pushHistory(d);
      const merged={...d};
      for(const [key,val] of Object.entries(changes)){
        if(SOFT_DELETE_KEYS.includes(key)&&Array.isArray(val)){
          const deletedItems=(d[key]||[]).filter(x=>x.deleted);
          merged[key]=[...val,...deletedItems.filter(x=>!val.some(v=>String(v.id)===String(x.id)))];
        } else {
          merged[key]=val;
        }
      }
      doSave(merged);
      return merged;
    });
  }

  const stagesCtxVal=useMemo(()=>{
    const stagesArr=(data?.stages&&data.stages.length)?data.stages:DEFAULT_STAGES;
    const sorted=[...stagesArr].sort((a,b)=>(a.order||0)-(b.order||0));
    const stageMap=Object.fromEntries(stagesArr.map(s=>[s.id,s]));
    const stageGroups=(data?.stageGroups&&data.stageGroups.length)?data.stageGroups:DEFAULT_STAGE_GROUPS;
    const groupMap=Object.fromEntries(stageGroups.map(g=>[g.id,g]));
    return {stageMap,sorted,stageGroups,groupMap};
  },[data?.stages,data?.stageGroups]);

  const holidaysCtxVal=useMemo(()=>data?.holidays||DEFAULT_HOLIDAYS,[data?.holidays]);

  const {ids:conflictIds,details:conflictDetails}=useMemo(()=>{
    if(!data) return {ids:new Set(),details:[]};
    const todayStr=daySort(formatDate(new Date()));
    return getConflicts(data.tasks.filter(t=>daySort(t.day)>=todayStr&&!t.cancelled),data.people,data.stages||DEFAULT_STAGES,data.projects,data.personAbsences||[]);
  },[data?.tasks,data?.people,data?.stages,data?.projects,data?.personAbsences]);
  const conflictCount=conflictDetails.filter(d=>d.notify!==false).length;

  if(!user && !data) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#475569"}}>
      Загрузка...
    </div>
  );
  if(!data) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#475569"}}>
      Загрузка данных...
    </div>
  );
  if(!user) return <LoginForm onLogin={(l,p)=>{
    setLoginError(null);
    doLogin(l,p).then(r=>{
      if(r.user){setCsrfToken(r.csrfToken);setLoginError(null);setSyncState("saving");cloudLoad().then(rec=>{if(rec){serverRevisionRef.current=rec._revision;histRef.current=[];setRawData(rec);}setSyncState("ok");setUser(r.user);}).catch(error=>{setRawData(normalizeLoadedData(null));setSyncError("Не удалось загрузить данные: "+error.message);setSyncState("error");setUser(r.user);});}
      else setLoginError(r.error||"Ошибка входа");
    });
  }} error={loginError}/>;

  const isViewer=user.role==="viewer";
  const isEditor=user.role==="editor";
  const isAdmin=user.role==="admin";
  const isLead=user.role==="lead";
  const isManager=user.role==="manager";
  const canManage=isAdmin||isLead||isManager;
  const canDeleteStructure=isAdmin||isLead;
  const canEdit=isAdmin||isLead||isManager||isEditor;
  const canManageProjectAssignments=isAdmin||isLead;
  const currentProjectKeys=currentUserProjectKeys(user,data);
  const currentManagerEntry=currentUserManagerEntry(user,data);
  function canEditProjectById(projectId){
    if(isAdmin||isLead) return true;
    if(isManager) return projectAssignedToKeys(data.projects.find(p=>p.id===projectId),currentProjectKeys);
    return canEdit;
  }
  window.PPT_CAN_SEE_TASK_NOTES=isAdmin||isLead||isManager;
  const isNA=user.role==="na";
  
  if(isNA){
    return (
      <div style={{background:"#0f172a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:16}}>🚫</div>
          <h2 style={{color:"#e2e8f0",margin:"0 0 8px 0"}}>Доступ запрещён</h2>
          <p style={{fontSize:14,margin:0}}>Ваш аккаунт заблокирован для просмотра данных трекера.</p>
          <p style={{fontSize:12,marginTop:16,color:"#475569"}}>
            {user.display_name} ({user.sam_name})
          </p>
          <button onClick={handleLogout}
            style={{marginTop:20,background:"#334155",border:"none",borderRadius:10,color:"#e2e8f0",
              fontSize:13,cursor:"pointer",padding:"8px 20px",fontFamily:"inherit"}}>
            Выйти
          </button>
        </div>
      </div>
    );
  }

  // Viewer с пустыми проектами — показываем пояснение
  if(isViewer && data.projects && data.projects.length === 0){
    return (
      <div style={{background:"#0f172a",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>
        <div style={{textAlign:"center",maxWidth:400}}>
          <div style={{fontSize:48,marginBottom:16}}>👀</div>
          <h2 style={{color:"#e2e8f0",margin:"0 0 8px 0"}}>Нет доступа к проектам</h2>
          <p style={{fontSize:14,margin:0,lineHeight:1.6}}>
            Ваша учётная запись имеет права просмотра, но администратор ещё не назначил вам ни одного проекта.
          </p>
          <p style={{fontSize:12,marginTop:16,color:"#475569"}}>
            {user.display_name} ({user.sam_name}) · роль: viewer
          </p>
          <button onClick={handleLogout}
            style={{marginTop:20,background:"#334155",border:"none",borderRadius:10,color:"#e2e8f0",
              fontSize:13,cursor:"pointer",padding:"8px 20px",fontFamily:"inherit"}}>
            Выйти и зайти под другим пользователем
          </button>
        </div>
      </div>
    );
  }

  const TABS=[
    {id:"today",    label:"Сегодня"},
    {id:"projects", label:"Проекты"},
    {id:"calendar", label:"Календарь"},
    {id:"gantt",    label:"Гант", adminManagerOnly:true},
    {id:"people",   label:"По людям"},
    {id:"days",     label:"\u041d\u0415\u0414\u0415\u041b\u042f"},
    {id:"conflicts",  label:`Конфликты${conflictCount?` ⚡${conflictCount}`:""}`,warn:conflictCount>0, adminManagerOnly:true},
    {id:"analytics",  label:"Аналитика", adminManagerOnly:true},
    {id:"directory",  label:"⚙ Настройки", adminManagerOnly:true},
  ].filter(t=>{
    if(t.adminOnly && !isAdmin) return false;
    if(t.adminManagerOnly && !canManage) return false;
    return true;
  });

  return (
    <StagesCtx.Provider value={stagesCtxVal}>
    <HolidaysCtx.Provider value={holidaysCtxVal}>
    <div className="ppt-app-shell" style={{background:"transparent",minHeight:"100vh",color:"#eef4ff",paddingTop:1}}>
      {isMobile?(
        <MobileTopbar user={user} syncState={syncState} onSearch={()=>setCmdPaletteOpen(true)} onShifts={()=>setDayShiftsModal(true)} onLogout={handleLogout}/>
      ):(
      <div className="ppt-topbar" style={{background:"rgba(15,23,42,.72)",border:"1px solid rgba(148,163,184,.18)",borderBottom:"1px solid rgba(148,163,184,.22)",borderRadius:20,padding:"14px 20px",position:"sticky",top:10,zIndex:50,margin:"10px 14px 0",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:12}}>
          <div style={{flexShrink:0}}>
            <div className="ppt-title" style={{fontSize:23,fontWeight:900,letterSpacing:.2,lineHeight:1.05}}>
              ПОСТ ТРЕКЕР
            </div>
            <div style={{fontSize:12,color:"#9aa9bd",marginTop:4,fontWeight:600}}>Планирование постпродакшна <span style={{marginLeft:8,fontSize:11,color:"#94a3b8"}}>v{VERSION}</span>{RUNTIME.label&&<span style={{marginLeft:8,fontSize:10,color:"#fbbf24",fontWeight:800,letterSpacing:.8}}>{RUNTIME.label}</span>}</div>
            <div className="ppt-author">Создано Максимом Ефремовым</div>
          </div>
          <div style={{flex:1,display:"flex",justifyContent:"center"}}>
            <button onClick={()=>setCmdPaletteOpen(true)}
              style={{background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:10,
                padding:"5px 12px",cursor:"pointer",display:"flex",alignItems:"center",
                gap:8,fontFamily:"inherit"}}>
              <span style={{fontSize:13,color:"#334155",lineHeight:1}}>🔍</span>
              <span style={{fontSize:12,color:"#334155",letterSpacing:1,userSelect:"none"}}>Поиск</span>
              <span style={{fontSize:9,color:"#1e3a5f",border:"1px solid #1e3a5f",
                borderRadius:3,padding:"1px 5px",letterSpacing:0,flexShrink:0}}>Ctrl+K</span>
            </button>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
            <FlipClock/>
            {{ok:    <span style={{fontSize:11,color:"#22c55e"}}>OK</span>,
              saving:<span style={{fontSize:11,color:"#f59e0b"}}>⟳</span>,
              error: <span style={{fontSize:11,color:"#ef4444"}}>!</span>,
            }[syncState]}
            <Btn variant="ghost" small onClick={()=>setChangelogOpen(true)}>📜</Btn>
            <Btn variant="ghost" small onClick={()=>setDayShiftsModal(true)}> Смены</Btn>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8}}>
            <span style={{fontSize:12,color:"#cbd5e1",fontWeight:700}}>{user.display_name}</span>
            <span style={{fontSize:10,color:"#9aa9bd",background:"rgba(8,13,26,.56)",borderRadius:999,
              padding:"2px 8px",border:"1px solid rgba(148,163,184,.22)",fontWeight:800}}>{user.role}</span>
            {RUNTIME.mode!=="local-demo"&&<button onClick={handleLogout}
              className="ppt-btn"
              style={{background:"rgba(15,23,42,.34)",border:"1px solid rgba(148,163,184,.22)",borderRadius:14,color:"#a9b8cc",
                fontSize:11,cursor:"pointer",padding:"4px 8px",fontFamily:"inherit",fontWeight:700}}>
              Выйти
            </button>}
          </div>
        </div>
        {navState?.type==="project"?(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>navigate(null)}
              style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",
                fontSize:13,fontFamily:"inherit",padding:"4px 0"}}>
              ← Все проекты
            </button>
            <span style={{color:"#334155"}}>/</span>
            <span style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>
              {data.projects.find(p=>p.id===navState.id)?.name||navState.id}
            </span>
          </div>
        ):navState?.type==="series"?(()=>{
          const ser=(data.series||[]).find(s=>s.id===navState.id);
          const proj=ser?data.projects.find(p=>p.id===ser.projectId):null;
          return (
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>navigate(proj?{type:"project",id:proj.id}:null)}
                style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",
                  fontSize:13,fontFamily:"inherit",padding:"4px 0"}}>
                ← {proj?.name||"Проект"}
              </button>
              <span style={{color:"#334155"}}>/</span>
              <span style={{fontWeight:700,fontSize:14,color:"#e2e8f0"}}>
                {ser?.name||navState.id}
              </span>
              {ser?.delivered&&(
                <span style={{fontSize:11,color:"#22c55e",background:"#22c55e1a",
                  border:"1px solid #22c55e44",borderRadius:4,padding:"1px 7px"}}>OK Сдана</span>
              )}
            </div>
          );
        })():(
          <div style={{display:"flex",gap:3,background:"rgba(8,13,26,.48)",borderRadius:14,border:"1px solid rgba(148,163,184,.18)",
            overflow:"hidden",width:"fit-content",padding:3,boxShadow:"inset 0 1px 0 rgba(255,255,255,.035)"}}>
            {TABS.map(({id,label,warn})=>(
              <button key={id} onClick={()=>{setView(id);navigate(null);}} style={{
                padding:"7px 14px",border:"none",borderRight:"none",cursor:"pointer",borderRadius:11,
                fontSize:12,fontFamily:"inherit",transition:"background .15s ease,color .15s ease",
                background:view===id?"linear-gradient(135deg,#2563eb,#3b82f6 64%,#22d3ee)":"transparent",
                color:warn?(view===id?"#fff":"#fca5a5"):(view===id?"#fff":"#9aa9bd"),
                fontWeight:view===id?800:700}}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      )}


      {syncError&&<div role="alert" style={{margin:"12px 20px 0",padding:12,border:"1px solid #b45309",borderRadius:10,color:"#fde68a",background:"#422006"}}>
        {syncError} Изменения пока не подтверждены сервером.
        <button className="ppt-btn" onClick={()=>doSave(rawData)}>Повторить сохранение</button>
        <button className="ppt-btn" onClick={()=>exportJSON(rawData)}>Скачать мои изменения</button>
        <button className="ppt-btn" disabled={Boolean(saveTimer.current||saveQueueRef.current?.pending)} onClick={()=>{if(window.confirm("Загрузить данные сервера? Сначала скачайте свои несохранённые изменения, если они нужны."))cloudLoad().then(d=>{serverRevisionRef.current=d._revision;histRef.current=[];pendingLogRef.current=[];logHistoryRef.current=d.changelog||[];unsavedRef.current=false;setRawData(d);setSyncError("");setSyncState("ok");}).catch(e=>setSyncError(e.message));}}>Загрузить актуальные данные</button>
      </div>}
      <div className="ppt-main-content" style={{padding:"22px 20px 20px"}}>
        {navState?.type==="person"?(
          <PersonCard personId={navState.id} data={data} onBack={()=>navigate(null)} onUpdatePeople={updateData} canEditBirthday={isAdmin} canEditAbsences={canManage}/>
        ):navState?.type==="series"?(
          <SeriesCard seriesId={navState.id} data={data} onBatchUpdate={batchUpdate}/>
        ):navState?.type==="project"?(
          <ProjectCard projectId={navState.id} data={data} onUpdate={updateData} onBatchUpdate={batchUpdate}
            onBack={()=>navigate(null)} onSeriesSelect={id=>navigate({type:"series",id})}
            onDelete={canDeleteStructure?(id=>{deleteProject(id);navigate(null);}):null} onLog={addLog} canDeleteStructure={canDeleteStructure}
            canEditProject={canEditProjectById(navState.id)} canManageProjectAssignments={canManageProjectAssignments}/>
        ):(isMobile?(
          <MobileWorkspace view={view} data={data} conflictDetails={conflictDetails} setView={setView} navigate={navigate}/>
        ):(
        <>
        {view==="today"    &&<TodayView     data={data} conflictDetails={conflictDetails} onNavigateConflicts={()=>setView("conflicts")} canEdit={canEdit} canDeleteStructure={canDeleteStructure}/>}
        {view==="projects" &&<ProjectsView  data={data} onUpdate={updateData} onBatchUpdate={batchUpdate} onDeleteProject={deleteProject} onProjectSelect={id=>navigate({type:"project",id})} onSeriesSelect={id=>navigate({type:"series",id})} canEdit={canEdit} canDeleteStructure={canDeleteStructure}
          isManager={isManager} canManageProjectAssignments={canManageProjectAssignments} canEditProjectById={canEditProjectById} currentManagerEntry={currentManagerEntry}/>}
        {view==="calendar" &&<CalendarView  data={data} onGoToGantt={day=>{setGanttDay(day);setView("gantt");}} canEdit={canEdit} canDeleteStructure={canDeleteStructure}/>}
        {view==="gantt"    && canManage &&<GanttView     data={data} onUpdate={updateData} onBatchUpdate={batchUpdate} onSeriesSelect={id=>navigate({type:"series",id})} startDay={ganttDay} onLog={addLog} canEdit={canEdit} canEditOldTasks={isAdmin||isLead} canEditProjectById={canEditProjectById}/>}
        {view==="days"     &&<DaysView      data={data} conflictIds={conflictIds}/>}
        {view==="people"   &&<PeopleView    data={data} conflictIds={conflictIds} onPersonSelect={id=>navigate({type:"person",id})} canEdit={canEdit} onUpdate={updateData} onLog={addLog} canEditProjectById={canEditProjectById}/>}
        {view==="conflicts" && canManage &&<ConflictsView details={conflictDetails} data={data}/>}
        {view==="analytics" && canManage &&<AnalyticsView data={data} onPersonSelect={id=>navigate({type:"person",id})}/>}
        {view==="directory" && canManage &&<DirectoryView data={data} onUpdate={updateData} onBatchUpdate={batchUpdate} onLog={addLog} user={user} onUserUpdate={(newU)=>{setUser(newU);}}/>}
        </>
        ))}

        {!isMobile&&!navState&&!["today","conflicts","analytics","directory"].includes(view)&&(
          <div style={{marginTop:24,paddingTop:14,borderTop:"1px solid #1e293b",
            display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:10,color:"#334155",letterSpacing:2,marginRight:2}}>ГРУППЫ:</span>
            {stagesCtxVal.stageGroups.map(g=>{
              const repStage=stagesCtxVal.sorted.find(s=>s.groupId===g.id);
              const c=repStage?.color||"#475569";
              return (
                <span key={g.id} style={{fontSize:10,background:`${c}22`,color:c,
                  border:`1px solid ${c}44`,borderRadius:4,padding:"1px 8px",fontWeight:600}}>
                  {g.label}
                </span>
              );
            })}
            <span style={{fontSize:11,color:"#f87171",marginLeft:6}}>⚡ = конфликт</span>
          </div>
        )}
      </div>
      {isMobile&&!navState&&<MobileBottomNav tabs={TABS} view={view} setView={setView} navigate={navigate}/>}
    </div>
    {changelogOpen&&<ChangelogModal entries={data.changelog||[]} onClose={()=>setChangelogOpen(false)}/>}
    {dayShiftsModal&&<DayShiftsModal data={data} onClose={()=>setDayShiftsModal(false)}/>}
    {cmdPaletteOpen&&<CommandPalette data={data} onClose={()=>setCmdPaletteOpen(false)}
      onNavigate={state=>{navigate(state);}}
      onSetView={v=>{setView(v);navigate(null);}}
      onSetGanttDay={setGanttDay}/>}
    </HolidaysCtx.Provider>
    </StagesCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

