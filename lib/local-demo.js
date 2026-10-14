const fs = require('fs');
const path = require('path');
const { PGlite } = require('@electric-sql/pglite');

function queryPGlite(db, sql, params) {
  if (params !== undefined) return db.query(sql, params);
  return db.exec(sql).then(function(results) {
    return results.at(-1) || { rows: [], affectedRows: 0 };
  });
}

function createLocalPool(dataDir) {
  const resolved = path.resolve(dataDir);
  fs.mkdirSync(resolved, { recursive: true });
  const db = new PGlite(resolved);
  let tail = Promise.resolve();

  function queuedQuery(sql, params) {
    const result = tail.then(
      function() { return queryPGlite(db, sql, params); },
      function() { return queryPGlite(db, sql, params); }
    );
    tail = result.then(function() {}, function() {});
    return result;
  }

  async function connect() {
    const previous = tail;
    let releaseLock;
    const lock = new Promise(function(resolve) { releaseLock = resolve; });
    tail = previous.then(function() { return lock; }, function() { return lock; });
    await previous.catch(function() {});
    let released = false;
    return {
      query: function(sql, params) { return queryPGlite(db, sql, params); },
      release: function() {
        if (!released) {
          released = true;
          releaseLock();
        }
      },
    };
  }

  return {
    query: queuedQuery,
    connect,
    close: async function() {
      await tail.catch(function() {});
      await db.close();
    },
    dataDir: resolved,
  };
}

function formatDay(date) {
  return String(date.getDate()).padStart(2, '0') + '.' +
    String(date.getMonth() + 1).padStart(2, '0') + '.' + date.getFullYear();
}

function relativeDay(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return formatDay(date);
}

