const AUDIT_ACTION_LABELS={create:"Создано",update:"Изменено",assign:"Изменён исполнитель",reschedule:"Перенесено",complete:"Выполнено",cancel:"Отменено",restore:"Восстановлено",delete:"Удалено",save:"Сохранено"};
const AUDIT_ENTITY_LABELS={project:"Проект",series:"Серия",task:"Смена",productionBlock:"Блок продюсерской",productionGroup:"Группа задач",productionTask:"Задача продюсерской",person:"Сотрудник",role:"Роль",stage:"Этап",stageGroup:"Группа этапов",holiday:"Выходной",achievement:"Достижение",absence:"Отсутствие",settings:"Настройка",user:"Пользователь",userProject:"Доступ к проекту",bulk:"Массовое изменение"};
const AUDIT_FIELD_LABELS={name:"Название",label:"Название",title:"Название",person:"Исполнитель",assignee_name:"Исполнитель",responsible_name:"Ответственный",owner_name:"Владелец блока",deadline:"Срок",completed_at:"Выполнено в",status:"Этап",day:"Дата",from:"Начало",to:"Окончание",project_id:"Проект",series_id:"Серия",cancelled:"Отмена",deleted:"Удаление",role:"Роль",can_view:"Просмотр",can_edit:"Редактирование",date:"Дата",edit_start:"Начало монтажа",pre_otk_date:"ПредОТК",otk_date:"ОТК",send_date:"Отправка",air_date:"Эфир",manual_status:"Статус серии",managers:"Ответственные",note:"Заметка",notes:"Заметки"};

function auditValue(value){
  if(value===null||value===undefined||value==="")return "—";
  if(value===true)return "да";
  if(value===false)return "нет";
  if(Array.isArray(value))return value.length?value.map(v=>typeof v==="object"?(v.name||v.label||v.uid||JSON.stringify(v)):String(v)).join(", "):"—";
  if(typeof value==="object"){
    const text=JSON.stringify(value);
    return text.length>140?text.slice(0,140)+"…":text;
  }
  return String(value);
}

function auditTime(value){
  const date=new Date(value);
  return Number.isNaN(date.getTime())?String(value||""):date.toLocaleString("ru-RU",{dateStyle:"short",timeStyle:"medium"});
}

