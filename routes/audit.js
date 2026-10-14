const ACTIONS = ['create','update','assign','reschedule','cancel','restore','delete'];
const { PERMISSIONS } = require('../lib/policy');

function integer(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function isoDate(value, endOfDay) {
  if (!value) return '';
  const text = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(text + (endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'))
    : new Date(text);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

module.exports = function registerAuditRoutes(app, pool, deps) {
  app.get('/api/audit/events', deps.requireAuth, deps.requirePermission(PERMISSIONS.AUDIT_VIEW), async function(req, res, next) {
    try {
      const access = await deps.policy.auditScope(req.session);

      const page = integer(req.query.page, 1, 1, 1000000);
      const pageSize = integer(req.query.pageSize, 50, 10, 100);
      const where = [];
      const params = [];
      function add(sql, value) { params.push(value); where.push(sql.replace('?', '$' + params.length)); }

      if (access.projectIds !== null) {
        add('a.project_id=ANY(?::text[])', access.projectIds);
      }
      if (!access.includeRestricted) {
        where.push("a.visibility='standard'");
      }
      if (req.query.projectId) add('a.project_id=?', String(req.query.projectId));
      if (req.query.seriesId) add('a.series_id=?', String(req.query.seriesId));
      if (req.query.actorUserId && /^\d+$/.test(String(req.query.actorUserId))) add('a.user_id=?', Number(req.query.actorUserId));
      if (req.query.action && ACTIONS.includes(String(req.query.action))) add('a.action=?', String(req.query.action));
      if (req.query.entity) add('a.entity=?', String(req.query.entity).slice(0, 50));
      const from = isoDate(req.query.from, false);
      const to = isoDate(req.query.to, true);
      if (from) add('a.occurred_at>=?::timestamptz', from);
      if (to) add('a.occurred_at<=?::timestamptz', to);
      const clause = where.length ? ' WHERE ' + where.join(' AND ') : '';

      const total = Number((await pool.query('SELECT count(*)::int AS total FROM audit_log a' + clause, params)).rows[0].total);
      const listParams = params.slice();
      listParams.push(pageSize, (page - 1) * pageSize);
      const rows = (await pool.query(
        `SELECT a.event_id,a.user_id,a.user_name,a.action,a.entity,a.entity_id,
                a.project_id,a.series_id,a.changes,a.details,a.source,a.reason,
                a.request_id,a.visibility,a.occurred_at,
                p.name AS project_name,s.name AS series_name
         FROM audit_log a
         LEFT JOIN projects p ON p.id=a.project_id
         LEFT JOIN series s ON s.id=a.series_id
         ${clause}
         ORDER BY a.occurred_at DESC,a.id DESC
         LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`, listParams
      )).rows;

      const actorParams = [];
      const actorWhere = [];
      if (access.projectIds !== null) {
        actorParams.push(access.projectIds);
        actorWhere.push('project_id=ANY($1::text[])');
      }
      if (!access.includeRestricted) {
        actorWhere.push("visibility='standard'");
      }
      const actors = (await pool.query(
        `SELECT user_id,user_name,max(occurred_at) AS last_seen FROM audit_log
         ${actorWhere.length ? 'WHERE ' + actorWhere.join(' AND ') : ''}
         GROUP BY user_id,user_name ORDER BY user_name`, actorParams
      )).rows.map(function(row) { return {id:row.user_id,name:row.user_name}; });

      res.setHeader('Cache-Control','no-store');
      res.json({
        events: rows.map(function(row) {
          return {
            id:row.event_id,userId:row.user_id,userName:row.user_name,action:row.action,
            entity:row.entity,entityId:row.entity_id,projectId:row.project_id||'',seriesId:row.series_id||'',
            projectName:row.project_name||'',seriesName:row.series_name||'',changes:row.changes||[],
            details:row.details||{},source:row.source,reason:row.reason||'',visibility:row.visibility,
            occurredAt:row.occurred_at instanceof Date?row.occurred_at.toISOString():row.occurred_at,
          };
        }),
        actors,page,pageSize,total,totalPages:Math.max(1,Math.ceil(total/pageSize)),
      });
    } catch (error) { next(error); }
  });
};
