/* SOCroom v0.5.1 — offline analyst workbench */
(() => {
  'use strict';
  const D = globalThis.SOC_DATA, E = globalThis.SocEngine, T = globalThis.SocTutorial, B = globalThis.SocBridge;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {incident:'セキュリティインシデントを確認',benign:'正当な操作・業務',unknown:'判定保留・追加調査が必要',high:'高',medium:'中',low:'低',escalate:'追加調査・上位担当へ引き継ぐ',contain:'封じ込めを依頼する',close:'根拠を添えてクローズ',monitor:'継続監視・経過観察'};
  const paths = {search:'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',logs:'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',folder:'M3 6h6l2 2h10v12H3z M3 6V4h6l2 2',clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',terminal:'M4 7l5 5-5 5 M12 17h7',message:'M3 4h18v13H8l-5 4z M7 8h10 M7 12h6',plus:'M12 5v14 M5 12h14',check:'M5 12l4 4L19 6',close:'M6 6l12 12 M18 6L6 18',play:'M8 4l12 8-12 8z',pause:'M8 5v14 M16 5v14',save:'M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4',upload:'M12 16V4 M7 9l5-5 5 5 M4 17v4h16v-4',arrow:'M4 12h16 M14 6l6 6-6 6',help:'M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5 M12 17v.1 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',home:'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8',shield:'M12 3l8 3v7c0 5-8 9-8 9S4 18 4 13V6z M8 12l3 3 5-6',flag:'M5 22V3 M5 3h14l-3 5 3 5H5',refresh:'M20 7V2 M20 7h-5 M20 7a9 9 0 1 0 1 8',link:'M10 14l4-4 M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0 M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0'};
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.logs}"/></svg>`;
  const fmt = seconds => {const n = Math.max(0,Math.floor(Number(seconds)||0));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;};
  const storeKey = 'socroom.offline.v2';
  const tutorialKey = 'socroom.tutorial.v2';
  const bridgeKey = 'socroom.bridge.v1';
  let bridge = null, bridgeSaved = null, bridgeContextOpen = false;
  const legacySaves={};
  for(const kind of ['normal','tutorial']){try{const raw=JSON.parse(localStorage.getItem(kind==='normal'?'socroom.offline.v1':'socroom.tutorial.v1')||'null');if(raw?.session?.version==='socroom-1')legacySaves[kind]=raw;}catch(error){}}
  let tutorial = null, tutorialSaved = null, normalSnapshot = null, tutorialContextOpen = false, tutorialTargetKey = '';
  let session = null, terminal = null, screen = 'home', storageOK = true, saveTimer, lastTick = performance.now(), lastSave = 0, resumeAfterModal = false, toastTimer;
  let composing = false, pendingRender = false;
  let home = {scenarioId:D.scenarios[0].id,difficulty:'low',individual:''};
  let ui = {tab:'logs',query:'',source:'',host:'',command:'',terminalEntries:[],outcomeShown:'',hintLevel:0};
  let renderedUI = null;
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
    if (saved) {const restored=E.hydrate(saved.session||saved);if(D.scenarios.find(s=>s.id===restored.scenarioId)?.hidden||saved.tutorial||saved.bridge)throw new Error('通常勤務の保存内容ではありません。');session=restored;home.scenarioId=session.scenarioId;home.difficulty=session.difficulty;home.individual=session.individualCaseId||'';}
    localStorage.setItem('socroom.storage-test','1');localStorage.removeItem('socroom.storage-test');
    if(saved?.workspace) {terminal=globalThis.SocTerminal.create({});terminal.setWorkspace(saved.workspace);}
  } catch(error) {storageOK=false;}
  try {tutorialSaved=JSON.parse(localStorage.getItem(tutorialKey)||'null');} catch(error) {tutorialSaved=null;}
  try {bridgeSaved=JSON.parse(localStorage.getItem(bridgeKey)||'null');} catch(error) {bridgeSaved=null;}
  const scenario = () => D.scenarios.find(x => x.id === (session?.scenarioId || home.scenarioId));
  const selected = () => E.getCase(session?.selectedCaseId);
  const record = () => session?.records[session.selectedCaseId];
  const running = () => session?.phase === 'running';
  const caseIds = () => Object.keys(session?.records || {});
  const limit = () => session?.migration?.untimedReview ? null : session && E.DIFFICULTIES[session.difficulty].limitSeconds;
  function remaining(id) {const r=session.records[id];return limit()==null || session.trainingAfterFailure || r.arrival==null ? null : Math.max(0,r.arrival+limit()-session.elapsed);}
  function notify(message,error=false) {clearTimeout(toastTimer);$('toast').textContent=message;$('toast').className=error?'error':'';$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4800);}
  function savedObject() {return {format:'socroom-save',version:1,session,workspace:terminal?.getWorkspace() || null,...(tutorial?{tutorial}: {}),...(bridge?{bridge}: {})};}
  function save(immediate=false) {clearTimeout(saveTimer);if(!session)return;const key=bridge?bridgeKey:tutorial?tutorialKey:storeKey,payload=JSON.stringify(savedObject());if(tutorial)tutorialSaved=JSON.parse(payload);if(bridge)bridgeSaved=JSON.parse(payload);const perform=()=>{try{localStorage.setItem(key,payload);storageOK=true;}catch(e){storageOK=false;}const s=$('save-status');if(s)s.textContent=storageOK?'このブラウザに保存済み':'自動保存不可 · 保存ファイルを書き出してください';};if(immediate)perform();else saveTimer=setTimeout(perform,250);}
  function download(name,content,type) {const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function saveFile(){if(!session)return;download(`socroom-${bridge?'guided-practice':tutorial?'tutorial':session.scenarioId+'-'+session.difficulty}.json`,JSON.stringify(savedObject(),null,2),'application/json');notify('進捗ファイルを保存しました。「読込」で再開できます。');}
  function reportFile(){download(`socroom-${session.scenarioId}-report.txt`,E.report(session)+(bridge?.reflections?.[selected().id]?'\n自己振り返り\n事実: '+bridge.reflections[selected().id].facts+'\n限界: '+bridge.reflections[selected().id].limits+'\n次の対応: '+bridge.reflections[selected().id].next+'\n':''),'text/plain;charset=utf-8');notify('調査報告を書き出しました。');}
  function evidence(id) {
    for(const c of D.cases){const log=c.logs.find(x=>x.id===id);if(log)return {id,type:'log',title:log.event,detail:`${log.time} · ${log.source} · ${log.host}`,body:log.raw};const doc=c.documents.find(x=>x.id===id);if(doc)return {id,type:'document',title:doc.title,detail:doc.kind,body:doc.body};const reply=E.getContactQuestions(c.id).find(q=>q.replyId===id);if(reply)return {id,type:'reply',title:reply.replyTitle,detail:`${c.contact.name}からの回答`,body:reply.replyText};}
    return {id,title:id,detail:'',body:''};
  }
  function sessionAssets(){const hosts=new Set(caseIds().flatMap(id=>{const c=E.getCase(id);return [c.host,...(c.relatedHosts||[]),...(c.backgroundHosts||[])];}));return D.assets.filter(a=>hosts.has(a.name));}
  const logOwners=new Map(D.cases.flatMap(c=>c.logs.map(l=>[l.id,c])));
  let fileEvidence = {};
  function filesForSession() {
    const files={};fileEvidence={};
    // Append by availability, so late batches never renumber already displayed lines.
    const logs=E.visibleLogs(session).slice().sort((a,b)=>{
      const ca=logOwners.get(a.id),cb=logOwners.get(b.id);
      return (session.records[ca.id].arrival+a.offset)-(session.records[cb.id].arrival+b.offset)||a.time.localeCompare(b.time)||a.id.localeCompare(b.id);
    });
    for(const log of logs){files[log.path]=(files[log.path]||'')+log.raw+'\n';(fileEvidence[log.path]??=[]).push(log.id);}
    for(const c of E.activeCases(session)){
      for(const d of c.documents){const path=`/reference/${d.id}.txt`;files[path]=`${d.title}\n${d.body}\n`;fileEvidence[path]=files[path].trimEnd().split('\n').map(()=>d.id);}
      for(const reply of E.availableReplies(session,c.id)){const path=`/reference/${reply.replyId}.txt`;files[path]=reply.replyText+'\n';fileEvidence[path]=reply.replyText.split('\n').map(()=>reply.replyId);}
    }
    files['/reference/assets.txt']=sessionAssets().map(a=>`${a.name} | 担当: ${a.owner} | 重要度: ${a.importance}\n${a.description}`).join('\n\n');
    files['/reference/README.txt']='SOCroom / 仮想調査端末\nログと資料は参照専用です。/home/analyst に作業ファイルを作成できます。\nls -R /var/log\nls /reference\nhelp grep\nhelp evidence\ngrep -n で原本の行番号を調べ、evidence /path/to/log:12 で現在の案件へ登録できます。\n時間はUTC。GUIと同じ公開済みログです。ファイルは到着順で追記されるため、時系列調査では発生時刻を照合してください。\n';
    return files;
  }
  function syncTerminal(){
    if(!session)return;const files=filesForSession();
    if(!terminal)terminal=globalThis.SocTerminal.create(files);else terminal.updateFiles(files);
    terminal.setEvidenceHandler((path,line)=>{const id=fileEvidence[path]?.[line-1];if(!id)throw new Error('証拠にできる原本の行ではありません。');E.addEvidence(session,selected().id,id);return id;});
  }
  function change(fn){try{fn();syncTerminal();save();render();checkOutcome();}catch(error){notify(error.message||'操作を完了できませんでした。',true);}}
  const freshUI = () => ({tab:'logs',query:'',source:'',host:'',command:'',terminalEntries:[],outcomeShown:'',hintLevel:0});
  const tutorialStep = () => tutorial && T.STEPS[tutorial.step];
  const tutorialComplete = () => tutorial && T.complete(tutorialStep(),tutorial,session);
  function tutorialMark(flag){if(tutorial){T.mark(tutorial,flag);save();}}
  function prepareTutorialStep(){const step=tutorialStep();if(!step)return;if(step.view)ui.tab=step.view;if(step.view==='logs'){ui.source='';ui.host=selected().host;ui.query=step.query??tutorial.query;}tutorialTargetKey='';}
  function startTutorial(resume=false){
    let next, guide, workspace;
    try {if(resume&&tutorialSaved){next=E.hydrate(tutorialSaved.session);guide=T.hydrate(tutorialSaved.tutorial,next);workspace=tutorialSaved.workspace;}else{next=E.createSession('tutorial','low',T.CASE_ID);guide=T.create();}}
    catch(error){notify('チュートリアルを再開できません。「最初から」で始め直せます。',true);return;}
    enterTutorial(next,guide,workspace);
  }
  function enterTutorial(next,guide,workspace){
    const nextTerminal=globalThis.SocTerminal.create({});if(workspace)nextTerminal.setWorkspace(workspace);
    if(bridge)exitBridge();closeModal(false);if(running())E.pause(session);save(true);
    if(!tutorial)normalSnapshot={session,terminal,ui,home:{...home}};
    tutorial=guide;session=next;terminal=nextTerminal;
    ui=freshUI();ui.query=tutorial.query;screen='work';tutorialContextOpen=false;
    if(session.phase==='paused')E.resume(session);
    prepareTutorialStep();syncTerminal();lastTick=performance.now();lastSave=session.elapsed;save(true);render();
    notify('操作チュートリアルです。上の案内に沿って、一つずつ進めましょう。');
  }
  function exitTutorial(){
    if(!tutorial)return;closeModal(false);if(running())E.pause(session);save(true);
    const original=normalSnapshot;tutorial=null;normalSnapshot=null;tutorialContextOpen=false;tutorialTargetKey='';
    session=original?.session||null;terminal=original?.terminal||null;ui=original?.ui||freshUI();if(original)home=original.home;
    screen='home';lastTick=performance.now();lastSave=session?.elapsed||0;render();
  }
  function renderTutorialGuide(){
    const step=tutorialStep(),done=tutorialComplete(),last=tutorial.step===T.STEPS.length-1;
    return `<section class="tutorial-guide" id="tutorial-guide" aria-label="操作チュートリアル" data-step="${esc(step.id)}"><div class="tutorial-copy"><div class="tutorial-heading"><span class="badge good">操作チュートリアル</span><span class="mono" id="tutorial-count">${tutorial.step+1} / ${T.STEPS.length}</span><span class="muted">${esc(step.phase)} · 時間制限なし</span></div><h2 id="tutorial-title" tabindex="-1">${esc(step.title)}</h2><p id="tutorial-instruction">${esc(step.instruction)}</p><p class="tutorial-why">${esc(step.why)}</p><p class="tutorial-result ${done?'done':''}">${done?esc(step.result):'強調された場所を操作すると、このステップを完了できます。'}</p></div><div class="tutorial-controls"><div class="tutorial-progress" role="progressbar" aria-label="チュートリアルの進み具合" aria-valuemin="0" aria-valuemax="${T.STEPS.length}" aria-valuenow="${tutorial.step+(done?1:0)}"><span style="width:${(tutorial.step+(done?1:0))/T.STEPS.length*100}%"></span></div><div class="tutorial-nav"><button class="btn compact" data-action="tutorial-back" ${tutorial.step===0?'disabled':''}>前へ</button><button class="btn primary compact" data-action="${last?'tutorial-exit':'tutorial-next'}" ${!done?'disabled':''}>${last?'終了して勤務選択へ':tutorial.step===0?'操作を始める':'次へ →'}</button></div>${step.example?'<button class="btn compact" data-action="tutorial-example">この欄に入力例を入れる</button>':''}<button class="btn ghost compact" data-action="tutorial-locate">${icon('flag')}操作場所を表示</button>${!last?'<button class="tutorial-exit" data-action="tutorial-exit">中断して勤務選択へ</button>':''}</div></section>`;
  }
  function highlightTutorial(force=false){
    document.querySelectorAll('.tutorial-pulse').forEach(el=>el.classList.remove('tutorial-pulse'));
    document.querySelectorAll('[data-tutorial-target]').forEach(el=>{el.classList.remove('tutorial-target');el.removeAttribute('data-tutorial-target');el.removeAttribute('aria-describedby');});
    const live=$('tutorial-status');
    if(!tutorial||screen!=='work'){if(live)live.textContent='';return;}
    const announcement=`ステップ ${tutorial.step+1}。${tutorialStep().instruction}${tutorialComplete()?' '+tutorialStep().result:''}`;if(live&&live.textContent!==announcement)live.textContent=announcement;
    const step=tutorialStep(),target=document.querySelector(step.target)||(step.fallback&&document.querySelector(step.fallback));
    const nextAction=$('dialog').open?$('dialog').querySelector('.modal-actions .primary'):tutorialComplete()?document.querySelector('.tutorial-nav .primary'):target||document.querySelector('[data-action="tutorial-locate"]');
    if(nextAction&&!nextAction.disabled&&nextAction.matches('button,input,textarea,select,summary'))nextAction.classList.add('tutorial-pulse');
    if(!target)return;
    target.classList.add('tutorial-target');target.dataset.tutorialTarget='true';target.setAttribute('aria-describedby','tutorial-instruction');
    const key=step.id+':'+ui.tab;
    if(force||tutorialTargetKey!==key){target.scrollIntoView?.({block:'center',inline:'nearest',behavior:'instant'});tutorialTargetKey=key;}
    if(force){if(!target.matches('button,input,textarea,select,summary'))target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  function refreshTutorial(){
    if(!tutorial||screen!=='work')return;
    const before=tutorial.step;T.normalize(tutorial,session);
    if(before!==tutorial.step){prepareTutorialStep();save();render();return;}
    const guide=$('tutorial-guide');if(guide)guide.outerHTML=renderTutorialGuide();
    const submit=document.querySelector('#case-form .submit');if(submit)submit.disabled=!running()||record().status==='resolved'||tutorialStep().id!=='submit';
    highlightTutorial();
  }
  function tutorialNext(){if(!tutorialComplete())return;tutorial.step=Math.min(tutorial.step+1,T.STEPS.length-1);prepareTutorialStep();save(true);render();$('tutorial-title')?.focus({preventScroll:true});}
  function tutorialBack(){if(!tutorial||tutorial.step===0)return;tutorial.step--;prepareTutorialStep();save(true);render();$('tutorial-title')?.focus({preventScroll:true});}
  function tutorialLocate(){if(!tutorial)return;prepareTutorialStep();render();highlightTutorial(true);}
  function tutorialExample(){const step=tutorialStep();if(!step?.example||!running()||record().status==='resolved')return;record().draft[step.field]=step.example;save();render();highlightTutorial(true);}
  const bridgeStageLabels = {guided:'行動と理由のガイド',checklist:'チェックリストで調査',independent:'自力で1件を完了'};
  const bridgeStep = () => bridge && selected().bridge.steps[bridge.guide.step];
  function bridgeMark(flag){if(bridge){B.mark(bridge,flag);save();}}
  function prepareBridgeStep(){const step=bridgeStep();if(step?.tab&&step.kind!=='seen')ui.tab=step.tab;}
  function startBridge(resume=false){
    let next,course,workspace;
    try{
      if(resume&&bridgeSaved){next=E.hydrate(bridgeSaved.session);course=B.hydrate(bridgeSaved.bridge,next);workspace=bridgeSaved.workspace;}
      else{course=B.create();next=E.createSession('bridge','low',B.currentCase(course).id);}
      enterBridge(next,course,workspace);
    }catch(error){notify('実務演習を再開できません。保存ファイルを確認するか「最初から」で始め直してください。',true);}
  }
  function enterBridge(next,course,workspace){
    if(course.resumeSession){if(workspace){course.reviewWorkspaces??={};course.reviewWorkspaces[next.selectedCaseId]=workspace;}next=course.resumeSession;delete course.resumeSession;workspace=course.reviewWorkspaces?.[next.selectedCaseId]||null;if(workspace)delete course.reviewWorkspaces[next.selectedCaseId];}
    const nextTerminal=globalThis.SocTerminal.create({});if(workspace)nextTerminal.setWorkspace(workspace);
    if(tutorial)exitTutorial();closeModal(false);if(running())E.pause(session);save(true);
    if(!bridge)normalSnapshot={session,terminal,ui,home:{...home}};
    bridge=course;session=next;terminal=nextTerminal;ui=freshUI();screen='work';bridgeContextOpen=false;
    if(session.phase==='paused')E.resume(session);
    prepareBridgeStep();syncTerminal();lastTick=performance.now();lastSave=session.elapsed;save(true);render();checkOutcome();
    if(session.phase!=='completed')notify(`実務演習 ${bridge.index+1} / 5。時間制限はありません。`);
  }
  function exitBridge(){
    if(!bridge)return;closeModal(false);if(running())E.pause(session);save(true);
    const original=normalSnapshot;bridge=null;normalSnapshot=null;bridgeContextOpen=false;
    session=original?.session||null;terminal=original?.terminal||null;ui=original?.ui||freshUI();if(original)home=original.home;
    screen='home';lastTick=performance.now();lastSave=session?.elapsed||0;render();
  }
  function restartBridge(){modal('実務演習を最初から',`<p>5件のガイド付き実務演習の進捗をリセットします。通常勤務と操作チュートリアルはそのまま残ります。</p><p>現在の実務演習を残したい場合は、先に保存してください。</p>`,`<button class="btn" data-action="bridge-export-saved">現在の実務演習を保存</button><button class="btn ghost" data-action="close-dialog">戻る</button><button class="btn primary" data-action="bridge-reset-confirmed">最初から始める</button>`);}
  function renderBridgeEntry(){
    const completed=Array.isArray(bridgeSaved?.bridge?.completed)?Math.min(5,bridgeSaved.bridge.completed.length):0;
    return `<section class="bridge-entry" aria-labelledby="bridge-entry-title"><div class="bridge-entry-heading"><div><span class="eyebrow accent">GUIDED PRACTICE / 専用ケース 5件</span><h2 id="bridge-entry-title">操作が分かったら、調査をつなげよう。</h2><p>何を調べ、何を証拠に残し、どう報告するか。案内を少しずつ減らしながら、通常勤務へ進む準備をします。</p></div><span class="badge good">全件 時間制限なし</span></div><ol class="bridge-roadmap">${B.CASE_IDS.map((id,i)=>{const c=E.getCase(id);return `<li class="${i<completed?'done':''}"><span class="mono">${i<completed?'✓':String(i+1).padStart(2,'0')}</span><div><small>${esc(bridgeStageLabels[c.bridge.stage])}</small><strong>${esc(c.title)}</strong><p>${esc(c.bridge.focus)}</p></div></li>`;}).join('')}</ol><div class="bridge-entry-footer"><p class="small muted">${completed===5?'5件の対応を完了しました。次は「難易度 低」の通常勤務へ。':`${completed} / 5 件の対応を完了 · 1件ずつ取り組みます。`}<br>通常勤務・操作チュートリアルとは別に進捗を保存します。</p><div class="flex wrap">${bridgeSaved?`<button class="btn ghost compact" data-action="bridge-restart">最初から</button><button class="btn primary" data-action="bridge-resume">${completed===5?'最後の振り返りを見る':'実務演習の続きから'} ${icon('arrow')}</button>`:`<button class="btn primary" data-action="bridge-start">ガイド付き実務演習を始める ${icon('arrow')}</button>`}</div></div></section>`;
  }
  function renderBridgeGuide(){
    const c=selected(),meta=c.bridge,step=bridgeStep(),resolved=record().status==='resolved';
    let body='';
    if(resolved)body=`<p>対応を記録しました。自分の報告と報告例を比べ、確認できた事実・根拠・未確認事項を振り返りましょう。</p><button class="btn primary compact" data-action="bridge-review">報告を振り返る</button>`;
    else if(meta.stage==='guided'){
      const done=B.stepComplete(step,bridge,session),last=bridge.guide.step===meta.steps.length-1;
      body=`<div class="bridge-guided-copy"><h3 id="bridge-title" tabindex="-1">${bridge.guide.step+1} / ${meta.steps.length}　${esc(step.title)}</h3><p id="bridge-instruction">${esc(step.instruction)}</p><p class="bridge-why"><strong>この行動の理由</strong>　${esc(step.why)}</p><p class="small ${done?'accent':'muted'}">${done?'✓ 操作を確認しました。内容を確かめて次へ進めます。':'案内された作業を行うと、次へ進めます。'}</p></div><div class="bridge-controls"><div class="flex"><button class="btn compact" data-action="bridge-back" ${bridge.guide.step===0?'disabled':''}>前へ</button><button class="btn primary compact" data-action="bridge-next" ${!done||last?'disabled':''}>次へ →</button></div><button class="btn ghost compact" data-action="bridge-locate">${icon('flag')}操作場所を表示</button></div>`;
    }else if(meta.stage==='checklist'){
      body=`<p class="small muted">調べる順番と使うツールは自分で選びます。作業を行うと該当する項目にチェックが付きます。チェックは操作の実施を示し、判断の正しさは提出時に確認します。</p><ul class="bridge-checklist">${meta.steps.map(step=>{const done=B.stepComplete(step,bridge,session);return `<li class="${done?'done':''}" data-check="${esc(step.id)}"><span aria-label="${done?'実施済み':'未実施'}">${done?'✓':'○'}</span>${esc(step.title)}</li>`;}).join('')}</ul>`;
    }else body='<p class="bridge-independent">この1件は、調査の順番・必要な証拠・判断と引き継ぎを自分で組み立てます。提出後に報告を振り返れます。行き詰まったら「調査のヒント」も利用できます。</p>';
    return `<section class="bridge-guide" id="bridge-guide" aria-label="ガイド付き実務演習" data-stage="${esc(meta.stage)}" data-step="${esc(step?.id||'independent')}"><div class="bridge-guide-heading"><span class="badge good">実務演習 ${bridge.index+1} / 5</span><strong>${esc(bridgeStageLabels[meta.stage])}</strong><span class="small muted">時間制限なし</span><button class="btn ghost compact" data-action="bridge-exit">中断して勤務選択へ</button></div><p class="bridge-objective"><strong>今回の目標</strong>　${esc(meta.objective)}</p><div class="bridge-guide-body">${body}</div></section>`;
  }
  function highlightBridge(force=false){
    document.querySelectorAll('.bridge-target,.bridge-pulse').forEach(el=>{el.classList.remove('bridge-target','bridge-pulse');if(el.getAttribute('aria-describedby')==='bridge-instruction')el.removeAttribute('aria-describedby');});
    const live=$('bridge-status');if(!bridge||screen!=='work'){if(live)live.textContent='';return;}
    const meta=selected().bridge,step=bridgeStep();
    if(live){const announcement=`実務演習 ${bridge.index+1}。${bridgeStageLabels[meta.stage]}。${meta.stage==='guided'&&step?step.title+'。'+(B.stepComplete(step,bridge,session)?'作業を確認しました。':''):''}`;if(live.textContent!==announcement)live.textContent=announcement;}
    if(meta.stage!=='guided'||!step||record().status==='resolved')return;
    const firstBlank=step.kind==='draft'?step.fields.find(field=>!record().draft[field].trim()):null;
    let target=step.tab&&step.tab!==ui.tab?document.querySelector(`[data-tab="${step.tab}"]`):document.querySelector(firstBlank?'#draft-'+firstBlank:step.target);
    const done=B.stepComplete(step,bridge,session);
    const action=$('dialog').open?$('dialog').querySelector('.modal-actions .primary'):done?document.querySelector('[data-action="bridge-next"]'):target;
    if(target&&!$('dialog').open){target.classList.add('bridge-target');target.setAttribute('aria-describedby','bridge-instruction');}
    if(action&&!action.disabled&&action.matches('button,input,textarea,select,summary'))action.classList.add('bridge-pulse');
    if(force&&target){target.scrollIntoView?.({block:'center',inline:'nearest',behavior:'instant'});if(!target.matches('button,input,textarea,select,summary'))target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  function refreshBridge(){
    if(!bridge||screen!=='work')return;
    B.normalize(bridge,session);const guide=$('bridge-guide');if(guide)guide.outerHTML=renderBridgeGuide();highlightBridge();
  }
  function bridgeNext(){const step=bridgeStep();if(!step||!B.stepComplete(step,bridge,session))return;bridge.guide.step=Math.min(bridge.guide.step+1,selected().bridge.steps.length-1);prepareBridgeStep();save(true);render();$('bridge-title')?.focus({preventScroll:true});}
  function bridgeBack(){if(!bridge||bridge.guide.step===0)return;bridge.guide.step--;prepareBridgeStep();save(true);render();$('bridge-title')?.focus({preventScroll:true});}
  function bridgeLocate(){const step=bridgeStep();if(step?.tab){ui.tab=step.tab;if(step.tab==='logs'){ui.query='';ui.source='';ui.host='';}}prepareBridgeStep();render();highlightBridge(true);}
  function showBridgeReview(){
    if(!bridge||session.phase!=='completed')return;
    const c=selected(),r=record(),a=c.answer;
    modal('実務演習の振り返り',`<span class="badge good">実務演習 ${bridge.index+1} / 5 完了</span><h3>${esc(c.title)}</h3><p>${esc(a.explanation)}</p><div class="bridge-comparison"><section><h3>あなたの報告</h3><p class="report-text">${esc(r.draft.summary)}</p><h3>あなたの引き継ぎ</h3><p class="report-text">${esc(r.draft.nextStep)}</p><p class="small">登録した根拠：${r.evidenceIds.map(esc).join('、')}</p></section><section><h3>報告の例</h3><p class="report-text">${esc(a.summary)}</p><h3>引き継ぎの例</h3><p class="report-text">${esc(a.nextStep)}</p><p class="small">根拠の組み合わせ：${a.evidenceGroups.map(group=>group.map(esc).join(' または ')).join(' ＋ ')}</p></section></div><h3>報告を見直す観点</h3><ul><li>確認した事実と、それを裏付ける証拠が結び付いているか。</li><li>確認できていない範囲を、断定して書いていないか。</li><li>次の担当者が、何を確認・対応するか分かるか。</li></ul><h3>自分の報告を3つに分ける（任意）</h3>${[['facts','事実：どの証拠で分かったか'],['limits','限界：まだ分からないこと'],['next','次の対応：誰に何を依頼するか']].map(([key,label])=>`<label class="field">${label}<textarea data-reflection="${key}" maxlength="1400">${esc(bridge.reflections?.[c.id]?.[key]||'')}</textarea></label>`).join('')}${a.lessons.map(lesson=>`<p class="hint">${esc(lesson)}</p>`).join('')}<p class="notice">文章の意味や品質は自動採点していません。上の観点で自分の報告と報告例を比較してください。</p><label class="bridge-reflection"><input type="checkbox" id="bridge-reflected"> 自分の報告と報告例を比較し、改善する点を確認した</label>`,`<button class="btn" data-action="report">自分の報告を保存</button><button class="btn ghost" data-action="bridge-exit">勤務選択へ</button><button class="btn primary" data-action="bridge-review-next" disabled>${bridge.index===4?'5件を終えて通常勤務へ':'次の実務演習へ →'}</button>`);
  }
  function bridgeReviewNext(){
    if(!$('bridge-reflected')?.checked||!bridge||session.phase!=='completed')return;
    closeModal(false);
    if(!B.advance(bridge)){exitBridge();home={scenarioId:'low',difficulty:'low',individual:''};render();notify('5件の実務演習が完了しました。次は難易度「低」で調査をつなげてみましょう。');return;}
    session=B.resumeArchived(bridge)||E.createSession('bridge','low',B.currentCase(bridge).id);if(session.phase==='paused')E.resume(session);terminal=null;const archivedWorkspace=bridge.reviewWorkspaces?.[session.selectedCaseId];if(archivedWorkspace){terminal=globalThis.SocTerminal.create({});terminal.setWorkspace(archivedWorkspace);delete bridge.reviewWorkspaces[session.selectedCaseId];}ui=freshUI();screen='work';prepareBridgeStep();syncTerminal();lastTick=performance.now();lastSave=0;save(true);render();checkOutcome();
  }
  function topbar(inSession=false){return `<header class="topbar"><a href="#" class="brand" data-action="home"><span class="brand-symbol">s_</span><span>SOC<em>room</em></span><small>ANALYST WORKSPACE</small></a><div class="top-actions"><span class="local"><i class="dot"></i>LOCAL ONLY</span>${inSession?`<button class="btn ghost compact" data-action="export">${icon('save')}保存</button>`:''}<button class="btn ghost compact" data-action="import">${icon('upload')}読込</button><button class="btn ghost compact" data-action="guide">${icon('help')}ガイド</button></div></header>`;}
  function renderHome(){
    const packs=D.scenarios.filter(s=>!s.hidden),sc=packs.find(s=>s.id===home.scenarioId)||packs[0];
    const descriptions={low:'端末1台の記録から、事実と対応を結び付ける。時間を気にせず基礎を練習します。',medium:'認証・通信・業務記録を照合し、紛らわしい出来事を見分ける。5件を並行して担当します。',high:'複数端末への広がりや、欠けた記録を評価する。影響範囲と対応の優先順位を判断します。'};
    const timing={low:'制限なし · 1件ずつ到着',medium:'各20分 · 5件同時に到着',high:'各15分 · 45秒ごとに到着'};
    $('app').innerHTML=topbar()+`<main class="home" id="content"><div class="home-intro"><div><div class="eyebrow accent">OFFLINE SOC SIMULATOR / LOCAL EDITION 0.5.1</div><h1>ログをつなぐ。<br>判断を、次の対応へ。</h1><p>あなたはSOCの一次対応アナリスト。アラートを調べ、証拠を集め、<br class="desktop">根拠から次の対応を判断する。難易度ごとに異なる5問で、調査力を磨こう。</p></div><div class="signal-visual" aria-hidden="true"><div class="signal-ring"></div><div class="signal-label">SOC</div><span class="signal-foot">OBSERVE / INVESTIGATE / RESPOND</span></div></div>
      ${session?`<div class="saved-strip spread"><div><strong>前回の勤務を再開できます</strong><p class="small muted">${esc(D.scenarios.find(s=>s.id===session.scenarioId)?.title)} · 難易度 ${labels[session.difficulty]} · ${fmt(session.elapsed)} 経過 · ${caseIds().filter(id=>session.records[id].status==='resolved').length}/${caseIds().length}件対応済み</p></div><button class="btn" data-action="continue">勤務に戻る ${icon('arrow')}</button></div>`:''}
      ${Object.keys(legacySaves).length?`<div class="legacy-progress"><div><strong>前の版の進捗が残っています</strong><p>新しい問題とは別に保持しています。保存ファイルを取り出し、旧版HTML（socroom-v0.2.html）で読み込めます。</p></div><div>${legacySaves.normal?'<button class="btn compact" data-action="legacy-normal">旧版の勤務を保存</button>':''}${legacySaves.tutorial?'<button class="btn compact" data-action="legacy-tutorial">旧版チュートリアルを保存</button>':''}</div></div>`:''}
      <section class="tutorial-entry"><div><span class="eyebrow accent">FIRST INVESTIGATION / 専用の練習問題 1問</span><h2>まずは、案内に沿って1件やってみる。</h2><p>押す場所・操作の意味・次の手順を、画面で一つずつ案内します。<br>通常勤務には出ない専用問題。時間制限なしで練習できます。</p></div><div class="tutorial-entry-actions"><button class="btn primary" data-action="tutorial-start">${icon('play')}操作チュートリアルを始める</button>${tutorialSaved?'<button class="btn" data-action="tutorial-resume">チュートリアルの続きから</button><span class="small muted">「始める」は最初から練習できます。</span>':''}</div></section>
      ${renderBridgeEntry()}
      <div class="section-line"><h2><span class="accent mono">01</span>　難易度と問題セット</h2><span class="eyebrow">5 CASES × 3 LEVELS / 15 DISTINCT CASES</span></div>
      <div class="scenario-grid">${packs.map(pack=>`<button class="scenario-card ${pack.id===sc.id?'selected':''}" data-difficulty="${pack.difficulty}" aria-pressed="${pack.id===sc.id}"><span class="number">${pack.difficulty.toUpperCase()} / 5 CASES</span>${pack.id===sc.id?`<span class="check">${icon('check')}</span>`:''}<h3>難易度 ${labels[pack.difficulty]} / ${esc(pack.title)}</h3><p>${esc(descriptions[pack.difficulty])}</p><span class="pack-timing">${esc(timing[pack.difficulty])}</span></button>`).join('')}</div>
      <div class="setup"><section><h2><span class="accent mono">02</span>　この難易度の5問</h2><ol class="case-preview">${sc.caseIds.map((id,index)=>{const c=E.getCase(id);return `<li data-preview-case="${esc(id)}"><span class="case-number mono">${String(index+1).padStart(2,'0')}</span><div><strong>${esc(c.title)}</strong><p>${esc(c.subtitle)}</p><span>${esc(c.source)}${c.relatedHosts?.length?' · 複数端末を調査':''}</span></div></li>`;}).join('')}</ol><label class="field">演習の範囲<select id="home-scope"><option value="">一勤務を体験する（5問）</option>${sc.caseIds.map(id=>`<option value="${esc(id)}" ${home.individual===id?'selected':''}>ケース練習：${esc(E.getCase(id).title)}</option>`).join('')}</select></label></section><section><h2><span class="accent mono">03</span>　シフトの引き継ぎ</h2><div class="briefing-box">${sc.briefing.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="pack-note"><strong>難易度を変えると、別の問題になります。</strong><p>端末・ログ・背景・判断の根拠が異なります。チュートリアルの問題も、この15問には含みません。</p><p>${esc(timing[sc.difficulty])}。途中保存・一時停止ができます。</p></div></section></div>
      <div class="launchbar"><div><strong>調査 → 証拠登録 → 判断・対応 → 引き継ぎ</strong><p class="small muted">${home.individual?'選んだ1問を練習します。':'この難易度の5問を担当します。'}すべて合成データ、対応操作はシミュレーションです。</p></div><button class="btn primary" data-action="start">${home.individual?'この1問を開始':'5問のシフトを開始'} ${icon('arrow')}</button></div><footer class="home-footer"><span>ブラウザだけで動作。操作1問 ＋ ガイド付き実務演習5問 ＋ 通常勤務15問。</span><span>Inspired by Logroom · MIT License · v0.5.1</span></footer></main>`;
  }
  function renderQueue(){const active=E.activeCases(session),resolved=caseIds().filter(id=>session.records[id].status==='resolved').length;return `<aside class="queue" aria-label="アラート一覧"><div class="queue-heading"><div class="spread"><h2>アラートキュー</h2><span class="badge">${active.filter(c=>session.records[c.id].status!=='resolved').length} 未完了</span></div><p>機械の重要度と、業務上の優先度を見極める。</p></div><div class="queue-list">${active.map(c=>{const r=session.records[c.id],left=remaining(c.id),waiting=E.getContactQuestions(c.id).some(q=>r.contactRequests?.[q.id]!=null&&!E.replyAvailable(session,c.id,q.id));return `<button class="alert-card ${c.id===session.selectedCaseId?'active':''}" data-case="${esc(c.id)}" aria-current="${c.id===session.selectedCaseId}"><div class="spread"><span class="badge ${c.severity}">検知：${labels[c.severity]}</span><span class="case-state">${r.status==='resolved'?'✓ 対応済み':waiting?'回答待ち':r.status==='investigating'?'調査中':'未着手'}</span></div><h3>${esc(c.title)}</h3><div class="host">${esc(c.host)} / ${esc(c.user)}</div><div class="deadline ${left!==null&&left<120?'urgent':''}" data-deadline="${esc(c.id)}">${r.status==='resolved'?'対応を記録済み':left===null?'制限時間なし':`初動期限まで ${fmt(left)}`}</div></button>`;}).join('')}</div><div class="queue-footer"><div class="spread"><span>勤務の進捗</span><span class="mono">${resolved} / ${caseIds().length}</span></div><div class="progress-track"><span style="width:${resolved/caseIds().length*100}%"></span></div><p>${session.difficulty==='low'&&!session.individualCaseId?'対応が完了すると、次の案件が届きます。':'関連する更新は、勤務の進行に合わせて届きます。'}</p><button class="btn ghost compact" style="margin-top:12px;width:100%" data-action="step">${icon('clock')}次の更新へ進む</button><p class="small" style="margin-top:5px">進めた時間も期限に含まれます。</p></div></aside>`;}
  function renderAnalysis(){const c=selected(),r=record();if(!c)return '<section class="analysis"><div class="empty">新しいアラートを待っています。</div></section>';return `<section class="analysis" aria-label="調査ワークスペース"><div class="case-heading"><div class="spread"><span class="eyebrow">INVESTIGATION / ${esc(c.id.toUpperCase())}</span><span class="badge ${r.status==='resolved'?'good':c.severity}">${r.status==='resolved'?'対応記録済み':c.source}</span></div><h2>${esc(c.title)}</h2><p>${esc(c.subtitle)}</p><div class="case-meta" style="margin-top:10px"><span>HOST <code>${esc(c.host)}</code></span><span>USER <code>${esc(c.user)}</code></span>${c.relatedHosts?.length?`<span>関連端末 <code>${c.relatedHosts.map(esc).join(' / ')}</code></span>`:''}<span>UTC / 合成データ</span></div><div class="case-toolbar"><button class="btn compact" data-action="context">${icon('folder')}依頼・状況</button>${session.difficulty!=='high'?`<button class="btn ghost compact" data-action="hint">${icon('help')}調査のヒント</button>`:''}<button class="btn ghost compact" data-action="filter-host">${icon('search')}${c.targetType&&c.targetType!=='host'?(c.user?'このユーザーを検索':'ログを表示'):'この端末を検索'}</button></div></div><nav class="tabs" role="tablist" aria-label="調査ツール">${[['logs','logs','ログ検索'],['resources','folder','資産・資料'],['timeline','clock','時系列'],['terminal','terminal','端末'],['contact','message','照会']].map(([id,ic,label])=>`<button class="tab ${ui.tab===id?'active':''}" role="tab" aria-selected="${ui.tab===id}" aria-controls="investigation-view" data-tab="${id}">${icon(ic)}${label}${id==='contact'&&E.availableReplies(session,c.id).length?'<span class="dot"></span>':''}</button>`).join('')}</nav><div class="view" id="investigation-view" role="tabpanel" aria-label="${{logs:'ログ検索',resources:'資産・資料',timeline:'時系列',terminal:'端末',contact:'照会'}[ui.tab]}">${renderView()}</div></section>`;}
  function renderView(){if(ui.tab==='logs')return renderLogs();if(ui.tab==='resources')return renderResources();if(ui.tab==='timeline')return renderTimeline();if(ui.tab==='terminal')return renderTerminal();return renderContact();}
  function filterLogs(logs){
    const q=ui.query.toLowerCase().trim(),from=ui.from?.length===5?ui.from+':00':ui.from,to=ui.to?.length===5?ui.to+':59':ui.to;
    return logs.filter(l=>(!ui.source||l.source===ui.source)&&(!ui.host||l.host===ui.host)&&(!from||l.time>=from)&&(!to||l.time<=to)&&(!ui.evidenceOnly||record().evidenceIds.includes(l.id))&&(!q||[l.raw,l.event,l.id,l.host,l.user,l.ip,l.source].join(' ').toLowerCase().includes(q)));
  }
  function logFilters(logs){
    const sources=[...new Set(logs.map(l=>l.source))].sort(),hosts=[...new Set(logs.map(l=>l.host).filter(Boolean))].sort();
    return `<div class="searchbar">${icon('search')}<input id="log-search" type="search" aria-label="ログを検索" placeholder="IP、ユーザー、イベント、文字列で検索" value="${esc(ui.query)}"><kbd>/</kbd></div><div class="filters"><select id="source-filter" aria-label="ログソース"><option value="">すべてのソース</option>${sources.map(x=>`<option ${x===ui.source?'selected':''}>${esc(x)}</option>`).join('')}</select><select id="host-filter" aria-label="端末で絞り込み"><option value="">すべての端末</option>${hosts.map(x=>`<option ${x===ui.host?'selected':''}>${esc(x)}</option>`).join('')}</select><label>開始 <input type="time" step="1" id="time-from" aria-label="開始時刻 UTC" value="${esc(ui.from||'')}"></label><label>終了 <input type="time" step="1" id="time-to" aria-label="終了時刻 UTC" value="${esc(ui.to||'')}"></label><label><input type="checkbox" id="evidence-only" ${ui.evidenceOnly?'checked':''}> 登録した証拠のみ</label><button class="btn ghost compact" data-action="clear-filter">解除</button></div>`;
  }
  function renderLogs(){const logs=E.visibleLogs(session).slice().sort((a,b)=>b.time.localeCompare(a.time)),filtered=filterLogs(logs),count=ui.logLimit||100;return `${logFilters(logs)}<p class="result-count">${filtered.length} / ${logs.length} EVENTS · UTC</p><div class="log-list">${filtered.length?filtered.slice(0,count).map(logRow).join(''):'<div class="empty">一致するイベントがありません。検索語・時刻・絞り込みを見直してください。</div>'}</div>${filtered.length>count?'<button class="btn" data-action="more-logs">さらに100件を表示</button>':''}`;}
  function logRow(l){const added=record().evidenceIds.includes(l.id);return `<article class="log-row"><div class="log-head"><time class="stamp">${esc(l.time)}</time><span class="source">${esc(l.source)}</span><span class="mono">${esc(l.host)}</span><button class="evidence-btn" data-evidence="${esc(l.id)}" ${added||!running()||record().status==='resolved'?'disabled':''}>${icon(added?'check':'plus')}${added?'登録済み':'証拠に追加'}</button></div><p class="log-title">${esc(l.event)}</p><div class="log-head" style="margin-top:4px">${l.user?`<button class="pivot" data-query="${esc(l.user)}">${esc(l.user)}</button>`:''}${l.ip?`<button class="pivot" data-query="${esc(l.ip)}">${esc(l.ip)}</button>`:''}<span>${esc(l.id)}</span></div><details data-log-details="${esc(l.id)}" ${(ui.openLogs||[]).includes(l.id)||tutorial?.openLogs.includes(l.id)?'open':''}><summary>生ログを表示</summary><pre class="raw">${esc(l.raw)}</pre><p class="small muted">${esc(l.path)} · ${esc(l.format||"教材用合成ログ")}</p></details></article>`;}
  function evidenceButton(id){const added=record().evidenceIds.includes(id);return `<button class="btn ghost compact" data-evidence="${esc(id)}" ${added||!running()||record().status==='resolved'?'disabled':''}>${icon(added?'check':'plus')}${added?'証拠に登録済み':'証拠に追加'}</button>`;}
  function renderResources(){const c=selected();return `<div class="eyebrow" style="margin-bottom:12px">REFERENCE / 調査資料</div>${c.documents.map(d=>`<article class="resource"><div class="meta">${esc(d.kind)} · ${esc(d.id)}</div><h3>${esc(d.title)}</h3><div class="body">${esc(d.body)}</div>${evidenceButton(d.id)}</article>`).join('')}<h3 style="font-size:13px;margin-top:24px">資産台帳</h3><table class="asset-table"><thead><tr><th>資産 / 担当者</th><th>業務上の役割</th></tr></thead><tbody>${sessionAssets().map(a=>`<tr><td><code>${esc(a.name)}</code><p>${esc(a.owner)}<br>重要度：${esc(labels[a.importance]||a.importance)}</p></td><td>${esc(a.description)}</td></tr>`).join('')}</tbody></table>`;}
  function renderTimeline(){const c=selected(),logs=E.visibleLogs(session,c.id).slice().sort((a,b)=>a.time.localeCompare(b.time)),filtered=filterLogs(logs),count=ui.logLimit||100;return `<p class="small muted">${esc(c.title)} の発生時刻順（UTC）。検索・時刻範囲・登録済み証拠で絞れます。</p>${logFilters(logs)}<p class="result-count">${filtered.length} / ${logs.length} EVENTS</p>${filtered.slice(0,count).map(l=>`<article class="timeline-item"><time>${esc(l.time)} / ${esc(l.source)} / ${esc(l.host)}</time><p>${esc(l.event)}</p><div class="small muted mono">${esc(l.id)}</div>${evidenceButton(l.id)}</article>`).join('')}${filtered.length>count?'<button class="btn" data-action="more-logs">さらに100件を表示</button>':''}`;}
  function renderTerminal(){return `<div class="eyebrow" style="margin-bottom:12px">analyst@socroom / 仮想調査端末</div><div class="terminal-output" id="terminal-output" role="log" aria-label="端末の実行結果">${esc('SOCroom virtual shell — ログは参照専用です。\nls -R /var/log でファイルを確認できます。\n\n'+ui.terminalEntries.join('\n'))}</div><form class="terminal-form" id="terminal-form"><span class="accent mono">$</span><input id="terminal-input" aria-label="コマンド" spellcheck="false" autocomplete="off" value="${esc(ui.command)}" placeholder="コマンドを入力"><button class="btn compact" ${!running()?'disabled':''}>実行</button></form><div class="terminal-help">コマンドはブラウザ内の仮想ファイルだけを操作します。編集・出力先は <code>/home/analyst</code>。<br>GUIと同じ公開済みログです。<code>grep -n</code> で行番号を調べ、<code>evidence /path/to/log:12</code> で主証拠に登録できます。</div><div>${['ls -R /var/log','cat /reference/README.txt','help grep','help awk','help evidence'].map(c=>`<button class="command-chip" data-command="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;}
  function renderContact(){
    const c=selected(),r=record(),questions=E.getContactQuestions(c.id);
    return `<div class="contact-person"><div class="avatar">${esc(c.contact.name.slice(0,1))}</div><div><strong>${esc(c.contact.name)}</strong><p class="small muted">${esc(c.contact.role)} / 演習内の担当者</p></div></div><p>${questions.length>1?'何を確認するか選んでください。回答が十分でなければ、別の質問で追加確認できます。':'担当者に確認します。'}</p>${questions.map((q,i)=>{const requested=r.contactRequests?.[q.id]??null,ready=E.replyAvailable(session,c.id,q.id),delay=Math.ceil(q.delaySeconds*E.DIFFICULTIES[session.difficulty].replyMultiplier),wait=Math.max(0,Math.ceil((requested??session.elapsed)+delay-session.elapsed));return `<article class="resource"><h3>照会 ${i+1}</h3><div class="message">${esc(q.question)}</div>${requested===null?`<button class="btn primary" data-action="contact" data-question="${esc(q.id)}" ${!running()||r.status==='resolved'?'disabled':''}>${icon('message')}確認を依頼する</button><p class="small muted">${delay?'返信まで約'+fmt(delay):'すぐに返信が届きます。'}</p>`:ready?`<span class="badge good">返信を受信</span><div class="message reply">${esc(q.replyText)}</div>${evidenceButton(q.replyId)}`:`<div class="notice">返信待ち <span data-reply-countdown="${esc(q.id)}">${fmt(wait)}</span></div><button class="btn" data-action="step">次の更新へ進む</button>`}</article>`;}).join('')}<p class="small muted">依頼・返信は同梱シナリオによる模擬連絡です。待機時間も対応期限に含まれます。</p>`;
  }
  function options(values,current,placeholder){return `<option value="">${placeholder}</option>`+values.map(id=>`<option value="${esc(id)}" ${id===current?'selected':''}>${esc(labels[id]||id)}</option>`).join('');}
  function renderCasepanel(){const c=selected(),r=record();if(!c)return '';const disabled=!running()||r.status==='resolved';return `<aside class="casepanel" aria-label="対応記録"><div class="spread"><h2 class="panel-title">対応記録</h2><span class="eyebrow">CASE NOTE</span></div><p class="panel-subtitle">証拠から判断を組み立て、次の担当者へ。</p>${r.assessment?renderAssessment(r.assessment):''}<div class="evidence-tray"><h3>登録した証拠 <span class="mono">${r.evidenceIds.length} / ${E.evidenceLimit(c.id)}</span></h3><p class="small muted">提出する主証拠は最大${E.evidenceLimit(c.id)}件。判断に必要な根拠に絞り、補足は本文に記録します。</p>${r.evidenceIds.length?r.evidenceIds.map(id=>{const e=evidence(id);return `<div class="evidence-item"><span>${esc(e.title)}<small>${esc(id)} · ${esc(e.detail)}</small></span><button class="icon-btn" aria-label="証拠 ${esc(id)} を外す" data-remove-evidence="${esc(id)}" ${disabled?'disabled':''}>${icon('close')}</button></div>`;}).join(''):'<p class="small muted">ログ・資料・担当者の回答から、判断に必要な根拠を追加します。</p>'}</div><form id="case-form"><label class="field">判定<select data-draft="verdict" id="draft-verdict" ${disabled?'disabled':''}>${options(['incident','benign','unknown'],r.draft.verdict,'判定を選択')}</select></label><div class="field-grid"><label class="field">対応優先度<select data-draft="priority" id="draft-priority" ${disabled?'disabled':''}>${options(['high','medium','low'],r.draft.priority,'優先度')}</select></label><label class="field">${tutorial?'対象端末':'主な対象（端末・アカウント・アプリ）'}<select data-draft="target" id="draft-target" ${disabled?'disabled':''}><option value="">対象を選択</option>${[...new Map(caseIds().flatMap(id=>{const item=E.getCase(id);return item.targets||[{value:item.host,label:item.host}];}).map(x=>[x.value,x])).values()].map(x=>`<option value="${esc(x.value)}" ${x.value===r.draft.target?'selected':''}>${esc(x.label)}</option>`).join('')}</select>${c.relatedHosts?.length?'<small>関連端末への影響は、下の報告文に記録します。</small>':''}</label></div><label class="field">次の対応<select data-draft="action" id="draft-action" ${disabled?'disabled':''}>${options(['escalate','contain','close','monitor'],r.draft.action,'対応を選択')}</select></label><label class="field">確認した事実・判断の理由<textarea id="draft-summary" data-draft="summary" maxlength="1400" ${disabled?'disabled':''} placeholder="何が起きたか。どの証拠から、どこまで分かるか。">${esc(r.draft.summary)}</textarea></label><label class="field">未確認事項・引き継ぎ<textarea id="draft-nextStep" data-draft="nextStep" maxlength="1000" ${disabled?'disabled':''} placeholder="次に確認すること、依頼先、必要な対応。">${esc(r.draft.nextStep)}</textarea><small>報告に対象・時刻・証拠IDなどの具体情報、引き継ぎに依頼先（担当・責任者など）を含めてください。文章の意味・品質は自動採点しません。</small></label><button type="submit" class="btn primary submit" ${disabled||(tutorial&&tutorialStep().id!=='submit')?'disabled':''}>${icon('check')}${r.status==='resolved'?'対応を記録済み':'判断と対応を記録する'}</button></form><p class="small muted" style="margin-top:10px">根拠と判断の組み合わせを確認します。必要な初動が揃うと、対応完了になります。</p></aside>`;}
  function renderAssessment(a){return `<div class="assessment"><h3 class="${a.passed?'accent':''}">${a.passed?'✓ 対応を記録しました':'記録前に確認してください'}</h3>${a.checks.map(c=>`<div class="check-row"><span class="${c.passed?'pass':'fail'}">${c.passed?'✓':'○'}</span><span>${esc(c.label)}${!c.passed?`<br><span class="muted">${esc(c.detail)}</span>`:''}</span></div>`).join('')}</div>`;}
  function renderWorkbench(){const sc=scenario(),isRunning=running();$('app').innerHTML=`<div class="workbench ${tutorial?'tutorial-active':bridge?'bridge-active':''}">${topbar(true)}<div class="shiftbar"><div><div class="eyebrow">${esc(D.company.name)} / ${bridge?'GUIDED PRACTICE / '+(bridge.index+1)+' OF 5':tutorial?'GUIDED FIRST INVESTIGATION':session.individualCaseId?'CASE PRACTICE':'ON DUTY'}</div><h1>${esc(sc.title)} <span class="badge ${session.difficulty}">${bridge?'時間制限なし':'難易度 '+labels[session.difficulty]}</span>${session.trainingAfterFailure?' <span class="badge">復習・時間制限なし</span>':''}</h1></div><div class="clock-group"><div class="status-running ${!isRunning?'status-paused':''}"><i class="dot"></i>${isRunning?'ON SHIFT':session.phase==='paused'?'PAUSED':session.phase==='completed'?'COMPLETED':'TIME EXPIRED'}</div><div><div class="clock-note">勤務経過 / ACTIVE TIME</div><div class="clock" id="shift-clock">${fmt(session.elapsed)}</div></div><button class="btn compact" data-action="pause">${icon(isRunning?'pause':'play')}${isRunning?'一時停止':session.phase==='paused'?'再開':'結果'}</button></div></div>${session.migration?.untimedReview?'<p class="notice" role="status">旧版の進捗を新しい教材・採点で再確認しました。保存済みの根拠と下書きを引き継ぎ、時間制限なしで見直せます。</p>':''}${tutorial?renderTutorialGuide():bridge?renderBridgeGuide():''}<main id="content" class="workspace">${renderQueue()}${renderAnalysis()}${renderCasepanel()}</main><footer class="bottombar"><span id="save-status">${storageOK?'このブラウザに保存済み':'自動保存不可 · 保存ファイルを書き出してください'}</span><span>UTC LOGS · SIMULATED RESPONSE · ZERO EXTERNAL REQUESTS</span></footer></div>`;}
  function render(){
    if(composing){pendingRender=true;return;}pendingRender=false;
    const active=document.activeElement,withinApp=$('app').contains(active),focused=active?.id;
    const selection=focused&&withinApp?[active.selectionStart,active.selectionEnd]:null;
    const focusAttribute=withinApp?['data-action','data-case','data-tab','data-evidence','data-remove-evidence','data-query','data-command'].find(name=>active.hasAttribute(name)):null;
    const focusValue=focusAttribute?active.getAttribute(focusAttribute):null;
    const focusedLog=withinApp&&active.matches('summary')?active.parentElement.dataset.logDetails:null;
    if(renderedUI===ui){
      const openLogs=new Set(ui.openLogs||[]);
      document.querySelectorAll('#app details[data-log-details]').forEach(el=>{if(el.open)openLogs.add(el.dataset.logDetails);else openLogs.delete(el.dataset.logDetails);});
      ui.openLogs=[...openLogs];
    }
    const scrolls={};for(const cls of ['view','queue','casepanel','terminal-output']){const el=document.querySelector('.'+cls);if(el)scrolls[cls]=el.scrollTop;}
    if(tutorial){const before=tutorial.step;T.normalize(tutorial,session);if(before!==tutorial.step){prepareTutorialStep();save();}}
    if(bridge)B.normalize(bridge,session);
    screen==='home'?renderHome():renderWorkbench();
    renderedUI=ui;
    for(const [cls,top] of Object.entries(scrolls)){const el=document.querySelector('.'+cls);if(el)el.scrollTop=top;}
    let focus=focused?$(focused):null;
    if(!focus&&focusAttribute)focus=Array.from($('app').querySelectorAll(`[${focusAttribute}]`)).find(el=>el.getAttribute(focusAttribute)===focusValue);
    if(!focus&&focusedLog)focus=Array.from($('app').querySelectorAll('details[data-log-details]')).find(el=>el.dataset.logDetails===focusedLog)?.querySelector('summary');
    if(focus?.disabled&&tutorialComplete())focus=document.querySelector('[data-action="tutorial-next"]')||document.querySelector('[data-action="tutorial-exit"]');
    if(focus?.disabled&&focusAttribute==='data-evidence'){
      const row=focus.closest('article');focus=row?.querySelector('summary')||row;
      if(focus&&!focus.matches('summary'))focus.tabIndex=-1;
    }
    if(focus&&!focus.disabled){focus.focus({preventScroll:true});if(selection&&typeof focus.setSelectionRange==='function')try{focus.setSelectionRange(...selection);}catch(error){}}
    highlightTutorial();highlightBridge();
  }
  function modal(title,body,actions='',autoResume=false){resumeAfterModal=autoResume&&running();if(running()){E.pause(session);save();render();}if($('dialog').open)$('dialog').close();$('dialog').innerHTML=`<div class="modal-head"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-btn" data-action="close-dialog" aria-label="閉じる">${icon('close')}</button></div><div class="modal-body">${body}</div><div class="modal-actions">${actions||'<button class="btn primary" data-action="close-dialog">調査に戻る</button>'}</div>`;$('dialog').showModal();lastTick=performance.now();highlightTutorial();highlightBridge();}
  function closeModal(resume=true){
    const should=resume&&resumeAfterModal,contextRead=tutorialContextOpen&&resume,bridgeRead=bridgeContextOpen&&resume;resumeAfterModal=false;
    if($('dialog').open)$('dialog').close();if(should&&session?.phase==='paused')E.resume(session);
    if(contextRead)tutorialMark('context');tutorialContextOpen=false;if(bridgeRead)bridgeMark('context');bridgeContextOpen=false;
    lastTick=performance.now();save();render();
    if(contextRead&&tutorialComplete())document.querySelector('[data-action="tutorial-next"]')?.focus({preventScroll:true});
  }
  function showPause(){if(!session)return;if(running())E.pause(session);modal('勤務を一時停止',`<p>経過時間と対応期限は止まっています。離席中・別タブ表示中・保存後に閉じている時間は計測しません。</p><p>勤務経過 <strong class="mono accent">${fmt(session.elapsed)}</strong></p>`,`<button class="btn" data-action="export">${icon('save')}進捗を保存</button><button class="btn ghost" data-action="home">勤務選択へ</button><button class="btn primary" data-action="resume">勤務を再開 ${icon('play')}</button>`);}
  function showGuide(){modal('SOCroom の進め方',`<p>アラートは調査の入り口です。検知の重要度を参考に、端末の役割・ログ・予定された作業を照合して判断します。</p><h3>1. 根拠を集める</h3><p>「ログ検索」「資産・資料」「照会」から証拠を追加します。IPやユーザー名をクリックすると、同じ値を検索できます。必要なら「端末」で grep や awk を使えます。</p><h3>2. 対応を記録する</h3><p>判定・優先度・対象・対応を選び、事実と未確認事項を記録します。「判断できない」場合も、適切な根拠と引き継ぎがあれば完了できます。報告に対象・時刻・証拠ID、引き継ぎに依頼先があるかを確認します。内容の意味は自動採点しません。</p><h3>3. 操作の次は、ガイド付き実務演習</h3><p>専用の5件で調査の進め方を練習できます。最初の2件は次の行動と理由、次の2件はチェックリスト、最後の1件は目標だけを示します。全件時間制限なしで、通常勤務とは別に保存します。各件の最後に、自分の報告と報告例を比べてから次へ進みます。</p><h3>4. 時間と難易度</h3><p>低・中・高はそれぞれ異なる5問です。低は基本的な証拠の照合、中は複数ログと業務確認、高は複数端末や欠けた情報の評価が必要です。低は制限なしで1件ずつ、中は5件同時で各20分、高は45秒間隔で追加され各15分です。重要な案件の初動期限超過でゲームオーバーになります。正当な操作の案件が遅れた場合は、終了時に遅延として表示します。これらは教材用の時間設定です。</p><p>「次の更新へ進む」は返信や到着を待つ時間を進めます。進めた時間も期限に含まれます。勤務の経過時間と、ログに記された発生時刻（UTC）は別です。</p><h3>保存とローカル動作</h3><p>外部通信はありません。自動保存はブラウザに依存するため、大切な進捗は「保存」からJSONファイルに書き出してください。「読込」で別のブラウザにも移せます。ゲームオーバー後は再挑戦か時間制限なしの復習ができます。</p><h3>出典・ライセンス</h3><p>仮想シェルは Logroom（Copyright © 2026 Logroom contributors, MIT License）を基にしています。ライセンス全文は配布HTMLのソースと開発用ファイルに同梱しています。ログ・人物・組織・担当者への連絡は教材用の架空データです。</p>`,`${!tutorial&&!bridge?'<button class="btn" data-action="tutorial-start">操作チュートリアルを始める</button>':''}<button class="btn primary" data-action="close-dialog">調査に戻る</button>`,true);}
  function showDebrief(){const completed=session.phase==='completed',resolved=caseIds().filter(id=>session.records[id].status==='resolved').length;const late=caseIds().filter(id=>{const r=session.records[id];return limit()!==null&&r.resolvedAt!==null&&r.resolvedAt>r.arrival+limit();}).length;const score=Math.round(caseIds().reduce((n,id)=>n+(session.records[id].assessment?.score||0),0)/caseIds().length);modal(completed?'勤務完了 / SHIFT COMPLETE':'対応期限超過 / GAME OVER',`<div class="eyebrow ${completed?'accent':''}">${completed?'SHIFT COMPLETE':'TIME EXPIRED'}</div><p class="result-heading">${completed?'勤務、お疲れさまでした。':'初動の期限を超えました。'}</p><div class="spread" style="margin:18px 0"><div class="result-score">${resolved}<span> / ${caseIds().length} 件対応</span></div><div class="mono muted">${fmt(session.elapsed)} 経過</div></div><p>${completed?'記録した根拠と判断を振り返りましょう。':esc(typeof session.failure==='string'?session.failure:(session.failure?.caseId ? E.getCase(session.failure.caseId).title+'：'+session.failure.reason : '重要な案件について、期限までに必要な判断・対応を記録できませんでした。'))}</p>${session.trainingAfterFailure?'<div class="notice">時間制限なしの復習で完了しました。通常の時間内クリアとは区別して記録されます。</div>':''}<p class="small muted">判定項目の達成度 ${score}% · 期限を過ぎた完了案件 ${late}件<br>文章の品質はこの評価に含みません。</p>${caseIds().map(id=>{const c=E.getCase(id),r=session.records[id];return `<article class="result-case"><h3>${esc(c.title)} <span class="badge ${r.status==='resolved'?'good':'medium'}">${r.status==='resolved'?'対応済み':'未完了'}</span></h3><p><strong>${esc(labels[c.answer.verdict])}</strong> · 優先度 ${c.answer.priorities.map(x=>labels[x]).join(' / ')}</p><p>${esc(c.answer.explanation)}</p><h3>確認する根拠</h3><p>${c.answer.evidenceGroups.map(group=>group.map(id=>`${esc(id)}：${esc(evidence(id).title)}`).join(' または ')).join('<br>')}</p><h3>報告の例</h3><p>${esc(c.answer.summary)}</p><p>引き継ぎ：${esc(c.answer.nextStep)}</p>${c.answer.lessons.map(x=>`<p class="hint">${esc(x)}</p>`).join('')}</article>`;}).join('')}`,`<button class="btn" data-action="report">${icon('save')}報告を書き出す</button>${completed?'<button class="btn primary" data-action="home">次の勤務を選ぶ</button>':'<button class="btn" data-action="retry">期限3分前から再挑戦</button><button class="btn primary" data-action="training">時間制限なしで続ける</button>'}`);}
  function checkOutcome(){if(!session||screen!=='work'||tutorial)return;if(bridge){if(session.phase==='completed'&&ui.outcomeShown!=='completed'){B.finish(bridge,session);ui.outcomeShown='completed';save(true);showBridgeReview();}return;}if(['completed','gameover'].includes(session.phase)&&ui.outcomeShown!==session.phase){ui.outcomeShown=session.phase;showDebrief();}}
  function start(){if(session&&session.phase!=='completed'){modal('新しい勤務を開始',`<p>現在の勤務を新しい演習に切り替えます。必要なら、先に進捗ファイルを保存してください。</p>`,`<button class="btn" data-action="export">現在の進捗を保存</button><button class="btn ghost" data-action="close-dialog">戻る</button><button class="btn primary" data-action="start-confirmed">新しい勤務を開始</button>`);return;}startConfirmed();}
  function startConfirmed(){closeModal(false);session=E.createSession(home.scenarioId,home.difficulty,home.individual||null);ui={tab:'logs',query:'',source:'',host:'',command:'',terminalEntries:[],outcomeShown:'',hintLevel:0};terminal=null;screen='work';syncTerminal();lastTick=performance.now();lastSave=0;save(true);render();notify('シフトを開始しました。アラートを選び、調査を進めましょう。');}
  function step(){if(!running())return notify('勤務を再開してから時間を進めてください。');const candidates=[];for(const id of caseIds()){const r=session.records[id],c=E.getCase(id);if(r.arrival===null&&session.difficulty==='high'&&!session.individualCaseId)candidates.push(caseIds().indexOf(id)*45);if(r.arrival!==null&&r.arrival>session.elapsed)candidates.push(r.arrival);for(const q of E.getContactQuestions(id)){const at=r.contactRequests?.[q.id];if(at!=null&&!E.replyAvailable(session,id,q.id))candidates.push(at+q.delaySeconds*E.DIFFICULTIES[session.difficulty].replyMultiplier);}for(const l of c.logs)if(r.arrival!==null&&r.arrival+l.offset>session.elapsed)candidates.push(r.arrival+l.offset);}const next=candidates.length?Math.min(...candidates.filter(x=>x>session.elapsed)):session.elapsed+30;const seconds=Number.isFinite(next)?Math.max(1,next-session.elapsed):30;change(()=>E.advance(session,seconds));notify(`${fmt(seconds)} 進めました。対応期限にも加算されています。`);lastTick=performance.now();}
  function selectCase(id){session.selectedCaseId=id;ui.hintLevel=0;ui.host='';ui.query='';ui.source='';ui.from='';ui.to='';ui.logLimit=100;ui.evidenceOnly=false;if(running()&&record().status==='open')E.markInvestigating(session,id);save();render();}
  const actions={
    start,startConfirmed,'start-confirmed':startConfirmed,
    'legacy-normal':()=>download('socroom-v0.2-progress.json',JSON.stringify(legacySaves.normal,null,2),'application/json'),
    'legacy-tutorial':()=>download('socroom-v0.2-tutorial.json',JSON.stringify(legacySaves.tutorial,null,2),'application/json'),
    'bridge-export-saved':()=>download('socroom-guided-practice.json',JSON.stringify(bridge?savedObject():bridgeSaved,null,2),'application/json'),'bridge-start':()=>startBridge(false),'bridge-resume':()=>startBridge(true),'bridge-restart':restartBridge,'bridge-reset-confirmed':()=>startBridge(false),'bridge-exit':exitBridge,'bridge-next':bridgeNext,'bridge-back':bridgeBack,'bridge-locate':bridgeLocate,'bridge-review':showBridgeReview,'bridge-review-next':bridgeReviewNext,
    'tutorial-start':()=>startTutorial(false),'tutorial-resume':()=>startTutorial(true),'tutorial-next':tutorialNext,'tutorial-back':tutorialBack,'tutorial-locate':tutorialLocate,'tutorial-example':tutorialExample,'tutorial-exit':exitTutorial,
    continue:()=>{screen='work';ui.outcomeShown='';syncTerminal();render();if(session.phase==='paused')showPause();else checkOutcome();},
    home:()=>{if(bridge)return exitBridge();if(tutorial)return exitTutorial();if(running())E.pause(session);closeModal(false);screen='home';save(true);render();},
    guide:showGuide,export:saveFile,import:()=>{$('import-file').value='';$('import-file').click();},report:reportFile,
    'close-dialog':()=>closeModal(true),
    pause:()=>{if(running())showPause();else if(session.phase==='paused')change(()=>E.resume(session));else if(tutorial){tutorial.step=T.STEPS.length-1;prepareTutorialStep();render();}else if(bridge)showBridgeReview();else showDebrief();},
    resume:()=>{closeModal(false);change(()=>E.resume(session));lastTick=performance.now();},
    context:()=>{tutorialContextOpen=Boolean(tutorial);bridgeContextOpen=Boolean(bridge);modal('依頼・状況',`<p>${esc(selected().context)}</p><h3>引き継ぎ情報</h3>${scenario().briefing.map(p=>`<p>${esc(p)}</p>`).join('')}`,'',true);},
    hint:()=>{ui.hintLevel=Math.min(ui.hintLevel+1,selected().hints.length);modal('調査のヒント',selected().hints.slice(0,ui.hintLevel).map((p,i)=>`<p class="hint"><strong>ヒント ${i+1}</strong><br>${esc(p)}</p>`).join(''),`${ui.hintLevel<selected().hints.length?'<button class="btn" data-action="hint-next">次のヒント</button>':''}<button class="btn primary" data-action="close-dialog">調査に戻る</button>`,true);},
    'hint-next':()=>{const was=resumeAfterModal;closeModal(false);if(was&&session.phase==='paused')E.resume(session);actions.hint();},
    'filter-host':()=>{tutorialMark('filter');bridgeMark('logs');ui.tab='logs';ui.host=selected().targetType&&selected().targetType!=='host'?'':selected().host;ui.query=selected().targetType&&selected().targetType!=='host'?selected().user||'':'';ui.source='';ui.logLimit=100;render();},
    'clear-filter':()=>{ui.query='';ui.source='';ui.host='';ui.from='';ui.to='';ui.evidenceOnly=false;ui.logLimit=100;render();},
    'more-logs':()=>{ui.logLimit=(ui.logLimit||100)+100;render();},
    contact:(button)=>change(()=>{E.requestContact(session,selected().id,button?.dataset.question);notify('確認を依頼しました。');}),
    step,
    retry:()=>{closeModal(false);change(()=>E.retryCheckpoint(session));ui.outcomeShown='';lastSave=0;showPause();},
    training:()=>{closeModal(false);change(()=>E.continueTraining(session));ui.outcomeShown='';lastTick=performance.now();},
  };
  document.addEventListener('click',event=>{const target=event.target.closest('button,[data-action]');if(!target||target.disabled)return;try{if(target.dataset.action){event.preventDefault();actions[target.dataset.action]?.(target);}else if(target.dataset.scenario){const pack=D.scenarios.find(s=>s.id===target.dataset.scenario&&!s.hidden);if(pack){home.scenarioId=pack.id;home.difficulty=pack.difficulty;home.individual='';render();}}else if(target.dataset.difficulty){home.difficulty=target.dataset.difficulty;home.scenarioId=target.dataset.difficulty;home.individual='';render();}else if(target.dataset.case){tutorialMark('case');selectCase(target.dataset.case);}else if(target.dataset.tab){tutorialMark(target.dataset.tab);bridgeMark(target.dataset.tab);ui.tab=target.dataset.tab;render();}else if(target.dataset.evidence){change(()=>E.addEvidence(session,selected().id,target.dataset.evidence));}else if(target.dataset.removeEvidence){change(()=>E.removeEvidence(session,selected().id,target.dataset.removeEvidence));}else if(target.dataset.query){ui.query=target.dataset.query;ui.host='';ui.source='';ui.tab='logs';render();}else if(target.dataset.command){ui.command=target.dataset.command;render();$('terminal-input')?.focus();}}catch(error){notify(error.message,true);}});
  document.addEventListener('input',event=>{const el=event.target;if(el.id==='log-search'){ui.query=el.value;ui.logLimit=100;if(tutorial){tutorial.query=el.value;if(!event.isComposing&&el.value.trim()===T.SEARCH_QUERY)tutorialMark('search');save();}if(!event.isComposing)render();}else if(el.dataset.reflection&&bridge){bridge.reflections??={};bridge.reflections[selected().id]??={facts:'',limits:'',next:''};bridge.reflections[selected().id][el.dataset.reflection]=el.value.slice(0,1400);save();}else if(el.dataset.draft&&running()&&record().status!=='resolved'){record().draft[el.dataset.draft]=el.value;save();if(!event.isComposing){refreshTutorial();refreshBridge();}}else if(el.id==='terminal-input'){ui.command=el.value;}});
  document.addEventListener('toggle',event=>{const el=event.target;if(!el.dataset.logDetails||!el.isConnected)return;const openLogs=new Set(ui.openLogs||[]);if(el.open)openLogs.add(el.dataset.logDetails);else openLogs.delete(el.dataset.logDetails);ui.openLogs=[...openLogs];if(bridge&&el.dataset.logDetails&&el.open){bridgeMark('raw');refreshBridge();}if(!tutorial||el.dataset.logDetails!==T.PRIMARY_LOG_ID)return;tutorial.openLogs=el.open?[T.PRIMARY_LOG_ID]:[];if(el.open)tutorialMark('raw');save();refreshTutorial();},true);
  document.addEventListener('compositionstart',()=>{composing=true;});
  document.addEventListener('compositionend',event=>{composing=false;if(event.target.id==='log-search'){ui.query=event.target.value;if(tutorial){tutorial.query=ui.query;if(ui.query.trim()===T.SEARCH_QUERY)tutorialMark('search');save();}}if(pendingRender||event.target.id==='log-search')render();else{refreshTutorial();refreshBridge();}});
  document.addEventListener('change',event=>{const el=event.target;if(el.id==='bridge-reflected'){const next=document.querySelector('[data-action="bridge-review-next"]');if(next)next.disabled=!el.checked;}else if(el.id==='home-scope'){home.individual=el.value;render();}else if(el.id==='time-from'||el.id==='time-to'){ui[el.id==='time-from'?'from':'to']=el.value;ui.logLimit=100;render();}else if(el.id==='evidence-only'){ui.evidenceOnly=el.checked;ui.logLimit=100;render();}else if(el.id==='source-filter'){ui.source=el.value;ui.logLimit=100;render();}else if(el.id==='host-filter'){ui.host=el.value;ui.logLimit=100;render();}});
  document.addEventListener('submit',event=>{if(event.target.id==='case-form'){event.preventDefault();if(tutorial&&tutorialStep().id!=='submit')return notify('上のチュートリアルに沿って、順番に操作してください。');change(()=>{const result=E.submitCase(session,selected().id);notify(result.passed?'根拠と判断を確認しました。対応を記録しました。':'不足している項目を確認し、調査を続けてください。',!result.passed);});}else if(event.target.id==='terminal-form'){event.preventDefault();if(!running())return notify('勤務を再開してから実行してください。');const command=ui.command.trim();if(!command)return;syncTerminal();const result=terminal.run(command);if(result.clear)ui.terminalEntries=[];else ui.terminalEntries.push(`$ ${command}\n${result.stdout||''}${result.stderr?'[error] '+result.stderr:''}`);ui.terminalEntries=ui.terminalEntries.slice(-40);ui.command='';save();render();if($('terminal-output'))$('terminal-output').scrollTop=$('terminal-output').scrollHeight;$('terminal-input')?.focus();}});
  $('dialog').addEventListener('cancel',event=>{event.preventDefault();closeModal(true);});
  $('import-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(file.size>20*1024*1024)return notify('保存ファイルは20MB以下で読み込んでください。',true);
    try{
      const raw=JSON.parse(await file.text());
      if(raw.format!=='socroom-save'||raw.version!==1)throw new Error('SOCroom の保存ファイルではありません。');
      if(raw.session?.version==='socroom-1')throw new Error('旧版の進捗です。旧版HTML（socroom-v0.2.html）で読み込んでください。新しい問題セットとは別に保存されます。');
      const next=E.hydrate(raw.session);
      if((next.scenarioId==='tutorial')!==(raw.tutorial!==undefined)||(next.scenarioId==='bridge')!==(raw.bridge!==undefined))throw new Error('チュートリアルの保存内容または実務演習の保存内容と演習モードが一致しません。');
      const nextGuide=raw.tutorial===undefined?null:T.hydrate(raw.tutorial,next);
      const nextBridge=raw.bridge===undefined?null:B.hydrate(raw.bridge,next);
      const nextTerminal=globalThis.SocTerminal.create({});if(raw.workspace)nextTerminal.setWorkspace(raw.workspace);
      const apply=()=>{
        if(nextGuide){enterTutorial(next,nextGuide,raw.workspace);return;}
        if(nextBridge){enterBridge(next,nextBridge,raw.workspace);return;}
        if(bridge)exitBridge();if(tutorial)exitTutorial();else closeModal(false);
        session=next;terminal=nextTerminal;ui=freshUI();screen='work';home.scenarioId=session.scenarioId;home.difficulty=session.difficulty;home.individual=session.individualCaseId||'';
        lastSave=0;syncTerminal();save(true);render();notify('進捗を読み込みました。');if(session.phase==='paused')showPause();else checkOutcome();
      };
      const replaced=nextBridge?(bridge?session:bridgeSaved?.session):nextGuide?(tutorial?session:tutorialSaved?.session):((tutorial||bridge)?normalSnapshot?.session:session);
      if(replaced&&replaced.phase!=='completed'){
        actions['import-confirmed']=apply;
        actions['export-before-import']=()=>{
          if(nextBridge&&!bridge&&bridgeSaved){download('socroom-guided-practice.json',JSON.stringify(bridgeSaved,null,2),'application/json');}
          else if(nextGuide&&!tutorial&&tutorialSaved){download('socroom-tutorial.json',JSON.stringify(tutorialSaved,null,2),'application/json');}
          else if(!nextGuide&&!nextBridge&&(tutorial||bridge)&&normalSnapshot?.session){const old=normalSnapshot;download(`socroom-${old.session.scenarioId}-${old.session.difficulty}.json`,JSON.stringify({format:'socroom-save',version:1,session:old.session,workspace:old.terminal?.getWorkspace()||null},null,2),'application/json');notify('元の通常勤務を保存しました。');}
          else saveFile();
        };
        modal('保存した勤務へ切り替え',`<p>読み込む${nextBridge?'ガイド付き実務演習':nextGuide?'チュートリアル':'勤務'}：${esc(D.scenarios.find(s=>s.id===next.scenarioId)?.title)} · 難易度 ${labels[next.difficulty]} · ${fmt(next.elapsed)} 経過</p><p>${nextBridge?'現在のガイド付き実務演習':nextGuide?'現在のチュートリアル':'現在の通常勤務'}を置き換えます。必要なら先に保存してください。${(tutorial||bridge)&&!nextGuide&&!nextBridge?'練習の進捗は別に保存されます。':''}</p>`,`<button class="btn" data-action="export-before-import">置き換え前の進捗を保存</button><button class="btn ghost" data-action="close-dialog">戻る</button><button class="btn primary" data-action="import-confirmed">読み込む</button>`,true);
      }else apply();
    }catch(error){notify('読み込めませんでした：'+error.message,true);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='/'&&screen==='work'&&!$('dialog').open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();ui.tab='logs';render();$('log-search')?.focus();}});
  function updateTimers(){if(screen!=='work'||!session)return;if($('shift-clock'))$('shift-clock').textContent=fmt(session.elapsed);document.querySelectorAll('[data-deadline]').forEach(el=>{const r=session.records[el.dataset.deadline],left=remaining(el.dataset.deadline);el.textContent=r.status==='resolved'?'対応を記録済み':left===null?'制限時間なし':left===0?'期限超過':`初動期限まで ${fmt(left)}`;el.classList.toggle('urgent',left!==null&&left<120&&r.status!=='resolved');});document.querySelectorAll('[data-reply-countdown]').forEach(el=>{const q=E.getContactQuestions(selected().id).find(x=>x.id===el.dataset.replyCountdown),at=record().contactRequests?.[q.id];el.textContent=fmt(at+q.delaySeconds*E.DIFFICULTIES[session.difficulty].replyMultiplier-session.elapsed);});}
  function signature(){return session?JSON.stringify([session.phase,E.activeCases(session).map(c=>c.id),E.visibleLogs(session).length,E.activeCases(session).map(c=>E.availableReplies(session,c.id).map(q=>q.id))]):'';}
  setInterval(()=>{const now=performance.now(),delta=(now-lastTick)/1000;lastTick=now;if(!running()||screen!=='work')return;if(document.hidden||delta>8){E.pause(session);save(true);if(!document.hidden)showPause();return;}const before=signature();E.advance(session,delta);if(before!==signature()){syncTerminal();render();checkOutcome();}else updateTimers();if(session.elapsed-lastSave>5){save();lastSave=session.elapsed;}},500);
  document.addEventListener('visibilitychange',()=>{lastTick=performance.now();if(document.hidden&&running()){E.pause(session);save(true);render();}else if(!document.hidden&&screen==='work'&&session?.phase==='paused'&&!$('dialog').open)showPause();});
  window.addEventListener('pagehide',()=>{if(running())E.pause(session);save(true);});
  render();
})();
