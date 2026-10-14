/**
 * ПОСТ ТРЕКЕР — RBAC модуль
 *
 * Middleware и хелперы для контроля доступа на основе ролей
 */
const { PERMISSIONS, createPolicy } = require('./policy');

module.exports = function createRBAC(pool, providedPolicy) {
  const policy = providedPolicy || createPolicy(pool);

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
    return policy.requirePermission(PERMISSIONS.POST_WRITE)(req, res, next);
  }

  async function getUserProjects(userId, needWrite) {
    var column = needWrite ? 'can_edit' : 'can_view';
    var result = await pool.query('SELECT project_id FROM user_projects WHERE user_id=$1 AND ' + column + '=true', [userId]);
    return result.rows.map(function(row) { return row.project_id; });
  }

  async function checkProjectAccess(userId, role, projectId, needWrite) {
    return policy.can({userId:userId, role:role}, needWrite ? PERMISSIONS.POST_PROJECT_EDIT : PERMISSIONS.POST_PROJECT_VIEW, {projectId:projectId});
  }

  return {
    requireAuth: requireAuth,
    requireRole: requireRole,
    blockNA: blockNA,
    requireWrite: requireWrite,
    getUserProjects: getUserProjects,
    checkProjectAccess: checkProjectAccess,
    requirePermission: policy.requirePermission,
    policy: policy,
  };
};
