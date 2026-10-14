/** 
 * ПОСТ ТРЕКЕР — Data access layer
 * Pool, transactions, audit, generic utilities
 */
const { Pool } = require("pg");

let pool = null;
function initPool(config) {
  pool = new Pool({
    host:      config.DB_HOST     || "localhost",
    port:      Number(config.DB_PORT) || 5432,
    database: config.DB_NAME     || "postprod_tracker",
    user:     config.DB_USER     || "postprod_user",
    password: config.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  return pool;
}

function getPool() {
  if (!pool) throw new Error("DB not initialized");
  return pool;
}

// Transaction middleware
function withTransaction(pool, handler) {
  return async function(req, res, next) {
    let client;
    let responseBody;
    let queued = false;
    const originalJson = res.json;
    // Do not acknowledge a write until PostgreSQL has committed it.
    res.json = function(body) { responseBody = body; queued = true; return res; };
    req._afterCommit = [];
    try {
      client = await pool.connect();
      await client.query('BEGIN');
      req._tx = client;
      await handler(req, res);
      if (!queued) throw new Error('Transaction handler did not provide a response');
      if (res.statusCode >= 400) {
        await client.query('ROLLBACK');
      } else {
        await client.query('COMMIT');
        for (const callback of req._afterCommit) callback();
      }
      res.json = originalJson;
      return res.json(responseBody);
    } catch (e) {
      if (client) { try { await client.query('ROLLBACK'); } catch(er) {} }
      res.json = originalJson;
      if (next) return next(e);
      throw e;
    } finally {
      res.json = originalJson;
      if (client) client.release();
      delete req._tx;
      delete req._afterCommit;
    }
  };
}

// Audit log
async function ensureAuditTable(pool) {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        event_id TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        user_name TEXT NOT NULL DEFAULT '',
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT NOT NULL DEFAULT '',
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        project_id TEXT,
        series_id TEXT,
        changes JSONB NOT NULL DEFAULT '[]'::jsonb,
        source TEXT NOT NULL DEFAULT 'user',
        reason TEXT NOT NULL DEFAULT '',
        request_id TEXT NOT NULL DEFAULT '',
        visibility TEXT NOT NULL DEFAULT 'standard'
      )
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC)`);
    console.log('[AUDIT] Table ready');
  } catch(e) {
    console.error('[AUDIT] Init error:', e.message);
  }
}

async function logAudit(pool, userId, userName, action, entity, entityId, details) {
  try {
    const eventId = require('crypto').randomUUID();
    await pool.query(
      "INSERT INTO audit_log (event_id,user_id,user_name,action,entity,entity_id,details,occurred_at,source,request_id) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,NOW(),'system',$1)",
      [eventId, userId, userName || '', action, entity, entityId || '', JSON.stringify(details || {})]
    );
  } catch(e) {
    console.error('[AUDIT] Log error:', e.message);
    throw e;
  }
}

// Merge arrays (client-server sync for legacy)
function mergeArrays(dbArr, clientArr) {
  if (!Array.isArray(dbArr)) dbArr = [];
  if (!Array.isArray(clientArr)) clientArr = [];
  var result = new Map();
  for (var i = 0; i < dbArr.length; i++) result.set(dbArr[i].id, dbArr[i]);
  for (var i = 0; i < clientArr.length; i++) {
    var item = clientArr[i];
    var db = result.get(item.id);
    if (!db || (item._updatedAt || 0) >= (db._updatedAt || 0))
      result.set(item.id, item);
  }
  return Array.from(result.values()).filter(function(item) { return !item.deleted; });
}

module.exports = {
  initPool,
  getPool,
  withTransaction,
  ensureAuditTable,
  logAudit,
  mergeArrays,
};
