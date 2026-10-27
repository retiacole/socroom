'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));

function fixture() {
  const cases = ['a', 'b', 'c'].map(id => ({
    id, host: 'host-' + id, title: '調査 ' + id, critical: true,
    logs: Array.from({ length: 6 }, (_, i) => ({ id: id + '-log-' + i, offset: i === 5 ? 100 : 0, time: '09:00:00', raw: '2026-10-20 host=host-' + id + ' job=JOB-123 event=observed' })),
    documents: [{ id: id + '-doc', title: '申請', body: 'CHG-123 の対象は host-' + id }],
    contact: { replyId: id + '-reply', question: '具体的に確認', delaySeconds: 30, questions: [
      { id: 'vague', question: '問題ないですか', replyId: id + '-vague', replyTitle: '曖昧な回答', replyText: '特に気づいていません', delaySeconds: 10 },
      { id: 'specific', question: '時刻と実施内容を確認', replyId: id + '-reply', replyTitle: '具体的な回答', replyText: '09:00に作業しました', delaySeconds: 30 },
      { id: 'leading', question: '正当な作業ですよね', replyId: id + '-leading', replyTitle: '確認不足', replyText: 'おそらく', delaySeconds: 20 }
    ] },
    answer: { verdict: 'incident', priorities: ['high'], actions: ['escalate'], target: 'host-' + id, evidenceGroups: [[id + '-log-0'], [id + '-doc', id + '-reply']], summary: 'host-' + id + ' で変更を確認。', nextStep: '当番責任者へ記録を引き継ぐ。' }
  }));
  const data = { version: 'socroom-3', company: { name: '教材' }, scenarios: [{ id: 'shift', title: '勤務', caseIds: cases.map(c => c.id) }], cases };
  const sandbox = { SOC_DATA: data };
  vm.runInNewContext(source, sandbox);
  return { E: sandbox.SocEngine, data };
}
function answer(E, s, id) {
  const c = E.getCase(id), r = s.records[id];
  r.draft = { verdict: c.answer.verdict, priority: c.answer.priorities[0], action: c.answer.actions[0], target: c.answer.target, summary: c.answer.summary, nextStep: c.answer.nextStep };
  r.evidenceIds = c.answer.evidenceGroups.map(group => group.find(ref => E.evidenceAvailable(s, ref)));
}

function rolloutFixture(previousRubric = false) {
  // Exercise the authored case directly; release tests verify its generated copy.
  const c = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/high.json'), 'utf8')).cases.find(item => item.id === 'high-rollout');
  if (previousRubric) c.answer.evidenceGroups = [['hi-ed-doc-change'], ['hi-ed-06', 'hi-ed-09', 'hi-ed-12'], ['hi-ed-13', 'hi-ed-16'], ['hi-ed-reply']];
  const sandbox = { SOC_DATA: { version: 'socroom-3', cases: [c], scenarios: [{ id: 'high', difficulty: 'high', caseIds: [c.id] }] } };
  vm.runInNewContext(source, sandbox);
  const E = sandbox.SocEngine, s = E.createSession('high', 'high', c.id);
  E.requestContact(s, c.id);
  E.advance(s, 90);
  const r = s.records[c.id];
  r.draft = { verdict: 'benign', priority: 'low', action: 'close', target: c.answer.target, summary: c.answer.summary, nextStep: c.answer.nextStep };
  for (const id of ['hi-ed-doc-change', 'hi-ed-06', 'hi-ed-13', 'hi-ed-reply']) E.addEvidence(s, c.id, id);
  return { E, c, s };
}

test('rollout closure requires both the deployment list and the later monitoring recovery', () => {
  const { E, c, s } = rolloutFixture();
  assert.equal(E.evidenceAvailable(s, 'hi-ed-16'), false);
  assert.throws(() => E.addEvidence(s, c.id, 'hi-ed-16'));
  const early = E.submitCase(s, c.id);
  assert.equal(early.passed, false);
  assert.equal(early.checks.find(check => check.id === 'evidence').passed, false);
  assert.equal(s.phase, 'running');
  E.advance(s, 89);
  assert.equal(E.evidenceAvailable(s, 'hi-ed-16'), false);
  E.advance(s, 1);
  assert.equal(E.evidenceAvailable(s, 'hi-ed-16'), true);
  assert.equal(E.assessCase(s, c.id).passed, false, 'arrival alone is not collected evidence');
  E.addEvidence(s, c.id, 'hi-ed-16');
  E.removeEvidence(s, c.id, 'hi-ed-13');
  assert.equal(E.assessCase(s, c.id).passed, false, 'monitoring recovery cannot replace the deployment scope');
  E.addEvidence(s, c.id, 'hi-ed-13');
  assert.equal(s.records[c.id].evidenceIds.length, 5);
  assert.equal(E.evidenceLimit(c.id), 7, 'retain the default two-item allowance');
  const complete = E.submitCase(s, c.id);
  assert.equal(complete.passed, true);
  assert.equal(complete.score, 100);
  assert.equal(s.phase, 'completed');
  assert.equal(E.hydrate(clone(s)).phase, 'completed');
});

