async function producerRequest(path, options){
  const response=await csrfFetch(SERVER_URL+path,{credentials:"include",...(options||{}),headers:{"Content-Type":"application/json",...((options&&options.headers)||{})}});
  let body={};
  try{body=await response.json();}catch(error){}
  if(!response.ok)throw new Error(body.error||("Ошибка сервера: "+response.status));
  return body;
}

function producerDate(value){
  if(!value)return "Без срока";
  const parts=String(value).slice(0,10).split("-");
  return parts.length===3?`${parts[2]}.${parts[1]}.${parts[0]}`:String(value);
}

function producerDateInput(value){return value?producerDate(value):"";}
function producerIsoFromInput(value){
  const text=String(value||"").trim();
  if(!text)return "";
  const isoMatch=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(isoMatch){const day=producerDay(text);return day&&day.getFullYear()===Number(isoMatch[1])&&day.getMonth()+1===Number(isoMatch[2])&&day.getDate()===Number(isoMatch[3])?text:null;}
  const match=text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if(!match)return null;
  const iso=`${match[3]}-${match[2].padStart(2,"0")}-${match[1].padStart(2,"0")}`;
  const day=producerDay(iso);
  return day&&day.getFullYear()===Number(match[3])&&day.getMonth()+1===Number(match[2])&&day.getDate()===Number(match[1])?iso:null;
}

function producerDay(value){return value?new Date(String(value).slice(0,10)+"T12:00:00"):null;}
function producerDueState(value,complete){
  if(!value||complete)return "normal";
  const due=producerDay(value);const today=new Date();today.setHours(12,0,0,0);
  const days=Math.round((due-today)/86400000);
  return days<0?"overdue":days===0?"today":days<=3?"soon":"normal";
}
function producerRelativeDue(value){
  if(!value)return "срок не указан";
  const due=producerDay(value);const today=new Date();today.setHours(12,0,0,0);
  const days=Math.round((due-today)/86400000);
  if(days<0)return `просрочено на ${Math.abs(days)} дн.`;
  if(days===0)return "сегодня";
  if(days===1)return "завтра";
  return `через ${days} дн.`;
}

const PRODUCER_PROJECT_ART={
  "demo-north":[0,0],"demo-city":[1,0],"demo-science":[2,0],"demo-home":[3,0],
  "demo-stage":[0,1],"demo-factory":[1,1],"demo-expedition":[2,1],
};
const PRODUCER_AVATAR_IDS=["demo-olga","demo-ilya","demo-anna","demo-denis","demo-maria","local-demo-producer","demo-pavel","demo-elena","demo-kirill","demo-sofia","demo-victor","demo-irina"];

function ProducerAvatar({person,size="normal",title}){
  if(!person)return <span className={`producer-avatar ${size} fallback`}>?</span>;
  const id=typeof person==="string"?person:person.id;const name=typeof person==="string"?title||person:person.name;
  const index=PRODUCER_AVATAR_IDS.indexOf(id);const col=index>=0?index%4:0;const row=index>=0?Math.floor(index/4):0;
  const style=index>=0?{backgroundImage:'url("/demo/staff-avatars-v1.png")',backgroundSize:"400% 300%",backgroundPosition:`${col*100/3}% ${row*50}%`}:{};
  return <span className={`producer-avatar ${size}${index<0?" fallback":""}`} title={name} style={style}>{index<0?String(name||"?").split(/\s+/).map(item=>item[0]).join("").slice(0,2):""}</span>;
}

function ProducerProjectArt({project}){
  const cell=PRODUCER_PROJECT_ART[project.id];
  const style=cell?{backgroundImage:'url("/demo/project-covers-v1.png")',backgroundSize:"400% auto",backgroundPosition:`${cell[0]*100/3}% ${cell[1]*100}%`}:{background:project.color};
  return <span className="producer-project-art" style={style}><i style={{background:project.color}}/></span>;
}

function ProducerWeatherDoodle(){
  return <div className="producer-weather-doodle" aria-label="Сегодня хороший день для работы">
    <svg viewBox="0 0 118 94" role="img" aria-label="Рисованное улыбающееся солнце">
      <g className="producer-sun-rays">
        <path d="M58 4v13M58 77v13M15 47H3M113 47h-13M27 16l8 10M89 17l-8 10M26 78l9-10M90 77l-9-10"/>
      </g>
      <path className="producer-sun-body" d="M88 47c0 17-13 30-30 30S28 64 28 47 41 17 58 17s30 13 30 30Z"/>
      <g className="producer-sun-face">
        <path d="M45 43c2-2 4-2 6 0M66 43c2-2 4-2 6 0"/>
        <path className="producer-sun-smile" d="M46 55c7 8 17 8 24 0"/>
      </g>
    </svg>
    <span><b>Сегодня — хороший день</b><small>для больших историй</small></span>
  </div>;
}

function ProducerDateField({value,onChange,label}){
  const [text,setText]=useState(()=>producerDateInput(value));
  const [invalid,setInvalid]=useState(false);
  const picker=useRef(null);
  useEffect(()=>{setText(producerDateInput(value));setInvalid(false);},[value]);
  function type(next){
    setText(next);
    const parsed=producerIsoFromInput(next);
    setInvalid(parsed===null);
    if(parsed!==null)onChange(parsed);
  }
  function openPicker(){
    if(!picker.current)return;
    if(typeof picker.current.showPicker==="function")picker.current.showPicker();
    else picker.current.click();
  }
  return <span className={"producer-date-field"+(invalid?" invalid":"")}>
    <input aria-label={label} inputMode="numeric" value={text} onChange={e=>type(e.target.value)} onBlur={()=>{if(invalid){setText(producerDateInput(value));setInvalid(false);}}} placeholder="ДД.ММ.ГГГГ"/>
    <button type="button" title="Выбрать дату в календаре" aria-label={"Открыть календарь: "+label} onClick={openPicker}>▦</button>
    <input ref={picker} className="producer-date-native" tabIndex="-1" type="date" value={value||""} onChange={e=>onChange(e.target.value)}/>
  </span>;
}

