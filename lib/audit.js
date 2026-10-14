/**
 * Server-side audit service.
 *
 * It snapshots confirmed database values before and after a mutation and writes
 * the resulting events through the same transaction client. Client history and
 * client-supplied actor/source values are deliberately ignored.
 */
const crypto = require('crypto');

const ALL_ENTITIES = [
  'project', 'series', 'task', 'person', 'role', 'stage', 'stageGroup',
  'holiday', 'achievement', 'absence', 'settings',
  'user', 'userProject',
];

const SECRET_KEY = /(?:password|passwd|pwd|passphrase|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|client[_-]?secret|credential)/i;
const HIDDEN_FIELD = /^(?:note|notes)$/i;
const VOLATILE_FIELD = /^(?:created_at|updated_at)$/i;
const MAX_STRING = 500;
const MAX_ARRAY = 30;

function redactText(value) {
  return String(value)
    .replace(/\b(password|passwd|pwd|passphrase|secret|token|api[_ -]?key|access[_ -]?key|private[_ -]?key|client[_ -]?secret|login|username)\s*[:=]\s*[^\s,;]+/gi, '$1=[скрыто]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [скрыто]');
}

function normalizeScalar(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function safeValue(value, key, depth) {
  depth = depth || 0;
  if (SECRET_KEY.test(String(key || ''))) return '[скрыто]';
  if (HIDDEN_FIELD.test(String(key || ''))) return value ? '[изменено]' : '';
  if (value === null || value === undefined) return value === undefined ? null : value;
  value = normalizeScalar(value);
  if (typeof value === 'string') {
    const safe = redactText(value);
    return safe.length > MAX_STRING ? safe.slice(0, MAX_STRING) + '…' : safe;
  }
  if (typeof value !== 'object') return value;
  if (depth >= 6) return '[сложное значение]';
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY).map(function(item) { return safeValue(item, '', depth + 1); });
  const out = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    if (VOLATILE_FIELD.test(childKey)) continue;
    if (childKey === 'accesses') {
      const list = Array.isArray(childValue) ? childValue : [];
      out.accesses = list.slice(0, MAX_ARRAY).map(function(access) {
        return {
          id: access && typeof access.id === 'string' ? access.id : undefined,
          label: access && typeof access.label === 'string' ? access.label : undefined,
          credentialsStored: !!(access && Object.keys(access).some(function(k) { return SECRET_KEY.test(k) || /^(?:login|username|user)$/i.test(k); })),
        };
      });
      continue;
    }
    if (/^(?:login|username)$/i.test(childKey)) {
      out[childKey] = childValue ? '[скрыто]' : '';
      continue;
    }
    out[childKey] = safeValue(childValue, childKey, depth + 1);
  }
  return out;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return normalizeScalar(value);
  const out = {};
  Object.keys(value).sort().forEach(function(key) {
    if (!VOLATILE_FIELD.test(key)) out[key] = stable(value[key]);
  });
  return out;
}

