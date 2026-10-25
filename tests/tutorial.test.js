'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../src/engine.js');
const T = require('../src/tutorial.js');
const D = require('../src/data.js');

const stepById = id => T.STEPS.find(step => step.id === id);
const stepIndex = id => T.STEPS.findIndex(step => step.id === id);
function fixture() {
  return { state: T.create(), session: E.createSession('tutorial', 'low', T.CASE_ID) };
}
function perform(step, state, session) {
  const record = session.records[T.CASE_ID];
  switch (step.kind) {
    case 'read': break;
    case 'seen': T.mark(state, step.flag); break;
    case 'evidence': E.addEvidence(session, T.CASE_ID, step.value); break;
    case 'request': E.requestContact(session, T.CASE_ID); break;
    case 'draft': record.draft[step.field] = step.value; break;
    case 'text': record.draft[step.field] = step.example; break;
    case 'submitted':
      if (record.status !== 'resolved') assert.equal(E.submitCase(session, T.CASE_ID).passed, true);
      break;
    default: assert.fail('Unknown tutorial step kind: ' + step.kind);
  }
}
function readyToSubmit() {
  const value = fixture();
  for (let index = 0; index < stepIndex('submit'); index++) perform(T.STEPS[index], value.state, value.session);
  value.state.step = stepIndex('submit');
  return value;
}

test('all 21 steps follow the real investigation through evidence, report and submission', () => {
  const { state, session } = fixture();
  assert.equal(T.STEPS.length, 21);
  assert.equal(new Set(T.STEPS.map(step => step.id)).size, T.STEPS.length);
  for (let index = 0; index < T.STEPS.length; index++) {
    const step = T.STEPS[index];
    state.step = index;
    if (step.kind !== 'read' && step.id !== 'finish') {
      assert.equal(T.complete(step, state, session), false, step.id + ' requires its operation');
    }
    perform(step, state, session);
    assert.equal(T.complete(step, state, session), true, step.id + ' is complete after its operation');
    assert.equal(T.normalize(state, session).step, index, step.id + ' keeps the current step until explicit advancement');
  }
  assert.equal(session.phase, 'completed');
  assert.equal(session.records[T.CASE_ID].assessment.score, 100);
  assert.deepEqual(session.records[T.CASE_ID].evidenceIds, [T.PRIMARY_LOG_ID, 'ts-doc-plan', 'ts-reply']);
});

test('the guided case and its evidence are exclusive to the tutorial', () => {
  const tutorialCase = E.getCase(T.CASE_ID);
  assert.equal(T.CASE_ID, 'tutorial-scan');
  assert.equal(T.SEARCH_QUERY, '検査');
  assert.equal(T.PRIMARY_LOG_ID, 'ts-06');
  assert.equal(tutorialCase.scenarioId, 'tutorial');
  assert.equal(tutorialCase.difficulty, 'low');
  assert.equal(tutorialCase.logs.length, 8);
  assert.equal(tutorialCase.documents.length, 2);
  assert.equal(tutorialCase.answer.evidenceGroups.length, 3);
  const ownEvidence = new Set([...tutorialCase.logs, ...tutorialCase.documents].map(item => item.id).concat(tutorialCase.contact.replyId));
  const primary = tutorialCase.logs.find(log => log.id === T.PRIMARY_LOG_ID);
  assert.ok(primary.event.includes(T.SEARCH_QUERY));
  for (const difficulty of ['low', 'medium', 'high']) {
    const scenario = D.scenarios.find(item => item.id === difficulty);
    assert.ok(!scenario.caseIds.includes(T.CASE_ID));
    for (const id of scenario.caseIds) {
      const regular = E.getCase(id);
      const ids = [...regular.logs, ...regular.documents].map(item => item.id).concat(regular.contact.replyId);
      assert.ok(ids.every(evidenceId => !ownEvidence.has(evidenceId)), id + ' does not share tutorial evidence');
    }
  }
  for (const step of T.STEPS.filter(item => item.kind === 'evidence')) {
    assert.ok(ownEvidence.has(step.value));
    assert.ok(tutorialCase.answer.evidenceGroups.some(group => group.includes(step.value)));
  }
  for (const difficulty of ['medium', 'high']) {
    assert.throws(() => E.createSession('tutorial', difficulty, T.CASE_ID), 'the dedicated tutorial cannot run with a deadline');
  }
});

test('fresh tutorial does not count any unperformed operation as complete', () => {
  const { state, session } = fixture();
  for (const step of T.STEPS) {
    assert.equal(T.complete(step, state, session), step.kind === 'read', step.id);
    assert.equal(T.complete(step, state, null), false, step.id + ' requires a tutorial case');
    assert.equal(T.complete(step, state, E.createSession('low', 'low')), false, step.id + ' cannot use another case');
  }
  assert.deepEqual(state, { version: 2, step: 0, seen: [], query: '', openLogs: [] });
});

