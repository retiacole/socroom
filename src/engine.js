(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.SocEngine = factory(root.SOC_DATA);
}(typeof globalThis !== 'undefined' ? globalThis : this, function (DATA) {
  'use strict';
  if (!DATA || !Array.isArray(DATA.cases)) throw new Error('教材データを読み込めません。');

  const VERSION = DATA.version;
  const MAX_TIME = 2592000;
  const MAX_HISTORY = 400;
  const MAX_JSON_LENGTH = 1000000;
  const DIFFICULTIES = Object.freeze({
    low: Object.freeze({ label: '低・研修', limitSeconds: null, replyMultiplier: 0 }),
    medium: Object.freeze({ label: '中・通常勤務', limitSeconds: 1200, replyMultiplier: 1 }),
    high: Object.freeze({ label: '高・繁忙シフト', limitSeconds: 900, replyMultiplier: 1.5 })
  });
  const ENUMS = { verdict: ['', 'incident', 'benign', 'unknown'], priority: ['', 'high', 'medium', 'low'], action: ['', 'escalate', 'contain', 'close', 'monitor'] };
  const LABELS = { incident: 'インシデント', benign: '正当な活動', unknown: '追加調査が必要', high: '高', medium: '中', low: '低', escalate: 'エスカレーション', contain: '封じ込め依頼', close: 'クローズ', monitor: '追加監視', open: '未着手', investigating: '調査中', resolved: '対応済み', running: '勤務中', paused: '一時停止', gameover: '時間切れ', completed: '勤務完了' };
  const caseMap = new Map(DATA.cases.map(c => [c.id, c]));
  const evidenceMap = new Map();
  DATA.cases.forEach(c => {
    c.logs.forEach(item => evidenceMap.set(item.id, { caseId: c.id, kind: 'log', item }));
    c.documents.forEach(item => evidenceMap.set(item.id, { caseId: c.id, kind: 'document', item }));
    if (c.contact) evidenceMap.set(c.contact.replyId, { caseId: c.id, kind: 'reply', item: c.contact });
  });

  function getCase(id) { return caseMap.get(id) || null; }
  function plain(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function number(value, name, min = 0, max = MAX_TIME) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(name + 'が不正です。');
    return value;
  }
  function text(value, name, max = 4000) {
    if (typeof value !== 'string' || value.length > max) throw new Error(name + 'が不正または長すぎます。');
    return value;
  }
  function blankDraft() { return { verdict: '', priority: '', action: '', target: '', summary: '', nextStep: '' }; }
  function cleanDraft(value) {
    if (!plain(value)) throw new Error('報告フォームの形式が不正です。');
    const result = blankDraft();
    for (const key of Object.keys(result)) {
      result[key] = text(value[key] === undefined ? '' : value[key], '報告項目', key === 'target' ? 200 : 4000);
      if (ENUMS[key] && !ENUMS[key].includes(result[key])) throw new Error('報告フォームの選択値が不正です。');
    }
    return result;
  }
  function blankRecord(arrival) {
    return { status: 'open', arrival, requestAt: null, evidenceIds: [], draft: blankDraft(), attempts: 0, assessment: null, resolvedAt: null, submission: null };
  }
  function idsFor(session) {
    if (session.individualCaseId) return [session.individualCaseId];
    const scenario = DATA.scenarios.find(s => s.id === session.scenarioId);
    if (!scenario) throw new Error('シナリオが見つかりません。');
    return scenario.caseIds.slice();
  }
  function logHistory(session, type, caseId, detail) {
    session.history.push({ at: session.elapsed, type, caseId: caseId || null, detail: String(detail || '').slice(0, 500) });
    if (session.history.length > MAX_HISTORY) session.history.splice(0, session.history.length - MAX_HISTORY);
  }
  function createSession(scenarioId, difficulty, individualCaseId = null) {
    const scenario = DATA.scenarios.find(s => s.id === scenarioId);
    if (!scenario || !Object.hasOwn(DIFFICULTIES, difficulty)) throw new Error('シナリオまたは難易度が不正です。');
    if (scenario.difficulty && scenario.difficulty !== difficulty) throw new Error('この問題セットは選択した難易度では利用できません。');
    if (individualCaseId !== null && !scenario.caseIds.includes(individualCaseId)) throw new Error('このシナリオにないケースです。');
    const ids = individualCaseId ? [individualCaseId] : scenario.caseIds;
    const records = {};
    ids.forEach((id, i) => { records[id] = blankRecord(difficulty === 'medium' || i === 0 ? 0 : null); });
    const session = { version: VERSION, scenarioId, difficulty, individualCaseId, phase: 'running', elapsed: 0, selectedCaseId: ids[0], records, history: [], failure: null, trainingAfterFailure: false };
    ids.forEach(id => { if (records[id].arrival === 0) logHistory(session, 'arrival', id, 'アラートを受信'); });
    return session;
  }
  function activeCases(session) { return idsFor(session).filter(id => session.records[id].arrival !== null && session.records[id].arrival <= session.elapsed).map(getCase); }
  function recordFor(session, caseId) {
    const record = session.records[caseId];
    if (!record || !getCase(caseId) || record.arrival === null || record.arrival > session.elapsed) throw new Error('まだ届いていないケースです。');
    return record;
  }
  function mutable(session, caseId) {
    if (session.phase !== 'running') throw new Error('勤務を再開してから操作してください。');
    const record = recordFor(session, caseId);
    if (record.status === 'resolved') throw new Error('このケースは対応済みです。');
    return record;
  }
  function replyAvailableAt(session, caseId, at) {
    const record = session.records[caseId];
    const c = getCase(caseId);
    return !!(record && c && c.contact && record.arrival !== null && record.arrival <= at && record.requestAt !== null && record.requestAt + c.contact.delaySeconds * DIFFICULTIES[session.difficulty].replyMultiplier <= at);
  }
  function replyAvailable(session, caseId) { return replyAvailableAt(session, caseId, session.elapsed); }
  function evidenceAvailableAt(session, id, at) {
    const ref = evidenceMap.get(id);
    if (!ref) return false;
    const record = session.records[ref.caseId];
    if (!record || record.arrival === null || record.arrival > at) return false;
    if (ref.kind === 'log') return record.arrival + ref.item.offset <= at;
    if (ref.kind === 'reply') return replyAvailableAt(session, ref.caseId, at);
    return true;
  }
  function evidenceAvailable(session, id) { return evidenceAvailableAt(session, id, session.elapsed); }
  function visibleLogs(session, caseId = null) {
    return activeCases(session).filter(c => !caseId || c.id === caseId).flatMap(c => c.logs.filter(item => evidenceAvailable(session, item.id)));
  }
  function evidenceFor(session, ids, at = session.elapsed) {
    if (!Array.isArray(ids) || ids.length > evidenceMap.size || ids.some(id => typeof id !== 'string' || id.length > 200)) throw new Error('証拠一覧の形式が不正です。');
    const result = [...new Set(ids)];
    if (result.some(id => !evidenceAvailableAt(session, id, at))) throw new Error('未知の証拠、またはまだ確認できない証拠が含まれています。');
    return result;
  }
  function getDeadline(session, caseId) {
    const record = session.records[caseId];
    const limit = DIFFICULTIES[session.difficulty].limitSeconds;
    return !record || record.arrival === null || limit === null || session.trainingAfterFailure ? null : record.arrival + limit;
  }
  function requestContact(session, caseId) {
    const record = mutable(session, caseId);
    if (!getCase(caseId).contact) throw new Error('このケースには照会先がありません。');
    if (record.requestAt !== null) return false;
    record.requestAt = session.elapsed;
    record.status = 'investigating';
    logHistory(session, 'contact-request', caseId, '担当者へ確認を依頼');
    if (replyAvailable(session, caseId)) logHistory(session, 'contact-reply', caseId, '担当者の回答を受信');
    return true;
  }
  function markInvestigating(session, caseId) {
    const record = mutable(session, caseId);
    if (record.status === 'investigating') return false;
    record.status = 'investigating';
    logHistory(session, 'investigate', caseId, '調査を開始');
    return true;
  }
  function addEvidence(session, caseId, evidenceId) {
    const record = mutable(session, caseId);
    if (!evidenceAvailable(session, evidenceId)) throw new Error('その証拠はまだ確認できません。');
    if (record.evidenceIds.includes(evidenceId)) return false;
    record.evidenceIds.push(evidenceId);
    record.status = 'investigating';
    return true;
  }
  function removeEvidence(session, caseId, evidenceId) {
    const record = mutable(session, caseId);
    const index = record.evidenceIds.indexOf(evidenceId);
    if (index < 0) return false;
    record.evidenceIds.splice(index, 1);
    return true;
  }
  function assessmentFor(session, caseId, draft, evidenceIds, at) {
    const c = getCase(caseId);
    const answer = c.answer;
    const usable = evidenceIds.filter(id => evidenceAvailableAt(session, id, at));
    const groups = answer.evidenceGroups.map(group => group.some(id => usable.includes(id)));
    const checks = [
      { id: 'verdict', label: '判定', passed: draft.verdict === answer.verdict, detail: '確認できた事実と判定が一致しているか' },
      { id: 'priority', label: '優先度', passed: answer.priorities.includes(draft.priority), detail: '対象と影響に見合う優先度か' },
      { id: 'action', label: '初動の対応', passed: answer.actions.includes(draft.action), detail: '根拠に応じた初動が選ばれているか' },
      { id: 'target', label: '対象の特定', passed: draft.target.trim().toLowerCase() === answer.target.trim().toLowerCase(), detail: '調査対象を正確に記録したか' },
      { id: 'evidence', label: '独立した根拠', passed: groups.every(Boolean), detail: groups.filter(Boolean).length + ' / ' + groups.length + ' 種類の根拠を記録' },
      { id: 'summary', label: '状況の記録', passed: draft.summary.trim().length > 0, detail: '自由記述は記入の有無のみ評価します' },
      { id: 'nextStep', label: '次の対応', passed: draft.nextStep.trim().length > 0, detail: '自由記述は記入の有無のみ評価します' }
    ];
    const weights = { verdict: 15, priority: 10, action: 20, target: 10, evidence: 30, summary: 10, nextStep: 5 };
    let score = checks.reduce((sum, check) => sum + (check.id === 'evidence' ? 30 * groups.filter(Boolean).length / Math.max(1, groups.length) : check.passed ? weights[check.id] : 0), 0);
    const passed = checks.every(check => check.passed);
    // Keep scoring tied to the original deadline, even after entering unlimited
    // training, so restoring a save never rewrites an earlier submission's score.
    const originalLimit = DIFFICULTIES[session.difficulty].limitSeconds;
    const deadline = originalLimit === null ? null : session.records[caseId].arrival + originalLimit;
    if (deadline !== null && at > deadline) {
      checks.push({ id: 'deadline', label: '時間内の初動', passed: false, detail: '当初の対応期限を超過（評価 −10点）。記録を完成させてください。' });
      score -= 10;
    }
    return { passed, score: Math.max(0, Math.round(score)), maxScore: 100, checks, missingGroups: groups.filter(value => !value).length };
  }
  function assessCase(session, caseId) {
    const record = recordFor(session, caseId);
    const draft = cleanDraft(record.draft);
    const ids = evidenceFor(session, record.evidenceIds);
    return assessmentFor(session, caseId, draft, ids, session.elapsed);
  }
  function submitCase(session, caseId) {
    const record = mutable(session, caseId);
    const assessment = assessCase(session, caseId);
    record.draft = cleanDraft(record.draft);
    record.submission = { at: session.elapsed, draft: clone(record.draft), evidenceIds: record.evidenceIds.slice() };
    record.attempts += 1;
    record.assessment = assessment;
    record.status = assessment.passed ? 'resolved' : 'investigating';
    record.resolvedAt = assessment.passed ? session.elapsed : null;
    logHistory(session, assessment.passed ? 'submit-pass' : 'submit-revise', caseId, assessment.passed ? '初動・引き継ぎを完了 (' + assessment.score + '点)' : '提出内容を再確認 (' + assessment.score + '点)');
    const ids = idsFor(session);
    if (assessment.passed && session.difficulty === 'low') {
      const next = ids[ids.indexOf(caseId) + 1];
      if (next && session.records[next].arrival === null) {
        session.records[next].arrival = session.elapsed;
        logHistory(session, 'arrival', next, '次のアラートを受信');
      }
    }
    if (ids.every(id => session.records[id].status === 'resolved')) {
      session.phase = 'completed';
      logHistory(session, 'complete', null, 'すべてのケースの初動を完了');
    }
    return assessment;
  }
  function releaseArrivals(session) {
    const events = [];
    if (session.difficulty !== 'high' || session.individualCaseId) return events;
    idsFor(session).forEach((id, i) => {
      if (session.records[id].arrival === null && i * 45 <= session.elapsed) {
        session.records[id].arrival = i * 45;
        events.push({ at: i * 45, type: 'arrival', caseId: id, detail: '追加のアラートを受信' });
      }
    });
    return events;
  }
  function advance(session, seconds) {
    number(seconds, '経過時間');
    if (session.phase !== 'running' || seconds === 0) return session;
    const before = session.elapsed;
    let end = Math.min(MAX_TIME, before + seconds);
    const ids = idsFor(session);
    let failedId = null;
    if (!session.trainingAfterFailure && DIFFICULTIES[session.difficulty].limitSeconds !== null) {
      ids.forEach((id, i) => {
        const record = session.records[id];
        const arrival = record.arrival !== null ? record.arrival : session.difficulty === 'high' ? i * 45 : null;
        if (!getCase(id).critical || record.status === 'resolved' || arrival === null) return;
        const deadline = arrival + DIFFICULTIES[session.difficulty].limitSeconds;
        if (deadline <= end && (!failedId || deadline < end)) { end = deadline; failedId = id; }
      });
    }
    session.elapsed = end;
    const timedEvents = releaseArrivals(session);
    ids.forEach(id => {
      const record = session.records[id];
      const c = getCase(id);
      if (!c.contact || record.requestAt === null) return;
      const ready = record.requestAt + c.contact.delaySeconds * DIFFICULTIES[session.difficulty].replyMultiplier;
      if (before < ready && ready <= end) {
        timedEvents.push({ at: ready, type: 'contact-reply', caseId: id, detail: '担当者の回答を受信' });
      }
    });
    timedEvents.sort((a, b) => a.at - b.at).forEach(event => {
      session.elapsed = event.at;
      logHistory(session, event.type, event.caseId, event.detail);
    });
    session.elapsed = end;
    if (failedId) {
      session.phase = 'gameover';
      session.failure = { caseId: failedId, at: end, reason: '重要案件の初動期限を超過しました。' };
      logHistory(session, 'gameover', failedId, session.failure.reason);
    }
    return session;
  }
  function pause(session) {
    if (session.phase !== 'running') return false;
    session.phase = 'paused';
    logHistory(session, 'pause', null, '勤務を一時停止');
    return true;
  }
  function resume(session) {
    if (session.phase !== 'paused') return false;
    session.phase = 'running';
    logHistory(session, 'resume', null, '勤務を再開');
    return true;
  }
  function continueTraining(session) {
    if (session.phase !== 'gameover') throw new Error('時間切れの勤務から利用できます。');
    session.trainingAfterFailure = true;
    session.phase = 'running';
    logHistory(session, 'training', null, '時間制限を解除して調査を続行');
    return true;
  }
  function retryCheckpoint(session) {
    if (session.phase !== 'gameover' || !session.failure) throw new Error('時間切れの勤務から利用できます。');
    const failedId = session.failure.caseId;
    const checkpoint = Math.max(session.records[failedId].arrival, session.failure.at - 180);
    session.elapsed = checkpoint;
    session.failure = null;
    session.trainingAfterFailure = false;
    for (const id of idsFor(session)) {
      const record = session.records[id];
      if (record.arrival !== null && record.arrival > checkpoint) { session.records[id] = blankRecord(null); continue; }
      if (record.requestAt !== null && record.requestAt > checkpoint) record.requestAt = null;
      record.evidenceIds = record.evidenceIds.filter(evidenceId => evidenceAvailable(session, evidenceId));
      if (record.submission && record.submission.at > checkpoint) {
        record.submission = null;
        record.assessment = null;
        record.resolvedAt = null;
        record.status = 'investigating';
      }
    }
    if (!session.records[session.selectedCaseId] || session.records[session.selectedCaseId].arrival === null) session.selectedCaseId = failedId;
    session.phase = 'paused';
    logHistory(session, 'retry', failedId, '期限の3分前から再挑戦（再開するまで時間は進みません）');
    return true;
  }

  function hydrate(value) {
    if (typeof value === 'string') {
      if (value.length > MAX_JSON_LENGTH) throw new Error('保存ファイルが大きすぎます。');
      try { value = JSON.parse(value); } catch (_) { throw new Error('JSON形式の保存ファイルを選択してください。'); }
    }
    let serialized;
    try { serialized = JSON.stringify(value); } catch (_) { throw new Error('保存データの形式が不正です。'); }
    if (!serialized || serialized.length > MAX_JSON_LENGTH) throw new Error('保存データが大きすぎるか不正です。');
    if (!plain(value) || value.version !== VERSION || !['running', 'paused', 'gameover', 'completed'].includes(value.phase)) throw new Error('対応していない保存データです。');
    const session = createSession(value.scenarioId, value.difficulty, value.individualCaseId === undefined ? null : value.individualCaseId);
    session.elapsed = number(value.elapsed, '保存時刻');
    if (typeof value.trainingAfterFailure !== 'boolean') throw new Error('練習モードの状態が不正です。');
    session.trainingAfterFailure = value.trainingAfterFailure;
    const ids = idsFor(session);
    if (!plain(value.records) || Object.keys(value.records).some(id => !ids.includes(id))) throw new Error('ケース一覧が不正です。');
    for (let i = 0; i < ids.length; i += 1) {
      const id = ids[i];
      const raw = value.records[id];
      if (!plain(raw)) throw new Error('ケースの保存内容が不足しています。');
      const previous = i ? session.records[ids[i - 1]] : null;
      const expectedArrival = session.individualCaseId || session.difficulty === 'medium' || i === 0 ? 0 : session.difficulty === 'high' ? (i * 45 <= session.elapsed ? i * 45 : null) : previous.status === 'resolved' ? previous.resolvedAt : null;
      if (raw.arrival !== expectedArrival) throw new Error('アラートの到着時刻が不正です。');
      const record = blankRecord(expectedArrival);
      session.records[id] = record;
      record.draft = cleanDraft(raw.draft);
      record.attempts = number(raw.attempts, '提出回数', 0, 10000);
      if (!Number.isInteger(record.attempts)) throw new Error('提出回数が不正です。');
      if (raw.requestAt !== null) {
        record.requestAt = number(raw.requestAt, '照会時刻', expectedArrival === null ? MAX_TIME + 1 : expectedArrival, session.elapsed);
      }
      // Other cases are populated below; validate cross-case evidence after every record is restored.
      if (!Array.isArray(raw.evidenceIds) || raw.evidenceIds.length > evidenceMap.size) throw new Error('証拠一覧が不正です。');
      record.evidenceIds = raw.evidenceIds.slice();
      if (raw.submission !== null && raw.submission !== undefined) {
        if (!plain(raw.submission) || expectedArrival === null || record.attempts < 1) throw new Error('提出履歴が不正です。');
        const at = number(raw.submission.at, '提出時刻', expectedArrival, session.elapsed);
        const draft = cleanDraft(raw.submission.draft);
        if (!Array.isArray(raw.submission.evidenceIds) || raw.submission.evidenceIds.length > evidenceMap.size) throw new Error('提出時の証拠一覧が不正です。');
        record.submission = { at, draft, evidenceIds: raw.submission.evidenceIds.slice() };
        // This first pass only establishes low-mode arrival ordering from source-case evidence.
        record.assessment = assessmentFor(session, id, draft, record.submission.evidenceIds, at);
        if (record.assessment.passed) { record.status = 'resolved'; record.resolvedAt = at; }
      }
      if (record.status !== 'resolved' && (record.attempts || record.requestAt !== null || record.evidenceIds.length || raw.status === 'investigating')) record.status = 'investigating';
    }
    for (const id of ids) {
      const record = session.records[id];
      record.evidenceIds = evidenceFor(session, record.evidenceIds);
      if (record.submission) {
        record.submission.evidenceIds = evidenceFor(session, record.submission.evidenceIds, record.submission.at);
        record.assessment = assessmentFor(session, id, record.submission.draft, record.submission.evidenceIds, record.submission.at);
        record.status = record.assessment.passed ? 'resolved' : 'investigating';
        record.resolvedAt = record.assessment.passed ? record.submission.at : null;
      }
    }
    if (value.failure !== null) {
      if (!plain(value.failure) || !ids.includes(value.failure.caseId) || !getCase(value.failure.caseId).critical || DIFFICULTIES[session.difficulty].limitSeconds === null) throw new Error('期限超過の履歴が不正です。');
      const failedRecord = session.records[value.failure.caseId];
      const at = number(value.failure.at, '期限超過時刻', 0, session.elapsed);
      if (failedRecord.arrival === null || at !== failedRecord.arrival + DIFFICULTIES[session.difficulty].limitSeconds) throw new Error('期限超過時刻が不正です。');
      session.failure = { caseId: value.failure.caseId, at, reason: '重要案件の初動期限を超過しました。' };
    }
    if (session.trainingAfterFailure && !session.failure) throw new Error('時間切れの履歴が見つかりません。');
    for (const id of ids) {
      const record = session.records[id];
      const limit = DIFFICULTIES[session.difficulty].limitSeconds;
      if (!record.submission || !getCase(id).critical || limit === null) continue;
      const afterDeadline = record.submission.at >= record.arrival + limit;
      const inTraining = session.trainingAfterFailure && session.failure && record.submission.at >= session.failure.at;
      if (afterDeadline && !inTraining) throw new Error('重要案件の期限後の提出は、時間切れ後の練習モードでのみ有効です。');
    }
    if (!Array.isArray(value.history) || value.history.length > MAX_HISTORY) throw new Error('操作履歴が多すぎるか不正です。');
    const historyTypes = ['arrival', 'contact-request', 'contact-reply', 'investigate', 'submit-pass', 'submit-revise', 'complete', 'gameover', 'pause', 'resume', 'training', 'retry', 'restore'];
    session.history = value.history.map(item => {
      if (!plain(item) || !historyTypes.includes(item.type) || (item.caseId !== null && !ids.includes(item.caseId))) throw new Error('操作履歴が不正です。');
      return { at: number(item.at, '履歴時刻'), type: item.type, caseId: item.caseId, detail: text(item.detail, '履歴', 500) };
    });
    const complete = ids.every(id => session.records[id].status === 'resolved');
    const expired = ids.filter(id => getCase(id).critical && session.records[id].status !== 'resolved' && getDeadline(session, id) !== null && getDeadline(session, id) <= session.elapsed).sort((a, b) => getDeadline(session, a) - getDeadline(session, b))[0];
    if (complete) session.phase = 'completed';
    else if (expired) {
      if (session.elapsed !== getDeadline(session, expired)) throw new Error('期限を超えた経過時刻が不正です。');
      session.phase = 'gameover';
      session.failure = { caseId: expired, at: session.elapsed, reason: '重要案件の初動期限を超過しました。' };
    } else session.phase = 'paused';
    if (value.phase === 'gameover' && session.phase !== 'gameover') throw new Error('時間切れの状態と調査内容が一致しません。');
    session.selectedCaseId = ids.includes(value.selectedCaseId) && session.records[value.selectedCaseId].arrival !== null ? value.selectedCaseId : ids[0];
    logHistory(session, 'restore', null, session.phase === 'paused' ? '保存データを復元（一時停止中）' : '保存データを復元');
    return session;
  }
  function clock(seconds) { const whole = Math.floor(seconds); return String(Math.floor(whole / 60)).padStart(2, '0') + ':' + String(whole % 60).padStart(2, '0'); }
  function report(session) {
    const scenario = DATA.scenarios.find(s => s.id === session.scenarioId);
    const lines = ['SOCroom 調査・引き継ぎレポート', '架空の教材環境 / ' + DATA.company.name, 'シフト: ' + scenario.title, '難易度: ' + DIFFICULTIES[session.difficulty].label, '経過: ' + clock(session.elapsed), '状態: ' + LABELS[session.phase], '自由記述の内容・正確性は自動採点していません。', ''];
    if (session.trainingAfterFailure) lines.push('時間切れ後の練習モード', '');
    for (const c of activeCases(session)) {
      const record = session.records[c.id];
      const draft = record.draft;
      lines.push('■ ' + c.title, '対象: ' + (draft.target || '未記入'), '状態: ' + LABELS[record.status], '判定: ' + (LABELS[draft.verdict] || '未選択'), '優先度: ' + (LABELS[draft.priority] || '未選択'), '対応: ' + (LABELS[draft.action] || '未選択'), '状況: ' + (draft.summary || '未記入'), '次の対応・未確認事項: ' + (draft.nextStep || '未記入'), '根拠:');
      record.evidenceIds.forEach(id => {
        const ref = evidenceMap.get(id);
        if (!ref || !evidenceAvailable(session, id)) return;
        const content = ref.kind === 'log' ? ref.item.raw : ref.kind === 'document' ? ref.item.title + '\n' + ref.item.body : ref.item.replyTitle + '\n' + ref.item.replyText;
        lines.push('[' + id + '] ' + content);
      });
      if (!record.evidenceIds.length) lines.push('未添付');
      lines.push('');
    }
    lines.push('操作履歴:');
    session.history.forEach(item => lines.push(clock(item.at) + ' ' + (item.caseId ? '[' + item.caseId + '] ' : '') + item.detail));
    return lines.join('\n');
  }
  return Object.freeze({ DIFFICULTIES, LABELS, createSession, getCase, activeCases, visibleLogs, evidenceAvailable, replyAvailable, requestContact, advance, markInvestigating, addEvidence, removeEvidence, submitCase, assessCase, getDeadline, pause, resume, continueTraining, retryCheckpoint, hydrate, report });
}));
