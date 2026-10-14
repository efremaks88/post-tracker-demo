const fs = require('fs');
const path = require('path');

async function runMigrations(pool) {
  const dir = path.join(__dirname,'..','migrations');
  if (!fs.existsSync(dir)) throw new Error('Migrations directory is missing');
  await pool.query('CREATE TABLE IF NOT EXISTS _migrations(id SERIAL PRIMARY KEY,name VARCHAR(255) NOT NULL UNIQUE,applied_at TIMESTAMP NOT NULL DEFAULT NOW())');
  const applied = new Set((await pool.query('SELECT name FROM _migrations')).rows.map(r=>r.name));
  for (const name of fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort()) {
    if (applied.has(name)) continue;
    const tx = await pool.connect();
    try {
      await tx.query('BEGIN');
      await tx.query(fs.readFileSync(path.join(dir,name),'utf8'));
      await tx.query('INSERT INTO _migrations(name) VALUES($1)',[name]);
      await tx.query('COMMIT');
      console.log('[MIGRATE] APPLIED '+name);
    } catch(error) {
      try { await tx.query('ROLLBACK'); } catch(rollbackError) {}
      throw new Error('Migration '+name+' failed: '+error.message,{cause:error});
    } finally { tx.release(); }
  }
}
module.exports = {runMigrations};
