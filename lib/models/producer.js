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
    internalComment: row.internal_comment || '',
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

function mapApproval(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    blockId: row.block_id,
    taskId: row.task_id || null,
    title: row.title,
    required: row.required === true,
    dueDate: isoDate(row.due_date),
    status: row.status,
    decision: row.decision || null,
    requestedByName: row.requested_by_name || '',
    decidedByName: row.decided_by_name || '',
    decidedAt: row.decided_at || null,
    decisionComment: row.decision_comment || '',
    createdAt: row.created_at || null,
  };
}

function addDays(day, count) {
  const date = new Date(day + 'T12:00:00');
  date.setDate(date.getDate() + count);
  return isoDate(date);
}

function legacyIsoDate(value) {
  const match = String(value || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? match[3] + '-' + match[2] + '-' + match[1] : null;
}

function daysBetween(first, second) {
  if (!first || !second) return 0;
  return Math.max(0, Math.round((new Date(second + 'T12:00:00') - new Date(first + 'T12:00:00')) / 86400000));
}

function profileAchievements(value) {
  let result = value;
  if (typeof result === 'string') {
    try { result = JSON.parse(result); } catch (error) { result = []; }
  }
  return Array.isArray(result) ? result.slice(0, 4) : [];
}

function blockWarnings(block, tasks, approvals, today) {
  const warnings = [];
  const openTasks = tasks.filter(function(task) { return task.status !== 'done'; });
  openTasks.forEach(function(task) {
    if (task.deadline && task.deadline < today) warnings.push({
      id: 'task:' + task.id, type: 'task_overdue', severity: 'high', taskId: task.id,
      title: 'Просрочена задача', message: task.title, dueDate: task.deadline,
    });
  });
  if (block.status !== 'done' && openTasks.length && block.deadline) {
    if (block.deadline < today) warnings.push({
      id: 'block:' + block.id, type: 'block_overdue', severity: 'high', blockId: block.id,
      title: 'Просрочен блок', message: openTasks.length + ' незавершённых задач', dueDate: block.deadline,
    });
    else if (block.deadline <= addDays(today, 3)) warnings.push({
      id: 'block:' + block.id, type: 'block_due_soon', severity: 'medium', blockId: block.id,
      title: 'Срок блока близко', message: openTasks.length + ' незавершённых задач', dueDate: block.deadline,
    });
  }
  approvals.filter(function(item) { return item.required; }).forEach(function(item) {
    if (item.decision === 'rejected') warnings.push({
      id: 'approval:' + item.id, type: 'approval_rejected', severity: 'high', approvalId: item.id,
      title: 'Обязательное согласование отклонено', message: item.title, dueDate: item.dueDate,
    });
    else if (item.status === 'pending') warnings.push({
      id: 'approval:' + item.id, type: item.dueDate && item.dueDate < today ? 'approval_overdue' : 'approval_pending',
      severity: item.dueDate && item.dueDate < today ? 'high' : 'medium', approvalId: item.id,
      title: item.dueDate && item.dueDate < today ? 'Просрочено обязательное согласование' : 'Ожидается обязательное согласование',
      message: item.title, dueDate: item.dueDate,
    });
  });
  return warnings;
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
  async function createProject(query, input, subject) {
    const id = crypto.randomUUID();
    const words = String(input.name || '').trim().split(/\s+/).filter(Boolean);
    const generatedAbbr = words.slice(0,2).map(function(word) { return word[0]; }).join('').toUpperCase();
    const abbr = String(input.abbr || generatedAbbr || input.name.slice(0,2)).slice(0,20);
    await query.query(
      `INSERT INTO projects(id,name,abbr,description,color,status,season,dossier,deleted)
       VALUES($1,$2,$3,$4,$5,$6,'','{}'::jsonb,false)`,
      [id,input.name,abbr,input.description || '',input.color,input.status]
    );
    const userUid = String(subject.samName || subject.userId || '');
    const userName = String(subject.displayName || subject.samName || '');
    if (userUid) {
      await query.query(
        `INSERT INTO project_managers(project_id,user_uid,user_name) VALUES($1,$2,$3)
         ON CONFLICT(project_id,user_uid) DO UPDATE SET user_name=EXCLUDED.user_name`,
        [id,userUid,userName]
      );
    }
    return {id,name:input.name};
  }

  async function dashboard(query, allowedProjectIds, subject) {
    const today = isoDate(new Date());
    const warningHorizon = addDays(today, 3);
    const projectRows = (await query.query(
      `SELECT p.id,p.name,p.abbr,p.description,p.color,p.status,
        (SELECT COUNT(*)::int FROM production_blocks b WHERE b.project_id=p.id AND b.deleted IS NOT TRUE) AS total_blocks,
        (SELECT COUNT(*)::int FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id
          WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND t.deleted IS NOT TRUE) AS total_tasks,
        (SELECT COUNT(*)::int FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id
          WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND t.deleted IS NOT TRUE AND t.status='done') AS completed_tasks,
        (SELECT MIN(deadline) FROM production_blocks b WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND b.status<>'done') AS next_deadline,
        (SELECT COUNT(*)::int FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id
          WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND t.deleted IS NOT TRUE AND t.status<>'done' AND t.deadline<$1) +
        (SELECT COUNT(*)::int FROM production_blocks b WHERE b.project_id=p.id AND b.deleted IS NOT TRUE AND b.status<>'done'
          AND b.deadline<=$2 AND EXISTS (SELECT 1 FROM production_tasks t WHERE t.block_id=b.id AND t.deleted IS NOT TRUE AND t.status<>'done')) +
        (SELECT COUNT(*)::int FROM production_approvals a WHERE a.project_id=p.id AND a.deleted IS NOT TRUE AND a.required=true
          AND (a.status='pending' OR a.decision='rejected')) AS warning_count
       FROM projects p WHERE p.deleted IS NOT TRUE ORDER BY p.name`, [today,warningHorizon]
    )).rows;
    const allowed = allowedProjectIds === null ? null : new Set(allowedProjectIds.map(String));
    const projects = projectRows.filter(function(row) { return !allowed || allowed.has(String(row.id)); }).map(function(row) {
      const total = Number(row.total_tasks || 0);
      const completed = Number(row.completed_tasks || 0);
      return {
        id: row.id, name: row.name, abbr: row.abbr, description: row.description || '', color: row.color,
        status: row.status, totalBlocks: Number(row.total_blocks || 0), totalTasks: total,
        completedTasks: completed, progress: total ? Math.round(completed * 100 / total) : 0,
        nextDeadline: isoDate(row.next_deadline), warningCount: Number(row.warning_count || 0),
      };
    });
    const projectIds = projects.map(function(item) { return item.id; });
    if (!projectIds.length) return {projects:[], myTasks:[], deadlines:[], calendarItems:[], attention:[]};
    const teamRows = (await query.query(
      `SELECT b.project_id,b.owner_person_id AS id,b.owner_name AS name,MIN(b.sort_order)::int AS first_block
       FROM production_blocks b
       WHERE b.project_id=ANY($1::text[]) AND b.deleted IS NOT TRUE AND b.owner_person_id IS NOT NULL
       GROUP BY b.project_id,b.owner_person_id,b.owner_name
       ORDER BY b.project_id,first_block,b.owner_name`, [projectIds]
    )).rows;
    const teams = new Map();
    teamRows.forEach(function(row) {
      const rows = teams.get(String(row.project_id)) || [];
      if (rows.length < 4) rows.push({id:row.id,name:row.name});
      teams.set(String(row.project_id),rows);
    });
    projects.forEach(function(projectItem) { projectItem.team = teams.get(String(projectItem.id)) || []; });
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
    const calendarItems = taskRows.filter(function(row) {
      return row.status !== 'done' && Boolean(isoDate(row.deadline));
    }).slice(0, 150).map(taskSummary);
    const overdueTasks = taskRows.filter(function(row) {
      const date = isoDate(row.deadline);
      return row.status !== 'done' && date && date < today;
    }).map(function(row) {
      return Object.assign(taskSummary(row), {
        id:'task:' + row.id, taskId:row.id, kind:'task', severity:'high', reason:'Задача просрочена',
      });
    });
    const blockAttention = (await query.query(
      `SELECT b.id,b.name,b.project_id,b.deadline,p.name AS project_name,p.color AS project_color,
        COUNT(t.id) FILTER (WHERE t.status<>'done')::int AS open_tasks
       FROM production_blocks b
       JOIN projects p ON p.id=b.project_id AND p.deleted IS NOT TRUE
       LEFT JOIN production_tasks t ON t.block_id=b.id AND t.deleted IS NOT TRUE
       WHERE b.project_id=ANY($1::text[]) AND b.deleted IS NOT TRUE AND b.status<>'done' AND b.deadline<=$2
       GROUP BY b.id,p.name,p.color
       HAVING COUNT(t.id) FILTER (WHERE t.status<>'done')>0`, [projectIds,warningHorizon]
    )).rows.map(function(row) {
      const overdue = isoDate(row.deadline) < today;
      return {
        id:'block:' + row.id, blockId:row.id, kind:'block', severity:overdue?'high':'medium',
        title:row.name, reason:overdue?'Просрочен срок блока':'Срок блока близко',
        detail:Number(row.open_tasks || 0) + ' незавершённых задач', deadline:isoDate(row.deadline),
        projectId:row.project_id, projectName:row.project_name, projectColor:row.project_color,
      };
    });
    const approvalAttention = (await query.query(
      `SELECT a.id,a.block_id,a.task_id,a.title,a.due_date,a.status,a.decision,b.name AS block_name,
        b.project_id,p.name AS project_name,p.color AS project_color
       FROM production_approvals a
       JOIN production_blocks b ON b.id=a.block_id AND b.deleted IS NOT TRUE
       JOIN projects p ON p.id=b.project_id AND p.deleted IS NOT TRUE
       WHERE b.project_id=ANY($1::text[]) AND a.deleted IS NOT TRUE AND a.required=true
         AND (a.status='pending' OR a.decision='rejected')`, [projectIds]
    )).rows.map(function(row) {
      const rejected = row.decision === 'rejected';
      const overdue = !rejected && isoDate(row.due_date) && isoDate(row.due_date) < today;
      return {
        id:'approval:' + row.id, approvalId:row.id, taskId:row.task_id || null, blockId:row.block_id,
        kind:'approval', severity:rejected||overdue?'high':'medium', title:row.title,
        reason:rejected?'Согласование отклонено':overdue?'Согласование просрочено':'Ждёт обязательного решения',
        detail:row.block_name, deadline:isoDate(row.due_date), projectId:row.project_id,
        projectName:row.project_name, projectColor:row.project_color,
      };
    });
    const attention = overdueTasks.concat(blockAttention,approvalAttention).sort(function(left,right) {
      if (left.severity !== right.severity) return left.severity === 'high' ? -1 : 1;
      return String(left.deadline || '9999-12-31').localeCompare(String(right.deadline || '9999-12-31'));
    }).slice(0,12);
    return {projects, myTasks, deadlines, calendarItems, attention};
  }

  async function project(query, projectId) {
    const found = await query.query('SELECT id,name,abbr,description,color,status FROM projects WHERE id=$1 AND deleted IS NOT TRUE', [projectId]);
    if (!found.rows.length) return null;
    const series = (await query.query('SELECT id,name,"order" FROM series WHERE project_id=$1 AND deleted IS NOT TRUE ORDER BY "order",name', [projectId])).rows.map(function(row) {
      return {id:row.id,name:row.name,order:Number(row.order || 0)};
    });
    const today = isoDate(new Date());
    const warningHorizon = addDays(today, 3);
    const blocks = (await query.query(
      `SELECT b.*,
        COUNT(t.id)::int AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status='done')::int AS completed_tasks,
        COUNT(t.id) FILTER (WHERE t.status<>'done' AND t.deadline<$2)::int +
        (SELECT COUNT(*)::int FROM production_approvals a WHERE a.block_id=b.id AND a.deleted IS NOT TRUE AND a.required=true
          AND (a.status='pending' OR a.decision='rejected')) +
        CASE WHEN b.status<>'done' AND b.deadline<=$3 AND COUNT(t.id) FILTER (WHERE t.status<>'done')>0 THEN 1 ELSE 0 END AS warning_count
       FROM production_blocks b LEFT JOIN production_tasks t ON t.block_id=b.id AND t.deleted IS NOT TRUE
       WHERE b.project_id=$1 AND b.deleted IS NOT TRUE
       GROUP BY b.id ORDER BY b.sort_order,b.created_at`, [projectId,today,warningHorizon]
    )).rows.map(function(row) {
      const block = mapBlock(row);
      block.warningCount = Number(row.warning_count || 0);
      return block;
    });
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
    const seriesOptions = (await query.query('SELECT id,name,"order" FROM series WHERE project_id=$1 AND deleted IS NOT TRUE ORDER BY "order",name', [current.projectId])).rows.map(function(row) {
      return {id:row.id,name:row.name,order:Number(row.order || 0)};
    });
    const groups = (await query.query('SELECT id,name,sort_order FROM production_task_groups WHERE block_id=$1 AND deleted IS NOT TRUE ORDER BY sort_order,created_at', [blockId])).rows.map(function(row) {
      return {id:row.id,name:row.name,sortOrder:Number(row.sort_order || 0)};
    });
    const tasks = (await query.query('SELECT * FROM production_tasks WHERE block_id=$1 AND deleted IS NOT TRUE ORDER BY sort_order,created_at', [blockId])).rows.map(mapTask);
    const approvals = (await query.query(
      'SELECT * FROM production_approvals WHERE block_id=$1 AND deleted IS NOT TRUE ORDER BY created_at DESC,id', [blockId]
    )).rows.map(mapApproval);
    const people = (await query.query("SELECT id,name FROM people WHERE deleted IS NOT TRUE AND active=true ORDER BY name")).rows;
    const relatedIds = (await query.query(
      `SELECT id FROM production_task_groups WHERE block_id=$1
       UNION SELECT id FROM production_tasks WHERE block_id=$1
       UNION SELECT id FROM production_approvals WHERE block_id=$1`, [blockId]
    )).rows.map(function(row) { return row.id; });
    const entityIds = [blockId].concat(relatedIds);
    const history = (await query.query(
      `SELECT event_id,occurred_at,user_name,action,entity,entity_id,changes,details
       FROM audit_log WHERE entity_id=ANY($1::text[]) AND entity=ANY($2::text[])
       ORDER BY occurred_at DESC,id DESC LIMIT 30`,
      [entityIds, ['productionBlock','productionGroup','productionTask','productionApproval']]
    )).rows.map(function(row) {
      return {id:row.event_id,occurredAt:row.occurred_at,userName:row.user_name,action:row.action,entity:row.entity,entityId:row.entity_id,changes:row.changes||[],details:row.details||{}};
    });
    const warnings = blockWarnings(current,tasks,approvals,isoDate(new Date()));
    current.warningCount = warnings.length;
    return {block:current, project:projectRow, series:seriesRow, seriesOptions, groups, tasks, approvals, warnings, people, history};
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
      `INSERT INTO production_blocks(id,project_id,series_id,name,description,owner_person_id,owner_name,status,start_date,deadline,sort_order,color)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [id,projectId,input.seriesId||null,input.name,input.description||'',owner.id,owner.name,input.status||'planned',input.startDate||null,input.deadline||null,order,projectResult.rows[0].color]
    );
    return {id};
  }

  async function updateBlock(query, blockId, input) {
    const result = await query.query('SELECT * FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    if (!result.rows.length) throw Object.assign(new Error('Блок не найден'), {status:404});
    const current = result.rows[0];
    const seriesId = input.seriesId === undefined ? current.series_id : input.seriesId;
    if (seriesId) {
      const seriesResult = await query.query('SELECT id FROM series WHERE id=$1 AND project_id=$2 AND deleted IS NOT TRUE', [seriesId,current.project_id]);
      if (!seriesResult.rows.length) throw Object.assign(new Error('Серия не относится к проекту'), {status:400});
    }
    const owner = input.ownerPersonId ? await person(query,input.ownerPersonId) : null;
    const startDate = input.startDate === undefined ? isoDate(current.start_date) : input.startDate;
    const deadline = input.deadline === undefined ? isoDate(current.deadline) : input.deadline;
    if (startDate && deadline && startDate > deadline) throw Object.assign(new Error('Срок блока не может быть раньше даты начала'), {status:400});
    await query.query(
      `UPDATE production_blocks SET name=$2,description=$3,series_id=$4,owner_person_id=$5,owner_name=$6,
       status=$7,start_date=$8,deadline=$9,updated_at=NOW() WHERE id=$1`,
      [blockId,input.name===undefined?current.name:input.name,input.description===undefined?current.description:input.description,
        seriesId,owner?owner.id:current.owner_person_id,owner?owner.name:current.owner_name,
        input.status===undefined?current.status:input.status,startDate,deadline]
    );
    return {id:blockId,projectId:current.project_id};
  }

  async function createGroup(query, blockId, input) {
    const blockResult = await query.query('SELECT project_id FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    if (!blockResult.rows.length) throw Object.assign(new Error('Блок не найден'), {status:400});
    const order = Number((await query.query('SELECT COALESCE(MAX(sort_order),-1)+1 AS next FROM production_task_groups WHERE block_id=$1', [blockId])).rows[0].next || 0);
    const id = crypto.randomUUID();
    await query.query('INSERT INTO production_task_groups(id,block_id,name,sort_order) VALUES($1,$2,$3,$4)', [id,blockId,input.name,order]);
    return {id,projectId:blockResult.rows[0].project_id};
  }

  async function updateGroup(query, groupId, input) {
    const result = await query.query(
      `SELECT g.id,g.block_id,b.project_id FROM production_task_groups g JOIN production_blocks b ON b.id=g.block_id
       WHERE g.id=$1 AND g.deleted IS NOT TRUE AND b.deleted IS NOT TRUE`, [groupId]
    );
    if (!result.rows.length) throw Object.assign(new Error('Группа не найдена'), {status:404});
    await query.query('UPDATE production_task_groups SET name=$2,updated_at=NOW() WHERE id=$1', [groupId,input.name]);
    return {id:groupId,blockId:result.rows[0].block_id,projectId:result.rows[0].project_id};
  }

  async function deleteGroup(query, groupId) {
    const result = await query.query(
      `SELECT g.id,g.block_id,b.project_id FROM production_task_groups g JOIN production_blocks b ON b.id=g.block_id
       WHERE g.id=$1 AND g.deleted IS NOT TRUE AND b.deleted IS NOT TRUE`, [groupId]
    );
    if (!result.rows.length) throw Object.assign(new Error('Группа не найдена'), {status:404});
    const moved = await query.query('UPDATE production_tasks SET group_id=NULL,updated_at=NOW() WHERE group_id=$1 AND deleted IS NOT TRUE RETURNING id', [groupId]);
    await query.query('UPDATE production_task_groups SET deleted=true,updated_at=NOW() WHERE id=$1', [groupId]);
    return {id:groupId,blockId:result.rows[0].block_id,projectId:result.rows[0].project_id,movedTasks:moved.rows.length};
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
      `INSERT INTO production_tasks(id,block_id,group_id,title,internal_comment,assignee_person_id,assignee_name,responsible_person_id,responsible_name,deadline,sort_order)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id,blockId,input.groupId||null,input.title,input.internalComment||'',assignee.id,assignee.name,responsible&&responsible.id,responsible&&responsible.name||'',input.deadline||null,order]
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
    const internalComment = input.internalComment === undefined ? current.internal_comment : input.internalComment;
    const groupId = input.groupId === undefined ? current.group_id : input.groupId;
    const assigneeId = assignee ? assignee.id : current.assignee_person_id;
    const assigneeName = assignee ? assignee.name : current.assignee_name;
    const responsibleId = input.responsiblePersonId === undefined ? current.responsible_person_id : (responsible ? responsible.id : null);
    const responsibleName = input.responsiblePersonId === undefined ? current.responsible_name : (responsible ? responsible.name : '');
    const deadline = input.deadline === undefined ? isoDate(current.deadline) : input.deadline;
    const status = input.completed === undefined ? current.status : (input.completed ? 'done' : 'todo');
    await query.query(
      `UPDATE production_tasks SET title=$2,internal_comment=$3,group_id=$4,assignee_person_id=$5,assignee_name=$6,
       responsible_person_id=$7,responsible_name=$8,deadline=$9,status=$10,
       completed_at=CASE WHEN $10='done' THEN COALESCE(completed_at,NOW()) ELSE NULL END,updated_at=NOW() WHERE id=$1`,
      [taskId,title,internalComment,groupId,assigneeId,assigneeName,responsibleId,responsibleName,deadline,status]
    );
    return {id:taskId,blockId:current.block_id,projectId:current.project_id};
  }

  async function createApproval(query, blockId, input, actor) {
    const blockResult = await query.query('SELECT id,project_id FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    if (!blockResult.rows.length) throw Object.assign(new Error('Блок не найден'), {status:404});
    if (input.taskId) {
      const taskResult = await query.query(
        'SELECT id FROM production_tasks WHERE id=$1 AND block_id=$2 AND deleted IS NOT TRUE', [input.taskId,blockId]
      );
      if (!taskResult.rows.length) throw Object.assign(new Error('Задача не относится к блоку'), {status:400});
    }
    const id = crypto.randomUUID();
    await query.query(
      `INSERT INTO production_approvals
        (id,project_id,block_id,task_id,title,required,due_date,requested_by_user_id,requested_by_name)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id,blockResult.rows[0].project_id,blockId,input.taskId||null,input.title,input.required!==false,input.dueDate||null,
        actor.userId||null,String(actor.userName||'Система')]
    );
    return {id,projectId:blockResult.rows[0].project_id};
  }

  async function decideApproval(query, approvalId, input, actor) {
    const result = await query.query(
      `SELECT a.id,a.project_id,a.block_id FROM production_approvals a
       JOIN production_blocks b ON b.id=a.block_id AND b.deleted IS NOT TRUE
       WHERE a.id=$1 AND a.deleted IS NOT TRUE`, [approvalId]
    );
    if (!result.rows.length) throw Object.assign(new Error('Согласование не найдено'), {status:404});
    if (input.decision === null) {
      await query.query(
        `UPDATE production_approvals SET status='pending',decision=NULL,decided_by_user_id=NULL,decided_by_name='',
         decided_at=NULL,decision_comment='',updated_at=NOW() WHERE id=$1`, [approvalId]
      );
    } else {
      await query.query(
        `UPDATE production_approvals SET status='decided',decision=$2,decided_by_user_id=$3,decided_by_name=$4,
         decided_at=NOW(),decision_comment=$5,updated_at=NOW() WHERE id=$1`,
        [approvalId,input.decision,actor.userId||null,String(actor.userName||'Система'),input.comment||'']
      );
    }
    return {id:approvalId,blockId:result.rows[0].block_id,projectId:result.rows[0].project_id};
  }

  async function team(query, allowedProjectIds, subject) {
    const today = isoDate(new Date());
    const sevenDays = addDays(today, 6);
    const fourteenDays = addDays(today, 13);
    const allowed = allowedProjectIds === null ? null : new Set((allowedProjectIds || []).map(String));
    const projectRows = (await query.query(
      'SELECT id,name,color,status FROM projects WHERE deleted IS NOT TRUE ORDER BY name'
    )).rows.filter(function(row) { return !allowed || allowed.has(String(row.id)); });
    const projectIds = projectRows.map(function(row) { return row.id; });
    const projects = new Map(projectRows.map(function(row) { return [String(row.id),row]; }));
    const peopleRows = (await query.query(
      `SELECT id,name,email,login,roles,producer_headline,producer_achievements
       FROM people WHERE deleted IS NOT TRUE AND active=true ORDER BY name`
    )).rows;
    let taskRows = [];
    let blockRows = [];
    let shiftRows = [];
    if (projectIds.length) {
      taskRows = (await query.query(
        `SELECT t.id,t.title,t.internal_comment,t.assignee_person_id,t.assignee_name,t.deadline,t.status,
          b.id AS block_id,b.name AS block_name,b.project_id,p.name AS project_name,p.color AS project_color
         FROM production_tasks t
         JOIN production_blocks b ON b.id=t.block_id AND b.deleted IS NOT TRUE
         JOIN projects p ON p.id=b.project_id AND p.deleted IS NOT TRUE
         WHERE t.deleted IS NOT TRUE AND b.project_id=ANY($1::text[])
         ORDER BY t.deadline NULLS LAST,t.sort_order,t.title`, [projectIds]
      )).rows;
      blockRows = (await query.query(
        `SELECT b.id,b.name,b.project_id,b.owner_person_id,b.owner_name,b.status,b.deadline,p.name AS project_name,p.color AS project_color
         FROM production_blocks b JOIN projects p ON p.id=b.project_id AND p.deleted IS NOT TRUE
         WHERE b.deleted IS NOT TRUE AND b.project_id=ANY($1::text[]) AND b.status<>'done'
         ORDER BY b.deadline NULLS LAST,b.sort_order`, [projectIds]
      )).rows;
      shiftRows = (await query.query(
        `SELECT t.id,t.project_id,t.series,t.person,t.status,t.day,t."from",t."to",t.note,p.name AS project_name,p.color AS project_color
         FROM tasks t JOIN projects p ON p.id=t.project_id AND p.deleted IS NOT TRUE
         WHERE t.deleted IS NOT TRUE AND COALESCE(t.cancelled,false)=false AND t.project_id=ANY($1::text[])
         ORDER BY t.day,t."from"`, [projectIds]
      )).rows;
    }
    const rows = peopleRows.map(function(personRow) {
      const openTasks = taskRows.filter(function(task) {
        return String(task.assignee_person_id || '') === String(personRow.id) && task.status !== 'done';
      });
      const completedTasks = taskRows.filter(function(task) {
        return String(task.assignee_person_id || '') === String(personRow.id) && task.status === 'done';
      }).length;
      const ownedBlocks = blockRows.filter(function(block) { return String(block.owner_person_id || '') === String(personRow.id); });
      const shifts = shiftRows.map(function(shift) {
        return Object.assign({},shift,{isoDay:legacyIsoDate(shift.day)});
      }).filter(function(shift) {
        return shift.person === personRow.name && shift.isoDay && shift.isoDay >= today && shift.isoDay <= fourteenDays;
      });
      const shiftsWeek = shifts.filter(function(shift) { return shift.isoDay <= sevenDays; });
      const shiftHours7 = Math.round(shiftsWeek.reduce(function(sum,shift) {
        return sum + Math.max(0,Number(shift.to || 0) - Number(shift.from || 0));
      },0) * 10) / 10;
      const overdue = openTasks.filter(function(task) { return isoDate(task.deadline) && isoDate(task.deadline) < today; }).length;
      const dueSoon = openTasks.filter(function(task) {
        const due = isoDate(task.deadline);
        return due && due >= today && due <= sevenDays;
      }).length;
      const taskPart = Math.min(55,openTasks.length * 8 + dueSoon * 3 + overdue * 5);
      const shiftPart = Math.min(35,Math.round(shiftHours7 * 35 / 40));
      const blockPart = Math.min(10,ownedBlocks.length * 4);
      const workloadPercent = Math.min(100,taskPart + shiftPart + blockPart);
      const workloadLevel = workloadPercent >= 80 ? 'overloaded' : workloadPercent >= 55 ? 'busy' : workloadPercent >= 25 ? 'balanced' : 'free';
      const taskItems = openTasks.map(function(task) {
        return {
          id:task.id,kind:'task',title:task.title,comment:task.internal_comment || '',deadline:isoDate(task.deadline),
          blockId:task.block_id,blockName:task.block_name,projectId:task.project_id,projectName:task.project_name,
          projectColor:task.project_color,overdue:Boolean(isoDate(task.deadline) && isoDate(task.deadline) < today),
        };
      });
      const shiftItems = shifts.map(function(shift) {
        return {
          id:String(shift.id),kind:'shift',title:shift.status || 'Смена',comment:shift.note || '',deadline:shift.isoDay,
          time:String(shift.from || '') + ':00–' + String(shift.to || '') + ':00',series:shift.series || '',
          projectId:shift.project_id,projectName:shift.project_name,projectColor:shift.project_color,
        };
      });
      const currentItems = taskItems.concat(shiftItems).sort(function(left,right) {
        if (left.overdue !== right.overdue) return left.overdue ? -1 : 1;
        return String(left.deadline || '9999-12-31').localeCompare(String(right.deadline || '9999-12-31'));
      });
      const personProjectIds = new Set();
      currentItems.forEach(function(item) { if (item.projectId) personProjectIds.add(String(item.projectId)); });
      ownedBlocks.forEach(function(block) { personProjectIds.add(String(block.project_id)); });
      return {
        id:personRow.id,name:personRow.name,roles:personRow.roles || [],headline:personRow.producer_headline || '',
        achievements:profileAchievements(personRow.producer_achievements),workloadPercent,workloadLevel,
        openTasks:openTasks.length,completedTasks,overdueTasks:overdue,dueSoonTasks:dueSoon,
        shiftHours7,ownedBlocks:ownedBlocks.length,projectCount:personProjectIds.size,
        projects:Array.from(personProjectIds).map(function(id) { const project = projects.get(id); return project && {id:project.id,name:project.name,color:project.color}; }).filter(Boolean),
        currentItems:currentItems.slice(0, 16),
      };
    });
    rows.sort(function(left,right) { return right.workloadPercent-left.workloadPercent || left.name.localeCompare(right.name,'ru'); });
    return {
      people:rows,today,horizon:sevenDays,
      methodNote:'Индекс загрузки: до 55% дают активные задачи и близкие сроки, до 35% — запланированные смены на 7 дней, до 10% — ответственность за активные блоки.',
    };
  }

  async function canEditPersonProfile(query, personId, subject) {
    const role = String((subject && subject.role) || '');
    if (role === 'admin' || role === 'lead') return true;
    const found = await query.query('SELECT name,login,email FROM people WHERE id=$1 AND deleted IS NOT TRUE', [personId]);
    if (!found.rows.length) return false;
    const row = found.rows[0];
    const identities = [subject && subject.samName,subject && subject.sam_name,subject && subject.displayName,
      subject && subject.display_name,subject && subject.email].filter(Boolean).map(function(value) { return String(value).toLowerCase(); });
    return [row.login,row.name,row.email].filter(Boolean).some(function(value) { return identities.includes(String(value).toLowerCase()); });
  }

  async function personProfile(query, personId, allowedProjectIds, subject) {
    const result = await team(query,allowedProjectIds,subject);
    const selected = result.people.find(function(item) { return String(item.id) === String(personId); });
    if (!selected) return null;
    return Object.assign({},selected,{canEditProfile:await canEditPersonProfile(query,personId,subject),methodNote:result.methodNote});
  }

  async function updatePersonProfile(query, personId, input) {
    const result = await query.query(
      `UPDATE people SET producer_headline=$2,producer_achievements=$3::jsonb,updated_at=NOW()
       WHERE id=$1 AND deleted IS NOT TRUE RETURNING id`,
      [personId,input.headline || '',JSON.stringify(input.achievements || [])]
    );
    if (!result.rows.length) throw Object.assign(new Error('Сотрудник не найден'),{status:404});
    return {id:personId};
  }

  async function analytics(query, allowedProjectIds) {
    const today = isoDate(new Date());
    const allowed = allowedProjectIds === null ? null : new Set((allowedProjectIds || []).map(String));
    const projectRows = (await query.query(
      'SELECT id,name,description,color,status FROM projects WHERE deleted IS NOT TRUE ORDER BY name'
    )).rows.filter(function(row) { return !allowed || allowed.has(String(row.id)); });
    const projectIds = projectRows.map(function(row) { return row.id; });
    if (!projectIds.length) return {summary:{projectCount:0,averageElapsedDays:0,averageForecastDays:0,averageProgress:0},projects:[],methodNote:''};
    const blocks = (await query.query(
      `SELECT id,project_id,status,start_date,deadline,created_at,owner_person_id
       FROM production_blocks WHERE deleted IS NOT TRUE AND project_id=ANY($1::text[])`, [projectIds]
    )).rows;
    const tasks = (await query.query(
      `SELECT t.id,t.status,t.assignee_person_id,t.completed_at,t.created_at,b.project_id
       FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id AND b.deleted IS NOT TRUE
       WHERE t.deleted IS NOT TRUE AND b.project_id=ANY($1::text[])`, [projectIds]
    )).rows;
    const rows = projectRows.map(function(projectRow) {
      const projectBlocks = blocks.filter(function(block) { return String(block.project_id) === String(projectRow.id); });
      const projectTasks = tasks.filter(function(task) { return String(task.project_id) === String(projectRow.id); });
      const dates = projectBlocks.map(function(block) { return isoDate(block.start_date) || isoDate(block.created_at); }).filter(Boolean).sort();
      const deadlines = projectBlocks.map(function(block) { return isoDate(block.deadline); }).filter(Boolean).sort();
      const startDate = dates[0] || null;
      const deadline = deadlines.length ? deadlines[deadlines.length-1] : null;
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(function(task) { return task.status === 'done'; }).length;
      const progress = totalTasks ? Math.round(completedTasks * 100 / totalTasks) : 0;
      const elapsedDays = startDate && startDate <= today ? daysBetween(startDate,today) + 1 : 0;
      const plannedDays = startDate && deadline ? daysBetween(startDate,deadline) + 1 : 0;
      const forecastFromTempo = progress >= 10 && elapsedDays > 0;
      const forecastTotalDays = progress >= 100 ? elapsedDays : forecastFromTempo ? Math.max(elapsedDays,Math.ceil(elapsedDays * 100 / progress)) : plannedDays;
      const remainingDays = forecastTotalDays ? Math.max(0,forecastTotalDays-elapsedDays) : 0;
      const forecastFinish = forecastTotalDays ? addDays(today,Math.max(0,remainingDays-1)) : null;
      const people = new Set();
      projectTasks.forEach(function(task) { if (task.assignee_person_id) people.add(String(task.assignee_person_id)); });
      projectBlocks.forEach(function(block) { if (block.owner_person_id) people.add(String(block.owner_person_id)); });
      return {
        id:projectRow.id,name:projectRow.name,description:projectRow.description || '',color:projectRow.color,status:projectRow.status,
        startDate,deadline,totalTasks,completedTasks,progress,elapsedDays,plannedDays,forecastTotalDays,remainingDays,forecastFinish,
        forecastSource:forecastFromTempo?'tempo':'plan',activePeople:people.size,
        blockCount:projectBlocks.length,risk:Boolean(deadline && forecastFinish && forecastFinish > deadline),
      };
    }).filter(function(row) { return row.blockCount > 0 || row.totalTasks > 0; });
    const count = rows.length || 1;
    const average = function(field) { return Math.round(rows.reduce(function(sum,row) { return sum + Number(row[field] || 0); },0) / count); };
    rows.sort(function(left,right) { return Number(right.risk)-Number(left.risk) || right.progress-left.progress; });
    return {
      summary:{projectCount:rows.length,averageElapsedDays:average('elapsedDays'),averageForecastDays:average('forecastTotalDays'),averageProgress:average('progress'),riskCount:rows.filter(function(row) { return row.risk; }).length},
      projects:rows,
      methodNote:'Факт — календарные дни от начала первого производственного блока. Прогноз — текущий темп выполнения задач; пока готово меньше 10%, используется плановая длительность по срокам блоков.',
    };
  }

  async function blockProjectId(query, blockId) {
    const found = await query.query('SELECT project_id FROM production_blocks WHERE id=$1 AND deleted IS NOT TRUE', [blockId]);
    return found.rows[0] && found.rows[0].project_id;
  }

  async function taskProjectId(query, taskId) {
    const found = await query.query('SELECT b.project_id FROM production_tasks t JOIN production_blocks b ON b.id=t.block_id WHERE t.id=$1 AND t.deleted IS NOT TRUE', [taskId]);
    return found.rows[0] && found.rows[0].project_id;
  }

  async function groupProjectId(query, groupId) {
    const found = await query.query('SELECT b.project_id FROM production_task_groups g JOIN production_blocks b ON b.id=g.block_id WHERE g.id=$1 AND g.deleted IS NOT TRUE', [groupId]);
    return found.rows[0] && found.rows[0].project_id;
  }

  async function approvalProjectId(query, approvalId) {
    const found = await query.query(
      `SELECT a.project_id FROM production_approvals a JOIN production_blocks b ON b.id=a.block_id
       WHERE a.id=$1 AND a.deleted IS NOT TRUE AND b.deleted IS NOT TRUE`, [approvalId]
    );
    return found.rows[0] && found.rows[0].project_id;
  }

  return {dashboard,project,block,createProject,createBlock,updateBlock,createGroup,updateGroup,deleteGroup,createTask,updateTask,
    createApproval,decideApproval,team,personProfile,updatePersonProfile,canEditPersonProfile,analytics,
    blockProjectId,groupProjectId,taskProjectId,approvalProjectId};
}

module.exports = createProducerModel;
