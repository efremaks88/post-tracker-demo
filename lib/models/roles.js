/**
 * ПОСТ ТРЕКЕР — Roles model
 */
module.exports = function createRolesModel(pool) {

  async function findAll() {
    var result = await pool.query("SELECT * FROM roles ORDER BY id");
    return result.rows.map(function(r) {
      return { id: r.id, label: r.label, color: r.color };
    });
  }

  async function upsert(tx, role) {
    await tx.query(
      `INSERT INTO roles (id, label, color) VALUES ($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, color=EXCLUDED.color`,
      [role.id, role.label, role.color || '#64748b']
    );
  }

  async function softDelete(tx, id) {
    await tx.query("DELETE FROM roles WHERE id=$1", [id]);
  }

  return { findAll, upsert, softDelete };
};
