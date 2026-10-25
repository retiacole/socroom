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
const read = name => fs.readFileSync(path.join(SRC, name), 'utf8');
const escapeScript = source => source.replace(/<\/script/gi, '<\\/script');
const observer = `
  (() => {
    const original = globalThis.SocEngine;
    globalThis.SocEngine = Object.freeze({ ...original,
      createSession(...args) { const value = original.createSession(...args); globalThis.__observedSession = value; return value; },
      hydrate(...args) { const value = original.hydrate(...args); globalThis.__observedSession = value; return value; }
    });
  })();
`;
function assembledHTML() {
  let html = read('ui.html');
  const replacements = { CSS: '', DATA: read('data.js'), ENGINE: read('engine.js') + '\n' + observer, SHELL: read('vendor-shell.js'), TERMINAL: read('terminal.js'), TUTORIAL: read('tutorial.js'), BRIDGE: read('bridge.js'), APP: read('app.js') };
  for (const [marker, content] of Object.entries(replacements)) html = html.replace(`/*__${marker}__*/`, () => marker === 'CSS' ? content : escapeScript(content));
  return html;
}

function harness(t, saved = null, options = {}) {
  const storage = new Map(saved ? [[STORE, typeof saved === 'string' ? saved : JSON.stringify(saved)]] : []);
  if (options.tutorialSaved) storage.set(TUTORIAL_STORE, typeof options.tutorialSaved === 'string' ? options.tutorialSaved : JSON.stringify(options.tutorialSaved));
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
  return { window, document, get, click, input, submit, tick, visible, importFile, downloads, storage, get session() { return window.__observedSession; } };
}

function start(h, difficulty = 'low', scenarioId = null, individual = null) {
  if (scenarioId) assert.equal(scenarioId, difficulty);
  h.click(`[data-difficulty="${difficulty}"]`);
  if (individual) h.input('#home-scope', individual, 'change');
  h.click('[data-action="start"]');
  assert.ok(h.document.querySelector('.workbench'));
  assert.equal(h.session.phase, 'running');
}
function solveThroughDOM(h, id) {
  const c = h.window.SOC_DATA.cases.find(item => item.id === id);
  while (h.session.records[id].arrival === null) h.click('[data-action="step"]');
  h.click(`[data-case="${id}"]`);
  h.click('[data-tab="contact"]');
  if (h.document.querySelector('[data-action="contact"]')) h.click('[data-action="contact"]');
  while (!h.window.SocEngine.replyAvailable(h.session, id)) h.click('[data-action="step"]');
  for (const group of c.answer.evidenceGroups) {
    const evidenceId = group.find(ref => h.window.SocEngine.evidenceAvailable(h.session, ref));
    assert.ok(evidenceId, 'evidence released');
    const tab = c.logs.some(log => log.id === evidenceId) ? 'logs' : c.documents.some(doc => doc.id === evidenceId) ? 'resources' : 'contact';
    h.click(`[data-tab="${tab}"]`);
    h.click(`[data-evidence="${evidenceId}"]`);
  }
  for (const [field, value] of Object.entries({ verdict: c.answer.verdict, priority: c.answer.priorities[0], target: c.answer.target, action: c.answer.actions[0], summary: 'ログと資料を照合して確認した。', nextStep: '担当者に根拠と未確認事項を引き継ぐ。' })) h.input('#draft-' + field, value);
  h.submit('#case-form');
  assert.equal(h.session.records[id].status, 'resolved');
}

test('home switches between three disjoint five-question packs and keeps tutorial separate', t => {
  const h = harness(t);
  assert.equal(h.document.querySelectorAll('[data-difficulty]').length, 3);
  const ids = new Set();
  for (const pack of h.window.SOC_DATA.scenarios.filter(s => !s.hidden)) {
    h.click(`[data-difficulty="${pack.difficulty}"]`);
    const options = [...h.get('#home-scope').options];
    assert.equal(options.length, 6);
    assert.equal(h.get('#home-scope').value, '', 'changing difficulty clears an individual selection');
    assert.equal(h.document.querySelectorAll('[data-preview-case]').length, 5);
    options.slice(1).forEach(option => {assert.equal(ids.has(option.value), false);ids.add(option.value);});
    h.input('#home-scope', options[1].value, 'change');
  }
  assert.equal(ids.size, 15);
  assert.equal(ids.has(h.window.SocTutorial.CASE_ID), false);
  const pack = h.window.SOC_DATA.scenarios.find(s => s.id === 'medium');
  const selected = pack.caseIds[1];
  start(h, 'medium', 'medium', selected);
  assert.equal(Object.keys(h.session.records).length, 1);
  assert.equal(h.session.individualCaseId, selected);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 1);
});

