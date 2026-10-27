'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ID = 'response-endpoint-isolation';
const clone = value => JSON.parse(JSON.stringify(value));
const response = {
  kind: 'endpoint-isolation', target: 'design-lt-014', authorizationId: 'IR-ENDPOINT-04', delaySeconds: 45,
  requiredEvidenceGroups: [['rsp-doc-assets'], ['rsp-log-exec'], ['rsp-log-net-latest', 'rsp-log-future'], ['rsp-doc-procedure']]
};
function fixture(id, isolation = false) {
  const host = isolation ? response.target : 'ordinary-host';
  const logs = isolation ? [
    { id: 'rsp-log-exec', offset: 0, raw: 'design-lt-014 process executed' },
    { id: 'rsp-log-net-latest', offset: 0, raw: 'design-lt-014 still communicating after file quarantine' },
    { id: 'rsp-log-future', offset: 60, raw: 'later communication record' }
  ] : [{ id: 'ordinary-log', offset: 0, raw: 'ordinary-host event' }];
  const documents = isolation ? ['assets', 'procedure', 'change'].map(name => ({ id: 'rsp-doc-' + name, title: name, body: 'design-lt-014 / IR-ENDPOINT-04' })) : [{ id: 'ordinary-doc', title: 'Asset', body: host }];
  return {
    id, scenarioId: isolation ? 'response' : 'ordinary', title: isolation ? '端末隔離' : '通常の調査', host, critical: true, logs, documents,
    ...(isolation ? { response } : {}),
    answer: {
      verdict: 'incident', priorities: ['high'], actions: [isolation ? 'contain' : 'escalate'], target: host,
      evidenceGroups: isolation ? [...response.requiredEvidenceGroups, ['rsp-doc-change']] : [['ordinary-log'], ['ordinary-doc']]
    }
  };
}
const data = {
  version: 'socroom-3', company: { name: '架空の教材企業' },
  scenarios: [{ id: 'response', title: '端末隔離の単独演習', standalone: true, caseIds: [ID] }, { id: 'ordinary', title: '通常', caseIds: ['ordinary'] }],
  cases: [fixture(ID, true), fixture('ordinary')]
};
const sandbox = { SOC_DATA: data };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8'), sandbox);
const E = sandbox.SocEngine;
function session(difficulty = 'low') { return E.createSession('response', difficulty); }
function options(overrides = {}) { return { target: response.target, authorizationId: response.authorizationId, reason: '同一プロセスの外部通信が継続しているため隔離する。', impactAcknowledged: true, ...overrides }; }
function prepare(s, id = ID) {
  const c = E.getCase(id);
  for (const group of c.answer.evidenceGroups) E.addEvidence(s, id, group.find(evidenceId => E.evidenceAvailable(s, evidenceId)));
  s.records[id].draft = { verdict: c.answer.verdict, priority: 'high', action: c.answer.actions[0], target: c.host, summary: c.host + ' の実行記録と通信記録を照合した。', nextStep: 'CSIRT担当者へ影響確認と隔離解除条件の判断を引き継ぐ。' };
}
function check(s) { return E.assessCase(s, ID).checks.find(item => item.id === 'response'); }

test('isolation requires the exact authorized target, impact confirmation, a bounded reason and registered evidence', () => {
  const s = session();
  assert.deepEqual(clone(E.isolationState(s, ID)), { status: 'not-requested', target: response.target, requestAt: null, completedAt: null, confirmedAt: null, reason: '', authorizationId: '' });
  assert.throws(() => E.requestIsolation(s, ID, options()), /根拠/);
  prepare(s);
  for (const fields of [
    { target: 'design-lt-041' }, { authorizationId: 'CHG-DESIGN-214' }, { impactAcknowledged: false },
    { reason: '         ' }, { reason: '短すぎる理由' }, { reason: 'x'.repeat(501) }, { reason: 42 }
  ]) {
    assert.throws(() => E.requestIsolation(s, ID, options(fields)));
    assert.equal(s.records[ID].response, undefined);
  }
  E.removeEvidence(s, ID, 'rsp-doc-procedure');
  assert.throws(() => E.requestIsolation(s, ID, options()), /根拠/);
  E.addEvidence(s, ID, 'rsp-doc-procedure');
  assert.equal(E.requestIsolation(s, ID, options({ reason: '  ' + options().reason + '  ' })), true);
  assert.equal(s.records[ID].response.reason, options().reason);
  const requested = clone(s.records[ID].response);
  E.advance(s, 1);
  assert.equal(E.requestIsolation(s, ID, options({ reason: '別の理由で要求を上書きしないことを確認する。' })), false);
  assert.deepEqual(clone(s.records[ID].response), requested);
  assert.equal(s.history.filter(item => item.type === 'isolation-request').length, 1);
});

