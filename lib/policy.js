/**
 * Central permission policy for current post-production and producer features.
 * Permissions for modules that do not exist yet deliberately have no role grants.
 */
const PERMISSIONS = Object.freeze({
  POST_READ: 'post.read',
  POST_WRITE: 'post.write',
  POST_PROJECT_CREATE: 'post.project.create',
  POST_PROJECT_VIEW: 'post.project.view',
  POST_PROJECT_EDIT: 'post.project.edit',
  POST_STRUCTURE_DELETE: 'post.structure.delete',
  POST_DIRECTORY_WRITE: 'post.directory.write',
  POST_BIRTHDAY_WRITE: 'post.birthday.write',
  POST_ACHIEVEMENT_WRITE: 'post.achievement.write',
  USERS_LIST: 'users.list',
  USERS_MANAGE: 'users.manage',
  AUDIT_VIEW: 'audit.view',
  AUDIT_VIEW_RESTRICTED: 'audit.view.restricted',
  PRODUCER_READ: 'producer.read',
  PRODUCER_WRITE: 'producer.write',
  FINANCE_VIEW: 'finance.view',
  CONTRACTS_VIEW: 'contracts.view',
  APPROVAL_DECIDE: 'approval.decide',
});

const FUTURE_PERMISSIONS = Object.freeze([
  PERMISSIONS.FINANCE_VIEW,
  PERMISSIONS.CONTRACTS_VIEW,
]);

const ROLE_GRANTS = Object.freeze({
  admin: Object.freeze([
    PERMISSIONS.POST_READ, PERMISSIONS.POST_WRITE, PERMISSIONS.POST_PROJECT_CREATE,
    PERMISSIONS.POST_STRUCTURE_DELETE, PERMISSIONS.POST_DIRECTORY_WRITE,
    PERMISSIONS.POST_BIRTHDAY_WRITE, PERMISSIONS.POST_ACHIEVEMENT_WRITE,
    PERMISSIONS.USERS_LIST, PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.AUDIT_VIEW, PERMISSIONS.AUDIT_VIEW_RESTRICTED,
    PERMISSIONS.PRODUCER_READ, PERMISSIONS.PRODUCER_WRITE, PERMISSIONS.APPROVAL_DECIDE,
  ]),
  lead: Object.freeze([
    PERMISSIONS.POST_READ, PERMISSIONS.POST_WRITE, PERMISSIONS.POST_PROJECT_CREATE,
    PERMISSIONS.POST_STRUCTURE_DELETE, PERMISSIONS.POST_DIRECTORY_WRITE,
    PERMISSIONS.USERS_LIST, PERMISSIONS.AUDIT_VIEW, PERMISSIONS.AUDIT_VIEW_RESTRICTED,
    PERMISSIONS.PRODUCER_READ, PERMISSIONS.PRODUCER_WRITE, PERMISSIONS.APPROVAL_DECIDE,
  ]),
  manager: Object.freeze([
    PERMISSIONS.POST_READ, PERMISSIONS.POST_WRITE, PERMISSIONS.POST_PROJECT_CREATE,
    PERMISSIONS.USERS_LIST, PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.PRODUCER_READ, PERMISSIONS.PRODUCER_WRITE,
  ]),
  editor: Object.freeze([PERMISSIONS.POST_READ, PERMISSIONS.POST_WRITE]),
  viewer: Object.freeze([PERMISSIONS.POST_READ]),
  na: Object.freeze([]),
});

function roleHasPermission(role, permission) {
  const grants = ROLE_GRANTS[String(role || '')];
  return Boolean(grants && grants.includes(permission));
}

function subjectValue(subject, camel, snake) {
  return subject && (subject[camel] !== undefined ? subject[camel] : subject[snake]);
}

function addIdentityKey(keys, value) {
  const key = String(value || '').trim().toLowerCase();
  if (key) keys.add(key);
}

