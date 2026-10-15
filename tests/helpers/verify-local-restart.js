const assert = require('node:assert/strict');
const path = require('node:path');
const { runMigrations } = require('../../lib/migrate');
const { createLocalPool, seedLocalDemo, resetProducerDemo } = require('../../lib/local-demo');

(async function verifyRestart() {
  const root = process.argv[2];
  const pool = createLocalPool(path.join(root, 'pglite'));
  try {
    await runMigrations(pool);
    const user = await seedLocalDemo(pool);
    const persisted = await pool.query('SELECT description FROM projects WHERE id=$1', ['demo-north']);
    assert.equal(persisted.rows[0].description, 'Сохранённая локальная правка');
    const history = await pool.query("SELECT action,project_id,changes FROM audit_log WHERE entity='project' AND entity_id='demo-north'");
    assert.equal(history.rows.length, 1);
    assert.equal(history.rows[0].action, 'update');
    assert.equal(history.rows[0].project_id, 'demo-north');
    assert.equal(history.rows[0].changes.find(change => change.field === 'description').after, 'Сохранённая локальная правка');
    assert.equal((await pool.query("SELECT status FROM production_tasks WHERE id='demo-pt-north-draft'")).rows[0].status, 'todo');
    await pool.query("UPDATE production_tasks SET title='Временная правка' WHERE id='demo-pt-north-draft'");
    await pool.query("UPDATE production_approvals SET title='Временное согласование' WHERE id='demo-pa-north-script'");
    await resetProducerDemo(pool, user);
    assert.equal((await pool.query("SELECT title FROM production_tasks WHERE id='demo-pt-north-draft'")).rows[0].title, 'Получить первый драфт сценария');
    assert.equal((await pool.query("SELECT title FROM production_approvals WHERE id='demo-pa-north-script'")).rows[0].title, 'Утвердить сценарий перед съёмкой');
    assert.equal((await pool.query("SELECT title FROM production_tasks WHERE id='demo-pt-exp-tickets'")).rows[0].title, 'Купить билеты группе');
    assert.equal((await pool.query("SELECT name FROM projects WHERE id='demo-home'")).rows[0].name, 'Дом, который помнит');
    assert.equal((await pool.query("SELECT description FROM projects WHERE id='demo-north'")).rows[0].description, 'Сохранённая локальная правка');
    console.log('LOCAL_RESTART_OK');
  } finally {
    await pool.close();
  }
})().catch(function(error) { console.error(error); process.exitCode = 1; });
