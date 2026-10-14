/**
 * POST TRACKER - configurable achievements model
 */
module.exports = function createAchievementsModel(pool) {
  function normalize(a) {
    return {
      id: String(a.id || '').trim(),
      title: String(a.title || '').trim(),
      description: String(a.description || ''),
      icon: String(a.icon || ''),
      image: String(a.image || ''),
      color: String(a.color || '#38bdf8'),
      ruleType: String(a.ruleType || a.rule_type || 'shifts_count'),
      threshold: Math.max(1, Number(a.threshold) || 1),
      stageId: String(a.stageId || a.stage_id || ''),
      enabled: a.enabled !== false,
    };
  }

  async function findAll() {
    var result = await pool.query('SELECT * FROM achievements ORDER BY created_at, id');
    return result.rows.map(function(r) {
      return {
        id: r.id,
        title: r.title || '',
        description: r.description || '',
        icon: r.icon || '',
        image: r.image || '',
        color: r.color || '#38bdf8',
        ruleType: r.rule_type || 'shifts_count',
        threshold: r.threshold || 1,
        stageId: r.stage_id || '',
        enabled: r.enabled !== false,
      };
    });
  }

  async function upsert(tx, achievement) {
    var a = normalize(achievement);
    await tx.query(
      `INSERT INTO achievements (id, title, description, icon, image, color, rule_type, threshold, stage_id, enabled)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         image = EXCLUDED.image,
         color = EXCLUDED.color,
         rule_type = EXCLUDED.rule_type,
         threshold = EXCLUDED.threshold,
         stage_id = EXCLUDED.stage_id,
         enabled = EXCLUDED.enabled,
         updated_at = NOW()`,
      [a.id, a.title, a.description, a.icon, a.image, a.color, a.ruleType, a.threshold, a.stageId, a.enabled]
    );
  }

  async function remove(tx, id) {
    await tx.query('DELETE FROM achievements WHERE id=$1', [id]);
  }

  return { findAll: findAll, upsert: upsert, remove: remove, normalize: normalize };
};
