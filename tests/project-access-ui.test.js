const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const Renderer = require('react-test-renderer');
const { act } = Renderer;

const source = fs.readFileSync(path.join(__dirname,'../src/index.jsx'),'utf8');
const names = [...source.matchAll(/^function (\w+)/gm)].map(match=>match[1]);
const context = {
  React,
  ReactDOM:{createRoot:()=>({render(){}}),createPortal:value=>value},
  console,
  document:{getElementById:()=>null,body:{},documentElement:{clientWidth:1280}},
  window:{innerWidth:1280,innerHeight:900,location:{hash:'',pathname:'/',search:''}},
  location:{hash:'',pathname:'/',search:''},history:{},
  sessionStorage:{getItem:()=>null,setItem(){}},setTimeout,clearTimeout,
};
vm.createContext(context);
vm.runInContext(babel.transformSync(source,{presets:['@babel/preset-react'],filename:'index.jsx'}).code+
  '\nglobalThis.api={'+names.join(',')+',DEFAULT_STAGES,DEFAULT_STAGE_GROUPS,StagesCtx,HolidaysCtx};',context);
const api = context.api;

test('project access screen exposes only credential status metadata',()=>{
  const data=api.makeDemoData();
  data.stages=api.DEFAULT_STAGES;data.stageGroups=api.DEFAULT_STAGE_GROUPS;data.holidays=[];
  data.projects.forEach(project=>{project.managers=[];project.dossier=project.dossier||{};});
  const secure=api.normalizeLoadedData({...data,projects:data.projects.map((project,index)=>index?project:{...project,dossier:{
    ...(project.dossier||{}),accesses:[{label:'Архив',login:'render-login-marker',password:'render-password-marker'}]
  }})});
  const stageMap=Object.fromEntries(secure.stages.map(stage=>[stage.id,stage]));
  const groupMap=Object.fromEntries(secure.stageGroups.map(group=>[group.id,group]));
  const noop=()=>{};
  let renderer;
  act(()=>{renderer=Renderer.create(React.createElement(api.StagesCtx.Provider,{value:{stageMap,sorted:secure.stages,stageGroups:secure.stageGroups,groupMap}},
    React.createElement(api.HolidaysCtx.Provider,{value:[]},React.createElement(api.ProjectCard,{
      data:secure,projectId:secure.projects[0].id,onUpdate:noop,onBatchUpdate:noop,onLog:noop,
      onSeriesSelect:noop,canEditProject:true,canDeleteStructure:true,canManageProjectAssignments:true,
    }))));});
  const accessTab=renderer.root.findAllByType('button').find(button=>button.children.join('').includes('Доступы и ссылки'));
  act(()=>accessTab.props.onClick());
  const ui=JSON.stringify(renderer.toJSON());
  assert.ok(ui.includes('Реквизиты доступа скрыты'));
  assert.ok(ui.includes('Архив'));
  assert.equal(ui.includes('render-login-marker'),false);
  assert.equal(ui.includes('render-password-marker'),false);
  assert.equal(renderer.root.findAllByType('input').some(input=>input.props.type==='password'),false);
  act(()=>renderer.unmount());
});