test('previously completed rollout saves reopen without losing the report or collected evidence', () => {
  for (const version of ['socroom-3', 'socroom-2']) {
    const prior = rolloutFixture(true);
    assert.equal(prior.E.submitCase(prior.s, prior.c.id).score, 100);
    const saved = clone(prior.s);
    saved.version = version;
    const { E, c } = rolloutFixture();
    const restored = E.hydrate(saved), r = restored.records[c.id];
    assert.equal(restored.phase, 'paused', version);
    assert.equal(r.status, 'investigating', version);
    assert.equal(r.assessment.passed, false, version);
    assert.deepEqual(clone(r.draft), saved.records[c.id].draft);
    assert.deepEqual(clone(r.evidenceIds), saved.records[c.id].evidenceIds);
    assert.deepEqual(clone(r.submission), saved.records[c.id].submission);
    assert.equal(E.hydrate(clone(restored)).phase, 'paused', 're-exported progress remains valid');
    if (version === 'socroom-2') {
      assert.equal(restored.migration.untimedReview, true);
      assert.deepEqual(clone(restored.migration.reopenedCaseIds), [c.id]);
    }
    E.resume(restored);
    E.advance(restored, 90);
    E.addEvidence(restored, c.id, 'hi-ed-16');
    assert.equal(E.submitCase(restored, c.id).score, 100);
    assert.equal(restored.phase, 'completed');
    assert.equal(E.hydrate(clone(restored)).phase, 'completed');
  }
});

test('selecting every available item fails evidence focus; focused independent evidence earns full credit', () => {
  const { E } = fixture(), s = E.createSession('shift', 'medium', 'a');
  answer(E, s, 'a');
  assert.equal(E.evidenceLimit('a'), 4);
  s.records.a.evidenceIds.push('a-log-1', 'a-log-2', 'a-log-3');
  const broad = E.submitCase(s, 'a');
  assert.equal(broad.passed, false);
  assert.equal(broad.score, 90);
  assert.equal(broad.checks.find(c => c.id === 'evidence').passed, true);
  assert.equal(broad.checks.find(c => c.id === 'evidenceFocus').passed, false);
  E.removeEvidence(s, 'a', 'a-log-3');
  assert.equal(E.submitCase(s, 'a').score, 100);
});

test('evidence limits can be explicitly tightened and coverage retains partial credit', () => {
  const { E, data } = fixture(), s = E.createSession('shift', 'medium', 'a');
  data.cases[0].answer.evidenceLimit = 2;
  answer(E, s, 'a');
  assert.equal(E.evidenceLimit('a'), 2);
  s.records.a.evidenceIds.push('a-log-1');
  assert.equal(E.assessCase(s, 'a').checks.find(c => c.id === 'evidenceFocus').passed, false);
  s.records.a.evidenceIds = ['a-log-0'];
  assert.equal(E.assessCase(s, 'a').score, 90);
});

test('report form checks concrete anchors and recipient presence without claiming meaning grading', () => {
  const { E } = fixture(), s = E.createSession('shift', 'low', 'a');
  answer(E, s, 'a');
  const r = s.records.a;
  r.draft.summary = '調査した'; r.draft.nextStep = '確認する';
  assert.equal(E.assessCase(s, 'a').score, 85);
  for (const anchor of ['host-a', 'a-log-0', 'CHG-123', 'JOB-123', '09:41']) {
    r.draft.summary = anchor + ' を確認した';
    assert.equal(E.assessCase(s, 'a').checks.find(c => c.id === 'summary').passed, true, anchor);
  }
  r.draft.summary = '99:99 を確認した';
  assert.equal(E.assessCase(s, 'a').checks.find(c => c.id === 'summary').passed, false);
  for (const recipient of ['担当者', '責任者', '管理者', 'SOC', 'CSIRT', '情シス', '情報システム部']) {
    r.draft.nextStep = recipient + 'へ依頼する';
    assert.equal(E.assessCase(s, 'a').checks.find(c => c.id === 'nextStep').passed, true, recipient);
  }
  assert.match(E.report(s), /意味・正確性は自動採点していません/);
});

