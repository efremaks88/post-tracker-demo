/**
 * ПОСТ ТРЕКЕР — Users model
 */
module.exports = function createUsersModel(pool) {

  async function findAll() {
    var result = await pool.query(
      "SELECT id, sam_name, display_name, email, role, ad_groups, ad_enabled, last_login FROM users ORDER BY role, display_name"
    );
    return result.rows;
  }

  async function setRole(id, role) {
    var result = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, sam_name, display_name, role",
      [role, id]
    );
    return result.rows[0] || null;
  }

  async function setProjects(id, projects, assignedBy) {
    const tx=await pool.connect();
    try {
    await tx.query('BEGIN');
    await tx.query("DELETE FROM user_projects WHERE user_id=$1", [id]);
    for (var i = 0; i < projects.length; i++) {
      var p = projects[i];
      await tx.query(
        "INSERT INTO user_projects (user_id, project_id, can_view, can_edit, assigned_by) VALUES ($1,$2,$3,$4,$5)",
        [id, p.project_id, p.can_view !== false, p.can_edit === true, assignedBy]
      );
    }
    await tx.query('COMMIT');
    } catch(error) { await tx.query('ROLLBACK'); throw error; }
    finally { tx.release(); }
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

  async function getProjects(userId, needWrite) {
    var col = needWrite ? "can_edit" : "can_view";
    var result = await pool.query(
      "SELECT project_id FROM user_projects WHERE user_id = $1 AND " + col + " = true",
      [userId]
    );
    return result.rows.map(function(r) { return r.project_id; });
  }

  async function checkAccess(userId, role, projectId, needWrite) {
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

  return { findAll, setRole, setProjects, getProjects, checkAccess, cleanupSessions };
};
