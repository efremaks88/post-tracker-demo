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

function producerInitialScreen(){
  const match=String(window.location.hash||"").match(/^#producer(?:\/(project|block)\/([^/]+))?/);
  return match&&match[1]?{type:match[1],id:decodeURIComponent(match[2])}:{type:"dashboard",id:""};
}

function ProducerToast({message}){
  if(!message)return null;
  return <div className="producer-toast" role="status">✓ {message}</div>;
}

function ProducerProgress({done,total}){
  const percent=total?Math.round(done*100/total):0;
  return <div className="producer-progress"><span style={{width:percent+"%"}}/><b>{percent}%</b></div>;
}

function ProducerShell({user,onExit,children,onHome}){
  return <div className="producer-shell">
    <header className="producer-header">
      <button className="producer-brand" onClick={onHome}>
        <span className="producer-brand-mark">ПТ</span>
        <span><strong>ПОСТ ТРЕКЕР</strong><small>Продюсерская · {RUNTIME.label||"рабочая версия"}</small></span>
      </button>
      <nav className="producer-space-switch">
        <button className="active">Продюсерская</button>
        <button onClick={onExit}>Постпродакшн</button>
      </nav>
      <div className="producer-user"><span>{user.display_name}</span><b>{user.role}</b></div>
    </header>
    {children}
  </div>;
}

function ProducerDashboard({go,refreshKey}){
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  useEffect(()=>{let alive=true;setError("");producerRequest("/api/producer/dashboard").then(data=>alive&&setResult(data)).catch(e=>alive&&setError(e.message));return()=>{alive=false;};},[refreshKey]);
  if(error)return <main className="producer-main"><div className="producer-error">{error}</div></main>;
  if(!result)return <main className="producer-main"><div className="producer-loading">Загружаю продюсерскую…</div></main>;
  const todayTasks=result.myTasks||[];
  return <main className="producer-main">
    <section className="producer-welcome">
      <div><span className="producer-eyebrow">РАБОЧИЙ СТОЛ</span><h1>Проекты в работе</h1><p>Главное по проектам, задачам и срокам на одном экране.</p></div>
      <div className="producer-today"><small>Сегодня</small><strong>{new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}</strong></div>
    </section>
    <section className="producer-project-grid">
      {result.projects.map(project=><button className="producer-project-card" key={project.id} onClick={()=>go("project",project.id)} style={{"--project-color":project.color}}>
        <span className="producer-project-abbr">{project.abbr||project.name.slice(0,2)}</span>
        <span className="producer-project-copy"><small>{project.status||"в работе"}</small><strong>{project.name}</strong><em>{project.description||"Проект без описания"}</em></span>
        <span className="producer-project-stats"><b>{project.completedTasks}/{project.totalTasks}</b><small>задач готово</small></span>
        {project.warningCount>0&&<span className="producer-warning-badge">! {project.warningCount}</span>}
        <ProducerProgress done={project.completedTasks} total={project.totalTasks}/>
        <span className="producer-card-arrow">Открыть карту →</span>
      </button>)}
    </section>
    <section className="producer-dashboard-grid">
      <ProducerDashboardList title="Мои задачи сегодня" icon="✓" empty="На сегодня задач нет" rows={todayTasks} onOpen={item=>go("block",item.blockId)}/>
      <ProducerDashboardList title="Ближайшие сроки" icon="◷" empty="Ближайших сроков нет" rows={result.deadlines} onOpen={item=>go("block",item.blockId)}/>
      <ProducerDashboardList title="Требует внимания" icon="!" danger empty="Просроченных задач нет" rows={result.attention} onOpen={item=>go("block",item.blockId)}/>
    </section>
  </main>;
}

function ProducerDashboardList({title,icon,empty,rows,onOpen,danger}){
  return <article className={"producer-list-card"+(danger?" danger":"")}>
    <h2><span>{icon}</span>{title}<b>{rows.length}</b></h2>
    <div className="producer-list-body">{rows.length?rows.slice(0,6).map(item=><button key={item.id} onClick={()=>onOpen(item)}>
      <i style={{background:item.projectColor}}/><span><strong>{item.title}</strong><small>{item.projectName} · {item.blockName}</small></span><time>{producerDate(item.deadline)}</time>
    </button>):<p>{empty}</p>}</div>
  </article>;
}

function ProducerBlockNode({block,onOpen}){
  const statusLabel={done:"Готово",active:"В работе",planned:"Запланировано",paused:"Пауза"}[block.status]||block.status;
  return <button className={"producer-map-node "+block.status} onClick={()=>onOpen(block.id)}>
    <span className="producer-node-status">{statusLabel}</span>
    <strong>{block.name}</strong>
    <small>{block.ownerName||"Ответственный не указан"}</small>
    {block.warningCount>0&&<span className="producer-node-warning">! {block.warningCount} требует внимания</span>}
    <div><ProducerProgress done={block.completedTasks} total={block.totalTasks}/><time>{producerDate(block.deadline)}</time></div>
  </button>;
}

function ProducerProjectMap({projectId,people,go,toast}){
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  const [showCreate,setShowCreate]=useState(false);
  const [saving,setSaving]=useState(false);
  const [form,setForm]=useState({name:"",description:"",seriesId:"",ownerPersonId:people[0]?.id||"",startDate:"",deadline:"",status:"planned"});
  const load=()=>producerRequest("/api/producer/projects/"+encodeURIComponent(projectId)).then(setResult).catch(e=>setError(e.message));
  useEffect(()=>{load();},[projectId]);
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
      <button className="producer-primary" onClick={()=>setShowCreate(true)}>＋ Новый блок</button>
    </section>
    <section className="producer-map-section">
      <div className="producer-map-title"><div><small>ОБЩАЯ ЛИНИЯ</small><h2>Проект целиком</h2></div><span>{common.length} блоков</span></div>
      <div className="producer-map-track">{common.length?common.map((block,index)=><React.Fragment key={block.id}><ProducerBlockNode block={block} onOpen={id=>go("block",id)}/>{index<common.length-1&&<i className="producer-map-connector"/>}</React.Fragment>):<div className="producer-empty-map">Добавьте первый общий блок проекта</div>}</div>
    </section>
    <section className="producer-series-map">
      <div className="producer-map-title"><div><small>СЕРИЙНЫЕ ВЕТКИ</small><h2>Работа по сериям</h2></div></div>
      {result.series.map(series=>{const blocks=result.blocks.filter(block=>block.seriesId===series.id);return <div className="producer-series-row" key={series.id}>
        <div className="producer-series-label"><span>{String(series.order||1).padStart(2,"0")}</span><strong>{series.name}</strong></div>
        <div className="producer-map-track">{blocks.length?blocks.map((block,index)=><React.Fragment key={block.id}><ProducerBlockNode block={block} onOpen={id=>go("block",id)}/>{index<blocks.length-1&&<i className="producer-map-connector"/>}</React.Fragment>):<div className="producer-empty-map compact">Блоков пока нет</div>}</div>
      </div>})}
    </section>
    {showCreate&&<div className="producer-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCreate(false);}}><form className="producer-modal" onSubmit={createBlock}>
      <div className="producer-modal-head"><div><small>НОВЫЙ ЭТАП</small><h2>Создать блок</h2></div><button type="button" onClick={()=>setShowCreate(false)}>×</button></div>
      <label>Название<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Например, Препродакшн" required/></label>
      <label>Короткое описание<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Что должно быть сделано в этом блоке"/></label>
      <div className="producer-form-row"><label>Серия<select value={form.seriesId} onChange={e=>setForm({...form,seriesId:e.target.value})}><option value="">Общий блок проекта</option>{result.series.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Ответственный<select value={form.ownerPersonId} onChange={e=>setForm({...form,ownerPersonId:e.target.value})} required><option value="">Выберите</option>{people.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
      <div className="producer-form-row"><label>Начало<input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label><label>Срок<input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/></label></div>
      <label>Статус<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="planned">Запланировано</option><option value="active">В работе</option><option value="paused">Пауза</option><option value="done">Готово</option></select></label>
      {error&&<div className="producer-inline-error">{error}</div>}
      <div className="producer-modal-actions"><button type="button" onClick={()=>setShowCreate(false)}>Отмена</button><button className="producer-primary" disabled={saving}>{saving?"Сохраняю…":"Создать блок"}</button></div>
    </form></div>}
  </main>;
}

function ProducerTaskRow({task,people,groups,onChange}){
  const [busy,setBusy]=useState(false);
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState({title:task.title,groupId:task.groupId||"",assigneePersonId:task.assigneePersonId||"",responsiblePersonId:task.responsiblePersonId||"",deadline:task.deadline||""});
  useEffect(()=>{if(!editing)setDraft({title:task.title,groupId:task.groupId||"",assigneePersonId:task.assigneePersonId||"",responsiblePersonId:task.responsiblePersonId||"",deadline:task.deadline||""});},[task.title,task.groupId,task.assigneePersonId,task.responsiblePersonId,task.deadline,editing]);
  async function update(patch){setBusy(true);try{await onChange(task.id,patch);}catch(error){}finally{setBusy(false);}}
  async function save(event){event.preventDefault();setBusy(true);try{await onChange(task.id,{...draft,groupId:draft.groupId||null,responsiblePersonId:draft.responsiblePersonId||null,deadline:draft.deadline||null});setEditing(false);}catch(error){}finally{setBusy(false);}}
  return <div className={"producer-task-item"+(task.completed?" complete":"")+(busy?" busy":"")}>
    <div className="producer-task-row">
      <label className="producer-check" title={task.completed?"Вернуть в работу":"Отметить выполненной"}><input aria-label={task.completed?"Вернуть задачу в работу":"Выполнить задачу"} type="checkbox" checked={task.completed} onChange={e=>update({completed:e.target.checked})}/><span>✓</span></label>
      <button className="producer-task-copy" onClick={()=>setEditing(value=>!value)}><strong>{task.title}</strong><small>{task.responsibleName?"Ответственный: "+task.responsibleName:"Без отдельного ответственного"}</small></button>
      <select aria-label={"Исполнитель задачи "+task.title} value={task.assigneePersonId||""} onChange={e=>update({assigneePersonId:e.target.value})}>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select>
      <time>{producerDate(task.deadline)}</time>
      <button className="producer-edit-task" onClick={()=>setEditing(value=>!value)} aria-label={"Изменить задачу "+task.title}>{editing?"Скрыть":"Изменить"}</button>
    </div>
    {editing&&<form className="producer-task-editor" onSubmit={save}>
      <label>Название<input autoFocus value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} required/></label>
      <label>Исполнитель<select value={draft.assigneePersonId} onChange={e=>setDraft({...draft,assigneePersonId:e.target.value})} required>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      <label>Ответственный<select value={draft.responsiblePersonId} onChange={e=>setDraft({...draft,responsiblePersonId:e.target.value})}><option value="">Не указан</option>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      <label>Группа<select value={draft.groupId} onChange={e=>setDraft({...draft,groupId:e.target.value})}><option value="">Без группы</option>{groups.map(group=><option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
      <label>Срок<input type="date" value={draft.deadline} onChange={e=>setDraft({...draft,deadline:e.target.value})}/></label>
      <div className="producer-task-editor-actions"><button type="button" onClick={()=>setEditing(false)}>Отмена</button><button className="producer-primary" disabled={busy}>Сохранить</button></div>
    </form>}
  </div>;
}

function ProducerQuickTask({groupId,people,onCreate}){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [title,setTitle]=useState("");
  const [assignee,setAssignee]=useState(people[0]?.id||"");
  async function submit(event){event.preventDefault();if(!title.trim()||!assignee)return;setBusy(true);try{await onCreate({title,groupId:groupId||null,assigneePersonId:assignee});setTitle("");setOpen(false);}catch(error){}finally{setBusy(false);}}
  if(!open)return <button className="producer-quick-task-open" onClick={()=>setOpen(true)}>＋ Добавить задачу</button>;
  return <form className="producer-quick-task" onSubmit={submit}>
    <input autoFocus aria-label="Название новой задачи" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Что нужно сделать?" required/>
    <select aria-label="Исполнитель новой задачи" value={assignee} onChange={e=>setAssignee(e.target.value)} required><option value="">Исполнитель</option>{people.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select>
    <button className="producer-primary" disabled={busy}>{busy?"…":"Добавить"}</button><button type="button" onClick={()=>{setOpen(false);setTitle("");}}>Отмена</button>
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
    <div className="producer-form-row"><label>Начало<input type="date" value={draft.startDate} onChange={e=>setDraft({...draft,startDate:e.target.value})}/></label><label>Срок<input type="date" value={draft.deadline} onChange={e=>setDraft({...draft,deadline:e.target.value})}/></label></div>
    <label>Статус<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option value="planned">Запланировано</option><option value="active">В работе</option><option value="paused">Пауза</option><option value="done">Готово</option></select></label>
    <button className="producer-primary" disabled={busy}>{busy?"Сохраняю…":"Сохранить параметры"}</button>
  </form></details>;
}

function ProducerWarnings({warnings}){
  return <section className={"producer-warnings"+(warnings.length?" has-items":" clear")}>
    <div className="producer-warnings-head"><div><span className="producer-eyebrow">КОНТРОЛЬ</span><h2>Предупреждения</h2></div><b>{warnings.length||"✓"}</b></div>
    {warnings.length?<div className="producer-warning-list">{warnings.map(item=><article className={item.severity} key={item.id}>
      <span>!</span><div><strong>{item.title}</strong><p>{item.message}</p></div><time>{producerDate(item.dueDate)}</time>
    </article>)}</div>:<p>Критичных препятствий по срокам и согласованиям нет.</p>}
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
  return <article className={"producer-approval "+status}>
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
      <div className="producer-form-row"><label>Связанная задача<select value={draft.taskId} onChange={e=>setDraft({...draft,taskId:e.target.value})}><option value="">Весь блок</option>{tasks.map(task=><option key={task.id} value={task.id}>{task.title}</option>)}</select></label><label>Срок решения<input type="date" value={draft.dueDate} onChange={e=>setDraft({...draft,dueDate:e.target.value})}/></label></div>
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
  if(!result)return <main className="producer-main">{error?<div className="producer-error">{error}</div>:<div className="producer-loading">Открываю блок…</div>}</main>;
  const {block,project,series,seriesOptions,groups,tasks,approvals=[],warnings=[],people,history,permissions={}}=result;
  const ungrouped=tasks.filter(task=>!task.groupId);
  return <main className="producer-main producer-block-page">
    <div className="producer-breadcrumb"><button onClick={()=>go("dashboard")}>Все проекты</button><span>/</span><button onClick={()=>go("project",project.id)}>{project.name}</button><span>/</span><b>{block.name}</b></div>
    <section className="producer-block-hero" style={{"--project-color":project.color}}>
      <div><span className="producer-eyebrow">{series?series.name:"ОБЩИЙ БЛОК"}</span><h1>{block.name}</h1><p>{block.description||"Описание можно добавить позже."}</p></div>
      <div className="producer-block-meta"><span><small>Ответственный</small><strong>{block.ownerName||"Не назначен"}</strong></span><span><small>Период</small><strong>{block.startDate?producerDate(block.startDate)+" — ":""}{producerDate(block.deadline)}</strong></span><span><small>Готовность</small><ProducerProgress done={block.completedTasks} total={block.totalTasks}/></span></div>
    </section>
    {error&&<div className="producer-inline-error">{error}</div>}
    <section className="producer-block-layout"><div className="producer-task-area">
      <ProducerWarnings warnings={warnings}/>
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
    const next=type==="dashboard"?{type:"dashboard",id:""}:{type,id};
    setScreen(next);
    window.location.hash=type==="dashboard"?"producer":`producer/${type}/${encodeURIComponent(id)}`;
    window.scrollTo(0,0);
  }
  function toast(message){setToastMessage(message);setRefreshKey(value=>value+1);window.clearTimeout(ProducerWorkspace.toastTimer);ProducerWorkspace.toastTimer=window.setTimeout(()=>setToastMessage(""),2600);}
  return <ProducerShell user={user} onHome={()=>go("dashboard")} onExit={onExit}>
    {screen.type==="dashboard"&&<ProducerDashboard go={go} refreshKey={refreshKey}/>} 
    {screen.type==="project"&&<ProducerProjectMap projectId={screen.id} people={data.people||[]} go={go} toast={toast}/>} 
    {screen.type==="block"&&<ProducerBlockPage blockId={screen.id} go={go} toast={toast}/>} 
    <ProducerToast message={toastMessage}/>
  </ProducerShell>;
}