test('low shift completes a real case through logs, documents, reply, draft and submission controls', t => {
  const h = harness(t);
  start(h);
  const ids = Object.keys(h.session.records);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 1);
  h.submit('#case-form');
  assert.equal(h.session.records[ids[0]].assessment.passed, false);
  assert.equal(h.session.records[ids[1]].arrival, null);
  solveThroughDOM(h, ids[0]);
  assert.equal(h.session.records[ids[0]].assessment.score, 100);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 2);
  assert.match(h.get('.assessment').textContent, /対応を記録しました/);
  h.click(`[data-case="${ids[1]}"]`);
  assert.equal(h.get('#draft-summary').value, '');
  assert.equal(h.session.records[ids[1]].status, 'investigating');
});

test('high timer adds cases at 45 seconds, ends at a critical deadline, and supports retry/training', t => {
  const h = harness(t);
  const scenario = h.window.SOC_DATA.scenarios.find(s => s.id === 'high');
  start(h, 'high', scenario.id);
  h.tick(44);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 1);
  h.tick(1);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 2);
  h.tick(45);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 3);
  assert.equal(h.get('#shift-clock').textContent, '01:30');
  h.tick(809);
  assert.equal(h.session.phase, 'running');
  h.tick(1);
  assert.equal(h.session.phase, 'gameover');
  assert.equal(h.session.elapsed, 900);
  assert.equal(h.get('#dialog').open, true);
  assert.match(h.get('#dialog-title').textContent, /GAME OVER/);
  h.click('[data-action="retry"]');
  assert.equal(h.session.phase, 'paused');
  assert.equal(h.session.elapsed, 720);
  h.tick(20);
  assert.equal(h.session.elapsed, 720);
  h.click('[data-action="resume"]');
  h.tick(180);
  assert.equal(h.session.phase, 'gameover');
  h.click('[data-action="training"]');
  assert.equal(h.session.phase, 'running');
  assert.equal(h.session.trainingAfterFailure, true);
  h.tick(10);
  assert.equal(h.session.elapsed, 910);
  assert.match(h.document.querySelector('.shiftbar').textContent, /時間制限なし/);
});

test('pause, guide modal, hidden document and long clock gaps do not consume deadlines', t => {
  const h = harness(t);
  start(h, 'medium');
  h.tick(3);
  h.click('[data-action="pause"]');
  assert.equal(h.session.phase, 'paused');
  h.tick(60);
  assert.equal(h.session.elapsed, 3);
  h.click('[data-action="resume"]');
  h.tick(2);
  assert.equal(h.session.elapsed, 5);
  h.click('[data-action="guide"]');
  assert.equal(h.session.phase, 'paused');
  h.tick(30);
  h.click('[data-action="close-dialog"]');
  assert.equal(h.session.phase, 'running');
  assert.equal(h.session.elapsed, 5);
  h.visible(false);
  assert.equal(h.session.phase, 'paused');
  h.tick(100);
  h.visible(true);
  assert.equal(h.get('#dialog').open, true);
  assert.equal(h.session.elapsed, 5);
  h.click('[data-action="resume"]');
  h.tick(9, 9);
  assert.equal(h.session.phase, 'paused');
  assert.equal(h.session.elapsed, 5);
});

test('search, pivot, evidence removal and terminal use the same released logs', t => {
  const h = harness(t);
  start(h, 'high');
  const c = h.window.SOC_DATA.cases.find(c => c.id === h.session.selectedCaseId);
  assert.equal(h.document.querySelectorAll('.log-row').length, c.logs.length);
  h.input('#log-search', c.logs[0].id);
  assert.equal(h.document.querySelectorAll('.log-row').length, 1);
  h.click(`[data-evidence="${c.logs[0].id}"]`);
  assert.equal(h.session.records[c.id].evidenceIds.length, 1);
  h.click(`[data-remove-evidence="${c.logs[0].id}"]`);
  assert.equal(h.session.records[c.id].evidenceIds.length, 0);
  h.click('[data-action="clear-filter"]');
  h.click('[data-query]');
  assert.notEqual(h.get('#log-search').value, '');
  h.click('[data-tab="terminal"]');
  h.input('#terminal-input', 'cat ' + c.logs[0].path);
  h.submit('#terminal-form');
  assert.ok(h.get('#terminal-output').textContent.includes(c.logs[0].raw));
  const future = h.window.SOC_DATA.cases.find(c => c.id === Object.keys(h.session.records)[1]);
  assert.ok(!h.get('#terminal-output').textContent.includes(future.logs[0].raw));
  h.input('#terminal-input', 'echo changed > ' + c.logs[0].path);
  h.submit('#terminal-form');
  assert.match(h.get('#terminal-output').textContent, /読み取り専用/);
  h.input('#terminal-input', 'echo 調査メモ > note.txt');
  h.submit('#terminal-form');
  h.click('[data-action="export"]');
  const exported = JSON.parse(h.downloads.at(-1).content);
  assert.equal(exported.workspace.files['/home/analyst/note.txt'], '調査メモ\n');
});

