/**
 * ПОСТ ТРЕКЕР — RBAC модуль
 *
 * Middleware и хелперы для контроля доступа на основе ролей
 */
module.exports = function createRBAC(pool) {

  async function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Не авторизован" });
    }
    try {
      const result=await pool.query('SELECT role,ad_enabled,sam_name,display_name,email FROM users WHERE id=$1',[req.session.userId]);
      const user=result.rows[0];
      if(!user||user.ad_enabled===false) return res.status(401).json({error:'Учётная запись недоступна'});
      req.session.role=user.role;
      req.session.samName=user.sam_name;
      req.session.displayName=user.display_name;
      req.session.email=user.email;
      next();
    } catch(error) { next(error); }
  }

  function requireRole() {
    var roles = Array.prototype.slice.call(arguments);
    return function(req, res, next) {
      if (!req.session || !req.session.role || roles.indexOf(req.session.role) === -1) {
        return res.status(403).json({ error: "Недостаточно прав" });
      }
      next();
    };
  }

  function blockNA(req, res, next) {
    if (req.session && req.session.role === "na") {
      return res.status(403).json({ error: "Доступ запрещён — роль NA" });
    }
    next();
  }

  function requireWrite(req, res, next) {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: "Не авторизован" });
    var role = req.session.role;
    if (role === "admin" || role === "lead" || role === "manager") return next();
    if (role === "viewer" || role === "na") {
      return res.status(403).json({ error: "Недостаточно прав для записи" });
    }
    if(role==='editor') return next();
    return res.status(403).json({error:'Недостаточно прав для записи'});
  }


  function addAccessKey(keys, value) {
    var k = String(value || '').trim().toLowerCase();
    if (k) keys[k] = true;
  }

  async function managerProjectAccess(userId, projectId) {
    if (!userId || !projectId) return false;
    var keys = {};
    var user = await pool.query("SELECT id,sam_name,display_name,email FROM users WHERE id=$1", [userId]);
    if (!user.rows.length) return false;
    addAccessKey(keys, user.rows[0].id);
    addAccessKey(keys, user.rows[0].sam_name);
    addAccessKey(keys, user.rows[0].display_name);
    addAccessKey(keys, user.rows[0].email);
    try {
      var person = await pool.query(
        "SELECT id,name,login,email FROM people WHERE ($1<>'' AND lower(coalesce(login,''))=lower($1)) OR ($2<>'' AND lower(coalesce(name,''))=lower($2)) OR ($3<>'' AND lower(coalesce(email,''))=lower($3)) LIMIT 1",
        [user.rows[0].sam_name || '', user.rows[0].display_name || '', user.rows[0].email || '']
      );
      if (person.rows.length) {
        addAccessKey(keys, person.rows[0].id);
        addAccessKey(keys, person.rows[0].name);
        addAccessKey(keys, person.rows[0].login);
        addAccessKey(keys, person.rows[0].email);
      }
    } catch (e) {}
    var list = Object.keys(keys);
    if (!list.length) return false;
    var result = await pool.query(
      "SELECT 1 FROM project_managers WHERE project_id=$1 AND (lower(coalesce(user_uid,'')) = ANY($2::text[]) OR lower(coalesce(user_name,'')) = ANY($2::text[])) LIMIT 1",
      [String(projectId), list]
    );
    return result.rows.length > 0;
  }

  async function getUserProjects(userId, needWrite) {
    var col = needWrite ? "can_edit" : "can_view";
    var result = await pool.query(
      "SELECT project_id FROM user_projects WHERE user_id = $1 AND " + col + " = true",
      [userId]
    );
    return result.rows.map(function(r) { return r.project_id; });
  }

  async function checkProjectAccess(userId, role, projectId, needWrite) {
    if (role === "admin" || role === "lead") return true;
    if (role === "manager") return needWrite ? await managerProjectAccess(userId, projectId) : true;
    if (role === "na" || role === "viewer") return false;
    if (role === "editor") {
      var col = needWrite ? "can_edit" : "can_view";
      var result = await pool.query(
        "SELECT " + col + " FROM user_projects WHERE user_id = $1 AND project_id = $2",
        [userId, projectId]
      );
      return result.rows.length > 0 && result.rows[0][col] === true;
    }
    return false;
  }

  return {
    requireAuth: requireAuth,
    requireRole: requireRole,
    blockNA: blockNA,
    requireWrite: requireWrite,
    getUserProjects: getUserProjects,
    checkProjectAccess: checkProjectAccess,
  };
};
