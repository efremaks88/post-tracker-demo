// POST TRACKER — shared data persistence. The caller supplies a transaction.
const createProjects = require('./projects');
const createSeries = require('./series');
const createTasks = require('./tasks');
const createPeople = require('./people');
const createRoles = require('./roles');
const createAchievements = require('./achievements');
const {inputError} = require('../validation');
const {sanitizeProjectsForClient} = require('../project-secrets');

module.exports = function createDataModel(pool) {
  async function loadAll(allowedProjects, userId, query=pool) {
    const revision=(await query.query("SELECT value FROM app_state WHERE key='revision' FOR SHARE")).rows[0];
    const account=(await query.query('SELECT role FROM users WHERE id=$1',[userId])).rows[0];
    const results = await Promise.all([
      createProjects(query).findAll(allowedProjects), createSeries(query).findAll(allowedProjects),
      createTasks(query).findAll(allowedProjects), createPeople(query).findAll(),
      query.query('SELECT * FROM roles ORDER BY id'), query.query('SELECT * FROM stages ORDER BY "order"'),
      query.query('SELECT * FROM stage_groups ORDER BY "order"'), query.query('SELECT date FROM holidays ORDER BY date'),
      createAchievements(query).findAll(),
      query.query('SELECT * FROM person_absences WHERE deleted IS NOT TRUE ORDER BY start_day,person_name'),
      query.query('SELECT key,value FROM app_state WHERE key=ANY($1::text[])', [['templates','changelog:'+userId]]),
    ]);
    const state = Object.fromEntries(results[10].rows.map(r => [r.key,r.value]));
    if(!['admin','lead','manager'].includes(account?.role)) results[2].forEach(t=>{t.note='';});
    return {
      projects:sanitizeProjectsForClient(results[0]), series:results[1], tasks:results[2], people:results[3],
      roles:results[4].rows.map(r => ({id:r.id,label:r.label,color:r.color})),
      stages:results[5].rows.map(r => ({id:r.id,label:r.label,color:r.color,order:r.order,
        groupId:r.group_id||'',needsExecutor:r.needs_executor!==false,rolesRequired:r.roles_required||[],noImpact:r.no_impact===true})),
      stageGroups:results[6].rows.map(r => ({id:r.id,label:r.label,order:r.order})),
      holidays:results[7].rows.map(r => r.date), achievements:results[8],
      personAbsences:results[9].rows.map(r => ({id:r.id,personId:r.person_id||'',personName:r.person_name||'',
        type:r.type||'dayoff',startDay:r.start_day,endDay:r.end_day,note:r.note||'',
        updatedAt:r.updated_at?r.updated_at.toISOString():''})),
      templates:state.templates||[],changelog:state['changelog:'+userId]||[],_savedAt:Date.now(),_clientId:'',_revision:Number(revision?.value||0)
    };
  }

  async function syncAll(data, tx, userId) {
    if (!tx) throw new Error('syncAll requires a transaction');
    const models = {projects:createProjects(tx),series:createSeries(tx),tasks:createTasks(tx),
      people:createPeople(tx),roles:createRoles(tx),achievements:createAchievements(tx)};
    for (const key of ['projects','series','people','tasks','roles','achievements']) {
      if (!Array.isArray(data[key])) continue;
      for (const item of data[key]) {
        if(key==='series'&&!item.deleted){
          const parent=await tx.query('SELECT deleted FROM projects WHERE id=$1',[item.projectId]);
          if(!parent.rows.length)throw inputError('Серия должна принадлежать существующему проекту');
          if(parent.rows[0].deleted)continue;
        }
        if(key==='tasks'&&!item.deleted){
          const parent=await tx.query('SELECT deleted FROM projects WHERE id=$1',[item.project]);
          if(!parent.rows.length) throw inputError('Задача должна принадлежать существующему проекту');
          if(parent.rows[0].deleted) continue;
          if(item.seriesId){
            const series=await tx.query('SELECT project_id,deleted FROM series WHERE id=$1',[item.seriesId]);
            if(!series.rows.length||series.rows[0].project_id!==item.project)throw inputError('Серия задачи принадлежит другому проекту или не существует');
            if(series.rows[0].deleted)continue;
          }
        }
        if (item.deleted) {
          if (key==='tasks') await models.tasks.upsert(tx,item);
          else if (models[key].softDelete) await models[key].softDelete(tx,item.id);
          else await models[key].remove(tx,item.id);
          if (key==='projects') {
            await tx.query('UPDATE series SET deleted=true,updated_at=NOW() WHERE project_id=$1',[item.id]);
            await tx.query('UPDATE tasks SET deleted=true,updated_at=NOW() WHERE project_id=$1',[item.id]);
          }
          if (key==='series') await tx.query('UPDATE tasks SET deleted=true,updated_at=NOW() WHERE series_id=$1',[item.id]);
        } else {
          await models[key].upsert(tx,item);
        }
      }
    }
    // These are complete shared directories, so absence from the list means removal.
    for (const key of ['roles','achievements']) {
      if (Array.isArray(data[key])) await tx.query('DELETE FROM '+key+' WHERE NOT (id=ANY($1::text[]))',[data[key].filter(x=>!x.deleted).map(x=>x.id)]);
    }
    if (Array.isArray(data.stages)) {
      for (const s of data.stages) await tx.query(
        'INSERT INTO stages (id,label,color,"order",group_id,needs_executor,roles_required,no_impact) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label,color=EXCLUDED.color,"order"=EXCLUDED."order",group_id=EXCLUDED.group_id,needs_executor=EXCLUDED.needs_executor,roles_required=EXCLUDED.roles_required,no_impact=EXCLUDED.no_impact',
        [s.id,s.label,s.color,s.order,s.groupId||'',s.needsExecutor!==false,s.rolesRequired||[],s.noImpact===true]);
      await tx.query('DELETE FROM stages WHERE NOT (id=ANY($1::text[]))',[data.stages.map(s=>s.id)]);
    }
    if (Array.isArray(data.stageGroups)) {
      for (const g of data.stageGroups) await tx.query('INSERT INTO stage_groups (id,label,"order") VALUES ($1,$2,$3) ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label,"order"=EXCLUDED."order"',[g.id,g.label,g.order]);
      await tx.query('DELETE FROM stage_groups WHERE NOT (id=ANY($1::text[]))',[data.stageGroups.map(g=>g.id)]);
    }
    if (Array.isArray(data.holidays)) {
      await tx.query('DELETE FROM holidays');
      for (const day of data.holidays) await tx.query('INSERT INTO holidays(date) VALUES ($1) ON CONFLICT DO NOTHING',[day]);
    }
    if (Array.isArray(data.personAbsences)) {
      for (const a of data.personAbsences) await tx.query(
        'INSERT INTO person_absences(id,person_id,person_name,type,start_day,end_day,note,deleted,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::timestamptz) ON CONFLICT(id) DO UPDATE SET person_id=EXCLUDED.person_id,person_name=EXCLUDED.person_name,type=EXCLUDED.type,start_day=EXCLUDED.start_day,end_day=EXCLUDED.end_day,note=EXCLUDED.note,deleted=EXCLUDED.deleted,updated_at=EXCLUDED.updated_at WHERE person_absences.updated_at IS NULL OR EXCLUDED.updated_at>=person_absences.updated_at',
        [a.id,a.personId||'',a.personName||'',a.type||'dayoff',a.startDay,a.endDay||a.startDay,a.note||'',a.deleted===true,a._updatedAt?new Date(a._updatedAt).toISOString():(a.updatedAt||new Date().toISOString())]);
    }
    for (const [key,value] of [['templates',data.templates],['changelog:'+userId,data.changelog]]) {
      if (Array.isArray(value)) await tx.query('INSERT INTO app_state(key,value) VALUES($1,$2::jsonb) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()',[key,JSON.stringify(value)]);
    }
  }
  return {syncAll,loadAll};
};
