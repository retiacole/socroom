'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {messages,localizeScript,prepareModule,japanese}=require('../scripts/localize.js');
const original=require('../src/data.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const source=file=>fs.readFileSync(path.join(__dirname,'../src',file),'utf8');
function runtime(language,withTutorial=false){
  const context={navigator:{languages:[language]}};
  vm.createContext(context);
  const dictionary=messages();
  for(const file of ['data.js','engine.js',...(withTutorial?['tutorial.js']:[])])vm.runInContext(prepareModule(file,source(file),dictionary),context,{filename:file});
  return {E:context.SocEngine,D:context.SOC_DATA,T:context.SocTutorial,context};
}
function prepare(E,c){
  const session=E.createSession(c.scenarioId,c.difficulty,c.id);
  E.requestContact(session,c.id);
  E.advance(session,Math.max(...c.logs.map(log=>log.offset),c.contact.delaySeconds*E.DIFFICULTIES[c.difficulty].replyMultiplier));
  const r=session.records[c.id],a=c.answer;
  r.draft={verdict:a.verdict,priority:a.priorities[0],action:a.actions[0],target:a.target,summary:a.summary,nextStep:a.nextStep};
  for(const group of a.evidenceGroups){
    const id=group.find(value=>E.evidenceAvailable(session,value));
    assert.ok(id,'Available evidence for '+c.id+': '+group.join(', '));
    E.addEvidence(session,c.id,id);
  }
  if(c.response){
    assert.equal(E.assessCase(session,c.id).passed,false,'Isolation completion must still require the response action');
    E.requestIsolation(session,c.id,{target:c.response.target,authorizationId:c.response.authorizationId,reason:c.host+' has verified execution and ongoing traffic within the authorized isolation scope.',impactAcknowledged:true});
    E.advance(session,c.response.delaySeconds);
    assert.equal(E.assessCase(session,c.id).passed,false,'Successful isolation still needs verification');
    E.confirmIsolation(session,c.id);
  }
  return session;
}
function comparableState(session){
  const result=clone(session);
  // Hydration rebuilds translated assessment labels and appends a restore audit entry.
  result.history=result.history.filter(item=>item.type!=='restore');
  for(const r of Object.values(result.records))if(r.assessment)for(const check of r.assessment.checks){delete check.label;delete check.detail;}
  return result;
}

test('source localization preserves interpolation expressions, literal escapes, and user input',()=>{
  const code='const input="user input"; globalThis.result = `日本語${input}:${`内側${2+3}終わり`}\\n` + "単独";';
  const dictionary={'日本語':'English ${literal} `quoted` \\ text','内側':'Inner ','終わり':' End','単独':'Literal'};
  const converted=localizeScript(code,dictionary),context={SocI18n:{t:value=>dictionary[value]}};
  vm.runInNewContext(converted,context);
  assert.equal(context.result,'English ${literal} `quoted` \\ textuser input:Inner 5 End\nLiteral');
  assert.throws(()=>localizeScript('"未登録"',dictionary),/Missing English string/);
});

test('English data preserves original raw logs, identifiers, structural values, and the Japanese source',()=>{
  const before=JSON.stringify(original),{D}=runtime('en-US');
  let rawRecords=0;
  function compare(a,b,key,location){
    if(typeof a==='string'){
      if(key==='raw'){rawRecords++;assert.equal(b,a,location);}
      else if(!japanese(a))assert.equal(b,a,location);
      return;
    }
    if(Array.isArray(a)){assert.equal(b.length,a.length,location);a.forEach((value,i)=>compare(value,b[i],null,location+'['+i+']'));return;}
    if(a&&typeof a==='object'){assert.deepEqual(Object.keys(b),Object.keys(a),location);for(const name of Object.keys(a))compare(a[name],b[name],name,location+'.'+name);return;}
    assert.equal(b,a,location);
  }
  compare(original,D,null,'data');
  assert.ok(rawRecords>100,'All case log records must be covered');
  assert.equal(JSON.stringify(original),before,'Localizing must not mutate the original Japanese data');
  assert.notEqual(D.cases[0].title,original.cases[0].title,'Learner-facing content is actually translated');
});

test('all 22 English report examples pass with original evidence and survive Japanese/English import',()=>{
  const en=runtime('en-US'),ja=runtime('ja-JP');
  assert.equal(en.D.cases.length,22);
  for(const c of en.D.cases){
    const session=prepare(en.E,c),result=en.E.submitCase(session,c.id);
    assert.equal(result.passed,true,c.id+': '+result.checks.filter(check=>!check.passed).map(check=>check.id).join(', '));
    assert.equal(result.score,100,c.id);
    const japaneseSave=ja.E.hydrate(clone(session));
    assert.equal(japaneseSave.phase,'completed',c.id);
    assert.deepEqual(comparableState(japaneseSave),comparableState(session),c.id+' preserves English answers and response state in Japanese');
    const englishAgain=en.E.hydrate(clone(japaneseSave));
    assert.deepEqual(comparableState(englishAgain),comparableState(session),c.id+' survives round-trip import');
  }
});

test('Japanese reports, user notes, and completion survive import into English',()=>{
  const en=runtime('en-US'),ja=runtime('ja-JP');
  for(const c of ja.D.cases){
    const session=prepare(ja.E,c);
    session.records[c.id].draft.summary+=' / 原文を保存: ${literal} <tag> English';
    const result=ja.E.submitCase(session,c.id);
    assert.equal(result.passed,true,c.id);
    const restored=en.E.hydrate(clone(session));
    assert.equal(restored.phase,'completed',c.id);
    assert.deepEqual(comparableState(restored),comparableState(session),c.id+' retains Japanese free text and completion');
  }
});

test('English handoff checks recognize recipients without accepting incidental pronouns or substrings',()=>{
  const {E,D}=runtime('en-US'),c=D.cases[0],session=prepare(E,c);
  const recipientCheck=value=>{session.records[c.id].draft.nextStep=value;return E.assessCase(session,c.id).checks.find(check=>check.id==='nextStep').passed;};
  for(const text of ['Ask the owner to verify the record.','The SOC will review the evidence.','Hand off to CSIRT.','Ask the IT team to confirm.','Contact the service desk.','担当者へ引き継ぐ。'])assert.equal(recipientCheck(text),true,text);
  for(const text of ['Check it later.','Investigate associated activity.','Revisit the priority.','Continue checking.'])assert.equal(recipientCheck(text),false,text);
});

test('the English tutorial query matches the intended record without modifying its original log',()=>{
  const en=runtime('en-US',true),ja=runtime('ja-JP',true),c=en.E.getCase(en.T.CASE_ID);
  assert.equal(en.T.SEARCH_QUERY,'inspection');
  const found=c.logs.filter(log=>[log.raw,log.event,log.id,log.host,log.user,log.ip,log.source].join(' ').toLowerCase().includes(en.T.SEARCH_QUERY));
  assert.ok(found.some(log=>log.id===en.T.PRIMARY_LOG_ID));
  const raw=ja.E.getCase(ja.T.CASE_ID).logs.find(log=>log.id===ja.T.PRIMARY_LOG_ID).raw;
  assert.equal(c.logs.find(log=>log.id===en.T.PRIMARY_LOG_ID).raw,raw);
  const nextStep=en.T.STEPS.find(step=>step.field==='nextStep');
  assert.ok(nextStep.example.length>0);
  const session=prepare(en.E,c);
  session.records[c.id].draft.summary=en.T.STEPS.find(step=>step.field==='summary').example;
  session.records[c.id].draft.nextStep=nextStep.example;
  assert.equal(en.E.assessCase(session,c.id).passed,true,'Tutorial examples must satisfy the English structural checks');
});
