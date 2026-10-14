function CommandPalette({data,onClose,onNavigate,onSetView,onSetGanttDay}){
  const [query,setQuery]=useState("");
  const [selIdx,setSelIdx]=useState(0);
  const inputRef=useRef(null);
  const listRef=useRef(null);

  useEffect(()=>{inputRef.current?.focus();},[]);
  useEffect(()=>{setSelIdx(0);},[query]);

  const NAV_CMDS=[
    {id:"today",    label:"Сегодня",   sub:"расписание на сегодня",   icon:"📅"},
    {id:"gantt",    label:"Гант",      sub:"диаграмма Ганта",         icon:"📊"},
    {id:"calendar", label:"Календарь", sub:"календарный вид",         icon:"🗓"},
    {id:"projects", label:"Проекты",   sub:"список проектов",         icon:"📁"},
    {id:"people",   label:"По людям",  sub:"нагрузка людей",          icon:"👥"},
    {id:"days",     label:"\u041d\u0415\u0414\u0415\u041b\u042f", sub:"\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0432\u0438\u0434", icon:""},
    {id:"analytics",label:"Аналитика", sub:"статистика и отчёты",     icon:"📈"},
    {id:"directory",label:"Настройки", sub:"этапы, роли, праздники",  icon:"⚙"},
  ];

  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return [];
    const words=q.split(/\s+/);
    const score=(text)=>{
      const t=(text||"").toLowerCase();
      if(!words.every(w=>t.includes(w))) return 0;
      if(t.startsWith(q)) return 3;
      if(t.includes(q)) return 2;
      return 1;
    };

    // Detect "create" intent
    const CREATE_TRIGGERS=["создать","создат","добавить","новый","новая","новое","новую"];
    const isCreate=words.some(w=>CREATE_TRIGGERS.some(ct=>ct.startsWith(w)||w===ct));

    const items=[];

    if(isCreate){
      // Parse target entity
      const isSmen=words.some(w=>["смену","смены","смен","задачу","задач","задачи","шифт"].includes(w));
      const isProj=words.some(w=>["проект","проекта","проекты"].includes(w));
      const isSer=words.some(w=>["серию","серии","серий","серия"].includes(w));

      // Parse task prefill: stage, project, date
      const parsePrefill=()=>{
        const today=new Date();
        const dateMap={"сегодня":0,"завтра":1,"послезавтра":2};
        let day=null,stageId=null,projectId=null;
        const STAGES=data.stages||DEFAULT_STAGES;
        words.forEach(w=>{
          if(dateMap[w]!==undefined){
            const d=new Date(today);d.setDate(d.getDate()+dateMap[w]);
            day=`${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
          }
          const dm=w.match(/^(\d{1,2})\.(\d{2})$/);
          if(dm) day=`${dm[1].padStart(2,"0")}.${dm[2]}.${today.getFullYear()}`;
          STAGES.forEach(s=>{
            const sl=s.label.toLowerCase();
            if(sl.includes(w)||w.includes(sl.slice(0,4))||s.id.includes(w)) stageId=s.id;
          });
          (data.projects||[]).forEach(p=>{
            const pl=(p.name||'').toLowerCase(),al=(p.abbr||"").toLowerCase();
            if(pl.includes(w)||al===w||w.includes(al)) projectId=p.id;
          });
        });
        return {day,stageId,projectId};
      };

      if(isSmen||(!isProj&&!isSer&&words.length>1)){
        const pf=parsePrefill();
        const proj=pf.projectId?(data.projects||[]).find(p=>p.id===pf.projectId):null;
        const stg=(data.stages||DEFAULT_STAGES).find(s=>s.id===pf.stageId);
        const hints=[stg?.label,proj?.name,pf.day].filter(Boolean);
        items.push({type:"create",createType:"task",score:20,icon:"",
          label:"Создать смену"+(hints.length?` — ${hints.join(", ")}`:""),
          sub:"Открыть Гант с заполненной формой",
          prefill:{status:pf.stageId||"",project:pf.projectId||"",day:pf.day||""},
        });
      }
      if(isProj||!isSmen){
        items.push({type:"create",createType:"project",score:18,icon:"📁",
          label:"Создать проект",sub:"Перейти в раздел Проекты → +",
        });
      }
      if(isSer||!isSmen){
        items.push({type:"create",createType:"series",score:17,icon:"🎬",
          label:"Создать серию",sub:"Перейти в Проекты и добавить серию",
        });
      }
    }

    NAV_CMDS.forEach(cmd=>{
      const s=score(`${cmd.label} ${cmd.sub} ${cmd.id}`);
      if(s>0) items.push({type:"nav",id:cmd.id,label:cmd.label,sub:cmd.sub,icon:cmd.icon,score:s+10});
    });
    (data.projects||[]).forEach(p=>{
      const s=score(`${p.name} ${p.abbr||""} ${p.description||""}`);
      if(s>0) items.push({type:"project",id:p.id,label:p.name,
        sub:[p.abbr,p.description].filter(Boolean).join(" · "),color:p.color,score:s});
    });
    (data.series||[]).forEach(ser=>{
      const proj=(data.projects||[]).find(p=>p.id===ser.projectId);
      const s=score(`${ser.name} ${proj?.name||""} ${proj?.abbr||""}`);
      if(s>0) items.push({type:"series",id:ser.id,
        label:`${proj?.abbr||proj?.name||""} · ${ser.name}`,
        sub:proj?.name||"",color:proj?.color,score:s});
    });
    (data.people||[]).filter(p=>p.active!==false).forEach(p=>{
      const s=score(p.name);
      if(s>0) items.push({type:"person",id:p.id,label:p.name,
        sub:(p.roles||[]).join(", "),score:s});
    });
    // Tasks + notes search
    const STAGES=data.stages||DEFAULT_STAGES;
    (data.tasks||[]).filter(t=>!t.cancelled).forEach(t=>{
      const proj=(data.projects||[]).find(p=>p.id===t.project);
      const stg=STAGES.find(s=>s.id===t.status);
      const searchText=[t.series,t.person,proj?.name,proj?.abbr,stg?.label,canSeeTaskNotes()?t.note:"",t.day].filter(Boolean).join(" ");
      const s=score(searchText);
      if(s>0) items.push({type:"task",id:t.id,task:t,
        label:`${t.series}${t.person?" · "+t.person:""}`,
        sub:[t.day,stg?.label,canSeeTaskNotes()?t.note:""].filter(Boolean).join(" · "),
        color:proj?.color,score:s});
    });
    const ORDER={create:-1,nav:0,project:1,series:2,person:3,task:4};
    return items.sort((a,b)=>b.score-a.score||(ORDER[a.type]||9)-(ORDER[b.type]||9)).slice(0,30);
  },[query,data]);

  useEffect(()=>{
    if(!listRef.current) return;
    const el=listRef.current.querySelector("[data-sel=true]");
    el?.scrollIntoView({block:"nearest"});
  },[selIdx]);

  function handleKey(e){
    if(e.key==="Escape"){e.stopPropagation();onClose();return;}
    if(e.key==="ArrowDown"){e.preventDefault();setSelIdx(i=>Math.min(i+1,results.length-1));}
    if(e.key==="ArrowUp"){e.preventDefault();setSelIdx(i=>Math.max(i-1,0));}
    if(e.key==="Enter"){e.preventDefault();if(results[selIdx]) pick(results[selIdx]);}
  }
  function pick(item){
    if(item.type==="nav"){onSetView(item.id);onNavigate(null);}
    else if(item.type==="project") onNavigate({type:"project",id:item.id});
    else if(item.type==="series")  onNavigate({type:"series", id:item.id});
    else if(item.type==="person")  onNavigate({type:"person", id:item.id});
    else if(item.type==="task"){
      onSetGanttDay?.(item.task.day);
      onSetView("gantt");onNavigate(null);
      setTimeout(()=>window.dispatchEvent(new CustomEvent("gantt-new-task",{detail:item.task})),80);
    }
    else if(item.type==="create"){
      if(item.createType==="task"){
        onSetView("gantt");onNavigate(null);
        setTimeout(()=>window.dispatchEvent(new CustomEvent("gantt-new-task",{detail:item.prefill||{}})),80);
      } else if(item.createType==="project"||item.createType==="series"){
        onSetView("projects");onNavigate(null);
      }
    }
    onClose();
  }

  const TYPE_LABELS={create:"СОЗДАТЬ",nav:"НАВИГАЦИЯ",project:"ПРОЕКТЫ",series:"СЕРИИ",person:"ЛЮДИ",task:"ЗАДАЧИ"};
  const displayList=useMemo(()=>{
    const out=[];let lastType=null;
    results.forEach((r,idx)=>{
      if(r.type!==lastType){out.push({isHeader:true,label:TYPE_LABELS[r.type]||r.type,key:"h-"+r.type});lastType=r.type;}
      out.push({...r,flatIdx:idx});
    });
    return out;
  },[results]);

  const kbd={fontSize:10,color:"#475569",background:"#0f172a",border:"1px solid #334155",
    borderRadius:4,padding:"1px 5px",fontFamily:"inherit",display:"inline-block"};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:9999,
      display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"8vh"}}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,
        width:"min(640px,92vw)",maxHeight:"70vh",display:"flex",flexDirection:"column",
        boxShadow:"0 25px 60px rgba(0,0,0,0.65)",overflow:"hidden"}}>

        <div style={{display:"flex",alignItems:"center",padding:"12px 16px",
          borderBottom:"1px solid #334155",gap:10}}>
          <span style={{fontSize:14,color:"#475569",flexShrink:0}}>🔍</span>
          <input ref={inputRef} value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Поиск или «создать смену монтажа СВ завтра»..."
            style={{flex:1,background:"none",border:"none",outline:"none",
              fontSize:15,color:"#e2e8f0",fontFamily:"inherit"}}/>
          {query&&<button onClick={()=>setQuery("")}
            style={{background:"none",border:"none",color:"#475569",cursor:"pointer",
              fontSize:13,padding:"2px 4px",lineHeight:1}}>✕</button>}
          <span style={kbd}>ESC</span>
        </div>

        <div ref={listRef} style={{overflowY:"auto",flex:1}}>
          {!query.trim()&&(
            <div style={{padding:"18px 16px"}}>
              <div style={{fontSize:12,color:"#475569",marginBottom:10}}>
                Поиск по проектам, сериям и людям. Или напишите «создать смену монтажа СВ завтра»
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap",fontSize:11,color:"#475569"}}>
                <span><span style={kbd}>↑</span> <span style={kbd}>↓</span> навигация</span>
                <span><span style={kbd}>Enter</span> открыть</span>
                <span><span style={kbd}>Esc</span> закрыть</span>
                <span><span style={kbd}>Ctrl+K</span> открыть</span>
              </div>
            </div>
          )}
          {query.trim()&&results.length===0&&(
            <div style={{padding:"28px 16px",textAlign:"center",color:"#475569",fontSize:13}}>
              Ничего не найдено по запросу «{query}»
            </div>
          )}
          {displayList.map((item,i)=>{
            if(item.isHeader) return (
              <div key={item.key} style={{padding:"8px 16px 3px",fontSize:10,
                color:"#334155",letterSpacing:2,fontWeight:700}}>{item.label}</div>
            );
            const sel=item.flatIdx===selIdx;
            return (
              <div key={item.type+(item.id||item.createType||i)} data-sel={sel}
                onMouseEnter={()=>setSelIdx(item.flatIdx)}
                onClick={()=>pick(item)}
                style={{padding:"7px 16px",cursor:"pointer",display:"flex",
                  alignItems:"center",gap:10,background:sel?"#334155":"transparent"}}>
                {item.icon?(
                  <span style={{fontSize:13,width:18,textAlign:"center",flexShrink:0}}>{item.icon}</span>
                ):item.color?(
                  <span style={{width:8,height:8,borderRadius:"50%",background:item.color,
                    flexShrink:0,display:"inline-block"}}/>
                ):(
                  <span style={{width:18,fontSize:11,color:"#475569",flexShrink:0,textAlign:"center"}}>·</span>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</div>
                  {item.sub&&<div style={{fontSize:11,color:"#64748b",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.sub}</div>}
                </div>
                {sel&&<span style={{fontSize:11,color:"#475569",flexShrink:0}}>↵</span>}
              </div>
            );
          })}
        </div>

        {results.length>0&&(
          <div style={{padding:"5px 16px",borderTop:"1px solid #1e293b",
            fontSize:10,color:"#334155"}}>
            Найдено: {results.length}
          </div>
        )}
      </div>
    </div>
  );
}

// Массивы сущностей, у которых возможен soft-delete
