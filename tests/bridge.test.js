'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');
const B = require('../src/bridge.js');
const D = require('../src/data.js');
const copy = value => JSON.parse(JSON.stringify(value));
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(course = B.create()) {
  const c = B.currentCase(course);
  return { course, c, session: E.createSession('bridge', 'low', c.id) };
}
function prepare(session) {
  const c = E.getCase(session.individualCaseId);
  if (session.phase === 'paused') E.resume(session);
  E.advance(session, Math.max(0, ...c.logs.map(log => log.offset)));
  if (c.contact) E.requestContact(session, c.id);
  for (const group of c.answer.evidenceGroups) E.addEvidence(session, c.id, group[0]);
  session.records[c.id].draft = {
    verdict: c.answer.verdict, priority: c.answer.priorities[0], action: c.answer.actions[0],
    target: c.answer.target, summary: c.answer.summary, nextStep: c.answer.nextStep
  };
  assert.equal(E.assessCase(session, c.id).passed, true, c.id);
}
function resolve(session) {
  prepare(session);
  assert.equal(E.submitCase(session, session.individualCaseId).passed, true);
}
function completeStep(step, course, session) {
  const c = B.currentCase(course);
  if (step.kind === 'seen') B.mark(course, step.flag);
  if (step.kind === 'request') E.requestContact(session, c.id);
  if (step.kind === 'evidence') {
    if (step.source === 'reply') E.requestContact(session, c.id);
    const id = step.source === 'log' ? c.logs[0].id : step.source === 'document' ? c.documents[0].id : c.contact.replyId;
    E.advance(session, Math.max(0, ...c.logs.map(log => log.offset)));
    E.addEvidence(session, c.id, id);
  }
  if (step.kind === 'draft') {
    const values = { verdict: c.answer.verdict, priority: c.answer.priorities[0], action: c.answer.actions[0], target: c.host, summary: '確認した事実を自分の言葉で記録', nextStep: '未確認事項と引き継ぎを記録' };
    for (const field of step.fields) session.records[c.id].draft[field] = values[field];
  }
  if (step.kind === 'submitted') resolve(session);
}

test('five exclusive cases fade from action guidance to checklist to independent practice', () => {
  const scenario = D.scenarios.find(item => item.id === 'bridge');
  assert.equal(scenario.hidden, true);
  assert.equal(scenario.difficulty, 'low');
  assert.equal(B.CASE_IDS.length, 5);
  assert.equal(new Set(B.CASE_IDS).size, 5);
  assert.deepEqual(B.CASE_IDS.map(id => E.getCase(id).bridge.stage), ['guided', 'guided', 'checklist', 'checklist', 'independent']);
  const otherIds = D.scenarios.filter(item => item.id !== 'bridge').flatMap(item => item.caseIds);
  const evidenceIds = new Set();
  for (const id of B.CASE_IDS) {
    const c = E.getCase(id);
    assert.ok(!otherIds.includes(id));
    assert.equal(c.scenarioId, 'bridge');
    assert.equal(c.difficulty, 'low');
    assert.ok(c.bridge.objective.trim());
    if (c.bridge.stage === 'independent') assert.deepEqual(c.bridge.steps, []);
    else assert.ok(c.bridge.steps.length > 0);
    for (const evidence of [...c.logs, ...c.documents, { id: c.contact.replyId }]) {
      assert.ok(!evidenceIds.has(evidence.id), evidence.id + ' is unique');
      evidenceIds.add(evidence.id);
    }
    for (const step of c.bridge.steps) {
      assert.ok(['seen', 'request', 'evidence', 'draft', 'submitted'].includes(step.kind), step.id);
      assert.ok(step.title.trim());
      if (c.bridge.stage === 'guided') { assert.ok(step.instruction.trim()); assert.ok(step.why.trim()); }
    }
  }
});

test('all bridge cases remain untimed and use exactly one active case', () => {
  for (const id of B.CASE_IDS) {
    const session = E.createSession('bridge', 'low', id);
    assert.deepEqual(Object.keys(session.records), [id]);
    assert.equal(E.getDeadline(session, id), null);
    E.advance(session, 86400);
    assert.equal(session.phase, 'running');
    assert.deepEqual(E.activeCases(session).map(item => item.id), [id]);
    E.requestContact(session, id);
    assert.equal(E.replyAvailable(session, id), true);
    for (const difficulty of ['medium', 'high']) assert.throws(() => E.createSession('bridge', difficulty, id));
  }
});