function createPolicy(pool) {
  async function managerIdentityKeys(subject, query) {
    const keys = new Set();
    const userId = subjectValue(subject, 'userId', 'id');
    addIdentityKey(keys, userId);
    addIdentityKey(keys, subjectValue(subject, 'samName', 'sam_name'));
    addIdentityKey(keys, subjectValue(subject, 'displayName', 'display_name'));
    addIdentityKey(keys, subject && subject.email);
    let samName = String(subjectValue(subject, 'samName', 'sam_name') || '');
    let displayName = String(subjectValue(subject, 'displayName', 'display_name') || '');
    let email = String((subject && subject.email) || '');
    if (userId) {
      const user = await query.query('SELECT sam_name,display_name,email FROM users WHERE id=$1', [userId]);
      if (user.rows.length) {
        samName = samName || String(user.rows[0].sam_name || '');
        displayName = displayName || String(user.rows[0].display_name || '');
        email = email || String(user.rows[0].email || '');
        addIdentityKey(keys, user.rows[0].sam_name);
        addIdentityKey(keys, user.rows[0].display_name);
        addIdentityKey(keys, user.rows[0].email);
      }
    }
    if (samName || displayName || email) {
      const person = await query.query(
        "SELECT id,name,login,email FROM people WHERE (($1<>'' AND lower(coalesce(login,''))=lower($1)) OR ($2<>'' AND lower(coalesce(name,''))=lower($2)) OR ($3<>'' AND lower(coalesce(email,''))=lower($3))) LIMIT 1",
        [samName, displayName, email]
      );
      if (person.rows.length) {
        addIdentityKey(keys, person.rows[0].id);
        addIdentityKey(keys, person.rows[0].name);
        addIdentityKey(keys, person.rows[0].login);
        addIdentityKey(keys, person.rows[0].email);
      }
    }
    return Array.from(keys);
  }

  async function managedProjectIds(subject, queryOverride) {
    const query = queryOverride || pool;
    const keys = await managerIdentityKeys(subject || {}, query);
    if (!keys.length) return [];
    const result = await query.query(
      "SELECT DISTINCT project_id FROM project_managers WHERE lower(coalesce(user_uid,''))=ANY($1::text[]) OR lower(coalesce(user_name,''))=ANY($1::text[])",
      [keys]
    );
    return result.rows.map(function(row) { return row.project_id; });
  }

  async function assignedProjectIds(subject, needWrite, queryOverride) {
    const query = queryOverride || pool;
    const userId = subjectValue(subject, 'userId', 'id');
    if (!userId) return [];
    const column = needWrite ? 'can_edit' : 'can_view';
    const result = await query.query(
      'SELECT project_id FROM user_projects WHERE user_id=$1 AND ' + column + '=true',
      [userId]
    );
    return result.rows.map(function(row) { return row.project_id; });
  }

  async function projectScope(subject, needWrite, queryOverride) {
    const role = String((subject && subject.role) || '');
    if (role === 'admin' || role === 'lead') return null;
    if (role === 'manager') return needWrite ? managedProjectIds(subject, queryOverride) : null;
    if (role === 'editor') return assignedProjectIds(subject, needWrite, queryOverride);
    if (role === 'viewer' && !needWrite) return assignedProjectIds(subject, false, queryOverride);
    return [];
  }

  async function can(subject, permission, context) {
    const details = context || {};
    if (permission === PERMISSIONS.POST_PROJECT_VIEW || permission === PERMISSIONS.POST_PROJECT_EDIT) {
      if (!details.projectId) return false;
      const scope = await projectScope(subject, permission === PERMISSIONS.POST_PROJECT_EDIT, details.query);
      return scope === null || scope.includes(String(details.projectId));
    }
    return roleHasPermission(subject && subject.role, permission);
  }

  function requirePermission(permission) {
    return async function(req, res, next) {
      try {
        if (!(await can(req.session || {}, permission))) {
          return res.status(403).json({error:'Недостаточно прав'});
        }
        next();
      } catch (error) { next(error); }
    };
  }

  async function auditScope(subject, queryOverride) {
    if (!(await can(subject, PERMISSIONS.AUDIT_VIEW))) return null;
    return {
      projectIds: subject.role === 'manager' ? await managedProjectIds(subject, queryOverride) : null,
      includeRestricted: await can(subject, PERMISSIONS.AUDIT_VIEW_RESTRICTED),
    };
  }

  return {
    can,
    requirePermission,
    projectScope,
    managedProjectIds,
    auditScope,
  };
}

module.exports = { PERMISSIONS, FUTURE_PERMISSIONS, roleHasPermission, createPolicy };
