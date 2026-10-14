function Modal({title,onClose,wide,onSubmit,children,freeOverflow}){
  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="Escape"){e.preventDefault();e.stopPropagation();onClose();}
      if(e.altKey&&(e.key==="Enter"||e.code==="Enter")) {e.preventDefault();onSubmit&&onSubmit();}
    };
    document.addEventListener("keydown",h,true);
    return ()=>document.removeEventListener("keydown",h,true);
  },[onClose,onSubmit]);
  const modal=(
    <div className="ppt-modal-backdrop" onClick={e=>{/* backdrop locked */}}
      style={{position:"fixed",inset:0,background:"rgba(3,7,18,0.72)",
        display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:2147483000,padding:"18px 16px",overflowY:"auto",overscrollBehavior:"contain",isolation:"isolate"}}>
      <div className="ppt-modal-panel" style={{background:"linear-gradient(180deg,rgba(30,41,59,.92),rgba(15,23,42,.94))",border:"1px solid rgba(148,163,184,.24)",borderRadius:20,
        position:"relative",zIndex:2147483001,width:wide?720:480,maxWidth:"100%",maxHeight:"calc(100dvh - 36px)",display:"flex",flexDirection:"column",overflow:freeOverflow?"visible":"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(148,163,184,.18)",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"rgba(255,255,255,.025)"}}>
          <span style={{fontWeight:800,fontSize:16,color:"#f8fafc",letterSpacing:.1}}>{title}</span>
          <button className="ppt-btn" onClick={onClose} style={{background:"rgba(15,23,42,.72)",border:"1px solid rgba(148,163,184,.22)",color:"#9aa9bd",
            fontSize:22,cursor:"pointer",lineHeight:1,padding:"3px 8px",borderRadius:12}}>x</button>
        </div>
        <div style={{padding:"18px 20px",overflowY:freeOverflow?"visible":"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
  if(typeof document!=="undefined"&&document.body&&ReactDOM?.createPortal){
    return ReactDOM.createPortal(modal,document.body);
  }
  return modal;
}

function Btn({onClick,variant="default",children,small,style,disabled,type}){
  const s={
    default:{background:"linear-gradient(180deg,rgba(30,58,95,.78),rgba(15,23,42,.7))",border:"1px solid rgba(96,165,250,.32)",color:"#93c5fd"},
    primary:{background:"linear-gradient(135deg,#2563eb,#3b82f6 54%,#22d3ee)",border:"1px solid rgba(147,197,253,.55)",color:"#fff",boxShadow:"0 10px 28px rgba(37,99,235,.22)"},
    danger: {background:"linear-gradient(180deg,rgba(239,68,68,.20),rgba(127,29,29,.12))",border:"1px solid rgba(248,113,113,.42)",color:"#fca5a5"},
    ghost:  {background:"rgba(15,23,42,.38)",border:"1px solid rgba(148,163,184,.22)",color:"#a9b8cc"},
    success:{background:"linear-gradient(180deg,rgba(34,197,94,.18),rgba(20,83,45,.12))",border:"1px solid rgba(74,222,128,.42)",color:"#86efac"},
    warn:   {background:"linear-gradient(180deg,rgba(249,115,22,.18),rgba(124,45,18,.12))",border:"1px solid rgba(251,146,60,.42)",color:"#fdba74"},
  }[variant]||{};
  return (
    <button className={`ppt-btn ppt-btn-${variant}`} type={type||"button"} onClick={onClick} disabled={disabled}
      style={{...s,padding:small?"4px 11px":"7px 15px",borderRadius:small?10:12,
        cursor:disabled?"not-allowed":"pointer",fontSize:small?11:13,
        fontWeight:700,opacity:disabled?0.5:1,letterSpacing:.05,...style}}>
      {children}
    </button>
  );
}

function Field({label,children,hint,row}){
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:11,color:"#8ea2bb",letterSpacing:1,
        textTransform:"uppercase",marginBottom:6,fontWeight:800}}>{label}</div>}
      {row?<div style={{display:"flex",gap:8,alignItems:"center"}}>{children}</div>:children}
      {hint&&<div style={{fontSize:11,color:"#475569",marginTop:4}}>{hint}</div>}
    </div>
  );
}

