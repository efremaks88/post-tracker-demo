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