test('navigation flags are whitelisted and never count as attached evidence', () => {
  const { course, session } = fixture();
  for (const flag of ['context', 'logs', 'resources', 'contact', 'raw']) {
    const step = { kind: 'seen', flag };
    assert.equal(B.stepComplete(step, course, session), false);
    B.mark(course, flag);
    B.mark(course, flag);
    assert.equal(B.stepComplete(step, course, session), true);
    assert.equal(course.guide.seen.filter(value => value === flag).length, 1);
  }
  const seen = course.guide.seen.slice();
  for (const flag of ['submitted', '__proto__', 'unknown', null]) B.mark(course, flag);
  assert.deepEqual(course.guide.seen, seen);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'log' }, course, session), false);
  assert.equal(course.guide.step, 0);
});

test('log, document, and reply evidence each require a saved item of their own kind', () => {
  const { course, c, session } = fixture();
  const record = session.records[c.id];
  const other = D.cases.find(item => item.scenarioId === 'low');
  record.evidenceIds.push(other.logs[0].id);
  for (const source of ['log', 'document', 'reply']) assert.equal(B.stepComplete({ kind: 'evidence', source }, course, session), false);
  record.evidenceIds = [];
  E.advance(session, Math.max(0, ...c.logs.map(log => log.offset)));
  E.addEvidence(session, c.id, c.logs[0].id);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'log' }, course, session), true);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'document' }, course, session), false);
  E.addEvidence(session, c.id, c.documents[0].id);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'document' }, course, session), true);
  E.requestContact(session, c.id);
  assert.equal(B.stepComplete({ kind: 'request' }, course, session), true);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'reply' }, course, session), false);
  E.addEvidence(session, c.id, c.contact.replyId);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'reply' }, course, session), true);
  E.removeEvidence(session, c.id, c.logs[0].id);
  assert.equal(B.stepComplete({ kind: 'evidence', source: 'log' }, course, session), false);
});

test('a draft milestone checks presence without claiming to grade free text or choosing the answer', () => {
  const { course, c, session } = fixture();
  const step = { kind: 'draft', fields: ['verdict', 'summary', 'nextStep'] };
  const record = session.records[c.id];
  record.draft.verdict = c.answer.verdict === 'benign' ? 'incident' : 'benign';
  record.draft.summary = '調べた事実';
  record.draft.nextStep = '　\n\t';
  assert.equal(B.stepComplete(step, course, session), false);
  record.draft.nextStep = '次の担当者が確認すること';
  assert.equal(B.stepComplete(step, course, session), true);
  assert.equal(E.assessCase(session, c.id).passed, false);
  assert.equal(B.stepComplete({ kind: 'draft', fields: ['__proto__'] }, course, session), false);
  assert.equal(B.stepComplete({ kind: 'draft', fields: [] }, course, session), false);
});

test('guided steps complete through actual operations and normalize only rewinds', () => {
  const { course, c, session } = fixture();
  const steps = c.bridge.steps;
  course.guide.step = steps.length - 1;
  assert.equal(B.normalize(course, session).guide.step, 0);
  for (let index = 0; index < steps.length; index += 1) {
    course.guide.step = index;
    completeStep(steps[index], course, session);
    assert.equal(B.stepComplete(steps[index], course, session), true, steps[index].id);
    assert.equal(B.normalize(course, session).guide.step, index, 'next step requires explicit navigation');
  }
  const firstEvidence = steps.findIndex(step => step.kind === 'evidence');
  const source = steps[firstEvidence].source;
  const ids = source === 'log' ? c.logs.map(item => item.id) : source === 'document' ? c.documents.map(item => item.id) : [c.contact.replyId];
  session.records[c.id].evidenceIds = session.records[c.id].evidenceIds.filter(id => !ids.includes(id));
  assert.equal(B.normalize(course, session).guide.step, firstEvidence);
});

test('a passing draft or failed submission cannot finish the course case', () => {
  const { course, c, session } = fixture();
  assert.equal(B.advance(course), false);
  assert.equal(E.submitCase(session, c.id).passed, false);
  assert.equal(B.stepComplete({ kind: 'submitted' }, course, session), false);
  assert.throws(() => B.finish(course, session));
  prepare(session);
  assert.equal(B.stepComplete({ kind: 'submitted' }, course, session), false);
  assert.throws(() => B.finish(course, session));
  assert.equal(E.submitCase(session, c.id).passed, true);
  assert.equal(B.stepComplete({ kind: 'submitted' }, course, session), true);
  assert.equal(B.finish(course, session), true);
  assert.equal(B.finish(course, session), false, 'review saves never duplicate a completion');
  assert.equal(course.index, 0, 'finish remains on the review for this case');
  assert.equal(course.completed.length, 1);
  assert.notEqual(course.completed[0], session);
  session.records[c.id].draft.summary = '現在の画面のみ変更';
  assert.notEqual(course.completed[0].records[c.id].draft.summary, session.records[c.id].draft.summary);
});

