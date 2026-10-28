'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const L=require('../scripts/localize.js');
const root=path.resolve(__dirname,'..');
let html;
function page(t,language,saved){
  if(!html){
    const dictionary=L.messages();html=fs.readFileSync(path.join(root,'src/ui.html'),'utf8');
    for(const [key,file] of Object.entries({CSS:'style.css',DATA:'data.js',ENGINE:'engine.js',SHELL:'vendor-shell.js',TERMINAL:'terminal.js',TUTORIAL:'tutorial.js',BRIDGE:'bridge.js',APP:'app.js'})){
      const value=key==='CSS'?'':L.prepareModule(file,fs.readFileSync(path.join(root,'src',file),'utf8'),dictionary);
      html=html.replace('/*__'+key+'__*/',()=>value.replace(/<\/script/gi,'<\\/script'));
    }
  }
  const errors=[],storage=new Map(saved===undefined?[]:[['socroom.language.v1',saved]]),vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(html,{runScripts:'dangerously',virtualConsole:vc,beforeParse(window){
    Object.defineProperty(window.navigator,'languages',{value:[language]});Object.defineProperty(window.navigator,'language',{value:language});
    Object.defineProperty(window,'localStorage',{value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)}});
    window.setInterval=()=>1;window.setTimeout=()=>1;window.clearTimeout=()=>{};window.scrollTo=()=>{};
    window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
    window.fetch=()=>{throw new Error('Unexpected network');};window.TextEncoder=TextEncoder;window.TextDecoder=TextDecoder;
  }});
  t.after(()=>{assert.deepEqual(errors,[]);dom.window.close();});
  const document=dom.window.document;
  function click(selector){const node=document.querySelector(selector);assert.ok(node,selector);assert.equal(Boolean(node.disabled),false);node.click();}
  return {window:dom.window,document,click,storage};
}
test('Japanese and English home screens and manual language preferences select the matching content',t=>{
  for(const [browser,saved,expected] of [['ja-JP',undefined,'ja'],['en-US',undefined,'en'],['th-TH',undefined,'en'],['en-US','ja','ja'],['ja-JP','en','en']]){
    const h=page(t,browser,saved);assert.equal(h.document.documentElement.lang,expected);assert.equal(h.document.querySelector('[data-language]').value,expected);
    assert.equal(h.window.SOC_DATA.cases.length,22);assert.ok(h.document.querySelector('.release-version').textContent.includes('0.8.0'));
    assert.equal(/[ぁ-んァ-ヶ一-龠]/.test(h.document.querySelector('h1').textContent),expected==='ja');
    assert.equal(h.storage.get('socroom.language.v1'),saved,'initial render must not store an automatic choice');
  }
});
test('English normal, tutorial and guided practice screens render fully translated instructions',t=>{
  const h=page(t,'en-US');
  h.click('[data-action="start"]');assert.equal(h.document.querySelector('html').lang,'en');
  assert.match(h.document.body.textContent,/Response record/);assert.match(h.document.body.textContent,/Add to evidence/);
  h.click('[data-tab="resources"]');assert.match(h.document.body.textContent,/Assets & records/);
  assert.equal(/[ぁ-んァ-ヶ一-龠]/.test(h.document.querySelector('.resource').textContent),false);
  h.click('[data-action="home"]');h.click('[data-action="tutorial-start"]');
  assert.equal(/[ぁ-んァ-ヶ一-龠]/.test(h.document.querySelector('#tutorial-guide').textContent),false);
  assert.equal(h.window.SocTutorial.SEARCH_QUERY,'inspection');
  assert.ok(h.window.SOC_DATA.cases.find(c=>c.id==='tutorial-scan').logs.some(log=>log.event.toLowerCase().includes('inspection')));
  h.click('[data-action="tutorial-exit"]');h.click('[data-action="bridge-start"]');
  assert.equal(/[ぁ-んァ-ヶ一-龠]/.test(h.document.querySelector('#bridge-guide').textContent),false);
});
test('language changes stop before reload when current progress cannot be saved',t=>{
  const h=page(t,'en-US');h.click('[data-action="start"]');h.click('[data-action="home"]');
  const write=h.window.localStorage.setItem;
  h.window.localStorage.setItem=(key,value)=>{if(key==='socroom.offline.v2')throw new Error('quota exceeded');write(key,value);};
  const menu=h.document.querySelector('[data-language]');menu.value='ja';menu.dispatchEvent(new h.window.Event('change',{bubbles:true}));
  assert.equal(menu.value,'en');assert.equal(h.document.documentElement.lang,'en');
  assert.equal(h.storage.has('socroom.language.v1'),false,'No preference change after progress save failure');
  assert.match(h.document.querySelector('#toast').textContent,/progress could not be saved/);
});
