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