test('completed individual case exports a real report and a restorable save without external I/O', t => {
  const h = harness(t);
  const scenario = h.window.SOC_DATA.scenarios[0], id = scenario.caseIds[0];
  start(h, 'low', scenario.id, id);
  solveThroughDOM(h, id);
  assert.equal(h.session.phase, 'completed');
  assert.match(h.get('#dialog-title').textContent, /SHIFT COMPLETE/);
  h.click('[data-action="report"]');
  assert.match(h.downloads.at(-1).name, /report\.txt$/);
  assert.match(h.downloads.at(-1).content, /調査・引き継ぎレポート/);
  assert.match(h.downloads.at(-1).content, /担当者に根拠と未確認事項/);
  h.click('[data-action="export"]');
  const save = JSON.parse(h.downloads.at(-1).content);
  assert.equal(save.format, 'socroom-save');
  assert.equal(save.session.phase, 'completed');
  assert.equal(h.window.SocEngine.hydrate(save.session).phase, 'completed');
});

test('local save restores notes and workspace while keeping the clock paused', t => {
  const first = harness(t);
  start(first, 'medium');
  first.input('#draft-summary', '復元される調査メモ');
  first.click('[data-tab="terminal"]');
  first.input('#terminal-input', 'echo saved > note.txt');
  first.submit('#terminal-form');
  first.tick(6);
  first.window.dispatchEvent(new first.window.Event('pagehide'));
  const saved = first.storage.get(STORE);
  assert.ok(saved);
  const restored = harness(t, saved);
  assert.match(restored.get('.saved-strip').textContent, /前回の勤務/);
  assert.equal(restored.session.phase, 'paused');
  restored.tick(100);
  assert.equal(restored.session.elapsed, 6);
  restored.click('[data-action="continue"]');
  restored.click('[data-action="resume"]');
  assert.equal(restored.get('#draft-summary').value, '復元される調査メモ');
  restored.click('[data-tab="terminal"]');
  restored.input('#terminal-input', 'cat note.txt');
  restored.submit('#terminal-form');
  assert.match(restored.get('#terminal-output').textContent, /saved/);
});

test('bad, oversized and unsafe-workspace imports display errors without replacing current progress', async t => {
  const h = harness(t);
  start(h, 'medium');
  h.input('#draft-summary', 'この記録を維持');
  h.click('[data-action="export"]');
  const good = JSON.parse(h.downloads.at(-1).content);
  for (const value of ['{bad', '{}', JSON.stringify({ ...good, workspace: { files: { '/var/log/auth.log': 'changed' } } })]) {
    await h.importFile(value);
    assert.match(h.get('#toast').textContent, /読み込めませんでした/);
    assert.equal(h.get('#draft-summary').value, 'この記録を維持');
    assert.equal(h.get('#dialog').open, false);
  }
  await h.importFile('{}', 21 * 1024 * 1024);
  assert.match(h.get('#toast').textContent, /20MB以下/);
  assert.equal(h.get('#draft-summary').value, 'この記録を維持');
});

test('valid import requires the replace action and resumes only after an explicit click', async t => {
  const h = harness(t);
  start(h, 'medium');
  h.input('#draft-summary', '保存時のメモ');
  h.click('[data-action="export"]');
  const saved = h.downloads.at(-1).content;
  h.input('#draft-summary', '読み込み前のメモ');
  await h.importFile(saved);
  assert.match(h.get('#dialog-title').textContent, /保存した勤務へ切り替え/);
  assert.equal(h.get('#draft-summary').value, '読み込み前のメモ');
  h.click('[data-action="import-confirmed"]');
  assert.equal(h.get('#draft-summary').value, '保存時のメモ');
  assert.equal(h.session.phase, 'paused');
  h.tick(30);
  assert.equal(h.session.elapsed, 0);
  h.click('[data-action="resume"]');
  h.tick(1);
  assert.equal(h.session.elapsed, 1);
});

test('storage unavailable mode remains playable and can download progress', t => {
  const h = harness(t, null, { failStorage: true });
  start(h, 'low');
  assert.match(h.get('#save-status').textContent, /自動保存不可/);
  h.input('#draft-summary', '保存ファイル経由で持ち出す');
  h.click('[data-action="export"]');
  assert.equal(JSON.parse(h.downloads.at(-1).content).session.records[h.session.selectedCaseId].draft.summary, '保存ファイル経由で持ち出す');
});

test('Japanese IME retains the input node during composition and filters after commit', t => {
  const h = harness(t);
  start(h, 'high');
  const input = h.get('#log-search');
  input.focus();
  input.dispatchEvent(new h.window.CompositionEvent('compositionstart', { bubbles: true, data: '' }));
  h.input('#log-search', 'にちじ');
  assert.equal(h.get('#log-search'), input);
  assert.equal(h.document.activeElement, input);
  assert.equal(h.document.querySelectorAll('.log-row').length, h.window.SocEngine.getCase(h.session.selectedCaseId).logs.length);
  // A new case arrives while the learner is choosing a Japanese conversion.
  // Rendering must wait without replacing the focused search control.
  h.tick(45);
  assert.equal(h.window.SocEngine.activeCases(h.session).length, 2);
  assert.equal(h.get('#log-search'), input);
  const eventTitle = h.window.SocEngine.getCase(h.session.selectedCaseId).logs[0].event;
  input.value = eventTitle;
  input.dispatchEvent(new h.window.CompositionEvent('compositionend', { bubbles: true, data: input.value }));
  assert.notEqual(h.get('#log-search'), input);
  assert.equal(h.get('#log-search').value, eventTitle);
  assert.equal(h.document.querySelectorAll('.log-row').length, 1);
  assert.ok(h.get('.log-row').textContent.includes(eventTitle));
  assert.equal(h.document.querySelectorAll('[data-case]').length, 2);
});

