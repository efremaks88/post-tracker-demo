/**
 * ПОСТ ТРЕКЕР — Projects model
 * Project managers stored in separate project_managers table
 */
module.exports = function createProjectsModel(pool) {

  async function findAll(allowedProjects) {
    var query = "SELECT * FROM projects WHERE deleted != true OR deleted IS NULL ORDER BY name";
    var params = [];
    if (allowedProjects) {
      query = "SELECT * FROM projects WHERE id = ANY($1::text[]) AND (deleted != true OR deleted IS NULL) ORDER BY name";
      params = [allowedProjects];
    }
    var result = await pool.query(query, params);
    var projects = result.rows.map(function(r) {
      return { id: r.id, name: r.name, abbr: r.abbr, description: r.description,
        color: r.color, status: r.status, season: r.season,
        dossier: r.dossier || {} };
    });

    // Load managers for all projects
    if (projects.length > 0) {
      var ids = projects.map(function(p) { return p.id; });
      var mgrRes = await pool.query(
        "SELECT project_id, user_uid, user_name FROM project_managers WHERE project_id = ANY($1::text[])",
        [ids]
      );
      var mgrMap = {};
      mgrRes.rows.forEach(function(m) {
        if (!mgrMap[m.project_id]) mgrMap[m.project_id] = [];
        mgrMap[m.project_id].push({ uid: m.user_uid, name: m.user_name });
      });
      projects.forEach(function(p) {
        p.managers = mgrMap[p.id] || [];
      });
    }

    return projects;
  }

  async function upsert(tx, p) {
    await tx.query(
      "INSERT INTO projects (id,name,abbr,description,color,status,season,dossier,deleted)" +
      " VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)" +
      " ON CONFLICT (id) DO UPDATE SET" +
      "   name=EXCLUDED.name, abbr=EXCLUDED.abbr, description=EXCLUDED.description," +
      "   color=EXCLUDED.color, status=EXCLUDED.status," +
      "   season=EXCLUDED.season, dossier=EXCLUDED.dossier, deleted=EXCLUDED.deleted, updated_at=NOW()",
      [p.id, p.name||"", p.abbr||"", p.description||"", p.color,
       p.status||"в работе", p.season||"", JSON.stringify(p.dossier||{}),p.deleted===true]
    );

    // Sync managers
    await tx.query("DELETE FROM project_managers WHERE project_id = $1", [p.id]);
    if (p.managers && p.managers.length > 0) {
      for (var i = 0; i < p.managers.length; i++) {
        var mgr = p.managers[i];
        await tx.query(
          "INSERT INTO project_managers (project_id, user_uid, user_name) VALUES ($1, $2, $3)",
          [p.id, mgr.uid || mgr.name || mgr, mgr.name || mgr.uid || mgr]
        );
      }
    }
  }

  async function softDelete(tx, id) {
    await tx.query("DELETE FROM project_managers WHERE project_id = $1", [id]);
    await tx.query("UPDATE projects SET deleted=true, updated_at=NOW() WHERE id=$1", [id]);
  }

  return { findAll, upsert, softDelete };
};
