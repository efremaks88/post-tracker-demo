function computeStageTimings(tasks,series,stages,stageGroups){
  return stageGroups.map(g=>{
    const stageIds=(stages||[]).filter(s=>s.groupId===g.id).map(s=>s.id);
    if(!stageIds.length) return null;
    const durations=[];
    (series||[]).forEach(ser=>{
      const t=tasks.filter(x=>x.seriesId===ser.id&&stageIds.includes(x.status));
      if(!t.length) return;
      const days=[...new Set(t.map(x=>x.day))].sort((a,b)=>daySort(a).localeCompare(daySort(b)));
      const first=parseDate(days[0]), last=parseDate(days[days.length-1]);
      if(!first||!last) return;
      const span=Math.round((last-first)/(1000*60*60*24))+1;
      durations.push({seriesId:ser.id,projectId:ser.projectId,days:span});
    });
    if(!durations.length) return null;
    const vals=durations.map(d=>d.days);
    const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
    const min=Math.min(...vals), max=Math.max(...vals);
    const sigma=Math.sqrt(vals.reduce((s,v)=>s+Math.pow(v-avg,2),0)/vals.length);
    const longest=durations.find(d=>d.days===max);
    return {group:g,avg,sigma,min,max,longest,count:durations.length};
  }).filter(Boolean);
}

function computeShifts(tasks, people){
  // Суммируем часы по person+day, потом применяем правило 6ч
  const byPersonDay={};
  tasks.filter(t=>!t.deleted&&!t.cancelled).forEach(t=>{
    if(!t.person) return;
    const key=t.person+"|"+t.day;
    byPersonDay[key]=(byPersonDay[key]||0)+(Number(t.to)||0)-(Number(t.from)||0);
  });
  // Теперь по каждому person считаем выходы и смены
  const byPerson={};
  Object.entries(byPersonDay).forEach(([key,hours])=>{
    const [person]=key.split("|");
    if(!byPerson[person]) byPerson[person]={person,exits:0,shifts:0};
    byPerson[person].exits+=1;
    byPerson[person].shifts+=shiftFactFromHours(hours);
  });
  return Object.values(byPerson).map(r=>{
    const p=people.find(p=>p.name===r.person);
    const role=(p&&p.roles&&p.roles[0])||"";
    return {...r,role};
  }).sort((a,b)=>a.role.localeCompare(b.role)||a.person.localeCompare(b.person));
}

