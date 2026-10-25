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

test('twenty-one cases have exclusive difficulty membership, independent evidence and consistent UTC observations', () => {
  assert.equal(D.version,'socroom-2');
  assert.equal(D.cases.length,21);
  assert.equal(D.scenarios.length,5);
  const allIds=new Set(),allCases=new Set(),rawEvents=new Set();
  for(const pack of D.scenarios){
    assert.equal(pack.caseIds.length,pack.id==='tutorial'?1:5);
    assert.ok(['low','medium','high'].includes(pack.difficulty));
    const cases=pack.caseIds.map(id=>D.cases.find(c=>c.id===id));
    assert.ok(cases.every(c=>c&&c.scenarioId===pack.id&&c.difficulty===pack.difficulty));
    for(const c of cases){assert.equal(allCases.has(c.id),false,'no case shared across packs');allCases.add(c.id);}
    if(!pack.hidden)assert.deepEqual(cases.map(c=>c.answer.verdict).sort(),['benign','benign','incident','incident','unknown']);
  }
  assert.equal(allCases.size,21);
  for(const c of D.cases){
    const ownIds=new Set([...c.logs.map(l=>l.id),...c.documents.map(d=>d.id),c.contact.replyId]);
    assert.equal(ownIds.size,c.logs.length+c.documents.length+1);
    for(const id of ownIds){assert.ok(!allIds.has(id),`duplicate ${id}`);allIds.add(id);}
    const hosts=new Set([c.host,...(c.relatedHosts||[])]);
    for(const host of hosts)assert.ok(D.assets.some(a=>a.name===host),host);
    for(const log of c.logs){
      assert.ok(log.raw.includes(`T${log.time}Z`),`timestamp ${log.id}`);
      assert.ok(hosts.has(log.host),`undeclared related host ${log.id}`);
      assert.ok(log.raw.includes(`host=${log.host}`),`host ${log.id}`);
      assert.match(log.path,/^\/var\/log\//);
      assert.ok(log.offset>=0);
      assert.equal(rawEvents.has(log.raw),false,'no copied log across problems');rawEvents.add(log.raw);
    }
    assert.equal(c.answer.target,c.host);
    assert.ok(c.answer.evidenceGroups.length>={low:2,medium:3,high:4}[c.difficulty]);
    const independent=new Set();
    for(const group of c.answer.evidenceGroups){
      assert.ok(group.length&&group.every(id=>ownIds.has(id)),c.id);
      for(const id of group){assert.equal(independent.has(id),false,'one fact cannot satisfy two independent groups');independent.add(id);}
    }
    assert.ok(c.answer.priorities.every(x=>['low','medium','high'].includes(x)));
    assert.ok(c.answer.actions.every(x=>['escalate','contain','monitor','close'].includes(x)));
    assert.ok(c.logs.length>={low:7,medium:11,high:15}[c.difficulty]);
    if(c.difficulty==='high')assert.ok(new Set(c.logs.map(l=>l.host)).size>=2,'advanced investigation spans multiple hosts');
  }
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
    assert.ok(Buffer.byteLength(first)<1024*1024);
  } finally {fs.rmSync(folder,{recursive:true,force:true});}
});
