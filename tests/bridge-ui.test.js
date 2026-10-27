'use strict';
// DOM-only integration checks for our own application code. No browser, page
// navigation, remote resources, network APIs, layout engine or real clocks.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
// A normal checkout uses npm's dev dependency. The fallback is the isolated
// dependency folder used by the authoring workspace and is not runtime code.
let jsdom;
if (process.env.SOCROOM_JSDOM_MODULE) jsdom = require(process.env.SOCROOM_JSDOM_MODULE);
else {
  try { jsdom = require('jsdom'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    jsdom = require('../../test-runtime/node_modules/jsdom');
  }
}
const { JSDOM, VirtualConsole } = jsdom;

const SRC = path.join(__dirname, '../src');
const STORE = 'socroom.offline.v2';
const TUTORIAL_STORE = 'socroom.tutorial.v2';
const BRIDGE_STORE = 'socroom.bridge.v1';
const read = name => fs.readFileSync(path.join(SRC, name), 'utf8');
const escapeScript = source => source.replace(/<\/script/gi, '<\\/script');

function assembledHTML() {
  let html = read('ui.html');
  const replacements = { CSS: '', DATA: read('data.js'), ENGINE: read('engine.js'), SHELL: read('vendor-shell.js'), TERMINAL: read('terminal.js'), TUTORIAL: read('tutorial.js'), BRIDGE: read('bridge.js'), APP: read('app.js') };
  for (const [marker, content] of Object.entries(replacements)) html = html.replace(`/*__${marker}__*/`, () => marker === 'CSS' ? content : escapeScript(content));
  return html;
}

function harness(t, saved = null, options = {}) {
  const storage = new Map(saved ? [[STORE, typeof saved === 'string' ? saved : JSON.stringify(saved)]] : []);
  if (options.tutorialSaved) storage.set(TUTORIAL_STORE, typeof options.tutorialSaved === 'string' ? options.tutorialSaved : JSON.stringify(options.tutorialSaved));
  if (options.bridgeSaved) storage.set(BRIDGE_STORE, typeof options.bridgeSaved === 'string' ? options.bridgeSaved : JSON.stringify(options.bridgeSaved));
  for (const [kind,value] of Object.entries(options.legacySaves || {})) storage.set(kind === 'normal' ? 'socroom.offline.v1' : 'socroom.tutorial.v1', JSON.stringify(value));
  const errors = [], downloads = [], blobs = new Map(), intervals = new Map(), timeouts = new Map();
  let now = 0, nextId = 0, hidden = false, networkCalls = 0;
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(assembledHTML(), {
    runScripts: 'dangerously', // Only the reviewed local src files above execute.
    // Deliberately omit resources and url: no resource loading or navigation.
    virtualConsole: console,
    beforeParse(window) {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: {
        getItem(key) { if (options.failStorage) throw new Error('storage unavailable'); return storage.get(key) ?? null; },
        setItem(key, value) { if (options.failStorage) throw new Error('storage unavailable'); storage.set(key, String(value)); },
        removeItem(key) { storage.delete(key); }
      } });
      Object.defineProperty(window.performance, 'now', { value: () => now });
      window.scrollTo = (x, y) => {
        window.scrollX = typeof x === 'object' ? x.left || 0 : x;
        window.scrollY = typeof x === 'object' ? x.top || 0 : y;
      };
      Object.defineProperty(window.document, 'hidden', { configurable: true, get: () => hidden });
      Object.defineProperty(window.document, 'visibilityState', { configurable: true, get: () => hidden ? 'hidden' : 'visible' });
      window.setInterval = (fn, delay) => { const id = ++nextId; intervals.set(id, { fn, delay }); return id; };
      window.clearInterval = id => intervals.delete(id);
      window.setTimeout = (fn, delay = 0) => { const id = ++nextId; timeouts.set(id, { fn, at: now + delay }); return id; };
      window.clearTimeout = id => timeouts.delete(id);
      const denied = () => { networkCalls++; throw new Error('Network APIs are prohibited in DOM tests'); };
      window.fetch = denied;
      window.XMLHttpRequest = denied;
      window.WebSocket = denied;
      window.EventSource = denied;
      window.navigator.sendBeacon = denied;
      window.TextEncoder = TextEncoder;
      window.TextDecoder = TextDecoder;
      window.Blob = class MemoryBlob {
        constructor(parts, config = {}) { this.content = parts.map(String).join(''); this.type = config.type || ''; this.size = this.content.length; }
        async text() { return this.content; }
      };
      window.URL.createObjectURL = blob => { const url = 'blob:dom-unit-' + (++nextId); blobs.set(url, blob); return url; };
      window.URL.revokeObjectURL = url => blobs.delete(url);
      window.HTMLAnchorElement.prototype.click = function () {
        if (this.download) downloads.push({ name: this.download, content: blobs.get(this.href)?.content || '', type: blobs.get(this.href)?.type });
      };
      window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
      window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
    }
  });
  const window = dom.window, document = window.document;
  function get(selector) { const node = document.querySelector(selector); assert.ok(node, 'DOM node exists: ' + selector); return node; }
  function click(selector) { const node = get(selector); assert.equal(Boolean(node.disabled), false, 'control enabled: ' + selector); node.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })); }
  function input(selector, value, type = 'input') { const node = get(selector); assert.equal(Boolean(node.disabled), false); node.value = value; node.dispatchEvent(new window.Event(type, { bubbles: true })); }
  function submit(selector) { get(selector).dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); }
  function flush() {
    for (const [id, timer] of [...timeouts]) if (timer.at <= now) { timeouts.delete(id); timer.fn(); }
  }
  function tick(seconds, quantum = 0.5) {
    for (let remaining = seconds; remaining > 0;) {
      const step = Math.min(quantum, remaining); now += step * 1000; remaining -= step;
      for (const timer of [...intervals.values()]) timer.fn();
      flush();
    }
  }
  function visible(value) { hidden = !value; document.dispatchEvent(new window.Event('visibilitychange')); }
  async function importFile(content, size) {
    const file = { name: 'progress.json', size: size ?? content.length, text: async () => content };
    Object.defineProperty(get('#import-file'), 'files', { configurable: true, value: [file] });
    get('#import-file').dispatchEvent(new window.Event('change', { bubbles: true }));
    await Promise.resolve(); await Promise.resolve();
  }
  t.after(() => { assert.equal(networkCalls, 0, 'application makes no network request'); assert.deepEqual(errors.map(e => e.message), [], 'no script errors'); dom.window.close(); });
  return { window, document, get, click, input, submit, tick, visible, importFile, downloads, storage };
}

