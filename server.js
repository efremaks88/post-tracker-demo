const express      = require("express");
const path         = require("path");
const session      = require("express-session");
const pgSession    = require("connect-pg-simple")(session);
const cron         = require("node-cron");
const rateLimit    = require("express-rate-limit");
const crypto       = require("crypto");
const fs           = require("fs");
const envPath=path.join(__dirname,'.env');
if(fs.existsSync(envPath)) process.loadEnvFile(envPath);

const { initPool, ensureAuditTable } = require("./lib/db");
const { runMigrations } = require("./lib/migrate");
const createLDAP   = require("./lib/ldap");
const createRBAC   = require("./lib/rbac");
const { createPolicy } = require("./lib/policy");
const createSSE    = require("./lib/sse");
const registerDataRoutes = require("./routes/data");
const { captureAuditState, recordStateChanges } = require("./lib/audit");

const app = express();
app.disable("x-powered-by");
app.set('trust proxy', process.env.TRUST_PROXY === 'false' ? false : (process.env.TRUST_PROXY || 'loopback'));
app.use(express.json({ limit: "5mb" }));

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

function rateLimitKey(req) {
  if (req.session && req.session.userId) return "user:" + req.session.userId;
  var ipKey = rateLimit.ipKeyGenerator ? rateLimit.ipKeyGenerator(req.ip) : req.ip;
  return "ip:" + ipKey;
}

