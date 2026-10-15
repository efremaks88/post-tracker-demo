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

function relativeIsoDay(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

async function seedProducerDemo(pool, user) {
  const marker = await pool.query("SELECT value FROM app_state WHERE key='local_demo_producer_seeded'");
  if (marker.rows.length) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "INSERT INTO people(id,name,email,login,roles,active) VALUES('local-demo-producer','Локальный администратор','','local-demo',ARRAY['продюсер'],true) " +
      "ON CONFLICT(id) DO UPDATE SET login='local-demo',active=true"
    );
    const blocks = [
      ['demo-pb-north-concept','demo-north',null,'Концепция и формат','Утверждён формат сезона','demo-olga','Ольга Миронова','done',-14,0],
      ['demo-pb-north-prep','demo-north',null,'Препродакшн','Команда, локации и документы','local-demo-producer','Локальный администратор','active',2,1],
      ['demo-pb-north-shoot-01','demo-north','demo-north-01','Съёмка серии 01','Подготовка и проведение съёмки','demo-olga','Ольга Миронова','active',4,2],
      ['demo-pb-north-shoot-02','demo-north','demo-north-02','Съёмка серии 02','','demo-olga','Ольга Миронова','planned',9,3],
      ['demo-pb-north-post-01','demo-north','demo-north-01','Постпродакшн серии 01','','demo-anna','Анна Волкова','planned',12,4],
      ['demo-pb-city-dev','demo-city',null,'Подготовка выпуска','Темы, герои и сценарный план','local-demo-producer','Локальный администратор','active',1,0],
      ['demo-pb-city-release','demo-city','demo-city-01','Выпуск 01','Сборка выпуска и публикация','demo-olga','Ольга Миронова','planned',7,1],
      ['demo-pb-science-research','demo-science',null,'Исследование темы','Фактура и эксперты','demo-olga','Ольга Миронова','active',-1,0],
      ['demo-pb-science-shoot','demo-science','demo-science-01','Съёмка «Космос»','','demo-olga','Ольга Миронова','planned',6,1],
    ];
    for (const item of blocks) await client.query(
      `INSERT INTO production_blocks(id,project_id,series_id,name,description,owner_person_id,owner_name,status,deadline,sort_order,color)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,color FROM projects WHERE id=$2 ON CONFLICT(id) DO NOTHING`,
      [item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7],relativeIsoDay(item[8]),item[9]]
    );
    const groups = [
      ['demo-pg-north-script','demo-pb-north-prep','Сценарий',0],
      ['demo-pg-north-locations','demo-pb-north-prep','Локации',1],
      ['demo-pg-north-team','demo-pb-north-prep','Команда',2],
      ['demo-pg-city-topics','demo-pb-city-dev','Темы выпуска',0],
      ['demo-pg-science-experts','demo-pb-science-research','Эксперты',0],
    ];
    for (const item of groups) await client.query(
      'INSERT INTO production_task_groups(id,block_id,name,sort_order) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING', item
    );
    const tasks = [
      ['demo-pt-north-format','demo-pb-north-concept',null,'Утвердить формат сезона','demo-olga','Ольга Миронова',null,'',-16,'done',0],
      ['demo-pt-north-draft','demo-pb-north-prep','demo-pg-north-script','Получить первый драфт сценария','local-demo-producer','Локальный администратор','demo-olga','Ольга Миронова',0,'todo',0],
      ['demo-pt-north-location','demo-pb-north-prep','demo-pg-north-locations','Подтвердить основную локацию','demo-olga','Ольга Миронова',null,'',1,'todo',1],
      ['demo-pt-north-crew','demo-pb-north-prep','demo-pg-north-team','Собрать съёмочную группу','demo-olga','Ольга Миронова',null,'',2,'todo',2],
      ['demo-pt-north-call','demo-pb-north-shoot-01',null,'Разослать вызывной лист','local-demo-producer','Локальный администратор',null,'',2,'todo',0],
      ['demo-pt-north-equipment','demo-pb-north-shoot-01',null,'Проверить комплект техники','demo-ilya','Илья Соколов',null,'',3,'todo',1],
      ['demo-pt-city-topic','demo-pb-city-dev','demo-pg-city-topics','Утвердить главную тему выпуска','local-demo-producer','Локальный администратор',null,'',0,'todo',0],
      ['demo-pt-city-guest','demo-pb-city-dev','demo-pg-city-topics','Подтвердить гостя','demo-olga','Ольга Миронова',null,'',1,'todo',1],
      ['demo-pt-science-expert','demo-pb-science-research','demo-pg-science-experts','Получить комментарий эксперта','demo-olga','Ольга Миронова',null,'',-1,'todo',0],
      ['demo-pt-science-facts','demo-pb-science-research',null,'Проверить научные факты','demo-olga','Ольга Миронова',null,'',2,'todo',1],
    ];
    for (const item of tasks) await client.query(
      `INSERT INTO production_tasks(id,block_id,group_id,title,assignee_person_id,assignee_name,responsible_person_id,responsible_name,deadline,status,sort_order,completed_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CASE WHEN $10='done' THEN NOW() ELSE NULL END) ON CONFLICT(id) DO NOTHING`,
      [item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7],relativeIsoDay(item[8]),item[9],item[10]]
    );
    await client.query(
      "INSERT INTO app_state(key,value) VALUES('local_demo_producer_seeded',$1::jsonb) ON CONFLICT(key) DO NOTHING",
      [JSON.stringify({version:1,createdAt:new Date().toISOString(),user:user.sam_name})]
    );
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {}
    throw error;
  } finally { client.release(); }
}

