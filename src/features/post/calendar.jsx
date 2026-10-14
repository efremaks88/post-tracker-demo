function CalendarView({data,onGoToGantt,canEdit}){
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [selectedDay,setSelectedDay]=useState(null);
  const [hovDay,setHovDay]=useState(null);
  const [filterProject,setFilterProject]=useState("");
  const [filterPerson,setFilterPerson]=useState("");
  const {stageMap,stageGroups}=useContext(StagesCtx);

  useEffect(()=>{
    const h=()=>{setFilterProject("");setFilterPerson("");};
    window.addEventListener("ppt-escape",h);
    return()=>window.removeEventListener("ppt-escape",h);
  },[]);

  function prevMonth(){if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}
  function nextMonth(){if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}

  const firstDay=new Date(year,month,1);
  const startOffset=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<startOffset;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);

  const filteredTasks=useMemo(()=>data.tasks.filter(t=>(!filterProject||t.project===filterProject)&&(!filterPerson||t.person===filterPerson)),[data.tasks,filterProject,filterPerson]);
  const seriesList=useMemo(()=>(data.series||[]).filter(s=>!filterProject||s.projectId===filterProject),[data.series,filterProject]);
  const calendarProjects=useMemo(()=>filterProject?data.projects.filter(p=>p.id===filterProject):data.projects,[data.projects,filterProject]);
  const calendarPeople=useMemo(()=>[...new Set(data.tasks.map(t=>t.person).filter(Boolean))].sort(),[data.tasks]);
  const allAirDates={};
  seriesList.forEach(ser=>{
    const proj=data.projects.find(p=>p.id===ser.projectId);
    if(!proj) return;
    generateSeriesAirDates(ser).forEach(d=>{
      if(!allAirDates[d]) allAirDates[d]=[];
      allAirDates[d].push({proj,ser});
    });
  });

  const milestones={};
  seriesList.forEach(ser=>{
    const proj=data.projects.find(p=>p.id===ser.projectId);
    if(!proj) return;
    getSeriesMilestoneEvents(ser,proj).forEach(m=>{
      const date=m.date;
      if(!date) return;
      if(!milestones[date]) milestones[date]=[];
      milestones[date].push({type:m.key,label:m.label,abbr:m.abbr||m.label,color:m.color,icon:m.icon||MILESTONE_ICON,proj,ser});
    });
  });

  const birthdays={};
  (data.people||[]).forEach(p=>{
    if(filterPerson&&p.name!==filterPerson) return;
    const bd=normalizeBirthday(p.birthday);
    if(!bd||p.active===false||p.deleted) return;
    const date=birthdayDateForYear(bd,year);
    const d=parseDate(date);
    if(!d||d.getMonth()!==month) return;
    if(!birthdays[date]) birthdays[date]=[];
    birthdays[date].push(p);
  });


  function dayStr(d){
    if(!d) return null;
    return `${String(d).padStart(2,"0")}.${String(month+1).padStart(2,"0")}.${year}`;
  }

  const todayStr=formatDate(today);
  const selStr=selectedDay?dayStr(selectedDay):null;
  const selTasks=selStr?filteredTasks.filter(t=>t.day===selStr):[];
  const sortedSelTasks=useMemo(()=>{
    const projectName=id=>{const p=data.projects.find(x=>x.id===id);return (p?.name||p?.abbr||id||"").toLowerCase();};
    return [...selTasks].sort((a,b)=>
      projectName(a.project).localeCompare(projectName(b.project),"ru")||
      (Number(a.from)||0)-(Number(b.from)||0)||
      String(a.series||"").localeCompare(String(b.series||""),"ru")||
      String(a.person||"").localeCompare(String(b.person||""),"ru")
    );
  },[selTasks,data.projects]);
  const selAirs=selStr?(allAirDates[selStr]||[]):[];
  const selMil=selStr?(milestones[selStr]||[]):[];
  const selBirthdays=selStr?(birthdays[selStr]||[]):[];
  const groupOrderMap=useMemo(()=>Object.fromEntries((stageGroups||[]).map(g=>[g.id,g.order||0])),[stageGroups]);
  const groupShapeMap=useMemo(()=>{
    const shapes=["circle","square","diamond","bar","triangle","ring","slash","pill","split","dotline"];
    const map={};
    (stageGroups||[]).forEach((g,i)=>{map[g.id]=shapes[i%shapes.length];});
    return map;
  },[stageGroups]);
  function dayGroupMarkers(dayTasks){
    const map={};
    (dayTasks||[]).forEach(t=>{
      const st=stageMap?.[t.status]||{};
      const gid=st.groupId||t.status||"other";
      const proj=data.projects.find(p=>p.id===t.project);
      const group=(stageGroups||[]).find(g=>g.id===gid);
      if(!map[gid]) map[gid]={id:gid,label:group?.label||st.label||t.status||"\u0421\u043c\u0435\u043d\u0430",color:st.color||proj?.color||"#64748b",count:0,shape:groupShapeMap[gid]||"circle",order:groupOrderMap[gid]||999};
      map[gid].count++;
    });
    return Object.values(map).sort((a,b)=>a.order-b.order||a.label.localeCompare(b.label,"ru"));
  }

  return (
    <div className="ppt-calendar-layout">
      <div>
        <div className="ppt-calendar-toolbar">
          <Btn variant="ghost" onClick={prevMonth}>←</Btn>
          <span style={{fontSize:22,fontWeight:800,minWidth:200,textAlign:"center",color:"#f1f5f9"}}>
            {MONTHS[month]} {year}
          </span>
          <Btn variant="ghost" onClick={nextMonth}>→</Btn>
          <Btn variant="ghost" small onClick={()=>{setYear(today.getFullYear());setMonth(today.getMonth());}}>Сегодня</Btn>
          <input type="month"
            value={`${year}-${String(month+1).padStart(2,"0")}`}
            onChange={e=>{const[y,m]=e.target.value.split("-");if(y&&m){setYear(+y);setMonth(+m-1);}}}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:12,cursor:"pointer"}}/>
          <select value={filterProject} onChange={e=>setFilterProject(e.target.value)}
            style={{background:"#0f172a",border:"1px solid #334155",color:filterProject?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 8px",fontSize:12,cursor:"pointer",maxWidth:180}}>
            <option value="">Все проекты</option>
            {data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)}
            style={{background:"#0f172a",border:"1px solid #334155",color:filterPerson?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 8px",fontSize:12,cursor:"pointer",maxWidth:180}}>
            <option value="">Все люди</option>
            {calendarPeople.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          {(filterProject||filterPerson)&&<Btn variant="ghost" small onClick={()=>{setFilterProject("");setFilterPerson("");}}>Сброс</Btn>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
          {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:11,color:"#475569",padding:"4px 0"}}>{d}</div>
          ))}
        </div>

        <div className="ppt-calendar-grid">
          {cells.map((d,i)=>{
            const ds=dayStr(d);
            const isToday=ds===todayStr;
            const isSel=d&&selectedDay===d;
            const dayTasks=ds?filteredTasks.filter(t=>t.day===ds):[];
            const dayAirs=ds?(allAirDates[ds]||[]):[];
            const dayMil=ds?(milestones[ds]||[]):[];
            const dayBirthdays=ds?(birthdays[ds]||[]):[];
            const groupMarkers=dayGroupMarkers(dayTasks);
            const compactEvents=[
              ...dayAirs.map(x=>({...x,kind:"air"})),
              ...dayMil.map(x=>({...x,kind:"milestone"})),
              ...dayBirthdays.map(x=>({person:x,kind:"birthday"}))
            ];
            const hiddenEventCount=Math.max(0,compactEvents.length-4);
            return (
              <div key={i}
                className="ppt-calendar-cell"
                onClick={()=>d&&setSelectedDay(isSel?null:d)}
                onMouseEnter={d&&dayTasks.length?e=>setHovDay({ds,dayTasks,rect:e.currentTarget.getBoundingClientRect()}):undefined}
                onMouseLeave={()=>setHovDay(null)}
                style={{background:isSel?"#1e3a5f":isToday?"rgba(59,130,246,0.1)":"#1e293b",
                  border:`1px solid ${isSel?"#3b82f6":isToday?"rgba(59,130,246,0.4)":"#263352"}`,
                  cursor:d?"pointer":"default",opacity:d?1:0.2}}>
                {d&&(
                  <>
                    <div style={{fontSize:11,color:isToday?"#3b82f6":"#475569",fontWeight:isToday?700:400,marginBottom:3}}>
                      {d}
                    </div>
                    <div className="ppt-calendar-stage-markers">
                      {groupMarkers.slice(0,12).map(g=>(
                        <span key={g.id} className={`ppt-calendar-stage-marker ${g.shape}`} title={`${g.label}: ${g.count}`} style={{"--marker-color":g.color}}/>
                      ))}
                      {groupMarkers.length>12&&<span className="ppt-calendar-stage-more">+{groupMarkers.length-12}</span>}
                    </div>
                    <div className="ppt-calendar-cell-events">
                      {compactEvents.slice(0,4).map((ev,ei)=>{
                        if(ev.kind==="air") return <div key={`air-${ei}`} className="ppt-calendar-event ppt-calendar-air" title={`\u042d\u0444\u0438\u0440: ${ev.proj.name} ${ev.ser.name}`}><span>{"\u042d\u0444\u0438\u0440"} {ev.proj.abbr||ev.proj.name} {ev.ser.name}</span></div>;
                        if(ev.kind==="milestone") return <div key={`mil-${ei}`} className="ppt-calendar-event" title={`${ev.label}: ${ev.proj.name} ${ev.ser.name}`} style={{"--ppt-event-color":ev.color||"#a855f7","--ppt-event-fill":`${ev.color||"#a855f7"}2f`,"--ppt-event-border":`${ev.color||"#a855f7"}66`,"--ppt-event-glow":`${ev.color||"#a855f7"}22`}}><span>{ev.label} {ev.proj.abbr||ev.proj.name} {ev.ser.name}</span></div>;
                        return <div key={`bd-${ei}`} className={`ppt-calendar-event ppt-birthday-event ${ds===todayStr?"ppt-birthday-today":""}`} title={`\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f: ${ev.person.name}`}><span>{"\u0414\u0420"} {ev.person.name}</span></div>;
                      })}
                      {hiddenEventCount>0&&<div className="ppt-calendar-more-events">+{hiddenEventCount} {"\u0441\u043e\u0431\u044b\u0442\u0438\u0439 \u043d\u0438\u0436\u0435"}</div>}
                    </div>
                    {dayTasks.length>0&&(
                      <div style={{fontSize:9,color:"#475569",marginTop:1}}>{dayTasks.length} смен</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap"}}>
          {calendarProjects.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:4}}>
              <ProjectMark project={p} size={8}/>
              <span style={{fontSize:10,color:"#475569"}}>{p.name}</span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:"#f59e0b"}}>📺</span><span style={{fontSize:10,color:"#475569"}}>эфир</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:"#a855f7"}}>{MILESTONE_ICON}</span><span style={{fontSize:10,color:"#475569"}}>ключевые события</span>
          </div>
        </div>
      </div>

      {selStr&&(
        <div className="ppt-calendar-day-details">
          <div style={{fontWeight:700,fontSize:14,color:"#93c5fd",marginBottom:12}}>
            {dayLabel(selStr)}
          </div>
          <div className="ppt-calendar-detail-events">
            {selAirs.map(({proj,ser},i)=>(
              <div key={proj.id+ser.id+i} className="ppt-calendar-detail-event air">
                <strong>{"\u042d\u0444\u0438\u0440"}</strong>
                <span>{proj.name} {ser.name}</span>
                {ser.airTime&&<em>{ser.airTime}</em>}
              </div>
            ))}
            {selMil.map((m,i)=>(
              <div key={i} className="ppt-calendar-detail-event" style={{"--detail-color":m.color||"#94a3b8"}}>
                <strong>{m.label}</strong>
                <span>{m.proj.name} {m.ser.name}</span>
              </div>
            ))}
            {selBirthdays.map((p,i)=>(
              <div key={`bd-${p.id||p.name||i}`} className={`ppt-calendar-detail-event birthday ${selStr===todayStr?"today":""}`} title={`\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f: ${p.name}`}>
                <strong>{"\u0414\u0420"}</strong>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
          {selTasks.length===0&&selAirs.length===0&&selMil.length===0&&selBirthdays.length===0&&(
            <div style={{color:"#334155",fontSize:12}}>{"\u041d\u0435\u0442 \u0441\u043e\u0431\u044b\u0442\u0438\u0439"}</div>
          )}
          {selTasks.length>0&&(
            <div className="ppt-calendar-task-bricks">
              {sortedSelTasks.map(t=>{
                const proj=data.projects.find(p=>p.id===t.project);
                const st=stageMap?.[t.status]||{};
                const gid=st.groupId||t.status||"other";
                const group=(stageGroups||[]).find(g=>g.id===gid);
                const markerColor=st.color||proj?.color||"#64748b";
                const markerShape=groupShapeMap[gid]||"circle";
                return <div key={t.id} className="ppt-calendar-task-brick" onDoubleClick={()=>onGoToGantt&&onGoToGantt(t.day)} title={onGoToGantt?"\u0414\u0432\u043e\u0439\u043d\u043e\u0439 \u043a\u043b\u0438\u043a - \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0432 \u0413\u0430\u043d\u0442\u0435":undefined}
                  style={{"--task-color":markerColor}}>
                  <div className="ppt-calendar-task-project">{proj?.name||"\u0411\u0435\u0437 \u043f\u0440\u043e\u0435\u043a\u0442\u0430"}</div>
                  <div className="ppt-calendar-task-series">{t.series||"\u0411\u0435\u0437 \u0441\u0435\u0440\u0438\u0438"}</div>
                  <div className="ppt-calendar-task-work">
                    <span className={"ppt-calendar-stage-marker "+markerShape} title={group?.label||st.label||t.status||""} style={{"--marker-color":markerColor}}/>
                    <strong>{st.label||t.status||"-"}</strong>
                    <em>{fmtHour(t.from)}-{fmtHour(t.to)}</em>
                  </div>
                  <div className="ppt-calendar-task-person">{t.person||"\u0431\u0435\u0437 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"}</div>
                </div>;
              })}
            </div>
          )}
        </div>
      )}
      {hovDay&&!hovDay.single&&(
        <CalendarDayTooltip dayTasks={hovDay.dayTasks} ds={hovDay.ds} rect={hovDay.rect} projects={data.projects}/>
      )}
      {hovDay?.single&&(
        <TaskTooltip task={hovDay.task} rect={hovDay.rect} projects={data.projects}/>
      )}
    </div>
  );
}
function CalendarDayTooltip({dayTasks,ds,rect,projects}){
  const {stageMap}=useContext(StagesCtx);
  if(!dayTasks?.length) return null;
  const W=260; const vw=window.innerWidth; const vh=window.innerHeight;
  let left=rect.right+8; if(left+W>vw-16) left=rect.left-W-8;
  let top=rect.top; if(top+dayTasks.length*22+40>vh-16) top=Math.max(8,vh-dayTasks.length*22-56);
  return (
    <div style={{position:"fixed",left,top,zIndex:9999,width:W,
      background:"#0f172a",border:"1px solid #475569",borderRadius:12,
      padding:"10px 14px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
      <div style={{fontSize:10,color:"#64748b",letterSpacing:1,marginBottom:8}}>{ds} · {dayTasks.length} смен</div>
      {dayTasks.slice(0,12).map((t,i)=>{
        const st=stageMap[t.status];
        const c=projColor(projects,t.project);
        return (
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:c,flexShrink:0}}/>
            <span style={{fontSize:11,color:st?st.color:"#94a3b8",fontWeight:600,flexShrink:0,minWidth:90,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st?.label||t.status}</span>
            <span style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.person||"—"}</span>
            <span style={{fontSize:10,color:"#334155",flexShrink:0,marginLeft:"auto"}}>{t.from}–{t.to}</span>
          </div>
        );
      })}
      {dayTasks.length>12&&<div style={{fontSize:10,color:"#475569",marginTop:4}}>…ещё {dayTasks.length-12}</div>}
    </div>
  );
}

// ── ГАНТ ─────────────────────────────────────────────────────────────
function GanttTooltip({task,tasks,rect,stageMap}){
  const all=tasks||(task?[task]:[]);
  if(!all.length||!rect) return null;
  const W=240;
  const vw=window.innerWidth; const vh=window.innerHeight;
  let left=rect.right+10; if(left+W>vw-16) left=rect.left-W-10;
  const estH=all.length>1?24+all.length*22:120;
  let top=rect.top; if(top+estH>vh-16) top=Math.max(8,vh-estH-8);
  if(all.length===1){
    const t=all[0]; const st=stageMap[t.status];
    return (
      <div style={{position:"fixed",left,top,zIndex:9999,width:W,
        background:"#1e293b",border:"1px solid #475569",borderRadius:12,
        padding:"10px 14px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
        {st&&<div style={{marginBottom:6}}>
          <span style={{background:colorToBg(st.color),border:`1px solid ${st.color}55`,
            borderRadius:4,padding:"2px 8px",fontSize:11,color:st.color,fontWeight:600}}>
            {st.label}
          </span>
        </div>}
        {t.person&&<div style={{fontSize:13,color:"#e2e8f0",marginBottom:4,fontWeight:600}}>{t.person}</div>}
        <div style={{fontSize:11,color:"#64748b",marginBottom:canSeeTaskNotes()&&t.note?4:0}}>
          {fmtHour(t.from)} – {fmtHour(t.to)} · {fmtDur(t.from,t.to)}
        </div>
        {canSeeTaskNotes()&&t.note&&<div style={{fontSize:11,color:"#94a3b8",lineHeight:1.4,marginTop:4}}>{t.note}</div>}
      </div>
    );
  }
  const st0=stageMap[all[0].status];
  return (
    <div style={{position:"fixed",left,top,zIndex:9999,width:W,
      background:"#1e293b",border:"1px solid #475569",borderRadius:12,
      padding:"8px 12px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
      {st0&&<div style={{marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
        <span style={{background:colorToBg(st0.color),border:`1px solid ${st0.color}55`,
          borderRadius:4,padding:"2px 8px",fontSize:11,color:st0.color,fontWeight:600}}>
          {st0.label}
        </span>
        <span style={{fontSize:11,color:"#475569"}}>× {all.length}</span>
      </div>}
      {all.map((t,i)=>{
        const per=t.person||"—";
        return (
          <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",
            borderTop:i>0?"1px solid #1e293b":undefined}}>
            <span style={{fontSize:11,color:"#94a3b8",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{per}</span>
            <span style={{fontSize:10,color:"#475569",flexShrink:0}}>{t.from}–{t.to}</span>
            {canSeeTaskNotes()&&t.note&&<span style={{fontSize:9,color:"#334155",flexShrink:0}} title={t.note}>💬</span>}
          </div>
        );
      })}
    </div>
  );
}

