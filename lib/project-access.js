function addAccessKey(keys, value) {
  var k = String(value || '').trim().toLowerCase();
  if (k) keys[k] = true;
}

async function getSessionPersonKeys(tx, req) {
  var keys = {};
  addAccessKey(keys, req.session && req.session.userId);
  addAccessKey(keys, req.session && req.session.samName);
  addAccessKey(keys, req.session && req.session.displayName);
  addAccessKey(keys, req.session && req.session.email);
  try {
    var person = await tx.query(
      "SELECT id,name,login,email FROM people WHERE (($1 <> '' AND lower(coalesce(login,''))=lower($1)) OR ($2 <> '' AND lower(coalesce(name,''))=lower($2)) OR ($3 <> '' AND lower(coalesce(email,''))=lower($3))) LIMIT 1",
      [req.session.samName || '', req.session.displayName || '', req.session.email || '']
    );
    if (person.rows.length) {
      addAccessKey(keys, person.rows[0].id);
      addAccessKey(keys, person.rows[0].name);
      addAccessKey(keys, person.rows[0].login);
      addAccessKey(keys, person.rows[0].email);
    }
  } catch (e) {}
  return Object.keys(keys);
}

async function managerCanEditProject(tx, req, projectId) {
  if (!req.session) return false;
  if (req.session.role === "admin" || req.session.role === "lead") return true;
  if (req.session.role !== "manager") return false;
  if (!projectId) return false;
  var keys = await getSessionPersonKeys(tx, req);
  if (!keys.length) return false;
  var result = await tx.query(
    "SELECT 1 FROM project_managers WHERE project_id=$1 AND (lower(coalesce(user_uid,'')) = ANY($2::text[]) OR lower(coalesce(user_name,'')) = ANY($2::text[])) LIMIT 1",
    [String(projectId), keys]
  );
  return result.rows.length > 0;
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

async function managerCanWriteTask(tx, req, task) {
  if (!req.session || req.session.role !== "manager") return true;
  var incomingProject = task && task.project;
  if (!incomingProject || !(await managerCanEditProject(tx, req, incomingProject))) return false;
  if (task && task.id) {
    var oldProject = await tx.query("SELECT project_id FROM tasks WHERE id::text=$1 AND (deleted != true OR deleted IS NULL)", [String(task.id)]);
    if (oldProject.rows.length && !(await managerCanEditProject(tx, req, oldProject.rows[0].project_id))) return false;
  }
  return true;
}

module.exports = { managerCanEditProject, sanitizeProjectForManager, managerCanWriteTask };
