'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixtureCase(id, verdict, critical) {
  return {
    id, scenarioId: 'shift', title: '調査 ' + id, host: 'host-' + id, critical,
    logs: [
      { id: id + '-early', offset: 0, time: '09:00:00', event: '先行記録', source: 'auth', raw: 'user logged in ' + id },
      { id: id + '-future', offset: 60, time: '09:01:00', event: '後続記録', source: 'auth', raw: 'privilege operation ' + id }
    ],
    documents: [{ id: id + '-doc', title: '資産情報', body: '管理対象', kind: 'asset' }],
    contact: { replyId: id + '-reply', replyTitle: '担当者の回答', replyText: '操作を確認', delaySeconds: 30 },
    answer: { verdict, priorities: ['high'], actions: [verdict === 'benign' ? 'close' : 'escalate'], target: 'host-' + id, evidenceGroups: [[id + '-early'], [id + '-doc', id + '-reply']], summary: '模範要約・非公開', nextStep: '模範対応・非公開' }
  };
}
const DATA = { version: 'socroom-1', company: { name: '架空企業' }, scenarios: [{ id: 'shift', title: '監視勤務', caseIds: ['a', 'b', 'c'] }], cases: [fixtureCase('a', 'incident', true), fixtureCase('b', 'benign', false), fixtureCase('c', 'unknown', true)] };
const sandbox = { SOC_DATA: DATA };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8'), sandbox);
const E = sandbox.SocEngine;
function solve(session, id, engine = E, data = DATA) {
  const c = data.cases.find(item => item.id === id);
  const r = session.records[id];
  r.draft = { verdict: c.answer.verdict, priority: c.answer.priorities[0], action: c.answer.actions[0], target: c.answer.target, summary: c.answer.target + ' の記録を照合した。影響を継続調査する。', nextStep: '担当者へ引き継ぎ、未確認の操作を調べる。' };
  for (const group of c.answer.evidenceGroups) {
    const id = group.find(ref => engine.evidenceAvailable(session, ref));
    assert.ok(id, 'available evidence for ' + c.id + ': ' + group.join(', '));
    engine.addEvidence(session, c.id, id);
  }
  if (c.response) {
    assert.equal(engine.submitCase(session, c.id).passed, false, 'a complete report alone cannot finish the response exercise');
    assert.equal(engine.requestIsolation(session, c.id, {
      target: c.response.target, authorizationId: c.response.authorizationId,
      reason: c.response.target + ' の実行・通信記録と承認範囲を照合し、拡大を防ぐため隔離する。', impactAcknowledged: true
    }), true);
    assert.equal(engine.isolationState(session, c.id).status, 'pending');
    engine.advance(session, c.response.delaySeconds);
    assert.equal(engine.isolationState(session, c.id).status, 'succeeded');
    assert.equal(engine.submitCase(session, c.id).passed, false, 'a successful action still requires result confirmation');
    assert.equal(engine.confirmIsolation(session, c.id), true);
  }
  return engine.submitCase(session, c.id);
}
function json(value) { return JSON.parse(JSON.stringify(value)); }

test('low releases the next case only after a supported successful submission', () => {
  const s = E.createSession('shift', 'low');
  assert.equal(E.activeCases(s).length, 1);
  const failed = E.submitCase(s, 'a');
  assert.equal(failed.passed, false);
  assert.equal(failed.score, 0);
  assert.equal(failed.missingGroups, 2);
  assert.equal(E.activeCases(s).length, 1);
  E.advance(s, 17);
  assert.equal(solve(s, 'a').passed, true);
  assert.equal(s.records.b.arrival, 17);
  assert.equal(E.activeCases(s).length, 2);
  solve(s, 'b'); solve(s, 'c');
  assert.equal(s.phase, 'completed');
  assert.equal(s.records.a.attempts, 2);
});

test('high arrival and evidence publication are enforced at exact boundaries', () => {
  const s = E.createSession('shift', 'high');
  assert.equal(E.activeCases(s).length, 1);
  assert.equal(E.evidenceAvailable(s, 'a-future'), false);
  assert.throws(() => E.addEvidence(s, 'a', 'a-future'), /証拠/);
  assert.throws(() => E.requestContact(s, 'b'), /まだ/);
  E.advance(s, 44.9);
  assert.equal(E.activeCases(s).length, 1);
  E.advance(s, 0.1);
  assert.equal(s.records.b.arrival, 45);
  assert.equal(E.visibleLogs(s).length, 2);
  E.advance(s, 15);
  assert.equal(E.evidenceAvailable(s, 'a-future'), true);
  assert.equal(E.evidenceAvailable(s, 'b-future'), false);
  E.advance(s, 30);
  assert.equal(E.activeCases(s).length, 3);
});

