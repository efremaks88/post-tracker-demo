function ChangelogModal({entries,onClose}){
  function fmtTs(ts){
    const d=new Date(ts);
    const pad=n=>String(n).padStart(2,"0");
    return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return (
    <Modal title="История изменений" onClose={onClose}>
      {!entries.length?(
        <div style={{padding:"24px 0",textAlign:"center",color:"#475569",fontSize:13}}>
          Изменений пока нет
        </div>
      ):(
        <div style={{maxHeight:480,overflowY:"auto",display:"flex",flexDirection:"column",gap:1}}>
          {entries.map((e,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"7px 4px",
              borderBottom:"1px solid #1e293b",alignItems:"flex-start"}}>
              <span style={{fontSize:11,color:"#475569",whiteSpace:"nowrap",flexShrink:0,marginTop:1}}>
                {fmtTs(e.ts)}
              </span>
              <span style={{fontSize:13,color:"#cbd5e1"}}>{e.text}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
        <Btn variant="ghost" onClick={onClose}>Закрыть</Btn>
      </div>
    </Modal>
  );
}

// ── СМЕНЫ НА ДЕНЬ ────────────────────────────────────────────────────
function DayShiftsModal({data,onClose}){
  const {stageMap}=useContext(StagesCtx);
  const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const [targetDay,setTargetDay]=useState(formatDate(tomorrow));
  const [copied,setCopied]=useState(false);

  const shifts=useMemo(()=>{
    const tasks=data.tasks.filter(t=>t.day===targetDay&&t.person)
      .sort((a,b)=>a.from-b.from);
    const byPerson={};
    tasks.forEach(t=>{
      if(!byPerson[t.person]) byPerson[t.person]=[];
      byPerson[t.person].push(t);
    });
    return Object.entries(byPerson).sort(([a],[b])=>a.localeCompare(b))
      .map(([person,tasks])=>({person,tasks}));
  },[data.tasks,targetDay]);

  const pd=parseDate(targetDay);
  const dateLabel=pd?`${WDAYS_LONG[pd.getDay()]}, ${targetDay}`:"—";

  function buildText(){
    let s=` Смены — ${dateLabel}\n${"─".repeat(32)}\n\n`;
    if(!shifts.length){s+="Смен нет\n";return s;}
    shifts.forEach(({person,tasks})=>{
      const totalH=tasks.reduce((acc,t)=>(Number(t.to)||0)-(Number(t.from)||0)+acc,0);
      s+=`👤 ${person}  (${totalH}ч)\n`;
      tasks.forEach(t=>{
        const proj=data.projects.find(p=>p.id===t.project);
        const st=stageMap[t.status];
        s+=`   • ${proj?.name||t.project}  ${t.series}  ·  ${st?.label||t.status}  ·  ${fmtHour(t.from)}–${fmtHour(t.to)}`;
        if(canSeeTaskNotes()&&t.note) s+=`  — ${t.note}`;
        s+="\n";
      });
      s+="\n";
    });
    return s;
  }

  function copyText(){
    navigator.clipboard.writeText(buildText()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  }

  return (
    <Modal title="Смены на день" onClose={onClose} wide>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
        <InpDate value={targetDay} onChange={setTargetDay}/>
        <span style={{fontSize:13,color:"#64748b"}}>{pd?WDAYS_LONG[pd.getDay()]:""}</span>
        <div style={{flex:1}}/>
        <Btn variant="ghost" small onClick={copyText}>{copied?"OK Скопировано":" Копировать текст"}</Btn>
        <Btn variant="ghost" small onClick={()=>window.print()}>🖨 Печать</Btn>
      </div>

      {shifts.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:"#475569",fontSize:14}}>
          На этот день смен нет
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {shifts.map(({person,tasks})=>{
            const totalH=tasks.reduce((acc,t)=>(Number(t.to)||0)-(Number(t.from)||0)+acc,0);
            const pInfo=data.people.find(p=>p.name===person);
            const roleId=pInfo?.roles?.[0];
            const role=roleId?data.roles.find(r=>r.id===roleId):null;
            return (
              <div key={person} style={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"10px 16px",background:"#1e293b",display:"flex",alignItems:"center",gap:10,
                  borderBottom:"1px solid #334155"}}>
                  <div style={{width:34,height:34,borderRadius:"50%",
                    background:`${role?.color||"#3b82f6"}22`,border:`2px solid ${role?.color||"#3b82f6"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:14,fontWeight:800,color:role?.color||"#3b82f6"}}>
                    {person[0]}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{person}</div>
                    {role&&<div style={{fontSize:11,color:role.color}}>{role.label}</div>}
                  </div>
                  <div style={{marginLeft:"auto",fontSize:12,color:"#64748b"}}>
                    {totalH} ч · {tasks.length} {tasks.length===1?"задача":tasks.length<=4?"задачи":"задач"}
                  </div>
                </div>
                {tasks.map((t,ti)=>{
                  const proj=data.projects.find(p=>p.id===t.project);
                  const st=stageMap[t.status];
                  return (
                    <div key={t.id} style={{padding:"10px 16px",
                      borderBottom:ti<tasks.length-1?"1px solid #1e293b":"none",
                      display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:3,alignSelf:"stretch",borderRadius:2,
                        background:proj?.color||"#334155",flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                          <span style={{fontWeight:600,fontSize:13}}>{proj?.name||t.project}</span>
                          <span style={{fontSize:11,color:"#475569"}}>· {t.series}</span>
                          {st&&<span style={{fontSize:10,background:`${st.color}22`,color:st.color,
                            border:`1px solid ${st.color}44`,borderRadius:4,padding:"1px 7px",fontWeight:600}}>
                            {st.abbr||st.label}
                          </span>}
                        </div>
                        {canSeeTaskNotes()&&t.note&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{t.note}</div>}
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",flexShrink:0}}>
                        {fmtHour(t.from)}–{fmtHour(t.to)}
                        <span style={{fontSize:10,color:"#475569",marginLeft:4}}>
                          ({fmtDur(t.from,t.to)})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

// ── ПЕРСОНА ──────────────────────────────────────────────────────────