test('reading or navigating ahead cannot skip unfinished operations', () => {
  const { state, session } = fixture();
  state.step = stepIndex('finish');
  T.mark(state, 'resources');
  T.mark(state, 'contact');
  assert.equal(T.normalize(state, session).step, stepIndex('case'));
  assert.equal(T.complete(stepById('submit'), state, session), false);
  assert.equal(session.records[T.CASE_ID].status, 'open');
});

test('seen flags are explicit, deduplicated, and limited to navigation steps', () => {
  const { state, session } = fixture();
  const originalStep = state.step;
  for (const step of T.STEPS.filter(item => item.kind === 'seen')) {
    assert.equal(T.complete(step, state, session), false);
    T.mark(state, step.flag);
    T.mark(state, step.flag);
    assert.equal(T.complete(step, state, session), true);
    assert.equal(state.seen.filter(flag => flag === step.flag).length, 1);
  }
  const seen = state.seen.slice();
  T.mark(state, 'submit');
  T.mark(state, T.PRIMARY_LOG_ID);
  T.mark(state, '__proto__');
  assert.deepEqual(state.seen, seen);
  assert.equal(state.step, originalStep);
  assert.equal(T.complete(stepById('log-evidence'), state, session), false);
});

test('a requested reply and an attached reply are separate learning actions', () => {
  const { state, session } = fixture();
  assert.throws(() => E.addEvidence(session, T.CASE_ID, 'ts-reply'), /まだ確認できません/);
  assert.equal(T.complete(stepById('request'), state, session), false);
  E.requestContact(session, T.CASE_ID);
  assert.equal(T.complete(stepById('request'), state, session), true);
  assert.equal(E.replyAvailable(session, T.CASE_ID), true, 'low difficulty replies without advancing time');
  assert.equal(T.complete(stepById('reply-evidence'), state, session), false);
  E.addEvidence(session, T.CASE_ID, 'ts-reply');
  assert.equal(T.complete(stepById('reply-evidence'), state, session), true);
});

test('submitting incomplete content does not complete the submission or finish step', () => {
  const { state, session } = fixture();
  assert.equal(E.submitCase(session, T.CASE_ID).passed, false);
  assert.equal(session.records[T.CASE_ID].attempts, 1);
  assert.equal(T.complete(stepById('submit'), state, session), false);
  assert.equal(T.complete(stepById('finish'), state, session), false);
});

test('a correct complete draft remains a draft until the learner submits it', () => {
  const { state, session } = readyToSubmit();
  assert.equal(E.assessCase(session, T.CASE_ID).passed, true);
  assert.equal(T.complete(stepById('submit'), state, session), false);
  assert.equal(T.complete(stepById('finish'), state, session), false);
  E.submitCase(session, T.CASE_ID);
  assert.equal(T.complete(stepById('submit'), state, session), true);
  assert.equal(T.complete(stepById('finish'), state, session), true);
});

test('changing any guided decision to a wrong answer rewinds to that field', () => {
  const wrongValues = { verdict: 'incident', priority: 'high', target: 'another-server', action: 'contain' };
  for (const [id, wrong] of Object.entries(wrongValues)) {
    const { state, session } = readyToSubmit();
    const step = stepById(id);
    session.records[T.CASE_ID].draft[step.field] = wrong;
    assert.equal(T.complete(step, state, session), false, id);
    assert.equal(T.normalize(state, session).step, stepIndex(id), id);
    session.records[T.CASE_ID].draft[step.field] = step.value;
    assert.equal(T.complete(step, state, session), true, id + ' can be corrected');
    assert.equal(T.normalize(state, session).step, stepIndex(id), 'correction does not automatically advance');
  }
});

test('removing any required evidence rewinds to its evidence collection step', () => {
  for (const id of ['log-evidence', 'document-evidence', 'reply-evidence']) {
    const { state, session } = readyToSubmit();
    const step = stepById(id);
    assert.equal(E.removeEvidence(session, T.CASE_ID, step.value), true);
    assert.equal(T.complete(step, state, session), false);
    assert.equal(T.normalize(state, session).step, stepIndex(id), id);
    E.addEvidence(session, T.CASE_ID, step.value);
    assert.equal(T.complete(step, state, session), true);
  }
});

test('blank or whitespace-only reports rewind while nonempty learner wording is allowed', () => {
  for (const id of ['summary', 'next-step']) {
    for (const empty of ['', '  \n\t\u3000']) {
      const { state, session } = readyToSubmit();
      const step = stepById(id);
      session.records[T.CASE_ID].draft[step.field] = empty;
      assert.equal(T.complete(step, state, session), false);
      assert.equal(T.normalize(state, session).step, stepIndex(id));
      session.records[T.CASE_ID].draft[step.field] = '自分の言葉で記録した調査結果';
      assert.equal(T.complete(step, state, session), true);
    }
  }
});

