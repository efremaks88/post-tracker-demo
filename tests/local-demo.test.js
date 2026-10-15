const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

test('local demo database is seeded once and persists application edits', async function() {
  const root = fs.mkdtempSync(path.join(__dirname, '.local-demo-'));
  try {
    const prepared = spawnSync(process.execPath, [path.join(__dirname,'helpers','prepare-local-restart.js'), root], {encoding:'utf8'});
    assert.equal(prepared.status, 0, prepared.stderr || prepared.stdout);
    assert.match(prepared.stdout, /LOCAL_PREPARE_OK/);
    await new Promise(resolve => setTimeout(resolve, 500));
    const restarted = spawnSync(process.execPath, [path.join(__dirname,'helpers','verify-local-restart.js'), root], {encoding:'utf8'});
    assert.equal(restarted.status, 0, restarted.stderr || restarted.stdout);
    assert.match(restarted.stdout, /LOCAL_RESTART_OK/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
