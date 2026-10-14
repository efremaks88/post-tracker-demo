const { projectSchema, seriesSchema, taskSchema, personSchema, achievementSchema, roleSchema, bulkSchema, validate } = require('./schemas');
const registerAuthRoutes = require('./auth');
const protectBulk = require('../lib/bulk-access');
const { withTransaction, logAudit } = require('../lib/db');
const createProjectsModel = require('../lib/models/projects');
const createSeriesModel = require('../lib/models/series');
const createTasksModel = require('../lib/models/tasks');
const createPeopleModel = require('../lib/models/people');
const createUsersModel = require('../lib/models/users');
const createRolesModel = require('../lib/models/roles');
const createDataModel = require('../lib/models/state');
const createAchievementsModel = require('../lib/models/achievements');
const { managerCanEditProject, sanitizeProjectForManager, managerCanWriteTask } = require('../lib/project-access');

function isFullAccessRole(role) {
  return role === "admin" || role === "lead" || role === "manager";
}
module.exports = function registerDataRoutes(app, pool, deps) {
  var requireAuth = deps.requireAuth;
  var requireRole = deps.requireRole;
  var blockNA = deps.blockNA;
  var requireWrite = deps.requireWrite;
  var checkProjectAccess = deps.checkProjectAccess;
  var broadcast = deps.broadcast;

  function notify(req,event){ event.clientId=event.clientId||'server'; if(req._afterCommit) req._afterCommit.push(()=>broadcast(event)); else broadcast(event); }
  // Init models
  var Projects = createProjectsModel(pool);
  var Series = createSeriesModel(pool);
  var Tasks = createTasksModel(pool);
  var People = createPeopleModel(pool);
var Roles = createRolesModel(pool);
  var Data = createDataModel(pool);
  var Achievements = createAchievementsModel(pool);

  // API routes

  registerAuthRoutes(app, pool, deps);

  // API routes

  // GET /api/data
  app.get("/api/data", requireAuth, blockNA, withTransaction(pool,async function(req, res) {
    try {
      var allowedProjects = null;
      if (!isFullAccessRole(req.session.role)) {
        allowedProjects = await createUsersModel(req._tx).getProjects(req.session.userId, false);
        if (!allowedProjects.length) {
          const revision=await req._tx.query("SELECT value FROM app_state WHERE key='revision' FOR SHARE");
          return res.json({ projects:[], series:[], tasks:[], people:[], roles:[], stages:[], stageGroups:[], holidays:[], achievements:[], personAbsences:[], templates:[], changelog:[], _savedAt:Date.now(), _clientId:"", _revision:Number(revision.rows[0]?.value||0) });
        }
      }
      res.json(await Data.loadAll(allowedProjects, req.session.userId,req._tx));
    } catch (e) {
      console.error("[DATA GET] Error:", e);
      res.status(500).json({ error: "Data load error" });
    }
  }));

  function withDataTransaction(pool,handler){
    return withTransaction(pool,async(req,res)=>{
      const rows=await req._tx.query("SELECT value FROM app_state WHERE key='revision' FOR UPDATE");
      const revision=Number(rows.rows[0].value);
      if(req.path==='/api/data' && req.body._revision!==revision) return res.status(409).json({error:'Данные изменились в другой вкладке. Скачайте свои изменения и загрузите актуальные данные.'});
      const send=res.json;
      res.json=function(body){if(res.statusCode<400)body._revision=revision+1;return send.call(this,body);};
      try {
        await handler(req,res);
        if(res.statusCode<400)await req._tx.query("UPDATE app_state SET value=$1::jsonb,updated_at=NOW() WHERE key='revision'",[JSON.stringify(revision+1)]);
      } catch(error){
        if(error.status===400)return res.status(400).json({error:error.message});
        throw error;
      } finally {res.json=send;}
    });
  }

  // Bulk saves are validated, permission-scoped and committed atomically.
  app.all('/api/data', requireAuth, blockNA, requireWrite, validate(bulkSchema), withDataTransaction(pool, async function(req,res) {
    if (!['POST','PUT'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});
    const data=req.body;
    await protectBulk(req._tx,data,req);
    await Data.syncAll(data,req._tx,req.session.userId);
    const counts=Object.fromEntries(Object.entries(data).filter(([key,value])=>Array.isArray(value)).map(([key,value])=>[key,value.length]));
    await logAudit(req._tx,req.session.userId,req.session.displayName,'save','bulk','',{counts});
    const allowed=isFullAccessRole(req.session.role)?null:await createUsersModel(req._tx).getProjects(req.session.userId,false);
    const result=await Data.loadAll(allowed,req.session.userId,req._tx);
    result._clientId=req.headers['x-client-id']||'';
    notify(req,{clientId:result._clientId});
    res.json(result);
  }));

  // API routes

  // POST project
  app.post("/api/data/project", requireAuth, blockNA, requireWrite, validate(projectSchema), withDataTransaction(pool, async function(req, res) {
    try {
      var p = await sanitizeProjectForManager(req._tx, req, req.body);
      if (!p) return res.status(403).json({ error: "No project edit rights" });
      if (req.session.role === "editor") {
        var existingProject = await req._tx.query("SELECT id FROM projects WHERE id=$1 AND (deleted != true OR deleted IS NULL)", [p.id]);
        if (!existingProject.rows.length) return res.status(403).json({ error: "No project create rights" });
        var canEditProject = await checkProjectAccess(req.session.userId, "editor", p.id, true);
        if (!canEditProject) return res.status(403).json({ error: "No edit rights" });
      }
      await Projects.upsert(req._tx, p);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "save", "project", p.id, { name: p.name });
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "project", id: p.id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[POST project] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // DELETE project
  app.delete("/api/data/project/:id", requireAuth, blockNA, requireRole("admin","lead"), withDataTransaction(pool, async function(req, res) {
    try {
      var id = req.params.id;
      await Projects.softDelete(req._tx, id);
      await req._tx.query("UPDATE series SET deleted=true WHERE project_id=$1", [id]);
      await req._tx.query("UPDATE tasks SET deleted=true WHERE project_id=$1", [id]);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "delete", "project", id, {});
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "project-delete", id: id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[DELETE project] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // POST series
  app.post("/api/data/series", requireAuth, blockNA, requireWrite, validate(seriesSchema), withDataTransaction(pool, async function(req, res) {
    try {
      var s = req.body;
      if (req.session.role === "manager" && !(await managerCanEditProject(req._tx, req, s.projectId))) return res.status(403).json({ error: "No project edit rights" });
      if (req.session.role === "editor" && s.projectId) {
        var canEdit = await checkProjectAccess(req.session.userId, "editor", s.projectId, true);
        if (!canEdit) return res.status(403).json({ error: "No edit rights" });
      }
      const oldPid=await Series.getProjectId(req._tx,s.id);
      if(oldPid && !(await checkProjectAccess(req.session.userId,req.session.role,oldPid,true))) return res.status(403).json({error:'No edit rights'});
      await Series.upsert(req._tx, s);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "save", "series", s.id, { name: s.name, projectId: s.projectId });
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "series", id: s.id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[POST series] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // DELETE series
  app.delete("/api/data/series/:id", requireAuth, blockNA, requireRole("admin","lead"), withDataTransaction(pool, async function(req, res) {
    try {
      var id = req.params.id;
      await Series.softDelete(req._tx, id);
      await req._tx.query("UPDATE tasks SET deleted=true,updated_at=NOW() WHERE series_id=$1",[id]);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "delete", "series", id, {});
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "series-delete", id: id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[DELETE series] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // POST task
  app.post("/api/data/task", requireAuth, blockNA, requireWrite, validate(taskSchema), withDataTransaction(pool, async function(req, res) {
    try {
      var t = req.body;
      if (!(await managerCanWriteTask(req._tx, req, t))) return res.status(403).json({ error: "No project edit rights" });
      if (req.session.role === "editor" && t.project) {
        var canEdit = await checkProjectAccess(req.session.userId, "editor", t.project, true);
        if (!canEdit) return res.status(403).json({ error: "No edit rights" });
      }
      const oldPid=await Tasks.getProjectId(req._tx,t.id);
      if(oldPid && !(await checkProjectAccess(req.session.userId,req.session.role,oldPid,true))) return res.status(403).json({error:'No edit rights'});
      if(t.seriesId){const seriesPid=await Series.getProjectId(req._tx,t.seriesId);if(seriesPid!==t.project)return res.status(400).json({error:'Series belongs to another project'});}
      const parent=await req._tx.query("SELECT id FROM projects WHERE id=$1 AND deleted IS NOT TRUE",[t.project]);
      if(!parent.rows.length)return res.status(400).json({error:"Project does not exist"});
      if(req.session.role==='editor') {
        const original=await req._tx.query('SELECT note FROM tasks WHERE id=$1',[t.id]);
        t.note=original.rows[0]?.note||'';
      }
      await Tasks.upsert(req._tx, t);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "save", "task", String(t.id), { status: t.status, project: t.project });
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "task", id: t.id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[POST task] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // DELETE task
  app.delete("/api/data/task/:id", requireAuth, blockNA, requireWrite, withDataTransaction(pool, async function(req, res) {
    try {
      var id = req.params.id;
      if (req.session.role === "manager") {
        var managerPid = await Tasks.getProjectId(req._tx, id);
        if (managerPid && !(await managerCanEditProject(req._tx, req, managerPid))) return res.status(403).json({ error: "No project edit rights" });
      }
      if (req.session.role === "editor") {
        var pid = await Tasks.getProjectId(req._tx, id);
        if (pid && !(await checkProjectAccess(req.session.userId, "editor", pid, true)))
          return res.status(403).json({ error: "No edit rights" });
      }
      await Tasks.softDelete(req._tx, id);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "delete", "task", String(id), {});
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "task-delete", id: id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[DELETE task] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // POST person
  app.post("/api/data/person", requireAuth, blockNA, requireRole("admin","lead"), validate(personSchema), withDataTransaction(pool, async function(req, res) {
    try {
      var pr = req.body;
      if (req.session.role !== "admin") {
        var existing = await req._tx.query("SELECT birthday FROM people WHERE id=$1", [pr.id]);
        pr.birthday = existing.rows[0] ? (existing.rows[0].birthday || '') : '';
      }
      await People.upsert(req._tx, pr);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "save", "person", pr.id, { name: pr.name });
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "person", id: pr.id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[POST person] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // DELETE person
  app.delete("/api/data/person/:id", requireAuth, blockNA, requireRole("admin","lead"), withDataTransaction(pool, async function(req, res) {
    try {
      var id = req.params.id;
      await People.softDelete(req._tx, id);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "delete", "person", id, {});
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "person-delete", id: id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[DELETE person] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));


  // POST role
  app.post("/api/data/role", requireAuth, blockNA, requireRole("admin","lead"), validate(roleSchema), withDataTransaction(pool, async function(req, res) {
    try {
      var r = req.body;
      await Roles.upsert(req._tx, r);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "save", "role", r.id, { label: r.label });
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "role", id: r.id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[POST role] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // DELETE role
  app.delete("/api/data/role/:id", requireAuth, blockNA, requireRole("admin","lead"), withDataTransaction(pool, async function(req, res) {
    try {
      var id = req.params.id;
      await Roles.softDelete(req._tx, id);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "delete", "role", id, {});
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "role-delete", id: id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[DELETE role] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));


  // POST achievement
  app.post("/api/data/achievement", requireAuth, blockNA, requireRole("admin"), validate(achievementSchema), withDataTransaction(pool, async function(req, res) {
    try {
      var a = req.body;
      await Achievements.upsert(req._tx, a);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "save", "achievement", a.id, { title: a.title });
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "achievement", id: a.id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[POST achievement] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // DELETE achievement
  app.delete("/api/data/achievement/:id", requireAuth, blockNA, requireRole("admin"), withDataTransaction(pool, async function(req, res) {
    try {
      var id = req.params.id;
      await Achievements.remove(req._tx, id);
      await logAudit(req._tx, req.session.userId, req.session.displayName, "delete", "achievement", id, {});
      notify(req,{ clientId: req.headers["x-client-id"] || "", type: "achievement-delete", id: id });
      res.json({ ok: true });
    } catch (e) {
      console.error("[DELETE achievement] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  }));

  // SSE
  app.get("/api/events", requireAuth, blockNA, deps.handleSSE);
};
