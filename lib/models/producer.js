const crypto = require('crypto');

function isoDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.getFullYear() + '-' + String(value.getMonth() + 1).padStart(2,'0') + '-' + String(value.getDate()).padStart(2,'0');
  }
  return String(value).slice(0, 10);
}

function mapBlock(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    seriesId: row.series_id || null,
    name: row.name,
    description: row.description || '',
    ownerPersonId: row.owner_person_id || null,
    ownerName: row.owner_name || '',
    status: row.status,
    startDate: isoDate(row.start_date),
    deadline: isoDate(row.deadline),
    sortOrder: Number(row.sort_order || 0),
    color: row.color || '#7c6f64',
    totalTasks: Number(row.total_tasks || 0),
    completedTasks: Number(row.completed_tasks || 0),
  };
}

function mapTask(row) {
  return {
    id: row.id,
    blockId: row.block_id,
    groupId: row.group_id || null,
    title: row.title,
    assigneePersonId: row.assignee_person_id || null,
    assigneeName: row.assignee_name || '',
    responsiblePersonId: row.responsible_person_id || null,
    responsibleName: row.responsible_name || '',
    deadline: isoDate(row.deadline),
    status: row.status,
    completed: row.status === 'done',
    sortOrder: Number(row.sort_order || 0),
    completedAt: row.completed_at || null,
  };
}

async function person(query, id) {
  const result = await query.query('SELECT id,name FROM people WHERE id=$1 AND deleted IS NOT TRUE AND active=true', [id]);
  if (!result.rows.length) {
    const error = new Error('Сотрудник не найден');
    error.status = 400;
    throw error;
  }
  return result.rows[0];
}

