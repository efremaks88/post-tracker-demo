(function pagesDemoBootstrap(){
  'use strict';

  const seed = window.__POST_TRACKER_PAGES_SEED__;
  if (!seed) throw new Error('GitHub Pages demo seed is missing');

  const STORAGE_KEY = 'post_tracker_github_pages_demo_v016';
  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  let state;

  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(seed);
  } catch (error) {
    state = clone(seed);
  }

  function persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function bodyOf(options){
    if (!options || !options.body) return {};
    try { return JSON.parse(options.body); } catch (error) { return {}; }
  }

  function json(value, status=200){
    return Promise.resolve(new Response(JSON.stringify(value), {
      status,
      headers:{'Content-Type':'application/json; charset=utf-8'},
    }));
  }

  function refreshProjectBlock(projectId, block){
    const project = state.projects[projectId];
    if (!project) return;
    const summary = clone(block.block || block);
    const index = project.blocks.findIndex(item=>item.id===summary.id);
    if (index >= 0) project.blocks[index] = summary;
    else project.blocks.push(summary);
  }

  function patchTask(taskId, patch){
    const taskPage = state.tasks[taskId];
    if (taskPage) Object.assign(taskPage.task, patch, patch.completed === true ? {status:'done'} : patch.completed === false ? {status:'todo'} : {});
    for (const block of Object.values(state.blocks)) {
      const task = (block.tasks || []).find(item=>item.id===taskId);
      if (!task) continue;
      Object.assign(task, patch, patch.completed === true ? {status:'done'} : patch.completed === false ? {status:'todo'} : {});
      block.block.completedTasks = block.tasks.filter(item=>item.completed).length;
      refreshProjectBlock(block.project.id, block);
    }
    for (const task of state.myWork.tasks || []) if (task.id===taskId) Object.assign(task, patch);
    for (const task of state.dashboard.myTasks || []) if (task.id===taskId) Object.assign(task, patch);
  }

  function route(pathname, method, options){
    const path = pathname.replace(/\/+$/, '') || '/';
    const body = bodyOf(options);
    let match;

    if (method==='GET' && path==='/api/runtime') return json({mode:'github-pages-demo',label:'ДЕМО · GitHub Pages'});
    if (method==='GET' && path==='/api/auth/me') return json(state.me);
    if (method==='POST' && path==='/api/auth/logout') return json({ok:true});
    if (method==='GET' && path==='/api/data') return json(state.data);
    if (method==='PUT' && path==='/api/data') {
      state.data = {...body, _revision:Number(state.data?._revision||0)+1}; persist();
      return json({ok:true,data:state.data});
    }
    if (method==='GET' && path==='/api/producer/dashboard') return json(state.dashboard);
    if (method==='GET' && path==='/api/producer/my-work') return json(state.myWork);
    if (method==='GET' && path==='/api/producer/control') return json(state.control);
    if (method==='GET' && path==='/api/producer/marketing') return json(state.marketing);
    if (method==='GET' && path==='/api/producer/team') return json(state.team);
    if (method==='GET' && path==='/api/producer/analytics') return json(state.analytics);
    if (method==='GET' && path==='/api/audit/events') return json(state.history);

    if (method==='POST' && path==='/api/producer/projects') {
      const id = uid('demo-project');
      const project = {id,name:String(body.name||'Новый проект'),abbr:String(body.name||'НП').slice(0,2).toUpperCase(),description:body.description||'',color:body.color||'#4f79d8',status:body.status||'подготовка'};
      state.projects[id] = {project,series:[],blocks:[],controlItems:[]};
      state.dashboard.projects.unshift({...project,totalBlocks:0,totalTasks:0,completedTasks:0,progress:0,nextDeadline:null,warningCount:0,team:[]});
      persist(); return json({ok:true,id,name:project.name},201);
    }

    match = path.match(/^\/api\/producer\/projects\/([^/]+)$/);
    if (method==='GET' && match) return state.projects[decodeURIComponent(match[1])] ? json(state.projects[decodeURIComponent(match[1])]) : json({error:'Проект не найден'},404);

    match = path.match(/^\/api\/producer\/projects\/([^/]+)\/blocks$/);
    if (method==='POST' && match) {
      const projectId = decodeURIComponent(match[1]);
      const projectPage = state.projects[projectId];
      if (!projectPage) return json({error:'Проект не найден'},404);
      const id = uid('demo-block');
      const owner = (state.team.people||[]).find(person=>person.id===body.ownerPersonId);
      const block = {id,projectId,seriesId:body.seriesId||null,name:String(body.name||'Новый блок'),description:body.description||'',ownerPersonId:body.ownerPersonId||null,ownerName:owner?.name||'',status:body.status||'planned',startDate:body.startDate||null,deadline:body.deadline||null,sortOrder:projectPage.blocks.length,color:projectPage.project.color,totalTasks:0,completedTasks:0,warningCount:0};
      projectPage.blocks.push(block);
      state.blocks[id] = {block:clone(block),project:clone(projectPage.project),series:null,seriesOptions:clone(projectPage.series||[]),groups:[],tasks:[],approvals:[],warnings:[],people:(state.team.people||[]).map(person=>({id:person.id,name:person.name})),history:[],permissions:{canDecideApprovals:true}};
      const dashboardProject = state.dashboard.projects.find(project=>project.id===projectId);
      if (dashboardProject) dashboardProject.totalBlocks += 1;
      persist(); return json({ok:true,id});
    }

    match = path.match(/^\/api\/producer\/blocks\/([^/]+)$/);
    if (method==='GET' && match) return state.blocks[decodeURIComponent(match[1])] ? json(state.blocks[decodeURIComponent(match[1])]) : json({error:'Блок не найден'},404);
    if (method==='PATCH' && match) {
      const block = state.blocks[decodeURIComponent(match[1])];
      if (!block) return json({error:'Блок не найден'},404);
      Object.assign(block.block, body); refreshProjectBlock(block.project.id, block); persist(); return json({ok:true});
    }

    match = path.match(/^\/api\/producer\/blocks\/([^/]+)\/groups$/);
    if (method==='POST' && match) {
      const block = state.blocks[decodeURIComponent(match[1])];
      if (!block) return json({error:'Блок не найден'},404);
      const id=uid('demo-group'); block.groups.push({id,name:body.name||'Новая группа',sortOrder:block.groups.length}); persist(); return json({ok:true,id});
    }

    match = path.match(/^\/api\/producer\/blocks\/([^/]+)\/tasks$/);
    if (method==='POST' && match) {
      const block = state.blocks[decodeURIComponent(match[1])];
      if (!block) return json({error:'Блок не найден'},404);
      const id=uid('demo-task');
      const assignee=(block.people||[]).find(person=>person.id===body.assigneePersonId);
      const responsible=(block.people||[]).find(person=>person.id===body.responsiblePersonId);
      const task={id,blockId:block.block.id,groupId:body.groupId||null,title:body.title||'Новая задача',internalComment:body.internalComment||'',assigneePersonId:body.assigneePersonId||null,assigneeName:assignee?.name||'',responsiblePersonId:body.responsiblePersonId||null,responsibleName:responsible?.name||'',deadline:body.deadline||null,status:'todo',completed:false,sortOrder:block.tasks.length,completedAt:null};
      block.tasks.push(task); block.block.totalTasks=block.tasks.length; refreshProjectBlock(block.project.id,block);
      state.tasks[id]={task:clone(task),block:clone(block.block),project:clone(block.project),group:block.groups.find(group=>group.id===task.groupId)||null,people:clone(block.people)};
      persist(); return json({ok:true,id});
    }

    match = path.match(/^\/api\/producer\/tasks\/([^/]+)$/);
    if (method==='GET' && match) return state.tasks[decodeURIComponent(match[1])] ? json(state.tasks[decodeURIComponent(match[1])]) : json({error:'Задача не найдена'},404);
    if (method==='PATCH' && match) { patchTask(decodeURIComponent(match[1]),body); persist(); return json({ok:true}); }

    match = path.match(/^\/api\/producer\/groups\/([^/]+)$/);
    if (match) {
      const groupId=decodeURIComponent(match[1]);
      for (const block of Object.values(state.blocks)) {
        const group=block.groups.find(item=>item.id===groupId);
        if (!group) continue;
        if (method==='PATCH') { Object.assign(group,body); persist(); return json({ok:true}); }
        if (method==='DELETE') { const moved=block.tasks.filter(task=>task.groupId===groupId); moved.forEach(task=>task.groupId=null); block.groups=block.groups.filter(item=>item.id!==groupId); persist(); return json({ok:true,movedTasks:moved.length}); }
      }
      return json({error:'Группа не найдена'},404);
    }

    match = path.match(/^\/api\/producer\/blocks\/([^/]+)\/approvals$/);
    if (method==='POST' && match) {
      const block=state.blocks[decodeURIComponent(match[1])];
      if (!block) return json({error:'Блок не найден'},404);
      const id=uid('demo-approval'); block.approvals.push({id,projectId:block.project.id,blockId:block.block.id,taskId:body.taskId||null,title:body.title||'Новое согласование',required:body.required!==false,dueDate:body.dueDate||null,status:'pending',decision:null,requestedByName:'Локальный администратор',decidedByName:'',decidedAt:null,decisionComment:'',createdAt:new Date().toISOString()}); persist(); return json({ok:true,id});
    }

    match = path.match(/^\/api\/producer\/approvals\/([^/]+)\/decision$/);
    if (method==='PATCH' && match) {
      const approvalId=decodeURIComponent(match[1]);
      for (const block of Object.values(state.blocks)) {
        const approval=(block.approvals||[]).find(item=>item.id===approvalId);
        if (!approval) continue;
        approval.decision=body.decision||null; approval.status=body.decision==='approved'?'approved':body.decision==='rejected'?'rejected':'pending'; approval.decisionComment=body.comment||''; approval.decidedByName='Локальный администратор'; approval.decidedAt=new Date().toISOString(); persist(); return json({ok:true});
      }
      return json({error:'Согласование не найдено'},404);
    }

    match = path.match(/^\/api\/producer\/people\/([^/]+)$/);
    if (method==='GET' && match) return state.people[decodeURIComponent(match[1])] ? json(state.people[decodeURIComponent(match[1])]) : json({error:'Сотрудник не найден'},404);
    match = path.match(/^\/api\/producer\/people\/([^/]+)\/profile$/);
    if (method==='PATCH' && match) {
      const personId=decodeURIComponent(match[1]); const person=state.people[personId];
      if (!person) return json({error:'Сотрудник не найден'},404);
      Object.assign(person,body); const teamPerson=(state.team.people||[]).find(item=>item.id===personId); if(teamPerson)Object.assign(teamPerson,body); persist(); return json({ok:true});
    }

    return json({error:'Это действие не вошло в статическую демо-версию'},501);
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function pagesDemoFetch(input, options={}){
    const rawUrl = typeof input==='string' ? input : input.url;
    const url = new URL(rawUrl, window.location.href);
    if (!url.pathname.startsWith('/api/')) return nativeFetch(input, options);
    return route(url.pathname, String(options.method||'GET').toUpperCase(), options);
  };

  window.EventSource = class DemoEventSource {
    constructor(){ this.readyState=1; }
    close(){ this.readyState=2; }
  };

  window.addEventListener('DOMContentLoaded', function(){
    const notice=document.createElement('aside');
    notice.className='pages-demo-notice';
    notice.innerHTML='<span><b>Демо-версия</b><small>Изменения видны только в этом браузере</small></span><button type="button">Сбросить демо</button>';
    notice.querySelector('button').addEventListener('click',function(){
      if(!window.confirm('Сбросить все изменения в демо-версии?'))return;
      localStorage.removeItem(STORAGE_KEY); window.location.hash='producer'; window.location.reload();
    });
    document.body.appendChild(notice);
  });
})();
