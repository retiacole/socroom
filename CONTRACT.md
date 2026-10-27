# SOCroom v0.5.1 implementation contract

The product is one offline HTML. Runtime: vanilla JavaScript, embedded CSS and data, no network/API/framework. Source modules are UMD/CommonJS for tests. User-facing language is Japanese. Build with `node build.js`; develop and test with Node.js 22 or later. The bundled file must not request external CSS, fonts, scripts or data; retain `connect-src 'none'`.

## Dataset and build

`SOC_DATA.version = 'socroom-3'`. There are 21 unique cases: five in each fixed-difficulty normal pack (`low`, `medium`, `high`), one in hidden pack `tutorial`, and five in hidden pack `bridge`. Difficulty selects different questions. `createSession` rejects a difficulty that does not match its scenario. Tutorial and bridge run as untimed individual sessions.

Canonical authored content lives in `content/*.json`. `assemble-data.js` invokes `prepare-data.js` to normalize source names and observed fields, render illustrative source formats, and add deterministic background events before generating `src/data.js`. Do not manually edit generated data. `build.js` assembles the sources and generated data into `socroom.html`.

Background events per normal case: low 50, medium 100, high 180. Bridge stages: guided 0, checklist 50, independent 75. Tutorial adds none. Generated background IDs are stable and distinct from authored IDs, and are not members of answer evidence groups. Adding background must not change the ground truth or reveal a conclusion. Include multiple sources and relevant peer assets so filters and shell pipelines have useful work to do.

Case fields include `id, scenarioId, difficulty, title, subtitle, host, relatedHosts?, user, source, severity, critical, context, logs, documents, contact, hints, answer, targets, targetType`. `targetType` is `host`, `account` or `application`. `targets` contains `{value,label}` choices including the intended target and plausible alternatives. A case's primary `host` locates the investigation; it does not require `answer.target` to be that host. Identity cases may target an account or application. Related-host impact belongs in the narrative. Missing user/host data is an empty string, not an invented identity or the word `unknown`.

Each log has globally unique `id`, UTC event `time`, nonnegative numeric release `offset`, `source`, observed `host/user/ip`, factual `event`, illustrative `raw`, and virtual `/var/log/...` path. Event labels describe product operations, not the analyst's inference. The source cannot report facts outside its collection capability. Raw absence/unknown assertions that reveal missing evidence belong in collection documentation instead. Real failed requests, returned status codes and checkpoint timestamps are observations and can be recorded.

The GUI fields are normalized for searching. Raw formats include illustrative Windows Security XML, Entra audit JSON and M365 audit JSON; background examples include OpenSSH syslog and nginx combined. Other services use explicitly labeled SOCroom JSON. These are synthetic teaching examples with omitted or custom fields, not complete vendor schemas. Keep `format` labels honest and preserve timestamps/identifiers needed for correlation. Collection documents explain acquisition intervals, retained fields, delays and access limitations. Change tickets describe positively authorized scope, leaving comparison to the learner. Human replies use ordinary partial observations rather than log IDs or the final analysis.

Documents have `id,title,kind,body`. Contact retains the compatibility fields `id,name,role,question,replyId,replyTitle,replyText,delaySeconds`. Normal cases additionally have `contact.questions`: independently requestable `{id,question,replyId,replyTitle,replyText,delaySeconds}` entries. The specific question keeps the original replyId; vague/leading variants have distinct IDs and limited replies. Tutorial and guided practice may keep a single question to preserve their teaching sequence. The engine resolves contacts through `getContactQuestions` and `availableReplies`, not one assumed reply per case.

## Answers, evidence and reports

Answers contain `verdict` (`incident`, `benign`, `unknown`), allowed `priorities`, allowed primary `actions`, `target`, optional `targetAliases`, `evidenceGroups`, and `summary,nextStep,explanation,lessons`. `answer.targetType` may mirror the case field. `evidenceGroups` is an AND of OR groups with no evidence repeated across groups. Required evidence must substantiate the answer. Unknown requires an observed concern and explicit evidence about the limits of collection, not an assertion of safety or attack based on absence alone.

