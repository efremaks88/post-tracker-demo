const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {acquireLocalDataLock} = require('../lib/local-lock');

test('local data lock refuses a second live process and releases cleanly',()=>{
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'post-tracker-lock-'));
  const lockPath = path.join(root,'pglite.lock');
  try {
    const release = acquireLocalDataLock(lockPath);
    assert.throws(()=>acquireLocalDataLock(lockPath),error=>error && error.code==='LOCAL_DATA_BUSY');
    release();
    const releaseAgain = acquireLocalDataLock(lockPath);
    releaseAgain();
    assert.equal(fs.existsSync(lockPath),false);
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});

test('local data lock replaces a stale holder record',()=>{
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'post-tracker-stale-lock-'));
  const lockPath = path.join(root,'pglite.lock');
  try {
    fs.writeFileSync(lockPath,JSON.stringify({pid:2147483647}));
    const release = acquireLocalDataLock(lockPath);
    assert.equal(JSON.parse(fs.readFileSync(lockPath,'utf8')).pid,process.pid);
    release();
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});
