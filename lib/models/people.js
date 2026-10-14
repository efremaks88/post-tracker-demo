/**
 * ПОСТ ТРЕКЕР — People model
 */
module.exports = function createPeopleModel(pool) {

  async function findAll() {
    var result = await pool.query("SELECT * FROM people WHERE deleted != true OR deleted IS NULL ORDER BY name");
    return result.rows.map(function(r) {
      return { id: r.id, name: r.name, email: r.email, login: r.login,
        birthday: r.birthday||'', roles: r.roles||[], active: r.active!==false,
        allowParallel: r.allow_parallel===true };
    });
  }

  async function upsert(tx, pr) {
    const previous = await tx.query('SELECT name FROM people WHERE id=$1', [pr.id]);
    await tx.query(
      `INSERT INTO people (id,name,email,login,birthday,roles,active,allow_parallel,deleted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name, email=EXCLUDED.email, login=EXCLUDED.login,
         birthday=EXCLUDED.birthday, roles=EXCLUDED.roles, active=EXCLUDED.active,
         allow_parallel=EXCLUDED.allow_parallel, deleted=EXCLUDED.deleted, updated_at=NOW()`,
      [pr.id, pr.name, pr.email||"", pr.login||"", pr.birthday||"", pr.roles||[],
       pr.active!==false, pr.allowParallel||false,pr.deleted===true]
    );
    if (previous.rows.length && previous.rows[0].name !== pr.name) {
      await tx.query('UPDATE tasks SET person=$1 WHERE person=$2', [pr.name, previous.rows[0].name]);
      await tx.query('UPDATE person_absences SET person_name=$1 WHERE person_id=$2', [pr.name, pr.id]);
    }
  }

  async function softDelete(tx, id) {
    await tx.query("UPDATE people SET deleted=true WHERE id=$1", [id]);
  }

  return { findAll, upsert, softDelete };
};