test('identity targets and explicit aliases are accepted without implicitly accepting the logging server', () => {
  const { E, data } = fixture(), s = E.createSession('shift', 'low', 'a');
  data.cases[0].answer.target = 'r.mizuno';
  data.cases[0].answer.targetAliases = ['r.mizuno@corp.example'];
  answer(E, s, 'a');
  s.records.a.draft.target = ' R.MIZUNO@CORP.EXAMPLE ';
  assert.equal(E.assessCase(s, 'a').checks.find(c => c.id === 'target').passed, true);
  s.records.a.draft.target = 'host-a';
  assert.equal(E.assessCase(s, 'a').checks.find(c => c.id === 'target').passed, false);
});

test('a vague question does not unlock the specific reply and a specific follow-up remains possible', () => {
  const { E } = fixture(), s = E.createSession('shift', 'medium', 'a');
  E.requestContact(s, 'a', 'vague');
  assert.equal(s.records.a.requestAt, null);
  assert.equal(E.requestContact(s, 'a', 'vague'), false);
  E.advance(s, 10);
  assert.equal(E.replyAvailable(s, 'a', 'vague'), true);
  assert.equal(E.replyAvailable(s, 'a'), false);
  assert.equal(E.evidenceAvailable(s, 'a-reply'), false);
  assert.deepEqual(clone(E.availableReplies(s, 'a').map(q => q.id)), ['vague']);
  E.requestContact(s, 'a');
  assert.equal(s.records.a.requestAt, 10);
  E.advance(s, 29.9);
  assert.equal(E.evidenceAvailable(s, 'a-reply'), false);
  E.advance(s, 0.1);
  assert.equal(E.evidenceAvailable(s, 'a-reply'), true);
  assert.equal(s.history.filter(h => h.type === 'contact-reply').length, 2);
  assert.throws(() => E.requestContact(s, 'a', 'missing'), /質問/);
});

test('each inquiry round-trips independently and invalid or inconsistent request maps are rejected', () => {
  const { E } = fixture(), s = E.createSession('shift', 'medium', 'a');
  E.requestContact(s, 'a', 'vague'); E.advance(s, 10); E.requestContact(s, 'a');
  const restored = E.hydrate(clone(s));
  assert.equal(E.replyAvailable(restored, 'a', 'vague'), true);
  assert.equal(E.replyAvailable(restored, 'a'), false);
  for (const mutate of [
    value => { value.records.a.contactRequests.foreign = 0; },
    value => { value.records.a.contactRequests.specific = 11; },
    value => { value.records.a.contactRequests.vague = null; },
    value => { value.records.a.requestAt = 0; }
  ]) {
    const value = clone(s); mutate(value); assert.throws(() => E.hydrate(value));
  }
});

test('retry retains an earlier inquiry but rolls back later inquiries and reply evidence', () => {
  const { E } = fixture(), s = E.createSession('shift', 'medium', 'a');
  E.advance(s, 1000); E.requestContact(s, 'a', 'vague');
  E.advance(s, 80); E.requestContact(s, 'a'); E.advance(s, 30);
  E.addEvidence(s, 'a', 'a-vague'); E.addEvidence(s, 'a', 'a-reply');
  E.advance(s, 90); E.retryCheckpoint(s);
  assert.equal(s.elapsed, 1020);
  assert.equal(s.records.a.contactRequests.vague, 1000);
  assert.equal(Object.hasOwn(s.records.a.contactRequests, 'specific'), false);
  assert.equal(s.records.a.requestAt, null);
  assert.deepEqual(clone(s.records.a.evidenceIds), ['a-vague']);
  assert.equal(E.replyAvailable(E.hydrate(clone(s)), 'a'), false);
});

test('legacy saves map requestAt onto the default question and re-evaluate completed reports', () => {
  const { E } = fixture(), s = E.createSession('shift', 'low');
  for (const id of ['a', 'b', 'c']) { E.requestContact(s, id); answer(E, s, id); E.submitCase(s, id); }
  const old = clone(s); old.version = 'socroom-2';
  for (const r of Object.values(old.records)) delete r.contactRequests;
  old.records.a.submission.draft.summary = '内容';
  const restored = E.hydrate(old);
  assert.equal(restored.phase, 'paused');
  assert.equal(restored.records.a.status, 'investigating');
  assert.equal(restored.records.a.assessment.passed, false);
  assert.equal(restored.records.a.contactRequests.specific, 0);
  assert.equal(restored.records.b.arrival, 0);
  assert.equal(restored.migration.untimedReview, true);
  assert.deepEqual(clone(restored.migration.reopenedCaseIds), ['a']);
  E.resume(restored); E.advance(restored, 2000); answer(E, restored, 'a'); E.submitCase(restored, 'a');
  assert.equal(restored.phase, 'completed');
  assert.equal(E.hydrate(clone(restored)).phase, 'completed');
});