function saveSnapshot(h) {
  h.click('[data-action="export"]');
  return JSON.parse(h.downloads.at(-1).content);
}
function bridgeCase(h) {
  const saved = saveSnapshot(h);
  return h.window.SOC_DATA.cases.find(c => c.id === saved.session.selectedCaseId);
}
function collectAndReport(h, c) {
  h.click('[data-tab="contact"]');
  if (h.document.querySelector('[data-action="contact"]')) h.click('[data-action="contact"][data-question="specific"]');
  for (const group of c.answer.evidenceGroups) {
    let saved = saveSnapshot(h);
    let id = group.find(ref => h.window.SocEngine.evidenceAvailable(saved.session, ref));
    for (let tries = 0; !id && tries < 20; tries++) {
      h.click('[data-action="step"]');
      saved = saveSnapshot(h);
      id = group.find(ref => h.window.SocEngine.evidenceAvailable(saved.session, ref));
    }
    assert.ok(id, 'required evidence is available: ' + c.id);
    const tab = c.logs.some(log => log.id === id) ? 'logs' : c.documents.some(doc => doc.id === id) ? 'resources' : 'contact';
    h.click(`[data-tab="${tab}"]`);
    if (!saved.session.records[c.id].evidenceIds.includes(id)) h.click(`[data-evidence="${id}"]`);
  }
  for (const [name, value] of Object.entries({ verdict: c.answer.verdict, priority: c.answer.priorities[0], action: c.answer.actions[0], target: c.answer.target, summary: `${c.answer.target} の根拠を時刻と対象に照らして確認した。確認できた事実と残る不明点を区別する。`, nextStep: '根拠を添えて担当者へ引き継ぎ、未確認事項の確認方法を伝える。' })) h.input('#draft-' + name, value);
  h.submit('#case-form');
}
function reflectAndAdvance(h) {
  assert.equal(h.get('#dialog').open, true);
  assert.match(h.get('#dialog-title').textContent, /実務演習の振り返り/);
  assert.equal(h.document.querySelectorAll('.bridge-comparison section').length, 2, 'learner report and example are compared');
  assert.match(h.get('#dialog').textContent, /文章の意味や品質は自動採点していません/);
  assert.equal(h.get('[data-action="bridge-review-next"]').disabled, true, 'self review is an explicit learning step');
  const checkbox = h.get('#bridge-reflected');
  checkbox.checked = true;
  checkbox.dispatchEvent(new h.window.Event('change', { bubbles: true }));
  assert.equal(h.get('[data-action="bridge-review-next"]').disabled, false);
  h.click('[data-action="bridge-review-next"]');
}