Do not mechanically derive priority or action from verdict. Supported examples include benign activity needing further monitoring, uncertainty needing authorized precautionary containment, and a confirmed incident requiring escalation because the SOC lacks the applicable containment authority. Operational authority and next-step conditions must be available in the case materials. The action selector records the immediate primary response; parallel communication and follow-up belong in the written report. Incident also includes confirmed device loss, not only malicious computer activity.

The default main-evidence submission budget is `answer.evidenceGroups.length + 2`; an explicit `answer.evidenceLimit` must be at least the group count. Investigation can temporarily collect more items, but submitting over budget fails the focus check. Selecting every item must not produce a passing answer. Coverage earns up to 20 points according to the proportion of required groups met; being within the evidence budget earns 10 points. This is a bounded selection exercise, not semantic relevance grading of every extra item.

Current weights: verdict 15, priority 10, action 20, target 10, evidence coverage 20, evidence focus 10, summary anchor 10, next-step recipient 5. Every required check must pass to resolve a case. Equivalent evidence and multiple accepted primary actions remain possible where authored explicitly.

The summary must include a case target/host, visible case or evidence identifier, or an HH:MM time. The next step must name a recipient category such as a responsible person, administrator, SOC, CSIRT or operational contact. These are structural presence checks only: they do not verify prose meaning, truth, reasoning quality, or the suitability of the requested action. The UI must state this limitation and offer the authored report for comparison. Middle-level hints stop at two stages and must not disclose the number or contents of evidence groups. High cases have no hints.

## Engine, availability and timing

The public engine supports session creation, active cases, visible logs, evidence availability, question requests/replies, evidence selection, assessment/submission, deadlines, pause/resume, unlimited review, checkpoint retry, hydration and report export. Current helper APIs include `evidenceLimit`, `getContactQuestions` and `availableReplies`.

Low: sequential arrivals, no deadline, instant replies. Medium: all five arrive at zero, each has a 1,200-second deadline. High: arrivals at 0/45/90/135/180 seconds, each has a 900-second deadline; reply delays are multiplied by 1.5. Individual practice begins at zero. High cases include later-released logs; their offsets are measured from case arrival. An unreleased log or reply is unavailable to GUI search, timeline, terminal source files and evidence registration. Normal event timestamps and active session time are separate concepts.

Critical unresolved cases end the game at their deadline. Paused, hidden and modal time is excluded. Advancing to the next update consumes active time and can cross a deadline. Retry rewinds to three minutes before the failed deadline and pauses. Unlimited review retains failure history. Late responses to noncritical cases may complete work but retain the late penalty. These are training rules, not a representation of real SOC service-level commitments.

## Investigation UI and terminal

The workspace contains logs, reference documents/assets, a multi-host timeline, sandboxed terminal, contact choices and a report. Logs and timeline support query, source, host and UTC time-range filters. Normalized identity fields must not populate missing source data merely to make filters convenient. The target selector supports hosts, accounts and applications, with tutorial-specific wording preserved where its walkthrough requires it.

Terminal files represent the same available evidence as the GUI. Preserve a stable append order when later logs arrive; do not insert newly received historical events before existing file rows. Chronological ordering is a view or a learner pipeline, not an in-place rewrite of the evidence source. `grep -n` can locate an original line; `evidence /path:line` resolves that original source row and invokes the engine's normal availability/case checks. A source row that does not map to selectable evidence must fail. Workspace copies, nonexistent rows, the trailing newline sentinel and empty files cannot be registered.

`/home/analyst` is the writable workspace (2 MiB per file, 4 MiB total, 128 files, 256 directories including the home directory). Original files, including originals located beneath home, are immutable. The adapter guards storage mutations with Proxy checks as well as shell metadata. Pipes, xargs, redirects, backups, directory moves and simulated sudo must not bypass this boundary. `/dev/null` is a sink and does not create a workspace file. Restoring a workspace cannot inject, shadow or move a source file.