test('old completed timed shifts reopen in untimed review instead of expiring immediately', () => {
  const { E } = fixture(), s = E.createSession('shift', 'medium', 'a');
  answer(E, s, 'a'); E.submitCase(s, 'a');
  const old = clone(s); old.version = 'socroom-2'; old.elapsed = 1500;
  old.records.a.submission.draft.nextStep = '対応する';
  const restored = E.hydrate(old);
  assert.equal(restored.phase, 'paused');
  assert.equal(E.getDeadline(restored, 'a'), null);
  E.resume(restored); E.advance(restored, 1000);
  assert.equal(restored.phase, 'running');
  answer(E, restored, 'a');
  assert.equal(E.submitCase(restored, 'a').score, 100);
  assert.equal(E.hydrate(clone(restored)).phase, 'completed');
});

test('migration does not retroactively remove a historical late-submission penalty', () => {
  const { E, data } = fixture(); data.cases[0].critical = false;
  const s = E.createSession('shift', 'medium', 'a');
  E.advance(s, 1300); answer(E, s, 'a');
  assert.equal(E.submitCase(s, 'a').score, 90);
  const old = clone(s); old.version = 'socroom-2'; old.records.a.submission.draft.summary = '記録した';
  const restored = E.hydrate(old);
  assert.equal(restored.records.a.assessment.score, 80);
  assert.equal(E.hydrate(clone(restored)).records.a.assessment.score, 80);
  E.resume(restored); answer(E, restored, 'a');
  assert.equal(E.submitCase(restored, 'a').score, 100);
  assert.equal(E.hydrate(clone(restored)).records.a.assessment.score, 100);
});

test('legacy evidence newly released later is removed instead of being exposed early', () => {
  const { E } = fixture(), s = E.createSession('shift', 'medium', 'a');
  answer(E, s, 'a'); E.submitCase(s, 'a');
  const old = clone(s); old.version = 'socroom-2';
  old.records.a.evidenceIds.push('a-log-5'); old.records.a.submission.evidenceIds.push('a-log-5');
  const restored = E.hydrate(old);
  assert.equal(restored.records.a.evidenceIds.includes('a-log-5'), false);
  assert.equal(restored.records.a.submission.evidenceIds.includes('a-log-5'), false);
  assert.equal(E.evidenceAvailable(restored, 'a-log-5'), false);
  old.records.a.evidenceIds.push('unknown');
  assert.throws(() => E.hydrate(old), /未知の証拠/);
});

test('every published report example passes the structural rubric with selected evidence', () => {
  const data = require('../src/data.js'), E = require('../src/engine.js');
  for (const c of data.cases) {
    const s = E.createSession(c.scenarioId, c.difficulty, c.id);
    E.requestContact(s, c.id);
    E.advance(s, Math.max(...c.logs.map(log => log.offset), c.contact.delaySeconds * E.DIFFICULTIES[c.difficulty].replyMultiplier));
    answer(E, s, c.id);
    if (c.response) {
      assert.equal(E.assessCase(s, c.id).passed, false, 'the report cannot replace response confirmation');
      E.requestIsolation(s, c.id, { target: c.response.target, authorizationId: c.response.authorizationId, reason: c.host + ' の継続通信と承認範囲を確認したため隔離する。', impactAcknowledged: true });
      E.advance(s, c.response.delaySeconds);
      E.confirmIsolation(s, c.id);
    }
    const result = E.assessCase(s, c.id);
    assert.equal(result.passed, true, c.id + ': ' + result.checks.filter(check => !check.passed).map(check => check.id).join(', '));
    assert.equal(result.score, 100, c.id);
  }
});

test('the reviewed WAF case cannot pass by attaching all logs, documents and replies', () => {
  const E = require('../src/engine.js'), c = E.getCase('medium-waf-import');
  const s = E.createSession(c.scenarioId, c.difficulty, c.id);
  for (const question of E.getContactQuestions(c.id)) E.requestContact(s, c.id, question.id);
  E.advance(s, Math.max(...c.logs.map(log => log.offset), ...E.getContactQuestions(c.id).map(question => question.delaySeconds)));
  answer(E, s, c.id);
  s.records[c.id].evidenceIds = [...E.visibleLogs(s, c.id).map(log => log.id), ...c.documents.map(doc => doc.id), ...E.availableReplies(s, c.id).map(reply => reply.replyId)];
  const result = E.assessCase(s, c.id);
  assert.equal(result.passed, false);
  assert.equal(result.checks.find(check => check.id === 'evidenceFocus').passed, false);
  assert.equal(result.checks.find(check => check.id === 'evidence').passed, true);
  assert.ok(result.score < 100);
});
