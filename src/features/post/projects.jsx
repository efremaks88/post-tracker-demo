function ProjectsView({data,onUpdate,onBatchUpdate,onDeleteProject,onProjectSelect,onSeriesSelect,canEdit,canDeleteStructure,isManager,canManageProjectAssignments,canEditProjectById,currentManagerEntry}){
  const {sorted:stages,stageGroups,groupMap}=useContext(StagesCtx);
  const [modal,setModal]=useState(null);
  const [directEditSeries,setDirectEditSeries]=useState(null);
  const [archFilter,setArchFilter]=useState("все");
  const [hoveredProj,setHoveredProj]=useState(null);
  const [hoveredSer,setHoveredSer]=useState(null);
  const [collapsed,setCollapsed]=useState(new Set());
  const serDragRef=useRef(null);

  function saveProject(proj){
    let projects=[...data.projects];
    const exists=proj.id&&projects.find(p=>p.id===proj.id);
    if(isManager&&exists&&!canEditProjectById?.(exists.id)) return;
    let final=exists?proj:{...proj,id:"pr"+Date.now(),dossier:proj.dossier||{}};
    if(isManager){
      final={...final,
        status:exists?(exists.status||"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435"):"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",
        managers:exists?(exists.managers||[]):([currentManagerEntry].filter(m=>m&&(m.uid||m.name)))
      };
    }
    if(exists) projects=projects.map(p=>p.id===proj.id?final:p);
    else projects.push(final);
    onUpdate("projects",projects); setModal(null);
    incrSave("project", final);
  }

  const visProjects=useMemo(()=>{
    if(archFilter==="архив") return data.projects.filter(p=>p.status==="архив");
    if(archFilter==="в работе") return data.projects.filter(p=>p.status!=="архив");
    return data.projects;
  },[data.projects,archFilter]);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <span style={{fontSize:16,fontWeight:700}}>Проекты</span>
          <div style={{display:"inline-flex",background:"#0f172a",borderRadius:10,border:"1px solid #334155",overflow:"hidden",marginLeft:8}}>
            {[["все","Все"],["в работе","В работе"],["архив","Архив"]].map(([v,l])=>(
              <button key={v} onClick={()=>setArchFilter(v)}
                style={{padding:"4px 12px",border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit",
                  background:archFilter===v?"#3b82f6":"transparent",
                  color:archFilter===v?"#fff":"#64748b",fontWeight:archFilter===v?700:400}}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {canEdit&&<Btn variant="primary" onClick={()=>setModal({name:"",abbr:"",description:"",color:PALETTE[0],status:"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",managers:isManager?[currentManagerEntry].filter(m=>m&&(m.uid||m.name)):[],dossier:{}})}>
          + Новый проект
        </Btn>}
      </div>

      {(()=>{
        const todayD=new Date(); todayD.setHours(0,0,0,0);
        const in7=new Date(todayD); in7.setDate(todayD.getDate()+7);
        const todStr=formatDate(todayD); const limStr=formatDate(in7);
        const upcoming=[];
        (data.series||[]).forEach(ser=>{
          const proj=data.projects.find(p=>p.id===ser.projectId);
          if(!proj) return;
          getSeriesMilestoneEvents(ser,proj).forEach(m=>{
            const date=m.date;
            if(date&&daySort(date)>=daySort(todStr)&&daySort(date)<=daySort(limStr))
              upcoming.push({ser,proj,type:m.label,date,color:m.color});
          });
        });
        upcoming.sort((a,b)=>daySort(a.date).localeCompare(daySort(b.date)));
        if(!upcoming.length) return null;
        const daysDiff=ds=>{const d=parseDate(ds);if(!d)return"";const diff=Math.round((d-todayD)/(86400000));return diff===0?"сегодня":diff===1?"завтра":`через ${diff} дн.`;};
        return (
          <div style={{marginBottom:16,padding:"10px 14px",background:"rgba(239,68,68,0.05)",
            border:"1px solid rgba(239,68,68,0.2)",borderRadius:12}}>
            <div style={{fontSize:11,color:"#f87171",fontWeight:700,marginBottom:8}}>! Дедлайны — ближайшие 7 дней</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              {upcoming.map((u,i)=>(
                <div key={i} onClick={()=>{if(canEditProjectById?.(u.proj.id))setDirectEditSeries({ser:u.ser,proj:u.proj});}}
                  style={{background:`${u.color}18`,border:`1px solid ${u.color}55`,borderRadius:12,
                    padding:"6px 10px",fontSize:11,cursor:"pointer",flexShrink:0,minWidth:110}}>
                  <div style={{color:u.color,fontWeight:700,fontSize:10,marginBottom:2}}>{u.type}</div>
                  <div style={{color:"#e2e8f0",fontWeight:600}}>{u.proj.abbr||u.proj.name} {u.ser.name}</div>
                  <div style={{color:"#64748b",fontSize:10,marginTop:2}}>{u.date} · {daysDiff(u.date)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {visProjects.map(proj=>{
          const pTasks=data.tasks.filter(t=>t.project===proj.id);
          const projSeries=(data.series||[]).filter(s=>s.projectId===proj.id).sort((a,b)=>(a.order||0)-(b.order||0));
          const statusColors={"в работе":"#3b82f6","ожидаем":"#8b5cf6","на паузе":"#f59e0b","сдан":"#22c55e","архив":"#475569"};
          return (
            <div key={proj.id}
              onDoubleClick={()=>onProjectSelect&&onProjectSelect(proj.id)}
              onMouseEnter={()=>setHoveredProj(proj.id)}
              onMouseLeave={()=>setHoveredProj(null)}
              title="Двойной клик — открыть карточку проекта"
              style={{background:hoveredProj===proj.id?"#243040":"#1e293b",
                border:`1px solid ${hoveredProj===proj.id?proj.color+"88":proj.color+"44"}`,
                borderTop:`3px solid ${proj.color}`,borderRadius:14,cursor:"pointer",
                transition:"background 0.15s,border-color 0.15s"}}>
              <div style={{padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:12}}>
                <ProjectMark project={proj} size={12} style={{marginTop:4,boxShadow:`0 0 8px ${proj.color}`}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:17,fontWeight:700}}>{proj.name}</span>
                    {proj.abbr&&<span style={{fontSize:11,background:"rgba(255,255,255,0.07)",
                      border:"1px solid #334155",borderRadius:4,padding:"1px 6px",
                      color:"#64748b",fontFamily:"monospace"}}>{proj.abbr}</span>}
                    <select
                      value={proj.status||"в работе"}
                      onClick={e=>e.stopPropagation()}
                      onChange={e=>{
                        e.stopPropagation();
                        if(!canManageProjectAssignments) return;
                        const updated=data.projects.map(p=>p.id===proj.id?{...p,status:e.target.value}:p);
                        onUpdate("projects",updated);
                      }}
                      style={{fontSize:11,fontWeight:700,
                        background:`${statusColors[proj.status]||"#64748b"}22`,
                        color:statusColors[proj.status]||"#64748b",
                        border:`1px solid ${statusColors[proj.status]||"#64748b"}55`,
                        borderRadius:4,padding:"2px 6px",cursor:canManageProjectAssignments?"pointer":"default",outline:"none",
                        appearance:"none",WebkitAppearance:"none"}}>
                      {PROJECT_STATUSES.map(s=>(
                        <option key={s.value||s} value={s.value||s}
                          style={{background:"#1e293b",color:"#e2e8f0"}}>
                          {s.label||s}
                        </option>
                      ))}
                    </select>
                    {proj.season&&<span style={{fontSize:11,background:"rgba(255,255,255,0.05)",
                      border:"1px solid #334155",borderRadius:4,padding:"1px 8px",color:"#64748b"}}>
                      Сезон {proj.season}
                    </span>}
                  </div>
                  {proj.managers&&proj.managers.length>0&&<div className="ppt-project-managers-row">
                    <span className="ppt-project-managers-label">{"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b"}</span>
                    <div className="ppt-project-manager-chips">
                      {proj.managers.map((m,i)=>{
                        const name=m.name||m.uid||m;
                        return <span key={`${name}-${i}`} className="ppt-project-manager-chip" title={name}>
                          <span>{String(name||"?").trim().slice(0,1).toUpperCase()}</span>{name}
                        </span>;
                      })}
                    </div>
                  </div>}
                  {proj.description&&<div className="ppt-project-description-quote" title={proj.description}>{proj.description}</div>}
                  <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                    <button onClick={e=>{e.stopPropagation();setCollapsed(s=>{const n=new Set(s);n.has(proj.id)?n.delete(proj.id):n.add(proj.id);return n;})}}
                      style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:"#94a3b8",
                        padding:0,display:"flex",alignItems:"center",gap:4}}>
                      <span>{collapsed.has(proj.id)?"▶":"▼"}</span>
                      <span style={{background:"rgba(255,255,255,0.06)",border:"1px solid #334155",
                        borderRadius:4,padding:"2px 8px"}}>
                        {projSeries.length} {projSeries.length===1?"серия":projSeries.length>=2&&projSeries.length<=4?"серии":"серий"}
                      </span>
                    </button>
                    <span style={{fontSize:11,color:"#475569"}}>{pTasks.length} задач</span>
                    {canEdit&&canEditProjectById?.(proj.id)&&<button onClick={e=>{e.stopPropagation();setDirectEditSeries({ser:{name:"",shootStart:"",editStart:"",preOtkDate:"",otkDate:"",airMode:"weekly",airDay:1,airTime:"21:00",syncStart:""},proj});}}
                      style={{marginLeft:"auto",background:"#3b82f622",border:"1px solid #3b82f655",
                        borderRadius:4,color:"#3b82f6",fontSize:11,padding:"2px 10px",
                        cursor:"pointer",fontFamily:"inherit"}}>
                      + Серия
                    </button>}
                  </div>
                </div>
              </div>

              {projSeries.length>0&&!collapsed.has(proj.id)&&(
                <div style={{padding:"0 18px 14px",display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
                  {projSeries.map(ser=>{
                    const todayStr=formatDate(new Date());
                    const sTasks=pTasks.filter(t=>t.series===ser.name&&t.day===todayStr);
                    const maxStageIdx=Math.max(...sTasks.map(t=>stages.findIndex(s=>s.id===t.status)).filter(x=>x>=0),-1);
                    const autoStage=maxStageIdx>=0?stages[maxStageIdx]:null;
                    const autoGroupId=autoStage?.groupId||"";
                    const autoGroup=autoGroupId?groupMap[autoGroupId]:null;
                    const autoGroupOrder=autoGroup?.order||0;
                    const manualGroupId=ser.manualStatus||"";
                    const manualGroup=manualGroupId?groupMap[manualGroupId]:null;
                    const displayGroup=manualGroupId?manualGroup:autoGroup;
                    const displayStage=autoStage;
                    const isManual=!!manualGroupId;
                    const borderColor=displayStage?displayStage.color:proj.color;
                    function setManualStatus(gid){
                      const updSeries=(data.series||[]).map(s=>s.id===ser.id?{...s,manualStatus:gid||undefined}:s);
                      onBatchUpdate({series:updSeries,tasks:data.tasks});
                    }
                    return (
                      <div key={ser.id}
                        draggable
                        onDragStart={e=>{e.stopPropagation();serDragRef.current={id:ser.id,projId:proj.id};e.dataTransfer.effectAllowed="move";}}
                        onDragOver={e=>{e.preventDefault();e.stopPropagation();}}
                        onDrop={e=>{
                          e.preventDefault();e.stopPropagation();
                          const src=serDragRef.current;
                          if(!src||src.projId!==proj.id||src.id===ser.id) return;
                          const arr=[...projSeries];
                          const si=arr.findIndex(s=>s.id===src.id),ti=arr.findIndex(s=>s.id===ser.id);
                          if(si===-1||ti===-1) return;
                          const [item]=arr.splice(si,1);arr.splice(ti,0,item);
                          const others=(data.series||[]).filter(s=>s.projectId!==proj.id);
                          onBatchUpdate({series:[...others,...arr.map((s,i)=>({...s,order:i}))],tasks:data.tasks});
                          serDragRef.current=null;
                        }}
                        onDragEnd={()=>{serDragRef.current=null;}}
                        onDoubleClick={e=>{if(!canEdit)return;e.stopPropagation();onSeriesSelect?onSeriesSelect(ser.id):setDirectEditSeries({ser,proj});}}
                        onMouseEnter={()=>setHoveredSer(ser.id)}
                        onMouseLeave={()=>setHoveredSer(null)}
                        title="Перетащить — изменить порядок · Двойной клик — открыть"
                        style={{background:hoveredSer===ser.id?"#1a2a3a":"#0f172a",cursor:"grab",
                          borderTop:`2px solid ${borderColor}`,
                          border:hoveredSer===ser.id?`1px solid ${borderColor}55`:"1px solid transparent",
                          borderTopColor:borderColor,
                          borderRadius:10,padding:"10px 12px",
                          display:"flex",flexDirection:"column",gap:6,
                          transition:"background 0.15s,border-color 0.15s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontWeight:700,fontSize:12}}>{ser.name}</span>
                          <span style={{display:"flex",alignItems:"center",gap:4}}>
                            {isManual&&<span title="Статус задан вручную" style={{fontSize:9,color:"#f59e0b"}}></span>}
                            <span style={{fontSize:9,color:"#334155",cursor:"grab"}}>⠿</span>
                          </span>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,
                          background:displayGroup?`${borderColor}22`:"#1e293b",
                          color:displayGroup?borderColor:"#334155",
                          border:`1px solid ${displayGroup?borderColor+"44":"#1e293b"}`,
                          borderRadius:4,padding:"3px 8px",textAlign:"center",display:"block"}}>
                          {displayGroup?displayGroup.label:"—"}
                        </span>
                        <select
                          value={manualGroupId}
                          onClick={e=>e.stopPropagation()}
                          onDoubleClick={e=>e.stopPropagation()}
                          onChange={e=>{e.stopPropagation();setManualStatus(e.target.value);}}
                          style={{fontSize:10,background:"#0f172a",border:"1px solid #334155",color:"#475569",
                            borderRadius:4,padding:"2px 6px",cursor:"pointer",width:"100%"}}>
                          <option value="">авто</option>
                          {stageGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
                        </select>
                        <div style={{display:"flex",gap:1}}>
                          {stageGroups.map(g=>{
                            const achieved=autoGroupOrder>=g.order;
                            const isCur=displayGroup?.id===g.id;
                            const stg=stages.find(s=>s.groupId===g.id);
                            const c=stg?.color||"#334155";
                            return <div key={g.id} title={g.label} style={{flex:1,height:3,borderRadius:1,
                              background:isCur?c:achieved?"#334155":"#1e293b"}}/>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal&&<ProjectModal project={modal} data={data} canEdit={canEdit&&(!modal.id||canEditProjectById?.(modal.id))} canDelete={canDeleteStructure}
        canEditStatus={canManageProjectAssignments} canEditManagers={canManageProjectAssignments} currentManagerEntry={currentManagerEntry}
        onSave={saveProject} onDelete={onDeleteProject} onClose={()=>setModal(null)}/>}
      {directEditSeries&&(
        <SeriesModal series={directEditSeries.ser} project={directEditSeries.proj} data={data} canEdit={canEdit}
          onSave={ser=>{
            let allS=[...(data.series||[])];
            const isNew=!ser.id||!allS.find(s=>s.id===ser.id);
            let newTasks=data.tasks;
            if(isNew){
              const final={...ser,id:"s"+Date.now(),projectId:directEditSeries.proj.id,
                order:allS.filter(s=>s.projectId===directEditSeries.proj.id).length,
                checklists:[],notes:"",delivered:false,deliveredAt:"",assets:[],
                transitCode:"",transitVariants:["","",""],syncStart:ser.syncStart||""};
              allS.push(final);
              newTasks=data.tasks;
              onBatchUpdate({series:allS,tasks:newTasks});
              setDirectEditSeries(null);
              incrSave("series", final);
            } else {
              allS=allS.map(s=>s.id===ser.id?ser:s);
              onBatchUpdate({series:allS,tasks:newTasks});
              setDirectEditSeries(null);
              incrSave("series", ser);
            }
          }}
          onClose={()=>setDirectEditSeries(null)}/>
      )}
    </div>
  );
}

function ManagerPicker({value,options,onChange}){
  const [sel,setSel]=React.useState("");
  function handleAdd(e){
    const name=e.target.value;
    if(!name)return;
    const cur=value||[];
    const person=options.find(p=>p.name===name);
    if(!cur.some(m=>managerMatches(m,person||{id:name,name}))){
      onChange([...cur,{uid:person?person.id||name:name,name:name}]);
    }
    setSel("");
  }
  function managerMatches(m,person){
    if(!m||!person) return false;
    return accessKey(m.uid)===accessKey(person.id)||accessKey(m.uid)===accessKey(person.name)||accessKey(m.name)===accessKey(person.name)||accessKey(m.name)===accessKey(person.id);
  }
  function removeManager(name){
    onChange((value||[]).filter(m=>accessKey(m.uid)!==accessKey(name)&&accessKey(m.name)!==accessKey(name)&&accessKey(m)!==accessKey(name)));
  }
  const available=(options||[]).filter(p=>
    p.active!==false&&!((value||[]).some(m=>managerMatches(m,p)))
  );
  return (
    <div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
        {(value||[]).map(m=>{
          const name=m.name||m.uid||m;
          return (
            <span key={name} style={{display:"inline-flex",alignItems:"center",gap:4,
              background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
              padding:"2px 8px",fontSize:12,color:"#e2e8f0"}}>
              {name}
              <span onClick={()=>removeManager(name)} style={{cursor:"pointer",
                color:"#ef4444",fontSize:16,lineHeight:"12px",marginLeft:2}}>x</span>
            </span>
          );
        })}
      </div>
      <select value={sel} onChange={handleAdd}
        style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
          borderRadius:10,padding:"6px 10px",fontSize:13,width:"100%"}}>
        <option value="">--- Add Manager ---</option>
        {available.map(p=>(
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}

function ProjectModal({project,data,onSave,onDelete,onClose,canEdit,canDelete,canEditStatus,canEditManagers,currentManagerEntry}){
  const [form,setForm]=useState({...project});
  const isNew=!project.id;
  const f=form; const sf=v=>setForm(p=>({...p,...v}));
  const readonlyManagers=(f.managers&&f.managers.length)?f.managers:([currentManagerEntry].filter(m=>m&&(m.uid||m.name)));
  const managers=data.people.filter(p=>p.active!==false&&p.roles&&(p.roles.includes("мнджр")||p.roles.includes("продюсер")));

  function handleSave(){if(!f.name.trim()){alert("Введите название");return;}onSave(f);}
  return (
    <Modal title={isNew?"Новый проект":"Редактировать проект"} onClose={onClose} onSubmit={handleSave}>
      <Field label="Название"><Inp value={f.name} onChange={v=>sf({name:v})} placeholder="Название проекта"/></Field>
      <Field label="Аббревиатура (для Ганта)">
        <Inp value={f.abbr||""} onChange={v=>sf({abbr:v})} placeholder="СВ" style={{width:80}}/>
      </Field>
      <Field label="Сезон">
        <Inp value={f.season||""} onChange={v=>sf({season:v.replace(/\D/g,"")})} placeholder="1" style={{width:80}}/>
      </Field>
      <Field label="Описание">
        <textarea value={f.description||""} onChange={e=>sf({description:e.target.value})}
          placeholder="Краткое описание..."
          style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
            borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%",resize:"vertical",minHeight:60}}/>
      </Field>
      <Field label={PROJECT_VISUAL_TEXT.preview}>
        <ProjectVisualPicker project={f}
          onColor={c=>sf({color:c})}
          onVisual={visual=>sf({dossier:{...(f.dossier||{}),visual}})}/>
      </Field>
      <Field label={"\u0421\u0442\u0430\u0442\u0443\u0441"}>{canEditStatus?<Sel value={f.status} onChange={v=>sf({status:v})} options={PROJECT_STATUSES}/>:<div style={{fontSize:13,color:"#94a3b8",padding:"7px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10}}>{f.status||"\u0432 \u0440\u0430\u0431\u043e\u0442\u0435"}</div>}</Field>
      <Field label={"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b / \u041f\u0440\u043e\u0434\u044e\u0441\u0435\u0440\u044b"}>
        {canEditManagers?<ManagerPicker value={f.managers||[]} options={managers} onChange={v=>sf({managers:v})}/>:<div style={{fontSize:13,color:"#94a3b8",padding:"7px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10}}>{readonlyManagers.map(m=>m.name||m.uid||m).filter(Boolean).join(", ")||"-"}</div>}
      </Field>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:20,borderTop:"1px solid #334155",paddingTop:16}}>
        <div>{!isNew&&canDelete&&<Btn variant="danger" onClick={()=>onDelete(project.id)}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442"}</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          {canEdit&&<Btn variant="primary" onClick={handleSave}>
            {isNew?"Создать проект":"Сохранить"}
          </Btn>}
        </div>
      </div>
    </Modal>
  );
}

function SeriesListModal({project,data,onSave,onClose,canDeleteStructure}){
  const {sorted:stages}=useContext(StagesCtx);
  const getSorted=()=>(data.series||[]).filter(s=>s.projectId===project.id).sort((a,b)=>(a.order||0)-(b.order||0));
  const [local,setLocal]=useState(getSorted);
  const [seriesEdit,setSeriesEdit]=useState(null);
  const dragIdx=useRef(null);

  useEffect(()=>{ setLocal(getSorted()); },[data.series,project.id]);

  function handleDragStart(idx){ dragIdx.current=idx; }
  function handleDragOver(e,idx){
    e.preventDefault();
    if(dragIdx.current===null||dragIdx.current===idx) return;
    const arr=[...local];
    const [item]=arr.splice(dragIdx.current,1);
    arr.splice(idx,0,item);
    dragIdx.current=idx;
    setLocal(arr);
  }
  function handleDrop(){
    dragIdx.current=null;
    const reordered=local.map((s,i)=>({...s,order:i}));
    const others=(data.series||[]).filter(s=>s.projectId!==project.id);
    onSave({series:[...others,...reordered]});
  }

  function saveSeries(serData){
    if(!canEdit) return;
    let allS=[...(data.series||[])];
    let final;
    const existing=allS.find(s=>s.id===serData.id);
    const oldName=existing?.name;
    if(serData.id&&existing){
      allS=allS.map(s=>s.id===serData.id?serData:s);
      final=serData;
    } else {
      final={...serData,id:"s"+Date.now(),order:allS.filter(s=>s.projectId===project.id).length,
        transitCode:serData.transitCode||"",transitVariants:serData.transitVariants||["","",""],
        checklists:[],notes:"",delivered:false,deliveredAt:"",assets:[]};
      allS.push(final);
    }
    const isNew=!serData.id;
    let newTasks=data.tasks;
    if(!isNew&&oldName&&oldName!==final.name)
      newTasks=newTasks.map(t=>t.seriesId===final.id&&t.series===oldName?{...t,series:final.name}:t);
    onSave({series:allS,tasks:newTasks});
    setSeriesEdit(null);
    incrSave("series", final);
  }

  function deleteSeries(id){
    if(!canDeleteStructure) return;
    if(!window.confirm("Удалить серию и все её задачи? Действие можно отменить через Ctrl+Z.")) return;
    onSave(deleteSeriesSnapshot(data,id));
    incrDelete("series", id);
  }

  const pTasks=data.tasks.filter(t=>t.project===project.id);

  return (
    <Modal title={`Серии — ${project.name}`} onClose={onClose} wide>
      <div style={{marginBottom:12}}>
        {local.length===0&&(
          <div style={{color:"#475569",fontSize:13,textAlign:"center",padding:"20px 0"}}>
            Серий пока нет. Добавьте первую.
          </div>
        )}
        {local.map((ser,idx)=>{
          const sTasks=pTasks.filter(t=>t.series===ser.name);
          const maxOrder=Math.max(...sTasks.map(t=>stages.findIndex(s=>s.id===t.status)).filter(x=>x>=0),-1);
          const curStatus=maxOrder>=0?stages[maxOrder]?.id:sTasks[0]?.status||"";
          return (
            <div key={ser.id}
              draggable
              onDragStart={()=>handleDragStart(idx)}
              onDragOver={e=>handleDragOver(e,idx)}
              onDrop={handleDrop}
              style={{display:"flex",alignItems:"center",gap:10,
                background:"#0f172a",border:"1px solid #334155",
                borderRadius:12,padding:"10px 14px",marginBottom:6,
                cursor:"grab",userSelect:"none"}}>
              <span style={{color:"#334155",fontSize:18,flexShrink:0,lineHeight:1}}>⠿</span>
              <div style={{fontWeight:700,fontSize:14,minWidth:40,color:"#e2e8f0"}}>{ser.name}</div>
              <div style={{flex:1,display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
                {ser.editStart&&<span>Монтаж: <span style={{color:"#94a3b8"}}>{ser.editStart}</span></span>}
                {ser.otkDate&&<span>{getProjectMilestoneMeta(project,'otkDate',SERIES_MILESTONES.find(m=>m.key==='otkDate')).label}: <span style={{color:"#22c55e"}}>{ser.otkDate}</span></span>}
                {ser.airDate&&<span>📺 <span style={{color:"#f59e0b"}}>{ser.airDate}</span></span>}
              </div>
              <StatusBadge s={curStatus} small/>
              {canEdit&&<Btn small variant="ghost" onClick={e=>{e.stopPropagation();setSeriesEdit(ser);}}>Изм</Btn>}
              {canEdit&&<Btn small variant="danger" onClick={e=>{e.stopPropagation();deleteSeries(ser.id);}}>×</Btn>}
            </div>
          );
        })}
      </div>
      {canEdit&&<Btn variant="primary" onClick={()=>setSeriesEdit({
        projectId:project.id,name:"",order:local.length,
        shootStart:"",shootEnd:"",editStart:"",preOtkDate:"",otkDate:"",
        airDate:"",airMode:"weekly",airDay:1,airTime:"21:00",
      })}>+ Добавить серию</Btn>}
      {seriesEdit&&<SeriesModal series={seriesEdit} project={project} onSave={saveSeries} onClose={()=>setSeriesEdit(null)}/>}
    </Modal>
  );
}

function SeriesModal({series,onSave,onClose,templates,project}){
  const holidays=useContext(HolidaysCtx);
  const [form,setForm]=useState({...series});
  const isNew=!series.id;
  const f=form; const sf=v=>setForm(p=>({...p,...v}));
  const preOtkWarn=f.preOtkDate&&isNonWorkday(f.preOtkDate,holidays);
  const otkWarn=f.otkDate&&isNonWorkday(f.otkDate,holidays);
  const preOtkMeta=getProjectMilestoneMeta(project,'preOtkDate',SERIES_MILESTONES.find(m=>m.key==='preOtkDate'));
  const otkMeta=getProjectMilestoneMeta(project,'otkDate',SERIES_MILESTONES.find(m=>m.key==='otkDate'));
  function handleSave(){if(!f.name.trim()){alert("Введите название серии");return;}onSave(f);}

  function applyTemplate(tmplId){
    const t=(templates||[]).find(x=>x.id===tmplId);
    if(!t||!f.editStart) return;
    const totalPost=(t.editDays||0)+(t.csoundDays||0)+(t.corrDays||0);
    const totalAll=totalPost+(t.masterDays||0)+(t.otherDays||0);
    const preOtk=addWorkdays(f.editStart,totalPost,holidays);
    const otk=addWorkdays(f.editStart,totalAll,holidays);
    sf({preOtkDate:preOtk,otkDate:otk});
  }

  return (
    <Modal title={isNew?"Новая серия":`Серия: ${series.name||"—"}`} onClose={onClose} wide onSubmit={handleSave}>
      {isNew&&templates?.length>0&&(
        <div style={{marginBottom:16,padding:"10px 12px",background:"rgba(59,130,246,0.07)",
          border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:"#64748b",flexShrink:0}}>Шаблон:</span>
          <select onChange={e=>{if(e.target.value)applyTemplate(e.target.value);e.target.value="";}}
            style={{background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",
              padding:"5px 10px",fontSize:12,flex:1,cursor:"pointer"}}>
            <option value="">— Применить шаблон дат —</option>
            {(templates||[]).map(t=>(
              <option key={t.id} value={t.id}>{t.name} ({(t.editDays||0)+(t.csoundDays||0)+(t.corrDays||0)+(t.masterDays||0)+(t.otherDays||0)}д)</option>
            ))}
          </select>
          <span style={{fontSize:11,color:"#475569"}}>← заполните «Старт монтажа» перед выбором</span>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div>
          <Field label="Название серии">
            <Inp value={f.name} onChange={v=>sf({name:v})} placeholder="С01"/>
          </Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,marginBottom:10}}>СЪЁМКИ</div>
          <Field label="Начало съёмок"><InpDate value={f.shootStart||""} onChange={v=>sf({shootStart:v})}/></Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,margin:"14px 0 10px"}}>СИНХРА</div>
          <Field label="Начало синхры"><InpDate value={f.syncStart||""} onChange={v=>sf({syncStart:v})}/></Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,margin:"14px 0 10px"}}>ПОСТПРОДАКШН</div>
          <Field label="Старт монтажа"><InpDate value={f.editStart||""} onChange={v=>sf({editStart:v})}/></Field>
          <div style={{fontSize:11,color:"#64748b",letterSpacing:1,margin:"14px 0 10px"}}>КЛЮЧЕВЫЕ СОБЫТИЯ</div>
          <Field label="Отправка заказчику">
            <InpDate value={f.sendDate||""} onChange={v=>sf({sendDate:v})}/>
          </Field>
          <Field label={preOtkMeta.label}>
            <InpDate value={f.preOtkDate||""} onChange={v=>sf({preOtkDate:v})} warn={preOtkWarn}/>
          </Field>
          <Field label={otkMeta.label}>
            <InpDate value={f.otkDate||""} onChange={v=>sf({otkDate:v})} warn={otkWarn}/>
          </Field>
          <Field label="Эфир">
            <InpDate value={f.airDate||""} onChange={v=>sf({airDate:v})}/>
          </Field>
        </div>
        <div>
          {isNew&&(
            <div style={{background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.2)",
              borderRadius:10,padding:"10px 12px",fontSize:12,color:"#64748b"}}>
              <div style={{fontWeight:600,color:"#94a3b8",marginBottom:6}}>{"\u0414\u0430\u0442\u044b \u0431\u0435\u0437 \u0430\u0432\u0442\u043e\u0441\u043c\u0435\u043d"}</div>
              <div>{"\u0414\u0430\u0442\u044b \u0441\u0435\u0440\u0438\u0438 \u043f\u043e\u043f\u0430\u0434\u0443\u0442 \u0432 \u041a\u041f\u041f \u0438 \u043a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c. \u0421\u043c\u0435\u043d\u044b \u0441\u043e\u0437\u0434\u0430\u044e\u0442\u0441\u044f \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u043e \u0432 \u0413\u0430\u043d\u0442\u0435."}</div>
            </div>
          )}
          {getSeriesMilestoneEvents(f,project).length>0&&(
            <div style={{marginTop:isNew?12:0,background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.2)",
              borderRadius:10,padding:"10px 12px",fontSize:12,color:"#64748b"}}>
              <div style={{fontWeight:600,color:"#94a3b8",marginBottom:6}}>Ключевые события</div>
              {getSeriesMilestoneEvents(f,project).map(m=>(
                <div key={m.key} style={{marginBottom:3,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:m.color,flexShrink:0,display:"inline-block"}}/>
                  <span style={{color:m.color,fontWeight:600}}>{m.label}</span>
                  <span>→ {m.date}</span>
                </div>
              ))}
            </div>
          )}
      </div>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,
        borderTop:"1px solid #334155",paddingTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={handleSave}>{isNew?"Создать серию":"Сохранить"}</Btn>
      </div>
    </Modal>
  );
}

// ── КАЛЕНДАРЬ ────────────────────────────────────────────────────────