test('the complete course advances in order with fresh guidance and stops after case five', () => {
  const course = B.create();
  for (let index = 0; index < B.CASE_IDS.length; index += 1) {
    const { c, session } = fixture(course);
    assert.equal(c.id, B.CASE_IDS[index]);
    B.mark(course, 'context');
    resolve(session);
    B.finish(course, session);
    const restored = B.hydrate(copy(course), E.hydrate(copy(session)));
    assert.equal(restored.index, index);
    assert.equal(restored.completed.length, index + 1);
    assert.equal(B.advance(course), index < B.CASE_IDS.length - 1);
    if (index < B.CASE_IDS.length - 1) assert.deepEqual(course.guide, { step: 0, seen: [] });
  }
  assert.equal(course.index, 4);
  assert.equal(course.completed.length, 5);
});

test('bridge progress is separate from both normal shifts and the operation tutorial', () => {
  const normal = E.createSession('medium', 'medium');
  const tutorial = E.createSession('tutorial', 'low', 'tutorial-scan');
  const beforeNormal = copy(normal);
  const beforeTutorial = copy(tutorial);
  const { course, session } = fixture();
  for (const other of [normal, tutorial]) {
    assert.equal(B.stepComplete({ kind: 'submitted' }, course, other), false);
    assert.throws(() => B.finish(course, other));
    assert.throws(() => B.hydrate(course, other));
  }
  resolve(session);
  B.finish(course, session);
  B.advance(course);
  assert.deepEqual(normal, beforeNormal);
  assert.deepEqual(tutorial, beforeTutorial);
});

test('resuming restores notes and past proof while rewinding missing guidance prerequisites', () => {
  const { course, c, session } = fixture();
  course.guide.step = c.bridge.steps.length - 1;
  const restoredSession = E.hydrate(copy(session));
  const restored = B.hydrate(copy(course), restoredSession);
  assert.equal(restoredSession.phase, 'paused');
  assert.equal(restored.guide.step, 0);
  assert.notEqual(restored.guide.seen, course.guide.seen);
  assert.equal(B.hydrate({ ...copy(course), guide: { step: 0, seen: ['context', 'context'] } }, restoredSession).guide.seen.length, 1);
});

test('hydrate rejects invalid course fields, mismatched current cases and skipped history', () => {
  const { course, c, session } = fixture();
  const invalid = [
    null, [], {}, { ...course, version: 0 }, { ...course, version: '1' },
    ...[-1, 5, 0.5, '0', NaN, Infinity].map(index => ({ ...course, index })),
    { ...course, guide: null },
    ...[-1, c.bridge.steps.length, 0.5, '0', NaN].map(step => ({ ...course, guide: { step, seen: [] } })),
    { ...course, guide: { step: 0, seen: ['unknown'] } },
    { ...course, guide: { step: 0, seen: Array(6).fill('context') } },
    { ...course, completed: {} }, { ...course, completed: [session, session] },
    { ...course, index: 1, completed: [] }
  ];
  for (const raw of invalid) assert.throws(() => B.hydrate(raw, session));
  for (const wrong of [null, E.createSession('bridge', 'low'), E.createSession('bridge', 'low', B.CASE_IDS[1]), { ...session, difficulty: 'medium' }, { ...session, scenarioId: 'low' }]) assert.throws(() => B.hydrate(course, wrong));
});

test('forged completion flags and incorrect submitted answers cannot unlock the next case', () => {
  const { course, c, session } = fixture();
  const forged = copy(session);
  forged.phase = 'completed';
  Object.assign(forged.records[c.id], { status: 'resolved', assessment: { passed: true, score: 100 }, resolvedAt: 0 });
  assert.throws(() => B.finish(course, forged));
  assert.throws(() => B.hydrate({ ...course, completed: [forged] }, forged));
  resolve(session);
  B.finish(course, session);
  const wrong = copy(course);
  wrong.completed[0].records[c.id].submission.draft.verdict = c.answer.verdict === 'benign' ? 'incident' : 'benign';
  assert.throws(() => B.hydrate(wrong, session));
  assert.throws(() => B.advance(wrong));
  const wrongCurrent = E.createSession('bridge', 'low', c.id);
  assert.throws(() => B.hydrate(course, wrongCurrent), 'completed proof cannot accompany an unresolved current attempt');
});

test('reflection notes round-trip with bounded, whitelisted fact/limit/next fields', () => {
  const { course, c, session } = fixture();
  course.reflections[c.id] = { facts: 'ログで確認できた操作', limits: '操作理由は未確認', next: '担当者へ照会する' };
  const restored = B.hydrate(copy(course), E.hydrate(copy(session)));
  assert.deepEqual(restored.reflections, course.reflections);
  for (const reflections of [{ unknown: {} }, { [c.id]: { facts: 'x'.repeat(1401) } }, { [c.id]: { facts: 1 } }, { [c.id]: { unexpected: '' } }, []]) {
    assert.throws(() => B.hydrate({ ...copy(course), reflections }, E.hydrate(copy(session))));
  }
});

