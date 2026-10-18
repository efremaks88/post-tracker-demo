const fs = require('fs');
const path = require('path');

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error && error.code !== 'ESRCH';
  }
}

function acquireLocalDataLock(lockPath) {
  const resolved = path.resolve(lockPath);
  fs.mkdirSync(path.dirname(resolved), {recursive:true});
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = fs.openSync(resolved, 'wx');
      const payload = JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()});
      fs.writeFileSync(handle,payload,'utf8');
      fs.closeSync(handle);
      let released = false;
      return function release() {
        if (released) return;
        released = true;
        try {
          const current = JSON.parse(fs.readFileSync(resolved,'utf8'));
          if (Number(current.pid) === process.pid) fs.unlinkSync(resolved);
        } catch (error) {
          if (!error || error.code !== 'ENOENT') console.error('[LOCAL] Failed to release data lock:',error.message);
        }
      };
    } catch (error) {
      if (!error || error.code !== 'EEXIST') throw error;
      let holder = null;
      try { holder = JSON.parse(fs.readFileSync(resolved,'utf8')); } catch (readError) {}
      if (holder && processIsAlive(Number(holder.pid))) {
        const busy = new Error('Локальная база уже открыта другим окном ПОСТ ТРЕКЕРА. Закройте старое окно запуска или используйте уже открытый адрес.');
        busy.code = 'LOCAL_DATA_BUSY';
        throw busy;
      }
      fs.unlinkSync(resolved);
    }
  }
  throw new Error('Не удалось заблокировать локальную базу');
}

module.exports = { acquireLocalDataLock, processIsAlive };