test('normalize chooses the earliest missing prerequisite, not the most recent error', () => {
  const { state, session } = readyToSubmit();
  E.removeEvidence(session, T.CASE_ID, 'ts-doc-plan');
  session.records[T.CASE_ID].draft.verdict = 'incident';
  session.records[T.CASE_ID].draft.nextStep = '';
  assert.equal(T.normalize(state, session).step, stepIndex('document-evidence'));
});

test('saved tutorial restores its real case, current step, notes and viewed log while paused', () => {
  const { state, session } = readyToSubmit();
  state.query = T.SEARCH_QUERY;
  state.openLogs = [T.PRIMARY_LOG_ID];
  E.advance(session, 12);
  const serialized = JSON.stringify({ session, tutorial: state });
  const raw = JSON.parse(serialized);
  const restoredSession = E.hydrate(raw.session);
  const restoredState = T.hydrate(raw.tutorial, restoredSession);
  assert.equal(restoredSession.phase, 'paused');
  assert.equal(restoredSession.elapsed, 12);
  assert.deepEqual(restoredState, state);
  assert.notEqual(restoredState.seen, raw.tutorial.seen);
  assert.equal(restoredSession.records[T.CASE_ID].draft.summary, session.records[T.CASE_ID].draft.summary);
  assert.equal(T.complete(stepById('submit'), restoredState, restoredSession), false);
  E.resume(restoredSession);
  E.submitCase(restoredSession, T.CASE_ID);
  restoredState.step = stepIndex('finish');
  const completedSession = E.hydrate(JSON.parse(JSON.stringify(restoredSession)));
  assert.equal(completedSession.phase, 'completed');
  assert.equal(T.hydrate(restoredState, completedSession).step, stepIndex('finish'));
});

test('saved progress is rechecked against the restored evidence and decisions', () => {
  for (const corrupt of [
    value => E.removeEvidence(value.session, T.CASE_ID, T.PRIMARY_LOG_ID),
    value => { value.session.records[T.CASE_ID].draft.verdict = 'unknown'; }
  ]) {
    const value = readyToSubmit();
    corrupt(value);
    const expected = value.session.records[T.CASE_ID].evidenceIds.includes(T.PRIMARY_LOG_ID) ? 'verdict' : 'log-evidence';
    const restored = E.hydrate(JSON.parse(JSON.stringify(value.session)));
    assert.equal(T.hydrate(value.state, restored).step, stepIndex(expected));
  }
  const { session } = fixture();
  assert.equal(T.hydrate({ ...T.create(), step: stepIndex('finish') }, session).step, stepIndex('case'));
});

test('hydrate rejects invalid required state values and out-of-range steps', () => {
  const { state, session } = fixture();
  const invalid = [
    null, undefined, {}, [],
    { ...state, version: 0 }, { ...state, version: 1 }, { ...state, version: '2' },
    { ...state, step: -1 }, { ...state, step: T.STEPS.length },
    { ...state, step: 1.5 }, { ...state, step: '1' },
    { ...state, step: NaN }, { ...state, step: Infinity },
    { ...state, seen: null }, { ...state, seen: {} },
    { ...state, seen: ['unknown'] }, { ...state, seen: [null] },
    { ...state, seen: Array(50).fill('case') }
  ];
  for (const raw of invalid) assert.throws(() => T.hydrate(raw, session), /保存内容が不正/);
});

test('hydrate rejects normal shifts, other cases, and timed tutorials', () => {
  const state = T.create();
  const wrongSessions = [
    null,
    E.createSession('low', 'low'),
    E.createSession('medium', 'medium'),
    E.createSession('high', 'high'),
    E.createSession('low', 'low', D.scenarios.find(item => item.id === 'low').caseIds[0]),
    { ...fixture().session, individualCaseId: null },
    { ...fixture().session, difficulty: 'medium' },
    { ...fixture().session, difficulty: 'high' },
    { ...fixture().session, scenarioId: 'low' }
  ];
  for (const session of wrongSessions) assert.throws(() => T.hydrate(state, session), /保存内容が不正/);
});

test('hydrate bounds optional display state and discards unknown open logs', () => {
  const { state, session } = fixture();
  const restored = T.hydrate({ ...state, seen: ['case', 'case'], query: '検'.repeat(500), openLogs: ['unrelated', T.PRIMARY_LOG_ID, T.PRIMARY_LOG_ID] }, session);
  assert.deepEqual(restored.seen, ['case']);
  assert.equal(restored.query.length, 200);
  assert.deepEqual(restored.openLogs, [T.PRIMARY_LOG_ID]);
  assert.deepEqual(T.hydrate({ ...state, query: {}, openLogs: T.PRIMARY_LOG_ID }, session), state);
});