async function seedProducerD2Demo(pool, user) {
  const marker = await pool.query("SELECT value FROM app_state WHERE key='local_demo_producer_d2_seeded'");
  if (marker.rows.length) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO production_approvals
        (id,project_id,block_id,task_id,title,required,due_date,requested_by_user_id,requested_by_name)
       VALUES('demo-pa-north-script','demo-north','demo-pb-north-prep','demo-pt-north-draft',
        'Утвердить сценарий перед съёмкой',true,$1,$2,$3) ON CONFLICT(id) DO NOTHING`,
      [relativeIsoDay(1),user.id,user.display_name]
    );
    await client.query(
      `INSERT INTO production_approvals
        (id,project_id,block_id,task_id,title,required,due_date,status,decision,requested_by_user_id,requested_by_name,
         decided_by_user_id,decided_by_name,decided_at,decision_comment)
       VALUES('demo-pa-north-format','demo-north','demo-pb-north-concept','demo-pt-north-format',
        'Утвердить формат сезона',true,$1,'decided','approved',$2,$3,$2,$3,NOW(),'Формат принят')
       ON CONFLICT(id) DO NOTHING`,
      [relativeIsoDay(-15),user.id,user.display_name]
    );
    await client.query(
      "INSERT INTO app_state(key,value) VALUES('local_demo_producer_d2_seeded',$1::jsonb) ON CONFLICT(key) DO NOTHING",
      [JSON.stringify({version:1,createdAt:new Date().toISOString(),user:user.sam_name})]
    );
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {}
    throw error;
  } finally { client.release(); }
}

async function seedProducerD21Demo(pool, user) {
  const marker = await pool.query("SELECT value FROM app_state WHERE key='local_demo_producer_d21_seeded'");
  if (marker.rows.length) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roles = [
      ['оператор','Оператор','#587a91'],['режиссер','Режиссёр','#a65d4b'],
      ['юрист','Юридический отдел','#76608d'],['финансы','Финансовый отдел','#9a7a39'],
    ];
    for (const role of roles) await client.query(
      'INSERT INTO roles(id,label,color) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING', role
    );
    const people = [
      ['demo-pavel','Павел Крылов',['оператор']],
      ['demo-elena','Елена Зорина',['продюсер']],
      ['demo-kirill','Кирилл Андреев',['режиссер','монтаж']],
      ['demo-sofia','София Ахметова',['графика']],
      ['demo-victor','Виктор Ким',['юрист']],
      ['demo-irina','Ирина Соколова',['финансы']],
    ];
    for (const person of people) await client.query(
      'INSERT INTO people(id,name,roles,active) VALUES($1,$2,$3,true) ON CONFLICT(id) DO NOTHING', person
    );
    const projects = [
      ['demo-home','Дом, который помнит','ДП','Документальный фильм о семейной памяти и старом доме','#d17857','постпродакшн','1'],
      ['demo-stage','За кулисами','ЗК','Культурная программа о театре и людях сцены','#b45f78','съёмка','1'],
      ['demo-factory','Люди дела','ЛД','Имиджевый фильм о производстве и его сотрудниках','#b8873d','подготовка','1'],
      ['demo-expedition','Точка на карте','ТК','Приключенческий цикл об экспедициях по России','#557b63','в работе','1'],
    ];
    for (const project of projects) {
      const dossier = {info:{type:project[3]},paths:[],accesses:[],links:[],notes:'Расширенный демонстрационный проект DEV v0.8.0.'};
      await client.query(
        'INSERT INTO projects(id,name,abbr,description,color,status,season,dossier) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT(id) DO NOTHING',
        [...project,JSON.stringify(dossier)]
      );
      await client.query(
        'INSERT INTO project_managers(project_id,user_uid,user_name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [project[0],user.sam_name,user.display_name]
      );
    }
    const series = [
      ['demo-stage-01','demo-stage','Премьера',1],
      ['demo-expedition-01','demo-expedition','Карелия',1],
      ['demo-expedition-02','demo-expedition','Алтай',2],
    ];
    for (const item of series) await client.query(
      'INSERT INTO series(id,project_id,name,"order",edit_start,otk_date,air_date) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING',
      [item[0],item[1],item[2],item[3],relativeDay(1),relativeDay(8),relativeDay(14)]
    );
    const blocks = [
      ['demo-pb-home-research','demo-home',null,'Архив и история','Собрать семейные материалы','demo-elena','Елена Зорина','done',-5,0],
      ['demo-pb-home-edit','demo-home',null,'Монтаж истории','Собрать первый цельный фильм','demo-kirill','Кирилл Андреев','active',3,1],
      ['demo-pb-home-finish','demo-home',null,'Финиш и сдача','Графика, звук и мастер','demo-sofia','София Ахметова','planned',11,2],
      ['demo-pb-stage-prep','demo-stage',null,'Подготовка площадки','Доступы, договор и съёмочный план','demo-elena','Елена Зорина','active',1,0],
      ['demo-pb-stage-shoot','demo-stage','demo-stage-01','Съёмка премьеры','Интервью и закулисье','demo-pavel','Павел Крылов','planned',4,1],
      ['demo-pb-stage-edit','demo-stage','demo-stage-01','Сборка выпуска','Монтаж и редакторский просмотр','demo-kirill','Кирилл Андреев','planned',9,2],
      ['demo-pb-factory-contract','demo-factory',null,'Документы и смета','Закрыть договор и бюджет','demo-irina','Ирина Соколова','active',-1,0],
      ['demo-pb-factory-shoot','demo-factory',null,'Съёмка производства','Цеха, портреты и процессы','demo-pavel','Павел Крылов','planned',5,1],
      ['demo-pb-factory-post','demo-factory',null,'Монтаж фильма','Черновая и финальная версии','demo-kirill','Кирилл Андреев','planned',13,2],
      ['demo-pb-exp-route','demo-expedition',null,'Маршрут и разрешения','Логистика двух экспедиций','demo-elena','Елена Зорина','active',2,0],
      ['demo-pb-exp-kar','demo-expedition','demo-expedition-01','Экспедиция: Карелия','Полевая съёмка первой серии','demo-pavel','Павел Крылов','planned',7,1],
      ['demo-pb-exp-altai','demo-expedition','demo-expedition-02','Экспедиция: Алтай','Полевая съёмка второй серии','demo-pavel','Павел Крылов','planned',12,2],
    ];
    for (const item of blocks) await client.query(
      `INSERT INTO production_blocks(id,project_id,series_id,name,description,owner_person_id,owner_name,status,deadline,sort_order,color)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,color FROM projects WHERE id=$2 ON CONFLICT(id) DO NOTHING`,
      [item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7],relativeIsoDay(item[8]),item[9]]
    );
    const groups = [
      ['demo-pg-home-edit','demo-pb-home-edit','Монтаж',0],
      ['demo-pg-home-assets','demo-pb-home-edit','Архив',1],
      ['demo-pg-stage-docs','demo-pb-stage-prep','Документы',0],
      ['demo-pg-stage-plan','demo-pb-stage-prep','Съёмочный план',1],
      ['demo-pg-factory-budget','demo-pb-factory-contract','Финансы и договор',0],
      ['demo-pg-exp-logistics','demo-pb-exp-route','Логистика',0],
      ['demo-pg-exp-permits','demo-pb-exp-route','Разрешения',1],
    ];
    for (const item of groups) await client.query(
      'INSERT INTO production_task_groups(id,block_id,name,sort_order) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO NOTHING', item
    );
    const tasks = [
      ['demo-pt-home-structure','demo-pb-home-edit','demo-pg-home-edit','Уточнить структуру второй части','local-demo-producer','Локальный администратор','demo-elena','Елена Зорина',0,'todo',0],
      ['demo-pt-home-archive','demo-pb-home-edit','demo-pg-home-assets','Оцифровать последние фотографии','demo-anna','Анна Волкова',null,'',1,'todo',1],
      ['demo-pt-home-cut','demo-pb-home-edit','demo-pg-home-edit','Собрать черновой монтаж','demo-kirill','Кирилл Андреев','demo-elena','Елена Зорина',3,'todo',2],
      ['demo-pt-stage-contract','demo-pb-stage-prep','demo-pg-stage-docs','Проверить договор с театром','demo-victor','Виктор Ким',null,'',-1,'todo',0],
      ['demo-pt-stage-call','demo-pb-stage-prep','demo-pg-stage-plan','Подготовить вызывной лист','local-demo-producer','Локальный администратор','demo-elena','Елена Зорина',0,'todo',1],
      ['demo-pt-stage-questions','demo-pb-stage-prep','demo-pg-stage-plan','Согласовать вопросы для актёров','demo-elena','Елена Зорина',null,'',1,'todo',2],
      ['demo-pt-factory-budget','demo-pb-factory-contract','demo-pg-factory-budget','Подтвердить итоговую смету','demo-irina','Ирина Соколова',null,'',-1,'todo',0],
      ['demo-pt-factory-legal','demo-pb-factory-contract','demo-pg-factory-budget','Закрыть права на музыку','demo-victor','Виктор Ким',null,'',0,'todo',1],
      ['demo-pt-factory-plan','demo-pb-factory-shoot',null,'Утвердить маршрут по цехам','demo-pavel','Павел Крылов','demo-elena','Елена Зорина',3,'todo',0],
      ['demo-pt-exp-tickets','demo-pb-exp-route','demo-pg-exp-logistics','Купить билеты группе','local-demo-producer','Локальный администратор','demo-elena','Елена Зорина',0,'todo',0],
      ['demo-pt-exp-permit','demo-pb-exp-route','demo-pg-exp-permits','Получить разрешение заповедника','demo-victor','Виктор Ким',null,'',1,'todo',1],
      ['demo-pt-exp-gear','demo-pb-exp-route','demo-pg-exp-logistics','Проверить полевой комплект','demo-pavel','Павел Крылов',null,'',2,'todo',2],
    ];
    for (const item of tasks) await client.query(
      `INSERT INTO production_tasks(id,block_id,group_id,title,assignee_person_id,assignee_name,responsible_person_id,responsible_name,deadline,status,sort_order)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(id) DO NOTHING`,
      [item[0],item[1],item[2],item[3],item[4],item[5],item[6],item[7],relativeIsoDay(item[8]),item[9],item[10]]
    );
    const approvals = [
      ['demo-pa-stage-contract','demo-stage','demo-pb-stage-prep','demo-pt-stage-contract','Юридический отдел · согласовать договор',true,0],
      ['demo-pa-factory-budget','demo-factory','demo-pb-factory-contract','demo-pt-factory-budget','Финансовый отдел · утвердить смету',true,-1],
      ['demo-pa-exp-budget','demo-expedition','demo-pb-exp-route',null,'Финансовый отдел · подтвердить бюджет экспедиции',true,1],
    ];
    for (const item of approvals) await client.query(
      `INSERT INTO production_approvals(id,project_id,block_id,task_id,title,required,due_date,requested_by_user_id,requested_by_name)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING`,
      [item[0],item[1],item[2],item[3],item[4],item[5],relativeIsoDay(item[6]),user.id,user.display_name]
    );
    await client.query(
      "INSERT INTO app_state(key,value) VALUES('local_demo_producer_d21_seeded',$1::jsonb) ON CONFLICT(key) DO NOTHING",
      [JSON.stringify({version:1,createdAt:new Date().toISOString(),user:user.sam_name})]
    );
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {}
    throw error;
  } finally { client.release(); }
}

async function resetProducerDemo(pool, user) {
  const projectIds = ['demo-north','demo-city','demo-science','demo-home','demo-stage','demo-factory','demo-expedition'];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("DELETE FROM audit_log WHERE entity=ANY($1::text[]) AND project_id=ANY($2::text[])", [['productionBlock','productionGroup','productionTask','productionApproval'],projectIds]);
    await client.query('DELETE FROM production_blocks WHERE project_id=ANY($1::text[])', [projectIds]);
    await client.query("DELETE FROM app_state WHERE key=ANY($1::text[])", [['local_demo_producer_seeded','local_demo_producer_d2_seeded','local_demo_producer_d21_seeded']]);
    await client.query('COMMIT');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {}
    throw error;
  } finally { client.release(); }
  await seedProducerDemo(pool,user);
  await seedProducerD2Demo(pool,user);
  await seedProducerD21Demo(pool,user);
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
  if (!marker.rows.length) {
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
  }
  await seedProducerDemo(pool,user);
  await seedProducerD2Demo(pool,user);
  await seedProducerD21Demo(pool,user);
  return user;
}

module.exports = { createLocalPool, seedLocalDemo, seedProducerDemo, seedProducerD2Demo, seedProducerD21Demo, resetProducerDemo };
