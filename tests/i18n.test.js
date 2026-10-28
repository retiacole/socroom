'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/i18n.js'),'utf8');
const L=require('../scripts/localize.js');
function locale(navigator,saved,blocked=false){
  const values=new Map(saved===undefined?[]:[['socroom.language.v1',saved]]),writes=[];
  const context={navigator,SOC_MESSAGES:{'確認':'Confirm'},localStorage:{getItem:key=>{if(blocked)throw new Error('blocked');return values.get(key)??null;},setItem:(key,value)=>{if(blocked)throw new Error('blocked');values.set(key,value);writes.push([key,value]);}}};
  vm.runInNewContext(source,context);return {i18n:context.SocI18n,values,writes};
}
test('the first preferred browser language determines Japanese or English, without persisting a default',()=>{
  const cases=[
    [{languages:['ja-JP','en-US'],language:'en-US'},'ja'],
    [{languages:['JA-jp'],language:'en-US'},'ja'],
    [{languages:['en-US','ja-JP'],language:'ja-JP'},'en'],
    [{languages:['fr-FR','ja'],language:'ja'},'en'],
    [{languages:['th-TH']},'en'],
    [{languages:['zh-Hant']},'en'],
    [{languages:[],language:'ja'},'ja'],
    [{languages:['',null,'  ja-JP  ']},'ja'],
    [{language:'ja-JP'},'ja'],[{},'en'],[undefined,'en'],
    [{get languages(){throw new Error('denied');},language:'ja-JP'},'ja']
  ];
  for(const [browser,expected] of cases){const result=locale(browser);assert.equal(result.i18n.locale,expected);assert.deepEqual(result.writes,[]);}
});
test('explicit Japanese and English choices win; invalid or unavailable storage falls back to the browser',()=>{
  assert.equal(locale({language:'en-US'},'ja').i18n.locale,'ja');
  assert.equal(locale({language:'ja-JP'},'en').i18n.locale,'en');
  assert.equal(locale({language:'ja-JP'},'th').i18n.locale,'ja');
  assert.equal(locale({language:'ja-JP'},undefined,true).i18n.locale,'ja');
  const result=locale({language:'en-US'});assert.equal(result.i18n.persist('ja'),true);assert.equal(result.values.get('socroom.language.v1'),'ja');assert.equal(result.i18n.persist('th'),false);
  assert.equal(locale({language:'en'},undefined,true).i18n.persist('ja'),false);
});
test('localizing bundled content preserves original raw evidence and IDs',()=>{
  const original={id:'case-1',title:'確認',logs:[{id:'event-1',event:'確認',raw:'確認'}]};
  const localized=locale({language:'en'}).i18n.localize(original);
  assert.equal(localized.title,'Confirm');assert.equal(localized.logs[0].event,'Confirm');
  assert.equal(localized.id,'case-1');assert.equal(localized.logs[0].raw,'確認');assert.equal(original.title,'確認');
});
test('AST localization preserves expressions, literal escapes, HTML and regular expressions',()=>{
  const original='const n=7; globalThis.result=`<p title="確認">確認 ${n} \\${literal}</p>`; globalThis.regex=/確認/.source; globalThis.label="確認";';
  const dictionary={'<p title="確認">確認 ':'<p title="Confirm">Confirm ','確認':'Confirm'};
  const transformed=L.localizeScript(original,dictionary);
  const context={SocI18n:{t:value=>dictionary[value]??value}};vm.runInNewContext(transformed,context);
  assert.equal(context.result,'<p title="Confirm">Confirm 7 ${literal}</p>');
  assert.equal(context.regex,'確認');assert.equal(context.label,'Confirm');
});
test('new untranslated prose fails the build while raw evidence is intentionally exempt',()=>{
  assert.throws(()=>L.localizeScript('const title="未翻訳";',{}),/Missing English string/);
  assert.throws(()=>L.validateData({title:'未翻訳'},{}),/Missing English data/);
  assert.doesNotThrow(()=>L.validateData({raw:'原本'},{}));
});
