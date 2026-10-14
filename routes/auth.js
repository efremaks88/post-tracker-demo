const crypto = require('crypto');
const { logAudit } = require('../lib/db');
const createUsersModel = require('../lib/models/users');
const { loginSchema, validate } = require('./schemas');

function regenerateSession(req) {
  return new Promise(function(resolve, reject) {
    req.session.regenerate(function(err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  return req.session.csrfToken;
}

module.exports = function registerAuthRoutes(app, pool, deps) {
  var requireAuth = deps.requireAuth;
  var requireRole = deps.requireRole;
  var blockNA = deps.blockNA;
  var loginLimiter = deps.loginLimiter;
  var syncADUser = deps.syncADUser;
  var syncAllADUsers = deps.syncAllADUsers;
  var listADUsers = deps.listADUsers;
  var ldapBind = deps.ldapBind;
  var ldapSearchUser = deps.ldapSearchUser;
  var isUserEnabled = deps.isUserEnabled;
  var singleSessionPerUser = deps.singleSessionPerUser === true;
  var Users = createUsersModel(pool);

  app.post("/api/auth/login", loginLimiter, validate(loginSchema), async function(req, res) {
    try {
      var login = req.body.login;
      var pass = req.body.password;
      if (!login || !pass) return res.status(400).json({ error: "Login required" });
      var client;
      try { client = await ldapBind(login, pass); } catch (e) { return res.status(401).json({ error: "Invalid credentials" }); }
      var entry = await ldapSearchUser(client, login);
      client.unbind(function(){});
      if (!entry) return res.status(401).json({ error: "User not found in domain" });
      if (!isUserEnabled(entry.useraccountcontrol)) return res.status(403).json({ error: "Account disabled" });
      var user = await syncADUser(entry.samaccountname || login);
      if (user && user.ad_enabled === false) return res.status(403).json({error:"Account disabled"});
      if (!user) return res.status(500).json({ error: "Sync error" });
      await regenerateSession(req);
      req.session.userId = user.id;
      req.session.samName = user.sam_name;
      req.session.role = user.role;
      req.session.displayName = user.display_name;
      req.session.email = user.email;
      var csrfToken = ensureCsrfToken(req);
      if (singleSessionPerUser) await Users.cleanupSessions(user.id, req.sessionID);
      await logAudit(pool, user.id, user.display_name, "login", "user", login, {});
      res.json({ user: { id: user.id, sam_name: user.sam_name, display_name: user.display_name, email: user.email, role: user.role, ad_groups: user.ad_groups, ad_enabled: user.ad_enabled }, csrfToken: csrfToken });
    } catch (e) {
      console.error("[LOGIN] Error:", e);
      res.status(500).json({ error: "Login error" });
    }
  });

  app.get("/api/auth/me", requireAuth, function(req, res) {
    res.json({ user: { id: req.session.userId, sam_name: req.session.samName, display_name: req.session.displayName, role: req.session.role }, csrfToken: ensureCsrfToken(req) });
  });

  app.post("/api/auth/logout", function(req, res) {
    req.session.destroy(function() { res.json({ ok: true }); });
  });

  // API routes

  app.get("/api/users", requireAuth, blockNA, requireRole("admin", "lead", "manager"), async function(req, res) {
    try {
      var rows = await Users.findAll();
      res.json(rows);
    } catch (e) {
      console.error("[USERS] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  });

  app.get("/api/users/domain", requireAuth, blockNA, requireRole("admin", "lead", "manager"), async function(req, res) {
    try {
      if (!listADUsers) return res.status(501).json({ error: "Domain listing is not configured" });
      var rows = await listADUsers();
      res.json(rows);
    } catch (e) {
      console.error("[DOMAIN USERS] Error:", e);
      res.status(500).json({ error: "Domain users load error" });
    }
  });

  app.put("/api/users/:id/role", requireAuth, blockNA, requireRole("admin"), async function(req, res) {
    try {
      var valid = ["admin","lead","manager","editor","viewer","na"];
      if (valid.indexOf(req.body.role) === -1) return res.status(400).json({ error: "Invalid role" });
      var result = await Users.setRole(req.params.id, req.body.role);
      if (!result) return res.status(404).json({ error: "Not found" });
      await logAudit(pool, req.session.userId, req.session.displayName, "change_role", "user", req.params.id, { new_role: req.body.role });
      res.json(result);
    } catch (e) {
      console.error("[ROLE] Error:", e);
      res.status(500).json({ error: "Internal error" });
    }
  });

  app.put("/api/users/:id/projects", requireAuth, blockNA, requireRole("admin"), async function(req, res) {
    try {
      await Users.setProjects(req.params.id, req.body.projects || [], req.session.userId);
      res.json({ ok: true, count: (req.body.projects || []).length });
    } catch (e) {
      console.error("[PROJECTS] Error:", e);
      res.status(500).json({ error: "Assignment error" });
    }
  });

  app.post("/api/users/sync", requireAuth, blockNA, requireRole("admin"), async function(req, res) {
    try {
      var count = await syncAllADUsers();
      res.json({ ok: true, synced: count });
    } catch (e) {
      console.error("[USERS SYNC] Error:", e);
      res.status(500).json({ error: "Sync error" });
    }
  });
};
