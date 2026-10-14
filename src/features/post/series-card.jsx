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