// These tests exercise the DOM and the saved file format. They deliberately use
// the engine answer data as an oracle, not a UI shortcut available to learners.
test('five dedicated practice cases gradually remove guidance while requiring real evidence and reports', t => {
  const h = harness(t);
  const scenario = h.window.SOC_DATA.scenarios.find(s => s.id === 'bridge');
  assert.ok(scenario);
  assert.equal(scenario.caseIds.length, 5);
  const normalIds = h.window.SOC_DATA.scenarios.filter(s => !s.hidden).flatMap(s => s.caseIds);
  scenario.caseIds.forEach(id => assert.equal(normalIds.includes(id), false));
  assert.equal(scenario.caseIds.includes(h.window.SocTutorial.CASE_ID), false);
  h.click('[data-action="bridge-start"]');
  const stages = ['guided', 'guided', 'checklist', 'checklist', 'independent'];
  for (let index = 0; index < 5; index++) {
    const c = bridgeCase(h);
    assert.equal(c.id, scenario.caseIds[index]);
    const saved = saveSnapshot(h);
    assert.equal(saved.bridge.index, index);
    assert.equal(saved.session.scenarioId, 'bridge');
    assert.equal(saved.session.difficulty, 'low');
    assert.equal(Object.keys(saved.session.records).length, 1);
    assert.equal(h.get('#bridge-guide').dataset.stage, stages[index]);
    assert.equal(h.get('#draft-summary').value, '', 'no answer text is inserted for the learner');
    assert.equal(h.get('#draft-nextStep').value, '');
    assert.equal(h.get('#draft-verdict').value, '');
    if (stages[index] === 'checklist') {
      assert.ok(h.document.querySelector('.bridge-checklist'));
      const check = c.bridge.steps.find(step => step.kind !== 'submitted');
      assert.equal(h.get(`[data-check="${check.id}"]`).classList.contains('done'), false);
      performGuidedOperation(h, c, check);
      assert.equal(h.get(`[data-check="${check.id}"]`).classList.contains('done'), true, 'real operations update checklist automatically');
    }
    if (stages[index] === 'independent') {
      assert.equal(h.document.querySelector('[data-action="bridge-next"]'), null);
      assert.equal(h.document.querySelector('.bridge-checklist'), null);
    }
    h.submit('#case-form');
    assert.equal(h.get('#dialog').open, false, 'an incomplete assessment cannot complete the course');
    collectAndReport(h, c);
    const complete = saveSnapshot(h);
    assert.equal(complete.session.phase, 'completed');
    assert.equal(complete.session.records[c.id].assessment.passed, true);
    assert.equal(complete.session.records[c.id].assessment.score, 100);
    reflectAndAdvance(h);
  }
  assert.ok(h.document.querySelector('.home'));
  const persisted = JSON.parse(h.storage.get(BRIDGE_STORE));
  assert.equal(persisted.bridge.completed.length, 5);
  assert.equal(h.storage.has(STORE), false, 'the bridge never writes a normal shift save');
  assert.equal(h.storage.has(TUTORIAL_STORE), false, 'the bridge never writes a tutorial save');
});