test('next update control jumps high difficulty to each 45-second arrival', t => {
  const h = harness(t);
  start(h, 'high');
  h.click('[data-action="step"]');
  assert.equal(h.session.elapsed, 45);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 2);
  assert.equal(h.get('#shift-clock').textContent, '00:45');
  h.click('[data-action="step"]');
  assert.equal(h.session.elapsed, 90);
  assert.equal(h.document.querySelectorAll('[data-case]').length, 3);
  assert.equal(h.get('#shift-clock').textContent, '01:30');
  for (const [at,count] of [[135,4],[180,5]]) {h.click('[data-action="step"]');assert.equal(h.session.elapsed,at);assert.equal(h.document.querySelectorAll('[data-case]').length,count);}
});

test('all fifteen normal cases can collect every required evidence group and complete through DOM controls', t => {
  const data = require('../src/data.js');
  const completed = new Set();
  for (const scenario of data.scenarios.filter(s => !s.hidden)) {
    const h = harness(t);
    start(h, scenario.difficulty, scenario.id);
    for (const id of scenario.caseIds) {
      solveThroughDOM(h, id);
      assert.equal(h.session.records[id].assessment.score, 100);
      completed.add(id);
    }
    assert.equal(h.session.phase, 'completed');
    assert.equal(h.document.querySelectorAll('[data-case]').length, 5);
    assert.match(h.get('#dialog-title').textContent, /SHIFT COMPLETE/);
  }
  assert.equal(completed.size, 15);
});

function tutorialStep(h) { return h.get('#tutorial-guide').dataset.step; }
function operateTutorialStep(h) {
  const id = tutorialStep(h);
  if (id === 'welcome' || id === 'evidence-review' || id === 'finish') return;
  if (id === 'case') h.click('[data-case="tutorial-scan"]');
  else if (id === 'context') {
    h.click('[data-action="context"]');
    assert.equal(h.get('#dialog').open, true);
    assert.equal(h.get('[data-action="tutorial-next"]').disabled, true, 'reading requires closing the explanation');
    h.click('#dialog .modal-actions [data-action="close-dialog"]');
    assert.equal(h.get('#dialog').open, false);
    assert.equal(h.session.phase, 'running');
  } else if (id === 'filter') h.click('[data-action="filter-host"]');
  else if (id === 'search') h.input('#log-search', '検査');
  else if (id === 'raw') {
    const details = h.get('[data-log-details="ts-06"]');
    details.open = true;
    details.dispatchEvent(new h.window.Event('toggle'));
    assert.equal(h.get('[data-log-details="ts-06"]'), details, 'reading a log must not replace the open node');
    assert.match(details.textContent, /run=INV-310/);
  } else if (id === 'resources') h.click('[data-tab="resources"]');
  else if (id === 'contact') h.click('[data-tab="contact"]');
  else if (id === 'request') h.click('[data-action="contact"]');
  else if (id.endsWith('-evidence')) {
    const evidenceIds = { 'log-evidence': 'ts-06', 'document-evidence': 'ts-doc-plan', 'reply-evidence': 'ts-reply' };
    h.click(`[data-evidence="${evidenceIds[id]}"]`);
  } else if (['verdict', 'priority', 'target', 'action'].includes(id)) {
    const values = { verdict: 'benign', priority: 'low', target: 'scan-lab-01', action: 'close' };
    h.input('#draft-' + id, values[id]);
  } else if (id === 'summary' || id === 'next-step') h.click('[data-action="tutorial-example"]');
  else if (id === 'submit') h.submit('#case-form');
  else assert.fail('Unhandled tutorial operation: ' + id);
}
function tutorialTo(h, target) {
  for (let count = 0; tutorialStep(h) !== target && count < 21; count++) {
    if (h.get('[data-action="tutorial-next"]').disabled) operateTutorialStep(h);
    h.click('[data-action="tutorial-next"]');
  }
  assert.equal(tutorialStep(h), target);
}