test('pending and unconfirmed success cannot complete a case, without changing its 100-point scoring', () => {
  const s = session();
  prepare(s);
  assert.equal(E.assessCase(s, ID).score, 100);
  assert.equal(check(s).passed, false);
  assert.throws(() => E.confirmIsolation(s, ID), /待って/);
  E.requestIsolation(s, ID, options());
  E.advance(s, 44.9);
  assert.equal(E.isolationState(s, ID).status, 'pending');
  assert.equal(E.isolationState(s, ID).completedAt, null);
  assert.throws(() => E.confirmIsolation(s, ID), /待って/);
  assert.equal(E.submitCase(s, ID).passed, false);
  assert.equal(s.phase, 'running');
  E.advance(s, 0.1);
  assert.equal(E.isolationState(s, ID).status, 'succeeded');
  assert.equal(E.isolationState(s, ID).completedAt, 45);
  assert.equal(E.submitCase(s, ID).passed, false);
  assert.equal(E.confirmIsolation(s, ID), true);
  assert.equal(E.confirmIsolation(s, ID), false);
  assert.equal(E.isolationState(s, ID).confirmedAt, 45);
  const result = E.submitCase(s, ID);
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
  assert.equal(result.maxScore, 100);
  assert.equal(s.phase, 'completed');
  assert.equal(E.hydrate(clone(s)).phase, 'completed');
  for (const action of [() => E.requestIsolation(s, ID, options()), () => E.confirmIsolation(s, ID)]) assert.throws(action, /再開/);
});

test('pausing or restoring a pending request does not advance isolation or allow confirmation', () => {
  const s = session();
  prepare(s);
  E.requestIsolation(s, ID, options());
  E.advance(s, 20);
  E.pause(s);
  E.advance(s, 1000);
  assert.equal(s.elapsed, 20);
  assert.equal(E.isolationState(s, ID).status, 'pending');
  assert.throws(() => E.requestIsolation(s, ID, options()), /再開/);
  assert.throws(() => E.confirmIsolation(s, ID), /再開/);
  const restored = E.hydrate(clone(s));
  assert.equal(restored.phase, 'paused');
  E.advance(restored, 1000);
  assert.equal(E.isolationState(restored, ID).status, 'pending');
  E.resume(restored);
  E.advance(restored, 25);
  assert.equal(E.isolationState(restored, ID).status, 'succeeded');
  assert.equal(restored.history.filter(item => item.type === 'isolation-succeeded').length, 1);
  E.advance(restored, 100);
  assert.equal(restored.history.filter(item => item.type === 'isolation-succeeded').length, 1);
  assert.equal(E.confirmIsolation(restored, ID), true);
});

test('hydration re-evaluates the submitted instant instead of retroactively passing earlier pending submissions', () => {
  const s = session();
  prepare(s);
  E.advance(s, 10);
  E.requestIsolation(s, ID, options());
  E.advance(s, 20);
  assert.equal(E.submitCase(s, ID).passed, false);
  E.advance(s, 25);
  E.confirmIsolation(s, ID);
  assert.equal(check(s).passed, true);
  const restored = E.hydrate(clone(s));
  assert.equal(restored.phase, 'paused');
  assert.equal(restored.records[ID].status, 'investigating');
  assert.equal(restored.records[ID].assessment.passed, false);
  assert.equal(restored.records[ID].assessment.checks.find(item => item.id === 'response').passed, false);
  assert.equal(E.isolationState(restored, ID, 9).status, 'not-requested');
  assert.equal(E.isolationState(restored, ID, 30).status, 'pending');
  assert.equal(E.isolationState(restored, ID).confirmedAt, 55);
  E.resume(restored);
  assert.equal(E.submitCase(restored, ID).passed, true);
  const beforeConfirmation = clone(restored);
  beforeConfirmation.records[ID].submission.at = 54.99;
  beforeConfirmation.records[ID].submission.responseConfirmedAt = null;
  assert.equal(E.hydrate(beforeConfirmation).records[ID].assessment.passed, false);
  // Even a successful operation cannot satisfy a submission made before the
  // analyst explicitly checked the result.
  const laterConfirmation = clone(restored);
  laterConfirmation.elapsed = 60;
  laterConfirmation.records[ID].response.confirmedAt = 60;
  assert.throws(() => E.hydrate(laterConfirmation), /隔離確認状態と処置履歴/);
});

