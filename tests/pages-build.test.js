const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist-pages');

function buildPages(){
  execFileSync(process.execPath, [path.join(ROOT,'scripts','build-pages.js')], {cwd:ROOT,stdio:'pipe'});
}

test('GitHub Pages build is self-contained and project-path safe', ()=>{
  buildPages();
  for (const file of ['index.html','404.html','app.js','app.css','pages-data.js','pages-demo.js','runtime-config.js','.nojekyll']) {
    assert.ok(fs.existsSync(path.join(DIST,file)), `${file} must be emitted`);
  }
  const html=fs.readFileSync(path.join(DIST,'index.html'),'utf8');
  assert.match(html,/pages-data\.js/);
  assert.match(html,/pages-demo\.js/);
  assert.doesNotMatch(html,/(?:src|href)="\//);
  assert.doesNotMatch(fs.readFileSync(path.join(DIST,'app.js'),'utf8'),/url\("\/demo\//);
});

test('Pages demo API loads fixtures and persists a created project', async()=>{
  buildPages();
  const memory = new Map();
  const localStorage = {
    getItem:key=>memory.has(key)?memory.get(key):null,
    setItem:(key,value)=>memory.set(key,String(value)),
    removeItem:key=>memory.delete(key),
  };
  const window = {
    location:{href:'https://example.github.io/post-tracker/',hash:'#producer'},
    localStorage,
    fetch:async()=>{throw new Error('Unexpected network request');},
    addEventListener:()=>{},
  };
  const context=vm.createContext({window,localStorage,URL,Response,Date,Math,JSON,console});
  vm.runInContext(fs.readFileSync(path.join(DIST,'pages-data.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(DIST,'pages-demo.js'),'utf8'),context);

  const dashboardResponse=await window.fetch('/api/producer/dashboard');
  const dashboard=await dashboardResponse.json();
  assert.equal(dashboard.projects.length,7);
  assert.ok(dashboard.projects.some(project=>project.id==='demo-north'));

  const marketingResponse=await window.fetch('/api/producer/marketing');
  const marketing=await marketingResponse.json();
  assert.equal(marketing.summary.series,10);
  assert.ok(marketing.projects.some(project=>project.id==='demo-north'&&project.series.some(series=>series.airDate==='2026-11-06')));

  const createResponse=await window.fetch('/api/producer/projects',{
    method:'POST',
    body:JSON.stringify({name:'Демо заказчика',description:'Проверка',status:'подготовка',color:'#4f79d8'}),
  });
  assert.equal(createResponse.status,201);
  const created=await createResponse.json();
  const projectResponse=await window.fetch(`/api/producer/projects/${created.id}`);
  const project=await projectResponse.json();
  assert.equal(project.project.name,'Демо заказчика');
  assert.ok(memory.size>0,'demo mutations must be stored in localStorage');
});