function makeLimiter(windowMs, max, message) {
  return rateLimit({
    windowMs: windowMs,
    max: max,
    keyGenerator: rateLimitKey,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

const apiReadLimiter = makeLimiter(60 * 1000, 600, "Too many read requests");
const apiWriteLimiter = makeLimiter(60 * 1000, 90, "Too many write requests");
const apiAdminLimiter = makeLimiter(5 * 60 * 1000, 40, "Too many admin requests");

function isMutatingMethod(method) {
  return ["POST", "PUT", "PATCH", "DELETE"].indexOf(method) !== -1;
}

function hasSameHttpHost(value, host, protocol) {
  try {
    var url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && url.host === host && (!protocol || url.protocol === protocol+':');
  } catch (e) {
    return false;
  }
}

function isSameOrigin(req) {
  var host = req.get("host");
  if (!host) return false;
  var origin = req.get("origin");
  if (origin) return hasSameHttpHost(origin, host, req.protocol);
  var referer = req.get("referer");
  if (!referer) return false;
  return hasSameHttpHost(referer, host, req.protocol);
}

function safeTokenEqual(a, b) {
  if (!a || !b) return false;
  var aBuf = Buffer.from(String(a));
  var bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function requireCsrf(req, res, next) {
  if (!isMutatingMethod(req.method)) return next();
  if (req.path === "/api/auth/login") return next();
  if (!req.session || !req.session.userId) return next();
  var expected = req.session.csrfToken;
  var got = req.get("X-CSRF-Token");
  if (!isSameOrigin(req)) return res.status(403).json({ error: "Invalid request origin" });
  if (!safeTokenEqual(expected, got)) return res.status(403).json({ error: "Invalid CSRF token" });
  next();
}

// Config
const LOCAL_DEMO_MODE = process.env.LOCAL_DEMO_MODE === 'true';
if (LOCAL_DEMO_MODE && process.env.NODE_ENV === 'production') {
  console.error('[FATAL] LOCAL_DEMO_MODE cannot run with NODE_ENV=production');
  process.exit(1);
}
const PORT = process.env.PORT || 3000;
const HOST = LOCAL_DEMO_MODE ? '127.0.0.1' : (process.env.HOST || '127.0.0.1');
const _sessionSecret = LOCAL_DEMO_MODE ? crypto.randomBytes(48).toString('hex') : process.env.SESSION_SECRET;
const LDAP_URL = process.env.LDAP_URL || "ldap://ldap.example.local:389";
const LDAP_DOMAIN = process.env.LDAP_DOMAIN || "example.local";
const LDAP_BASE_DN = process.env.LDAP_BASE_DN || "dc=example,dc=local";
const LDAP_BIND_DN = process.env.LDAP_BIND_DN || "service-account@example.local";
const _ldapBindPass = process.env.LDAP_BIND_PASSWORD;
const SINGLE_SESSION_PER_USER = process.env.SINGLE_SESSION_PER_USER === "true";

// Initialize the production PostgreSQL pool or the isolated local demo store.
var localDemoModule = null;
const pool = LOCAL_DEMO_MODE ? (function() {
  localDemoModule = require('./lib/local-demo');
  return localDemoModule.createLocalPool(path.join(__dirname, 'local-data', 'pglite'));
})() : initPool({
  DB_HOST:     process.env.DB_HOST     || "localhost",
  DB_PORT:     Number(process.env.DB_PORT) || 5432,
  DB_NAME:     process.env.DB_NAME     || "postprod_tracker",
  DB_USER:     process.env.DB_USER     || "postprod_user",
  DB_PASSWORD: process.env.DB_PASSWORD,
});

// Fail fast if required secrets are missing
if (!LOCAL_DEMO_MODE && !process.env.DB_PASSWORD) {
  console.error("[FATAL] DB_PASSWORD not set in environment");
  process.exit(1);
}
if (!_sessionSecret) {
  console.error("[FATAL] SESSION_SECRET not set in environment");
  process.exit(1);
}
if (!LOCAL_DEMO_MODE && !_ldapBindPass) {
  console.error("[FATAL] LDAP_BIND_PASSWORD not set in environment");
  process.exit(1);
}

// LDAP module
const ldapConfig = {
  LDAP_URL: LDAP_URL,
  LDAP_DOMAIN: LDAP_DOMAIN,
  LDAP_BASE_DN: LDAP_BASE_DN,
  LDAP_BIND_DN: LDAP_BIND_DN,
  LDAP_BIND_PASS: _ldapBindPass,
};
var ldapMod = LOCAL_DEMO_MODE ? {
  syncADUser: async function() { return null; },
  syncAllADUsers: async function() { return 0; },
  listADUsers: async function() { return []; },
  ldapBind: async function() { throw new Error('Directory login is disabled in local demo mode'); },
  ldapSearchUser: async function() { return null; },
  isUserEnabled: function() { return true; },
  initialRoleFromGroups: function() { return 'viewer'; },
} : createLDAP(pool, ldapConfig);

// Central policy is shared by legacy RBAC middleware and all route modules.
var policy = createPolicy(pool);
var rbac = createRBAC(pool, policy);

// SSE module
var sse = createSSE();

// Sessions use PostgreSQL in production and memory on loopback-only local demo.
const sessionOptions = {
  name: "tracker.sid",
  secret: _sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: LOCAL_DEMO_MODE ? false : process.env.COOKIE_SECURE !== 'false',
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  },
};
if (!LOCAL_DEMO_MODE) sessionOptions.store = new pgSession({
    pool: pool,
    tableName: "session",
    createTableIfMissing: true,
    ttl: 24 * 60 * 60,
  });
app.use(session(sessionOptions));

var localDemoUser = { id: 0, sam_name: 'local-demo', display_name: 'Локальный администратор', role: 'admin' };
if (LOCAL_DEMO_MODE) app.use('/api', function(req, res, next) {
  req.session.userId = localDemoUser.id;
  req.session.samName = localDemoUser.sam_name;
  req.session.displayName = localDemoUser.display_name;
  req.session.role = localDemoUser.role;
  next();
});

// CRON: AD sync every 30 minutes
if (!LOCAL_DEMO_MODE) cron.schedule("*/30 * * * *", async () => {
  console.log("[CRON] Starting AD sync...");
  const tx = await pool.connect();
  try {
    await tx.query('BEGIN');
    await tx.query("SELECT value FROM app_state WHERE key='revision' FOR UPDATE");
    const before = await captureAuditState(tx, ['user']);
    const count = await ldapMod.syncAllADUsers(tx);
    const after = await captureAuditState(tx, ['user']);
    await recordStateChanges(tx, before, after, {
      userId:null,userName:'Автоматическая синхронизация',source:'automation',reason:'Плановая синхронизация каталога',requestId:crypto.randomUUID(),
    }, {bulk:true});
    await tx.query('COMMIT');
    console.log("[CRON] AD sync completed: " + count + " users");
  } catch (error) {
    try { await tx.query('ROLLBACK'); } catch (rollbackError) {}
    console.error('[CRON] AD sync failed:', error.message);
  } finally { tx.release(); }
});

// CORS (same host only)
app.use(function(req, res, next) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  const sameHost = !origin || origin === "http://" + host || origin === "https://" + host;
  if (!sameHost) return res.status(403).json({ error: "Forbidden" });
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token, X-Change-Reason");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get('/api/runtime', function(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ mode: LOCAL_DEMO_MODE ? 'local-demo' : 'production', label: LOCAL_DEMO_MODE ? 'DEV · v0.5.0' : '' });
});
app.get('/runtime-config.js', function(req, res) {
  const runtime = { mode: LOCAL_DEMO_MODE ? 'local-demo' : 'production', label: LOCAL_DEMO_MODE ? 'DEV · v0.5.0' : '' };
  res.setHeader('Cache-Control', 'no-store');
  res.type('application/javascript').send('window.__TRACKER_RUNTIME__=' + JSON.stringify(runtime) + ';');
});

app.use("/api/", function(req, res, next) {
  if (req.path === "/events" || req.path === "/auth/login") return next();
  if (req.path === "/users/sync" || (req.path.indexOf("/users/") === 0 && isMutatingMethod(req.method))) {
    return apiAdminLimiter(req, res, next);
  }
  if (isMutatingMethod(req.method)) return apiWriteLimiter(req, res, next);
  return apiReadLimiter(req, res, next);
});
app.use(requireCsrf);

// Request logging
app.use(function(req, res, next) {
  const start = Date.now();
  res.on("finish", function() {
    const ms = Date.now() - start;
    console.log("[HTTP] " + req.method + " " + req.path + " " + res.statusCode + " " + ms + "ms");
  });
  next();
});

// Static files
app.use(function(req,res,next){
  if(/\.(bak|backup|old|orig|tmp|swp)([.-]|$)/i.test(req.path)) return res.sendStatus(404);
  next();
});
app.use(express.static(path.join(__dirname, "public"), {
  dotfiles: "deny",
}));

// Data routes
registerDataRoutes(app, pool, {
  requireAuth: rbac.requireAuth,
  requireRole: rbac.requireRole,
  blockNA: rbac.blockNA,
  requireWrite: rbac.requireWrite,
  getUserProjects: rbac.getUserProjects,
  checkProjectAccess: rbac.checkProjectAccess,
  requirePermission: rbac.requirePermission,
  policy: policy,
  broadcast: sse.broadcast,
  handleSSE: sse.handleSSE,
  loginLimiter: loginLimiter,
  syncADUser: ldapMod.syncADUser,
  syncAllADUsers: ldapMod.syncAllADUsers,
  listADUsers: ldapMod.listADUsers,
  ldapBind: ldapMod.ldapBind,
  ldapSearchUser: ldapMod.ldapSearchUser,
  isUserEnabled: ldapMod.isUserEnabled,
  initialRoleFromGroups: ldapMod.initialRoleFromGroups,
  singleSessionPerUser: SINGLE_SESSION_PER_USER,
});

app.use(function(err, req, res, next) {
  console.error("[UNHANDLED]", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal error" });
});

// SSE keepalive
sse.startKeepalive();

// Run migrations then start
(async function() {
  try {
    await runMigrations(pool);
    await ensureAuditTable(pool);
    console.log("[MIGRATE] All migrations applied successfully");
  } catch (e) {
    console.error("[MIGRATE] Migration failed:", e.message);
    process.exit(1);
  }
  if (LOCAL_DEMO_MODE) {
    localDemoUser = await localDemoModule.seedLocalDemo(pool);
    console.log('[LOCAL] Isolated demo database: ' + pool.dataDir);
  }
  const server = app.listen(PORT, HOST, () => {
    console.log("[SERVER] Started at http://" + HOST + ":" + PORT);
    if (LOCAL_DEMO_MODE) console.log('[LOCAL] Demo mode enabled; LDAP and production PostgreSQL are disabled');
  });
  if (LOCAL_DEMO_MODE) process.on('SIGINT', function() {
    server.close(async function() {
      try { await pool.close(); } finally { process.exit(0); }
    });
  });
})();