test('a later confirmation in the same timer tick cannot retroactively pass an unconfirmed submission', () => {
  const s = session();
  prepare(s);
  E.requestIsolation(s, ID, options());
  E.advance(s, 45);
  assert.equal(E.submitCase(s, ID).passed, false);
  assert.equal(s.records[ID].submission.responseConfirmedAt, null);
  E.confirmIsolation(s, ID);
  assert.equal(s.records[ID].submission.at, s.records[ID].response.confirmedAt);
  const restored = E.hydrate(clone(s));
  assert.equal(restored.phase, 'paused');
  assert.equal(restored.records[ID].assessment.passed, false);
  assert.equal(restored.records[ID].submission.responseConfirmedAt, null);
  E.resume(restored);
  assert.equal(E.submitCase(restored, ID).passed, true);
  assert.equal(restored.records[ID].submission.responseConfirmedAt, 45);
  assert.equal(E.hydrate(clone(restored)).phase, 'completed');
});

test('submitted confirmation snapshots are bounded and must match the validated isolation record', () => {
  const s = session();
  prepare(s);
  E.requestIsolation(s, ID, options());
  E.advance(s, 45);
  E.confirmIsolation(s, ID);
  E.advance(s, 5);
  E.submitCase(s, ID);
  for (const value of [true, '45', -1, 44, 46, 51, null]) {
    const bad = clone(s);
    bad.records[ID].submission.responseConfirmedAt = value;
    assert.throws(() => E.hydrate(bad), /隔離確認/);
  }
  const missing = clone(s);
  delete missing.records[ID].submission.responseConfirmedAt;
  assert.throws(() => E.hydrate(missing), /隔離確認状態が不足/);
  const ordinary = E.createSession('ordinary', 'low');
  prepare(ordinary, 'ordinary');
  E.submitCase(ordinary, 'ordinary');
  assert.equal(Object.hasOwn(ordinary.records.ordinary.submission, 'responseConfirmedAt'), false);
  const unrelated = clone(ordinary);
  unrelated.records.ordinary.submission.responseConfirmedAt = null;
  assert.throws(() => E.hydrate(unrelated), /端末隔離がない/);
});

test('import rejects forged response fields, invalid times and evidence not available when isolation was requested', () => {
  const s = session();
  prepare(s);
  E.requestIsolation(s, ID, options());
  E.advance(s, 100);
  E.confirmIsolation(s, ID);
  for (const change of [
    r => { r.target = 'design-lt-041'; }, r => { r.authorizationId = 'CHG-DESIGN-214'; }, r => { r.impactAcknowledged = false; },
    r => { r.requestAt = -1; }, r => { r.requestAt = 101; }, r => { r.confirmedAt = 44; }, r => { r.confirmedAt = 101; },
    r => { r.reason = 'short'; }, r => { r.evidenceIds = ['rsp-doc-assets']; },
    r => { r.evidenceIds = r.evidenceIds.filter(id => id !== 'rsp-log-net-latest').concat('rsp-log-future'); },
    r => { r.evidenceIds.push('unknown-evidence'); }, r => { r.status = 'succeeded'; }, r => { r.completedAt = 0; }
  ]) {
    const bad = clone(s);
    change(bad.records[ID].response);
    assert.throws(() => E.hydrate(bad));
  }
  // Report evidence is independently editable after the immutable request.
  E.removeEvidence(s, ID, 'rsp-doc-procedure');
  const restored = E.hydrate(clone(s));
  assert.ok(restored.records[ID].response.evidenceIds.includes('rsp-doc-procedure'));
  assert.equal(restored.records[ID].evidenceIds.includes('rsp-doc-procedure'), false);
});

test('ordinary cases and socroom-2/3 saves have no response fields or extra assessment checks', () => {
  const s = E.createSession('ordinary', 'low');
  prepare(s, 'ordinary');
  const result = E.submitCase(s, 'ordinary');
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
  assert.equal(result.checks.length, 8);
  assert.equal(Object.hasOwn(s.records.ordinary, 'response'), false);
  for (const version of ['socroom-2', 'socroom-3']) {
    const saved = clone(s);
    saved.version = version;
    const restored = E.hydrate(saved);
    assert.equal(restored.phase, 'completed');
    assert.equal(restored.records.ordinary.assessment.checks.length, 8);
    assert.equal(Object.hasOwn(restored.records.ordinary, 'response'), false);
  }
  for (const responseValue of [null, {}, { status: 'succeeded' }]) {
    const bad = clone(s);
    bad.records.ordinary.response = responseValue;
    assert.throws(() => E.hydrate(bad), /端末隔離/);
  }
  const active = E.createSession('ordinary', 'low');
  for (const action of [() => E.requestIsolation(active, 'ordinary', options()), () => E.isolationState(active, 'ordinary'), () => E.confirmIsolation(active, 'ordinary')]) assert.throws(action, /端末隔離/);
  assert.doesNotMatch(E.report(s), /端末隔離シミュレーション/);
});