test('contact replies use difficulty delays and cannot be requested twice', () => {
  for (const [difficulty, wait] of [['low', 0], ['medium', 30], ['high', 45]]) {
    const s = E.createSession('shift', difficulty, 'a');
    assert.equal(E.requestContact(s, 'a'), true);
    assert.equal(E.requestContact(s, 'a'), false);
    if (wait) {
      E.advance(s, wait - 0.1);
      assert.equal(E.replyAvailable(s, 'a'), false);
      E.advance(s, 0.1);
    }
    assert.equal(E.replyAvailable(s, 'a'), true);
    E.advance(s, 100);
    assert.equal(s.history.filter(h => h.type === 'contact-reply').length, 1);
  }
});

test('a tick spanning multiple arrivals and replies records their chronological order', () => {
  const s = E.createSession('shift', 'high');
  E.requestContact(s, 'a');
  E.advance(s, 100);
  const times = s.history.map(h => h.at);
  assert.equal(times.every((at, index) => index === 0 || at >= times[index - 1]), true);
});

test('pause, gameover and completion reject edits and stop the clock', () => {
  for (const phase of ['paused', 'gameover', 'completed']) {
    const s = E.createSession('shift', 'medium');
    if (phase === 'paused') E.pause(s);
    if (phase === 'gameover') E.advance(s, 1200);
    if (phase === 'completed') { solve(s, 'a'); solve(s, 'b'); solve(s, 'c'); }
    const at = s.elapsed;
    E.advance(s, 100);
    assert.equal(s.elapsed, at);
    assert.equal(s.phase, phase);
    for (const operation of [() => E.markInvestigating(s, 'a'), () => E.requestContact(s, 'a'), () => E.addEvidence(s, 'a', 'a-early'), () => E.removeEvidence(s, 'a', 'a-early'), () => E.submitCase(s, 'a')]) assert.throws(operation, /再開/);
  }
});

test('deadline is relative to arrival and large ticks stop at earliest unresolved critical deadline', () => {
  const s = E.createSession('shift', 'high');
  solve(s, 'a');
  E.advance(s, 89);
  assert.equal(s.phase, 'running');
  E.advance(s, 2000);
  assert.equal(s.elapsed, 990);
  assert.equal(s.phase, 'gameover');
  assert.equal(s.failure.caseId, 'c');
  assert.equal(s.records.c.arrival, 90);
  const early = E.createSession('shift', 'medium');
  E.advance(early, 1199.99);
  assert.equal(early.phase, 'running');
  E.advance(early, 0.01);
  assert.equal(early.phase, 'gameover');
  assert.equal(early.elapsed, 1200);
});

test('noncritical lateness reduces score without ending the shift', () => {
  const s = E.createSession('shift', 'medium', 'b');
  E.advance(s, 1300);
  assert.equal(s.phase, 'running');
  const assessment = solve(s, 'b');
  assert.equal(assessment.passed, true);
  assert.equal(assessment.score, 90);
  assert.equal(s.phase, 'completed');
});

test('missing independent evidence and unsupported decisions cannot pass', () => {
  const s = E.createSession('shift', 'medium', 'a');
  s.records.a.draft = { verdict: 'incident', priority: 'high', action: 'contain', target: 'host-a', summary: 'host-a の内容', nextStep: '担当者へ連絡' };
  E.addEvidence(s, 'a', 'a-early');
  let result = E.submitCase(s, 'a');
  assert.equal(result.passed, false);
  assert.equal(result.missingGroups, 1);
  assert.equal(result.checks.find(c => c.id === 'action').passed, false);
  E.addEvidence(s, 'a', 'a-doc');
  result = E.submitCase(s, 'a');
  assert.equal(result.passed, false);
  s.records.a.draft.action = 'escalate';
  assert.equal(E.submitCase(s, 'a').passed, true);
  assert.throws(() => E.addEvidence(s, 'a', 'a-doc'), /再開|対応済み/);
});

test('continuing after failure preserves history and disables deadlines', () => {
  const s = E.createSession('shift', 'high');
  E.advance(s, 1000);
  E.continueTraining(s);
  assert.equal(s.phase, 'running');
  assert.equal(E.getDeadline(s, 'a'), null);
  E.advance(s, 2000);
  assert.equal(s.phase, 'running');
  assert.equal(s.failure.at, 900);
  solve(s, 'a'); solve(s, 'b'); solve(s, 'c');
  assert.equal(s.phase, 'completed');
  const restored = E.hydrate(json(s));
  assert.equal(restored.phase, 'completed');
  assert.equal(restored.trainingAfterFailure, true);
});