test('tutorial guides all 21 real operations and completes without showing the normal debrief', t => {
  const h = harness(t);
  h.click('[data-action="tutorial-start"]');
  assert.equal(h.session.individualCaseId, 'tutorial-scan');
  assert.equal(h.session.difficulty, 'low');
  assert.equal(h.get('[data-action="tutorial-back"]').disabled, true);
  const steps = h.window.SocTutorial.STEPS;
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index];
    assert.equal(tutorialStep(h), step.id);
    assert.equal(h.get('#tutorial-count').textContent, `${index + 1} / 21`);
    assert.ok(h.get('[data-tutorial-target]').classList.contains('tutorial-target'));
    if (step.id === 'finish') break;
    assert.equal(h.get('[data-action="tutorial-next"]').disabled, step.kind !== 'read', step.id + ' blocks skipping');
    if (step.id !== 'submit') assert.equal(h.get('#case-form .submit').disabled, true);
    operateTutorialStep(h);
    assert.equal(tutorialStep(h), step.id, 'operation does not advance before the learner reads the result');
    assert.equal(h.get('[data-action="tutorial-next"]').disabled, false, step.id + ' can advance');
    h.click('[data-action="tutorial-next"]');
  }
  assert.equal(h.session.phase, 'completed');
  assert.equal(h.session.records['tutorial-scan'].assessment.score, 100);
  assert.equal(h.get('#dialog').open, false);
  assert.match(h.get('#draft-summary').value, /REQ-310/);
  assert.match(h.get('#draft-nextStep').value, /クローズ/);
  assert.equal(h.get('[role="progressbar"]').getAttribute('aria-valuenow'), '21');
  h.click('[data-action="export"]');
  const exported = JSON.parse(h.downloads.at(-1).content);
  assert.match(h.downloads.at(-1).name, /tutorial\.json$/);
  assert.equal(exported.tutorial.step, 20);
  assert.equal(exported.session.phase, 'completed');
  assert.equal(h.storage.has(STORE), false, 'tutorial never creates a normal shift save');
  h.click('[data-action="tutorial-exit"]');
  assert.ok(h.document.querySelector('.home'));
  assert.equal(h.document.querySelector('.saved-strip'), null);
  assert.ok(h.document.querySelector('[data-action="tutorial-resume"]'));
});

test('tutorial locate restores the required view and focus while back retains collected progress', t => {
  const h = harness(t);
  h.click('[data-action="tutorial-start"]');
  tutorialTo(h, 'log-evidence');
  assert.equal(h.get('[data-log-details="ts-06"]').open, true, 'open raw log survives next-step rendering');
  h.click('[data-tab="terminal"]');
  assert.equal(h.document.querySelector('[data-evidence="ts-06"]'), null);
  h.click('[data-action="tutorial-locate"]');
  assert.equal(h.get('[data-tab="logs"]').getAttribute('aria-selected'), 'true');
  assert.equal(h.get('#log-search').value, '検査');
  assert.equal(h.document.activeElement, h.get('[data-evidence="ts-06"]'));
  h.click('[data-evidence="ts-06"]');
  h.click('[data-action="tutorial-back"]');
  assert.equal(tutorialStep(h), 'raw');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, false);
  h.click('[data-action="tutorial-next"]');
  assert.equal(tutorialStep(h), 'log-evidence');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, false);
  assert.equal(h.session.records['tutorial-scan'].evidenceIds.length, 1);
  h.click('[data-action="tutorial-next"]');
  tutorialTo(h, 'document-evidence');
  h.click('[data-tab="terminal"]');
  h.click('[data-action="tutorial-locate"]');
  assert.equal(h.get('[data-tab="resources"]').getAttribute('aria-selected'), 'true');
  assert.equal(h.document.activeElement, h.get('[data-evidence="ts-doc-plan"]'));
});

test('tutorial refuses early submission and rewinds when evidence or a decision is undone', t => {
  const h = harness(t);
  h.click('[data-action="tutorial-start"]');
  h.submit('#case-form');
  assert.equal(h.session.records['tutorial-scan'].attempts, 0);
  assert.match(h.get('#toast').textContent, /順番に操作/);
  tutorialTo(h, 'submit');
  assert.equal(h.get('#case-form .submit').disabled, false);
  h.click('[data-remove-evidence="ts-doc-plan"]');
  assert.equal(tutorialStep(h), 'document-evidence');
  assert.equal(h.get('[data-tab="resources"]').getAttribute('aria-selected'), 'true');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, true);
  assert.equal(h.get('#case-form .submit').disabled, true);
  tutorialTo(h, 'submit');
  h.input('#draft-verdict', 'incident');
  assert.equal(tutorialStep(h), 'verdict');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, true);
  assert.equal(h.get('#case-form .submit').disabled, true);
  h.input('#draft-verdict', 'benign');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, false);
  tutorialTo(h, 'submit');
  h.input('#draft-summary', '  ');
  assert.equal(tutorialStep(h), 'summary');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, true);
});

