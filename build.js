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
// Keep the original artwork in the source tree and embed it for offline use.
const artworkMarker='__ENDING_ART_DATA_URI__';
if(html.split(artworkMarker).length!==2)throw new Error('Invalid ending artwork marker');
const artwork=fs.readFileSync(path.join(__dirname,'assets','investigation.png')).toString('base64');
html=html.replace(artworkMarker,()=>`data:image/png;base64,${artwork}`);
const license=fs.readFileSync(path.join(root,'LICENSE'),'utf8');
html=html.replace('<!doctype html>','<!doctype html>\n<!--\n'+license+'\n-->');
const target=process.argv[2] ? path.resolve(process.argv[2]) : path.join(root,'socroom.html');
fs.mkdirSync(path.dirname(target),{recursive:true});
fs.writeFileSync(target,html);
console.log(`Built ${target} (${Math.round(Buffer.byteLength(html)/1024)} KiB)`);
