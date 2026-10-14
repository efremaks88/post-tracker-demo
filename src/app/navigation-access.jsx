function parseHash(){
  try {
  const mp=window.location.hash.match(/^#project\/(.+)$/);
  if(mp) return {type:"project",id:decodeURIComponent(mp[1])};
  const ms=window.location.hash.match(/^#series\/(.+)$/);
  if(ms) return {type:"series",id:decodeURIComponent(ms[1])};
  const m=window.location.hash.match(/^#person\/(.+)$/);
  if(m) return {type:"person",id:decodeURIComponent(m[1])};
  return null;
  } catch(error) { return null; }
}
function canSeeTaskNotes(){
  return window.PPT_CAN_SEE_TASK_NOTES === true;
}

function accessKey(value){
  return String(value||"").trim().toLowerCase();
}
function sameAccessKey(a,b){
  const ak=accessKey(a),bk=accessKey(b);
  return !!ak&&!!bk&&ak===bk;
}
function findCurrentPerson(user,data){
  return (data?.people||[]).find(p=>
    sameAccessKey(p.login,user?.sam_name)||
    sameAccessKey(p.name,user?.display_name)||
    sameAccessKey(p.email,user?.email)
  );
}
function currentUserProjectKeys(user,data){
  const keys=new Set([user?.id,user?.userId,user?.sam_name,user?.display_name,user?.email].map(accessKey).filter(Boolean));
  const person=findCurrentPerson(user,data);
  if(person){[person.id,person.name,person.login,person.email].forEach(v=>{const k=accessKey(v);if(k)keys.add(k);});}
  return keys;
}
function projectAssignedToKeys(project,keys){
  if(!project||!keys) return false;
  return (project.managers||[]).some(m=>keys.has(accessKey(m?.uid||m))||keys.has(accessKey(m?.name||m)));
}
function currentUserManagerEntry(user,data){
  const person=findCurrentPerson(user,data);
  return {uid:person?.id||user?.sam_name||user?.userId||user?.id||user?.display_name||"",name:person?.name||user?.display_name||user?.sam_name||user?.userId||user?.id||""};
}

// ── ОБЩИЕ КОМПОНЕНТЫ ─────────────────────────────────────────────────