function producerInitialScreen(){
  const hash=String(window.location.hash||"");
  const detail=hash.match(/^#producer\/(project|block)\/([^/]+)/);
  if(detail)return {type:detail[1],id:decodeURIComponent(detail[2])};
  const section=hash.match(/^#producer\/(projects|calendar|history)$/);
  return {type:section?section[1]:"dashboard",id:""};
}

function ProducerToast({message}){
  if(!message)return null;
  return <div className="producer-toast" role="status">✓ {message}</div>;
}

function ProducerProgress({done,total}){
  const percent=total?Math.round(done*100/total):0;
  return <div className="producer-progress"><span style={{width:percent+"%"}}/><b>{percent}%</b></div>;
}

function ProducerShell({user,onExit,children,onHome,screen,go}){
  return <div className="producer-shell">
    <header className="producer-header">
      <button className="producer-brand" onClick={onHome}>
        <span className="producer-brand-mark">ПТ</span>
        <span><strong>ПОСТ ТРЕКЕР</strong><small>Продюсерская · {RUNTIME.label||"рабочая версия"}</small></span>
      </button>
      <nav className="producer-main-nav" aria-label="Разделы продюсерской">
        <button className={screen.type==="dashboard"?"active":""} onClick={()=>go("dashboard")}>Главная</button>
        <button className={["projects","project","block"].includes(screen.type)?"active":""} onClick={()=>go("projects")}>Проекты</button>
        <button className={screen.type==="calendar"?"active":""} onClick={()=>go("calendar")}>Календарь</button>
        <button className={screen.type==="history"?"active":""} onClick={()=>go("history")}>История</button>
      </nav>
      <div className="producer-user"><button onClick={onExit}>Постпродакшн</button><ProducerAvatar person={{id:"local-demo-producer",name:user.display_name}} size="small"/><span>{user.display_name}</span><b>{user.role}</b></div>
    </header>
    {children}
  </div>;
}

const PRODUCER_STATUS_LABELS={"в работе":"В работе","постпродакшн":"В посте","съёмка":"На съёмке","подготовка":"В подготовке"};

function ProducerProjectCard({project,go}){
  const [expanded,setExpanded]=useState(false);
  return <article className={"producer-project-preview"+(expanded?" expanded":"")} style={{"--project-color":project.color}}>
    <button className="producer-project-preview-main" onClick={()=>setExpanded(value=>!value)} onDoubleClick={()=>go("project",project.id)}>
      <ProducerProjectArt project={project}/>
      <span className="producer-project-stage">● {PRODUCER_STATUS_LABELS[project.status]||project.status||"В работе"}</span>
      {project.warningCount>0&&<span className="producer-project-alert">! {project.warningCount}</span>}
    </button>
    <div className="producer-project-preview-copy">
      <strong>{project.name}</strong><small>{project.description||"Проект без описания"}</small>
      <div className="producer-project-figures"><b>{project.progress||0}%</b><span>{project.completedTasks}/{project.totalTasks} задач</span><span>{project.totalBlocks} блоков</span></div>
      <ProducerProgress done={project.completedTasks} total={project.totalTasks}/>
      <div className="producer-project-preview-meta">
        <span className="producer-project-team"><span className="producer-avatar-stack">{(project.team||[]).map(person=><ProducerAvatar key={person.id} person={person} size="tiny"/>)}</span><small>Команда: {(project.team||[]).length}</small></span>
        <span className="producer-project-deadline"><small>{PRODUCER_STATUS_LABELS[project.status]||project.status||"В работе"}</small><strong>до {producerDate(project.nextDeadline)}</strong></span>
      </div>
    </div>
    {expanded&&<div className="producer-project-preview-detail"><span>{project.completedTasks} из {project.totalTasks} задач готовы</span><button onClick={()=>go("project",project.id)}>Открыть карту проекта →</button></div>}
  </article>;
}

function ProducerDashboard({go,refreshKey,user}){
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [openAttention,setOpenAttention]=useState("");
  useEffect(()=>{let alive=true;setError("");producerRequest("/api/producer/dashboard").then(data=>alive&&setResult(data)).catch(e=>alive&&setError(e.message));return()=>{alive=false;};},[refreshKey]);
  if(error)return <main className="producer-main"><div className="producer-error">{error}</div></main>;
  if(!result)return <main className="producer-main"><div className="producer-loading">Загружаю продюсерскую…</div></main>;
  const todayTasks=result.myTasks||[];
  const attention=result.attention||[];
  const statuses=result.projects.reduce((rows,project)=>{const key=PRODUCER_STATUS_LABELS[project.status]||project.status||"Без статуса";rows[key]=(rows[key]||0)+1;return rows;},{});
  const attentionGroups=attention.reduce((rows,item)=>{let group=rows.find(row=>row.id===item.projectId);if(!group){group={id:item.projectId,name:item.projectName,color:item.projectColor,items:[]};rows.push(group);}group.items.push(item);return rows;},[]);
  const firstName=String(user.display_name||"Коллега").split(/\s+/)[0];
  const hour=new Date().getHours();const greeting=hour<12?"Доброе утро":hour<18?"Добрый день":"Добрый вечер";
  return <main className="producer-main">
    <section className="producer-home-hero">
      <div><h1>{greeting}, {firstName}!</h1><p>Здесь только то, что помогает двигать проекты вперёд.</p></div>
      <ProducerWeatherDoodle/>
    </section>
    <section className="producer-home-projects">
      <header className="producer-clean-heading"><div><h2>Проекты в работе</h2><p>{Object.entries(statuses).map(([label,count])=>`${count} ${label.toLowerCase()}`).join(" · ")}</p></div><button onClick={()=>go("projects")}>Смотреть все проекты →</button></header>
      <div className="producer-project-preview-grid">{result.projects.slice(0,3).map(project=><ProducerProjectCard key={project.id} project={project} go={go}/>)}</div>
    </section>
    <section className="producer-home-columns">
      <article className="producer-clean-list producer-today-list">
        <header><h2>Мои задачи сегодня</h2><b>{todayTasks.length}</b></header>
        <div>{todayTasks.length?todayTasks.map(item=><button key={item.id} onClick={()=>go("block",item.blockId)}>
          <span className="producer-paper-check">✓</span><span><strong>{item.title}</strong><small>{item.projectName} · {item.blockName}</small>{item.internalComment&&<em className="producer-list-comment">💬 {item.internalComment}</em>}</span><time>{producerDate(item.deadline)}</time>
        </button>):<p>На сегодня задач нет.</p>}</div>
      </article>
      <article className="producer-clean-list producer-deadline-list">
        <header><h2>Ближайшие сроки</h2><button onClick={()=>go("calendar")}>Календарь →</button></header>
        <div>{result.deadlines.length?result.deadlines.slice(0,5).map(item=><button key={item.id} onClick={()=>go("block",item.blockId)}>
          <i style={{background:item.projectColor}}/><time>{producerDate(item.deadline)}</time><span><strong>{item.title}</strong><small>{item.projectName} · {item.blockName}</small></span>
        </button>):<p>В ближайшие две недели сроков нет.</p>}</div>
      </article>
      <article className="producer-attention-summary">
        <header><span>!</span><div><h2>Требует внимания</h2><p>{attention.length} ситуаций в {attentionGroups.length} проектах</p></div></header>
        <div>{attentionGroups.length?attentionGroups.slice(0,3).map(group=>{const open=openAttention===group.id;const visible=open?group.items:group.items.slice(0,1);return <section key={group.id} style={{"--project-color":group.color}}>
          <button className="producer-attention-project" onClick={()=>setOpenAttention(open?"":group.id)}><i/><strong>{group.name}</strong><b>{group.items.length}</b><span>{open?"−":"+"}</span></button>
          {visible.map(item=><button className="producer-attention-item" key={item.id} onClick={()=>go("block",item.blockId)}><span><em>{item.reason}</em><strong>{item.title}</strong>{(item.detail||item.blockName)&&<small>{item.detail||item.blockName}</small>}</span><time>{producerRelativeDue(item.deadline)} →</time></button>)}
        </section>}):<p>Срочных препятствий сейчас нет.</p>}</div>
      </article>
    </section>
  </main>;
}

function ProducerProjectsPage({go,refreshKey}){
  const [result,setResult]=useState(null);const [error,setError]=useState("");
  useEffect(()=>{let alive=true;producerRequest("/api/producer/dashboard").then(data=>alive&&setResult(data)).catch(e=>alive&&setError(e.message));return()=>{alive=false;};},[refreshKey]);
  if(error)return <main className="producer-main"><div className="producer-error">{error}</div></main>;
  if(!result)return <main className="producer-main"><div className="producer-loading">Загружаю проекты…</div></main>;
  return <main className="producer-main producer-directory-page"><header className="producer-page-heading"><div><span className="producer-eyebrow">ВСЕ ПРОЕКТЫ</span><h1>Проекты</h1><p>Один щелчок показывает детали, двойной открывает карту проекта.</p></div><b>{result.projects.length} в работе</b></header><div className="producer-project-directory">{result.projects.map(project=><ProducerProjectCard key={project.id} project={project} go={go}/>)}</div></main>;
}

function producerMonthStart(date){return new Date(date.getFullYear(),date.getMonth(),1,12);}
function producerIsoLocal(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}

function ProducerCalendarPage({go,refreshKey}){
  const [result,setResult]=useState(null);const [error,setError]=useState("");const [month,setMonth]=useState(()=>producerMonthStart(new Date()));const [selectedDay,setSelectedDay]=useState(()=>producerIsoLocal(new Date()));
  useEffect(()=>{let alive=true;producerRequest("/api/producer/dashboard").then(data=>alive&&setResult(data)).catch(e=>alive&&setError(e.message));return()=>{alive=false;};},[refreshKey]);
  if(error)return <main className="producer-main"><div className="producer-error">{error}</div></main>;
  if(!result)return <main className="producer-main"><div className="producer-loading">Собираю календарь…</div></main>;
  const first=producerMonthStart(month);const offset=(first.getDay()+6)%7;const gridStart=new Date(first);gridStart.setDate(first.getDate()-offset);
  const days=Array.from({length:42},(_,index)=>{const value=new Date(gridStart);value.setDate(gridStart.getDate()+index);return value;});
  const items=result.calendarItems||[];const today=producerIsoLocal(new Date());const selectedItems=items.filter(item=>item.deadline===selectedDay);
  function shift(value){setMonth(current=>{const next=new Date(current.getFullYear(),current.getMonth()+value,1,12);setSelectedDay(producerIsoLocal(next));return next;});}
  return <main className="producer-main producer-calendar-page"><header className="producer-page-heading"><div><span className="producer-eyebrow">СРОКИ ЗАДАЧ</span><h1>Календарь</h1><p>Нажмите на срок, чтобы перейти прямо в нужный блок.</p></div><div className="producer-month-switch"><button onClick={()=>shift(-1)}>←</button><strong>{month.toLocaleDateString("ru-RU",{month:"long",year:"numeric"})}</strong><button onClick={()=>shift(1)}>→</button></div></header>
    <div className="producer-calendar-layout"><section className="producer-calendar-board"><div className="producer-calendar-weekdays">{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map(day=><span key={day}>{day}</span>)}</div>
      <div className="producer-calendar-grid">{days.map(day=>{const iso=producerIsoLocal(day);const rows=items.filter(item=>item.deadline===iso);return <section key={iso} onClick={()=>setSelectedDay(iso)} className={(day.getMonth()!==month.getMonth()?"outside ":"")+(iso===today?"today ":"")+(iso===selectedDay?"selected":"")}><time>{day.getDate()}</time><div>{rows.slice(0,3).map(item=><button key={item.id} style={{"--project-color":item.projectColor}} onClick={event=>{event.stopPropagation();go("block",item.blockId);}}><i/><span>{item.title}</span><span className="producer-calendar-hover-card"><em>{item.projectName}</em><strong>{item.title}</strong><small>{item.blockName}</small><b>{item.assigneeName||"Исполнитель не указан"} · {producerDate(item.deadline)}</b></span></button>)}{rows.length>3&&<small>ещё {rows.length-3}</small>}</div></section>})}</div></section>
      <aside className="producer-calendar-day"><span className="producer-eyebrow">ВЫБРАННЫЙ ДЕНЬ</span><h2>{producerDay(selectedDay).toLocaleDateString("ru-RU",{day:"numeric",month:"long",weekday:"long"})}</h2><p>{selectedItems.length?`${selectedItems.length} задач со сроком`:"Задач на этот день нет"}</p><div>{selectedItems.map(item=><button key={item.id} style={{"--project-color":item.projectColor}} onClick={()=>go("block",item.blockId)}><i/><span><em>{item.projectName}</em><strong>{item.title}</strong><small>{item.blockName} · {item.assigneeName||"без исполнителя"}</small>{item.internalComment&&<b>💬 {item.internalComment}</b>}</span><mark>Открыть →</mark></button>)}</div></aside>
    </div>
  </main>;
}

const PRODUCER_AUDIT_ACTIONS={create:"Создано",update:"Изменено",assign:"Изменён исполнитель",move:"Перемещено",reschedule:"Перенесён срок",complete:"Выполнено",restore:"Возвращено",delete:"Удалено",approve:"Согласовано",reject:"Отклонено",save:"Сохранено"};
const PRODUCER_AUDIT_ENTITIES={project:"Проект",series:"Серия",task:"Смена",productionBlock:"Блок",productionGroup:"Группа",productionTask:"Задача",productionApproval:"Согласование",person:"Сотрудник",settings:"Настройки",bulk:"Массовое изменение"};
const PRODUCER_AUDIT_FIELDS={title:"Название",name:"Название",internal_comment:"Внутренний комментарий",deadline:"Срок",assignee_name:"Исполнитель",responsible_name:"Ответственный",owner_name:"Ответственный блока",group_id:"Группа",status:"Статус",description:"Описание",decision_comment:"Комментарий к решению"};
function producerAuditValue(value){
  if(value===null||value===undefined||value==="")return "—";
  if(value===true)return "да";if(value===false)return "нет";
  if(Array.isArray(value))return value.length?value.map(item=>typeof item==="object"?(item.name||item.label||item.uid||JSON.stringify(item)):String(item)).join(", "):"—";
  if(typeof value==="object")return JSON.stringify(value);
  return String(value);
}

function ProducerHistoryPage({refreshKey}){
  const [projects,setProjects]=useState([]);const [filters,setFilters]=useState({projectId:"",actorUserId:"",action:"",from:"",to:""});const [page,setPage]=useState(1);
  const [result,setResult]=useState({events:[],actors:[],total:0,totalPages:1});const [error,setError]=useState("");const [loading,setLoading]=useState(true);
  useEffect(()=>{producerRequest("/api/producer/dashboard").then(data=>setProjects(data.projects||[])).catch(()=>{});},[refreshKey]);
  useEffect(()=>{let alive=true;const query=new URLSearchParams({page:String(page),pageSize:"30"});Object.entries(filters).forEach(([key,value])=>value&&query.set(key,value));setLoading(true);producerRequest("/api/audit/events?"+query).then(data=>{if(alive){setResult(data);setError("");}}).catch(e=>alive&&setError(e.message)).finally(()=>alive&&setLoading(false));return()=>{alive=false;};},[page,filters.projectId,filters.actorUserId,filters.action,filters.from,filters.to,refreshKey]);
  function change(key,value){setFilters(current=>({...current,[key]:value}));setPage(1);}
  return <main className="producer-main producer-history-page"><header className="producer-page-heading"><div><span className="producer-eyebrow">ОБЩИЙ ЖУРНАЛ</span><h1>История</h1><p>Подтверждённые изменения во всех доступных проектах.</p></div><b>{result.total} событий</b></header>
    <div className="producer-history-filters"><select aria-label="Фильтр истории по проекту" value={filters.projectId} onChange={e=>change("projectId",e.target.value)}><option value="">Все проекты</option>{projects.map(project=><option key={project.id} value={project.id}>{project.name}</option>)}</select><select aria-label="Фильтр истории по автору" value={filters.actorUserId} onChange={e=>change("actorUserId",e.target.value)}><option value="">Все авторы</option>{(result.actors||[]).map(actor=><option key={String(actor.id)+actor.name} value={actor.id}>{actor.name}</option>)}</select><select aria-label="Фильтр истории по действию" value={filters.action} onChange={e=>change("action",e.target.value)}><option value="">Все действия</option>{Object.entries(PRODUCER_AUDIT_ACTIONS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><ProducerDateField label="История с даты" value={filters.from} onChange={value=>change("from",value)}/><ProducerDateField label="История по дату" value={filters.to} onChange={value=>change("to",value)}/></div>
    {error&&<div className="producer-inline-error">{error}</div>}{loading?<div className="producer-loading">Загружаю историю…</div>:<div className="producer-history-feed">{result.events.length?result.events.map(event=><details key={event.id}><summary><time>{new Date(event.occurredAt).toLocaleString("ru-RU")}</time><strong>{event.userName||"Система"}</strong><span><b>{PRODUCER_AUDIT_ACTIONS[event.action]||event.action}</b> {PRODUCER_AUDIT_ENTITIES[event.entity]||event.entity}{event.details?.label?": "+event.details.label:""}</span><em>{event.projectName||"Общие настройки"}</em></summary><div>{(event.changes||[]).length?(event.changes||[]).map((item,index)=><p key={item.field+index}><b>{PRODUCER_AUDIT_FIELDS[item.field]||item.field}:</b> {producerAuditValue(item.before)} <i>→</i> {producerAuditValue(item.after)}</p>):<p>Дополнительных значений нет.</p>}</div></details>):<p className="producer-history-empty">По выбранным фильтрам записей нет.</p>}</div>}
    <div className="producer-history-pages"><button disabled={page<=1} onClick={()=>setPage(value=>value-1)}>← Новее</button><span>Страница {result.page||page} из {result.totalPages||1}</span><button disabled={page>=(result.totalPages||1)} onClick={()=>setPage(value=>value+1)}>Старее →</button></div>
  </main>;
}

function ProducerBlockNode({block,onOpen}){
  const statusLabel={done:"Готово",active:"В работе",planned:"Запланировано",paused:"Пауза"}[block.status]||block.status;
  const dueState=producerDueState(block.deadline,block.status==="done");
  return <button className={`producer-map-node ${block.status} due-${dueState}`} onClick={()=>onOpen(block.id)}>
    <span className="producer-node-status">{statusLabel}</span>
    <strong>{block.name}</strong>
    <small className="producer-node-owner"><ProducerAvatar person={{id:block.ownerPersonId,name:block.ownerName}} size="tiny"/>{block.ownerName||"Ответственный не указан"}</small>
    {block.warningCount>0&&<span className="producer-node-warning">! {block.warningCount} требует внимания</span>}
    <div><ProducerProgress done={block.completedTasks} total={block.totalTasks}/><time className={dueState}>{producerDate(block.deadline)}</time></div>
  </button>;
}

function ProducerCompareProject({result,onClose,onOpenProject,onOpenBlock}){
  const totals=result.blocks.reduce((sum,block)=>({tasks:sum.tasks+block.totalTasks,done:sum.done+block.completedTasks,warnings:sum.warnings+block.warningCount}),{tasks:0,done:0,warnings:0});
  return <aside className="producer-project-compare" style={{"--project-color":result.project.color}}>
    <header><div><span className="producer-eyebrow">ОТКРЫТ РЯДОМ</span><h2>{result.project.name}</h2><p>{result.project.description||"Описание проекта пока не добавлено."}</p></div><button aria-label="Закрыть второй проект" onClick={onClose}>×</button></header>
    <div className="producer-compare-summary"><span><b>{totals.done}/{totals.tasks}</b><small>задач готово</small></span><span><b>{result.blocks.length}</b><small>блоков</small></span><span className={totals.warnings?"warning":""}><b>{totals.warnings}</b><small>требуют внимания</small></span></div>
    <div className="producer-compare-blocks">{result.blocks.map(block=><button key={block.id} className={"producer-compare-block due-"+producerDueState(block.deadline,block.status==="done")} onClick={()=>onOpenBlock(block.id)}>
      <span>{block.seriesName||"Общий этап"}</span><strong>{block.name}</strong><small><ProducerAvatar person={{id:block.ownerPersonId,name:block.ownerName}} size="tiny"/>{block.ownerName||"Ответственный не указан"}</small>
      <div><ProducerProgress done={block.completedTasks} total={block.totalTasks}/><time>{producerDate(block.deadline)}</time></div>
    </button>)}</div>
    <button className="producer-compare-open" onClick={onOpenProject}>Открыть карту этого проекта →</button>
  </aside>;
}

function ProducerProjectMap({projectId,people,go,toast}){
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [showCreate,setShowCreate]=useState(false);
  const [saving,setSaving]=useState(false);
  const [projectChoices,setProjectChoices]=useState([]);
  const [compareId,setCompareId]=useState("");
  const [compareResult,setCompareResult]=useState(null);
  const [compareLoading,setCompareLoading]=useState(false);
  const [form,setForm]=useState({name:"",description:"",seriesId:"",ownerPersonId:people[0]?.id||"",startDate:"",deadline:"",status:"planned"});
  const load=()=>producerRequest("/api/producer/projects/"+encodeURIComponent(projectId)).then(setResult).catch(e=>setError(e.message));
  useEffect(()=>{setResult(null);setCompareId("");setCompareResult(null);load();},[projectId]);
  useEffect(()=>{let alive=true;producerRequest("/api/producer/dashboard").then(data=>alive&&setProjectChoices((data.projects||[]).filter(project=>project.id!==projectId))).catch(()=>{});return()=>{alive=false;};},[projectId]);
  useEffect(()=>{let alive=true;if(!compareId){setCompareResult(null);setCompareLoading(false);return()=>{alive=false;};}setCompareLoading(true);producerRequest("/api/producer/projects/"+encodeURIComponent(compareId)).then(data=>{if(alive){setCompareResult(data);setError("");}}).catch(e=>alive&&setError(e.message)).finally(()=>alive&&setCompareLoading(false));return()=>{alive=false;};},[compareId]);
  async function createBlock(event){
    event.preventDefault();setSaving(true);setError("");
    try{
      const created=await producerRequest("/api/producer/projects/"+encodeURIComponent(projectId)+"/blocks",{method:"POST",body:JSON.stringify({...form,seriesId:form.seriesId||null,startDate:form.startDate||null,deadline:form.deadline||null})});
      setShowCreate(false);setForm({...form,name:"",description:"",startDate:"",deadline:""});await load();go("block",created.id);toast("Блок создан и сохранён");
    }catch(e){setError(e.message);}finally{setSaving(false);}
  }
  if(!result)return <main className="producer-main">{error?<div className="producer-error">{error}</div>:<div className="producer-loading">Строю карту проекта…</div>}</main>;
  const common=result.blocks.filter(block=>!block.seriesId);
  return <main className="producer-main producer-map-page">
    <div className="producer-breadcrumb"><button onClick={()=>go("dashboard")}>← Все проекты</button><span>/</span><b>{result.project.name}</b></div>
    <section className="producer-project-hero" style={{"--project-color":result.project.color}}>
      <div className="producer-cover">{result.project.abbr||result.project.name.slice(0,2)}</div>
      <div><span className="producer-eyebrow">КАРТА ПРОЕКТА</span><h1>{result.project.name}</h1><p>{result.project.description||"Описание проекта пока не добавлено."}</p></div>
      <div className="producer-project-actions"><button className="producer-primary" onClick={()=>setShowCreate(true)}>＋ Новый блок</button><label>Второй проект<select aria-label="Открыть второй проект рядом" value={compareId} onChange={event=>setCompareId(event.target.value)}><option value="">Открыть рядом…</option>{projectChoices.map(project=><option key={project.id} value={project.id}>{project.name}</option>)}</select></label></div>
    </section>
    <div className={"producer-project-board"+(compareResult?" has-compare":"")}><div className="producer-project-primary-column"><section className="producer-map-section">
        <div className="producer-map-title"><div><small>ОБЩАЯ ЛИНИЯ</small><h2>Общие этапы</h2></div><span>{common.length} блоков</span></div>
        <div className="producer-map-track">{common.length?common.map((block,index)=><React.Fragment key={block.id}><ProducerBlockNode block={block} onOpen={id=>go("block",id)}/>{index<common.length-1&&<i className="producer-map-connector"/>}</React.Fragment>):<div className="producer-empty-map">Добавьте первый общий блок проекта</div>}</div>
      </section>
      <section className="producer-series-map">
        <div className="producer-map-title"><div><small>СЕРИЙНЫЕ ВЕТКИ</small><h2>Работа по сериям</h2></div></div>
        {result.series.map(series=>{const blocks=result.blocks.filter(block=>block.seriesId===series.id);return <div className="producer-series-row" key={series.id}>
          <div className="producer-series-label"><span>{String(series.order||1).padStart(2,"0")}</span><strong>{series.name}</strong></div>
          <div className="producer-map-track">{blocks.length?blocks.map((block,index)=><React.Fragment key={block.id}><ProducerBlockNode block={block} onOpen={id=>go("block",id)}/>{index<blocks.length-1&&<i className="producer-map-connector"/>}</React.Fragment>):<div className="producer-empty-map compact">Блоков пока нет</div>}</div>
        </div>})}
      </section></div>
      {compareLoading&&<aside className="producer-project-compare loading">Загружаю второй проект…</aside>}
      {compareResult&&<ProducerCompareProject result={compareResult} onClose={()=>setCompareId("")} onOpenProject={()=>go("project",compareResult.project.id)} onOpenBlock={id=>go("block",id)}/>}
    </div>
    {showCreate&&<div className="producer-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false);}}><form className="producer-modal" onSubmit={createBlock}>
      <div className="producer-modal-head"><div><small>НОВЫЙ ЭТАП</small><h2>Создать блок</h2></div><button type="button" onClick={()=>setShowCreate(false)}>×</button></div>
      <label>Название<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Например, Препродакшн" required/></label>
      <label>Короткое описание<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Что должно быть сделано в этом блоке"/></label>
      <div className="producer-form-row"><label>Серия<select value={form.seriesId} onChange={e=>setForm({...form,seriesId:e.target.value})}><option value="">Общий блок проекта</option>{result.series.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Ответственный<select value={form.ownerPersonId} onChange={e=>setForm({...form,ownerPersonId:e.target.value})} required><option value="">Выберите</option>{people.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
      <div className="producer-form-row"><label>Начало<ProducerDateField label="Дата начала блока" value={form.startDate} onChange={value=>setForm({...form,startDate:value})}/></label><label>Срок<ProducerDateField label="Срок блока" value={form.deadline} onChange={value=>setForm({...form,deadline:value})}/></label></div>
      <label>Статус<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Запланировано</option><option value="active">В работе</option><option value="paused">Пауза</option><option value="done">Готово</option></select></label>
      {error&&<div className="producer-inline-error">{error}</div>}
      <div className="producer-modal-actions"><button type="button" onClick={()=>setShowCreate(false)}>Отмена</button><button className="producer-primary" disabled={saving}>{saving?"Сохраняю…":"Создать блок"}</button></div>
    </form></div>}
  </main>;
}

function ProducerTaskRow({task,people,groups,onChange}){
  const [busy,setBusy]=useState(false);
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({title:task.title,internalComment:task.internalComment||"",groupId:task.groupId||"",assigneePersonId:task.assigneePersonId||"",responsiblePersonId:task.responsiblePersonId||"",deadline:task.deadline||""});
  useEffect(()=>{if(!editing)setDraft({title:task.title,internalComment:task.internalComment||"",groupId:task.groupId||"",assigneePersonId:task.assigneePersonId||"",responsiblePersonId:task.responsiblePersonId||"",deadline:task.deadline||""});},[task.title,task.internalComment,task.groupId,task.assigneePersonId,task.responsiblePersonId,task.deadline,editing]);
  async function update(patch){setBusy(true);try{await onChange(task.id,patch);}catch(error){}finally{setBusy(false);}}
  async function save(event){event.preventDefault();setBusy(true);try{await onChange(task.id,{...draft,groupId:draft.groupId||null,responsiblePersonId:draft.responsiblePersonId||null,deadline:draft.deadline||null});setEditing(false);}catch(error){}finally{setBusy(false);}}
  const dueState=producerDueState(task.deadline,task.completed);
  return <div id={"producer-task-"+task.id} className={"producer-task-item due-"+dueState+(task.completed?" complete":"")+(busy?" busy":"")}>
    <div className="producer-task-row">
      <label className="producer-check" title={task.completed?"Вернуть в работу":"Отметить выполненной"}><input aria-label={task.completed?"Вернуть задачу в работу":"Выполнить задачу"} type="checkbox" checked={task.completed} onChange={e=>update({completed:e.target.checked})}/><span>✓</span></label>
      <button className="producer-task-copy" onClick={()=>setEditing(value=>!value)}><strong>{task.title}</strong><small>{task.responsibleName?"Ответственный: "+task.responsibleName:"Без отдельного ответственного"}</small>{task.internalComment&&<em title={task.internalComment}>◌ {task.internalComment}</em>}</button>
      <div className="producer-task-assignee"><ProducerAvatar person={{id:task.assigneePersonId,name:task.assigneeName}} size="tiny"/><select aria-label={"Исполнитель задачи "+task.title} value={task.assigneePersonId||""} onChange={e=>update({assigneePersonId:e.target.value})}>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></div>
      <time className={dueState} title={producerRelativeDue(task.deadline)}>{producerDate(task.deadline)}</time>
      <button className="producer-edit-task" onClick={()=>setEditing(value=>!value)} aria-label={"Изменить задачу "+task.title}>{editing?"Скрыть":"Изменить"}</button>
    </div>
    {editing&&<form className="producer-task-editor" onSubmit={save}>
      <label>Название<input autoFocus value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} required/></label>
      <label className="producer-task-comment-field">Внутренний комментарий<textarea value={draft.internalComment} onChange={e=>setDraft({...draft,internalComment:e.target.value})} placeholder="Контекст, договорённость или важная деталь для команды"/></label>
      <label>Исполнитель<select value={draft.assigneePersonId} onChange={e=>setDraft({...draft,assigneePersonId:e.target.value})} required>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      <label>Ответственный<select value={draft.responsiblePersonId} onChange={e=>setDraft({...draft,responsiblePersonId:e.target.value})}><option value="">Не указан</option>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      <label>Группа<select value={draft.groupId} onChange={e=>setDraft({...draft,groupId:e.target.value})}><option value="">Без группы</option>{groups.map(group=><option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
      <label>Срок<ProducerDateField label={"Срок задачи "+task.title} value={draft.deadline} onChange={value=>setDraft({...draft,deadline:value})}/></label>
      <div className="producer-task-editor-actions"><button type="button" onClick={()=>setEditing(false)}>Отмена</button><button className="producer-primary" disabled={busy}>Сохранить</button></div>
    </form>}
  </div>;
}

function ProducerQuickTask({groupId,people,onCreate}){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [title,setTitle]=useState("");
  const [comment,setComment]=useState("");
  const [assignee,setAssignee]=useState(people[0]?.id||"");
  async function submit(event){event.preventDefault();if(!title.trim()||!assignee)return;setBusy(true);try{await onCreate({title,internalComment:comment,groupId:groupId||null,assigneePersonId:assignee});setTitle("");setComment("");setOpen(false);}catch(error){}finally{setBusy(false);}}
  if(!open)return <button className="producer-quick-task-open" onClick={()=>setOpen(true)}>＋ Добавить задачу</button>;
  return <form className="producer-quick-task" onSubmit={submit}>
    <input autoFocus aria-label="Название новой задачи" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Что нужно сделать?" required/>
    <input aria-label="Внутренний комментарий новой задачи" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Комментарий (необязательно)"/>
    <select aria-label="Исполнитель новой задачи" value={assignee} onChange={e=>setAssignee(e.target.value)} required><option value="">Исполнитель</option>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select>
    <button className="producer-primary" disabled={busy}>{busy?"…":"Добавить"}</button><button type="button" onClick={()=>{setOpen(false);setTitle("");setComment("");}}>Отмена</button>
  </form>;
}

function ProducerGroupHeader({group,done,total,onRename,onDelete}){
  const [renaming,setRenaming]=useState(false);
  const [name,setName]=useState(group.name);
  async function save(event){event.preventDefault();if(!name.trim())return;try{await onRename(group.id,name);setRenaming(false);}catch(error){}}
  return <div className="producer-group-head">{renaming?<form onSubmit={save}><input autoFocus aria-label="Новое название группы" value={name} onChange={e=>setName(e.target.value)}/><button>Сохранить</button><button type="button" onClick={()=>{setName(group.name);setRenaming(false);}}>Отмена</button></form>:<><h3>{group.name}<span>{done}/{total}</span></h3><div><button onClick={()=>setRenaming(true)}>Переименовать</button><button className="danger" onClick={()=>onDelete(group,total)}>Удалить</button></div></>}</div>;
}

function ProducerBlockSettings({block,seriesOptions,people,onSave}){
  const [draft,setDraft]=useState({name:block.name,description:block.description||"",seriesId:block.seriesId||"",ownerPersonId:block.ownerPersonId||"",startDate:block.startDate||"",deadline:block.deadline||"",status:block.status});
  const [busy,setBusy]=useState(false);
  useEffect(()=>setDraft({name:block.name,description:block.description||"",seriesId:block.seriesId||"",ownerPersonId:block.ownerPersonId||"",startDate:block.startDate||"",deadline:block.deadline||"",status:block.status}),[block.id,block.name,block.description,block.seriesId,block.ownerPersonId,block.startDate,block.deadline,block.status]);
  async function submit(event){event.preventDefault();setBusy(true);try{await onSave({...draft,seriesId:draft.seriesId||null,startDate:draft.startDate||null,deadline:draft.deadline||null});}catch(error){}finally{setBusy(false);}}
  return <details className="producer-block-settings"><summary>Параметры блока <span>Изменить</span></summary><form onSubmit={submit}>
    <label>Название<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} required/></label>
    <label>Описание<textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
    <label>Ветка<select value={draft.seriesId} onChange={e=>setDraft({...draft,seriesId:e.target.value})}><option value="">Общий блок проекта</option>{seriesOptions.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label>Ответственный<select value={draft.ownerPersonId} onChange={e=>setDraft({...draft,ownerPersonId:e.target.value})} required>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
    <div className="producer-form-row"><label>Начало<ProducerDateField label="Дата начала блока" value={draft.startDate} onChange={value=>setDraft({...draft,startDate:value})}/></label><label>Срок<ProducerDateField label="Срок блока" value={draft.deadline} onChange={value=>setDraft({...draft,deadline:value})}/></label></div>
    <label>Статус<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option value="planned">Запланировано</option><option value="active">В работе</option><option value="paused">Пауза</option><option value="done">Готово</option></select></label>
    <button className="producer-primary" disabled={busy}>{busy?"Сохраняю…":"Сохранить параметры"}</button>
  </form></details>;
}

function ProducerWarnings({warnings,onFocus}){
  return <section className={"producer-warnings"+(warnings.length?" has-items":" clear")}>
    <div className="producer-warnings-head"><div><span className="producer-eyebrow">КОНТРОЛЬ</span><h2>Предупреждения</h2></div><b>{warnings.length||"✓"}</b></div>
    {warnings.length?<div className="producer-warning-list">{warnings.map(item=><button className={item.severity} key={item.id} onClick={()=>onFocus(item)}>
      <span>!</span><div><strong>{item.title}</strong><p>{item.message}</p><small>Нажмите, чтобы увидеть место проблемы →</small></div><time>{producerDate(item.dueDate)}</time>
    </button>)}</div>:<p>Критичных препятствий по срокам и согласованиям нет.</p>}
  </section>;
}

function ProducerApprovalItem({approval,tasks,canDecide,onDecision}){
  const [comment,setComment]=useState(approval.decisionComment||"");
  const [busy,setBusy]=useState(false);
  useEffect(()=>setComment(approval.status==="pending"?"":approval.decisionComment||""),[approval.status,approval.decisionComment]);
  const linkedTask=tasks.find(task=>task.id===approval.taskId);
  const status=approval.status==="pending"?"pending":approval.decision;
  const labels={pending:"Ожидает решения",approved:"Согласовано",rejected:"Отклонено"};
  async function decide(value){setBusy(true);try{await onDecision(approval.id,value,value?comment:"");}catch(error){}finally{setBusy(false);}}
  return <article id={"producer-approval-"+approval.id} className={"producer-approval "+status}>
    <div className="producer-approval-main"><div className="producer-approval-title"><span>{labels[status]||status}</span>{approval.required&&<b>обязательно</b>}<strong>{approval.title}</strong></div>
      <p>{linkedTask?"Задача: "+linkedTask.title:"Весь блок"}{approval.dueDate?" · срок "+producerDate(approval.dueDate):""}</p>
      <small>Запросил: {approval.requestedByName||"Система"}{approval.decidedByName?" · решение: "+approval.decidedByName:""}</small>
      {approval.decisionComment&&approval.status!=="pending"&&<blockquote>{approval.decisionComment}</blockquote>}
    </div>
    {approval.status==="pending"&&canDecide&&<div className="producer-approval-decision"><input aria-label={"Комментарий к согласованию "+approval.title} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Комментарий к решению"/><div><button disabled={busy} onClick={()=>decide("approved")}>Согласовать</button><button className="danger" disabled={busy} onClick={()=>decide("rejected")}>Отклонить</button></div></div>}
    {approval.status==="pending"&&!canDecide&&<em>Решение принимает руководитель или администратор</em>}
    {approval.status!=="pending"&&canDecide&&<button className="producer-approval-reopen" disabled={busy} onClick={()=>decide(null)}>Вернуть на согласование</button>}
  </article>;
}

function ProducerApprovals({approvals,tasks,canDecide,onCreate,onDecision}){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [draft,setDraft]=useState({title:"",taskId:"",dueDate:"",required:true});
  async function submit(event){event.preventDefault();setBusy(true);try{await onCreate({...draft,taskId:draft.taskId||null,dueDate:draft.dueDate||null});setDraft({title:"",taskId:"",dueDate:"",required:true});setOpen(false);}catch(error){}finally{setBusy(false);}}
  return <section className="producer-approvals-section">
    <div className="producer-section-head"><div><span className="producer-eyebrow">РЕШЕНИЯ</span><h2>Согласования</h2></div><b>{approvals.filter(item=>item.status==="pending").length} ожидают</b></div>
    <div className="producer-approval-list">{approvals.length?approvals.map(item=><ProducerApprovalItem key={item.id} approval={item} tasks={tasks} canDecide={canDecide} onDecision={onDecision}/>):<p className="producer-approval-empty">Согласований в этом блоке пока нет.</p>}</div>
    {!open?<button className="producer-approval-create-open" onClick={()=>setOpen(true)}>＋ Запросить согласование</button>:<form className="producer-approval-create" onSubmit={submit}>
      <label>Что согласовать<input autoFocus value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Например, финальный сценарий" required/></label>
      <div className="producer-form-row"><label>Связанная задача<select value={draft.taskId} onChange={e=>setDraft({...draft,taskId:e.target.value})}><option value="">Весь блок</option>{tasks.map(task=><option key={task.id} value={task.id}>{task.title}</option>)}</select></label><label>Срок решения<ProducerDateField label="Срок решения" value={draft.dueDate} onChange={value=>setDraft({...draft,dueDate:value})}/></label></div>
      <label className="producer-approval-required"><input type="checkbox" checked={draft.required} onChange={e=>setDraft({...draft,required:e.target.checked})}/> Обязательное согласование влияет на предупреждения</label>
      <div className="producer-task-editor-actions"><button type="button" onClick={()=>setOpen(false)}>Отмена</button><button className="producer-primary" disabled={busy}>{busy?"Сохраняю…":"Создать запрос"}</button></div>
    </form>}
  </section>;
}

function ProducerHistory({events}){
  const actions={create:"Создано",update:"Изменено",assign:"Назначен исполнитель",move:"Перемещено",reschedule:"Изменён срок",complete:"Выполнено",restore:"Возвращено в работу",delete:"Удалено",approve:"Согласовано",reject:"Отклонено"};
  return <details className="producer-history"><summary>История блока <b>{events.length}</b></summary><div>{events.length?events.map(event=><article key={event.id}><span>{event.entity==="productionApproval"&&event.action==="restore"?"Возвращено на согласование":actions[event.action]||event.action}</span><strong>{event.details?.label||"Изменение"}</strong><small>{event.userName} · {new Date(event.occurredAt).toLocaleString("ru-RU")}</small></article>):<p>История появится после первого изменения.</p>}</div></details>;
}

function ProducerBlockPage({blockId,go,toast}){
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [groupName,setGroupName]=useState("");
  const [saving,setSaving]=useState(false);
  const load=()=>producerRequest("/api/producer/blocks/"+encodeURIComponent(blockId)).then(data=>{setResult(data);setError("");return data;}).catch(e=>{setError(e.message);return null;});
  useEffect(()=>{load();},[blockId]);
  async function addGroup(event){event.preventDefault();if(!groupName.trim())return;setSaving(true);try{await producerRequest("/api/producer/blocks/"+encodeURIComponent(blockId)+"/groups",{method:"POST",body:JSON.stringify({name:groupName})});setGroupName("");await load();toast("Группа создана");}catch(e){setError(e.message);}finally{setSaving(false);}}
  async function addTask(input){try{await producerRequest("/api/producer/blocks/"+encodeURIComponent(blockId)+"/tasks",{method:"POST",body:JSON.stringify(input)});await load();toast("Задача создана и сохранена");}catch(e){setError(e.message);throw e;}}
  async function updateTask(taskId,patch){try{await producerRequest("/api/producer/tasks/"+encodeURIComponent(taskId),{method:"PATCH",body:JSON.stringify(patch)});await load();toast(patch.completed===true?"Задача выполнена":patch.completed===false?"Задача возвращена в работу":"Изменения сохранены");}catch(e){setError(e.message);throw e;}}
  async function updateBlock(patch){try{await producerRequest("/api/producer/blocks/"+encodeURIComponent(blockId),{method:"PATCH",body:JSON.stringify(patch)});await load();toast("Параметры блока сохранены");}catch(e){setError(e.message);throw e;}}
  async function renameGroup(groupId,name){try{await producerRequest("/api/producer/groups/"+encodeURIComponent(groupId),{method:"PATCH",body:JSON.stringify({name})});await load();toast("Группа переименована");}catch(e){setError(e.message);throw e;}}
  async function addApproval(input){try{await producerRequest("/api/producer/blocks/"+encodeURIComponent(blockId)+"/approvals",{method:"POST",body:JSON.stringify(input)});await load();toast("Запрос на согласование создан");}catch(e){setError(e.message);throw e;}}
  async function decideApproval(approvalId,decision,comment){try{await producerRequest("/api/producer/approvals/"+encodeURIComponent(approvalId)+"/decision",{method:"PATCH",body:JSON.stringify({decision,comment})});await load();toast(decision==="approved"?"Согласование принято":decision==="rejected"?"Согласование отклонено":"Запрос возвращён на согласование");}catch(e){setError(e.message);throw e;}}
  async function deleteGroup(group,total){
    if(!window.confirm(total?`Удалить группу «${group.name}»? ${total} задач будут сохранены в разделе «Без группы».`:`Удалить пустую группу «${group.name}»?`))return;
    try{const answer=await producerRequest("/api/producer/groups/"+encodeURIComponent(group.id),{method:"DELETE"});await load();toast(answer.movedTasks?`Группа удалена, задач сохранено: ${answer.movedTasks}`:"Группа удалена");}catch(e){setError(e.message);}
  }
  function focusWarning(item){
    const targetId=item.taskId?"producer-task-"+item.taskId:item.approvalId?"producer-approval-"+item.approvalId:"producer-block-deadline";
    const target=document.getElementById(targetId);
    if(!target)return;
    target.scrollIntoView({behavior:"smooth",block:"center"});
    target.classList.add("producer-focus-flash");
    window.setTimeout(()=>target.classList.remove("producer-focus-flash"),1800);
  }
  if(!result)return <main className="producer-main">{error?<div className="producer-error">{error}</div>:<div className="producer-loading">Открываю блок…</div>}</main>;
  const {block,project,series,seriesOptions,groups,tasks,approvals=[],warnings=[],people,history,permissions={}}=result;
  const ungrouped=tasks.filter(task=>!task.groupId);
  return <main className="producer-main producer-block-page">
    <div className="producer-breadcrumb"><button onClick={()=>go("dashboard")}>Все проекты</button><span>/</span><button onClick={()=>go("project",project.id)}>{project.name}</button><span>/</span><b>{block.name}</b></div>
    <section className="producer-block-hero" style={{"--project-color":project.color}}>
      <div><span className="producer-eyebrow">{series?series.name:"ОБЩИЙ БЛОК"}</span><h1>{block.name}</h1><p>{block.description||"Описание можно добавить позже."}</p></div>
      <div className="producer-block-meta"><span><small>Ответственный</small><strong className="producer-owner-with-avatar"><ProducerAvatar person={{id:block.ownerPersonId,name:block.ownerName}} size="small"/>{block.ownerName||"Не назначен"}</strong></span><span id="producer-block-deadline" className={"due-"+producerDueState(block.deadline,block.status==="done")}><small>Период</small><strong>{block.startDate?producerDate(block.startDate)+" — ":""}{producerDate(block.deadline)}</strong><em>{producerRelativeDue(block.deadline)}</em></span><span><small>Готовность</small><ProducerProgress done={block.completedTasks} total={block.totalTasks}/></span></div>
    </section>
    {error&&<div className="producer-inline-error">{error}</div>}
    <section className="producer-block-layout"><div className="producer-task-area">
      <ProducerWarnings warnings={warnings} onFocus={focusWarning}/>
      <div className="producer-section-head"><div><span className="producer-eyebrow">РАБОТА</span><h2>Задачи блока</h2></div><b>{block.completedTasks} из {block.totalTasks}</b></div>
      {groups.map(group=>{const rows=tasks.filter(task=>task.groupId===group.id);return <article className="producer-task-group" key={group.id}>
        <ProducerGroupHeader group={group} done={rows.filter(t=>t.completed).length} total={rows.length} onRename={renameGroup} onDelete={deleteGroup}/>
        {rows.length?rows.map(task=><ProducerTaskRow key={task.id} task={task} people={people} groups={groups} onChange={updateTask}/>):<p>В группе пока нет задач</p>}
        <ProducerQuickTask groupId={group.id} people={people} onCreate={addTask}/>
      </article>})}
      <article className="producer-task-group producer-ungrouped"><div className="producer-group-head"><h3>Без группы<span>{ungrouped.filter(t=>t.completed).length}/{ungrouped.length}</span></h3></div>
        {ungrouped.length?ungrouped.map(task=><ProducerTaskRow key={task.id} task={task} people={people} groups={groups} onChange={updateTask}/>):<p>Сюда попадут задачи без группы и задачи из удалённых групп.</p>}
        <ProducerQuickTask groupId={null} people={people} onCreate={addTask}/>
      </article>
      <ProducerApprovals approvals={approvals} tasks={tasks} canDecide={permissions.canDecideApprovals===true} onCreate={addApproval} onDecision={decideApproval}/>
      <ProducerHistory events={history}/>
    </div><aside className="producer-create-panel">
      <div className="producer-side-intro"><span className="producer-eyebrow">НАСТРОЙКА</span><h2>Блок и группы</h2><p>Задачи добавляются прямо в нужной группе слева.</p></div>
      <ProducerBlockSettings block={block} seriesOptions={seriesOptions||[]} people={people} onSave={updateBlock}/>
      <form className="producer-group-form" onSubmit={addGroup}><h3>Добавить группу</h3><p>Группа объединяет задачи внутри этого блока.</p><div><input aria-label="Название новой группы" value={groupName} onChange={e=>setGroupName(e.target.value)} placeholder="Например, Локации"/><button disabled={saving||!groupName.trim()}>Добавить</button></div></form>
    </aside></section>
  </main>;
}

function ProducerWorkspace({user,data,onExit}){
  const [screen,setScreen]=useState(()=>producerInitialScreen());
  const [toastMessage,setToastMessage]=useState("");
  const [refreshKey,setRefreshKey]=useState(0);
  useEffect(()=>{const update=()=>setScreen(producerInitialScreen());window.addEventListener("hashchange",update);return()=>window.removeEventListener("hashchange",update);},[]);
  function go(type,id){
    const staticSection=["dashboard","projects","calendar","history"].includes(type);
    const next={type,id:staticSection?"":id};
    setScreen(next);
    window.location.hash=type==="dashboard"?"producer":staticSection?`producer/${type}`:`producer/${type}/${encodeURIComponent(id)}`;
    window.scrollTo(0,0);
  }
  function toast(message){setToastMessage(message);setRefreshKey(value=>value+1);window.clearTimeout(ProducerWorkspace.toastTimer);ProducerWorkspace.toastTimer=window.setTimeout(()=>setToastMessage(""),2600);}
  return <ProducerShell user={user} onHome={()=>go("dashboard")} onExit={onExit} screen={screen} go={go}>
    {screen.type==="dashboard"&&<ProducerDashboard go={go} refreshKey={refreshKey} user={user}/>}
    {screen.type==="projects"&&<ProducerProjectsPage go={go} refreshKey={refreshKey}/>}
    {screen.type==="calendar"&&<ProducerCalendarPage go={go} refreshKey={refreshKey}/>}
    {screen.type==="history"&&<ProducerHistoryPage refreshKey={refreshKey}/>}
    {screen.type==="project"&&<ProducerProjectMap projectId={screen.id} people={data.people||[]} go={go} toast={toast}/>} 
    {screen.type==="block"&&<ProducerBlockPage blockId={screen.id} go={go} toast={toast}/>} 
    <ProducerToast message={toastMessage}/>
  </ProducerShell>;
}
