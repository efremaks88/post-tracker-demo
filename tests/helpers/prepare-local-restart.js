const assert = require('node:assert/strict');
const path = require('node:path');
const { runMigrations } = require('../../lib/migrate');
const { createLocalPool, seedLocalDemo } = require('../../lib/local-demo');
const { auditMutation } = require('../../lib/audit');

(async function prepareRestart() {
  const root = process.argv[2];
  const pool = createLocalPool(path.join(root, 'pglite'));
  try {
    await runMigrations(pool);
    const user = await seedLocalDemo(pool);
    assert.equal(user.role, 'admin');
    const minimums = {projects:7,people:11,series:10,tasks:10,production_blocks:20,production_task_groups:12,production_tasks:22,production_approvals:5};
    for (const [table,minimum] of Object.entries(minimums)) {
      assert.ok((await pool.query('SELECT id FROM '+table)).rows.length >= minimum, table);
    }
    const dossiers = JSON.stringify((await pool.query('SELECT dossier FROM projects')).rows);
    assert.equal(/password|token|api[_-]?key/i.test(dossiers), false);
    const client = await pool.connect();
    await client.query('BEGIN');
    await auditMutation({_tx:client,session:{userId:user.id,displayName:user.display_name},headers:{}},['project'],
      () => client.query('UPDATE projects SET description=$2 WHERE id=$1', ['demo-north','Сохранённая локальная правка']));
    await client.query('COMMIT');
    client.release();
    console.log('LOCAL_PREPARE_OK');
  } finally {
    await pool.close();
  }
})().catch(function(error) { console.error(error); process.exitCode = 1; });