function Inp({value,onChange,placeholder,style,type,min,max}){
  return (
    <input className="ppt-input" type={type||"text"} value={value||""} min={min} max={max}
      onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:"rgba(8,13,26,.74)",border:"1px solid rgba(148,163,184,.24)",color:"#eef4ff",
        borderRadius:11,padding:"8px 11px",fontSize:14,width:"100%",...style}}/>
  );
}

function InpDate({value,onChange,warn}){
  return (
    <div>
      <input className="ppt-input" type="date" value={toInput(value)} onChange={e=>onChange(fromInput(e.target.value))}
        style={{background:"rgba(8,13,26,.74)",border:`1px solid ${warn?"#fb923c":"rgba(148,163,184,.24)"}`,color:"#eef4ff",
          borderRadius:11,padding:"8px 11px",fontSize:14,width:"100%"}}/>
      {warn&&<div style={{fontSize:11,color:"#fb923c",marginTop:3}}>! Выходной или праздник</div>}
    </div>
  );
}

function Sel({value,onChange,options,placeholder,style}){
  return (
    <select className="ppt-input" value={value||""} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(8,13,26,.74)",border:"1px solid rgba(148,163,184,.24)",
        color:value?"#eef4ff":"#6f8096",borderRadius:11,padding:"8px 11px",
        fontSize:14,width:"100%",...style}}>
      {placeholder&&<option value="">{placeholder}</option>}
      {options.map(o=>typeof o==="string"
        ?<option key={o} value={o}>{o}</option>
        :<option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SelSearch({value,onChange,options,placeholder,style,allowCustom,autoFocus}){
  const [query,setQuery]=useState("");
  const [open,setOpen]=useState(false);
  const [hiIdx,setHiIdx]=useState(-1);
  const ref=useRef(null);
  const inputRef=useRef(null);
  const listRef=useRef(null);
  useEffect(()=>{if(autoFocus&&inputRef.current)inputRef.current.focus();},[]);
  const normalized=useMemo(()=>options.map(o=>typeof o==="string"?{value:o,label:o}:o),[options]);
  const selected=normalized.find(o=>o.value===value);
  const filtered=query
    ?normalized.filter(o=>o.label.toLowerCase().includes(query.toLowerCase()))
    :normalized;

  useEffect(()=>{setHiIdx(-1);},[filtered.length,query]);

  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setQuery("");}}
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  function pick(opt){onChange(opt.value);setQuery("");setOpen(false);setHiIdx(-1);}

  function handleFocus(){setOpen(true);setQuery("");}
  function handleChange(e){
    setQuery(e.target.value);
    setOpen(true);
    if(!e.target.value){onChange("");}
  }
  function handleBlur(){
    if(allowCustom&&query&&!normalized.find(o=>o.value===query||o.label===query)){
      onChange(query);
    }
  }
  function handleKeyDown(e){
    if(e.key==="Escape"){setOpen(false);setQuery("");return;}
    if(e.key==="ArrowDown"){
      e.preventDefault();
      setOpen(true);
      setHiIdx(i=>{const n=Math.min(i+1,filtered.length-1);
        setTimeout(()=>{if(listRef.current){const el=listRef.current.children[n];if(el)el.scrollIntoView({block:"nearest"});}},0);
        return n;
      });
      return;
    }
    if(e.key==="ArrowUp"){
      e.preventDefault();
      setHiIdx(i=>{const n=Math.max(i-1,0);
        setTimeout(()=>{if(listRef.current){const el=listRef.current.children[n];if(el)el.scrollIntoView({block:"nearest"});}},0);
        return n;
      });
      return;
    }
    if(e.key==="Enter"){
      e.preventDefault();
      if(hiIdx>=0&&filtered[hiIdx]) pick(filtered[hiIdx]);
      else if(filtered.length>0) pick(filtered[0]);
    }
  }

  const displayVal=open?(query):(selected?selected.label:"");

  return (
    <div ref={ref} style={{position:"relative",...style}}>
      <input ref={inputRef} value={displayVal}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={selected?"":placeholder||"Выбрать..."}
        style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
          borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%"}}/>
      {open&&filtered.length>0&&(
        <div ref={listRef} style={{position:"absolute",top:"100%",left:0,right:0,marginTop:2,
          background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
          zIndex:400,maxHeight:200,overflowY:"auto",boxShadow:"0 4px 20px rgba(0,0,0,0.6)"}}>
          {filtered.map((opt,i)=>(
            <div key={opt.value}
              onMouseDown={()=>pick(opt)}
              onMouseEnter={()=>setHiIdx(i)}
              style={{padding:"6px 10px",cursor:"pointer",fontSize:13,
                background:i===hiIdx?"rgba(59,130,246,0.35)":opt.value===value?"rgba(59,130,246,0.15)":"transparent",
                color:i===hiIdx||opt.value===value?"#93c5fd":"#e2e8f0"}}>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StatusBadge({s,small}){
  const {stageMap}=useContext(StagesCtx);
  const st=stageMap[s];
  if(!st) return <span style={{fontSize:10,color:"#475569"}}>{s||"—"}</span>;
  return (
    <span style={{display:"inline-block",background:stageBg(st.color),color:st.color,
      border:`1px solid ${stageBorder(st.color)}`,borderRadius:4,
      padding:small?"1px 6px":"2px 8px",fontSize:small?10:11,fontWeight:600,whiteSpace:"nowrap"}}
      title={st.abbr?st.label:undefined}>
      {small&&st.abbr?st.abbr:st.label}
    </span>
  );
}

function TaskCard({task,projects,isConflict,onClick,onHover,large}){
  const color=projColor(projects,task.project);
  const pname=large?projAbbr(projects,task.project):projName(projects,task.project);
  return (
    <div onClick={onClick}
      onMouseEnter={onHover?e=>onHover(task,e.currentTarget.getBoundingClientRect()):undefined}
      onMouseLeave={onHover?()=>onHover(null):undefined}
      style={{position:"relative",borderLeft:`3px solid ${task.cancelled?"#334155":isConflict?"#ef4444":color}`,
        background:task.cancelled?"rgba(15,23,42,0.4)":isConflict?"rgba(239,68,68,0.07)":"rgba(255,255,255,0.03)",
        borderRadius:"0 6px 6px 0",padding:"5px 8px",marginBottom:4,
        cursor:onClick?"pointer":"default",opacity:task.cancelled?0.4:1}}>
      {task.cancelled&&<span style={{position:"absolute",top:3,right:5,fontSize:10,opacity:0.7}}>🚫</span>}
      <div style={{fontWeight:700,color:task.cancelled?"#334155":isConflict?"#f87171":color,fontSize:11,marginBottom:2,
        textDecoration:task.cancelled?"line-through":"none"}}>
        {isConflict&&"⚡ "}{task.series}
        {task.unplanned&&!task.cancelled&&<span style={{color:"#f97316",marginLeft:4,fontSize:9}}>!внеплан</span>}
        <span style={{fontWeight:400,color:"#475569",marginLeft:5,fontSize:large?12:10}}>{pname}</span>
      </div>
      {canSeeTaskNotes()&&task.note&&<div style={{color:"#94a3b8",fontSize:10,lineHeight:1.3,marginBottom:3}}>{task.note}</div>}
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        <StatusBadge s={task.status} small/>
        <span style={{color:large?"#94a3b8":"#475569",fontSize:large?13:10,fontWeight:large?600:400}}>{fmtHour(task.from)}–{fmtHour(task.to)}</span>
      </div>
    </div>
  );
}
function TaskTooltip({task,rect,projects}){
  const {stageMap}=useContext(StagesCtx);
  if(!task||!rect) return null;
  const st=stageMap[task.status];
  const color=projColor(projects,task.project);
  const pname=projName(projects,task.project);
  const W=240; const vw=window.innerWidth; const vh=window.innerHeight;
  let left=rect.right+10; if(left+W>vw-16) left=rect.left-W-10;
  let top=rect.top; if(top+180>vh-16) top=Math.max(8,vh-196);
  return (
    <div style={{position:"fixed",left,top,zIndex:9999,width:W,
      background:"#1e293b",border:"1px solid #475569",borderRadius:12,
      padding:"10px 14px",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.65)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
        <span style={{fontSize:11,color:"#94a3b8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pname}</span>
      </div>
      {task.series&&<div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{task.series}</div>}
      {st&&<div style={{marginBottom:6}}>
        <span style={{background:colorToBg(st.color),border:`1px solid ${st.color}55`,
          borderRadius:4,padding:"2px 8px",fontSize:11,color:st.color,fontWeight:600}}>
          {st.label}
        </span>
      </div>}
      {task.person&&<div style={{fontSize:12,color:"#cbd5e1",marginBottom:3}}>{task.person}</div>}
      <div style={{fontSize:11,color:"#64748b",marginBottom:canSeeTaskNotes()&&task.note?4:0}}>
        {fmtHour(task.from)} – {fmtHour(task.to)} · {fmtDur(task.from,task.to)}
        {task.unplanned&&<span style={{color:"#f97316",marginLeft:6}}>! внеплан</span>}
      </div>
      {canSeeTaskNotes()&&task.note&&<div style={{fontSize:11,color:"#94a3b8",lineHeight:1.4,marginTop:4,borderTop:"1px solid #334155",paddingTop:4}}>{task.note}</div>}
    </div>
  );
}

// ── СПРАВОЧНИК ───────────────────────────────────────────────────────
function StageEditModal({stage,roles,stageGroups,onSave,onClose}){
  const [form,setForm]=useState({...stage});
  function toggleRole(rid){
    setForm(f=>({...f,
      rolesRequired:f.rolesRequired.includes(rid)
        ?f.rolesRequired.filter(r=>r!==rid)
        :[...f.rolesRequired,rid]
    }));
  }
  function handleSave(){if(!form.label.trim()){alert("Введите название");return;}onSave(form);}
  return (
    <Modal title={`Этап: ${stage.label}`} onClose={onClose} onSubmit={handleSave}>
      <Field label="Название">
        <Inp value={form.label} onChange={v=>setForm(f=>({...f,label:v}))} placeholder="Монтаж"/>
      </Field>
      <Field label="Аббревиатура (для плашек)">
        <Inp value={form.abbr||""} onChange={v=>setForm(f=>({...f,abbr:v}))} placeholder="Монт"/>
      </Field>
      <Field label="Группа">
        <select value={form.groupId||""} onChange={e=>setForm(f=>({...f,groupId:e.target.value}))}
          style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
            borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%"}}>
          <option value="">— не задана —</option>
          {stageGroups.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
      </Field>
      <Field label="Цвет">
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="color" value={form.color}
            onChange={e=>setForm(f=>({...f,color:e.target.value}))}
            style={{width:48,height:36,border:"1px solid #334155",borderRadius:10,
              background:"#0f172a",cursor:"pointer"}}/>
          <div style={{width:80,height:28,borderRadius:4,background:colorToBg(form.color),
            border:`1px solid ${form.color}44`,display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:11,color:form.color,fontWeight:600}}>
            {form.label||"—"}
          </div>
        </div>
      </Field>
      <Field label="Роли (фильтр исполнителей)">
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {roles.map(r=>(
            <label key={r.id} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",
              background:form.rolesRequired.includes(r.id)?`${r.color}22`:"#0f172a",
              border:`1px solid ${form.rolesRequired.includes(r.id)?r.color:"#334155"}`,
              borderRadius:10,padding:"4px 10px"}}>
              <input type="checkbox" checked={form.rolesRequired.includes(r.id)}
                onChange={()=>toggleRole(r.id)} style={{accentColor:r.color}}/>
              <span style={{fontSize:12,color:form.rolesRequired.includes(r.id)?r.color:"#94a3b8"}}>{r.label}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Исполнитель">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.needsExecutor!==false}
            onChange={e=>setForm(f=>({...f,needsExecutor:e.target.checked}))}
            style={{accentColor:"#22c55e"}}/>
          <span style={{fontSize:13}}>Исполнитель обязателен</span>
        </label>
      </Field>
      <Field label="Влияние на нагрузку">
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input type="checkbox" checked={form.noImpact===true}
            onChange={e=>setForm(f=>({...f,noImpact:e.target.checked}))}
            style={{accentColor:"#f97316"}}/>
          <span style={{fontSize:13}}>Без влияния — не считать в сменах и конфликтах</span>
        </label>
        {form.noImpact&&<div style={{fontSize:11,color:"#f97316",marginTop:4,opacity:0.8}}>
          Этап нужен для планирования, но не учитывается в аналитике и не создаёт конфликтов
        </div>}
      </Field>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={handleSave}>Сохранить</Btn>
      </div>
    </Modal>
  );
}

