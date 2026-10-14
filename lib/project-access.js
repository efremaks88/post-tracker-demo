const { PERMISSIONS, createPolicy } = require('./policy');

async function managerCanEditProject(tx, req, projectId) {
  return createPolicy(tx).can(req.session || {}, PERMISSIONS.POST_PROJECT_EDIT, {projectId:projectId, query:tx});
}

async function getProjectSnapshot(tx, projectId) {
  var result = await tx.query("SELECT id,status FROM projects WHERE id=$1 AND (deleted != true OR deleted IS NULL)", [String(projectId || '')]);
  if (!result.rows.length) return null;
  var managers = await tx.query("SELECT user_uid,user_name FROM project_managers WHERE project_id=$1", [String(projectId || '')]);
  return {
    id: result.rows[0].id,
    status: result.rows[0].status,
    managers: managers.rows.map(function(m) { return { uid:m.user_uid || m.user_name || '', name:m.user_name || m.user_uid || '' }; })
  };
}

function managerSelfAssignment(req) {
  var uid = String((req.session && (req.session.samName || req.session.userId || req.session.displayName)) || '').trim();
  var name = String((req.session && (req.session.displayName || req.session.samName)) || uid).trim();
  return uid || name ? [{ uid:uid || name, name:name || uid }] : [];
}

async function sanitizeProjectForManager(tx, req, project) {
  if (!req.session || req.session.role !== "manager") return project;
  var existing = await getProjectSnapshot(tx, project.id);
  if (!existing) {
    const deletedProject=await tx.query("SELECT id FROM projects WHERE id=$1",[project.id]);
    if(deletedProject.rows.length)return null;
    return Object.assign({}, project, {
      status: "\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",
      managers: managerSelfAssignment(req),
      deleted: false
    });
  }
  if (!(await managerCanEditProject(tx, req, project.id))) return null;
  return Object.assign({}, project, {
    status: existing.status || "\u0432 \u0440\u0430\u0431\u043e\u0442\u0435",
    managers: existing.managers,
    deleted: false
  });
}

module.exports = { managerCanEditProject, sanitizeProjectForManager };
