const SOFT_DELETE_KEYS=["tasks","projects","series","people","personAbsences"];

// ── АВТОРИЗАЦИЯ ────────────────────────────────────────────────────
async function doLogin(login,password){
  const res=await fetch("/api/auth/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify({login,password})
  });
  const data=await res.json();
  setCsrfToken(data.csrfToken);
  return data;
}

async function doLogout(){
  await csrfFetch("/api/auth/logout",{method:"POST",credentials:"include"});
  setCsrfToken("");
}

// ── СЧЁТЧИК (одометр / механический счётчик пробега) ──────────
function FlipUnit({digit}){
  const [rolling,setRolling]=React.useState(false);
  const curRef=React.useRef(digit);
  
  React.useEffect(()=>{
    if(curRef.current!==digit){
      setRolling(true);
      const t=setTimeout(()=>{
        curRef.current=digit;
        setRolling(false);
      },220);
      return ()=>clearTimeout(t);
    }
  },[digit]);

  const d=rolling?curRef.current:digit;

  return (
    <span style={{display:"inline-flex",flexDirection:"column",width:16,height:24,
      position:"relative",overflow:"hidden",textAlign:"center",flexShrink:0,
      fontFamily:"'Space Grotesk','Courier New',monospace",fontWeight:700,fontSize:16,
      color:"#e2e8f0",background:"#1e293b",borderRadius:3,border:"1px solid #334155",
      margin:"0 1px"}}>
      <span style={{
        display:"flex",flexDirection:"column",
        transform:rolling?"translateY(-50%)":"translateY(0)",
        transition:rolling?"transform 0.22s ease-out":"none"
      }}>
        <span style={{height:24,lineHeight:"24px"}}>{d}</span>
        <span style={{height:24,lineHeight:"24px"}}>{digit}</span>
      </span>
    </span>
  );
}

function FlipClock(){
  const [time,setTime]=React.useState(new Date());
  React.useEffect(()=>{
    const id=setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(id);
  },[]);
  const h=time.getHours(), m=time.getMinutes(), s=time.getSeconds();

  const Sep=()=><span style={{color:"#60a5fa",fontWeight:700,fontSize:14,
    lineHeight:'24px',margin:'0 1px',userSelect:'none'}}>:</span>;

  return (
    <span style={{display:"flex",alignItems:"center",gap:0,flexShrink:0,marginRight:8}}>
      <FlipUnit digit={Math.floor(h/10)}/>
      <FlipUnit digit={h%10}/>
      <Sep/>
      <FlipUnit digit={Math.floor(m/10)}/>
      <FlipUnit digit={m%10}/>
      <Sep/>
      <FlipUnit digit={Math.floor(s/10)}/>
      <FlipUnit digit={s%10}/>
    </span>
  );
}

function LoginForm({onLogin,error}){
  const [l,setL]=React.useState("");
  const [p,setP]=React.useState("");
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",
      background:"#0f172a",color:"#e2e8f0"}}>
      <div style={{background:"#1e293b",borderRadius:12,padding:32,width:320,
        border:"1px solid #334155"}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:1,textAlign:"center",marginBottom:4}}>
          ПОСТ ТРЕКЕР
        </div>
        <div style={{fontSize:12,color:"#475569",textAlign:"center",marginBottom:24}}>
          Вход в систему
          <div className="ppt-author">Создано Максимом Ефремовым</div>
        </div>
        {error&&<div style={{background:"#7f1d1d",color:"#fca5a5",padding:"6px 12px",
          borderRadius:10,fontSize:12,marginBottom:12}}>{error}</div>}
        <input value={l} onChange={e=>setL(e.target.value)} placeholder="Логин"
          style={{width:"100%",padding:"8px 12px",background:"#0f172a",border:"1px solid #334155",
            borderRadius:10,color:"#e2e8f0",fontSize:14,fontFamily:"inherit",marginBottom:8,
            boxSizing:"border-box"}}
          onKeyDown={e=>e.key==="Enter"&&document.getElementById("login-pw").focus()}/>
        <input id="login-pw" value={p} onChange={e=>setP(e.target.value)} type="password"
          placeholder="Пароль"
          style={{width:"100%",padding:"8px 12px",background:"#0f172a",border:"1px solid #334155",
            borderRadius:10,color:"#e2e8f0",fontSize:14,fontFamily:"inherit",marginBottom:16,
            boxSizing:"border-box"}}
          onKeyDown={e=>{if(e.key==="Enter")onLogin(l,p);}}/>
        <button onClick={()=>onLogin(l,p)}
          style={{width:"100%",padding:"8px",background:"#2563eb",border:"none",borderRadius:10,
            color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
          Войти
        </button>
      </div>
    </div>
  );
}

