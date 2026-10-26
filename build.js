'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
require('./assemble-data.js')();
const modules = {CSS:'style.css',DATA:'data.js',ENGINE:'engine.js',SHELL:'vendor-shell.js',TERMINAL:'terminal.js',TUTORIAL:'tutorial.js',BRIDGE:'bridge.js',APP:'app.js'};
let html = fs.readFileSync(path.join(root,'src/ui.html'),'utf8');
for (const [key,file] of Object.entries(modules)) {
  const marker = `/*__${key}__*/`;
  if(html.split(marker).length!==2) throw new Error(`Invalid marker ${marker}`);
  const source = fs.readFileSync(path.join(root,'src',file),'utf8');
  html=html.replace(marker,()=>file.endsWith('.js')?source.replace(/<\/script/gi,'<\\/script'):source);
}
const license=fs.readFileSync(path.join(root,'LICENSE'),'utf8');
html=html.replace('<!doctype html>','<!doctype html>\n<!--\n'+license+'\n-->');
const target=process.argv[2] ? path.resolve(process.argv[2]) : path.join(root,'socroom.html');
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,html);
// A normal build also updates the GitHub Pages site. An explicit output path
// stays isolated, so release checks can build into a temporary directory.
if(!process.argv[2]){
  const docs=path.join(__dirname,'docs');
  fs.mkdirSync(docs,{recursive:true});
  fs.writeFileSync(path.join(docs,'index.html'),html);
  fs.writeFileSync(path.join(docs,'socroom.html'),html);
  fs.writeFileSync(path.join(docs,'.nojekyll'),'');
}
console.log(`Built ${target} (${Math.round(Buffer.byteLength(html)/1024)} KiB)`);