test('bridge time has no deadline, and pause or a hidden document stops elapsed time', t => {
  const h = harness(t);
  h.click('[data-action="bridge-start"]');
  h.tick(1300);
  let saved = saveSnapshot(h);
  assert.equal(saved.session.elapsed, 1300);
  assert.equal(saved.session.phase, 'running');
  assert.equal(h.window.SocEngine.getDeadline(saved.session, saved.session.selectedCaseId), null);
  assert.equal(h.get('#dialog').open, false);
  h.click('[data-action="pause"]');
  h.visible(false);
  h.tick(30);
  h.visible(true);
  assert.equal(h.get('#dialog').open, true, 'a manual pause remains paused after changing tabs');
  assert.equal(saveSnapshot(h).session.phase, 'paused');
  assert.equal(saveSnapshot(h).session.elapsed, 1300);
  h.click('[data-action="resume"]');
  h.visible(false);
  h.tick(30);
  assert.equal(saveSnapshot(h).session.elapsed, 1300);
  h.visible(true);
  assert.equal(h.get('#dialog').open, false, 'untimed practice resumes without a pause dialog');
  assert.equal(saveSnapshot(h).session.phase, 'running');
  h.tick(1);
  saved = saveSnapshot(h);
  assert.equal(saved.session.elapsed, 1301);
  assert.equal(saved.session.phase, 'running');
});

test('entering and exiting bridge preserves normal and tutorial notes and terminal workspaces', t => {
  const h = harness(t);
  h.click('[data-difficulty="medium"]');
  h.click('[data-action="start"]');
  h.input('#draft-summary', '通常勤務の途中メモ');
  h.click('[data-tab="terminal"]');
  h.input('#terminal-input', 'echo normal > note.txt');
  h.submit('#terminal-form');
  h.tick(3);
  const before = saveSnapshot(h);
  h.click('[data-action="home"]');
  h.click('[data-action="tutorial-start"]');
  h.input('#draft-summary', 'チュートリアルだけのメモ');
  h.click('[data-tab="terminal"]');
  h.input('#terminal-input', 'echo tutorial > note.txt');
  h.submit('#terminal-form');
  h.click('[data-action="tutorial-exit"]');
  const tutorialBefore = h.storage.get(TUTORIAL_STORE);
  h.click('[data-action="bridge-start"]');
  h.input('#draft-summary', '実務演習だけのメモ');
  h.click('[data-tab="terminal"]');
  h.input('#terminal-input', 'echo bridge > note.txt');
  h.submit('#terminal-form');
  const training = saveSnapshot(h);
  assert.equal(training.workspace.files['/home/analyst/note.txt'], 'bridge\n');
  h.click('[data-action="bridge-exit"]');
  h.click('[data-action="continue"]');
  h.click('[data-action="resume"]');
  const after = saveSnapshot(h);
  assert.equal(after.session.scenarioId, before.session.scenarioId);
  assert.equal(after.session.elapsed, before.session.elapsed);
  assert.equal(after.session.records[after.session.selectedCaseId].draft.summary, '通常勤務の途中メモ');
  assert.equal(after.workspace.files['/home/analyst/note.txt'], 'normal\n');
  assert.equal(JSON.parse(h.storage.get(BRIDGE_STORE)).session.records[training.session.selectedCaseId].draft.summary, '実務演習だけのメモ');
  assert.equal(h.storage.get(TUTORIAL_STORE), tutorialBefore);
  h.click('[data-action="home"]');
  h.click('[data-action="tutorial-resume"]');
  const tutorialAfter = saveSnapshot(h);
  assert.equal(tutorialAfter.session.records[tutorialAfter.session.selectedCaseId].draft.summary, 'チュートリアルだけのメモ');
  assert.equal(tutorialAfter.workspace.files['/home/analyst/note.txt'], 'tutorial\n');
});

test('bridge reload resumes its own case, course history, notes and terminal workspace', t => {
  const first = harness(t);
  first.click('[data-action="bridge-start"]');
  collectAndReport(first, bridgeCase(first));
  reflectAndAdvance(first);
  first.input('#draft-summary', '第2演習の未提出メモ');
  first.click('[data-tab="terminal"]');
  first.input('#terminal-input', 'echo preserved > practice.txt');
  first.submit('#terminal-form');
  first.tick(6);
  first.window.dispatchEvent(new first.window.Event('pagehide'));
  const bridgeSaved = first.storage.get(BRIDGE_STORE);
  const restored = harness(t, null, { bridgeSaved });
  assert.ok(restored.document.querySelector('[data-action="bridge-resume"]'));
  restored.click('[data-action="bridge-resume"]');
  if (restored.get('#dialog').open) restored.click('[data-action="resume"]');
  const result = saveSnapshot(restored);
  assert.equal(result.bridge.index, 1);
  assert.equal(result.bridge.completed.length, 1);
  assert.equal(result.session.records[result.session.selectedCaseId].draft.summary, '第2演習の未提出メモ');
  assert.equal(result.workspace.files['/home/analyst/practice.txt'], 'preserved\n');
  assert.equal(restored.storage.has(STORE), false);
  assert.equal(restored.storage.has(TUTORIAL_STORE), false);
});

