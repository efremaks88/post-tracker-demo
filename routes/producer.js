const { withTransaction } = require('../lib/db');
const { auditMutation } = require('../lib/audit');
const createProducerModel = require('../lib/models/producer');
const { PERMISSIONS } = require('../lib/policy');
const {
  producerProjectSchema, producerBlockSchema, producerBlockUpdateSchema, producerGroupSchema, producerTaskSchema, producerTaskUpdateSchema, validate,
  producerApprovalSchema, producerApprovalDecisionSchema, producerPersonProfileSchema,
} = require('./schemas');

module.exports = function registerProducerRoutes(app, pool, deps) {
  const Producer = createProducerModel(pool);
  const requireAuth = deps.requireAuth;
  const requirePermission = deps.requirePermission;
  const policy = deps.policy;

  function fail(res, error) {
    const status = Number(error && error.status) || 500;
    if (status >= 500) console.error('[PRODUCER]', error);
    return res.status(status).json({error:status >= 500 ? 'Internal error' : error.message});
  }

  async function mayView(req, projectId, query) {
    return policy.can(req.session, PERMISSIONS.POST_PROJECT_VIEW, {projectId,query});
  }

  async function mayEdit(req, projectId, query) {
    return policy.can(req.session, PERMISSIONS.POST_PROJECT_EDIT, {projectId,query});
  }

  function write(entities, handler) {
    return withTransaction(pool, async function(req,res) {
      try {
        let result;
        await auditMutation(req, entities, async function() { result = await handler(req,res); });
        if (res.statusCode >= 400) return;
        if (req._afterCommit && deps.broadcast) req._afterCommit.push(function() {
          deps.broadcast({type:'producer',clientId:req.headers['x-client-id']||'server'});
        });
        res.json(result || {ok:true});
      } catch (error) {
        fail(res,error);
      }
    });
  }

  app.get('/api/producer/dashboard', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      res.json(await Producer.dashboard(pool,scope,req.session));
    } catch (error) { next(error); }
  });

  app.get('/api/producer/my-work', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      res.json(await Producer.myWork(pool,scope,req.session));
    } catch (error) { next(error); }
  });

  app.get('/api/producer/control', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      res.json(await Producer.control(pool,scope));
    } catch (error) { next(error); }
  });

  app.get('/api/producer/marketing', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      res.json(await Producer.marketing(pool,scope));
    } catch (error) { next(error); }
  });

  app.get('/api/producer/team', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      res.json(await Producer.team(pool,scope,req.session));
    } catch (error) { next(error); }
  });

  app.get('/api/producer/people/:personId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      const result = await Producer.personProfile(pool,req.params.personId,scope,req.session);
      if (!result) return res.status(404).json({error:'Сотрудник не найден'});
      res.json(result);
    } catch (error) { next(error); }
  });

  app.patch('/api/producer/people/:personId/profile', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerPersonProfileSchema), write(['person'], async function(req,res) {
    if (!(await Producer.canEditPersonProfile(req._tx,req.params.personId,req.session))) {
      res.status(403).json({error:'Редактировать достижения может сам сотрудник или руководитель'});
      return null;
    }
    await Producer.updatePersonProfile(req._tx,req.params.personId,req.body);
    return {ok:true};
  }));

  app.get('/api/producer/analytics', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const scope = await policy.projectScope(req.session,false);
      res.json(await Producer.analytics(pool,scope));
    } catch (error) { next(error); }
  });

  app.post('/api/producer/projects', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerProjectSchema), write(['project'], async function(req,res) {
    if (!(await policy.can(req.session,PERMISSIONS.POST_PROJECT_CREATE))) {
      res.status(403).json({error:'Нет прав на создание проекта'});
      return null;
    }
    const result = await Producer.createProject(req._tx,req.body,req.session);
    res.status(201);
    return {ok:true,id:result.id,name:result.name};
  }));

  app.get('/api/producer/projects/:projectId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      if (!(await mayView(req,req.params.projectId,pool))) return res.status(403).json({error:'Нет доступа к проекту'});
      const result = await Producer.project(pool,req.params.projectId);
      if (!result) return res.status(404).json({error:'Проект не найден'});
      res.json(result);
    } catch (error) { next(error); }
  });

  app.get('/api/producer/blocks/:blockId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const projectId = await Producer.blockProjectId(pool,req.params.blockId);
      if (!projectId) return res.status(404).json({error:'Блок не найден'});
      if (!(await mayView(req,projectId,pool))) return res.status(403).json({error:'Нет доступа к проекту'});
      const result = await Producer.block(pool,req.params.blockId);
      result.permissions = {canDecideApprovals:await policy.can(req.session,PERMISSIONS.APPROVAL_DECIDE)};
      res.json(result);
    } catch (error) { next(error); }
  });

  app.post('/api/producer/projects/:projectId/blocks', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerBlockSchema), write(['productionBlock'], async function(req,res) {
    if (!(await mayEdit(req,req.params.projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    const result = await Producer.createBlock(req._tx,req.params.projectId,req.body);
    return {ok:true,id:result.id};
  }));

  app.patch('/api/producer/blocks/:blockId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerBlockUpdateSchema), write(['productionBlock'], async function(req,res) {
    const projectId = await Producer.blockProjectId(req._tx,req.params.blockId);
    if (!projectId) throw Object.assign(new Error('Блок не найден'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    await Producer.updateBlock(req._tx,req.params.blockId,req.body);
    return {ok:true};
  }));

  app.post('/api/producer/blocks/:blockId/groups', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerGroupSchema), write(['productionGroup'], async function(req,res) {
    const projectId = await Producer.blockProjectId(req._tx,req.params.blockId);
    if (!projectId) throw Object.assign(new Error('Блок не найден'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    const result = await Producer.createGroup(req._tx,req.params.blockId,req.body);
    return {ok:true,id:result.id};
  }));

  app.patch('/api/producer/groups/:groupId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerGroupSchema), write(['productionGroup'], async function(req,res) {
    const projectId = await Producer.groupProjectId(req._tx,req.params.groupId);
    if (!projectId) throw Object.assign(new Error('Группа не найдена'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    await Producer.updateGroup(req._tx,req.params.groupId,req.body);
    return {ok:true};
  }));

  app.delete('/api/producer/groups/:groupId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), write(['productionGroup','productionTask'], async function(req,res) {
    const projectId = await Producer.groupProjectId(req._tx,req.params.groupId);
    if (!projectId) throw Object.assign(new Error('Группа не найдена'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    const result = await Producer.deleteGroup(req._tx,req.params.groupId);
    return {ok:true,movedTasks:result.movedTasks};
  }));

  app.post('/api/producer/blocks/:blockId/tasks', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerTaskSchema), write(['productionTask'], async function(req,res) {
    const projectId = await Producer.blockProjectId(req._tx,req.params.blockId);
    if (!projectId) throw Object.assign(new Error('Блок не найден'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    const result = await Producer.createTask(req._tx,req.params.blockId,req.body);
    return {ok:true,id:result.id};
  }));

  app.get('/api/producer/tasks/:taskId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_READ), async function(req,res,next) {
    try {
      const projectId = await Producer.taskProjectId(pool,req.params.taskId);
      if (!projectId) return res.status(404).json({error:'Задача не найдена'});
      if (!(await mayView(req,projectId,pool))) return res.status(403).json({error:'Нет доступа к проекту'});
      const result = await Producer.task(pool,req.params.taskId);
      if (!result) return res.status(404).json({error:'Задача не найдена'});
      res.json(result);
    } catch (error) { next(error); }
  });

  app.patch('/api/producer/tasks/:taskId', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerTaskUpdateSchema), write(['productionTask'], async function(req,res) {
    const projectId = await Producer.taskProjectId(req._tx,req.params.taskId);
    if (!projectId) throw Object.assign(new Error('Задача не найдена'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    await Producer.updateTask(req._tx,req.params.taskId,req.body);
    return {ok:true};
  }));

  app.post('/api/producer/blocks/:blockId/approvals', requireAuth, requirePermission(PERMISSIONS.PRODUCER_WRITE), validate(producerApprovalSchema), write(['productionApproval'], async function(req,res) {
    const projectId = await Producer.blockProjectId(req._tx,req.params.blockId);
    if (!projectId) throw Object.assign(new Error('Блок не найден'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    const result = await Producer.createApproval(req._tx,req.params.blockId,req.body,{
      userId:req.session.userId,userName:req.session.displayName,
    });
    return {ok:true,id:result.id};
  }));

  app.patch('/api/producer/approvals/:approvalId/decision', requireAuth, requirePermission(PERMISSIONS.APPROVAL_DECIDE), validate(producerApprovalDecisionSchema), write(['productionApproval'], async function(req,res) {
    const projectId = await Producer.approvalProjectId(req._tx,req.params.approvalId);
    if (!projectId) throw Object.assign(new Error('Согласование не найдено'),{status:404});
    if (!(await mayEdit(req,projectId,req._tx))) {
      res.status(403).json({error:'Нет прав на изменение проекта'});
      return null;
    }
    await Producer.decideApproval(req._tx,req.params.approvalId,req.body,{
      userId:req.session.userId,userName:req.session.displayName,
    });
    return {ok:true};
  }));
};
