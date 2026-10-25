/* A separate, untimed learning course whose support fades between cases. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'), require('./engine.js'), require('./terminal.js'));
  else root.SocBridge = factory(root.SOC_DATA, root.SocEngine, root.SocTerminal);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA, ENGINE, TERMINAL) {
  'use strict';

  const CASE_IDS = Object.freeze((DATA.scenarios.find(item => item.id === 'bridge')?.caseIds || []).slice());
  const FLAGS = new Set(['context', 'logs', 'resources', 'contact', 'raw']);
  const FIELDS = new Set(['verdict', 'priority', 'action', 'target', 'summary', 'nextStep']);
  const error = () => new Error('ガイド付き実務演習の保存内容が不正です。');
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const clone = value => JSON.parse(JSON.stringify(value));

  function create() {
    if (CASE_IDS.length !== 5) throw new Error('ガイド付き実務演習の教材を読み込めません。');
    return { version: 1, index: 0, guide: { step: 0, seen: [] }, completed: [], reflections: {}, reviewArchive: {}, reviewWorkspaces: {} };
  }
  function currentCase(course) {
    return Number.isInteger(course?.index) && course.index >= 0 && course.index < CASE_IDS.length ? ENGINE.getCase(CASE_IDS[course.index]) : null;
  }
  function matches(session, id) {
    return !!(id && session && session.scenarioId === 'bridge' && session.difficulty === 'low' && session.individualCaseId === id && plain(session.records) && Object.keys(session.records).length === 1 && Object.hasOwn(session.records, id));
  }
  function stepComplete(step, course, session) {
    const c = currentCase(course);
    if (!c || !plain(step) || !matches(session, c.id)) return false;
    const record = session.records[c.id];
    if (step.kind === 'seen') return FLAGS.has(step.flag) && Array.isArray(course.guide?.seen) && course.guide.seen.includes(step.flag);
    if (step.kind === 'request') return record.requestAt !== null && ENGINE.replyAvailable(session, c.id);
    if (step.kind === 'evidence') {
      const ownIds = step.source === 'log' ? c.logs.map(item => item.id) : step.source === 'document' ? c.documents.map(item => item.id) : step.source === 'reply' && c.contact ? [c.contact.replyId] : [];
      return Array.isArray(record.evidenceIds) && ownIds.some(id => record.evidenceIds.includes(id) && ENGINE.evidenceAvailable(session, id));
    }
    if (step.kind === 'draft') return Array.isArray(step.fields) && step.fields.length > 0 && step.fields.every(field => FIELDS.has(field) && typeof record.draft?.[field] === 'string' && record.draft[field].trim().length > 0);
    if (step.kind === 'submitted') return record.status === 'resolved' && record.assessment?.passed === true && session.phase === 'completed';
    return false;
  }
  function mark(course, flag) {
    if (FLAGS.has(flag) && Array.isArray(course?.guide?.seen) && !course.guide.seen.includes(flag)) course.guide.seen.push(flag);
  }
  function normalize(course, session) {
    const c = currentCase(course);
    if (!c || !plain(course.guide)) throw error();
    const steps = c.bridge.steps;
    course.guide.step = Math.max(0, Math.min(Number.isInteger(course.guide.step) ? course.guide.step : 0, Math.max(0, steps.length - 1)));
    for (let index = 0; index < course.guide.step; index += 1) {
      if (!stepComplete(steps[index], course, session)) { course.guide.step = index; break; }
    }
    return course;
  }
  function validCompletion(session, id) {
    if (!matches(session, id) || session.phase !== 'completed') throw error();
    const restored = ENGINE.hydrate(session);
    const record = restored.records[id];
    if (restored.phase !== 'completed' || record.status !== 'resolved' || record.assessment?.passed !== true) throw error();
    return restored;
  }
  function finish(course, session) {
    const c = currentCase(course);
    if (!c || !Array.isArray(course.completed) || ![course.index, course.index + 1].includes(course.completed.length)) throw error();
    validCompletion(session, c.id);
    if (course.completed.length === course.index + 1) return false;
    course.completed.push(clone(session));
    return true;
  }
  function advance(course) {
    const c = currentCase(course);
    if (!c || !Array.isArray(course.completed) || course.completed.length !== course.index + 1 || course.index === CASE_IDS.length - 1) return false;
    validCompletion(course.completed[course.index], c.id);
    course.index += 1;
    course.guide = { step: 0, seen: [] };
    return true;
  }
  function resumeArchived(course) {
    const c = currentCase(course);
    if (!c || !plain(course.reviewArchive) || !Object.hasOwn(course.reviewArchive, c.id)) return null;
    const session = ENGINE.hydrate(course.reviewArchive[c.id]);
    if (!matches(session, c.id)) throw error();
    delete course.reviewArchive[c.id];
    if (session.phase === 'completed') finish(course, session);
    return session;
  }
  function restoreReflections(raw) {
    if (raw === undefined) return {};
    if (!plain(raw) || Object.keys(raw).some(id => !CASE_IDS.includes(id))) throw error();
    const reflections = {};
    for (const [id, value] of Object.entries(raw)) {
      if (!plain(value) || Object.keys(value).some(key => !['facts', 'limits', 'next'].includes(key))) throw error();
      reflections[id] = {};
      for (const key of ['facts', 'limits', 'next']) {
        if (value[key] !== undefined && (typeof value[key] !== 'string' || value[key].length > 1400)) throw error();
        reflections[id][key] = value[key] || '';
      }
    }
    return reflections;
  }
  function restoreWorkspaces(raw) {
    if (raw === undefined) return {};
    if (!plain(raw) || Object.keys(raw).some(id => !CASE_IDS.includes(id))) throw error();
    let serialized;
    try { serialized = JSON.stringify(raw); } catch (_) { throw error(); }
    if (!serialized || serialized.length > Math.ceil(4.3 * 1024 * 1024)) throw error();
    const workspaces = {};
    for (const [id, value] of Object.entries(raw)) {
      if (!TERMINAL?.create) throw error();
      const terminal = TERMINAL.create({});
      terminal.setWorkspace(value);
      workspaces[id] = terminal.getWorkspace();
    }
    return workspaces;
  }
  function hydrate(raw, session) {
    if (!plain(raw) || raw.version !== 1 || !Number.isInteger(raw.index) || raw.index < 0 || raw.index >= CASE_IDS.length || !plain(raw.guide)) throw error();
    const c = ENGINE.getCase(CASE_IDS[raw.index]);
    if (!c?.bridge || !matches(session, c.id)) throw error();
    const maximumStep = Math.max(0, c.bridge.steps.length - 1);
    if (!Number.isInteger(raw.guide.step) || raw.guide.step < 0 || raw.guide.step > maximumStep || !Array.isArray(raw.guide.seen) || raw.guide.seen.length > FLAGS.size || raw.guide.seen.some(flag => !FLAGS.has(flag))) throw error();
    if (!Array.isArray(raw.completed) || ![raw.index, raw.index + 1].includes(raw.completed.length)) throw error();
    const completed = raw.completed.map((value, index) => {
      if (!matches(value, CASE_IDS[index]) || value.phase !== 'completed') throw error();
      const restored = ENGINE.hydrate(value);
      if (restored.phase !== 'completed' && !restored.migration?.untimedReview) throw error();
      return restored;
    });
    const reviewArchive = {};
    if (raw.reviewArchive !== undefined) {
      if (!plain(raw.reviewArchive) || Object.keys(raw.reviewArchive).length > CASE_IDS.length) throw error();
      for (const [id, value] of Object.entries(raw.reviewArchive)) {
        if (!CASE_IDS.includes(id) || CASE_IDS.indexOf(id) <= raw.index || !matches(value, id)) throw error();
        reviewArchive[id] = ENGINE.hydrate(value);
      }
    }
    const reflections = restoreReflections(raw.reflections);
    const reviewWorkspaces = restoreWorkspaces(raw.reviewWorkspaces);
    const reopenedIndex = completed.findIndex(value => value.phase !== 'completed');
    if (reopenedIndex >= 0) {
      // Revisit the first affected lesson, retaining all later notes and proof.
      // The app consumes resumeSession once; reviewArchive survives exports.
      completed.forEach((value, index) => { if (index > reopenedIndex) reviewArchive[CASE_IDS[index]] = value; });
      if (raw.index > reopenedIndex) reviewArchive[c.id] = clone(session);
      const restored = reopenedIndex === raw.index ? session : completed[reopenedIndex];
      const course = { version: 1, index: reopenedIndex, guide: { step: 0, seen: [] }, completed: completed.slice(0, reopenedIndex), reflections, reviewArchive, reviewWorkspaces, resumeSession: restored };
      return normalize(course, restored);
    }
    if (completed.length === raw.index + 1) validCompletion(session, c.id);
    const course = { version: 1, index: raw.index, guide: { step: raw.guide.step, seen: [...new Set(raw.guide.seen)] }, completed, reflections, reviewArchive, reviewWorkspaces };
    return normalize(course, session);
  }
  return Object.freeze({ CASE_IDS, create, currentCase, stepComplete, mark, normalize, finish, advance, resumeArchived, hydrate });
}));