test('bridge imported save restores progress and rejects mismatched course data without losing active work', async t => {
  const original = harness(t);
  original.click('[data-action="bridge-start"]');
  original.input('#draft-summary', '読み込む実務演習メモ');
  const good = saveSnapshot(original);
  const restored = harness(t);
  await restored.importFile(JSON.stringify(good));
  if (restored.document.querySelector('[data-action="import-confirmed"]')) restored.click('[data-action="import-confirmed"]');
  if (restored.get('#dialog').open && restored.document.querySelector('[data-action="resume"]')) restored.click('[data-action="resume"]');
  assert.ok(restored.document.querySelector('#bridge-guide'));
  assert.equal(restored.get('#draft-summary').value, '読み込む実務演習メモ');
  const wrong = JSON.parse(JSON.stringify(good));
  wrong.bridge.index = 4;
  await restored.importFile(JSON.stringify(wrong));
  assert.match(restored.get('#toast').textContent, /読み込めませんでした/);
  assert.equal(restored.get('#draft-summary').value, '読み込む実務演習メモ');
  const missing = JSON.parse(JSON.stringify(good));
  delete missing.bridge;
  await restored.importFile(JSON.stringify(missing));
  assert.match(restored.get('#toast').textContent, /読み込めませんでした/);
  assert.ok(restored.document.querySelector('#bridge-guide'));
});

test('Japanese IME keeps draft node and focus stable while bridge guidance reacts after commit', t => {
  const h = harness(t);
  h.click('[data-action="bridge-start"]');
  const node = h.get('#draft-summary');
  node.focus();
  node.dispatchEvent(new h.window.CompositionEvent('compositionstart', { bubbles: true }));
  node.value = 'かくにん';
  node.dispatchEvent(new h.window.InputEvent('input', { bubbles: true, isComposing: true, data: 'かくにん' }));
  h.tick(5);
  assert.equal(h.get('#draft-summary'), node);
  assert.equal(h.document.activeElement, node);
  node.value = '確認できた事実と未確認事項を記録する。';
  node.dispatchEvent(new h.window.InputEvent('input', { bubbles: true, isComposing: true, data: node.value }));
  node.dispatchEvent(new h.window.CompositionEvent('compositionend', { bubbles: true, data: node.value }));
  assert.equal(h.get('#draft-summary').value, '確認できた事実と未確認事項を記録する。');
  assert.equal(saveSnapshot(h).session.records[bridgeCase(h).id].draft.summary, '確認できた事実と未確認事項を記録する。');
});

function performGuidedOperation(h, c, step) {
  if (step.kind === 'seen') {
    if (step.flag === 'context') {
      h.click('[data-action="context"]');
      h.click('#dialog .modal-actions [data-action="close-dialog"]');
    } else if (step.flag === 'raw') {
      h.click('[data-tab="logs"]');
      const details = h.get('[data-log-details]');
      details.open = true;
      details.dispatchEvent(new h.window.Event('toggle'));
    } else h.click(`[data-tab="${step.flag}"]`);
  } else if (step.kind === 'request') {
    h.click('[data-tab="contact"]');
    h.click('[data-action="contact"][data-question="specific"]');
  } else if (step.kind === 'evidence') {
    const candidates = step.source === 'log' ? c.logs.map(x => x.id) : step.source === 'document' ? c.documents.map(x => x.id) : [c.contact.replyId];
    const id = c.answer.evidenceGroups.flat().find(ref => candidates.includes(ref)) || candidates[0];
    h.click(`[data-tab="${step.source === 'log' ? 'logs' : step.source === 'document' ? 'resources' : 'contact'}"]`);
    h.click(`[data-evidence="${id}"]`);
    return id;
  } else if (step.kind === 'draft') {
    const values = { verdict: c.answer.verdict, priority: c.answer.priorities[0], target: c.answer.target, action: c.answer.actions[0], summary: `${c.answer.target} で確認した事実とその根拠を記録する。`, nextStep: '担当者へ未確認事項と次の確認先を引き継ぐ。' };
    step.fields.forEach(field => h.input('#draft-' + field, values[field]));
  } else assert.fail('unexpected early guide operation: ' + step.kind);
}