async function seedLocalDemo(pool) {
  const userResult = await pool.query(
    "INSERT INTO users(sam_name,display_name,email,role,ad_groups,ad_enabled)" +
    " VALUES('local-demo','Локальный администратор','','admin','{}'::text[],true)" +
    " ON CONFLICT(sam_name) DO UPDATE SET role='admin',ad_enabled=true" +
    " RETURNING id,sam_name,display_name,role"
  );
  const user = userResult.rows[0];
  const marker = await pool.query("SELECT value FROM app_state WHERE key='local_demo_seeded'");
  if (marker.rows.length) return user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roles = [
      ['монтаж','Монтаж','#6366f1'],['графика','Графика','#a855f7'],
      ['звук','Звук','#14b8a6'],['цвет','Цветокоррекция','#f59e0b'],
      ['продюсер','Продюсер','#3b82f6'],
    ];
    for (const role of roles) await client.query(
      'INSERT INTO roles(id,label,color) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING', role
    );

    const groups = [
      ['demo-prep','Подготовка',1],['demo-edit','Монтаж',2],
      ['demo-finish','Финиш',3],['demo-delivery','Сдача',4],
    ];
    for (const group of groups) await client.query(
      'INSERT INTO stage_groups(id,label,"order") VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING', group
    );

    const stages = [
      ['синхра','Синхронизация','#ec4899',1,'demo-prep',true,['монтаж']],
      ['монтаж','Монтаж','#6366f1',2,'demo-edit',true,['монтаж']],
      ['графика','Графика','#a855f7',3,'demo-edit',true,['графика']],
      ['цвет/звук','Цвет / звук','#f59e0b',4,'demo-finish',true,['цвет','звук']],
      ['отсмотр','Отсмотр','#3b82f6',5,'demo-finish',true,['продюсер']],
      ['правки','Правки','#f97316',6,'demo-finish',true,['монтаж']],
      ['предотк','ПредОТК','#22c55e',7,'demo-delivery',true,['продюсер']],
      ['отк','ОТК','#10b981',8,'demo-delivery',true,['продюсер']],
      ['сдача','Сдача мастера','#06b6d4',9,'demo-delivery',true,['продюсер']],
    ];
    for (const stage of stages) await client.query(
      'INSERT INTO stages(id,label,color,"order",group_id,needs_executor,roles_required,no_impact)' +
      ' VALUES($1,$2,$3,$4,$5,$6,$7,false) ON CONFLICT(id) DO NOTHING', stage
    );

    const people = [
      ['demo-anna','Анна Волкова',['монтаж']],
      ['demo-ilya','Илья Соколов',['монтаж','графика']],
      ['demo-maria','Мария Лебедева',['цвет']],
      ['demo-denis','Денис Орлов',['звук']],
      ['demo-olga','Ольга Миронова',['продюсер']],
    ];
    for (const person of people) await client.query(
      'INSERT INTO people(id,name,roles,active) VALUES($1,$2,$3,true) ON CONFLICT(id) DO NOTHING', person
    );

    const projects = [
      ['demo-north','Северный ветер','СВ','Документальный сериал','#3b82f6','в работе','1'],
      ['demo-city','Город говорит','ГГ','YouTube-шоу','#a855f7','в работе','2'],
      ['demo-science','Наука рядом','НР','Научно-популярный цикл','#14b8a6','в работе','1'],
    ];
    for (const project of projects) {
      const dossier = {
        info: { type: project[0] === 'demo-city' ? 'YouTube-шоу' : 'Сериал' },
        paths: [{ label: 'Рабочие материалы', path: 'DEMO:/projects/' + project[0] }],
        accesses: [],
        links: [{ label: 'Демо-описание', url: 'https://example.com/' + project[0] }],
        notes: 'Демонстрационные данные. Их можно свободно изменять.',
      };
      await client.query(
        'INSERT INTO projects(id,name,abbr,description,color,status,season,dossier)' +
        ' VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT(id) DO NOTHING',
        [...project, JSON.stringify(dossier)]
      );
      await client.query(
        'INSERT INTO project_managers(project_id,user_uid,user_name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [project[0], user.sam_name, user.display_name]
      );
    }

    const series = [
      ['demo-north-01','demo-north','Серия 01',1,-14,-5,5],
      ['demo-north-02','demo-north','Серия 02',2,-7,2,12],
      ['demo-north-03','demo-north','Серия 03',3,0,9,19],
      ['demo-city-01','demo-city','Выпуск 01',1,-5,1,7],
      ['demo-city-02','demo-city','Выпуск 02',2,2,8,14],
      ['demo-science-01','demo-science','Космос',1,-10,-1,8],
      ['demo-science-02','demo-science','Океан',2,-2,7,16],
    ];
    for (const item of series) await client.query(
      'INSERT INTO series(id,project_id,name,"order",edit_start,otk_date,air_date)' +
      ' VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING',
      [item[0],item[1],item[2],item[3],relativeDay(item[4]),relativeDay(item[5]),relativeDay(item[6])]
    );

    const tasks = [
      ['demo-north','demo-north-01','Серия 01','Анна Волкова','монтаж',-2,10,19,'Сборка режиссёрской версии'],
      ['demo-north','demo-north-02','Серия 02','Мария Лебедева','цвет/звук',0,10,18,'Цветокоррекция'],
      ['demo-north','demo-north-02','Серия 02','Денис Орлов','цвет/звук',0,10,18,'Сведение'],
      ['demo-north','demo-north-03','Серия 03','Илья Соколов','синхра',1,10,16,'Подготовка материала'],
      ['demo-city','demo-city-01','Выпуск 01','Ольга Миронова','отсмотр',0,14,17,'Редакторский отсмотр'],
      ['demo-city','demo-city-01','Выпуск 01','Анна Волкова','правки',1,10,18,'Правки после отсмотра'],
      ['demo-city','demo-city-02','Выпуск 02','Илья Соколов','графика',2,11,19,'Плашки и инфографика'],
      ['demo-science','demo-science-01','Космос','Ольга Миронова','предотк',-1,11,14,'Предварительная проверка'],
      ['demo-science','demo-science-02','Океан','Анна Волкова','монтаж',3,10,19,'Первый монтаж'],
      ['demo-north','demo-north-01','Серия 01','Ольга Миронова','сдача',4,12,15,'Демо-сдача'],
    ];
    for (const item of tasks) await client.query(
      'INSERT INTO tasks(project_id,series_id,series,person,status,day,"from","to",note)' +
      ' VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [item[0],item[1],item[2],item[3],item[4],relativeDay(item[5]),item[6],item[7],item[8]]
    );

    await client.query(
      "INSERT INTO app_state(key,value) VALUES('local_demo_seeded',$1::jsonb) ON CONFLICT(key) DO NOTHING",
      [JSON.stringify({ version: 1, createdAt: new Date().toISOString() })]
    );
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {}
    throw error;
  } finally {
    client.release();
  }
  return user;
}

module.exports = { createLocalPool, seedLocalDemo };