test('the handoff report records operation target, reason and request/completion/confirmation times', () => {
  const s = session();
  prepare(s);
  E.advance(s, 10);
  E.requestIsolation(s, ID, options());
  const pending = E.report(s);
  assert.match(pending, /要求時刻: 00:10/);
  assert.match(pending, /完了時刻: 未実施/);
  assert.doesNotMatch(pending, /管理通信: 維持/);
  E.advance(s, 50);
  E.confirmIsolation(s, ID);
  E.submitCase(s, ID);
  const report = E.report(s);
  for (const value of [response.target, response.authorizationId, options().reason, '要求時刻: 00:10', '完了時刻: 00:55', '結果確認時刻: 01:00', '管理通信: 維持', '隔離解除はこの演習の範囲外']) assert.ok(report.includes(value), value);
  assert.deepEqual(clone(s.history.filter(item => item.type.startsWith('isolation-')).map(item => [item.type, item.at])), [['isolation-request', 10], ['isolation-succeeded', 55], ['isolation-confirm', 60]]);
});

test('retry checkpoints rewind isolation requests and confirmations without retaining a false success', () => {
  // Production uses a dedicated low scenario; this timed fixture protects the
  // general checkpoint API if a later scenario uses the same response mechanism.
  const beforeRequest = session('medium');
  prepare(beforeRequest);
  E.advance(beforeRequest, 1100);
  E.requestIsolation(beforeRequest, ID, options());
  E.advance(beforeRequest, 100);
  assert.equal(beforeRequest.phase, 'gameover');
  E.retryCheckpoint(beforeRequest);
  assert.equal(beforeRequest.elapsed, 1020);
  assert.equal(beforeRequest.records[ID].response, undefined);
  assert.equal(E.isolationState(E.hydrate(clone(beforeRequest)), ID).status, 'not-requested');

  const beforeSuccess = session('medium');
  prepare(beforeSuccess);
  E.advance(beforeSuccess, 1000);
  E.requestIsolation(beforeSuccess, ID, options());
  E.advance(beforeSuccess, 100);
  E.confirmIsolation(beforeSuccess, ID);
  E.advance(beforeSuccess, 100);
  E.retryCheckpoint(beforeSuccess);
  assert.equal(beforeSuccess.elapsed, 1020);
  assert.equal(beforeSuccess.records[ID].response.confirmedAt, null);
  assert.equal(E.isolationState(beforeSuccess, ID).status, 'pending');
  assert.equal(E.isolationState(E.hydrate(clone(beforeSuccess)), ID).status, 'pending');
});

test('a request may finish exactly at MAX_TIME but can never become an impossible perpetual pending request', () => {
  const max = 2592000;
  const lastPossible = session();
  prepare(lastPossible);
  E.advance(lastPossible, max - response.delaySeconds);
  assert.equal(E.requestIsolation(lastPossible, ID, options()), true);
  assert.equal(E.isolationState(E.hydrate(clone(lastPossible)), ID).status, 'pending');
  E.advance(lastPossible, response.delaySeconds);
  assert.equal(E.isolationState(lastPossible, ID).completedAt, max);
  E.confirmIsolation(lastPossible, ID);
  assert.equal(E.submitCase(lastPossible, ID).passed, true);
  assert.equal(E.hydrate(clone(lastPossible)).phase, 'completed');

  const tooLate = session();
  prepare(tooLate);
  E.advance(tooLate, max - response.delaySeconds + 0.01);
  assert.throws(() => E.requestIsolation(tooLate, ID, options()), /経過時間/);
  assert.equal(tooLate.records[ID].response, undefined);
  const forged = clone(lastPossible);
  forged.records[ID].response.requestAt = max - response.delaySeconds + 0.01;
  assert.throws(() => E.hydrate(forged), /隔離要求時刻/);
});

test('other-case evidence cannot substitute for the four isolation evidence groups and is checked at request time', () => {
  const mixed = clone(data);
  mixed.scenarios.push({ id: 'mixed', title: 'Evidence fixture', caseIds: [ID, 'ordinary'] });
  mixed.cases[1].logs.push({ id: 'ordinary-future', offset: 60, raw: 'ordinary-host later event' });
  const context = { SOC_DATA: mixed };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8'), context);
  const engine = context.SocEngine;
  const s = engine.createSession('mixed', 'medium');
  engine.addEvidence(s, ID, 'ordinary-log');
  engine.addEvidence(s, ID, 'ordinary-doc');
  assert.throws(() => engine.requestIsolation(s, ID, options()), /根拠/);
  for (const group of response.requiredEvidenceGroups) engine.addEvidence(s, ID, group[0]);
  assert.equal(engine.requestIsolation(s, ID, options()), true);
  engine.advance(s, 100);
  assert.equal(engine.isolationState(engine.hydrate(clone(s)), ID).status, 'succeeded');
  const bad = clone(s);
  bad.records[ID].response.evidenceIds.push('ordinary-future');
  assert.throws(() => engine.hydrate(bad), /まだ確認できない/);
});
