# SOCroom v0.3 implementation contract

The product is one offline HTML. Runtime: vanilla JS, embedded CSS and data, no network/API/framework. Source modules are global UMD/CommonJS for tests. User-facing language is Japanese. Build via `node build.js`.

## Dataset

`SOC_DATA.version = 'socroom-2'`. There are 16 unique cases: 5 in each fixed-difficulty pack `low`, `medium`, `high`, and 1 in hidden pack `tutorial`. Each scenario has `difficulty`; `createSession` rejects a different difficulty. Tutorial is `tutorial-scan`, low difficulty and individual mode. Cases and evidence never belong to multiple packs. `src/data.js` is the canonical bundled content.

CASE fields: `id, scenarioId, difficulty, title, subtitle, host, relatedHosts?, user, source, severity, critical, context, logs, documents, contact, hints, answer`.

Each log has globally unique `id`, UTC `time`, numeric `offset`, `source`, actual `host`, `user`, `ip`, `event`, `raw`, virtual `/var/log/...` path. `raw` contains the matching ISO UTC timestamp and actual host. Advanced logs may use `relatedHosts`; they are not all from the primary host. Assets include every declared host. Documents have `id,title,kind,body`. Contact contains `id,name,role,question,replyId,replyTitle,replyText,delaySeconds`.

Answers: `verdict` incident/benign/unknown; allowed `priorities` and `actions`; `target` equals primary case.host; `evidenceGroups` is an AND of OR groups, with no evidence repeated across groups; `summary,nextStep,explanation,lessons`. Low has at least 2 evidence groups, medium 3, high 4. Case content must substantiate each conclusion. Do not turn unknown observations into unsupported certainty. Incident means security incident and includes confirmed device loss, not only observed malicious activity.

## Engine and timing

Public APIs: createSession, getCase, activeCases, visibleLogs, evidenceAvailable, replyAvailable, requestContact, advance, markInvestigating, addEvidence, removeEvidence, submitCase, assessCase, getDeadline, pause, resume, continueTraining, retryCheckpoint, hydrate, report.

Low: sequential arrivals, no deadline, instant contact reply. Medium: all 5 arrive at time0, each1200s deadline. High: arrivals at0/45/90/135/180, each900s deadline; contact delays ×1.5. Individual practice always starts at0. Critical unresolved cases end the game at their deadline. Paused/hidden/modal time is excluded. Retry rewinds to3min before failed deadline and pauses. Unlimited review preserves failure history.

Engine session version equals dataset.version. Hydration checks source evidence, arrivals, decisions, submissions and timing rather than trusting imported assessments. It never resumes normal work automatically. Report text uses learner evidence and notes. Free text is checked for presence, not semantic correctness.

## UI and saves

Difficulty selection switches the entire five-case pack and resets individual selection. Home supports five-case shifts and individual practice. Case workspace includes logs, reference documents/assets, a multi-host timeline, sandboxed terminal and simulated contact. The target selector records the main case host; related-host impact belongs in the written report. Current session assets include only primary/related hosts from that session.

Local normal-save key `socroom.offline.v2`; tutorial-save key `socroom.tutorial.v2`. Wrapper remains `{format:'socroom-save',version:1,session,workspace,tutorial?}`. Tutorial state is version2. Tutorial and normal mode must agree with metadata; hidden tutorial sessions without tutorial metadata must not be accepted into normal storage. Tutorial start preserves and pauses the existing normal session/workspace; exit restores it. Example text never enters a normal-case report automatically.

v0.2 storage keys remain untouched. Legacy progress can be downloaded from the home page and imported in the preserved `socroom-v0.2.html`. Old session.version `socroom-1` must not be silently migrated to different questions.

## Tutorial and verification

21-step tutorial uses `SocTutorial.CASE_ID`, `SEARCH_QUERY`, `PRIMARY_LOG_ID`; avoid hardcoding these in UI logic. Next is enabled only when the real operation is complete. The current actionable control pulses slowly; after completing a step the Next control pulses. Respect reduced-motion settings. Preserve focus, Japanese IME composition, evidence state, resume position and normal-session isolation.

Tests use node:test and jsdom26.1.0 for DOM-only checks. Cover all16 cases, exclusive difficulty assignment, 5 arrivals, evidence/decision requirements, save isolation and old-save extraction. Release test builds deterministic self-contained HTML. Browser rendering is not verified by jsdom.


## v0.4 Guided practice

The hidden `bridge` scenario adds five dedicated low/untimed cases; normal cases and `socroom-2` engine storage remain unchanged. `SocBridge` manages a separate course `{version:1,index,guide:{step,seen},completed:[session,...]}`. Two guided cases, two checklist cases and one independent case all run as single-case sessions. Completion snapshots are revalidated with the engine before import/advance. Actual evidence, request and draft state determine guide progress; viewed-step flags are not proof of correctness.

`src/app.js` saves the course under `socroom.bridge.v1`, preserves normal and tutorial progress, and includes `bridge` in its existing JSON envelope. Scenario and envelope metadata must agree before imports can mutate state. Reflection gates progression to the next case, while free-text semantics remain explicitly ungraded.

Canonical data lives in `content/*.json`; `assemble-data.js` generates `src/data.js` before builds/tests.
