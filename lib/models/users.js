/**
 * ПОСТ ТРЕКЕР — Users model
 */
module.exports = function createUsersModel(pool) {
  const { PERMISSIONS, createPolicy } = require('../policy');
  const policy = createPolicy(pool);

  async function findAll() {
    var result = await pool.query(
      "SELECT id, sam_name, display_name, email, role, ad_groups, ad_enabled, last_login FROM users ORDER BY role, display_name"
    );
    return result.rows;
  }

  async function setRoleTx(query, id, role) {
    var result = await query.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, sam_name, display_name, role",
      [role, id]
    );
    return result.rows[0] || null;
  }

  async function setRole(id, role) {
    return setRoleTx(pool, id, role);
  }

  async function setProjectsTx(query, id, projects, assignedBy) {
    await query.query("DELETE FROM user_projects WHERE user_id=$1", [id]);
    for (var i = 0; i < projects.length; i++) {
      var p = projects[i];
      await query.query(
        "INSERT INTO user_projects (user_id, project_id, can_view, can_edit, assigned_by) VALUES ($1,$2,$3,$4,$5)",
        [id, p.project_id, p.can_view !== false, p.can_edit === true, assignedBy]
      );
    }
  }

  async function setProjects(id, projects, assignedBy) {
    const tx=await pool.connect();
    try {
    await tx.query('BEGIN');
    await setProjectsTx(tx, id, projects, assignedBy);
    await tx.query('COMMIT');
    } catch(error) { await tx.query('ROLLBACK'); throw error; }
    finally { tx.release(); }
  }

  async function getProjects(userId, needWrite) {
    var col = needWrite ? "can_edit" : "can_view";
    var result = await pool.query(
      "SELECT project_id FROM user_projects WHERE user_id = $1 AND " + col + " = true",
      [userId]
    );
    return result.rows.map(function(r) { return r.project_id; });
  }

  async function checkAccess(userId, role, projectId, needWrite) {
    return policy.can({userId:userId, role:role}, needWrite ? PERMISSIONS.POST_PROJECT_EDIT : PERMISSIONS.POST_PROJECT_VIEW, {projectId:projectId});
  }

  async function cleanupSessions(userId, currentSid) {
    try {
      if (currentSid) {
        await pool.query("DELETE FROM session WHERE sess->>'userId' = $1 AND sid <> $2",
          [String(userId), currentSid]);
      }
    } catch(e) {
      console.error("[USERS] Session cleanup:", e.message);
    }
  }

  return { findAll, setRole, setRoleTx, setProjects, setProjectsTx, getProjects, checkAccess, cleanupSessions };
};
