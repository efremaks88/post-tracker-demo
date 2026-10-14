const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runMigrations } = require('../lib/migrate');
const { createLocalPool, seedLocalDemo } = require('../lib/local-demo');
const { auditMutation } = require('../lib/audit');

test('local demo database is seeded once and persists application edits', async function() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'post-tracker-local-'));
  let pool;
  try {
    pool = createLocalPool(path.join(root, 'pglite'));
    await runMigrations(pool);
    const user = await seedLocalDemo(pool);
    assert.equal(user.role, 'admin');
    assert.ok((await pool.query('SELECT id FROM projects')).rows.length >= 3);
    assert.ok((await pool.query('SELECT id FROM people')).rows.length >= 5);
    assert.ok((await pool.query('SELECT id FROM series')).rows.length >= 7);
    assert.ok((await pool.query('SELECT id FROM tasks')).rows.length >= 10);
    const dossiers = JSON.stringify((await pool.query('SELECT dossier FROM projects')).rows);
    assert.equal(/password|token|api[_-]?key/i.test(dossiers), false);

    const client=await pool.connect();
    await client.query('BEGIN');
    await auditMutation({_tx:client,session:{userId:user.id,displayName:user.display_name},headers:{}},['project'],
      ()=>client.query('UPDATE projects SET description=$2 WHERE id=$1', ['demo-north','Сохранённая локальная правка']));
    await client.query('COMMIT');client.release();
    await pool.close();
    pool = null;

    pool = createLocalPool(path.join(root, 'pglite'));
    await runMigrations(pool);
    await seedLocalDemo(pool);
    const persisted = await pool.query('SELECT description FROM projects WHERE id=$1', ['demo-north']);
    assert.equal(persisted.rows[0].description, 'Сохранённая локальная правка');
    const history = await pool.query("SELECT action,project_id,changes FROM audit_log WHERE entity='project' AND entity_id='demo-north'");
    assert.equal(history.rows.length,1);assert.equal(history.rows[0].action,'update');assert.equal(history.rows[0].project_id,'demo-north');
    assert.equal(history.rows[0].changes.find(change=>change.field==='description').after,'Сохранённая локальная правка');
  } finally {
    if (pool) await pool.close();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
