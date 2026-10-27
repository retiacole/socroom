'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../src/engine.js');
const clone=x=>JSON.parse(JSON.stringify(x));
function solve(s,id){const c=E.getCase(id),r=s.records[id];E.requestContact(s,id,'specific');E.advance(s,150);for(const group of c.answer.evidenceGroups)E.addEvidence(s,id,group.find(x=>E.evidenceAvailable(s,x)));r.draft={verdict:c.answer.verdict,priority:c.answer.priorities[0],action:c.answer.actions[0],target:c.answer.target,summary:c.answer.summary,nextStep:c.answer.nextStep};return E.submitCase(s,id);}
test('untimed single practice preserves publication delays, scores without a deadline and reloads late submissions',()=>{
 for(const [difficulty,id] of [['medium','medium-mfa-fatigue'],['high','high-pipeline']]){
  const s=E.createSession(difficulty,difficulty,id,{kind:'single',untimed:true});
  assert.equal(E.getDeadline(s,id),null);E.requestContact(s,id,'specific');assert.equal(E.replyAvailable(s,id,'specific'),false);
  if(difficulty==='high'){const later=E.getCase(id).logs.find(l=>l.offset>0);assert.equal(E.evidenceAvailable(s,later.id),false);}
  E.advance(s,1800);assert.equal(s.phase,'running');assert.equal(solve(s,id).score,100);assert.equal(s.phase,'completed');
  const restored=E.hydrate(clone(s));assert.equal(restored.phase,'completed');assert.deepEqual(restored.practice,{kind:'single',untimed:true});assert.equal(restored.records[id].assessment.score,100);assert.match(E.report(restored),/最初から時間制限なし/);
 }
});
test('parallel practice has exactly two independently investigated simultaneous cases',()=>{
 const s=E.createSession('medium','medium',null,{kind:'parallel',untimed:true});
 assert.deepEqual(E.activeCases(s).map(c=>c.id),[...E.PARALLEL_CASE_IDS]);assert.equal(E.visibleLogs(s).length,224);
 const [first,second]=E.PARALLEL_CASE_IDS;E.requestContact(s,first,'specific');assert.equal(E.replyAvailable(s,first,'specific'),false);assert.equal(s.records[second].requestAt,null);
 E.advance(s,1300);assert.equal(s.phase,'running');assert.equal(solve(s,second).passed,true);assert.equal(s.phase,'running');assert.equal(solve(s,first).passed,true);assert.equal(s.phase,'completed');assert.equal(E.hydrate(clone(s)).phase,'completed');
 const timed=E.createSession('medium','medium',null,{kind:'parallel',untimed:false});assert.equal(E.getDeadline(timed,first),1200);E.advance(timed,1200);assert.equal(timed.phase,'gameover');assert.equal(E.hydrate(clone(timed)).phase,'gameover');
});
test('new modes reject inconsistent settings and cannot fabricate untimed failure histories',()=>{
 assert.throws(()=>E.createSession('medium','medium',null,{kind:'single',untimed:true}),/単独/);
 assert.throws(()=>E.createSession('high','high',null,{kind:'parallel',untimed:true}),/並行/);
 assert.throws(()=>E.createSession('medium','medium',null,{kind:'parallel',untimed:'yes'}),/設定/);
 const s=E.createSession('medium','medium',null,{kind:'parallel',untimed:true});const extra=clone(s);extra.records['medium-oauth-consent']={};assert.throws(()=>E.hydrate(extra),/ケース一覧/);
 const failed=E.createSession('medium','medium','medium-mfa-fatigue');E.advance(failed,1200);failed.practice={kind:'single',untimed:true};assert.throws(()=>E.hydrate(failed),/期限超過/);
 const old=E.createSession('medium','medium','medium-mfa-fatigue');assert.equal(E.hydrate(clone(old)).practice,undefined);assert.equal(E.getDeadline(old,old.selectedCaseId),1200);
});
