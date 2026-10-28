'use strict';
// Build-time AST edits wrap only string values. IDs, expressions, regexes,
// user-entered reports and original raw evidence are never rewritten.
const fs=require('node:fs');
const path=require('node:path');
const acorn=require('acorn');
const root=path.resolve(__dirname,'..');
const dictionaryFiles=['i18n-cases.en.json','i18n-practice.en.json','i18n-app.en.json','i18n-core.en.json'];
const japanese=value=>typeof value==='string'&&/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(value);
function messages(){return Object.assign({},...dictionaryFiles.map(file=>JSON.parse(fs.readFileSync(path.join(root,'src',file),'utf8'))));}
function localizeScript(source,dictionary=messages()){
  const edits=[];
  const ast=acorn.parse(source,{ecmaVersion:'latest'});
  function walk(node){
    if(!node||typeof node!=='object')return;
    const value=node.type==='Literal'?node.value:node.type==='TemplateElement'?node.value.cooked:null;
    if(japanese(value)){
      if(!Object.hasOwn(dictionary,value))throw new Error('Missing English string: '+JSON.stringify(value));
      const call='globalThis.SocI18n.t('+JSON.stringify(value)+')';
      edits.push({start:node.start,end:node.end,text:node.type==='TemplateElement'?'${'+call+'}':call});
    }
    for(const item of Object.values(node))if(Array.isArray(item))item.forEach(walk);else if(item&&typeof item==='object')walk(item);
  }
  walk(ast);
  for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
  return source;
}
function validateData(value,dictionary,key,location='data'){
  if(key==='raw')return;
  if(typeof value==='string'&&japanese(value)&&!Object.hasOwn(dictionary,value))throw new Error('Missing English data at '+location+': '+JSON.stringify(value));
  if(Array.isArray(value))value.forEach((item,i)=>validateData(item,dictionary,null,location+'['+i+']'));
  else if(value&&typeof value==='object')for(const [name,item] of Object.entries(value))validateData(item,dictionary,name,location+'.'+name);
}
function prepareModule(file,source,dictionary=messages()){
  if(file==='data.js'){
    const context={};require('node:vm').runInNewContext(source,context);validateData(context.SOC_DATA,dictionary);
    return 'globalThis.SOC_MESSAGES='+JSON.stringify(dictionary)+';\n'+fs.readFileSync(path.join(root,'src/i18n.js'),'utf8')+'\n'+source+'\nglobalThis.SOC_DATA=globalThis.SocI18n.localize(globalThis.SOC_DATA);';
  }
  return ['app.js','engine.js','terminal.js','tutorial.js','bridge.js'].includes(file)?localizeScript(source,dictionary):source;
}
module.exports={messages,japanese,localizeScript,validateData,prepareModule};
