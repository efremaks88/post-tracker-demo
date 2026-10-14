const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');
let count=0;
function check(relative){
  const file=path.join(root,relative);
  const stat=fs.statSync(file);
  if(stat.isDirectory()){
    for(const name of fs.readdirSync(file))check(path.join(relative,name));
  } else if(file.endsWith('.js')) {
    execFileSync(process.execPath,['--check',file],{stdio:'pipe'});count++;
  }
}
for(const name of ['server.js','build.js','lib','routes','scripts','tests','public'])check(name);
console.log('Syntax OK: '+count+' JavaScript files');
