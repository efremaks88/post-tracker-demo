function DirectoryView({data,onUpdate:writeUpdate,onBatchUpdate:writeBatchUpdate,onLog,user,onUserUpdate}){
  const [tab,setTab]=useState("roles");
  const [personModal,setPersonModal]=useState(null);
  const [stageModal,setStageModal]=useState(null);
  const [roleForm,setRoleForm]=useState({id:"",label:"",color:"#6366f1"});
  const [editRoleId,setEditRoleId]=useState(null);
  const [search,setSearch]=useState("");
  const [dragOverStage,setDragOverStage]=useState(null);
  const stageDragRef=useRef(null);
  const [newHoliday,setNewHoliday]=useState("");
  const [tmplModal,setTmplModal]=useState(null);
  const [achievementModal,setAchievementModal]=useState(null);


  const stages=(data.stages&&data.stages.length)?[...data.stages].sort((a,b)=>(a.order||0)-(b.order||0)):DEFAULT_STAGES;
  const stageGroups=(data.stageGroups&&data.stageGroups.length)?[...data.stageGroups].sort((a,b)=>(a.order||0)-(b.order||0)):DEFAULT_STAGE_GROUPS;
  const holidays=data.holidays||DEFAULT_HOLIDAYS;
  const roles=data.roles||DEMO_ROLES;
  const achievements=achievementList(data);
  const canEditAchievements=user?.role==="admin";
  const canManagePeople=user?.role==="admin"||user?.role==="lead";
  const onUpdate=(...args)=>{if(canManagePeople)writeUpdate(...args);};
  const onBatchUpdate=(...args)=>{if(canManagePeople)writeBatchUpdate(...args);};

  function saveRole(role){
    let newRoles=editRoleId?roles.map(r=>r.id===editRoleId?{...r,...role}:r):[...roles,role];
    onUpdate("roles",newRoles);
    setEditRoleId(null); setRoleForm({id:"",label:"",color:"#6366f1"});
  }
  function deleteRole(id){
    if(!canManagePeople) return;
    if(!window.confirm(`Удалить роль "${id}"?`)) return;
    const newRoles=roles.filter(r=>r.id!==id);
    const newStages=stages.map(s=>({...s,rolesRequired:(s.rolesRequired||[]).filter(r=>r!==id)}));
    onBatchUpdate({roles:newRoles,stages:newStages,people:(data.people||[]).map(p=>({...p,roles:(p.roles||[]).filter(r=>r!==id)}))}); incrDelete("role", id);
  }
  function savePerson(person){
    if(!canManagePeople) return;
    let people=[...data.people];
    const exists=person.id&&people.find(p=>p.id===person.id);
    const final=exists?person:{...person,id:"p"+Date.now()};
    if(exists) people=people.map(p=>p.id===final.id?final:p);
    else people.push(final);
    if(exists&&exists.name!==final.name){
      onBatchUpdate({people,tasks:(data.tasks||[]).map(t=>t.person===exists.name?{...t,person:final.name,_updatedAt:Date.now()}:t),
        personAbsences:(data.personAbsences||[]).map(a=>a.personId===final.id||a.personName===exists.name?{...a,personName:final.name,_updatedAt:Date.now()}:a)});
    } else onUpdate("people",people);
    setPersonModal(null);
    incrSave("person", final);
  }

  function deletePerson(id){
    if(!window.confirm("Удалить сотрудника?")) return;
    onUpdate("people",data.people.map(p=>p.id===id?{...p,deleted:true,_updatedAt:Date.now()}:p)); setPersonModal(null);
    incrDelete("person", id);
  }
  function deleteStage(id){
    if(!canManagePeople) return;
    if((data.tasks||[]).some(t=>t.status===id)){alert("Этап используется в задачах. Сначала перенесите задачи на другой этап.");return;}
    if(!window.confirm("Удалить этап?")) return;
    onUpdate("stages",stages.filter(s=>s.id!==id).map((s,i)=>({...s,order:i+1})));
  }
  function saveStage(stage){
    const arr=stages.map(s=>s.id===stage.id?stage:s);
    onUpdate("stages",arr); setStageModal(null);
  }
  function addStage(){
    const id="stage_"+Date.now();
    const newStage={id,label:"Новый этап",color:"#64748b",order:stages.length+1,
      groupId:"",rolesRequired:[],needsExecutor:true};
    onUpdate("stages",[...stages,newStage]);
    setStageModal(newStage);
  }
  function saveGroup(g){
    const arr=stageGroups.find(x=>x.id===g.id)
      ?stageGroups.map(x=>x.id===g.id?g:x)
      :[...stageGroups,g];
    onUpdate("stageGroups",arr);
  }
  function deleteGroup(id){
    if(!canManagePeople) return;
    if(!window.confirm("Удалить группу?")) return;
    onBatchUpdate({stageGroups:stageGroups.filter(g=>g.id!==id).map((g,i)=>({...g,order:i+1})),stages:stages.map(s=>s.groupId===id?{...s,groupId:""}:s)});
  }
  function addGroup(){
    const g={id:"sg"+Date.now(),label:"Новая группа",order:stageGroups.length+1};
    onUpdate("stageGroups",[...stageGroups,g]);
  }
  function addHoliday(){
    if(!newHoliday) return;
    if(holidays.includes(newHoliday)){setNewHoliday("");return;}
    onUpdate("holidays",[...holidays,newHoliday].sort());
    setNewHoliday("");
  }
  function removeHoliday(d){
    onUpdate("holidays",holidays.filter(h=>h!==d));
  }
  function saveAchievement(achievement){
    if(!canEditAchievements) return;
    const a=normalizeAchievement(achievement);
    if(!a.title){alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0430\u0447\u0438\u0432\u043a\u0438");return;}
    const ar=ACHIEVEMENT_RULES.find(r=>r.id===a.ruleType);
    if((ar?.needsStage||ar?.needsGroup||ar?.needsRole)&&!a.stageId){alert("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0446\u0435\u043b\u044c \u0443\u0441\u043b\u043e\u0432\u0438\u044f");return;}
    const arr=achievements.find(x=>x.id===a.id)?achievements.map(x=>x.id===a.id?a:x):[...achievements,a];
    onUpdate("achievements",arr);
    incrSave("achievement",a);
    setAchievementModal(null);
  }
  function deleteAchievement(id){
    if(!canEditAchievements) return;
    if(!window.confirm("\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u0447\u0438\u0432\u043a\u0443?")) return;
    onUpdate("achievements",achievements.filter(a=>a.id!==id));
    incrDelete("achievement",id);
  }

  const filtered=data.people.filter(p=>!p.deleted&&(!search||(p.name||'').toLowerCase().includes(search.toLowerCase())));

  const TAB_S={display:"inline-flex",gap:0,background:"#0f172a",borderRadius:10,
    border:"1px solid #334155",overflow:"hidden",marginBottom:20};
  const tabBtn=(id,label)=>(
    <button key={id} onClick={()=>setTab(id)} style={{
      padding:"6px 16px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",
      background:tab===id?"#3b82f6":"transparent",
      color:tab===id?"#fff":"#64748b",fontWeight:tab===id?700:400}}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={TAB_S}>
        {tabBtn("roles","Роли")}
        {tabBtn("stages","Этапы")}
        {tabBtn("groups","Группы этапов")}
        {tabBtn("people","Сотрудники")}
        {tabBtn("holidays","Праздники")}
        {tabBtn("templates","Шаблоны серий")}
        {tabBtn("achievements","\u0410\u0447\u0438\u0432\u043a\u0438")}
        {tabBtn("users","AD")}
      </div>

      {!canManagePeople&&!["achievements","users"].includes(tab)&&<p style={{fontSize:12,color:"#94a3b8"}}>Справочники доступны для просмотра. Изменять их могут администратор и руководитель.</p>}
      <fieldset disabled={!canManagePeople} style={{border:0,padding:0,margin:0,minWidth:0}}>
      {tab==="roles"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"start"}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#93c5fd",marginBottom:12}}>Справочник ролей</div>
            {roles.map(role=>(
              <div key={role.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
                borderRadius:12,padding:"9px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:10,height:10,borderRadius:2,background:role.color,flexShrink:0}}/>
                {editRoleId===role.id?(
                  <>
                    <Inp value={roleForm.label} onChange={v=>setRoleForm(f=>({...f,label:v}))}
                      style={{flex:1}} placeholder="Название"/>
                    <input type="color" value={roleForm.color}
                      onChange={e=>setRoleForm(f=>({...f,color:e.target.value}))}
                      style={{width:32,height:30,border:"none",background:"none",cursor:"pointer"}}/>
                    <Btn small variant="primary" onClick={()=>saveRole({id:role.id,...roleForm})}>OK</Btn>
                    <Btn small variant="ghost" onClick={()=>setEditRoleId(null)}>✕</Btn>
                  </>
                ):(
                  <>
                    <span style={{flex:1,fontSize:13}}>{role.label}</span>
                    <span style={{fontSize:10,color:"#475569",fontFamily:"monospace"}}>{role.id}</span>
                    <Btn small variant="ghost" onClick={()=>{setEditRoleId(role.id);setRoleForm({label:role.label,color:role.color});}}>Изм</Btn>
                    <Btn small variant="danger" onClick={()=>deleteRole(role.id)}>✕</Btn>
                  </>
                )}
              </div>
            ))}
            <div style={{background:"rgba(59,130,246,0.05)",border:"1px dashed #334155",borderRadius:12,padding:"12px 14px",marginTop:8}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:8,letterSpacing:1}}>НОВАЯ РОЛЬ</div>
              <Field label="ID (лат.)">
                <Inp value={roleForm.id} onChange={v=>setRoleForm(f=>({...f,id:v}))} placeholder="montazh"/>
              </Field>
              <Field label="Название">
                <div style={{display:"flex",gap:8}}>
                  <Inp value={roleForm.label} onChange={v=>setRoleForm(f=>({...f,label:v}))}
                    placeholder="Монтажёр" style={{flex:1}}/>
                  <input type="color" value={roleForm.color}
                    onChange={e=>setRoleForm(f=>({...f,color:e.target.value}))}
                    style={{width:40,height:36,border:"1px solid #334155",borderRadius:10,background:"#0f172a",cursor:"pointer"}}/>
                </div>
              </Field>
              <Btn variant="primary" onClick={()=>{
                if(!roleForm.label||!roleForm.id){alert("Заполните ID и название");return;}
                if(roles.find(r=>r.id===roleForm.id)){alert("Такой ID уже есть");return;}
                saveRole({id:roleForm.id,label:roleForm.label,color:roleForm.color});
              }}>+ Добавить роль</Btn>
            </div>
          </div>
        </div>
      )}

      {tab==="stages"&&(
        <div style={{maxWidth:600}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Этапы производства ({stages.length})</span>
            <Btn variant="primary" onClick={addStage}>+ Добавить этап</Btn>
          </div>
          {stages.map((stage,i)=>{
            const isDragOver=dragOverStage===stage.id&&stageDragRef.current!==stage.id;
            return (
            <div key={stage.id}
              draggable
              onDragStart={()=>{stageDragRef.current=stage.id;}}
              onDragOver={e=>{e.preventDefault();if(stageDragRef.current!==stage.id)setDragOverStage(stage.id);}}
              onDragLeave={()=>setDragOverStage(null)}
              onDrop={e=>{
                e.preventDefault();
                const fromId=stageDragRef.current;
                if(!fromId||fromId===stage.id){setDragOverStage(null);return;}
                const arr=[...stages];
                const fi=arr.findIndex(s=>s.id===fromId);
                const ti=arr.findIndex(s=>s.id===stage.id);
                const [item]=arr.splice(fi,1);
                arr.splice(ti,0,item);
                onUpdate("stages",arr.map((s,idx)=>({...s,order:idx+1})));
                setDragOverStage(null);stageDragRef.current=null;
              }}
              onDragEnd={()=>{setDragOverStage(null);stageDragRef.current=null;}}
              style={{background:"#1e293b",
                border:`1px solid ${isDragOver?"#3b82f6":"#334155"}`,
                borderRadius:12,padding:"9px 12px",marginBottom:6,
                display:"flex",alignItems:"center",gap:8,
                cursor:"grab",userSelect:"none",
                boxShadow:isDragOver?"0 0 0 2px #3b82f644":"none",
                opacity:stageDragRef.current===stage.id?0.5:1,
                transition:"border-color 0.1s,box-shadow 0.1s"}}>
              <div style={{color:"#334155",fontSize:14,padding:"0 4px",cursor:"grab",flexShrink:0}}>⠿</div>
              <span style={{fontSize:10,color:"#334155",width:16,textAlign:"right",flexShrink:0}}>{i+1}</span>
              <div style={{width:10,height:10,borderRadius:2,background:stage.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <span style={{fontSize:13,fontWeight:600}}>{stage.label}</span>
                {!stage.needsExecutor&&<span style={{fontSize:9,color:"#64748b",marginLeft:6}}>без исполнителя</span>}
                {stage.noImpact&&<span style={{fontSize:9,color:"#f97316",marginLeft:6,background:"rgba(249,115,22,0.1)",borderRadius:3,padding:"1px 4px"}}>без влияния</span>}
                {(()=>{
                  const knownRoles=(stage.rolesRequired||[]).filter(rid=>roles.find(r=>r.id===rid));
                  const missing=(stage.rolesRequired||[]).filter(rid=>!roles.find(r=>r.id===rid));
                  return (knownRoles.length>0||missing.length>0)&&(
                    <div style={{fontSize:10,color:"#475569",marginTop:1}}>
                      Роли: {knownRoles.map(rid=>roles.find(r=>r.id===rid)?.label||rid).join(", ")}
                      {missing.length>0&&<span style={{color:"#ef4444",marginLeft:4}}>
                        ! удалены: {missing.join(", ")}
                      </span>}
                    </div>
                  );
                })()}
              </div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <div style={{width:40,height:18,borderRadius:3,background:stageBg(stage.color),
                  border:`1px solid ${stageBorder(stage.color)}`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:9,color:stage.color,fontWeight:700}}>
                  {stage.label.slice(0,3)}
                </div>
                <Btn small variant="ghost" onClick={()=>setStageModal(stage)}>Изм</Btn>
                <Btn small variant="danger" onClick={()=>deleteStage(stage.id)}>✕</Btn>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {tab==="people"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>
              Сотрудники ({data.people.filter(p=>p.active!==false&&!p.deleted).length} акт.)
            </span>
            <div style={{display:"flex",gap:8}}>
            <Btn variant="primary" onClick={()=>setPersonModal({name:"",roles:DEMO_ROLES,active:true})}>+ Добавить</Btn>
          </div>
          </div>
          <Inp value={search} onChange={setSearch} placeholder="🔍 Поиск сотрудников..." style={{marginBottom:10,maxWidth:400}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {filtered.map(person=>(
              <div key={person.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
                borderRadius:12,padding:"9px 12px",
                display:"flex",alignItems:"center",gap:10,opacity:person.active===false?0.5:1}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:"#0f172a",border:"2px solid #334155",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#64748b",flexShrink:0}}>
                  {(person.name||"?")[0]}
                </div>
                <div style={{flex:1,overflow:"hidden"}}>
                  <div style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {person.name}
                    {person.active===false&&<span style={{fontSize:10,color:"#475569",marginLeft:6}}>неактивен</span>}
                  </div>
                  {person.login&&<div style={{fontSize:9,color:"#475569",marginTop:1}}>🔗 {person.login}{person.email?" · "+person.email:""}</div>}
                  <div style={{display:"flex",gap:3,marginTop:3,flexWrap:"wrap"}}>
                    {(person.roles||[]).map(r=>{
                      const role=roles.find(rl=>rl.id===r);
                      const rk = typeof r === "string" ? r : (r.id || JSON.stringify(r)); return <span key={rk} style={{fontSize:9,background:"transparent",
                        color:role?.color||"#64748b",border:`1.5px solid ${role?.color||"#64748b"}`,
                        borderRadius:3,padding:"1px 5px"}}>{role?.label||r}</span>;
                    })}
                  </div>
                </div>
                <Btn small variant="ghost" onClick={()=>setPersonModal(person)}>Изм</Btn>
              </div>
            ))}
          </div>
          {personModal&&canManagePeople&&<PersonModal person={personModal} roles={roles} canEditBirthday={user?.role==="admin"}
            onSave={savePerson} onDelete={deletePerson} onClose={()=>setPersonModal(null)}/>}
        </div>
      )}

      {tab==="holidays"&&(
        <div style={{maxWidth:520}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>
              Нерабочие дни ({holidays.length})
            </span>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input type="date"
              onChange={e=>{if(e.target.value)setNewHoliday(fromInput(e.target.value));}}
              style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
                borderRadius:10,padding:"7px 10px",fontSize:13,flex:1}}/>
            <Btn variant="primary" onClick={addHoliday}>+ Добавить</Btn>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {[...holidays].sort().map(d=>{
              const pd=parseDate(d);
              const dow=pd?WDAYS[pd.getDay()]:"";
              return (
                <div key={d} style={{background:"rgba(59,130,246,0.08)",border:"1px solid #334155",
                  borderRadius:10,padding:"4px 10px",display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                  <span style={{color:"#475569",fontSize:10}}>{dow}</span>
                  <span>{d}</span>
                  <button onClick={()=>removeHoliday(d)}
                    style={{background:"none",border:"none",color:"#475569",cursor:"pointer",
                      fontSize:14,lineHeight:1,padding:0}}>×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="groups"&&(
        <div style={{maxWidth:500}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Группы этапов</span>
            <Btn variant="primary" small onClick={addGroup}>+ Группа</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {stageGroups.map(g=>(
              <div key={g.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,
                padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:13,color:"#64748b",minWidth:20,textAlign:"right"}}>{g.order}</span>
                <input value={g.label} onChange={e=>saveGroup({...g,label:e.target.value})}
                  style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
                    borderRadius:10,padding:"5px 10px",fontSize:13,flex:1}}/>
                <button onClick={()=>deleteGroup(g.id)}
                  style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",
                    color:"#f87171",borderRadius:10,padding:"4px 10px",cursor:"pointer",fontSize:12}}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:"10px 12px",background:"rgba(59,130,246,0.07)",
            border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,fontSize:12,color:"#64748b"}}>
            Группы используются для отображения статуса серии. Назначьте группу каждому этапу на вкладке «Этапы».
          </div>
        </div>
      )}

      {tab==="templates"&&(()=>{
        const templates=data.templates||[];
        function saveTmpl(t){
          const arr=templates.find(x=>x.id===t.id)
            ?templates.map(x=>x.id===t.id?t:x)
            :[...templates,{...t,id:"tmpl_"+Date.now()}];
          onUpdate("templates",arr);
          onLog?.(`Шаблон «${t.name}» сохранён`);
          setTmplModal(null);
        }
        function deleteTmpl(id){
          if(!window.confirm("Удалить шаблон?")) return;
          onUpdate("templates",templates.filter(t=>t.id!==id));
        }
        return (
          <div style={{maxWidth:680}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>Шаблоны серий ({templates.length})</span>
              <Btn variant="primary" small onClick={()=>setTmplModal({name:"",editDays:5,csoundDays:3,corrDays:2,masterDays:1,otherDays:0})}>+ Шаблон</Btn>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {templates.map(t=>{
                const total=t.editDays+t.csoundDays+t.corrDays+t.masterDays+(t.otherDays||0);
                return (
                  <div key={t.id} style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
                    borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{t.name}</div>
                      <div style={{fontSize:11,color:"#64748b",display:"flex",gap:12,flexWrap:"wrap"}}>
                        <span>Монтаж: <b style={{color:"#94a3b8"}}>{t.editDays}д</b></span>
                        <span>Цвет/Звук: <b style={{color:"#94a3b8"}}>{t.csoundDays}д</b></span>
                        <span>Правки: <b style={{color:"#94a3b8"}}>{t.corrDays}д</b></span>
                        <span>Мастеринг: <b style={{color:"#94a3b8"}}>{t.masterDays}д</b></span>
                        {t.otherDays?<span>Прочее: <b style={{color:"#94a3b8"}}>{t.otherDays}д</b></span>:null}
                        <span style={{color:"#3b82f6",fontWeight:600}}>Итого: {total}д</span>
                      </div>
                    </div>
                    <Btn variant="ghost" small onClick={()=>setTmplModal(t)}>✏</Btn>
                    <Btn variant="danger" small onClick={()=>deleteTmpl(t.id)}>×</Btn>
                  </div>
                );
              })}
              {!templates.length&&(
                <div style={{color:"#334155",fontSize:13,padding:"20px 0",textAlign:"center"}}>
                  Шаблонов нет. Создайте шаблон, чтобы быстро заполнять даты новых серий.
                </div>
              )}
            </div>
            <div style={{marginTop:16,padding:"10px 12px",background:"rgba(59,130,246,0.07)",
              border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,fontSize:12,color:"#64748b"}}>
              При создании серии можно выбрать шаблон — даты Пред-ОТК и ОТК рассчитаются автоматически от даты старта монтажа.
            </div>
          </div>
        );
      })()}
      </fieldset>
      {tab==="achievements"&&(
        <AchievementsSettings achievements={achievements} stages={stages} stageGroups={stageGroups} roles={roles} canEdit={canEditAchievements}
          onNew={()=>setAchievementModal({id:"ach_"+Date.now(),title:"",description:"",icon:"A",image:"",color:"#38bdf8",ruleType:"shifts_count",threshold:1,stageId:"",enabled:true})}
          onEdit={setAchievementModal} onDelete={deleteAchievement}/>
      )}

      {tab==="users"&&(
              <UsersView user={user} onUserUpdate={onUserUpdate}/>
            )}

      {achievementModal&&<AchievementModal achievement={achievementModal} stages={stages} stageGroups={stageGroups} roles={roles}
        onSave={saveAchievement} onClose={()=>setAchievementModal(null)}/>} 

      {tmplModal&&<SeriesTemplateModal tmpl={tmplModal} onSave={t=>{
        const arr=(data.templates||[]);
        const isNew=!t.id||!arr.find(x=>x.id===t.id);
        const saved=isNew?{...t,id:"tmpl_"+Date.now()}:t;
        onUpdate("templates",isNew?[...arr,saved]:arr.map(x=>x.id===saved.id?saved:x));
        onLog?.(`Шаблон «${saved.name}» ${isNew?"создан":"обновлён"}`);
        setTmplModal(null);
      }} onClose={()=>setTmplModal(null)}/>}

      {stageModal&&<StageEditModal stage={stageModal} roles={roles} stageGroups={stageGroups}
        onSave={saveStage} onClose={()=>setStageModal(null)}/>}
    </div>
  );
}


function AchievementsSettings({achievements,stages,stageGroups,roles,canEdit,onNew,onEdit,onDelete}){
  const sorted=[...(achievements||[])].sort((a,b)=>(a.enabled===b.enabled?0:(a.enabled?-1:1))||a.title.localeCompare(b.title));
  return (
    <div style={{maxWidth:900}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#93c5fd"}}>{"\u0410\u0447\u0438\u0432\u043a\u0438"} ({sorted.length})</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{"\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0441\u0447\u0438\u0442\u0430\u044e\u0442\u0441\u044f \u043f\u043e \u0441\u043c\u0435\u043d\u0430\u043c \u0438 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0432 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0435 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430"}</div>
        </div>
        {canEdit?<Btn variant="primary" onClick={onNew}>{"+ \u0410\u0447\u0438\u0432\u043a\u0430"}</Btn>:<span style={{fontSize:12,color:"#64748b"}}>{"\u041c\u0435\u043d\u044f\u0442\u044c \u043c\u043e\u0436\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e admin"}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
        {sorted.map(a=>{
          const rule=ACHIEVEMENT_RULES.find(r=>r.id===a.ruleType);
          const target=rule?.needsGroup?(stageGroups||[]).find(g=>g.id===a.stageId):rule?.needsRole?(roles||[]).find(r=>r.id===a.stageId):(stages||[]).find(s=>s.id===a.stageId);
          return (
            <div key={a.id} style={{background:a.enabled!==false?`${a.color}14`:"#1e293b",border:`1px solid ${a.enabled!==false?a.color+"55":"#334155"}`,borderRadius:12,padding:"12px 14px",opacity:a.enabled!==false?1:0.55}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                <div style={{width:38,height:38,borderRadius:12,background:`${a.color}22`,border:`1px solid ${a.color}66`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",color:a.color,fontWeight:900,fontSize:12,flexShrink:0}}>
                  {a.image?<img src={a.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(a.icon||"?")}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.title}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{a.description||"\u0411\u0435\u0437 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u044f"}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:"#94a3b8",display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                <span style={{border:"1px solid #334155",borderRadius:999,padding:"2px 7px"}}>{rule?.label||a.ruleType}: {a.threshold}</span>
                {target&&<span style={{border:"1px solid #334155",borderRadius:999,padding:"2px 7px",color:target.color||"#94a3b8"}}>{target.label||target.id}</span>}
                {a.enabled===false&&<span style={{border:"1px solid #475569",borderRadius:999,padding:"2px 7px",color:"#64748b"}}>{"\u0432\u044b\u043a\u043b"}</span>}
              </div>
              {canEdit&&<div style={{display:"flex",gap:6}}>
                <Btn small variant="ghost" onClick={()=>onEdit(a)}>{"\u0418\u0437\u043c"}</Btn>
                <Btn small variant="danger" onClick={()=>onDelete(a.id)}>{"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}</Btn>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AchievementModal({achievement,stages,stageGroups,roles,onSave,onClose}){
  const [form,setForm]=useState(normalizeAchievement(achievement));
  const sf=v=>setForm(f=>({...f,...v}));
  const rule=ACHIEVEMENT_RULES.find(r=>r.id===form.ruleType)||ACHIEVEMENT_RULES[0];
  const targetOptions=rule.needsGroup?(stageGroups||[]):rule.needsRole?(roles||[]):(stages||[]);
  const targetLabel=rule.needsGroup?"\u0413\u0440\u0443\u043f\u043f\u0430 \u044d\u0442\u0430\u043f\u043e\u0432":rule.needsRole?"\u0420\u043e\u043b\u044c \u044d\u0442\u0430\u043f\u0430":"\u042d\u0442\u0430\u043f";
  function chooseImage(e){
    const file=e.target.files&&e.target.files[0];
    if(!file) return;
    if(file.size>150000){alert("\u041a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0441\u043b\u0438\u0448\u043a\u043e\u043c \u0431\u043e\u043b\u044c\u0448\u0430\u044f. \u0414\u043e 150 \u041a\u0411");return;}
    const reader=new FileReader();
    reader.onload=ev=>sf({image:String(ev.target.result||"")});
    reader.readAsDataURL(file);
  }
  return (
    <Modal title={achievement.title?"\u0410\u0447\u0438\u0432\u043a\u0430":"\u041d\u043e\u0432\u0430\u044f \u0430\u0447\u0438\u0432\u043a\u0430"} onClose={onClose} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="ID"><Inp value={form.id} onChange={v=>sf({id:v.replace(/[^a-zA-Z0-9_-]/g,"")})} placeholder="shifts_50"/></Field>
        <Field label="\u0426\u0432\u0435\u0442"><input type="color" value={form.color} onChange={e=>sf({color:e.target.value})} style={{width:"100%",height:36,background:"#0f172a",border:"1px solid #334155",borderRadius:10}}/></Field>
        <Field label="\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"><Inp value={form.title} onChange={v=>sf({title:v})} placeholder="\u041f\u043e\u043b\u0442\u0438\u043d\u043d\u0438\u043a"/></Field>
        <Field label="\u0417\u043d\u0430\u043a"><Inp value={form.icon} onChange={v=>sf({icon:v.slice(0,16)})} placeholder="50"/></Field>
        <Field label="\u0423\u0441\u043b\u043e\u0432\u0438\u0435">
          <select value={form.ruleType} onChange={e=>sf({ruleType:e.target.value,stageId:""})} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"7px 10px",fontSize:13}}>
            {ACHIEVEMENT_RULES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label={`\u041f\u043e\u0440\u043e\u0433 (${rule.unit})`}><input type="number" min="1" max="10000" value={form.threshold} onChange={e=>sf({threshold:Math.max(1,Number(e.target.value)||1)})} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"7px 10px",fontSize:13}}/></Field>
        {(rule.needsStage||rule.needsGroup||rule.needsRole)&&<Field label={targetLabel}>
          <select value={form.stageId} onChange={e=>sf({stageId:e.target.value})} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"7px 10px",fontSize:13}}>
            <option value="">---</option>
            {targetOptions.map(st=><option key={st.id} value={st.id}>{st.label||st.id}</option>)}
          </select>
        </Field>}
        <Field label="\u041a\u0430\u0440\u0442\u0438\u043d\u043a\u0430">
          <input type="file" accept="image/*" onChange={chooseImage} style={{fontSize:12,color:"#94a3b8"}}/>
          {form.image&&<div style={{display:"flex",gap:8,alignItems:"center",marginTop:6}}><img src={form.image} alt="" style={{width:32,height:32,borderRadius:10,objectFit:"cover"}}/><Btn small variant="ghost" onClick={()=>sf({image:""})}>{"\u0423\u0431\u0440\u0430\u0442\u044c"}</Btn></div>}
        </Field>
        <Field label="\u0412\u043a\u043b\u044e\u0447\u0435\u043d\u0430">
          <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#94a3b8"}}><input type="checkbox" checked={form.enabled!==false} onChange={e=>sf({enabled:e.target.checked})}/> {"\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c \u0438 \u0441\u0447\u0438\u0442\u0430\u0442\u044c"}</label>
        </Field>
      </div>
      <Field label="\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435">
        <textarea value={form.description} onChange={e=>sf({description:e.target.value})} rows={3} style={{width:"100%",background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#e2e8f0",padding:"8px 10px",fontSize:13,resize:"vertical"}}/>
      </Field>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>{"\u041e\u0442\u043c\u0435\u043d\u0430"}</Btn>
        <Btn variant="primary" onClick={()=>onSave(form)}>{"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c"}</Btn>
      </div>
    </Modal>
  );
}

function SeriesTemplateModal({tmpl,onSave,onClose}){
  const [form,setForm]=useState({...tmpl});
  const f=form; const sf=v=>setForm(p=>({...p,...v}));
  const numFld=(label,key)=>(
    <Field label={label}>
      <input type="number" min={0} max={99} value={f[key]||0}
        onChange={e=>sf({[key]:Math.max(0,parseInt(e.target.value)||0)})}
        style={{background:"#0f172a",border:"1px solid #334155",borderRadius:10,
          color:"#e2e8f0",padding:"7px 10px",fontSize:13,width:"100%",boxSizing:"border-box"}}/>
    </Field>
  );
  const total=(f.editDays||0)+(f.csoundDays||0)+(f.corrDays||0)+(f.masterDays||0)+(f.otherDays||0);
  function handleSave(){
    if(!f.name?.trim()){alert("Введите название шаблона");return;}
    onSave(f);
  }
  return (
    <Modal title={f.id?"Редактировать шаблон":"Новый шаблон серии"} onClose={onClose} onSubmit={handleSave}>
      <Field label="Название шаблона">
        <Inp value={f.name||""} onChange={v=>sf({name:v})} placeholder="Документалка 52 мин"/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
        {numFld("Монтаж (дней)","editDays")}
        {numFld("Цвет / Звук (дней)","csoundDays")}
        {numFld("Правки (дней)","corrDays")}
        {numFld("Мастеринг (дней)","masterDays")}
        {numFld("Прочее (дней)","otherDays")}
        <div style={{display:"flex",alignItems:"flex-end",paddingBottom:4}}>
          <div style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)",
            borderRadius:10,padding:"7px 12px",fontSize:13,color:"#93c5fd",fontWeight:700}}>
            Итого: {total} дней
          </div>
        </div>
      </div>
      <div style={{fontSize:11,color:"#475569",marginTop:10}}>
        От даты старта монтажа система посчитает дату Пред-ОТК и ОТК автоматически.
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:20,
        borderTop:"1px solid #334155",paddingTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={handleSave}>Сохранить</Btn>
      </div>
    </Modal>
  );
}
function PersonModal({person,roles,canEditBirthday,onSave,onDelete,onClose}){
  const [form,setForm]=useState({name:person.name||"",roles:[...(person.roles||[])],active:person.active!==false,allowParallel:person.allowParallel===true,login:person.login||"",email:person.email||"",birthday:person.birthday||""});
  const [domainUsers,setDomainUsers]=useState([]);
  const [domainSearch,setDomainSearch]=useState("");
  const isNew=!person.id;
  React.useEffect(()=>{if(isNew){fetch("/api/users/domain",{credentials:"include"}).then(r=>r.ok&&r.json()).then(u=>setDomainUsers(u||[])).catch(()=>{});}},[isNew]);
  function toggleRole(id){setForm(f=>({...f,roles:f.roles.includes(id)?f.roles.filter(r=>r!==id):[...f.roles,id]}));}
  function handleSave(){
    const n=(form.name||"").trim();if(!n){alert("Введите имя");return;}
    const bd=normalizeBirthday(form.birthday);
    if(canEditBirthday&&bd===null){alert("День рождения укажите в формате ДД.ММ");return;}
    onSave({...person,...form,birthday:canEditBirthday?bd:(person.birthday||""),roles:(form.roles||[]).filter(r=>typeof r==="string"),name:n});
  }
  const domainFiltered=domainUsers.filter(u=>!domainSearch||(u.display_name||'').toLowerCase().includes(domainSearch.toLowerCase())||u.sam_name.toLowerCase().includes(domainSearch.toLowerCase()));
  return (
    <Modal title={isNew?"Новый сотрудник":"Редактировать сотрудника"} onClose={onClose} onSubmit={handleSave}>
      <Field label="Имя / Фамилия">
        <Inp value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Иванов"/>
      </Field>
      {isNew&&<>
        <Field label="Поиск в домене">
          <Inp value={domainSearch} onChange={setDomainSearch} placeholder="🔍 Введите имя или логин..."/>
        </Field>
        {domainSearch&&<div style={{maxHeight:280,overflowY:"auto",marginBottom:10,border:"1px solid #334155",borderRadius:10}}>
          {domainFiltered.length===0?<div style={{color:"#64748b",textAlign:"center",padding:12,fontSize:12}}>Ничего не найдено</div>:
            domainFiltered.map(u=>(
              <div key={u.sam_name} style={{padding:"7px 10px",cursor:"pointer",borderBottom:"1px solid #1e293b",
                display:"flex",alignItems:"center",gap:8,background:form.login===u.sam_name?"#1e3a5f":"transparent"}}
                onClick={()=>{setForm(f=>({...f,name:u.display_name,login:u.sam_name,email:u.email||""}));setDomainSearch("");}}
                onMouseEnter={e=>e.currentTarget.style.background="#1e3a5f"}
                onMouseLeave={e=>e.currentTarget.style.background=form.login===u.sam_name?"#1e3a5f":"transparent"}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#0f172a",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:10,fontWeight:700,color:"#64748b",flexShrink:0}}>{(u.display_name||"?")[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:500}}>{u.display_name}</div>
                  <div style={{fontSize:10,color:"#475569"}}>{u.sam_name}</div>
                </div>
              </div>
            ))}
        </div>}
        {form.login&&<div style={{fontSize:10,color:"#475569",marginBottom:8}}>🔗 Привязан к: {form.login}{form.email?" · "+form.email:""}</div>}
      </>}
      <Field label="День рождения">
        <Inp value={form.birthday||""} onChange={v=>canEditBirthday&&setForm(f=>({...f,birthday:v}))}
          placeholder="ДД.ММ" style={{maxWidth:120,opacity:canEditBirthday?1:0.7}}/>
        <div style={{fontSize:11,color:canEditBirthday?"#64748b":"#475569",marginTop:4}}>
          {canEditBirthday?"Без года. Например: 14.09":"Менять может только admin"}
        </div>
      </Field>      <Field label="Роли">
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {roles.map(r=>(
            <label key={r.id} style={{display:"flex",alignItems:"center",gap:6,
              background:form.roles.includes(r.id)?`${r.color}22`:"#0f172a",
              border:`1px solid ${form.roles.includes(r.id)?r.color:"#334155"}`,
              borderRadius:10,padding:"5px 10px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.roles.includes(r.id)} onChange={()=>toggleRole(r.id)} style={{accentColor:r.color}}/>
              <span style={{fontSize:12,color:form.roles.includes(r.id)?r.color:"#94a3b8"}}>{r.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Статус">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} style={{accentColor:"#22c55e"}}/>
          <span style={{fontSize:13}}>Активный сотрудник</span>
        </label>
      </Field>
      <Field label="Конфликты">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.allowParallel} onChange={e=>setForm(f=>({...f,allowParallel:e.target.checked}))} style={{accentColor:"#a855f7"}}/>
          <span style={{fontSize:13}}>Разрешить параллельные задачи</span>
        </label>
        {form.allowParallel&&<div style={{fontSize:11,color:"#a855f7",marginTop:4,opacity:0.8}}>Пересечения по времени не будут считаться конфликтами</div>}
      </Field>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <div>{!isNew&&<Btn variant="danger" onClick={()=>onDelete(person.id)}>Удалить</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          <Btn variant="primary" onClick={handleSave}>Сохранить</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── ПРОЕКТЫ ──────────────────────────────────────────────────────────
