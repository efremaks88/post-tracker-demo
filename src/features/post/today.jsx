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
