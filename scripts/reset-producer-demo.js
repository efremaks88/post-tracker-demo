const path = require('path');
const { runMigrations } = require('../lib/migrate');
const { createLocalPool, seedLocalDemo, resetProducerDemo } = require('../lib/local-demo');

(async function() {
  const dataDir = path.join(__dirname,'..','local-data','pglite');
  const pool = createLocalPool(dataDir);
  try {
    await runMigrations(pool);
    const user = await seedLocalDemo(pool);
    await resetProducerDemo(pool,user);
    console.log('Демо-данные продюсерской восстановлены.');
  } finally {
    await pool.close();
  }
})().catch(function(error) {
  console.error('Не удалось восстановить демо-данные:', error.message);
  console.error('Закройте окно запущенного трекера и повторите попытку.');
  process.exitCode = 1;
});
