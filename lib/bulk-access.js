// Apply the same project permissions to bulk saves as to individual writes.
module.exports = async function protectBulk(tx, data, req) {
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
  let editable;
  if (role === 'editor') {
    editable = await tx.query('SELECT project_id FROM user_projects WHERE user_id=$1 AND can_edit=true', [req.session.userId]);
  } else {
    const user = await tx.query('SELECT id,sam_name,display_name,email FROM users WHERE id=$1', [req.session.userId]);
    const u = user.rows[0] || {};
    const keys = [u.id,u.sam_name,u.display_name,u.email].filter(Boolean).map(v => String(v).trim().toLowerCase());
    const people = await tx.query("SELECT id,name,login,email FROM people WHERE ($1<>'' AND lower(login)=lower($1)) OR ($2<>'' AND lower(name)=lower($2)) OR ($3<>'' AND lower(email)=lower($3))", [u.sam_name||'',u.display_name||'',u.email||'']);
    people.rows.forEach(p => keys.push(...[p.id,p.name,p.login,p.email].filter(Boolean).map(v => String(v).trim().toLowerCase())));
    editable = await tx.query('SELECT project_id FROM project_managers WHERE lower(user_uid)=ANY($1::text[]) OR lower(user_name)=ANY($1::text[])', [keys]);
  }
  const ids = new Set(editable.rows.map(r => r.project_id));
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
