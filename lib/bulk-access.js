// Apply the same project permissions to bulk saves as to individual writes.
module.exports = async function protectBulk(tx, data, req, policy) {
  const role = req.session.role;
  if (role === 'admin') return;
  delete data.achievements;
  if (role === 'lead') {
    if (data.people) {
      const existing = await tx.query('SELECT id,birthday FROM people');
      const birthdays = new Map(existing.rows.map(p => [p.id, p.birthday || '']));
      data.people.forEach(p => { p.birthday = birthdays.get(p.id) || ''; });
    }
    return;
  }
  for (const key of ['people','roles','stages','stageGroups','holidays','templates','personAbsences']) delete data[key];
  const ids = new Set(await policy.projectScope(req.session, true, tx));
  const projects = await tx.query('SELECT id,status,deleted FROM projects');
  const existingProjects = new Map(projects.rows.map(p => [p.id,p]));
  const managers = await tx.query('SELECT project_id,user_uid,user_name FROM project_managers');
  if (data.projects) {
    data.projects = data.projects.filter(p => {
      const old = existingProjects.get(p.id);
      if (!old) {
        if (role !== 'manager') return false;
        p.status = 'в работе';
        p.managers = [{uid:req.session.samName||String(req.session.userId),name:req.session.displayName||req.session.samName}];
        p.deleted = false;
        ids.add(p.id);
        return true;
      }
      if (old.deleted || !ids.has(p.id)) return false;
      p.status = old.status;
      p.deleted = false;
      p.managers = managers.rows.filter(m => m.project_id===p.id).map(m => ({uid:m.user_uid,name:m.user_name}));
      return true;
    });
  }
  if (data.series) {
    const rows = await tx.query('SELECT id,project_id,deleted FROM series');
    const existing = new Map(rows.rows.map(s => [s.id,s]));
    data.series = data.series.filter(s => {
      const old = existing.get(s.id);
      if (!ids.has(s.projectId) || (old && (!ids.has(old.project_id) || old.deleted))) return false;
      s.deleted = false;
      return true;
    });
  }
  if (data.tasks) {
    const rows = await tx.query('SELECT id::text AS id,project_id,note FROM tasks');
    const existing = new Map(rows.rows.map(t => [t.id,t.project_id]));
    data.tasks = data.tasks.filter(t => ids.has(t.project) && (!existing.has(String(t.id)) || ids.has(existing.get(String(t.id)))));
    if(role==='editor'){
      const notes=new Map(rows.rows.map(t=>[t.id,t.note]));
      data.tasks.forEach(t=>{t.note=notes.get(String(t.id))||'';});
    }
  }
};