test('guided next requires actual actions, locate finds the operation, and removing evidence rewinds its step', t => {
  const h = harness(t);
  h.click('[data-action="bridge-start"]');
  const c = bridgeCase(h), steps = c.bridge.steps;
  let collected = null, evidenceStep = null;
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index], before = saveSnapshot(h);
    assert.equal(h.get('#bridge-guide').dataset.step, step.id);
    const done = h.window.SocBridge.stepComplete(step, before.bridge, before.session);
    assert.equal(h.get('[data-action="bridge-next"]').disabled, !done);
    if (!done) {
      // A synthetic click must not bypass a disabled button's application guard.
      h.get('[data-action="bridge-next"]').dispatchEvent(new h.window.MouseEvent('click', { bubbles: true, cancelable: true }));
      assert.equal(h.get('#bridge-guide').dataset.step, step.id);
      h.click('[data-tab="terminal"]');
      h.click('[data-action="bridge-locate"]');
      assert.equal(h.get('#bridge-guide').dataset.step, step.id);
      assert.ok(h.document.querySelector('.bridge-target'), 'the next operation is visibly identified');
      collected = performGuidedOperation(h, c, step) || collected;
      assert.equal(h.get('[data-action="bridge-next"]').disabled, false);
    }
    h.click('[data-action="bridge-next"]');
    if (step.kind === 'evidence') { evidenceStep = step.id; break; }
  }
  assert.ok(collected);
  assert.ok(evidenceStep);
  const after = saveSnapshot(h);
  assert.ok(after.session.records[c.id].evidenceIds.includes(collected));
  h.click('[data-action="bridge-back"]');
  assert.equal(h.get('#bridge-guide').dataset.step, evidenceStep);
  assert.equal(h.get('[data-action="bridge-next"]').disabled, false, 'going back retains completed operations');
  h.click('[data-action="bridge-next"]');
  h.click(`[data-remove-evidence="${collected}"]`);
  assert.equal(h.get('#bridge-guide').dataset.step, evidenceStep);
  assert.equal(h.get('[data-action="bridge-next"]').disabled, true, 'removing the proof makes the task incomplete again');
});

test('restarting the bridge offers a backup and resets only after the explicit restart control', t => {
  const h = harness(t);
  h.click('[data-difficulty="medium"]');
  h.click('[data-action="start"]');
  h.input('#draft-summary', 'リセット対象ではない通常勤務');
  h.click('[data-action="home"]');
  const normalBefore = h.storage.get(STORE);
  h.click('[data-action="bridge-start"]');
  collectAndReport(h, bridgeCase(h));
  reflectAndAdvance(h);
  h.input('#draft-summary', 'やり直す前の記録');
  const before = saveSnapshot(h);
  h.click('[data-action="bridge-exit"]');
  h.click('[data-action="bridge-restart"]');
  assert.equal(JSON.parse(h.storage.get(BRIDGE_STORE)).bridge.completed.length, 1);
  h.click('[data-action="bridge-export-saved"]');
  assert.deepEqual(JSON.parse(h.downloads.at(-1).content).bridge, before.bridge);
  h.click('[data-action="close-dialog"]');
  assert.equal(JSON.parse(h.storage.get(BRIDGE_STORE)).bridge.completed.length, 1);
  h.click('[data-action="bridge-restart"]');
  h.click('[data-action="bridge-reset-confirmed"]');
  const reset = saveSnapshot(h);
  assert.equal(reset.bridge.index, 0);
  assert.equal(reset.bridge.completed.length, 0);
  assert.equal(reset.session.records[reset.session.selectedCaseId].draft.summary, '');
  assert.equal(h.storage.get(STORE), normalBefore);
});

