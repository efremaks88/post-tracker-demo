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