test('retry rolls back recent replies, evidence and submitted results, and stays paused', () => {
  const s = E.createSession('shift', 'medium');
  E.advance(s, 1100);
  E.requestContact(s, 'b');
  E.advance(s, 30);
  E.addEvidence(s, 'b', 'b-reply');
  solve(s, 'b');
  E.advance(s, 200);
  assert.equal(s.phase, 'gameover');
  E.retryCheckpoint(s);
  assert.equal(s.phase, 'paused');
  assert.equal(s.elapsed, 1020);
  assert.equal(s.records.b.requestAt, null);
  assert.equal(s.records.b.evidenceIds.includes('b-reply'), false);
  assert.equal(s.records.b.submission, null);
  assert.equal(s.records.b.status, 'investigating');
  assert.equal(s.records.b.resolvedAt, null);
  assert.equal(s.failure, null);
  assert.equal(E.hydrate(json(s)).phase, 'paused');
  E.resume(s);
  E.advance(s, 179);
  assert.equal(s.phase, 'running');
  E.advance(s, 1);
  assert.equal(s.phase, 'gameover');
});

test('valid saves round-trip all phases and never automatically resume', () => {
  for (const difficulty of ['low', 'medium', 'high']) {
    const s = E.createSession('shift', difficulty);
    E.requestContact(s, 'a');
    E.advance(s, 100);
    solve(s, 'a');
    const restored = E.hydrate(json(s));
    assert.equal(restored.phase, 'paused');
    assert.equal(restored.records.a.status, 'resolved');
    assert.equal(restored.records.a.assessment.score, 100);
    assert.equal(restored.elapsed, 100);
    E.resume(restored);
    solve(restored, 'b'); solve(restored, 'c');
    assert.equal(E.hydrate(JSON.stringify(restored)).phase, 'completed');
  }
  const s = E.createSession('shift', 'medium');
  E.advance(s, 1200);
  const restored = E.hydrate(json(s));
  assert.equal(restored.phase, 'gameover');
  assert.equal(restored.failure.at, 1200);
});

test('save import rejects future/unknown evidence, invalid values, oversized inputs and fake completion', () => {
  const original = E.createSession('shift', 'high');
  for (const change of [
    s => { s.records.a.evidenceIds = ['a-future']; },
    s => { s.records.a.evidenceIds = ['b-doc']; },
    s => { s.records.a.evidenceIds = ['nonexistent']; },
    s => { s.records.a.draft.action = 'execute'; },
    s => { s.records.a.draft.summary = 'x'.repeat(4001); },
    s => { s.records.a.requestAt = 10; },
    s => { s.records.b.arrival = 0; },
    s => { s.records.a.attempts = -1; },
    s => { s.elapsed = Infinity; },
    s => { s.trainingAfterFailure = true; },
    s => { s.version = 'unknown'; },
    s => { s.records.foreign = {}; }
  ]) {
    const invalid = json(original);
    change(invalid);
    assert.throws(() => E.hydrate(invalid));
  }
  assert.throws(() => E.hydrate('x'.repeat(1000001)), /大きすぎ/);
  assert.throws(() => E.hydrate('{invalid'), /JSON/);
  const fake = json(original);
  fake.phase = 'completed';
  fake.records.a.status = 'resolved';
  fake.records.a.assessment = { passed: true, score: 100 };
  const restored = E.hydrate(fake);
  assert.equal(restored.phase, 'paused');
  assert.equal(restored.records.a.status, 'open');
  assert.equal(restored.records.a.assessment, null);
});

test('a forged passed assessment is recalculated from its submitted evidence', () => {
  const s = E.createSession('shift', 'medium', 'a');
  solve(s, 'a');
  const saved = json(s);
  saved.records.a.submission.evidenceIds = ['a-early'];
  const restored = E.hydrate(saved);
  assert.equal(restored.phase, 'paused');
  assert.equal(restored.records.a.assessment.passed, false);
  assert.equal(restored.records.a.status, 'investigating');
});

test('a saved submission cannot cite evidence published after its submission time', () => {
  const s = E.createSession('shift', 'medium', 'a');
  E.requestContact(s, 'a');
  E.advance(s, 100);
  solve(s, 'a');
  for (const lateId of ['a-future', 'a-reply']) {
    const saved = json(s);
    saved.records.a.submission.at = 10;
    saved.records.a.submission.evidenceIds.push(lateId);
    assert.throws(() => E.hydrate(saved), /まだ確認できない/);
  }
});

test('a critical submission at or after its deadline needs a prior training transition', () => {
  const s = E.createSession('shift', 'medium', 'a');
  solve(s, 'a');
  for (const at of [1200, 1300]) {
    const saved = json(s);
    saved.elapsed = at;
    saved.records.a.submission.at = at;
    assert.throws(() => E.hydrate(saved), /期限後の提出/);
  }
  const training = E.createSession('shift', 'medium', 'a');
  E.advance(training, 1200);
  E.continueTraining(training);
  solve(training, 'a');
  assert.equal(E.hydrate(json(training)).phase, 'completed');
});

