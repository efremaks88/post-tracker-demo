const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../server.js'),'utf8');
const context={URL,Buffer,crypto};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('function isMutatingMethod'),source.indexOf('// Config'))+
  '\nglobalThis.security={isSameOrigin,safeTokenEqual,requireCsrf};',context);
const api=context.security;
function request(headers={},method='PUT',session={userId:1,csrfToken:'secret'}){
  return {method,path:'/api/data',protocol:'http',session,get:key=>({'host':'127.0.0.1:3000',...headers})[key.toLowerCase()]};
}
for(const [label,headers,expected] of [
  ['same origin',{origin:'http://127.0.0.1:3000'},true],
  ['same origin referer',{referer:'http://127.0.0.1:3000/projects'},true],
  ['foreign domain',{origin:'http://evil.example'},false],
  ['foreign port',{origin:'http://127.0.0.1:3001'},false],
  ['foreign protocol',{origin:'https://127.0.0.1:3000'},false],
  ['null origin',{origin:'null'},false],['missing headers',{},false],
  ['prefix domain',{origin:'http://127.0.0.1:3000.evil.example'},false],
])test('same-origin check: '+label,()=>assert.equal(api.isSameOrigin(request(headers)),expected));
test('CSRF requires origin and matching token for every authenticated write',()=>{
  for(const headers of [{origin:'http://127.0.0.1:3000'},{'x-csrf-token':'secret'},{origin:'http://evil.example','x-csrf-token':'secret'}]){
    let status;api.requireCsrf(request(headers),{status(value){status=value;return this;},json(){}},()=>assert.fail('write permitted'));
    assert.equal(status,403);
  }
  let passed=false;
  api.requireCsrf(request({origin:'http://127.0.0.1:3000','x-csrf-token':'secret'}),{},()=>passed=true);assert.ok(passed);
});
test('token comparisons safely reject missing, unequal and differently sized tokens',()=>{
  assert.equal(api.safeTokenEqual('',null),false);assert.equal(api.safeTokenEqual('secret','longer-secret'),false);
  assert.equal(api.safeTokenEqual('secret','secrex'),false);assert.equal(api.safeTokenEqual('secret','secret'),true);
});
test('read-only requests do not require CSRF tokens',()=>{
  let passed=false;api.requireCsrf(request({},'GET'),{},()=>passed=true);assert.ok(passed);
});