test('normal-save import from bridge backs up the original normal shift and preserves bridge progress', async t => {
  const author = harness(t);
  author.click('[data-difficulty="low"]');
  author.click('[data-action="start"]');
  author.input('#draft-summary', '読み込む別の通常勤務');
  const incoming = saveSnapshot(author);
  const h = harness(t);
  h.click('[data-difficulty="medium"]');
  h.click('[data-action="start"]');
  h.input('#draft-summary', '置換前の通常勤務');
  h.click('[data-action="home"]');
  h.click('[data-action="bridge-start"]');
  h.input('#draft-summary', '保持する実務演習の記録');
  const practice = saveSnapshot(h);
  await h.importFile(JSON.stringify(incoming));
  assert.match(h.get('#dialog').textContent, /通常勤務を置き換え/);
  h.click('[data-action="export-before-import"]');
  const backup = JSON.parse(h.downloads.at(-1).content);
  assert.equal(backup.bridge, undefined);
  assert.equal(backup.session.scenarioId, 'medium');
  assert.equal(backup.session.records[backup.session.selectedCaseId].draft.summary, '置換前の通常勤務');
  h.click('[data-action="import-confirmed"]');
  assert.equal(h.document.querySelector('#bridge-guide'), null);
  assert.match(h.get('#dialog-title').textContent, /一時停止/);
  h.click('[data-action="resume"]');
  assert.equal(h.get('#draft-summary').value, '読み込む別の通常勤務');
  assert.equal(JSON.parse(h.storage.get(BRIDGE_STORE)).session.records[practice.session.selectedCaseId].draft.summary, '保持する実務演習の記録');
  h.click('[data-action="home"]');
  h.click('[data-action="bridge-resume"]');
  assert.equal(h.get('#draft-summary').value, '保持する実務演習の記録');
});

test('bridge remains resumable and exportable when browser storage is unavailable', t => {
  const h = harness(t, null, { failStorage: true });
  h.click('[data-difficulty="low"]');
  h.click('[data-action="start"]');
  h.input('#draft-summary', '保存不可でも保持する通常勤務');
  h.click('[data-action="home"]');
  h.click('[data-action="bridge-start"]');
  h.input('#draft-summary', 'メモリ内に保持する実務演習');
  h.click('[data-action="bridge-exit"]');
  h.click('[data-action="bridge-resume"]');
  assert.equal(h.get('#draft-summary').value, 'メモリ内に保持する実務演習');
  assert.match(h.get('#save-status').textContent, /自動保存不可/);
  const exported = saveSnapshot(h);
  assert.equal(exported.session.records[exported.session.selectedCaseId].draft.summary, 'メモリ内に保持する実務演習');
  h.click('[data-action="bridge-exit"]');
  h.click('[data-action="continue"]');
  h.click('[data-action="resume"]');
  assert.equal(h.get('#draft-summary').value, '保存不可でも保持する通常勤務');
});

test('optional reflection separates facts, limits and next actions and survives a save round trip', t => {
  const h = harness(t);
  h.click('[data-action="bridge-start"]');
  const c = bridgeCase(h);
  collectAndReport(h,c);
  const reflection = {
    facts:'09:10のsupport-12更新は完了ログと申請の対象が一致した。',
    limits:'別の時間帯や利用者による直接操作までは確認していない。',
    next:'配布管理担当へ確認した更新範囲を引き継ぐ。'
  };
  assert.equal(h.document.querySelectorAll('[data-reflection]').length,3);
  for(const [key,value] of Object.entries(reflection))h.input(`[data-reflection="${key}"]`,value);
  const saved = saveSnapshot(h);
  assert.deepEqual(saved.bridge.reflections[c.id],reflection);
  h.click('[data-action="report"]');
  for(const value of Object.values(reflection))assert.ok(h.downloads.at(-1).content.includes(value));
  const restored = harness(t,null,{bridgeSaved:saved});
  restored.click('[data-action="bridge-resume"]');
  assert.equal(restored.get('#dialog').open,true);
  for(const [key,value] of Object.entries(reflection))assert.equal(restored.get(`[data-reflection="${key}"]`).value,value);
  reflectAndAdvance(restored);
  assert.equal(saveSnapshot(restored).bridge.index,1);
});
