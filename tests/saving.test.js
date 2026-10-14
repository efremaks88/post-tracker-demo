// Exercise App's real hooks and save handlers without a DOM or a browser.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const babel=require('@babel/core');
const React=require('react');
const Renderer=require('react-test-renderer');
const {act}=Renderer;
const source=fs.readFileSync(path.join(__dirname,'../src/index.jsx'),'utf8');
const compiled=babel.transformSync(source,{presets:['@babel/preset-react']}).code;
const clone=value=>JSON.parse(JSON.stringify(value));
const flush=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
function target(){
  const listeners=new Map();
  return {addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},
    removeEventListener(name,fn){listeners.get(name)?.delete(fn);},
    dispatchEvent(event){for(const fn of [...(listeners.get(event.type)||[])])fn(event);}};
}
async function appFixture(options={}){
  const window={...target(),innerWidth:1280,innerHeight:900,location:{hash:'',pathname:'/',search:''},confirm:()=>true};
  const document={...target(),getElementById:()=>null,documentElement:{clientWidth:1280},body:{}};
  const timers=new Map(),storage=new Map(),puts=[],alerts=[];
  const user={id:1,sam_name:'demo',display_name:'Demo',role:'admin'};
  let state,renderer,timerId=0,reads=0,fail=false,hold=null,sse;
  const context={React,ReactDOM:{createRoot:()=>({render(){}})},console,window,document,
    location:window.location,history:{pushState(){}},alert:message=>alerts.push(message),
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    sessionStorage:{getItem:()=>null,setItem(){}},
    setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),
    EventSource:class{constructor(){sse=this;}close(){}},
    fetch:async(url,request={})=>{
      const response=(status,body)=>({ok:status<400,status,json:async()=>clone(body)});
      if(url==='/api/auth/me')return response(200,{user,csrfToken:'token'});
      if(url==='/api/auth/logout')return response(200,{ok:true});
      if(url==='/api/data'&&request.method==='PUT'){
        const payload=JSON.parse(request.body);puts.push(payload);
        if(hold)await new Promise(resolve=>{hold.resolve=resolve;});
        if(fail)return response(500,{error:'save failed'});
        if(payload._revision!==state._revision)return response(409,{error:'conflict'});
        // Match SQL soft deletion: omission alone does not remove a saved task.
        const tasks=new Map(state.tasks.map(task=>[task.id,task]));
        payload.tasks.forEach(task=>tasks.set(task.id,task));
        state={...clone(payload),tasks:[...tasks.values()].filter(task=>!task.deleted),_revision:state._revision+1};
        return response(200,state);
      }
      if(url==='/api/data'){reads++;if(options.offline)throw new Error('offline');return response(200,state);}
      throw new Error('Unexpected API '+url);
    },
  };
  vm.createContext(context);
  vm.runInContext(compiled+`
    useIsMobile=()=>false;FlipClock=()=>null;
    TodayView=props=>React.createElement('today-screen',props);
    GanttView=props=>React.createElement('gantt-screen',props);
    globalThis.api={App,DEFAULT_STAGES,DEFAULT_STAGE_GROUPS,accountBackupKey,normalizeLoadedData};`,context);
  state=context.api.normalizeLoadedData({_revision:0,projects:[{id:'p',name:'Project',abbr:'P',dossier:{},managers:[]}],
    stages:context.api.DEFAULT_STAGES,stageGroups:context.api.DEFAULT_STAGE_GROUPS});
  if(options.offline)storage.set(context.api.accountBackupKey(user),JSON.stringify({data:{...clone(state),_revision:7}}));
  await act(async()=>{renderer=Renderer.create(React.createElement(context.api.App));await flush();});
  await act(async()=>{renderer.root.findAllByType('button').find(b=>b.children.includes('Гант')).props.onClick();});
  const screen=()=>renderer.root.findByType('gantt-screen');
  return {screen,puts,alerts,storage,context,
    get state(){return state;},get reads(){return reads;},
    set fail(value){fail=value;},
    hold(){hold={};},async release(){const waiting=hold;hold=null;await act(async()=>{waiting.resolve();await flush();});},
    async change(tasks){await act(async()=>{screen().props.onUpdate('tasks',tasks);});},
    async tick(){await act(async()=>{const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());await flush();});},
    async undo(){await act(async()=>{document.dispatchEvent({type:'keydown',ctrlKey:true,key:'z',code:'KeyZ',target:{tagName:'DIV'},preventDefault(){}});});},
    async remote(){await act(async()=>{sse.onmessage({data:JSON.stringify({clientId:'other'})});await flush();});},
    unload(){let prevented=false;window.dispatchEvent({type:'beforeunload',preventDefault(){prevented=true;}});return prevented;},
    close(){act(()=>renderer.unmount());},
  };
}
const task={id:1,project:'p',seriesId:null,person:'',status:'монтаж',day:'11.10.2026',from:10,to:19};

