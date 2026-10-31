function GanttView({data,onUpdate,onBatchUpdate,onSeriesSelect,startDay,onLog,canEdit,canEditOldTasks,canEditProjectById}){
  const {sorted:stages,stageMap,groupMap}=useContext(StagesCtx);
  const [weekOffset,setWeekOffset]=useState(()=>{
    if(startDay){
      const d=parseDate(startDay); if(!d) return 0;
      const today=new Date(); const todayDay=today.getDay()||7;
      const mon=new Date(today); mon.setDate(today.getDate()-todayDay+1); mon.setHours(0,0,0,0);
      return Math.floor((d-mon)/(7*24*60*60*1000));
    }
    return parseInt(sessionStorage.getItem("ganttWeek")||"0")||0;
  });
  const [taskModal,setTaskModal]=useState(null);
  const [collapsedProjects,setCollapsedProjects]=useState(new Set());
  const [expandedSeries,setExpandedSeries]=useState(new Set());
  const [hoverTask,setHoverTask]=useState(null);
  const [projectOrder,setProjectOrder]=useState(()=>data.ganttOrder||null);
  const [ganttFilter,setGanttFilter]=useState(()=>sessionStorage.getItem("ganttFocusProject")||"");
  const [shiftTailMode,setShiftTailMode]=useState(false);
  const [selectedTasks,setSelectedTasks]=useState(new Set());
  const [taskContextMenu,setTaskContextMenu]=useState(null);
  const [assignPersonModal,setAssignPersonModal]=useState(null);
  const [lassoRange,setLassoRange]=useState(null);
  const lassoRef=useRef(null);
  const dragRef=useRef(null);
  const shiftPressedRef=useRef(false);
  const projDragRef=useRef(null);
  const canWriteProject=projectId=>!canEditProjectById||canEditProjectById(projectId);

  useEffect(()=>{sessionStorage.setItem("ganttWeek",String(weekOffset));},[weekOffset]);
  useEffect(()=>{sessionStorage.removeItem("ganttFocusProject");},[]);

  useEffect(()=>{
    function h(e){setTaskModal(e.detail||{});}
    window.addEventListener("gantt-new-task",h);
    return ()=>window.removeEventListener("gantt-new-task",h);
  },[]);
  useEffect(()=>{
    function h(e){if(e.key==="Escape"){ setSelectedTasks(new Set()); setTaskContextMenu(null); setAssignPersonModal(null); }if((e.key==="Delete"||e.key==="Backspace")&&selectedTasks.size){e.preventDefault();deleteSelectedTasks();}}
    document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[selectedTasks]);
  useEffect(()=>{
    function close(){setTaskContextMenu(null);}
    window.addEventListener("click",close);
    window.addEventListener("scroll",close,true);
    return()=>{window.removeEventListener("click",close);window.removeEventListener("scroll",close,true);};
  },[]);
  useEffect(()=>{
    function down(e){if(e.key==="Shift") shiftPressedRef.current=true;}
    function up(e){if(e.key==="Shift") shiftPressedRef.current=false;}
    window.addEventListener("keydown",down);
    window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};
  },[]);

  const refMonday=useMemo(()=>{
    const d=new Date(); const day=d.getDay()||7;
    d.setDate(d.getDate()-day+1+weekOffset*7);
    d.setHours(0,0,0,0); return d;
  },[weekOffset]);

  const days=useMemo(()=>{
    const arr=[];
    for(let i=0;i<28;i++){
      const d=new Date(refMonday); d.setDate(refMonday.getDate()+i);
      arr.push(formatDate(d));
    }
    return arr;
  },[refMonday]);

  const todayStr=formatDate(new Date());

  const groupColorMap=useMemo(()=>{
    const m={};
    [...stages].sort((a,b)=>(a.order||0)-(b.order||0)).forEach(s=>{
      if(s.groupId&&!m[s.groupId]) m[s.groupId]=s.color;
    });
    return m;
  },[stages]);

  const orderedProjects=useMemo(()=>{
    const active=data.projects.filter(p=>p.status!=="архив");
    if(!projectOrder) return active;
    return [
      ...projectOrder.map(id=>active.find(p=>p.id===id)).filter(Boolean),
      ...active.filter(p=>!projectOrder.includes(p.id))
    ];
  },[data.projects,projectOrder]);

  const displayProjects=useMemo(()=>
    ganttFilter?orderedProjects.filter(p=>p.id===ganttFilter):orderedProjects
  ,[orderedProjects,ganttFilter]);

  function toggleCollapse(projId){
    setCollapsedProjects(prev=>{const n=new Set(prev);n.has(projId)?n.delete(projId):n.add(projId);return n;});
  }
  function toggleExpandSer(key){
    setExpandedSeries(prev=>{const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n;});
  }
  function seriesKeysForProject(proj){
    const projSeries=(data.series||[]).filter(s=>s.projectId===proj.id).map(s=>s.name);
    const fromTasks=[...new Set((data.tasks||[]).filter(t=>t.project===proj.id).map(t=>t.series))].filter(Boolean);
    return [...new Set([...projSeries,...fromTasks])].map(name=>`${proj.id}|${name}`);
  }
  function expandProjectFully(proj){
    setCollapsedProjects(prev=>{const n=new Set(prev);n.delete(proj.id);return n;});
    setExpandedSeries(prev=>{const n=new Set(prev);seriesKeysForProject(proj).forEach(k=>n.add(k));return n;});
  }
  function expandAllGantt(){
    setCollapsedProjects(new Set());
    setExpandedSeries(new Set(displayProjects.flatMap(p=>seriesKeysForProject(p))));
  }

  useEffect(()=>{
    function onUp(){
      if(!lassoRef.current) return;
      const {projId,serName,startDayIdx,endDayIdx}=lassoRef.current;
      lassoRef.current=null; setLassoRange(null);
      if(startDayIdx===endDayIdx) return;
      const d1=Math.min(startDayIdx,endDayIdx); const d2=Math.max(startDayIdx,endDayIdx);
      const sel=new Set(data.tasks.filter(t=>{
        const idx=days.indexOf(t.day);
        return t.project===projId&&t.series===serName&&idx>=d1&&idx<=d2;
      }).map(t=>t.id));
      setSelectedTasks(sel);
    }
    document.addEventListener("mouseup",onUp);
    return()=>document.removeEventListener("mouseup",onUp);
  },[data.tasks,days]);

  useEffect(()=>{
    function onKey(e){
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT") return;
      if(taskModal!==null) return;
      if(e.key==="ArrowRight") setWeekOffset(w=>w+1);
      else if(e.key==="ArrowLeft") setWeekOffset(w=>w-1);
      else if(e.key==="Delete"||e.key==="Backspace"){
        if(selectedTasks.size>0) deleteSelectedTasks();
      }
    }
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[data.tasks,taskModal,selectedTasks]);

  function handleProjDragStart(e,projId){
    projDragRef.current=projId;
    e.dataTransfer.effectAllowed="move";
    e.dataTransfer.setData("text/plain",projId);
  }
  function handleProjDrop(e,targetId){
    e.preventDefault(); e.stopPropagation();
    const fromId=projDragRef.current; projDragRef.current=null;
    if(!fromId||fromId===targetId) return;
    const ids=orderedProjects.map(p=>p.id);
    const fi=ids.indexOf(fromId); const ti=ids.indexOf(targetId);
    if(fi<0||ti<0) return;
    const newIds=[...ids];
    newIds.splice(fi,1); newIds.splice(ti,0,fromId);
    setProjectOrder(newIds);
    onUpdate("ganttOrder",newIds);
  }

  // Ручной статус сбрасывается только сегодняшней задачей из более поздней группы.
  function dropManualIfBeaten(seriesId, newTasks){
    if(!seriesId) return null;
    const ser=(data.series||[]).find(s=>s.id===seriesId);
    if(!ser?.manualStatus) return null;
    const mg=groupMap[ser.manualStatus];
    if(!mg) return null;
    const todayStr=formatDate(new Date());
    const todayTasks=(newTasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.seriesId===seriesId&&t.day===todayStr);
    if(!todayTasks.length) return null;
    const maxOrder=Math.max(...todayTasks.map(t=>{
      const g=stageMap[t.status]?.groupId?groupMap[stageMap[t.status].groupId]:null;
      return g?.order||0;
    }));
    if(maxOrder>mg.order)
      return (data.series||[]).map(s=>s.id===seriesId?{...s,manualStatus:""}:s);
    return null;
  }
  function saveWithSeries(newTasks, seriesId){
    const ns=dropManualIfBeaten(seriesId,newTasks);
    if(ns) onBatchUpdate({series:ns,tasks:newTasks});
    else onUpdate("tasks",newTasks);
  }
  function touchTask(task){
    const ts=Date.now();
    return {...task,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""};
  }
  function oldTaskChangeBlocked(){
    return false;
  }
  function taskPersonName(task){return data.people?.find(p=>String(p.id)===String(task?.person))?.name||task?.person||"";}
  function taskPersonAbsent(task){const name=taskPersonName(task);return !!(name&&task?.day&&absencesForPersonDay(data.personAbsences||[],data.people||[],name,task.day).length);}
  function warnAbsentTask(task){const name=taskPersonName(task);const abs=absencesForPersonDay(data.personAbsences||[],data.people||[],name,task.day)[0];const ai=abs?absenceTypeInfo(abs.type):null;alert(`${name} уже отмечен как ${ai?.label||"отсутствует"} на ${task.day}. Сначала уберите отсутствие или выберите другого исполнителя.`);}
  function blockTasksWithAbsence(list){const bad=(list||[]).find(taskPersonAbsent);if(bad){warnAbsentTask(bad);return true;}return false;}
  function saveTaskList(newTasks, seriesId, changedTasks, sourceTasks=[]){
    const changedList=changedTasks||[];
    const blockedProjectChange=changedList.some(t=>{const old=(data.tasks||[]).find(x=>String(x.id)===String(t.id));return !canWriteProject(t.project)||(old&&old.project!==t.project&&!canWriteProject(old.project));});
    if(blockedProjectChange) return;
    if(blockTasksWithAbsence(changedList)) return;
    if(oldTaskChangeBlocked(changedTasks,sourceTasks)) return;
    saveWithSeries(newTasks,seriesId);
    (changedTasks||[]).forEach(t=>incrSave("task",t));
  }

  function saveTask(task){
    if(!canWriteProject(task.project)) return;
    if(task.id){const old=data.tasks.find(t=>t.id===task.id);if(old&&!canWriteProject(old.project)) return;}
    let tasks;
    let savedTask;
    if(task._cascadeAll){
      const clean={...task}; delete clean._cascadeAll;
      tasks=task._cascadeAll.map(t=>t.id===clean.id?clean:t);
      savedTask=tasks.find(t=>t.id===clean.id);
      if(!savedTask){
        savedTask={...clean,id:genTaskId(data.tasks)};
        tasks.push(savedTask);
      }
    } else {
      tasks=[...data.tasks];
      const exists=task.id&&tasks.find(t=>t.id===task.id);
      savedTask=exists?task:{...task,id:genTaskId(data.tasks)};
      if(exists) tasks=tasks.map(t=>t.id===savedTask.id?savedTask:t);
      else tasks.push(savedTask);
    }
    if(blockTasksWithAbsence([savedTask])) return;
    if(oldTaskChangeBlocked([savedTask],[task])) return;
    const now=new Date().toISOString();
    const ts=Date.now();
    savedTask={...savedTask,updatedAt:now,_updatedAt:ts,updatedBy:""};
    tasks=tasks.map(t=>t.id===savedTask.id?savedTask:t);
    const stageLabel=data.stages?.find(s=>s.id===savedTask.status)?.label||savedTask.status||"";
    const personName=data.people?.find(p=>p.id===savedTask.person)?.name||savedTask.person||"";
    const isNew=!(task.id&&data.tasks.find(t=>t.id===task.id));
    onLog?.(`${isNew?"Задача":"Изменена задача"}: ${stageLabel} · ${savedTask.series||""} / ${personName} — ${savedTask.day}`);
    saveWithSeries(tasks, savedTask.seriesId);
    setTaskModal(null);
    incrSave("task", savedTask);
  }
  function deleteTask(id){
    const t=data.tasks.find(x=>x.id===id);
    if(t&&!canWriteProject(t.project)) return;
    if(t){
      const stageLabel=data.stages?.find(s=>s.id===t.status)?.label||t.status||"";
      const personName=data.people?.find(p=>p.id===t.person)?.name||t.person||"";
      onLog?.(`Удалена задача: ${stageLabel} · ${t.series||""} / ${personName} — ${t.day}`);
    }
    const ts=Date.now();
    if(oldTaskChangeBlocked([],t?[t]:[])) return;
    onUpdate("tasks",data.tasks.map(t=>t.id===id?{...t,deleted:true,_updatedAt:ts}:t));
    setTaskModal(null);
    incrDelete("task", id);
  }

  function taskById(id){
    return (data.tasks||[]).find(t=>String(t.id)===String(id));
  }
  function writableTaskIds(ids){
    return [...new Set(ids||[])].filter(id=>{
      const t=taskById(id);
      return t&&!t.deleted&&canWriteProject(t.project);
    });
  }
  function openTaskContext(e, ids){
    e.preventDefault();
    e.stopPropagation();
    const raw=[...new Set(ids||[])].filter(Boolean);
    const useSelected=selectedTasks.size>1&&raw.some(id=>selectedTasks.has(id));
    const allowed=writableTaskIds(useSelected?[...selectedTasks]:raw);
    if(!allowed.length) return;
    setSelectedTasks(new Set(allowed));
    const menuW=230, menuH=150;
    setTaskContextMenu({
      x:Math.min(e.clientX, Math.max(8, window.innerWidth-menuW-8)),
      y:Math.min(e.clientY, Math.max(8, window.innerHeight-menuH-8)),
      ids:allowed
    });
    setHoverTask(null);
  }
  function closeTaskContext(){
    setTaskContextMenu(null);
  }
  function deleteTasksBulk(ids, requireConfirm=true){
    const allowed=writableTaskIds(ids);
    if(!allowed.length) return;
    if(requireConfirm&&allowed.length>1&&!window.confirm(`Удалить ${allowed.length} смен?`)) return;
    const idSet=new Set(allowed.map(String));
    const ts=Date.now();
    const source=(data.tasks||[]).filter(t=>idSet.has(String(t.id)));
    if(oldTaskChangeBlocked([],source)) return;
    source.forEach(t=>{
      const stageLabel=data.stages?.find(s=>s.id===t.status)?.label||t.status||"";
      const personName=data.people?.find(p=>p.id===t.person)?.name||t.person||"";
      onLog?.(`Удалена задача: ${stageLabel} · ${t.series||""} / ${personName} — ${t.day}`);
      incrDelete("task", t.id);
    });
    onUpdate("tasks",data.tasks.map(t=>idSet.has(String(t.id))?{...t,deleted:true,_updatedAt:ts}:t));
    setSelectedTasks(new Set());
    closeTaskContext();
  }
  function clearTaskPeopleBulk(ids){
    const allowed=writableTaskIds(ids);
    if(!allowed.length) return;
    if(allowed.length>1&&!window.confirm(`Убрать исполнителей у ${allowed.length} смен?`)) return;
    const idSet=new Set(allowed.map(String));
    const originals=(data.tasks||[]).filter(t=>idSet.has(String(t.id)));
    const changed=[];
    const tasks=data.tasks.map(t=>{
      if(!idSet.has(String(t.id))) return t;
      const nt=touchTask({...t,person:""});
      changed.push(nt);
      return nt;
    });
    saveTaskList(tasks,null,changed,originals);
    onLog?.(allowed.length===1?"Убран исполнитель со смены":`Убраны исполнители у ${allowed.length} смен`);
    setSelectedTasks(new Set());
    closeTaskContext();
  }
  function deleteSelectedTasks(){
    deleteTasksBulk([...selectedTasks],true);
  }
  function openAssignPeopleBulk(ids){const allowed=writableTaskIds(ids);if(!allowed.length)return;const source=(data.tasks||[]).filter(t=>allowed.map(String).includes(String(t.id)));let common=null;for(const t of source){const names=new Set(filterPeopleByStatus(data.people||[],t.status,stages).filter(p=>p.active!==false).map(p=>p.name));common=common===null?names:new Set([...common].filter(n=>names.has(n)));}const people=[...(common||new Set())].sort((a,b)=>String(a).localeCompare(String(b),"ru"));if(!people.length){alert("\u0414\u043b\u044f \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0441\u043c\u0435\u043d \u043d\u0435\u0442 \u043e\u0431\u0449\u0435\u0433\u043e \u0441\u043f\u0438\u0441\u043a\u0430 \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u0435\u0439. \u042d\u0442\u0430\u043f\u044b \u0442\u0440\u0435\u0431\u0443\u044e\u0442 \u0440\u0430\u0437\u043d\u044b\u0435 \u0440\u043e\u043b\u0438.");closeTaskContext();return;}setAssignPersonModal({ids:allowed,people,person:people[0]||""});closeTaskContext();}
  function assignPeopleBulk(ids,person){if(!person)return;const allowed=writableTaskIds(ids);if(!allowed.length)return;const idSet=new Set(allowed.map(String));const originals=(data.tasks||[]).filter(t=>idSet.has(String(t.id)));const ts=Date.now();const changed=[];const tasks=(data.tasks||[]).map(t=>{if(!idSet.has(String(t.id)))return t;const nt={...t,person,updatedAt:new Date(ts).toISOString(),_updatedAt:ts,updatedBy:""};changed.push(nt);return nt;});saveTaskList(tasks,null,changed,originals);onLog?.(allowed.length===1?"\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c: "+person:"\u041d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c \u0434\u043b\u044f "+allowed.length+" \u0441\u043c\u0435\u043d: "+person);setSelectedTasks(new Set());setAssignPersonModal(null);}

  function handleDrop(e,row,d){
    e.preventDefault();
    const drag=dragRef.current; if(!drag) return;
    if(!canWriteProject(row.projId)){dragRef.current=null;return;}
    const {task,copy,multiTaskIds,stretch}=drag; dragRef.current=null;
    if(task&&!copy&&!canWriteProject(task.project)) return;
    const ser=(data.series||[]).find(s=>s.projectId===row.projId&&s.name===row.series);
    const newSeriesId=ser?.id||null;
    // Template drop
    if(drag.template){
      const newTask=touchTask({
        id:genTaskId(data.tasks),project:row.projId,series:row.series,seriesId:newSeriesId,
        status:drag.status,day:d,from:10,to:19,person:"",note:"",autogenerated:false,unplanned:false,
      });
      saveTaskList([...data.tasks,newTask],newSeriesId,[newTask],[task]); return;
    }
    // Single copy (alt+drag one task)
    if(copy&&(!multiTaskIds||multiTaskIds.size<=1)){
      const newTask=touchTask({...task,id:genTaskId(data.tasks),day:d,project:row.projId,series:row.series,seriesId:newSeriesId});
      delete newTask._cascadeAll;
      saveTaskList([...data.tasks,newTask],newSeriesId,[newTask]); return;
    }
    const diff=Math.round((parseDate(d)-parseDate(task.day))/(1000*60*60*24));
    const stretchCopy=(stretch||e.shiftKey||shiftPressedRef.current)&&diff!==0;
    if(stretchCopy){
      const ids=multiTaskIds&&multiTaskIds.size?multiTaskIds:new Set([task.id]);
      const source=data.tasks.filter(t=>ids.has(t.id));
      const step=diff>0?1:-1;
      const used=[...data.tasks];
      const newTasks=[];
      for(let off=step; step>0?off<=diff:off>=diff; off+=step){
        source.forEach(t=>{
          if(!canWriteProject(t.project)) return;
          const nt=touchTask({...t,id:genTaskId(used),day:addDays(t.day,off),project:row.projId,series:row.series,seriesId:newSeriesId});
          delete nt._cascadeAll;
          used.push(nt);
          newTasks.push(nt);
        });
      }
      if(newTasks.length) saveTaskList([...data.tasks,...newTasks],newSeriesId,newTasks,source);
      setSelectedTasks(new Set());
      return;
    }
    // Multi-select drag (move or copy)
    if(multiTaskIds&&multiTaskIds.size>1){
      if(copy){
        const used=[...data.tasks];
        const newTasks=data.tasks.filter(t=>multiTaskIds.has(t.id)).map(t=>{
          const nt=touchTask({...t,id:genTaskId(used),day:addDays(t.day,diff),project:row.projId,series:row.series,seriesId:newSeriesId});
          used.push(nt);
          return nt;
        });
        saveTaskList([...data.tasks,...newTasks],newSeriesId,newTasks,data.tasks.filter(t=>multiTaskIds.has(t.id)));
      } else if(diff!==0||row.projId!==task.project||row.series!==task.series){
        const changed=[];
        const tasks=data.tasks.map(t=>{
          if(!multiTaskIds.has(t.id)) return t;
          const nt=touchTask({...t,day:addDays(t.day,diff),project:row.projId,series:row.series,seriesId:newSeriesId});
          changed.push(nt);
          return nt;
        });
        saveTaskList(tasks,newSeriesId,changed);
      }
      setSelectedTasks(new Set()); return;
    }
    if(d===task.day&&row.projId===task.project&&row.series===task.series) return;
    const taskDaySort=daySort(task.day);
    const hasTail=data.tasks.some(t=>
      t.project===task.project&&t.series===task.series&&daySort(t.day)>taskDaySort&&t.id!==task.id);
    const applyMove=(cascade)=>{
      const changed=[];
      const tasks=data.tasks.map(t=>{
        if(t.id===task.id){
          const nt=touchTask({...t,day:d,project:row.projId,series:row.series,seriesId:newSeriesId});
          changed.push(nt);
          return nt;
        }
        if(cascade&&t.project===task.project&&t.series===task.series&&daySort(t.day)>taskDaySort){
          const nt=touchTask({...t,day:addDays(t.day,diff)});
          changed.push(nt);
          return nt;
        }
        return t;
      });
      saveTaskList(tasks,newSeriesId,changed);
    };
    applyMove(hasTail&&diff!==0&&shiftTailMode);
  }

  const COL=78;

  function collapsedProjectDayItems(projectId,d){
    const dayTasks=(data.tasks||[]).filter(t=>!t.deleted&&!t.cancelled&&t.project===projectId&&t.day===d);
    const statuses=[...new Set(dayTasks.map(t=>t.status).filter(Boolean))];
    return {statuses:statuses.slice(0,5),count:dayTasks.length};
  }

  const monthSpans=useMemo(()=>{
    const spans=[];
    days.forEach(d=>{
      const pd=parseDate(d);
      const mk=`${pd.getFullYear()}-${pd.getMonth()}`;
      if(!spans.length||spans[spans.length-1].key!==mk)
        spans.push({key:mk,label:MONTHS[pd.getMonth()],count:1});
      else spans[spans.length-1].count++;
    });
    return spans;
  },[days]);

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
        <Btn variant="ghost" onClick={()=>setWeekOffset(w=>w-1)}>← Пред. неделя</Btn>
        <Btn variant="ghost" small onClick={()=>setWeekOffset(0)}>Сегодня</Btn>
        <Btn variant="ghost" onClick={()=>setWeekOffset(w=>w+1)}>След. неделя →</Btn>
        <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",
          background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"4px 10px",
          border:`1px solid ${shiftTailMode?"#f59e0b33":"#334155"}`,fontSize:12,userSelect:"none"}}>
          <input type="checkbox" checked={shiftTailMode}
            onChange={e=>setShiftTailMode(e.target.checked)} style={{accentColor:"#f59e0b"}}/>
          <span style={{color:shiftTailMode?"#f59e0b":"#64748b"}}>Сдвигать хвост</span>
        </label>
        {selectedTasks.size>0&&(
          <span style={{fontSize:12,color:"#60a5fa",background:"rgba(59,130,246,0.1)",
            borderRadius:10,padding:"4px 10px",border:"1px solid rgba(59,130,246,0.3)",cursor:"default"}}
            title="Esc — снять выделение">
            OK {selectedTasks.size} выбрано · Shift+перетащи = протянуть копии · Alt = копировать · Esc = снять
          </span>
        )}
        <select value={ganttFilter} onChange={e=>setGanttFilter(e.target.value)}
          style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",
            color:ganttFilter?"#e2e8f0":"#64748b",borderRadius:10,padding:"4px 8px",fontSize:12}}>
          <option value="">Все проекты</option>
          {orderedProjects.map(p=><option key={p.id} value={p.id}>{p.abbr||p.name}</option>)}
        </select>
        <Btn variant="ghost" small onClick={()=>{setCollapsedProjects(new Set(orderedProjects.map(p=>p.id)));setExpandedSeries(new Set());}}>Свернуть всё</Btn>
        <Btn variant="ghost" small onClick={expandAllGantt}>Развернуть всё</Btn>
        <div style={{flex:1}}/>
        <Btn variant="primary" onClick={()=>setTaskModal({})}>+ Задача</Btn>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"#475569",letterSpacing:1,flexShrink:0}}>ШАБЛОНЫ:</span>
        {GANTT_TEMPLATES.map(tmpl=>{
          const st=stageMap[tmpl.status];
          return (
            <div key={tmpl.status}
              draggable
              onDragStart={e=>{
                dragRef.current={template:true,status:tmpl.status};
                e.dataTransfer.effectAllowed="copy";
              }}
              onDragEnd={()=>{dragRef.current=null;}}
              title={`Перетащи на ячейку → создаст задачу "${tmpl.label}"`}
              style={{display:"inline-flex",alignItems:"center",padding:"3px 9px",
                borderRadius:5,cursor:"grab",userSelect:"none",fontSize:11,fontWeight:600,
                background:st?stageBg(st.color):"rgba(255,255,255,0.06)",
                border:`1px dashed ${st?st.color:"#475569"}`,
                color:st?st.color:"#94a3b8"}}>
              {tmpl.label}
            </div>
          );
        })}
      </div>

      <div style={{overflow:"auto",maxHeight:"calc(100vh - 220px)",border:"1px solid #1e293b",borderRadius:12}}
        onMouseLeave={()=>setHoverTask(null)}>
        <div style={{minWidth:200+COL*28}}>
          {/* Шапка */}
          <div style={{position:"sticky",top:0,zIndex:12}}>
            <div style={{display:"flex"}}>
              <div style={{width:200,flexShrink:0,height:18,position:"sticky",left:0,zIndex:21,
                background:"#060d1a",borderBottom:"1px solid #0f172a",borderRight:"1px solid #334155"}}/>
              {monthSpans.map((span,si)=>(
                <div key={span.key} style={{width:COL*span.count,flexShrink:0,height:18,
                  display:"flex",alignItems:"center",paddingLeft:6,background:"#060d1a",
                  borderLeft:si===0?"none":"2px solid #334155",borderBottom:"1px solid #0f172a"}}>
                  <span style={{fontSize:9,color:"#475569",letterSpacing:1,textTransform:"uppercase"}}>
                    {span.label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{display:"flex"}}>
              <div style={{width:200,flexShrink:0,height:44,position:"sticky",left:0,zIndex:20,
                background:"#0f172a",borderBottom:"1px solid #334155",borderRight:"1px solid #334155"}}/>
              {days.map(d=>{
                const pd=parseDate(d); const isToday=d===todayStr;
                const isMon=pd&&pd.getDay()===1; const isSun=pd&&pd.getDay()===0;
                return (
                  <div key={d} style={{width:COL,flexShrink:0,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",height:44,
                    background:isToday?"rgba(59,130,246,0.2)":isSun||isMon?"#1e293b":"#0f172a",
                    borderLeft:isMon?"2px solid #334155":"1px solid #1e293b",
                    borderBottom:"1px solid #334155"}}>
                    <span style={{fontSize:9,color:"#475569"}}>{WDAYS[pd?.getDay()||0]}</span>
                    <span style={{fontSize:11,fontWeight:isToday?700:400,color:isToday?"#60a5fa":"#64748b"}}>
                      {pd?pd.getDate():""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Строки */}
          {displayProjects.map((proj,pi)=>{
            const isCollapsed=collapsedProjects.has(proj.id);
            const projSeries=(data.series||[])
              .filter(s=>s.projectId===proj.id)
              .sort((a,b)=>(a.order||0)-(b.order||0));
            const fromTasks=[...new Set(data.tasks.filter(t=>t.project===proj.id).map(t=>t.series))]
              .filter(n=>!projSeries.find(s=>s.name===n)).sort();
            const allSeries=[...projSeries,...fromTasks.map(n=>({id:n,name:n}))];

            return (
              <React.Fragment key={proj.id}>
                {/* Заголовок проекта */}
                <div
                  draggable
                  onDragStart={e=>handleProjDragStart(e,proj.id)}
                  onDragOver={e=>{if(projDragRef.current&&projDragRef.current!==proj.id)e.preventDefault();}}
                  onDrop={e=>handleProjDrop(e,proj.id)}
                  onClick={e=>{if(e.detail>1)return;toggleCollapse(proj.id);}}
                  onDoubleClick={e=>{e.preventDefault();expandProjectFully(proj);}}
                  style={{display:"flex",height:isCollapsed?26:36,background:"#05101f",
                    cursor:"pointer",borderBottom:"1px solid #334155",userSelect:"none"}}>
                  <div style={{width:200,flexShrink:0,position:"sticky",left:0,zIndex:10,
                    display:"flex",alignItems:"center",padding:"0 10px",gap:6,
                    borderRight:"1px solid #475569",background:"#05101f"}}>
                    <span style={{fontSize:14,color:"#334155",cursor:"grab",flexShrink:0,lineHeight:1}}
                      onMouseDown={e=>e.stopPropagation()}>⠿</span>
                    <ProjectMark project={proj} size={9}/>
                    <span style={{fontWeight:700,fontSize:isCollapsed?11:12,color:"#94a3b8",flex:1,
                      overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                      {proj.name}
                    </span>
                    {isCollapsed&&<span style={{fontSize:9,color:"#475569",flexShrink:0,marginRight:2}}>
                      {allSeries.length} сер.
                    </span>}
                    <span style={{fontSize:9,color:"#475569",flexShrink:0}}>{isCollapsed?"▶":"▼"}</span>
                  </div>
                  {days.map(d=>{
                    const dayItems=collapsedProjectDayItems(proj.id,d);
                    return (
                      <div key={d} style={{width:COL,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",gap:2,overflow:"hidden"}}>
                        {dayItems.statuses.map(stId=>{
                          const st=stageMap[stId];
                          return <span key={stId} title={st?.label||stId} style={{width:6,height:6,borderRadius:2,background:st?.color||proj.color,opacity:0.9,display:"inline-block"}}/>;
                        })}
                        {dayItems.count>dayItems.statuses.length&&<span style={{fontSize:8,color:"#475569",lineHeight:1}}>+</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Серии */}
                {!isCollapsed&&allSeries.map((ser,si)=>{
                  const serKey=`${proj.id}|${ser.name}`;
                  const isExpanded=expandedSeries.has(serKey);
                  const rowH=isExpanded?90:52;
                  const seriesTasks=data.tasks.filter(t=>t.project===proj.id&&t.series===ser.name);
                  const isRealSer=!!(ser.projectId);
                  const isDelivered=!!(ser.delivered);

                  return (
                    <div key={serKey} style={{display:"flex",minHeight:rowH,height:"auto",
                      background:si%2===0?"#0a1220":"#060d1a",
                      borderBottom:"1px solid #1e293b",
                      opacity:isDelivered?0.5:1,alignItems:"stretch"}}>
                      {/* Метка серии */}
                      <div
                        onClick={()=>toggleExpandSer(serKey)}
                        onDoubleClick={()=>{if(isRealSer&&onSeriesSelect)onSeriesSelect(ser.id);}}
                        title={isRealSer?"Двойной клик — открыть карточку серии":""}
                        style={{width:200,flexShrink:0,position:"sticky",left:0,zIndex:5,
                          display:"flex",alignItems:"center",padding:"0 8px 0 22px",
                          borderRight:"1px solid #334155",cursor:"pointer",
                          background:si%2===0?"#0f172a":"#0a1220"}}>
                        <div style={{width:3,height:22,borderRadius:2,
                          background:isDelivered?"#22c55e":proj.color,
                          marginRight:8,flexShrink:0,opacity:0.55}}/>
                        <div style={{flex:1,overflow:"hidden"}}>
                          <div style={{fontSize:12,fontWeight:600,
                            color:isDelivered?"#475569":"#cbd5e1",
                            display:"flex",alignItems:"center",gap:4}}>
                            {ser.name}
                            {isDelivered&&<span style={{fontSize:9,color:"#22c55e"}}>OK</span>}
                            <span style={{fontSize:8,color:isExpanded?"#3b82f6":"#334155"}}>
                              {isExpanded?"▲":"▼"}
                            </span>
                          </div>
                          {isExpanded&&<div style={{fontSize:9,color:"#475569",marginTop:1}}>
                            {seriesTasks.length} задач · клик для свёртки
                          </div>}
                        </div>
                      </div>

                      {/* Ячейки дней */}
                      {days.map((d,dIdx)=>{
                        const cellTasks=seriesTasks.filter(t=>t.day===d);
                        const isToday=d===todayStr;
                        const pd=parseDate(d); const isMon=pd?.getDay()===1;
                        const isInLasso=lassoRange&&
                          lassoRange.projId===proj.id&&lassoRange.serName===ser.name&&
                          dIdx>=lassoRange.minIdx&&dIdx<=lassoRange.maxIdx;
                        return (
                          <div key={d}
                            onClick={()=>{if(selectedTasks.size>0){setSelectedTasks(new Set());return;}}}
                            onDoubleClick={()=>{
                              if(!canWriteProject(proj.id)) return;
                              setTaskModal({project:proj.id,series:ser.name,day:d,_fixedProject:true});
                            }}
                            onMouseDown={e=>{
                              if(e.button!==0) return;
                              lassoRef.current={projId:proj.id,serName:ser.name,startDayIdx:dIdx,endDayIdx:dIdx};
                            }}
                            onMouseEnter={e=>{
                              if(lassoRef.current&&lassoRef.current.projId===proj.id&&lassoRef.current.serName===ser.name){
                                lassoRef.current.endDayIdx=dIdx;
                                const[a,b]=[lassoRef.current.startDayIdx,dIdx];
                                setLassoRange({projId:proj.id,serName:ser.name,minIdx:Math.min(a,b),maxIdx:Math.max(a,b)});
                              } else if(!dragRef.current){
                                e.currentTarget.style.background=isToday?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.03)";
                              }
                            }}
                            onMouseLeave={e=>{
                              if(!lassoRef.current)
                                e.currentTarget.style.background=isInLasso?"rgba(59,130,246,0.15)":(isToday?"rgba(59,130,246,0.06)":"transparent");
                            }}
                            onDragOver={e=>{if(!canWriteProject(proj.id)) return;e.preventDefault();
                              e.dataTransfer.dropEffect=(dragRef.current?.copy||dragRef.current?.template)?"copy":"move";}}
                            onDrop={e=>handleDrop(e,{projId:proj.id,series:ser.name},d)}
                            style={{width:COL,flexShrink:0,
                              borderLeft:isMon?"2px solid #334155":"1px solid #1e293b",
                              padding:2,display:"flex",flexDirection:"column",gap:1,
                              cursor:"pointer",overflow:"visible",
                              background:isInLasso?"rgba(59,130,246,0.18)":(isToday?"rgba(59,130,246,0.06)":"transparent"),
                              transition:"background 0.1s",userSelect:"none"}}>
                            {isRealSer&&getSeriesMilestoneEvents(ser,proj).filter(m=>m.date===d).map(m=>(
                              <div key={m.key} title={`${m.label}: ${m.date}`}
                                style={{background:m.color,borderRadius:2,
                                  color:"#000",fontSize:8,padding:"0 3px",
                                  textAlign:"center",fontWeight:800,flexShrink:0,
                                  opacity:0.88,letterSpacing:0.3,pointerEvents:"none"}}>
                                {m.abbr||m.label}
                              </div>
                            ))}
                            {isExpanded?(
                              cellTasks.map(t=>{
                                const st=stageMap[t.status];
                                const grpColor=st?.groupId?groupColorMap[st.groupId]:undefined;
                                const barColor=grpColor||proj.color;
                                const isSel=selectedTasks.has(t.id);
                                return (
                                  <div key={t.id} draggable
                                    onMouseDown={e=>e.stopPropagation()}
                                    onDragStart={e=>{e.stopPropagation();const multi=isSel&&selectedTasks.size>1?selectedTasks:null;dragRef.current={task:t,copy:e.altKey,stretch:e.shiftKey||shiftPressedRef.current,multiTaskIds:multi};e.dataTransfer.effectAllowed=e.altKey?"copy":"move";}}
                                    onDragEnd={()=>{dragRef.current=null;}}
                                    onClick={e=>{e.stopPropagation();if(e.shiftKey){setSelectedTasks(prev=>{const n=new Set(prev);n.has(t.id)?n.delete(t.id):n.add(t.id);return n;});}else{setTaskModal(t);}}}
                                    onContextMenu={e=>openTaskContext(e,[t.id])}
                                    onMouseEnter={e=>{e.stopPropagation();setHoverTask({task:t,rect:e.currentTarget.getBoundingClientRect()});}}
                                    onMouseLeave={e=>{e.stopPropagation();setHoverTask(null);}}
                                    style={{position:"relative",
                                      background:t.cancelled?"rgba(71,85,105,0.12)":isSel?`${st?.color||"#3b82f6"}33`:st?stageBg(st.color):"rgba(255,255,255,0.08)",
                                      border:t.cancelled?"1px dashed #475569":isSel?`2px solid ${st?.color||"#3b82f6"}`:`1px solid ${st?stageBorder(st.color):"#334155"}`,
                                      borderLeft:`3px solid ${t.cancelled?"#475569":grpColor||proj.color}`,
                                      borderRadius:3,flexShrink:0,overflow:"hidden",
                                      color:t.cancelled?"#64748b":st?st.color:"#94a3b8",
                                      cursor:"grab",userSelect:"none",padding:"3px 5px"}}>
                                    {t.cancelled&&<span style={{position:"absolute",top:1,right:2,fontSize:7,lineHeight:1}}>🚫</span>}
                                    <div style={{fontSize:9,lineHeight:1.4}}>
                                      <div style={{fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:t.cancelled?"line-through":"none"}}>{st?.abbr||st?.label||t.status}</div>
                                      <div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",opacity:0.85}}>{t.person||"—"}</div>
                                      <div style={{fontSize:8,opacity:0.6}}>{t.from}–{t.to}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ):(()=>{
                              // Collapsed: group active by status, cancelled separately
                              const activeCT=cellTasks.filter(t=>!t.cancelled);
                              const cancelledCnt=cellTasks.length-activeCT.length;
                              const groups={};
                              activeCT.forEach(t=>{if(!groups[t.status])groups[t.status]=[];groups[t.status].push(t);});
                              const badges=Object.entries(groups).map(([status,grpTasks])=>{
                                const st=stageMap[status];
                                const grpColor=st?.groupId?groupColorMap[st.groupId]:undefined;
                                const barColor=grpColor||proj.color;
                                const count=grpTasks.length;
                                const isSel=grpTasks.some(t=>selectedTasks.has(t.id));
                                return (
                                  <div key={status} draggable
                                    onMouseDown={e=>e.stopPropagation()}
                                    onDragStart={e=>{e.stopPropagation();const t0=grpTasks[0];const multi=count>1?new Set(grpTasks.map(t=>t.id)):(isSel&&selectedTasks.size>1?selectedTasks:null);dragRef.current={task:t0,copy:e.altKey,stretch:e.shiftKey||shiftPressedRef.current,multiTaskIds:multi};e.dataTransfer.effectAllowed=e.altKey?"copy":"move";}}
                                    onDragEnd={()=>{dragRef.current=null;}}
                                    onClick={e=>{e.stopPropagation();if(count===1){if(e.shiftKey){setSelectedTasks(prev=>{const n=new Set(prev);n.has(grpTasks[0].id)?n.delete(grpTasks[0].id):n.add(grpTasks[0].id);return n;});}else setTaskModal(grpTasks[0]);}else setTaskModal(grpTasks[0]);}}
                                    onContextMenu={e=>openTaskContext(e,grpTasks.map(t=>t.id))}
                                    onMouseEnter={e=>{e.stopPropagation();setHoverTask({tasks:grpTasks,rect:e.currentTarget.getBoundingClientRect()});}}
                                    onMouseLeave={e=>{e.stopPropagation();setHoverTask(null);}}
                                    style={{background:isSel?`${st?.color||"#3b82f6"}33`:st?stageBg(st.color):"rgba(255,255,255,0.08)",
                                      border:isSel?`2px solid ${st?.color||"#3b82f6"}`:`1px solid ${st?stageBorder(st.color):"#334155"}`,
                                      borderLeft:`3px solid ${barColor}`,
                                      borderRadius:3,flexShrink:0,overflow:"hidden",
                                      color:st?st.color:"#94a3b8",cursor:"grab",userSelect:"none",padding:"1px 3px"}}>
                                    <div style={{fontSize:9,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"flex",alignItems:"center",gap:2}}>
                                      <span>{st?.abbr||st?.label||status}</span>
                                      {count>1&&<span style={{fontWeight:800,background:`${st?.color||"#94a3b8"}33`,
                                        borderRadius:2,padding:"0 2px",fontSize:8,flexShrink:0}}>×{count}</span>}
                                    </div>
                                  </div>
                                );
                              });
                              if(cancelledCnt>0) badges.push(
                                <div key="__c" style={{background:"rgba(71,85,105,0.15)",border:"1px dashed #475569",
                                  borderLeft:"3px solid #475569",borderRadius:3,overflow:"hidden",
                                  color:"#64748b",padding:"1px 3px",cursor:"pointer"}}
                                  onClick={e=>{e.stopPropagation();const ct=cellTasks.filter(t=>t.cancelled);if(ct.length===1)setTaskModal(ct[0]);}}
                                  onContextMenu={e=>openTaskContext(e,cellTasks.filter(t=>t.cancelled).map(t=>t.id))}>
                                  <div style={{fontSize:9,display:"flex",alignItems:"center",gap:1}}>
                                    <span>🚫</span>
                                    {cancelledCnt>1&&<span style={{fontSize:8,fontWeight:800}}>×{cancelledCnt}</span>}
                                  </div>
                                </div>
                              );
                              return badges;
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {taskContextMenu&&(()=>{
        const ids=taskContextMenu.ids||[];
        const first=taskById(ids[0]);
        const menuItem={display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",color:"#dbeafe",padding:"9px 12px",fontSize:13,fontWeight:700,cursor:"pointer",borderRadius:9};
        const danger={...menuItem,color:"#fecaca"};
        return (
          <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left:taskContextMenu.x,top:taskContextMenu.y,zIndex:2147483100,width:230,
            background:"linear-gradient(180deg,rgba(30,41,59,.98),rgba(15,23,42,.98))",border:"1px solid rgba(148,163,184,.28)",
            borderRadius:14,boxShadow:"0 18px 50px rgba(0,0,0,.55)",padding:6}}>
            <div style={{fontSize:11,color:"#94a3b8",padding:"6px 10px 8px",borderBottom:"1px solid rgba(148,163,184,.16)",marginBottom:4}}>
              {ids.length===1?"1 смена":ids.length+" смен"}
            </div>
            {ids.length===1&&first&&<button type="button" style={menuItem} onClick={()=>{setTaskModal(first);closeTaskContext();}}>Открыть смену</button>}
            <button type="button" style={menuItem} onClick={()=>openAssignPeopleBulk(ids)}>{"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"}</button>
            <button type="button" style={menuItem} onClick={()=>clearTaskPeopleBulk(ids)}>Убрать исполнителей</button>
            <button type="button" style={danger} onClick={()=>deleteTasksBulk(ids,true)}>Удалить</button>
            <button type="button" style={{...menuItem,color:"#94a3b8",fontWeight:600}} onClick={()=>{setSelectedTasks(new Set());closeTaskContext();}}>Снять выделение</button>
          </div>
        );
      })()}

      {hoverTask&&<GanttTooltip task={hoverTask.task} tasks={hoverTask.tasks} rect={hoverTask.rect} stageMap={stageMap}/>}

      {assignPersonModal&&(<Modal title={"\u041d\u0430\u0437\u043d\u0430\u0447\u0438\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f"} onClose={()=>setAssignPersonModal(null)} onSubmit={()=>assignPeopleBulk(assignPersonModal.ids,assignPersonModal.person)} freeOverflow><Field label={"\u0418\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c"}><SelSearch value={assignPersonModal.person} onChange={v=>setAssignPersonModal(m=>({...m,person:v}))} options={assignPersonModal.people.map(p=>({value:p,label:p}))} placeholder={"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u0441\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044f..."}/></Field></Modal>)}
      {taskModal!==null&&(
        <TaskModal task={taskModal} data={data}
          onSave={saveTask} onDelete={deleteTask} onClose={()=>setTaskModal(null)} canEdit={canEdit&&(!taskModal.project||canWriteProject(taskModal.project))} canEditOldTasks={canEditOldTasks} canEditProjectById={canEditProjectById}/>
      )}
    </div>
  );
}

function TaskModal({task,data,onSave,onDelete,onClose,canEdit,canEditOldTasks,canEditProjectById}){
  const {sorted:stages,stageMap}=useContext(StagesCtx);
  const isNew=!task.id;
  const [form,setForm]=useState({
    project:task.project||"",series:task.series||"",status:task.status||"",
    person:task.person||"",day:task.day||"",from:task.from??10,to:task.to??19,
    note:task.note||"",unplanned:task.unplanned||false,shifts_tail:false,
  });
  const sf=v=>setForm(f=>({...f,...v}));
  const fixedProject=isNew&&task._fixedProject&&task.project;
  const fixedPerson=isNew&&task._fixedPerson&&task.person;
  const fixedProjectObj=fixedProject?(data.projects||[]).find(p=>p.id===form.project):null;

  const isLocked=false;

  const stageInfo=form.status?stageMap[form.status]:null;
  const needsExecutor=!stageInfo||stageInfo.needsExecutor!==false;

  const availSeries=useMemo(()=>{
    const fromSeries=(data.series||[]).filter(s=>s.projectId===form.project)
      .sort((a,b)=>(a.order||0)-(b.order||0)).map(s=>s.name);
    const fromTasks=[...new Set(data.tasks.filter(t=>t.project===form.project).map(t=>t.series))]
      .filter(n=>!fromSeries.includes(n)).sort();
    return [...fromSeries,...fromTasks];
  },[form.project,data]);

  const availPeople=useMemo(()=>{
    if(!form.status) return data.people.filter(p=>p.active!==false);
    return filterPeopleByStatus(data.people,form.status,stages);
  },[form.status,data.people,stages]);

  const roleHint=useMemo(()=>{
    const roles=stageInfo?.rolesRequired||[];
    if(!roles.length) return "";
    const labels=roles.map(r=>data.roles.find(rl=>rl.id===r)?.label||r);
    return `Показаны: ${labels.join(", ")}`;
  },[stageInfo,data.roles]);

  const hasTail=useMemo(()=>{
    if(!task.id||!task.day||form.day===task.day) return false;
    const ds=daySort(task.day);
    return data.tasks.some(t=>t.project===task.project&&t.series===task.series&&daySort(t.day)>ds&&t.id!==task.id);
  },[form.day,task,data.tasks]);

  function handleSave(){
    if(isLocked) return;
    if(!form.project){alert("Выберите проект");return;}
    if(!form.series){alert("Укажите серию");return;}
    if(!form.status){alert("Выберите этап");return;}
    if(!form.day){alert("Укажите дату");return;}
    if(!parseDate(form.day)){alert("Укажите существующую дату");return;}
    if(!Number.isFinite(Number(form.from))||!Number.isFinite(Number(form.to))||Number(form.from)<0||Number(form.to)>24||Number(form.to)<=Number(form.from)){alert("Время окончания должно быть позже начала, в пределах одного дня");return;}
    const ser=(data.series||[]).find(s=>s.projectId===form.project&&s.name===form.series);
    const seriesId=ser?ser.id:null;
    const saved={...task,...form,seriesId,autogenerated:task.autogenerated||false};
    delete saved._fixedProject;
    delete saved._fixedPerson;
    if(form.shifts_tail&&task.id&&form.day!==task.day){
      const diff=Math.round((parseDate(form.day)-parseDate(task.day))/(1000*60*60*24));
      const ds=daySort(task.day);
      const tailTasks=data.tasks.filter(t=>t.project===task.project&&t.series===task.series&&daySort(t.day)>ds&&t.id!==task.id);
      const updatedTail=tailTasks.map(t=>({...t,day:addDays(t.day,diff)}));
      const allTasks=data.tasks.map(t=>{const upd=updatedTail.find(u=>u.id===t.id);return upd||t;});
      onSave({...saved,_cascadeAll:allTasks});
    } else {
      onSave(saved);
    }
  }
  return (
    <Modal title={isNew?"Новая задача":"Редактировать задачу"} onClose={onClose} onSubmit={handleSave}>
      {fixedProject&&<div style={{marginBottom:12,padding:"8px 10px",background:"#0f172a",border:"1px solid #334155",borderRadius:10,fontSize:13,color:"#94a3b8"}}>
        <div style={{fontWeight:800,color:"#e2e8f0"}}>{fixedProjectObj?.name||form.project}</div>
        <div>{form.series||"-"}</div>
      </div>}
      {!fixedProject&&<Field label={"\u041f\u0440\u043e\u0435\u043a\u0442"}>
        <SelSearch value={form.project} onChange={v=>sf({project:v,series:"",person:fixedPerson?form.person:""})}
          options={data.projects.filter(p=>!canEditProjectById||canEditProjectById(p.id)).map(p=>({value:p.id,label:p.name}))} placeholder={"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u043f\u0440\u043e\u0435\u043a\u0442..."} autoFocus={isNew}/>
      </Field>}
      {!fixedProject&&<Field label={"\u0421\u0435\u0440\u0438\u044f"}>
        <SelSearch value={form.series} onChange={v=>sf({series:v})}
          options={availSeries} placeholder={"\u0412\u044b\u0431\u0440\u0430\u0442\u044c \u0438\u043b\u0438 \u0432\u0432\u0435\u0441\u0442\u0438: \u042101..."} allowCustom/>
      </Field>}
      <Field label="Этап">
        <SelSearch value={form.status} onChange={v=>sf({status:v,person:fixedPerson?form.person:""})}
          options={stages.map(s=>({value:s.id,label:s.label}))} placeholder="Выбрать этап..."/>
      </Field>
      <Field label={`Исполнитель${needsExecutor?"":" (необязательно)"}`} hint={roleHint}>
        <SelSearch value={form.person} onChange={v=>sf({person:v})}
          options={availPeople.map(p=>({value:p.name,label:p.name+(p.roles.length?" ("+p.roles.map(r=>data.roles.find(rl=>rl.id===r)?.label||r).join(", ")+")":"")}))}
          placeholder={needsExecutor?"Выбрать исполнителя...":"Без исполнителя..."} allowCustom/>
      </Field>
      <Field label="Дата">
        <InpDate value={form.day} onChange={v=>sf({day:v})}/>
      </Field>
      <Field label="Время">
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
          {TIME_PRESETS.map(({f:fr,t:to})=>(
            <Btn key={`${fr}-${to}`} small
              variant={form.from===fr&&form.to===to?"primary":"ghost"}
              onClick={()=>sf({from:fr,to})}>
              {fr}–{to}
            </Btn>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:"#64748b"}}>с</span>
          <select value={Math.floor(form.from||0)}
            onChange={e=>sf({from:Number(e.target.value)+(((form.from||0)%1>=0.5)?0.5:0)})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            {Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,"0")}</option>)}
          </select>
          <select value={(form.from||0)%1>=0.5?30:0}
            onChange={e=>sf({from:Math.floor(form.from||0)+Number(e.target.value)/60})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            <option value={0}>:00</option>
            <option value={30}>:30</option>
          </select>
          <span style={{fontSize:12,color:"#64748b"}}>до</span>
          <select value={Math.floor(form.to||0)}
            onChange={e=>sf({to:Number(e.target.value)+(((form.to||0)%1>=0.5)?0.5:0)})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            {Array.from({length:25},(_,i)=><option key={i} value={i}>{String(i).padStart(2,"0")}</option>)}
          </select>
          <select value={(form.to||0)%1>=0.5?30:0}
            onChange={e=>sf({to:Math.floor(form.to||0)+Number(e.target.value)/60})}
            style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
              borderRadius:10,padding:"5px 8px",fontSize:13,outline:"none"}}>
            <option value={0}>:00</option>
            <option value={30}>:30</option>
          </select>
          <span style={{fontSize:12,color:"#64748b"}}>{fmtDur(form.from,form.to)}</span>
        </div>
      </Field>
      {canSeeTaskNotes()&&<Field label="Заметка">
        <textarea value={form.note} onChange={e=>sf({note:e.target.value})} rows={2}
          placeholder="Описание, факт выполнения..."
          style={{background:"#0f172a",border:"1px solid #334155",color:"#e2e8f0",
            borderRadius:10,padding:"7px 10px",fontSize:13,width:"100%",resize:"vertical"}}/>
      </Field>}
      <div style={{display:"flex",gap:16,marginBottom:6,alignItems:"center",flexWrap:"wrap"}}>
        {hasTail&&(
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
            <input type="checkbox" checked={form.shifts_tail}
              onChange={e=>sf({shifts_tail:e.target.checked})} style={{accentColor:"#f59e0b"}}/>
            <span style={{fontSize:13,color:"#f59e0b"}}>Сдвинуть весь хвост серии</span>
          </label>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {form.cancelled?(
            <span style={{fontSize:11,color:"#475569",background:"rgba(71,85,105,0.15)",
              border:"1px solid #475569",borderRadius:10,padding:"4px 10px"}}>🚫 Отменена</span>
          ):(
            <span style={{fontSize:11,color:"#94a3b8"}}>
              {!isNew&&daySort(form.day)<daySort(formatDate(new Date()))?"OK Выполнено":" Запланировано"}
            </span>
          )}
          {form.cancelled?(
            <Btn small variant="ghost" onClick={()=>sf({cancelled:false,
              note:(form.note||"").replace(/^ОТМЕНА\n?/,"").trim()})}>↩ Снять отмену</Btn>
          ):(
            <Btn small variant="danger" onClick={()=>sf({cancelled:true,
              note:"ОТМЕНА"+(form.note?"\n"+form.note:"")})}>🚫 Отменить</Btn>
          )}
        </div>
      </div>
      {task.updatedAt&&(
        <div style={{fontSize:10,color:"#334155",marginTop:8,textAlign:"right"}}>
          изменено: {new Date(task.updatedAt).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}
          {task.updatedBy?" · "+task.updatedBy:""}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
        <div>{!isNew&&canEdit&&<Btn variant="danger" disabled={isLocked} onClick={()=>!isLocked&&onDelete(task.id)}>Удалить</Btn>}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Отмена</Btn>
          {canEdit&&<Btn variant="primary" disabled={isLocked} onClick={handleSave}>
            {isNew?"Создать задачу":"Сохранить"}
          </Btn>}
        </div>
      </div>
    </Modal>
  );
}

// ── ПО ДНЯМ ──────────────────────────────────────────────────────────
