'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const os = require('node:os');
const root = path.resolve(__dirname,'..');
const D = require('../src/data.js');
const missingAssertions = new Set(['not_observed','not_collected','not_logged','not_received','not_recorded','not_in_suite','unknown','none']);
function assertObservedValues(value,id){
  if(value&&typeof value==='object')Object.values(value).forEach(item=>assertObservedValues(item,id));
  else if(typeof value==='string')assert.equal(missingAssertions.has(value),false,`no answer-bearing missing value ${id}`);
}

test('twenty-one cases keep disjoint packs, valid source evidence, realistic formats and actionable targets', () => {
  assert.equal(D.version,'socroom-3');
  assert.equal(D.releaseVersion,require('../package.json').version);
  assert.equal(D.cases.length,21);
  assert.equal(D.scenarios.length,5);
  const allIds=new Set(),allCases=new Set(),rawEvents=new Set(),formats=new Set();
  for(const pack of D.scenarios){
    assert.equal(pack.caseIds.length,pack.id==='tutorial'?1:5);
    assert.ok(['low','medium','high'].includes(pack.difficulty));
    const cases=pack.caseIds.map(id=>D.cases.find(c=>c.id===id));
    assert.ok(cases.every(c=>c&&c.scenarioId===pack.id&&c.difficulty===pack.difficulty));
    for(const c of cases){assert.equal(allCases.has(c.id),false,'no case shared across packs');allCases.add(c.id);}
    if(!pack.hidden)for(const verdict of ['benign','incident'])assert.ok(cases.some(c=>c.answer.verdict===verdict),`${pack.id} practices both authorized and incident findings`);
  }
  assert.equal(allCases.size,21);
  for(const c of D.cases){
    const firstObserved=c.logs.filter(log=>!log.background).map(log=>log.time).sort()[0];
    for(const log of c.logs.filter(log=>log.background&&log.host===c.host)){
      assert.ok(log.time<firstObserved, `baseline must not fabricate target activity after an outage/loss: ${log.id}`);
    }
    const questions=c.contact.questions || [c.contact];
    const ownIds=new Set([...c.logs.map(l=>l.id),...c.documents.map(d=>d.id),...questions.map(q=>q.replyId)]);
    assert.equal(ownIds.size,c.logs.length+c.documents.length+questions.length,c.id);
    for(const id of ownIds){assert.ok(!allIds.has(id),`duplicate ${id}`);allIds.add(id);}
    for(const host of [c.host,...(c.relatedHosts||[]),...(c.backgroundHosts||[])])assert.ok(D.assets.some(a=>a.name===host),host);
    for(const log of c.logs){
      assert.match(log.time,/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/,`normalized UTC time ${log.id}`);
      assert.ok(log.raw.includes(log.time),`raw timestamp matches normalized time ${log.id}`);
      if(log.host)assert.ok(D.assets.some(a=>a.name===log.host),`asset ${log.id}`);
      assert.match(log.path,/^\/var\/log\//);
      assert.ok(Number.isFinite(log.offset)&&log.offset>=0&&log.offset<900,`arrival before high deadline ${log.id}`);
      assert.ok(log.raw.length&&!/[\r\n]/.test(log.raw),'one event remains one terminal line');
      assert.equal(rawEvents.has(log.raw),false,'no copied log across problems');rawEvents.add(log.raw);
      if(c.scenarioId!=='tutorial'){
        assert.ok(log.format&&log.format.includes('合成'),`synthetic format disclosed ${log.id}`);
        formats.add(log.format);
        assert.doesNotMatch(log.raw,/\b\w+=(?:not_observed|not_collected|not_logged|not_received|not_recorded|not_in_suite|unknown|none)\b/,`no answer-bearing missing fields ${log.id}`);
      }
      assert.ok(!['OS監査','ファイル監査','認証'].includes(log.source),`source name normalized ${log.id}`);
      if(log.raw.startsWith('{')){
        let parsed;assert.doesNotThrow(()=>{parsed=JSON.parse(log.raw);},`valid JSON ${log.id}`);
        if(c.scenarioId!=='tutorial')assertObservedValues(parsed,log.id);
      }
      if(log.format?.includes('Windows Security')){
        assert.match(log.raw,/<Event\b/);assert.match(log.raw,/<EventID>\d+<\/EventID>/);
        assert.match(log.raw,/SystemTime="2026-10-20T/);
      }
      if(log.format?.includes('nginx combined'))assert.match(log.raw,/\[20\/Oct\/2026:\d\d:\d\d:\d\d \+0000\] "(?:GET|POST|HEAD) /);
      if(log.format?.includes('OpenSSH'))assert.match(log.raw,/sshd\[\d+\]:/);
      if(log.path==='/var/log/auth.log')assert.ok(c.scenarioId==='tutorial'||log.format?.includes('OpenSSH'),'auth.log contains actual sshd-shaped observations');
    }
    if(c.scenarioId!=='tutorial'){
      assert.ok(['host','account','application'].includes(c.targetType),c.id);
      assert.ok(c.targets?.some(t=>t.value===c.answer.target&&t.label),`selectable target ${c.id}`);
      assert.equal(new Set(c.targets.map(t=>t.value)).size,c.targets.length);
      const expected=c.scenarioId==='bridge'?({guided:0,checklist:50,independent:75}[c.bridge.stage]):({low:50,medium:100,high:180}[c.difficulty]);
      assert.equal(c.logs.filter(l=>l.background===true).length,expected,`background observations ${c.id}`);
      if(c.bridge?.stage!=='guided'){
        assert.deepEqual(questions.map(q=>q.id).sort(),['leading','specific','vague']);
        assert.equal(questions.find(q=>q.id==='specific').replyId,c.contact.replyId);
        assert.ok(questions.every(q=>q.question&&q.replyText&&Number.isFinite(q.delaySeconds)));
      }
    }
    const independent=new Set();
    assert.ok(c.answer.evidenceGroups.length>={low:2,medium:3,high:4}[c.difficulty]);
    for(const group of c.answer.evidenceGroups){
      assert.ok(group.length&&group.every(id=>ownIds.has(id)),c.id);
      for(const id of group){assert.equal(independent.has(id),false,'one fact cannot satisfy two independent groups');independent.add(id);}
    }
    assert.equal(c.logs.filter(l=>l.background&&independent.has(l.id)).length,0,'generated background cannot satisfy required evidence');
    assert.ok(c.answer.priorities.every(x=>['low','medium','high'].includes(x)));
    assert.ok(c.answer.actions.every(x=>['escalate','contain','monitor','close'].includes(x)));
    assert.ok(c.logs.filter(l=>!l.background).length>={low:7,medium:11,high:15}[c.difficulty]);
    if(c.difficulty==='high'){
      assert.ok(new Set(c.logs.filter(l=>!l.background).map(l=>l.host).filter(Boolean)).size>=2,'advanced investigation spans multiple hosts');
      assert.ok(c.logs.some(l=>!l.background&&l.offset>0),'advanced cases have later arrivals');
    }
  }
  for(const expected of ['Windows Security','nginx combined','OpenSSH','Entra','M365','SOCroom JSON'])assert.ok([...formats].some(f=>f.includes(expected)),expected+' is represented');
  assert.ok(D.cases.some(c=>c.answer.verdict==='benign'&&c.answer.actions.includes('monitor')),'benign is not synonymous with closing');
  assert.ok(D.cases.some(c=>c.answer.verdict==='unknown'&&c.answer.actions.includes('contain')),'unknown can still require protective action');
  assert.ok(D.cases.some(c=>c.answer.verdict==='incident'&&c.answer.actions.length===1&&c.answer.actions[0]==='escalate'),'response respects operating authority');
  assert.ok(D.cases.filter(c=>c.targetType==='account').every(c=>c.answer.target!==c.host),'identity cases target accounts rather than their logging server');
  assert.deepEqual(D.cases.find(c=>c.id==='high-export').answer.evidenceGroups[1],['hi-ex-doc-visibility'],'unknown finding requires collection-scope evidence');
});

test('single HTML build is deterministic, syntactically valid and contains no external runtime resources',()=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'socroom-release-'));
  try{
    const target=path.join(folder,'socroom.html');
    execFileSync(process.execPath,[path.join(root,'build.js'),target]);
    const first=fs.readFileSync(target,'utf8');
    execFileSync(process.execPath,[path.join(root,'build.js'),target]);
    assert.equal(first,fs.readFileSync(target,'utf8'));
    assert.ok(!/\/\*__[A-Z]+__\*\//.test(first));
    assert.ok(first.includes("connect-src 'none'"));
    assert.ok(first.includes('Copyright (c) 2026 Logroom contributors'));
    assert.ok(!/<(?:script|link|img|iframe)\b[^>]*(?:src|href)=\s*["'](?:https?:|\/\/)/i.test(first));
    assert.ok(!/@import|url\(\s*["']?(?:https?:|\/\/)/i.test(first));
    const scripts=[...first.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length,7);
    scripts.forEach((match,i)=>new vm.Script(match[1],{filename:'inline-'+i}));
    assert.ok(Buffer.byteLength(first)<8*1024*1024,'offline build stays below 8 MiB with all background logs');
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});