test('Ctrl+Z after creating and saving a task deletes it on the server too',async()=>{
  const app=await appFixture();try{
    await app.change([task]);assert.equal(app.unload(),true);await app.tick();assert.equal(app.state.tasks.length,1);assert.equal(app.unload(),false);
    await app.undo();await app.tick();assert.equal(app.puts.length,2);assert.equal(app.puts[1].tasks[0].deleted,true);assert.equal(app.state.tasks.length,0);
  }finally{app.close();}
});
test('rapid edits are debounced and all history entries survive the save',async()=>{
  const app=await appFixture();try{
    await app.change([task]);app.screen().props.onLog('created');
    await app.change([{...task,person:'A'}]);app.screen().props.onLog('assigned');
    await app.tick();assert.equal(app.puts.length,1);assert.equal(app.state.tasks[0].person,'A');
    assert.deepEqual(new Set(app.state.changelog.map(entry=>entry.text)),new Set(['created','assigned']));
  }finally{app.close();}
});
test('an edit made during a save waits and uses the acknowledged revision',async()=>{
  const app=await appFixture();try{
    app.hold();await app.change([task]);await app.tick();assert.equal(app.puts.length,1);
    await app.change([{...task,person:'B'}]);await app.tick();assert.equal(app.puts.length,1);
    await app.release();assert.equal(app.puts.length,2);assert.equal(app.puts[1]._revision,1);assert.equal(app.state.tasks[0].person,'B');
  }finally{app.close();}
});
test('failed save keeps local data, blocks unloading and ignores remote overwrite',async()=>{
  const app=await appFixture();try{
    app.fail=true;await app.change([task]);await app.tick();assert.equal(app.screen().props.data.tasks.length,1);assert.equal(app.unload(),true);
    const reads=app.reads;await app.remote();assert.equal(app.reads,reads);assert.equal(app.screen().props.data.tasks.length,1);
    app.fail=false;await app.change(app.screen().props.data.tasks);await app.tick();assert.equal(app.state.tasks.length,1);assert.equal(app.unload(),false);
  }finally{app.close();}
});
test('accepted remote state clears obsolete undo history',async()=>{
  const app=await appFixture();try{
    await app.change([task]);await app.tick();await app.remote();await app.undo();await app.tick();assert.equal(app.puts.length,1);assert.equal(app.state.tasks.length,1);
  }finally{app.close();}
});
test('offline backup remains protected and retains its original revision',async()=>{
  const app=await appFixture({offline:true});try{
    assert.equal(app.unload(),true);const reads=app.reads;await app.remote();assert.equal(app.reads,reads);
    await app.change([task]);await app.tick();assert.equal(app.puts[0]._revision,7);assert.equal(app.unload(),true);
  }finally{app.close();}
});

test('App removes project credentials from local backups and outgoing saves',async()=>{
  const app=await appFixture();try{
    const marker='app-credential-marker';
    const project={...app.screen().props.data.projects[0],dossier:{accesses:[{label:'Архив',password:marker}]}};
    await act(async()=>{app.screen().props.onUpdate('projects',[project]);});
    const backup=[...app.storage.values()].at(-1);
    assert.equal(backup.includes(marker),false);
    await app.tick();
    assert.equal(JSON.stringify(app.puts).includes(marker),false);
  }finally{app.close();}
});