function equal(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function makeMap(rows, idField) {
  const result = new Map();
  rows.forEach(function(row) { result.set(String(row[idField]), row); });
  return result;
}

async function captureAuditState(query, requested) {
  const entities = new Set(requested && requested.length ? requested : ALL_ENTITIES);
  const state = new Map();

  if (entities.has('project')) {
    const projects = (await query.query('SELECT * FROM projects')).rows;
    const managers = (await query.query('SELECT project_id,user_uid,user_name FROM project_managers ORDER BY project_id,user_uid,user_name')).rows;
    const byProject = {};
    managers.forEach(function(manager) {
      (byProject[manager.project_id] ||= []).push({uid: manager.user_uid, name: manager.user_name});
    });
    projects.forEach(function(project) { project.managers = byProject[project.id] || []; });
    state.set('project', makeMap(projects, 'id'));
  }
  if (entities.has('series')) state.set('series', makeMap((await query.query('SELECT * FROM series')).rows, 'id'));
  if (entities.has('task')) state.set('task', makeMap((await query.query('SELECT * FROM tasks')).rows, 'id'));
  if (entities.has('person')) state.set('person', makeMap((await query.query('SELECT * FROM people')).rows, 'id'));
  if (entities.has('role')) state.set('role', makeMap((await query.query('SELECT * FROM roles')).rows, 'id'));
  if (entities.has('stage')) state.set('stage', makeMap((await query.query('SELECT * FROM stages')).rows, 'id'));
  if (entities.has('stageGroup')) state.set('stageGroup', makeMap((await query.query('SELECT * FROM stage_groups')).rows, 'id'));
  if (entities.has('holiday')) state.set('holiday', makeMap((await query.query('SELECT date FROM holidays')).rows, 'date'));
  if (entities.has('achievement')) state.set('achievement', makeMap((await query.query('SELECT * FROM achievements')).rows, 'id'));
  if (entities.has('absence')) state.set('absence', makeMap((await query.query('SELECT * FROM person_absences')).rows, 'id'));
  if (entities.has('settings')) {
    const rows = (await query.query("SELECT key,value FROM app_state WHERE key='templates'")).rows;
    state.set('settings', makeMap(rows, 'key'));
  }
  if (entities.has('user')) {
    state.set('user', makeMap((await query.query('SELECT id,display_name,role,ad_enabled FROM users')).rows, 'id'));
  }
  if (entities.has('userProject')) {
    const rows = (await query.query('SELECT user_id,project_id,can_view,can_edit,assigned_by FROM user_projects')).rows;
    rows.forEach(function(row) { row.audit_id = String(row.user_id) + ':' + row.project_id; });
    state.set('userProject', makeMap(rows, 'audit_id'));
  }
  return state;
}

function actorFromRequest(req) {
  const reason = redactText(String((req.headers && req.headers['x-change-reason']) || '').trim()).slice(0, 500);
  return {
    userId: req.session && req.session.userId !== undefined && req.session.userId !== null ? Number(req.session.userId) : null,
    userName: String((req.session && req.session.displayName) || 'Система').slice(0, 200),
    source: 'user',
    reason,
    requestId: crypto.randomUUID(),
  };
}

function eventLocation(entity, before, after) {
  const row = after || before || {};
  if (entity === 'project') return {projectId: String(row.id || ''), seriesId: ''};
  if (entity === 'series') return {projectId: String(row.project_id || ''), seriesId: String(row.id || '')};
  if (entity === 'task') return {projectId: String(row.project_id || ''), seriesId: String(row.series_id || '')};
  if (entity === 'userProject') return {projectId: String(row.project_id || ''), seriesId: ''};
  return {projectId: '', seriesId: ''};
}

function eventLabel(entity, before, after) {
  const row = after || before || {};
  if (entity === 'task') return [row.series, row.status, row.person].filter(Boolean).join(' · ') || 'Смена ' + row.id;
  if (entity === 'user') return String(row.display_name || ('Пользователь ' + row.id));
  return String(row.name || row.label || row.title || row.date || row.person_name || row.key || row.id || '');
}

function actionFor(entity, before, after, changes) {
  if (!before) return 'create';
  if (!after) return 'delete';
  const fields = new Set(changes.map(function(change) { return change.field; }));
  if (fields.has('deleted')) return after.deleted === true ? 'delete' : 'restore';
  if (entity === 'task') {
    if (fields.has('cancelled')) return after.cancelled === true ? 'cancel' : 'restore';
    if (fields.has('day') || fields.has('from') || fields.has('to')) return 'reschedule';
    if (fields.has('person')) return 'assign';
  }
  return 'update';
}

function changedFields(before, after) {
  const keys = new Set(Object.keys(before || {}).concat(Object.keys(after || {})));
  const changes = [];
  Array.from(keys).sort().forEach(function(field) {
    if (VOLATILE_FIELD.test(field)) return;
    const oldValue = before ? before[field] : null;
    const newValue = after ? after[field] : null;
    if (equal(oldValue, newValue)) return;
    changes.push({field, before: safeValue(oldValue, field), after: safeValue(newValue, field)});
  });
  return changes;
}

async function insertAuditEvent(query, context, event) {
  const eventId = crypto.randomUUID();
  const details = {
    label: safeValue(event.label, 'label'),
    bulk: event.bulk === true,
    changedFields: event.changes.map(function(change) { return change.field; }),
  };
  await query.query(
    `INSERT INTO audit_log
      (event_id,user_id,user_name,action,entity,entity_id,project_id,series_id,changes,details,source,reason,request_id,visibility,occurred_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14,NOW())`,
    [eventId, context.userId, context.userName, event.action, event.entity, event.entityId,
      event.projectId || null, event.seriesId || null, JSON.stringify(event.changes), JSON.stringify(details),
      context.source || 'system', context.reason || '', context.requestId || eventId, event.visibility || 'standard']
  );
}

async function recordStateChanges(query, beforeState, afterState, context, options) {
  options = options || {};
  let count = 0;
  const entityNames = new Set(Array.from(beforeState.keys()).concat(Array.from(afterState.keys())));
  for (const entity of entityNames) {
    const beforeMap = beforeState.get(entity) || new Map();
    const afterMap = afterState.get(entity) || new Map();
    const ids = new Set(Array.from(beforeMap.keys()).concat(Array.from(afterMap.keys())));
    for (const id of ids) {
      const before = beforeMap.get(id);
      const after = afterMap.get(id);
      const changes = changedFields(before, after);
      if (!changes.length) continue;
      const location = eventLocation(entity, before, after);
      await insertAuditEvent(query, context, {
        action: actionFor(entity, before, after, changes), entity, entityId: id,
        projectId: location.projectId, seriesId: location.seriesId,
        label: eventLabel(entity, before, after), changes,
        bulk: options.bulk === true,
        visibility: changes.some(function(change) { return HIDDEN_FIELD.test(change.field); }) ? 'restricted' : 'standard',
      });
      count += 1;
    }
  }
  return count;
}

async function auditMutation(req, entities, mutation, options) {
  if (!req._tx) throw new Error('auditMutation requires the active transaction');
  // All application mutations use the same row lock. This prevents one request
  // from attributing another concurrently committed change to the wrong actor.
  await req._tx.query("SELECT value FROM app_state WHERE key='revision' FOR UPDATE");
  const before = await captureAuditState(req._tx, entities);
  const result = await mutation();
  const after = await captureAuditState(req._tx, entities);
  const context = actorFromRequest(req);
  if (options && options.source) context.source = options.source;
  await recordStateChanges(req._tx, before, after, context, options);
  return result;
}

module.exports = {
  ALL_ENTITIES,
  actorFromRequest,
  auditMutation,
  captureAuditState,
  changedFields,
  insertAuditEvent,
  recordStateChanges,
  safeValue,
};
