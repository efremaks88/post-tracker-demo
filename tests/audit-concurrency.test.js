const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const express=require('express');
const {runMigrations}=require('../lib/migrate');
const {createLocalPool}=require('../lib/local-demo');
const {withTransaction}=require('../lib/db');
const {auditMutation}=require('../lib/audit');

test('simultaneous users produce a serial old-to-new audit chain',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'post-tracker-audit-race-'));
  let pool,server;
  try{
    pool=createLocalPool(path.join(root,'pglite'));
    await runMigrations(pool);
    await pool.query("INSERT INTO users(id,sam_name,display_name,role) VALUES(1,'one','Первый','admin'),(2,'two','Второй','admin')");
    await pool.query("INSERT INTO projects(id,name) VALUES('p','Проект')");
    await pool.query("INSERT INTO tasks(id,project_id,person,status,day,\"from\",\"to\") VALUES(1,'p','Исходный','монтаж','11.10.2026',10,18)");
    const app=express();app.use(express.json());
    app.use((req,res,next)=>{const id=Number(req.headers['x-user']);req.session={userId:id,displayName:id===1?'Первый':'Второй'};next();});
    app.post('/task',withTransaction(pool,async(req,res)=>{
      await req._tx.query("SELECT value FROM app_state WHERE key='revision' FOR UPDATE");
      await auditMutation(req,['task'],()=>req._tx.query('UPDATE tasks SET person=$1,updated_at=NOW() WHERE id=1',[req.body.person]));
      res.json({ok:true});
    }));
    app.use((error,req,res,next)=>res.status(500).json({error:error.message}));
    await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});
    const url='http://127.0.0.1:'+server.address().port+'/task';
    const responses=await Promise.all([
      fetch(url,{method:'POST',headers:{'content-type':'application/json','x-user':'1'},body:JSON.stringify({person:'Анна'})}),
      fetch(url,{method:'POST',headers:{'content-type':'application/json','x-user':'2'},body:JSON.stringify({person:'Мария'})}),
    ]);
    assert.deepEqual(responses.map(response=>response.status),[200,200]);
    const events=(await pool.query("SELECT user_id,changes FROM audit_log WHERE entity='task' ORDER BY id")).rows;
    assert.equal(events.length,2);assert.deepEqual(new Set(events.map(event=>event.user_id)),new Set([1,2]));
    const first=events[0].changes.find(change=>change.field==='person');
    const second=events[1].changes.find(change=>change.field==='person');
    assert.equal(first.before,'Исходный');assert.equal(second.before,first.after);
    assert.equal((await pool.query('SELECT person FROM tasks WHERE id=1')).rows[0].person,second.after);
  }finally{
    if(server)await new Promise(resolve=>server.close(resolve));
    if(pool)await pool.close();
    fs.rmSync(root,{recursive:true,force:true});
  }
});