test('tutorial search and report instructions wait for Japanese IME composition to finish', t => {
  const h = harness(t);
  h.click('[data-action="tutorial-start"]');
  tutorialTo(h, 'search');
  let input = h.get('#log-search');
  input.focus();
  input.dispatchEvent(new h.window.CompositionEvent('compositionstart', { bubbles: true }));
  input.value = '検査';
  input.dispatchEvent(new h.window.InputEvent('input', { bubbles: true, isComposing: true, data: '検査' }));
  assert.equal(h.get('#log-search'), input);
  assert.equal(h.document.activeElement, input);
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, true);
  input.dispatchEvent(new h.window.CompositionEvent('compositionend', { bubbles: true, data: '検査' }));
  assert.equal(h.get('#log-search').value, '検査');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, false);
  tutorialTo(h, 'summary');
  input = h.get('#draft-summary');
  input.focus();
  input.dispatchEvent(new h.window.CompositionEvent('compositionstart', { bubbles: true }));
  input.value = '変更申請とログを照合した';
  input.dispatchEvent(new h.window.InputEvent('input', { bubbles: true, isComposing: true, data: input.value }));
  assert.equal(h.get('#draft-summary'), input);
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, true);
  input.dispatchEvent(new h.window.CompositionEvent('compositionend', { bubbles: true, data: input.value }));
  assert.equal(h.get('#draft-summary'), input, 'updating the guide does not replace the report input');
  assert.equal(h.document.activeElement, input);
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, false);
});

test('tutorial interrupt and reload use a separate save and resume the exact actionable step', t => {
  const first = harness(t);
  first.click('[data-action="tutorial-start"]');
  tutorialTo(first, 'document-evidence');
  first.click('[data-action="tutorial-exit"]');
  const tutorialSave = first.storage.get(TUTORIAL_STORE);
  assert.ok(tutorialSave);
  assert.equal(first.storage.has(STORE), false);
  assert.equal(JSON.parse(tutorialSave).tutorial.step, first.window.SocTutorial.STEPS.findIndex(step => step.id === 'document-evidence'));
  const restored = harness(t, null, { tutorialSaved: tutorialSave });
  assert.equal(restored.document.querySelector('.saved-strip'), null);
  restored.click('[data-action="tutorial-resume"]');
  assert.equal(tutorialStep(restored), 'document-evidence');
  assert.equal(restored.session.phase, 'running');
  assert.equal(restored.get('#dialog').open, false);
  assert.equal(restored.get('[data-action="tutorial-next"]').disabled, true);
  assert.deepEqual(Array.from(restored.session.records['tutorial-scan'].evidenceIds), ['ts-06']);
  assert.equal(restored.get('[data-tab="resources"]').getAttribute('aria-selected'), 'true');
  restored.click('[data-evidence="ts-doc-plan"]');
  assert.equal(restored.get('[data-action="tutorial-next"]').disabled, false);
});

test('tutorial preserves the normal shift, elapsed time, notes, and separate terminal workspace', t => {
  const h = harness(t);
  start(h, 'medium', 'medium');
  const normalSession = h.session;
  const caseId = normalSession.selectedCaseId;
  h.input('#draft-summary', '通常勤務で作成したメモ');
  h.click('[data-tab="terminal"]');
  h.input('#terminal-input', 'echo original > note.txt');
  h.submit('#terminal-form');
  h.tick(4);
  h.click('[data-action="guide"]');
  h.click('[data-action="tutorial-start"]');
  assert.equal(normalSession.phase, 'paused');
  const preservedSave = h.storage.get(STORE);
  assert.equal(JSON.parse(preservedSave).workspace.files['/home/analyst/note.txt'], 'original\n');
  assert.equal(JSON.parse(preservedSave).session.records[caseId].draft.summary, '通常勤務で作成したメモ');
  tutorialTo(h, 'document-evidence');
  h.tick(15);
  h.click('[data-tab="terminal"]');
  h.input('#terminal-input', 'echo tutorial > note.txt');
  h.submit('#terminal-form');
  h.click('[data-action="tutorial-exit"]');
  assert.equal(h.storage.get(STORE), preservedSave, 'tutorial cannot overwrite the normal save');
  assert.equal(normalSession.elapsed, 4);
  assert.equal(normalSession.records[caseId].draft.summary, '通常勤務で作成したメモ');
  assert.equal(JSON.parse(h.storage.get(TUTORIAL_STORE)).workspace.files['/home/analyst/note.txt'], 'tutorial\n');
  h.click('[data-action="continue"]');
  assert.equal(h.get('#dialog').open, true);
  h.click('[data-action="resume"]');
  assert.equal(h.get('#draft-summary').value, '通常勤務で作成したメモ');
  assert.equal(h.get('[data-tab="terminal"]').getAttribute('aria-selected'), 'true');
  h.input('#terminal-input', 'cat note.txt');
  h.submit('#terminal-form');
  assert.match(h.get('#terminal-output').textContent, /original/);
  assert.doesNotMatch(h.get('#terminal-output').textContent, /tutorial/);
  h.click('[data-action="export"]');
  const normalExport = JSON.parse(h.downloads.at(-1).content);
  assert.equal(normalExport.tutorial, undefined);
  assert.equal(normalExport.session.scenarioId, 'medium');
});

