/**
 * ПОСТ ТРЕКЕР — Series model
 */
module.exports = function createSeriesModel(pool) {

  async function findAll(allowedProjectIds) {
    var query = `
      SELECT id,project_id,name,"order",shoot_start,shoot_end,edit_start,
        pre_otk_date,otk_date,send_date,air_mode,air_day,air_time,air_date,
        sync_start,transit_code,transit_variants,stage_ranges,checklists,
        notes,delivered,delivered_at,assets,manual_status,custom_milestones
      FROM series WHERE deleted != true OR deleted IS NULL ORDER BY "order"
    `;
    var params = [];
    if (allowedProjectIds) {
      query = `
        SELECT id,project_id,name,"order",shoot_start,shoot_end,edit_start,
          pre_otk_date,otk_date,send_date,air_mode,air_day,air_time,air_date,
          sync_start,transit_code,transit_variants,stage_ranges,checklists,
          notes,delivered,delivered_at,assets,manual_status,custom_milestones
        FROM series WHERE project_id = ANY($1::text[]) AND (deleted != true OR deleted IS NULL) ORDER BY "order"
      `;
      params = [allowedProjectIds];
    }
    var result = await pool.query(query, params);
    return result.rows.map(function(r) {
      return { id: r.id, projectId: r.project_id, name: r.name, order: r.order,
        shootStart: r.shoot_start||"", shootEnd: r.shoot_end||"", editStart: r.edit_start||"",
        preOtkDate: r.pre_otk_date||"", otkDate: r.otk_date||"", sendDate: r.send_date||"",
        airMode: r.air_mode||"weekly", airDay: r.air_day??1, airTime: r.air_time||"21:00",
        airDate: r.air_date||"", syncStart: r.sync_start||"", transitCode: r.transit_code||"",
        transitVariants: r.transit_variants||["","",""], stageRanges: r.stage_ranges||{},
        checklists: r.checklists||[], notes: r.notes||"", delivered: r.delivered||false,
        deliveredAt: r.delivered_at||"", assets: r.assets||[], manualStatus: r.manual_status||"", customMilestones: r.custom_milestones||[] };
    });
  }

  async function upsert(tx, s) {
    await tx.query(
      `INSERT INTO series (id,project_id,name,"order",shoot_start,shoot_end,edit_start,
         pre_otk_date,otk_date,send_date,air_mode,air_day,air_time,air_date,
         sync_start,transit_code,transit_variants,stage_ranges,checklists,
         notes,delivered,delivered_at,assets,manual_status,custom_milestones,deleted)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
         $17::jsonb,$18::jsonb,$19::jsonb,$20,$21,$22,$23::jsonb,$24,$25::jsonb,$26)
       ON CONFLICT (id) DO UPDATE SET
         project_id=EXCLUDED.project_id, name=EXCLUDED.name,
         "order"=EXCLUDED."order",
         shoot_start=EXCLUDED.shoot_start, shoot_end=EXCLUDED.shoot_end,
         edit_start=EXCLUDED.edit_start, pre_otk_date=EXCLUDED.pre_otk_date,
         otk_date=EXCLUDED.otk_date, send_date=EXCLUDED.send_date,
         air_mode=EXCLUDED.air_mode, air_day=EXCLUDED.air_day,
         air_time=EXCLUDED.air_time, air_date=EXCLUDED.air_date,
         sync_start=EXCLUDED.sync_start, transit_code=EXCLUDED.transit_code,
         transit_variants=EXCLUDED.transit_variants,
         stage_ranges=EXCLUDED.stage_ranges,
         checklists=EXCLUDED.checklists,
         notes=EXCLUDED.notes, delivered=EXCLUDED.delivered,
         delivered_at=EXCLUDED.delivered_at, assets=EXCLUDED.assets,
         manual_status=EXCLUDED.manual_status,
         custom_milestones=EXCLUDED.custom_milestones, deleted=EXCLUDED.deleted,
         updated_at=NOW()`,
      [s.id, s.projectId, s.name||"", s.order||0, s.shootStart||"", s.shootEnd||"",
       s.editStart||"", s.preOtkDate||"", s.otkDate||"", s.sendDate||"",
       s.airMode||"weekly", s.airDay??1, s.airTime||"21:00", s.airDate||"",
       s.syncStart||"", s.transitCode||"",
       JSON.stringify(s.transitVariants||["","",""]),
       JSON.stringify(s.stageRanges||{}), JSON.stringify(s.checklists||[]),
       s.notes||"", s.delivered||false, s.deliveredAt||"",
       JSON.stringify(s.assets||[]), s.manualStatus||"", JSON.stringify(s.customMilestones||[]),s.deleted===true]
    );
  }

  async function softDelete(tx, id) {
    await tx.query("UPDATE series SET deleted=true, updated_at=NOW() WHERE id=$1", [id]);
  }

  async function getProjectId(tx, id) {
    var result = await tx.query("SELECT project_id FROM series WHERE id=$1", [id]);
    return result.rows.length > 0 ? result.rows[0].project_id : null;
  }

  return { findAll, upsert, softDelete, getProjectId };
};
