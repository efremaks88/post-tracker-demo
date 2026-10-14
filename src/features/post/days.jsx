function DaysView({data,conflictIds}){
  const [groupBy,setGroupBy]=useState("week");
  const [filterPerson,setFilterPerson]=useState("");
  const [filterProject,setFilterProject]=useState("");
  const [hovTask,setHovTask]=useState(null);
  const tasks=useMemo(()=>enrichTasks(data.tasks),[data.tasks]);
  const people=useMemo(()=>[...new Set(tasks.map(t=>t.person).filter(Boolean))].filter(p=>data.people.some(dp=>dp.name===p)).sort(),[tasks,data.people]);
  const containerRef=useRef(null);

  useEffect(()=>{
    const h=e=>{if(e.key==="Escape"){setFilterPerson("");setFilterProject("");}};
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[]);
  useEffect(()=>{const t=setTimeout(scrollToToday,150);return()=>clearTimeout(t);},[]);

  const filtered=useMemo(()=>{
    let r=tasks;
    if(filterPerson) r=r.filter(t=>t.person===filterPerson);
    if(filterProject) r=r.filter(t=>t.project===filterProject);
    return r;
  },[tasks,filterPerson,filterProject]);

  const peopleCols=filterPerson?[filterPerson]:people;

  function scrollToToday(){
    if(!containerRef.current) return;
    const today=formatDate(new Date());
    const el=containerRef.current.querySelector(`[data-day="${today}"]`);
    if(el) el.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  }

  function DayCol({dayKey,dayTasks,compact}){
    const hasC=dayTasks.some(t=>conflictIds.has(t.id));
    return (
      <div data-day={dayKey}>
        <div style={{padding:compact?"4px 6px":"7px 10px",
          background:hasC?"rgba(239,68,68,0.12)":"#1e293b",
          borderRadius:"6px 6px 0 0",borderBottom:`2px solid ${hasC?"#ef4444":"#3b82f6"}`,
          fontSize:compact?10:11,fontWeight:700,color:hasC?"#f87171":"#93c5fd",
          display:"flex",justifyContent:"space-between"}}>
          <span>{dayLabel(dayKey)}</span>{hasC&&<span>⚡</span>}
        </div>
        <div style={{background:"#1e293b",borderRadius:"0 0 6px 6px",border:"1px solid #334155",
          borderTop:"none",padding:compact?4:6,minHeight:compact?50:80}}>
          {(()=>{
            const visible=peopleCols.filter(p=>dayTasks.some(t=>t.person===p));
            const twoCol=!compact&&visible.length>4;
            const items=visible.map(person=>{
              const pt=dayTasks.filter(t=>t.person===person);
              return (
                <div key={person} style={{marginBottom:compact?4:8}}>
                  <div style={{fontSize:compact?9:13,color:"#94a3b8",fontWeight:700,marginBottom:3}}>{person}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    {pt.map(t=><TaskCard key={t.id} task={t} projects={data.projects} isConflict={conflictIds.has(t.id)} large onHover={(t,r)=>setHovTask(t?{task:t,rect:r}:null)}/>)}
                  </div>
                </div>
              );
            });
            return twoCol
              ? <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,alignItems:"start"}}>{items}</div>
              : items;
          })()}
          {!dayTasks.length&&<div style={{color:"#334155",fontSize:11}}>нет задач</div>}
        </div>
      </div>
    );
  }

  const dayKeys=[...new Set(filtered.map(t=>t._dayKey))]
    .filter(dk=>filtered.some(t=>t._dayKey===dk&&peopleCols.includes(t.person)))
    .sort((a,b)=>daySort(a).localeCompare(daySort(b)));
  const groups={};
  if(groupBy!=="day") filtered.forEach(t=>{
    const k=groupBy==="week"?t._weekKey:t._monthKey;
    if(!groups[k]) groups[k]=[];
    groups[k].push(t);
  });

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {["все",...people].map(p=>(
          <button key={p} onClick={()=>setFilterPerson(p==="все"?"":p)}
            style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
              borderColor:(!filterPerson&&p==="все")||(filterPerson===p)?"#3b82f6":"#334155",
              background:(!filterPerson&&p==="все")||(filterPerson===p)?"rgba(59,130,246,0.2)":"transparent",
              color:(!filterPerson&&p==="все")||(filterPerson===p)?"#93c5fd":"#64748b"}}>
            {p}
          </button>
        ))}
        <span style={{color:"#263352",margin:"0 4px"}}>│</span>
        {["все проекты",...data.projects.map(p=>p.id)].map(pid=>{
          const proj=data.projects.find(p=>p.id===pid);
          const label=proj?proj.name:"все проекты";
          const active=pid==="все проекты"?!filterProject:filterProject===pid;
          return (
            <button key={pid} onClick={()=>setFilterProject(pid==="все проекты"?"":pid)}
              style={{padding:"3px 12px",borderRadius:16,border:"1px solid",cursor:"pointer",fontSize:11,
                borderColor:active?(proj?.color||"#3b82f6"):"#334155",
                background:active?`${proj?.color||"#3b82f6"}22`:"transparent",
                color:active?(proj?.color||"#93c5fd"):"#64748b"}}>
              {label}
            </button>
          );
        })}
        <span style={{color:"#263352",margin:"0 4px"}}>│</span>
        {[["week","Неделя"],["month","Месяц"]].map(([v,l])=>(
          <button key={v} onClick={()=>setGroupBy(v)}
            style={{padding:"3px 10px",borderRadius:4,border:"1px solid",cursor:"pointer",fontSize:10,
              borderColor:groupBy===v?"#475569":"#263352",background:groupBy===v?"#334155":"transparent",
              color:groupBy===v?"#cbd5e1":"#475569"}}>{l}</button>
        ))}
        <Btn small variant="ghost" onClick={scrollToToday}>→ Сегодня</Btn>
      </div>

      <div ref={containerRef}>
        {groupBy==="day"?(
          <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(dayKeys.length,7)},1fr)`,gap:8}}>
            {dayKeys.map(dk=><DayCol key={dk} dayKey={dk} dayTasks={filtered.filter(t=>t._dayKey===dk)}/>)}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).map(([gk,gTasks])=>{
              const sample=gTasks[0];
              const title=groupBy==="week"?`Неделя ${weekLabel(sample.day)}`:`${MONTHS[parseInt(gk.split("-")[1])-1]} ${gk.split("-")[0]}`;
              const dks=[...new Set(gTasks.map(t=>t._dayKey))]
                .filter(dk=>gTasks.some(t=>t._dayKey===dk&&peopleCols.includes(t.person)))
                .sort((a,b)=>daySort(a).localeCompare(daySort(b)));
              return (
                <div key={gk}>
                  <div style={{fontSize:13,fontWeight:700,color:"#93c5fd",marginBottom:8,
                    paddingBottom:6,borderBottom:"1px solid #1e293b",display:"flex",justifyContent:"space-between"}}>
                    <span>{title}</span>
                    <span style={{fontWeight:400,fontSize:11,color:"#475569"}}>{gTasks.length} смен</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(dks.length,7)},1fr)`,gap:6}}>
                    {dks.map(dk=><DayCol key={dk} dayKey={dk} dayTasks={gTasks.filter(t=>t._dayKey===dk)} compact/>)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {hovTask&&<TaskTooltip task={hovTask.task} rect={hovTask.rect} projects={data.projects}/>}
    </div>
  );
}


// ── ПО ЛЮДЯМ ─────────────────────────────────────────────────────────