function createProducerModel(pool) {
  async function dashboard(query, allowedProjectIds, subject) {
    const projectRows = (await query.query(
      `SELECT p.id,p.name,p.abbr,p.description,p.color,p.status,
        (SELECT COUNT(*)::int FROM production_blocks b WHERE b.project_id=p.id AND b.deleted IS NOT TRUE) AS total_blocks,
        (SELECT COUNT(*)::int FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id
          WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND t.deleted IS NOT TRUE) AS total_tasks,
        (SELECT COUNT(*)::int FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id
          WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND t.deleted IS NOT TRUE AND t.status='done') AS completed_tasks,
        (SELECT MIN(deadline) FROM production_blocks b WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND b.status<>'done') AS next_deadline
       FROM projects p WHERE p.deleted IS NOT TRUE ORDER BY p.name`
    )).rows;
    const allowed = allowedProjectIds === null ? null : new Set(allowedProjectIds.map(String));
    const projects = projectRows.filter(function(row) { return !allowed || allowed.has(String(row.id)); }).map(function(row) {
      const total = Number(row.total_tasks || 0);
      const completed = Number(row.completed_tasks || 0);
      return {
        id: row.id, name: row.name, abbr: row.abbr, description: row.description || '', color: row.color,
        status: row.status, totalBlocks: Number(row.total_blocks || 0), totalTasks: total,
        completedTasks: completed, progress: total ? Math.round(completed * 100 / total) : 0,
        nextDeadline: isoDate(row.next_deadline),
      };
    });
    const projectIds = projects.map(function(item) { return item.id; });
    if (!projectIds.length) return {projects:[], myTasks:[], deadlines:[], attention:[]};
    const samName = String((subject && (subject.samName || subject.sam_name)) || '');
    const displayName = String((subject && (subject.displayName || subject.display_name)) || '');
    const taskRows = (await query.query(
      `SELECT t.*,b.name AS block_name,b.project_id,p.name AS project_name,p.color AS project_color,pe.login AS assignee_login
       FROM production_tasks t
       JOIN production_blocks b ON b.id=t.block_id AND b.deleted IS NOT TRUE
       JOIN projects p ON p.id=b.project_id AND p.deleted IS NOT TRUE
       LEFT JOIN people pe ON pe.id=t.assignee_person_id
       WHERE t.deleted IS NOT TRUE AND b.project_id=ANY($1::text[])
       ORDER BY t.deadline NULLS LAST,t.sort_order,t.title`, [projectIds]
    )).rows;
    function taskSummary(row) {
      return Object.assign(mapTask(row), {
        blockName: row.block_name, projectId: row.project_id, projectName: row.project_name, projectColor: row.project_color,
      });
    }
    const today = isoDate(new Date());
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const horizonDay = isoDate(horizon);
    const myTasks = taskRows.filter(function(row) {
      const date = isoDate(row.deadline);
      return row.status !== 'done' && date === today &&
        (String(row.assignee_login || '').toLowerCase() === samName.toLowerCase() || row.assignee_name === displayName);
    }).slice(0, 8).map(taskSummary);
    const deadlines = taskRows.filter(function(row) {
      const date = isoDate(row.deadline);
      return row.status !== 'done' && date && date >= today && date <= horizonDay;
    }).slice(0, 10).map(taskSummary);
    const attention = taskRows.filter(function(row) {
      const date = isoDate(row.deadline);
      return row.status !== 'done' && date && date < today;
    }).slice(0, 10).map(taskSummary);
    return {projects, myTasks, deadlines, attention};
  }

  async function project(query, projectId) {
    const found = await query.query('SELECT id,name,abbr,description,color,status FROM projects WHERE id=$1 AND deleted IS NOT TRUE', [projectId]);
    if (!found.rows.length) return null;
    const series = (await query.query('SELECT id,name,"order" FROM series WHERE project_id=$1 AND deleted IS NOT TRUE ORDER BY "order",name', [projectId])).rows.map(function(row) {
      return {id:row.id,name:row.name,order:Number(row.order || 0)};
    });
    const blocks = (await query.query(
      `SELECT b.*,
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status='done')::int AS completed_tasks
       FROM production_blocks b LEFT JOIN production_tasks t ON t.block_id=b.id AND t.deleted IS NOT TRUE
       WHERE b.project_id=$1 AND b.deleted IS NOT TRUE
       GROUP BY b.id ORDER BY b.sort_order,b.created_at`, [projectId]
    )).rows.map(mapBlock);
    const p = found.rows[0];
    return {project:{id:p.id,name:p.name,abbr:p.abbr,description:p.description||'',color:p.color,status:p.status},series,blocks};
  }

  async function block(query, blockId) {
    const found = await query.query(
      `SELECT b.*,COUNT(t.id)::int AS total_tasks,COUNT(t.id) FILTER (WHERE t.status='done')::int AS completed_tasks
       FROM production_blocks b LEFT JOIN production_tasks t ON t.block_id=b.id AND t.deleted IS NOT TRUE
       WHERE b.id=$1 AND b.deleted IS NOT TRUE GROUP BY b.id`, [blockId]
    );
    if (!found.rows.length) return null;
    const current = mapBlock(found.rows[0]);
    const projectRow = (await query.query('SELECT id,name,abbr,color FROM projects WHERE id=$1', [current.projectId])).rows[0];
    const seriesRow = current.seriesId ? (await query.query('SELECT id,name FROM series WHERE id=$1', [current.seriesId])).rows[0] : null;
    const groups = (await query.query('SELECT id,name,sort_order FROM production_task_groups WHERE block_id=$1 AND deleted IS NOT TRUE ORDER BY sort_order,created_at', [blockId])).rows.map(function(row) {
      return {id:row.id,name:row.name,sortOrder:Number(row.sort_order || 0)};
    });
    const tasks = (await query.query('SELECT * FROM production_tasks WHERE block_id=$1 AND deleted IS NOT TRUE ORDER BY sort_order,created_at', [blockId])).rows.map(mapTask);
    const people = (await query.query("SELECT id,name FROM people WHERE deleted IS NOT TRUE AND active=true ORDER BY name")).rows;
    const entityIds = [blockId].concat(groups.map(function(item) { return item.id; }), tasks.map(function(item) { return item.id; }));
    const history = (await query.query(
      `SELECT event_id,occurred_at,user_name,action,entity,entity_id,changes,details
       FROM audit_log WHERE entity_id=ANY($1::text[]) AND entity=ANY($2::text[])
       ORDER BY occurred_at DESC,id DESC LIMIT 30`,
      [entityIds, ['productionBlock','productionGroup','productionTask']]
    )).rows.map(function(row) {
      return {id:row.event_id,occurredAt:row.occurred_at,userName:row.user_name,action:row.action,entity:row.entity,entityId:row.entity_id,changes:row.changes||[],details:row.details||{}};
    });
    return {block:current, project:projectRow, series:seriesRow, groups, tasks, people, history};
  }

  async function createBlock(query, projectId, input) {
    const projectResult = await query.query('SELECT id,color FROM projects WHERE id=$1 AND deleted IS NOT TRUE', [projectId]);
    if (!projectResult.rows.length) throw Object.assign(new Error('Проект не найден'), {status:400});
    if (input.seriesId) {
      const seriesResult = await query.query('SELECT id FROM series WHERE id=$1 AND project_id=$2 AND deleted IS NOT TRUE', [input.seriesId,projectId]);
      if (!seriesResult.rows.length) throw Object.assign(new Error('Серия не относится к проекту'), {status:400});
    }
    const owner = await person(query,input.ownerPersonId);
    const order = Number((await query.query('SELECT COALESCE(MAX(sort_order),-1)+1 AS next FROM production_blocks WHERE project_id=$1', [projectId])).rows[0].next || 0);
    const id = crypto.randomUUID();
    await query.query(
      `INSERT INTO production_blocks(id,project_id,series_id,name,description,owner_person_id,owner_name,status,deadline,sort_order,color)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id,projectId,input.seriesId||null,input.name,input.description||'',owner.id,owner.name,input.status||'planned',input.deadline||null,order,projectResult.rows[0].color]
    );
    return {id};
  }

  async function createGroup(query, blockId, input) {
    const blockResult = await query.query('SELECT project_id FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    if (!blockResult.rows.length) throw Object.assign(new Error('Блок не найден'), {status:400});
    const order = Number((await query.query('SELECT COALESCE(MAX(sort_order),-1)+1 AS next FROM production_task_groups WHERE block_id=$1', [blockId])).rows[0].next || 0);
    const id = crypto.randomUUID();
    await query.query('INSERT INTO production_task_groups(id,block_id,name,sort_order) VALUES($1,$2,$3,$4)', [id,blockId,input.name,order]);
    return {id,projectId:blockResult.rows[0].project_id};
  }

  async function createTask(query, blockId, input) {
    const blockResult = await query.query('SELECT project_id FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    if (!blockResult.rows.length) throw Object.assign(new Error('Блок не найден'), {status:400});
    if (input.groupId) {
      const group = await query.query('SELECT id FROM production_task_groups WHERE id=$1 AND block_id=$2 AND deleted IS NOT TRUE', [input.groupId,blockId]);
      if (!group.rows.length) throw Object.assign(new Error('Группа не относится к блоку'), {status:400});
    }
    const assignee = await person(query,input.assigneePersonId);
    const responsible = input.responsiblePersonId ? await person(query,input.responsiblePersonId) : null;
    const order = Number((await query.query('SELECT COALESCE(MAX(sort_order),-1)+1 AS next FROM production_tasks WHERE block_id=$1', [blockId])).rows[0].next || 0);
    const id = crypto.randomUUID();
    await query.query(
      `INSERT INTO production_tasks(id,block_id,group_id,title,assignee_person_id,assignee_name,responsible_person_id,responsible_name,deadline,sort_order)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id,blockId,input.groupId||null,input.title,assignee.id,assignee.name,responsible&&responsible.id,responsible&&responsible.name||'',input.deadline||null,order]
    );
    return {id,projectId:blockResult.rows[0].project_id};
  }

  async function updateTask(query, taskId, input) {
    const result = await query.query(
      `SELECT t.*,b.project_id FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id
       WHERE t.id=$1 AND t.deleted IS NOT TRUE AND b.deleted IS NOT TRUE`, [taskId]
    );
    if (!result.rows.length) throw Object.assign(new Error('Задача не найдена'), {status:404});
    const current = result.rows[0];
    if (input.groupId !== undefined && input.groupId !== null) {
      const group = await query.query('SELECT id FROM production_task_groups WHERE id=$1 AND block_id=$2 AND deleted IS NOT TRUE', [input.groupId,current.block_id]);
      if (!group.rows.length) throw Object.assign(new Error('Группа не относится к блоку'), {status:400});
    }
    const assignee = input.assigneePersonId ? await person(query,input.assigneePersonId) : null;
    const responsible = input.responsiblePersonId ? await person(query,input.responsiblePersonId) : null;
    const title = input.title === undefined ? current.title : input.title;
    const groupId = input.groupId === undefined ? current.group_id : input.groupId;
    const assigneeId = assignee ? assignee.id : current.assignee_person_id;
    const assigneeName = assignee ? assignee.name : current.assignee_name;
    const responsibleId = input.responsiblePersonId === undefined ? current.responsible_person_id : (responsible ? responsible.id : null);
    const responsibleName = input.responsiblePersonId === undefined ? current.responsible_name : (responsible ? responsible.name : '');
    const deadline = input.deadline === undefined ? isoDate(current.deadline) : input.deadline;
    const status = input.completed === undefined ? current.status : (input.completed ? 'done' : 'todo');
    await query.query(
      `UPDATE production_tasks SET title=$2,group_id=$3,assignee_person_id=$4,assignee_name=$5,
       responsible_person_id=$6,responsible_name=$7,deadline=$8,status=$9,
       completed_at=CASE WHEN $9='done' THEN COALESCE(completed_at,NOW()) ELSE NULL END,updated_at=NOW() WHERE id=$1`,
      [taskId,title,groupId,assigneeId,assigneeName,responsibleId,responsibleName,deadline,status]
    );
    return {id:taskId,blockId:current.block_id,projectId:current.project_id};
  }

  async function blockProjectId(query, blockId) {
    const found = await query.query('SELECT project_id FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    return found.rows[0] && found.rows[0].project_id;
  }

  async function taskProjectId(query, taskId) {
    const found = await query.query('SELECT b.project_id FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id WHERE t.id=$1 AND t.deleted IS NOT TRUE', [taskId]);
    return found.rows[0] && found.rows[0].project_id;
  }

  return {dashboard,project,block,createBlock,createGroup,createTask,updateTask,blockProjectId,taskProjectId};
}

module.exports = createProducerModel;
