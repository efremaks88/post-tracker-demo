const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function fail(message) {
  failures.push(message);
}

const indexHtml = read("public/index.html");
const serverJs = read("server.js");
const routesDataJs = read("routes/data.js");
const ldapJs = read("lib/ldap.js");
const packageJson = JSON.parse(read("package.json"));

if (/babel-standalone|type=["']text\/babel["']/.test(indexHtml)) fail("Browser Babel must not be used in public/index.html");
if (/https?:\/\/cdnjs\.cloudflare\.com|https?:\/\/fonts\.googleapis\.com|https?:\/\/fonts\.gstatic\.com/.test(indexHtml)) fail("public/index.html must not load CDN or Google Fonts");
if (/<style[\s>]/i.test(indexHtml)) fail("public/index.html must not contain inline <style> blocks");
if (!exists("public/app.css")) fail("public/app.css is missing");
if (!exists("public/vendor/react.production.min.js")) fail("local React vendor file is missing");
if (!exists("public/vendor/react-dom.production.min.js")) fail("local ReactDOM vendor file is missing");

if (exists("index.html")) fail("root index.html must not exist; production HTML lives in public/index.html");
if (exists("test_ldap.js")) fail("test_ldap.js must not exist in production root because it may contain secrets");
for (const item of fs.readdirSync(root, { withFileTypes: true })) {
  if (item.isFile() && item.name.toLowerCase().endsWith(".txt")) {
    fail(`text file must not be kept in app root: ${item.name}`);
  }
}
const publicFiles = fs.readdirSync(path.join(root, "public"), { withFileTypes: true });
for (const item of publicFiles) {
  if (item.isFile() && /\.(bak|backup|old|orig|tmp|swp)([.-]|$)|\.bak\d*$/i.test(item.name)) {
    fail(`backup-like file is present in public/: ${item.name}`);
  }
}

const applyScript = exists("scripts/apply-server-security.sh") ? read("scripts/apply-server-security.sh") : "";
if (/unsafe-inline/.test(indexHtml) || /unsafe-inline/.test(applyScript)) {
  fail("CSP must not allow unsafe-inline");
}
if (!/function requireCsrf/.test(serverJs) || !/timingSafeEqual/.test(serverJs) || !/isSameOrigin/.test(serverJs)) {
  fail("CSRF middleware must check token with timingSafeEqual and same-origin headers");
}
if (/res\.status\(500\)[^\n]+e\.message/.test(routesDataJs) || /res\.status\(500\)[^\n]+e\.message/.test(serverJs)) {
  fail("500 responses must not expose e.message");
}
if (!/express\.json\(\{\s*limit:\s*["']5mb["']\s*\}\)/.test(serverJs)) {
  fail("JSON request body limit must stay at 5mb or lower");
}
if (!/express\.static\([^)]*public[\s\S]*dotfiles:\s*["']deny["']/.test(serverJs)) {
  fail("express.static must deny dotfiles");
}
if (/express\.static\([\s\S]*setHeaders/.test(serverJs)) {
  fail("express.static must not duplicate security headers already set by nginx");
}
if (!/name:\s*["']tracker\.sid["']/.test(serverJs)) {
  fail("express-session must use a custom cookie name");
}
if (!/ttl:\s*24\s*\*\s*60\s*\*\s*60/.test(serverJs)) {
  fail("pg session store must define explicit 24h ttl");
}
if (!/sameSite:\s*["']strict["']/.test(serverJs)) {
  fail("session cookie sameSite must be strict");
}
if (!/function rateLimitKey/.test(serverJs) || !/keyGenerator:\s*rateLimitKey/.test(serverJs)) {
  fail("API rate limiters must use authenticated user-aware keys");
}
if (!/req\.session\.regenerate/.test(routesDataJs) || !/await regenerateSession\(req\);[\s\S]*req\.session\.userId/.test(routesDataJs)) {
  fail("login must regenerate session before assigning authenticated user data");
}
if (!/SINGLE_SESSION_PER_USER/.test(serverJs) || !/if \(singleSessionPerUser\) await Users\.cleanupSessions/.test(routesDataJs)) {
  fail("cleanupSessions must be opt-in through SINGLE_SESSION_PER_USER");
}
if (!/login:\s*z\.string\(\)\.min\(1\)\.max\(100\)\.regex/.test(routesDataJs)) {
  fail("login input must be constrained before LDAP usage");
}
if (!/app\.get\(["']\/api\/users["'][\s\S]*requireRole\(["']admin["'],\s*["']lead["'],\s*["']manager["']\)/.test(routesDataJs)) {
  fail("GET /api/users must be restricted to admin/lead/manager");
}
if (!/app\.put\(["']\/api\/users\/:id\/role["'][\s\S]*requireRole\(["']admin["']\)/.test(routesDataJs)) {
  fail("role changes must be admin-only");
}
if (!/app\.put\(["']\/api\/users\/:id\/projects["'][\s\S]*requireRole\(["']admin["']\)/.test(routesDataJs)) {
  fail("project access changes must be admin-only");
}
if (!/No project create rights/.test(routesDataJs)) {
  fail("editors must not be able to create new projects implicitly");
}
if (!/function escapeLdapFilterValue/.test(ldapJs) || !/sAMAccountName=" \+ escapeLdapFilterValue\(login\)/.test(ldapJs)) {
  fail("LDAP search filter must escape user-controlled login");
}
if (!packageJson.overrides || packageJson.overrides["body-parser"] !== "1.20.8") {
  fail("package.json must pin patched body-parser through npm overrides");
}
if (!packageJson.engines || !/^>=20\./.test(packageJson.engines.node || "")) {
  fail("package.json engines must require Node.js 20+");
}

if (failures.length) {
  console.error("Security smoke failed:");
  for (const message of failures) console.error("- " + message);
  process.exit(1);
}

console.log("Security smoke OK");