test('migration workspaces survive export with the same terminal path and size validation', () => {
  const { course, session } = fixture();
  const id = B.CASE_IDS[2], workspace = { files: { '/home/analyst/notes.txt': '後続ケースの調査メモ' }, dirs: ['/home/analyst'], history: ['cat notes.txt'], cwd: '/home/analyst', oldcwd: '/home/analyst' };
  course.reviewWorkspaces[id] = workspace;
  const restored = B.hydrate(copy(course), E.hydrate(copy(session)));
  assert.deepEqual(restored.reviewWorkspaces[id], workspace);
  for (const reviewWorkspaces of [
    { foreign: workspace },
    { [id]: { ...workspace, files: { '/var/log/auth.log': '改変' } } },
    { [id]: { ...workspace, files: { '/home/analyst/huge': 'x'.repeat(2097153) } } },
    { [id]: { ...workspace, files: { '/home/analyst/file': 'x', '/home/analyst/file/child': 'y' } } },
    Object.fromEntries(B.CASE_IDS.map(id => [id, { ...workspace, files: { '/home/analyst/notes.txt': 'x'.repeat(1000000) } }]))
  ]) assert.throws(() => B.hydrate({ ...copy(course), reviewWorkspaces }, E.hydrate(copy(session))));
});

test('legacy bridge progress revisits earlier reopened work and preserves later completed and draft sessions', () => {
  const data = copy(D); data.version = 'socroom-3';
  const sandbox = { SOC_DATA: data };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/engine.js'), 'utf8'), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/bridge.js'), 'utf8'), sandbox);
  const engine = sandbox.SocEngine, bridge = sandbox.SocBridge, course = bridge.create();
  const sessions = [];
  function finishCurrent(session) {
    const c = engine.getCase(session.individualCaseId);
    if (session.phase === 'paused') engine.resume(session);
    engine.requestContact(session, c.id);
    session.records[c.id].evidenceIds = c.answer.evidenceGroups.map(group => group[0]);
    session.records[c.id].draft = { verdict: c.answer.verdict, priority: c.answer.priorities[0], action: c.answer.actions[0], target: c.answer.target, summary: c.answer.summary, nextStep: c.answer.nextStep };
    assert.equal(engine.submitCase(session, c.id).passed, true);
    bridge.finish(course, session);
  }
  for (let i = 0; i < 2; i += 1) {
    const session = engine.createSession('bridge', 'low', bridge.CASE_IDS[i]);
    finishCurrent(session); sessions.push(session); bridge.advance(course);
  }
  const current = engine.createSession('bridge', 'low', bridge.CASE_IDS[2]);
  current.records[current.individualCaseId].draft.summary = '途中の調査メモを保持';
  const raw = copy(course), oldCurrent = copy(current);
  oldCurrent.version = 'socroom-2';
  raw.completed.forEach(s => { s.version = 'socroom-2'; Object.values(s.records).forEach(r => { delete r.contactRequests; }); });
  raw.completed[0].records[bridge.CASE_IDS[0]].submission.draft.summary = '記録した';
  const restored = bridge.hydrate(raw, engine.hydrate(oldCurrent));
  assert.equal(restored.index, 0);
  assert.equal(restored.completed.length, 0);
  assert.equal(restored.resumeSession.phase, 'paused');
  assert.equal(restored.reviewArchive[bridge.CASE_IDS[1]].phase, 'completed');
  assert.equal(restored.reviewArchive[bridge.CASE_IDS[2]].records[bridge.CASE_IDS[2]].draft.summary, '途中の調査メモを保持');
  let active = restored.resumeSession; delete restored.resumeSession;
  const roundTrip = bridge.hydrate(copy(restored), engine.hydrate(copy(active)));
  assert.equal(Object.keys(roundTrip.reviewArchive).length, 2);
  const c = engine.getCase(active.individualCaseId);
  engine.resume(active);
  active.records[c.id].draft.summary = c.answer.summary;
  assert.equal(engine.submitCase(active, c.id).passed, true);
  bridge.finish(roundTrip, active); bridge.advance(roundTrip);
  active = bridge.resumeArchived(roundTrip);
  assert.equal(active.phase, 'completed');
  assert.equal(roundTrip.completed.length, 2);
  bridge.advance(roundTrip);
  active = bridge.resumeArchived(roundTrip);
  assert.equal(active.phase, 'paused');
  assert.equal(active.records[active.individualCaseId].draft.summary, '途中の調査メモを保持');
  assert.equal(Object.keys(roundTrip.reviewArchive).length, 0);
});