function UsersView({user,onUserUpdate}){
  const [users,setUsers]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [syncing,setSyncing]=React.useState(false);

  React.useEffect(()=>{loadUsers();},[]);

  async function loadUsers(){
    try{
      const r=await fetch("/api/users",{credentials:"include"});
      if(r.ok)setUsers(await r.json());
    }catch(e){}
    setLoading(false);
  }

  async function changeRole(id,role){
    const r=await csrfFetch(`/api/users/${id}/role`,{method:"PUT",
      headers:{"Content-Type":"application/json"},credentials:"include",
      body:JSON.stringify({role})});
    if(r.ok){
      const updated=await r.json();
      setUsers(u=>u.map(x=>x.id===id?{...x,role:updated.role}:x));
    }
  }

  async function syncAD(){
    setSyncing(true);
    try{
      await csrfFetch("/api/users/sync",{method:"POST",credentials:"include"});
      await loadUsers();
    }catch(e){}
    setSyncing(false);
  }

  const [showDisabled,setShowDisabled]=React.useState(false);
  const filteredUsers=users.filter(u=>showDisabled||u.ad_enabled!==false);
  const roleGroups={};
  for(const u of filteredUsers){
    const role=u.role||"viewer";
    if(!roleGroups[role]) roleGroups[role]=[];
    roleGroups[role].push(u);
  }
  const roleOrder=["admin","lead","manager","editor","viewer","na"];
  const roleLabels={admin:"\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440\u044b",lead:"LEAD",manager:"\u041c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u044b",editor:"\u0420\u0435\u0434\u0430\u043a\u0442\u043e\u0440\u044b",viewer:"\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0449\u0438\u043a\u0438",na:"\u0411\u0435\u0437 \u0434\u043e\u0441\u0442\u0443\u043f\u0430 (NA)"};

  return (
    <div style={{padding:"20px 24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <h3 style={{margin:0,fontSize:16}}>👥 Роли</h3>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#64748b"}}>Всего: {filteredUsers.length}</span>
          <button onClick={()=>setShowDisabled(!showDisabled)}
            style={{background:showDisabled?"#1e3a5f":"#1e293b",border:"1px solid #334155",borderRadius:10,
              padding:"5px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {showDisabled?"OK Все":" Только активные"}
          </button>
          {RUNTIME.mode!=="local-demo"&&<button onClick={syncAD} disabled={syncing}
            style={{background:"rgba(30,41,59,.72)",border:"1px solid rgba(148,163,184,.18)",borderRadius:10,
              padding:"5px 12px",color:"#e2e8f0",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {syncing?"⏳ Синхронизация...":"🔄 Синхр. AD"}
          </button>}
        </div>
      </div>
      {loading?<div style={{color:"#475569"}}>Загрузка...</div>:
      roleOrder.map(role=>{
        const items=roleGroups[role]||[];
        if(!items.length) return null;
        return (
          <div key={role} style={{marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:8,
              borderBottom:"1px solid #1e293b",paddingBottom:4}}>
              {roleLabels[role]||role} <span style={{fontWeight:400,fontSize:11,color:"#475569"}}>({items.length})</span>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{color:"#64748b",fontSize:11}}>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Имя</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Логин</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Группы AD</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Роль</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Статус</th>
                  <th style={{textAlign:"left",padding:"4px 8px",borderBottom:"1px solid #1e293b"}}>Вход</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u=>(
                  <tr key={u.id} style={{borderBottom:"1px solid #0f172a",opacity:u.ad_enabled===false?0.5:1}}>
                    <td style={{padding:"4px 8px"}}>{u.display_name}</td>
                    <td style={{padding:"4px 8px",color:"#64748b",fontSize:11}}>{u.sam_name}</td>
                    <td style={{padding:"4px 8px",color:"#64748b",fontSize:11}}>
                      {(u.ad_groups||[]).slice(0,3).join(", ")}{(u.ad_groups||[]).length>3?", ...":""}
                    </td>
                    <td style={{padding:"4px 8px"}}>
                      <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                        style={{background:"#0f172a",color:"#e2e8f0",border:"1px solid #334155",
                          borderRadius:4,padding:"2px 4px",fontSize:12,fontFamily:"inherit"}}>
                        <option value="admin">admin</option>
                        <option value="lead">lead</option>
                        <option value="manager">manager</option>
                        <option value="editor">editor</option>
                        <option value="viewer">viewer</option>
                        <option value="na">na (без доступа)</option>
                      </select>
                    </td>
                    <td style={{padding:"4px 8px",fontSize:11}}>
                      <span style={{color:u.ad_enabled===false?"#ef4444":"#22c55e"}}>
                        {u.ad_enabled===false?"! Заблокирован":"🟢 Активен"}
                      </span>
                    </td>
                    <td style={{padding:"4px 8px",fontSize:11,color:"#475569"}}>
                      {u.last_login?new Date(u.last_login).toLocaleDateString("ru-RU"):"—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ── ОСНОВНОЕ ПРИЛОЖЕНИЕ ─────────────────────────────────────────────