test('tutorial can interrupt and resume in memory even when browser storage is unavailable', t => {
  const h = harness(t, null, { failStorage: true });
  start(h, 'low', 'low');
  h.input('#draft-summary', '保存できない環境の通常メモ');
  h.click('[data-action="guide"]');
  h.click('[data-action="tutorial-start"]');
  tutorialTo(h, 'document-evidence');
  h.click('[data-action="tutorial-exit"]');
  h.click('[data-action="tutorial-resume"]');
  assert.equal(tutorialStep(h), 'document-evidence');
  assert.equal(h.session.phase, 'running');
  h.click('[data-action="tutorial-exit"]');
  h.click('[data-action="continue"]');
  h.click('[data-action="resume"]');
  assert.equal(h.get('#draft-summary').value, '保存できない環境の通常メモ');
  assert.match(h.get('#save-status').textContent, /自動保存不可/);
});

test('corrupt tutorial storage does not prevent the normal shift from restoring', t => {
  const first = harness(t);
  start(first, 'medium');
  first.input('#draft-summary', '通常保存を保護');
  first.window.dispatchEvent(new first.window.Event('pagehide'));
  const normalSaved = first.storage.get(STORE);
  for (const tutorialSaved of ['{broken', JSON.stringify({ session: {}, tutorial: { version: 2, step: 20, seen: [] } })]) {
    const h = harness(t, normalSaved, { tutorialSaved });
    if (h.document.querySelector('[data-action="tutorial-resume"]')) {
      h.click('[data-action="tutorial-resume"]');
      assert.match(h.get('#toast').textContent, /再開できません/);
    }
    h.click('[data-action="continue"]');
    h.click('[data-action="resume"]');
    assert.equal(h.get('#draft-summary').value, '通常保存を保護');
  }
});

test('exported tutorial imports into its guided step without overwriting a normal shift', async t => {
  const author = harness(t);
  author.click('[data-action="tutorial-start"]');
  tutorialTo(author, 'document-evidence');
  author.click('[data-action="export"]');
  const exported = author.downloads.at(-1).content;
  const h = harness(t);
  start(h, 'high', 'high');
  h.input('#draft-summary', '保存する通常勤務');
  h.tick(2);
  const normal = h.session;
  await h.importFile(exported);
  assert.equal(tutorialStep(h), 'document-evidence');
  assert.equal(h.session.phase, 'running');
  assert.equal(h.get('#dialog').open, false);
  assert.equal(normal.phase, 'paused');
  assert.equal(JSON.parse(h.storage.get(STORE)).session.records[normal.selectedCaseId].draft.summary, '保存する通常勤務');
  h.click('[data-action="tutorial-exit"]');
  h.click('[data-action="continue"]');
  h.click('[data-action="resume"]');
  assert.equal(h.get('#draft-summary').value, '保存する通常勤務');
  assert.equal(h.get('#shift-clock').textContent, '00:02');
});

test('normal-save import from tutorial offers the preserved normal save and keeps tutorial progress', async t => {
  const author = harness(t);
  start(author, 'low', 'low');
  author.input('#draft-summary', '読み込む別の通常勤務');
  author.click('[data-action="export"]');
  const exported = author.downloads.at(-1).content;
  const h = harness(t);
  start(h, 'medium', 'medium');
  h.input('#draft-summary', '置換前の通常勤務');
  h.click('[data-action="guide"]');
  h.click('[data-action="tutorial-start"]');
  tutorialTo(h, 'document-evidence');
  await h.importFile(exported);
  assert.match(h.get('#dialog').textContent, /通常勤務を置き換え/);
  h.click('[data-action="export-before-import"]');
  const oldNormal = JSON.parse(h.downloads.at(-1).content);
  assert.equal(oldNormal.tutorial, undefined);
  assert.equal(oldNormal.session.scenarioId, 'medium');
  assert.equal(oldNormal.session.records[oldNormal.session.selectedCaseId].draft.summary, '置換前の通常勤務');
  h.click('[data-action="import-confirmed"]');
  assert.equal(h.document.querySelector('#tutorial-guide'), null);
  assert.match(h.get('#dialog-title').textContent, /一時停止/);
  assert.equal(JSON.parse(h.storage.get(TUTORIAL_STORE)).tutorial.step, 8);
  h.click('[data-action="resume"]');
  assert.equal(h.get('#draft-summary').value, '読み込む別の通常勤務');
  h.click('[data-action="home"]');
  h.click('[data-action="tutorial-resume"]');
  assert.equal(tutorialStep(h), 'document-evidence');
});

test('tutorial import validates metadata before changing either progress slot', async t => {
  const h = harness(t);
  start(h, 'medium', 'medium');
  h.input('#draft-summary', '検証エラーの前のメモ');
  h.click('[data-action="export"]');
  const raw = JSON.parse(h.downloads.at(-1).content);
  raw.tutorial = { version: 2, step: 8, seen: [] }; // A normal timed shift is not a tutorial.
  const before = h.storage.get(STORE);
  await h.importFile(JSON.stringify(raw));
  assert.match(h.get('#toast').textContent, /チュートリアルの保存内容/);
  assert.equal(h.get('#draft-summary').value, '検証エラーの前のメモ');
  assert.equal(h.document.querySelector('#tutorial-guide'), null);
  assert.equal(h.storage.get(STORE), before);
  assert.equal(h.storage.has(TUTORIAL_STORE), false);
});

