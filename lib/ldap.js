/**
 * ПОСТ ТРЕКЕР — LDAP модуль
 *
 * Синхронизация пользователей с Active Directory
 */
const ldap = require("ldapjs");

module.exports = function createLDAP(pool, config) {
  const LDAP_URL = config.LDAP_URL;
  const LDAP_DOMAIN = config.LDAP_DOMAIN;
  const LDAP_BASE_DN = config.LDAP_BASE_DN;
  const LDAP_BIND_DN = config.LDAP_BIND_DN;
  const LDAP_BIND_PASS = config.LDAP_BIND_PASS;

  function initialRoleFromGroups(groups) {
    const names=(groups||[]).map(g=>String(g).toLowerCase());
    if (names.includes("tracker_admin")) return "admin";
    if (names.includes("managers"))     return "manager";
    if (names.includes("nle"))          return "editor";
    return "viewer";
  }

  function escapeLdapFilterValue(value) {
    return String(value).replace(/[\\*()\u0000]/g, function(ch) {
      if (ch === "\\") return "\\5c";
      if (ch === "*") return "\\2a";
      if (ch === "(") return "\\28";
      if (ch === ")") return "\\29";
      return "\\00";
    });
  }

  function ldapBind(login, pass) {
    return new Promise(function(resolve, reject) {
      const client = ldap.createClient({ url: LDAP_URL,connectTimeout:10000,timeout:10000 });
      client.on('error',reject);
      const upn = login.indexOf("@") !== -1 ? login : login + "@" + LDAP_DOMAIN;
      client.bind(upn, pass, function(err) {
        if (err) {
          client.unbind(function() {});
          return reject(err);
        }
        resolve(client);
      });
    });
  }

  function ldapSearchUser(client, login) {
    return new Promise(function(resolve, reject) {
      const opts = {
        scope: "sub",
        filter: "(&(objectClass=user)(objectCategory=person)(sAMAccountName=" + escapeLdapFilterValue(login) + "))",
        attributes: ["samaccountname", "displayname", "mail", "useraccountcontrol", "memberof"]
      };
      client.search(LDAP_BASE_DN, opts, function(err, res) {
        if (err) return reject(err);
        var entryAttrs = null;
        res.on("searchEntry", function(e) {
          if (e.pojo && e.pojo.attributes) {
            entryAttrs = {};
            for (var i = 0; i < e.pojo.attributes.length; i++) {
              var a = e.pojo.attributes[i];
              entryAttrs[a.type.toLowerCase()] = a.values.length > 1 ? a.values : (a.values[0] || null);
            }
          }
        });
        res.on("error", function(e) { reject(e); });
        res.on("end", function(result) {
          if (result && result.status !== 0) return reject(new Error("LDAP search failed"));
          resolve(entryAttrs);
        });
      });
    });
  }

  function extractGroupNames(memberOf) {
    if (!memberOf) return [];
    var arr = Array.isArray(memberOf) ? memberOf : [memberOf];
    return arr.map(function(dn) {
      var match = dn.match(/^CN=([^,]+)/i);
      return match ? match[1] : dn;
    });
  }

  function isUserEnabled(uac) {
    var num = typeof uac === "string" ? parseInt(uac, 10) : (uac || 0);
    return (num & 2) === 0;
  }

  async function syncADUser(login) {
    var client;
    try {
      client = await ldapBind(LDAP_BIND_DN, LDAP_BIND_PASS);
      var entry = await ldapSearchUser(client, login);
      if (!entry) return null;

      var groups = extractGroupNames(entry.memberof || entry.member);
      var enabled = isUserEnabled(entry.useraccountcontrol);
      var displayName = entry.displayname || entry.samaccountname;
      var email = entry.mail || "";
      var role = initialRoleFromGroups(groups);

      var result = await pool.query(
        "INSERT INTO users (sam_name, display_name, email, role, ad_groups, ad_enabled) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (sam_name) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, ad_groups = EXCLUDED.ad_groups, ad_enabled = EXCLUDED.ad_enabled RETURNING *",
        [login, displayName, email, role, groups, enabled]
      );
      return Object.assign({}, result.rows[0], { enabled: enabled });
    } finally {
      if (client) client.unbind(function() {});
    }
  }

  async function listADUsers() {
    var client;
    try {
      client = await ldapBind(LDAP_BIND_DN, LDAP_BIND_PASS);
      var users = await new Promise(function(resolve, reject) {
        var opts = {
          scope: "sub",
          filter: "(&(objectClass=user)(objectCategory=person))",
          attributes: ["samaccountname", "displayname", "mail", "useraccountcontrol", "memberof"]
        };
        client.search(LDAP_BASE_DN, opts, function(err, res) {
          if (err) return reject(err);
          var results = [];
          res.on("searchEntry", function(e) {
            if (e.pojo && e.pojo.attributes) {
              var entry = {};
              for (var i = 0; i < e.pojo.attributes.length; i++) {
                var a = e.pojo.attributes[i];
                entry[a.type.toLowerCase()] = a.values.length > 1 ? a.values : (a.values[0] || null);
              }
              results.push(entry);
            }
          });
          res.on("error", function(e) { reject(e); });
          res.on("end", function(result) {
            if (result && result.status !== 0) return reject(new Error("LDAP search failed"));
            resolve(results);
          });
        });
      });

      return users
        .filter(function(entry) {
          return entry && entry.samaccountname && !entry.samaccountname.endsWith("$") && isUserEnabled(entry.useraccountcontrol);
        })
        .map(function(entry) {
          return {
            sam_name: entry.samaccountname,
            display_name: entry.displayname || entry.samaccountname,
            email: entry.mail || "",
            ad_groups: extractGroupNames(entry.memberof || entry.member)
          };
        })
        .sort(function(a, b) { return (a.display_name || "").localeCompare(b.display_name || "", "ru"); });
    } finally {
      if (client) client.unbind(function() {});
    }
  }
  async function syncAllADUsers() {
    var client;
    try {
      client = await ldapBind(LDAP_BIND_DN, LDAP_BIND_PASS);
      var users = await new Promise(function(resolve, reject) {
        var opts = {
          scope: "sub",
          filter: "(&(objectClass=user)(objectCategory=person))",
          attributes: ["samaccountname", "displayname", "mail", "useraccountcontrol", "memberof", "distinguishedname"]
        };
        client.search(LDAP_BASE_DN, opts, function(err, res) {
          if (err) return reject(err);
          var results = [];
          res.on("searchEntry", function(e) {
            if (e.pojo && e.pojo.attributes) {
              var entry = {};
              for (var i = 0; i < e.pojo.attributes.length; i++) {
                var a = e.pojo.attributes[i];
                entry[a.type.toLowerCase()] = a.values.length > 1 ? a.values : (a.values[0] || null);
              }
              results.push(entry);
            } else {
              results.push(null);
            }
          });
          res.on("error", function(e) { reject(e); });
          res.on("end", function(result) {
            if (result && result.status !== 0) return reject(new Error("LDAP search failed"));
            resolve(results);
          });
        });
      });

      var updated = 0;
      console.log("[AD SYNC] Got", users.length, "entries from AD search");
      for (var i = 0; i < users.length; i++) {
        var entry = users[i];
        if (!entry) { console.log("[AD SYNC] skipping null entry"); continue; }
        var login = entry.samaccountname;
        if (!login || login.endsWith("$")) {
          if (!login) console.log("[AD SYNC] skip - no samaccountname");
          continue;
        }
        var enabled = isUserEnabled(entry.useraccountcontrol);
        if (!enabled) {
          await pool.query("UPDATE users SET ad_enabled = false WHERE sam_name = $1", [login]);
          console.log("[AD SYNC] User", login, "is disabled in AD, marked ad_enabled=false");
          continue;
        }
        var groups = extractGroupNames(entry.memberof || entry.member);
        var displayName = entry.displayname || login;
        var email = entry.mail || "";
        var role = initialRoleFromGroups(groups);

        await pool.query(
          "INSERT INTO users (sam_name, display_name, email, role, ad_groups, ad_enabled) VALUES ($1, $2, $3, $4, $5, true) ON CONFLICT (sam_name) DO UPDATE SET display_name = EXCLUDED.display_name, email = EXCLUDED.email, ad_groups = EXCLUDED.ad_groups, ad_enabled=true",
          [login, displayName, email, role, groups]
        );
        updated++;
      }
      console.log("[AD SYNC] Обновлено " + updated + " пользователей из AD");
      return updated;
    } catch (e) {
      console.error("[AD SYNC] Ошибка:", e.message);
      return 0;
    } finally {
      if (client) client.unbind(function() {});
    }
  }

  return {
    initialRoleFromGroups: initialRoleFromGroups,
    ldapBind: ldapBind,
    ldapSearchUser: ldapSearchUser,
    extractGroupNames: extractGroupNames,
    isUserEnabled: isUserEnabled,
    listADUsers: listADUsers,
    syncADUser: syncADUser,
    syncAllADUsers: syncAllADUsers,
  };
};