The shell is a training subset, not a real OS or a fully GNU-compatible shell. Tilde paths, stderr redirection and awk concatenation are supported; PCRE `\d`/`\D` in BRE/ERE grep are explicitly rejected in favor of POSIX character classes. The `rg` command supports `\d`/`\D` for files and piped input without a PCRE flag. Variable expansion, command substitution, network clients and arbitrary program execution are unavailable. vi/view/sl are unsupported in SOCroom. less/more print text without an interactive pager. sudo only simulates privilege for supported commands and never permits changing original evidence.

`src/vendor-shell.js` comes from Logroom commit `6d54626138261b9756d959050bca8fe29d1d9181`. `scripts/logroom-source.json` records repository, path, commit and upstream SHA-256. `scripts/sync-logroom.js` takes a downloaded upstream source file and a full commit SHA, verifies expected integration markers including upstream's separate grep/rg digit-class handling, adds exports, and refreshes the vendor header and manifest. Keep the pinned download and sync arguments identical. Review upstream changes and run terminal plus full tests after every sync; the wrapper remains the authority for immutability.

## Saves and migration

Normal storage key remains `socroom.offline.v2`, tutorial `socroom.tutorial.v2`, bridge `socroom.bridge.v1`. JSON envelope remains `{format:'socroom-save',version:1,session,workspace,tutorial?,bridge?}`. Tutorial state is version 2; bridge course state is version 1. Mode, scenario and envelope metadata must agree before import mutates any state. Start/exit of tutorial or bridge preserves and pauses the separate normal session and workspace.

Engine hydration accepts current `socroom-3` and previous `socroom-2` sessions (v0.3/v0.4), validates source IDs, arrivals, released evidence/replies, decisions, submissions and timing, and recomputes assessments instead of trusting saved scores. It preserves drafts, evidence and history. Previously resolved cases invalidated by new content or the rubric reopen for untimed review; an affected session resumes paused and records migration metadata. Re-exported migration data must also be validated. Unaffected work must not be reset merely because of the version upgrade.

Bridge migration reopens the first affected lesson while preserving later case records in `reviewArchive`. Advancing through the course restores these archived sessions rather than starting them empty. Preserve optional reflections and working files. Do not discard later notes when an earlier lesson needs new evidence.

v0.2 storage remains untouched. Its `socroom-1` sessions describe different questions and must not be silently imported into this dataset. The home page may export that legacy progress for the preserved v0.2 HTML. Local file localStorage behavior is browser-dependent; explicit JSON export is the portable backup.

## Tutorial and guided practice

The 21-step tutorial uses `SocTutorial.CASE_ID`, `SEARCH_QUERY`, `PRIMARY_LOG_ID`; UI logic must not duplicate these constants. Next becomes available after the real operation. Pulse the current actionable control slowly and respect reduced-motion settings. Preserve focus, Japanese IME composition, evidence state, resume position and normal-session isolation. Examples are scoped to the tutorial and never fill a normal report automatically.

Bridge has five dedicated cases: two guided, two checklist, one independent. Every case is untimed, single-case and uses immediate replies. `SocBridge` manages a course with `index`, `guide`, `completed`, optional `reflections` and `reviewArchive`. Evidence, actual requests and draft state determine guide completion; viewed-step flags alone are not proof of correctness. Completed sessions are revalidated before import or advance.

Reflection compares the learner report with the authored facts, limits and next step, and requires acknowledgement before advancing. Optional learner entries `{facts,limits,next}` are saved per case and restored; each is limited to 1,400 characters. These reflection entries are not semantically graded.

## Verification

Use node:test and jsdom 26.1.0. Cover all 21 cases, exclusive difficulty assignment, timing/availability, selective evidence budgets, identity targets, independent question state, structural report checks, old-save migration and bridge archive preservation. Terminal tests cover useful pipelines plus protection across sudo, redirects, xargs, backups, source refresh and save import. Release tests must prove deterministic self-contained output and consistency with the authored/derived data. jsdom verifies DOM behavior, not real-browser rendering or file-URL storage compatibility.