test('completed tutorial can be imported and reviewed without a shift debrief or lost normal progress', async t => {
  const author = harness(t);
  author.click('[data-action="tutorial-start"]');
  tutorialTo(author, 'finish');
  author.click('[data-action="export"]');
  const h = harness(t);
  await h.importFile(author.downloads.at(-1).content);
  assert.equal(tutorialStep(h), 'finish');
  assert.equal(h.session.phase, 'completed');
  assert.equal(h.get('#dialog').open, false);
  assert.equal(h.get('[data-action="tutorial-exit"]').disabled, false);
  h.click('[data-action="tutorial-back"]');
  assert.equal(tutorialStep(h), 'submit');
  assert.equal(h.get('[data-action="tutorial-next"]').disabled, false);
  h.click('[data-action="tutorial-next"]');
  h.click('[data-action="tutorial-exit"]');
  assert.equal(h.storage.has(STORE), false);
});

test('tutorial retains keyboard focus and announces completion in a persistent live region', t => {
  const h = harness(t);
  const live = h.get('#tutorial-status');
  h.click('[data-action="tutorial-start"]');
  h.click('[data-action="tutorial-next"]');
  h.get('[data-case="tutorial-scan"]').focus();
  h.click('[data-case="tutorial-scan"]');
  assert.equal(h.document.activeElement, h.get('[data-case="tutorial-scan"]'));
  assert.equal(h.get('#tutorial-status'), live);
  assert.match(live.textContent, /調査中/);
  tutorialTo(h, 'log-evidence');
  h.get('[data-evidence="ts-06"]').focus();
  h.click('[data-evidence="ts-06"]');
  assert.equal(h.document.activeElement, h.get('[data-action="tutorial-next"]'));
  assert.equal(h.get('#tutorial-status'), live);
  assert.match(live.textContent, /1つ目の証拠/);
});


test('a tutorial save missing its guide cannot replace normal progress through import or startup', async t => {
  const source = harness(t);
  source.click('[data-action="tutorial-start"]');
  source.click('[data-action="export"]');
  const raw = JSON.parse(source.downloads.at(-1).content);
  delete raw.tutorial;
  const h = harness(t);
  start(h, 'medium');
  h.input('#draft-summary', '通常勤務を維持');
  const before = h.storage.get(STORE);
  await h.importFile(JSON.stringify(raw));
  assert.match(h.get('#toast').textContent, /演習モードが一致/);
  assert.equal(h.get('#draft-summary').value, '通常勤務を維持');
  assert.equal(h.storage.get(STORE), before);
  assert.equal(h.storage.has(TUTORIAL_STORE), false);
  const restored = harness(t, raw);
  assert.equal(restored.document.querySelector('.saved-strip'), null);
  start(restored, 'low');
  assert.equal(restored.session.scenarioId, 'low');
  assert.equal(Object.keys(restored.session.records).length, 5);
});

test('legacy progress remains untouched and can be exported separately from the new packs', async t => {
  const old = { format:'socroom-save',version:1,session:{version:'socroom-1',scenarioId:'auth'},workspace:null };
  const oldTutorial = {...old,tutorial:{version:1,step:0,seen:[]}};
  const h = harness(t, null, {legacySaves:{normal:old,tutorial:oldTutorial}});
  assert.match(h.get('.legacy-progress').textContent, /前の版の進捗/);
  h.click('[data-action="legacy-normal"]');
  assert.deepEqual(JSON.parse(h.downloads.at(-1).content),old);
  h.click('[data-action="legacy-tutorial"]');
  assert.deepEqual(JSON.parse(h.downloads.at(-1).content),oldTutorial);
  start(h,'high');
  assert.equal(h.storage.get('socroom.offline.v1'),JSON.stringify(old));
  assert.equal(h.storage.get('socroom.tutorial.v1'),JSON.stringify(oldTutorial));
  await h.importFile(JSON.stringify(old));
  assert.match(h.get('#toast').textContent,/旧版HTML/);
  h.click('[data-action="export"]');
  assert.equal(JSON.parse(h.downloads.at(-1).content).session.scenarioId,'high');
});

test('advanced timelines and references include related hosts while excluding the tutorial', t => {
  const h=harness(t);
  const c=h.window.SOC_DATA.cases.find(c=>c.id==='high-lateral');
  start(h,'high','high',c.id);
  assert.ok(c.relatedHosts.length>=2);
  h.click('[data-tab="timeline"]');
  for(const host of new Set(c.logs.map(l=>l.host)))assert.ok(h.get('#investigation-view').textContent.includes(host));
  assert.equal(h.document.querySelectorAll('.timeline-item').length,c.logs.length);
  h.click('[data-tab="resources"]');
  for(const host of [c.host,...c.relatedHosts])assert.ok(h.get('.asset-table').textContent.includes(host));
  assert.doesNotMatch(h.get('.asset-table').textContent,/scan-lab-01/);
  assert.match(h.get('#draft-target').closest('label').textContent,/主な対象端末/);
});