test('late submission score remains unchanged when unlimited training is restored', () => {
  const s = E.createSession('shift', 'high');
  solve(s, 'a');
  E.advance(s, 950);
  assert.equal(solve(s, 'b').score, 90);
  E.advance(s, 100);
  E.continueTraining(s);
  const restored = E.hydrate(json(s));
  assert.equal(restored.records.b.assessment.score, 90);
  assert.equal(restored.phase, 'paused');
});

test('report contains analyst evidence and no model answer or unreleased log', () => {
  const s = E.createSession('shift', 'high');
  s.records.a.draft.summary = '自分の調査メモ';
  E.addEvidence(s, 'a', 'a-early');
  const report = E.report(s);
  assert.match(report, /自分の調査メモ/);
  assert.match(report, /user logged in a/);
  assert.doesNotMatch(report, /模範要約|模範対応|privilege operation|調査 b/);
});

test('report uses the shared UI labels for each difficulty, verdict and action', () => {
  for (const difficulty of ['low', 'medium', 'high']) {
    const s = E.createSession('shift', difficulty);
    for (const verdict of ['incident', 'benign', 'unknown']) {
      for (const action of ['escalate', 'contain', 'close', 'monitor']) {
        s.records.a.draft = { ...s.records.a.draft, verdict, priority: difficulty, action };
        const lines = E.report(s).split('\n');
        assert.ok(lines.includes('勤務: 監視勤務'));
        assert.ok(lines.includes('難易度: ' + E.LABELS[difficulty]));
        assert.ok(lines.includes('判定: ' + E.LABELS[verdict]));
        assert.ok(lines.includes('優先度: ' + E.LABELS[difficulty]));
        assert.ok(lines.includes('対応: ' + E.LABELS[action]));
      }
    }
  }
});

test('ticks do not create endless history and negative time is rejected', () => {
  const s = E.createSession('shift', 'low', 'a');
  const length = s.history.length;
  for (let i = 0; i < 1000; i++) E.advance(s, 0.1);
  assert.equal(s.history.length, length);
  assert.throws(() => E.advance(s, -1));
  assert.throws(() => E.advance(s, NaN));
});

test('production dataset preserves fifteen normal cases and supports all twenty-two saved cases', () => {
  const data = require('../src/data.js'), engine = require('../src/engine.js');
  assert.equal(data.cases.length, 22);
  assert.equal(data.cases.filter(c=>['low','medium','high'].includes(c.scenarioId)).length,15);
  assert.equal(data.scenarios.length,5);
  for (const pack of data.scenarios) {
    const individual = pack.id === 'tutorial';
    const s = engine.createSession(pack.id, pack.difficulty, individual ? pack.caseIds[0] : null);
    assert.equal(Object.keys(s.records).length, individual ? 1 : pack.id==='bridge'?6:5);
    for (const id of pack.caseIds) {
      while (s.records[id].arrival === null) engine.advance(s, 45);
      if(engine.getCase(id).response)assert.equal(engine.getDeadline(s,id),null,'sixth bridge case has no deadline');
      engine.requestContact(s, id);
      const delay = engine.getCase(id).contact.delaySeconds * engine.DIFFICULTIES[pack.difficulty].replyMultiplier;
      engine.advance(s, delay);
      assert.equal(solve(s, id, engine, data).passed, true);
    }
    assert.equal(s.phase, 'completed');
    const restored=engine.hydrate(JSON.stringify(s));
    assert.equal(restored.phase, 'completed');
    for(const id of pack.caseIds.filter(id=>engine.getCase(id).response)){
      assert.equal(engine.isolationState(restored,id).status,'succeeded');
      assert.notEqual(engine.isolationState(restored,id).confirmedAt,null);
    }
    for (const other of ['low','medium','high'].filter(d => d !== pack.difficulty)) {
      assert.throws(() => engine.createSession(pack.id, other), /問題セット/);
      const altered = json(s);altered.difficulty = other;
      assert.throws(() => engine.hydrate(altered), /問題セット/);
    }
  }
});

test('difficulty packs reject cross-pack cases and old saves instead of silently changing their questions', () => {
  const data = require('../src/data.js'), engine = require('../src/engine.js');
  const medium = data.scenarios.find(s => s.id === 'medium');
  assert.throws(() => engine.createSession('low','low',medium.caseIds[0]), /シナリオにない/);
  const s = engine.createSession('low','low');
  s.version = 'socroom-1';
  assert.throws(() => engine.hydrate(s), /対応していない/);
});