function HistoryView({data}){
  const [filters,setFilters]=useState({projectId:"",actorUserId:"",action:"",from:"",to:""});
  const [page,setPage]=useState(1);
  const [result,setResult]=useState({events:[],actors:[],page:1,total:0,totalPages:1});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [refreshKey,setRefreshKey]=useState(0);

  useEffect(()=>{
    let active=true;
    const query=new URLSearchParams({page:String(page),pageSize:"50"});
    Object.entries(filters).forEach(([key,value])=>{if(value)query.set(key,value);});
    setLoading(true);setError("");
    fetch("/api/audit/events?"+query.toString(),{credentials:"include",cache:"no-store"})
      .then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||"Не удалось загрузить историю");return body;})
      .then(body=>{if(active)setResult(body);})
      .catch(err=>{if(active)setError(err.message);})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[page,filters.projectId,filters.actorUserId,filters.action,filters.from,filters.to,refreshKey]);

  function change(key,value){setFilters(current=>({...current,[key]:value}));setPage(1);}
  const selectStyle={background:"rgba(8,13,26,.74)",border:"1px solid rgba(148,163,184,.24)",color:"#eef4ff",borderRadius:11,padding:"8px 10px",fontSize:12,minWidth:150};
  const dateStyle={...selectStyle,minWidth:138,colorScheme:"dark"};
  return <div style={{maxWidth:1240,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,marginBottom:16,flexWrap:"wrap"}}>
      <div><h2 style={{margin:"0 0 5px",fontSize:24}}>История</h2><div style={{fontSize:12,color:"#8ea2bb"}}>Подтверждённые изменения, сохранённые сервером · всего {result.total}</div></div>
      <Btn variant="ghost" small onClick={()=>setRefreshKey(value=>value+1)}>↻ Обновить</Btn>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:12,marginBottom:14,background:"rgba(15,23,42,.58)",border:"1px solid rgba(148,163,184,.18)",borderRadius:16}}>
      <select aria-label="Проект" value={filters.projectId} onChange={e=>change("projectId",e.target.value)} style={selectStyle}><option value="">Все проекты</option>{(data.projects||[]).map(project=><option key={project.id} value={project.id}>{project.name}</option>)}</select>
      <select aria-label="Сотрудник" value={filters.actorUserId} onChange={e=>change("actorUserId",e.target.value)} style={selectStyle}><option value="">Все авторы</option>{(result.actors||[]).map(actor=><option key={String(actor.id)+actor.name} value={actor.id}>{actor.name}</option>)}</select>
      <select aria-label="Действие" value={filters.action} onChange={e=>change("action",e.target.value)} style={selectStyle}><option value="">Все действия</option>{Object.entries(AUDIT_ACTION_LABELS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
      <input aria-label="Период с" title="Период с" type="date" value={filters.from} onChange={e=>change("from",e.target.value)} style={dateStyle}/>
      <input aria-label="Период по" title="Период по" type="date" value={filters.to} onChange={e=>change("to",e.target.value)} style={dateStyle}/>
      {Object.values(filters).some(Boolean)&&<Btn variant="ghost" small onClick={()=>{setFilters({projectId:"",actorUserId:"",action:"",from:"",to:""});setPage(1);}}>Сбросить</Btn>}
    </div>
    {error&&<div role="alert" style={{padding:14,border:"1px solid #b45309",borderRadius:12,color:"#fde68a",background:"#422006"}}>{error}</div>}
    {loading?<div style={{padding:30,textAlign:"center",color:"#8ea2bb"}}>Загружаю историю…</div>:!result.events.length?<div style={{padding:36,textAlign:"center",color:"#64748b",border:"1px dashed #334155",borderRadius:14}}>По выбранным фильтрам записей нет</div>:
      <div style={{display:"grid",gap:5}}>{result.events.map(event=><details key={event.id} style={{background:"rgba(15,23,42,.58)",border:"1px solid rgba(148,163,184,.16)",borderRadius:11,overflow:"hidden"}}>
        <summary style={{display:"grid",gridTemplateColumns:"130px minmax(130px,180px) minmax(260px,1fr) auto",gap:10,alignItems:"center",padding:"8px 12px",cursor:"pointer",listStyle:"none"}}>
          <span style={{fontSize:10,color:"#8ea2bb",whiteSpace:"nowrap"}}>{auditTime(event.occurredAt)}</span>
          <span style={{fontSize:11,fontWeight:700,color:"#dbeafe",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{event.userName||"Система"}</span>
          <span style={{minWidth:0}}><span style={{fontSize:11,fontWeight:800,color:event.action==="delete"?"#fca5a5":event.action==="create"?"#86efac":"#93c5fd"}}>{AUDIT_ACTION_LABELS[event.action]||event.action}</span><span style={{fontSize:11,color:"#cbd5e1",marginLeft:7}}>{AUDIT_ENTITY_LABELS[event.entity]||event.entity}{event.details?.label?": "+event.details.label:""}</span>{(event.projectName||event.seriesName)&&<span style={{fontSize:10,color:"#64748b",marginLeft:7}}>{[event.projectName,event.seriesName].filter(Boolean).join(" · ")}</span>}</span>
          <span style={{fontSize:10,color:"#7dd3fc",whiteSpace:"nowrap"}}>Подробнее · {(event.changes||[]).length} ▾</span>
        </summary>
        <div style={{display:"grid",gridTemplateColumns:"minmax(260px,1fr) minmax(160px,280px)",gap:16,padding:"9px 12px 11px",borderTop:"1px solid rgba(148,163,184,.12)",fontSize:11,lineHeight:1.55,color:"#94a3b8"}}>
          <div>{(event.changes||[]).map((change,index)=><div key={change.field+index} style={{marginBottom:2}}><span style={{color:"#cbd5e1",fontWeight:700}}>{AUDIT_FIELD_LABELS[change.field]||change.field}: </span><span>{auditValue(change.before)}</span><span style={{color:"#60a5fa",padding:"0 5px"}}>→</span><span style={{color:"#e2e8f0"}}>{auditValue(change.after)}</span></div>)}{!(event.changes||[]).length&&<span>Дополнительных значений нет</span>}{event.reason&&<div style={{marginTop:5,color:"#fcd34d"}}>Причина: {event.reason}</div>}</div>
          <div style={{color:"#64748b"}}>Источник: {event.source==="user"?"пользователь":event.source}<br/>Объект: {event.entityId||"—"}</div>
        </div>
      </details>)}</div>}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14}}><Btn variant="ghost" small disabled={page<=1||loading} onClick={()=>setPage(value=>Math.max(1,value-1))}>← Новее</Btn><span style={{fontSize:11,color:"#64748b"}}>Страница {result.page||page} из {result.totalPages||1}</span><Btn variant="ghost" small disabled={page>=(result.totalPages||1)||loading} onClick={()=>setPage(value=>value+1)}>Старее →</Btn></div>
  </div>;
}