function AnalyticsView({data,onPersonSelect}){
  const {sorted:stages,stageGroups,stageMap}=useContext(StagesCtx);
  const [atab,setAtab]=useState("shifts");
  const [filterProject,setFilterProject]=useState("");
  const [filterSeries,setFilterSeries]=useState("");
  const [filterPerson,setFilterPerson]=useState("");
  const [peopleSearch,setPeopleSearch]=useState("");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");

  const filteredTasks=useMemo(()=>{
    const noImpactIds=new Set(stages.filter(s=>s.noImpact).map(s=>s.id));
    let t=data.tasks.filter(x=>!x.deleted&&!x.cancelled&&!noImpactIds.has(x.status));
    if(filterProject) t=t.filter(x=>x.project===filterProject);
    if(filterSeries)  t=t.filter(x=>x.series===filterSeries);
    if(filterPerson)  t=t.filter(x=>x.person===filterPerson);
    if(dateFrom)      t=t.filter(x=>daySort(x.day)>=daySort(dateFrom));
    if(dateTo)        t=t.filter(x=>daySort(x.day)<=daySort(dateTo));
    return t;
  },[data.tasks,filterProject,filterSeries,filterPerson,dateFrom,dateTo,stages]);

  const seriesOptions=useMemo(()=>{
    const base=(data.series||[]);
    return filterProject?base.filter(s=>s.projectId===filterProject):base;
  },[data.series,filterProject]);

  const rows=useMemo(()=>computeShifts(filteredTasks,data.people),[filteredTasks,data.people]);

  const roleMap=useMemo(()=>{
    const m={};
    data.roles.forEach(r=>{m[r.id]={label:r.label,color:r.color};});
    return m;
  },[data.roles]);

  const roleTotals=useMemo(()=>{
    const m={};
    rows.forEach(r=>{
      if(!m[r.role]) m[r.role]={exits:0,shifts:0};
      m[r.role].exits+=r.exits;
      m[r.role].shifts+=r.shifts;
    });
    return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0]));
  },[rows]);

  const totalShifts=rows.reduce((s,r)=>s+r.shifts,0);
  const totalExits=rows.reduce((s,r)=>s+r.exits,0);

  const allPeople=useMemo(()=>[...new Set(data.tasks.filter(t=>t.person).map(t=>t.person))].sort(),[data.tasks]);

  const filteredSeries=useMemo(()=>{
    let s=data.series||[];
    if(filterProject) s=s.filter(x=>x.projectId===filterProject);
    return s;
  },[data.series,filterProject]);

  const stageTimings=useMemo(()=>computeStageTimings(filteredTasks,filteredSeries,stages,stageGroups),
    [filteredTasks,filteredSeries,stages,stageGroups]);

  const TH={padding:"8px 12px",textAlign:"left",fontSize:11,color:"#64748b",
    letterSpacing:1,borderBottom:"1px solid #334155",fontWeight:600,textTransform:"uppercase"};
  const TD={padding:"8px 12px",fontSize:13,borderBottom:"1px solid #1e293b"};

  const activePeople=useMemo(()=>{
    const noImpactIds=new Set(stages.filter(s=>s.noImpact).map(s=>s.id));
    return (data.people||[]).filter(p=>p.active!==false)
      .map(p=>{
        const pTasks=data.tasks.filter(t=>t.person===p.name&&!t.cancelled&&!noImpactIds.has(t.status));
        const hours=pTasks.reduce((s,t)=>(Number(t.to)||0)-(Number(t.from)||0)+s,0);
        const lastTask=pTasks.length?pTasks.reduce((a,b)=>daySort(a.day)>daySort(b.day)?a:b):null;
        return {...p,taskCount:pTasks.length,hours,lastDay:lastTask?.day||""};
      })
      .sort((a,b)=>a.name.localeCompare(b.name));
  },[data.people,data.tasks,stages]);

  useEffect(()=>{
    function reset(){
      if(peopleSearch){setPeopleSearch("");return;}
      if(filterPerson){setFilterPerson("");return;}
      if(filterProject||filterSeries||dateFrom||dateTo){setFilterProject("");setFilterSeries("");setDateFrom("");setDateTo("");}
    }
    window.addEventListener("ppt-escape",reset);
    return()=>window.removeEventListener("ppt-escape",reset);
  },[peopleSearch,filterPerson,filterProject,filterSeries,dateFrom,dateTo]);

  const visiblePeople=useMemo(()=>{
    const q=peopleSearch.trim().toLowerCase();
    if(!q) return activePeople;
    return activePeople.filter(p=>{
      const roleLabels=(p.roles||[]).map(rid=>(data.roles||[]).find(r=>r.id===rid)?.label||rid);
      const hay=[p.name,p.login,p.email,p.birthday,...(p.roles||[]),...roleLabels].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  },[activePeople,data.roles,peopleSearch]);

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{display:"flex",gap:2,marginBottom:20,background:"#0f172a",borderRadius:12,
        border:"1px solid #334155",overflow:"hidden",width:"fit-content"}}>
        {[{id:"shifts",label:"Аналитика смен"},{id:"people",label:`Люди (${activePeople.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setAtab(t.id)}
            style={{padding:"6px 16px",border:"none",cursor:"pointer",fontSize:12,fontFamily:"inherit",
              background:atab===t.id?"#3b82f6":"transparent",
              color:atab===t.id?"#fff":"#64748b",fontWeight:atab===t.id?700:400}}>
            {t.label}
          </button>
        ))}
      </div>

      {atab==="people"&&(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,maxWidth:360}}>
            <Inp value={peopleSearch} onChange={setPeopleSearch} placeholder="\u041f\u043e\u0438\u0441\u043a: \u0438\u043c\u044f, \u043b\u043e\u0433\u0438\u043d, \u0440\u043e\u043b\u044c"/>
            {peopleSearch&&<Btn small variant="ghost" onClick={()=>setPeopleSearch("")}>x</Btn>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
            {visiblePeople.map(p=>{
              const roleObjs=(p.roles||[]).map(rid=>(data.roles||[]).find(r=>r.id===rid)).filter(Boolean);
              const mainRole=roleObjs[0];
              return (
                <button key={p.id} onClick={()=>onPersonSelect&&onPersonSelect(p.id)}
                  style={{background:"#1e293b",border:`1px solid ${mainRole?.color||"#334155"}44`,
                    borderRadius:14,padding:"14px 16px",cursor:"pointer",textAlign:"left",
                    fontFamily:"inherit",display:"flex",flexDirection:"column",gap:6,
                    transition:"border-color 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                      background:`${mainRole?.color||"#3b82f6"}22`,
                      border:`2px solid ${mainRole?.color||"#3b82f6"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:15,fontWeight:800,color:mainRole?.color||"#3b82f6"}}>
                      {(p.name||"?")[0]}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:"#e2e8f0"}}>{p.name}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:2}}>
                        {roleObjs.map(r=>(
                          <span key={r.id} style={{fontSize:10,color:r.color,
                            border:`1px solid ${r.color}55`,borderRadius:3,padding:"0px 5px"}}>
                            {r.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:11,color:"#475569",paddingTop:4,
                    borderTop:"1px solid #1e293b"}}>
                    <span>{p.taskCount} задач</span>
                    <span>{p.hours} ч</span>
                    {p.lastDay&&<span style={{marginLeft:"auto",color:"#334155"}}>{p.lastDay}</span>}
                  </div>
                </button>
              );
            })}
          </div>
          {visiblePeople.length===0&&<div style={{color:"#475569",fontSize:14,textAlign:"center",padding:"30px 0"}}>{"\u041d\u0438\u043a\u043e\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e"}</div>}
        </div>
      )}

      {atab==="shifts"&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:16,fontWeight:700}}>Аналитика смен</span>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select value={filterProject} onChange={e=>{setFilterProject(e.target.value);setFilterSeries("");}}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",color:filterProject?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 10px",fontSize:12}}>
            <option value="">Все проекты</option>
            {data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterSeries} onChange={e=>setFilterSeries(e.target.value)}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",color:filterSeries?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 10px",fontSize:12}}>
            <option value="">Все серии</option>
            {seriesOptions.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",color:filterPerson?"#e2e8f0":"#64748b",
              borderRadius:10,padding:"5px 10px",fontSize:12}}>
            <option value="">Все люди</option>
            {allPeople.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <span style={{fontSize:11,color:"#475569"}}>с</span>
          <InpDate value={dateFrom} onChange={setDateFrom}/>
          <span style={{fontSize:11,color:"#475569"}}>по</span>
          <InpDate value={dateTo} onChange={setDateTo}/>
          <Btn small variant="success" onClick={()=>downloadAnalyticsXls(filteredTasks,data,stageMap,{from:dateFrom,to:dateTo,projectName:filterProject?(data.projects.find(p=>p.id===filterProject)?.name||filterProject):"all_projects"})}>Выгрузить XLS</Btn>
          {(filterProject||filterSeries||filterPerson||dateFrom||dateTo)&&(
            <Btn small variant="ghost" onClick={()=>{setFilterProject("");setFilterSeries("");setFilterPerson("");setDateFrom("");setDateTo("");}}>
              Сбросить
            </Btn>
          )}
        </div>
      </div>

      {/* Итоговые плашки */}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>ВСЕГО СМЕН</div>
          <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0"}}>{totalShifts % 1===0?totalShifts:totalShifts.toFixed(1)}</div>
        </div>
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,padding:"12px 20px",minWidth:120}}>
          <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>ВЫХОДОВ</div>
          <div style={{fontSize:24,fontWeight:700,color:"#e2e8f0"}}>{totalExits}</div>
        </div>
        {roleTotals.map(([role,v])=>{
          const ri=roleMap[role];
          return (
            <div key={role} style={{background:"#1e293b",border:`1px solid ${ri?ri.color+"44":"#334155"}`,
              borderRadius:12,padding:"12px 20px",minWidth:120}}>
              <div style={{fontSize:11,color:ri?ri.color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>
                {ri?ri.label:role||"—"}
              </div>
              <div style={{fontSize:20,fontWeight:700,color:"#e2e8f0"}}>
                {v.shifts%1===0?v.shifts:v.shifts.toFixed(1)}
                <span style={{fontSize:12,color:"#475569",fontWeight:400,marginLeft:4}}>смен</span>
              </div>
              <div style={{fontSize:11,color:"#475569"}}>{v.exits} выходов</div>
            </div>
          );
        })}
      </div>

      {/* Таблица по людям */}
      {rows.length===0?(
        <div style={{color:"#475569",fontSize:14,textAlign:"center",padding:"40px 0"}}>
          Нет данных по выбранным фильтрам
        </div>
      ):(
        <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#0f172a"}}>
                <th style={TH}>Специалист</th>
                <th style={TH}>Роль</th>
                <th style={{...TH,textAlign:"right"}}>Выходов</th>
                <th style={{...TH,textAlign:"right"}}>Смен</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>{
                const ri=roleMap[r.role];
                return (
                  <tr key={r.person} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                    <td style={TD}>{r.person}</td>
                    <td style={TD}>
                      {ri?(
                        <span style={{background:"transparent",color:ri.color,
                          border:`1.5px solid ${ri.color}`,borderRadius:4,padding:"1px 8px",fontSize:12}}>
                          {ri.label}
                        </span>
                      ):<span style={{color:"#475569"}}>{r.role||"—"}</span>}
                    </td>
                    <td style={{...TD,textAlign:"right",color:"#94a3b8"}}>{r.exits}</td>
                    <td style={{...TD,textAlign:"right",fontWeight:700,color:"#e2e8f0"}}>
                      {r.shifts%1===0?r.shifts:r.shifts.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"#0f172a"}}>
                <td colSpan={2} style={{...TD,fontWeight:700,color:"#94a3b8",fontSize:12}}>ИТОГО</td>
                <td style={{...TD,textAlign:"right",fontWeight:700,color:"#94a3b8"}}>{totalExits}</td>
                <td style={{...TD,textAlign:"right",fontWeight:700,color:"#e2e8f0"}}>
                  {totalShifts%1===0?totalShifts:totalShifts.toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Скорость этапов */}
      {stageTimings.length>0&&(
        <div style={{marginTop:28}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Скорость этапов</div>
          <div style={{fontSize:12,color:"#475569",marginBottom:12}}>календарных дней на серию</div>
          <div style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:"#0f172a"}}>
                  <th style={TH}>Группа этапов</th>
                  <th style={{...TH,textAlign:"right"}}>Среднее</th>
                  <th style={{...TH,textAlign:"right"}}>σ</th>
                  <th style={{...TH,textAlign:"right"}}>Мин</th>
                  <th style={{...TH,textAlign:"right"}}>Макс</th>
                  <th style={TH}>Самая долгая</th>
                  <th style={{...TH,textAlign:"right"}}>Серий</th>
                </tr>
              </thead>
              <tbody>
                {stageTimings.map((row,i)=>{
                  const longestProj=row.longest?data.projects.find(p=>p.id===row.longest.projectId):null;
                  const longestSer=row.longest?(data.series||[]).find(s=>s.id===row.longest.seriesId):null;
                  const repStage=stages.find(s=>s.groupId===row.group.id);
                  const gc=repStage?.color||"#475569";
                  return (
                    <tr key={row.group.id} style={{background:i%2===0?"transparent":"rgba(255,255,255,0.02)"}}>
                      <td style={TD}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                          <span style={{width:8,height:8,borderRadius:2,background:gc,flexShrink:0,display:"inline-block"}}/>
                          {row.group.label}
                        </span>
                      </td>
                      <td style={{...TD,textAlign:"right",fontWeight:700,color:"#e2e8f0"}}>{row.avg.toFixed(1)}</td>
                      <td style={{...TD,textAlign:"right",color:row.sigma>row.avg*0.5?"#f97316":"#94a3b8"}}>{row.sigma.toFixed(1)}</td>
                      <td style={{...TD,textAlign:"right",color:"#94a3b8"}}>{row.min}</td>
                      <td style={{...TD,textAlign:"right",color:"#94a3b8"}}>{row.max}</td>
                      <td style={TD}>
                        {longestProj&&longestSer?(
                          <span style={{fontSize:12,color:"#64748b"}}>
                            <span style={{color:longestProj.color||"#94a3b8"}}>{longestProj.abbr||longestProj.name}</span>
                            {" · "}{longestSer.name}
                          </span>
                        ):"—"}
                      </td>
                      <td style={{...TD,textAlign:"right",color:"#475569"}}>{row.count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{fontSize:11,color:"#475569",marginTop:8}}>
            Большое σ — нестабильное прохождение этапа. Стоит посмотреть, какие серии тянут вверх.
          </div>
        </div>
      )}
      </div>}
    </div>
  );
}

// ── ЛОГ ИЗМЕНЕНИЙ ────────────────────────────────────────────────────
