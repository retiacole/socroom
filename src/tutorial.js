/* Guided first investigation. Uses a dedicated case outside the regular shifts. */
(function (root) {
  'use strict';
  const CASE_ID = 'tutorial-scan';
  const SEARCH_QUERY = '検査';
  const PRIMARY_LOG_ID = 'ts-06';
  const STEPS = [
    { id:'welcome',phase:'状況をつかむ',title:'あなたは、警報の理由を確かめる担当です',instruction:'左で案件を選び、中央で調べ、右の対応記録に根拠と判断をまとめます（狭い画面では縦に並びます）。読んだら「操作を始める」を押してください。',why:'検証用端末から短時間に複数の接続先への通信があり、警報が出ました。攻撃なのか、予定された業務によるものかを調べます。',result:'これはチュートリアル専用の問題です。ログ・作業申請・担当者の回答をそろえ、根拠付きの報告を1件完成させます。時間制限はありません。',kind:'read',target:'.case-heading'},
    { id:'case',phase:'状況をつかむ',title:'1件のアラートを開く',instruction:'「アラートキュー」の「短時間に広がった接続先」を押してください。',why:'アラートは「確認してほしい出来事」を知らせる警報です。案件を選ぶと、その調査画面が開きます。',result:'案件が「調査中」になりました。ここからログや資料を調べます。',kind:'seen',flag:'case',target:'[data-case="tutorial-scan"]'},
    { id:'context',phase:'状況をつかむ',title:'何を調べるのか、依頼を読む',instruction:'「依頼・状況」を押し、説明を読んだら「調査に戻る」を押してください。',why:'最初に、警報が出た理由と調査の目的をつかみます。今回の問いは「複数の接続先への通信は、誰のどんな作業だったか」です。',result:'調査の目的を確認しました。次は、システムに残った記録を読みます。',kind:'seen',flag:'context',target:'[data-action="context"]'},
    { id:'filter',phase:'ログを調べる',title:'調べる端末のログに絞る',instruction:'「この端末を検索」を押してください。',why:'ログはシステムが残した出来事の記録です。このボタンで、対象端末 scan-lab-01 の記録だけを表示できます。',result:'「ログ検索」に切り替わり、端末の絞り込みが設定されました。',kind:'seen',flag:'filter',target:'[data-action="filter-host"]'},
    { id:'search',phase:'ログを調べる',title:'「検査」で検索する',instruction:'ログの検索欄に「検査」と入力してください。',why:'関係する記録だけに絞り込めます。通常の勤務では、ユーザー名やIPアドレスでも検索できます。',result:'検査に関係するログが残りました。「資産検査の実施範囲を確認」という記録を詳しく読みます。',kind:'seen',flag:'search',target:'#log-search',view:'logs'},
    { id:'raw',phase:'ログを調べる',title:'実際に行われた検査の記録を読む',instruction:'「資産検査の実施範囲を確認」の「生ログを表示」を押してください。',why:'JSON の run が INV-310 なのは作業の実行ID、targets は接続先、dst_port の 443 は接続したポート番号です。outside_scope_connections の 0 は、この検査ジョブ自身が記録した範囲外接続の件数です。承認された範囲と同じかは、後で申請と照合します。',result:'元の記録を開けました。このログだけで正当と決めず、後で他の根拠と結び付けます。',kind:'seen',flag:'raw',target:'[data-log-details="ts-06"] > summary',view:'logs',query:SEARCH_QUERY},
    { id:'log-evidence',phase:'証拠を残す',title:'このログを、判断の根拠として残す',instruction:'同じ「資産検査の実施範囲を確認」の「証拠に追加」を押してください。',why:'「対応記録」の「登録した証拠」に保存されます。後で「何を見て判断したか」を報告に添えるための操作です。',result:'1つ目の証拠が登録されました。ログは検査の実施範囲を示していますが、その作業が承認されていたかも確認が必要です。',kind:'evidence',value:PRIMARY_LOG_ID,target:'[data-evidence="ts-06"]',view:'logs',query:SEARCH_QUERY},
    { id:'resources',phase:'資料と照合する',title:'端末の用途と、予定された作業を知る',instruction:'「資産・資料」タブを押してください。',why:'台帳には端末の役割、作業申請には承認済みの作業が記録されています。今回の端末は、検証用サーバーへ接続できるかを確認する専用端末です。',result:'資料を開けました。次は、ログの時刻・対象・操作を作業申請と比べます。',kind:'seen',flag:'resources',target:'[data-tab="resources"]'},
    { id:'document-evidence',phase:'資料と照合する',title:'一致する作業申請を証拠にする',instruction:'「資産検査申請 REQ-310」を読み、その「証拠に追加」を押してください。',why:'申請は08:50〜09:10に、10.24.90.21〜24 の4台の TCP 443 番へ接続する検査です。実施時刻08:52、接続先4台、操作内容がログと一致しています。ログと資料の時刻はUTCで統一されています。',result:'2つ目の証拠が登録されました。ただし申請は予定です。担当者に、実際に何をしたかも確認します。',kind:'evidence',value:'ts-doc-plan',target:'[data-evidence="ts-doc-plan"]',view:'resources'},
    { id:'contact',phase:'担当者に確認する',title:'担当者への確認画面を開く',instruction:'「照会」タブを押してください。',why:'照会は、別の担当者に事実を確認することです。ここでは検証環境担当の森田さんに、検査の実施と結果を確認できます。',result:'確認の依頼先が分かりました。次のボタンで、演習内の担当者へ依頼できます。',kind:'seen',flag:'contact',target:'[data-tab="contact"]'},
    { id:'request',phase:'担当者に確認する',title:'実施した作業を確認する',instruction:'「確認を依頼する」を押し、届いた回答を読んでください。',why:'これは教材内の模擬連絡です。このチュートリアルでは待ち時間なしで返信されます。通常の中・高難易度では返信を待つ間に別の調査を進めます。',result:'森田さんは、REQ-310 に沿った作業を実施し、INV-310 が申請どおりの4台への接続のみで完了したと確認しています。ログと申請の内容につながります。',kind:'request',target:'[data-action="contact"]',fallback:'.message.reply',view:'contact'},
    { id:'reply-evidence',phase:'担当者に確認する',title:'回答も証拠として残す',instruction:'森田さんの回答の下にある「証拠に追加」を押してください。',why:'実行ID INV-310 もログと一致しています。ログ・作業申請・担当者の回答という、別々の根拠を組み合わせます。',result:'3つの証拠がそろいました。ここから調査結果を「対応記録」にまとめます。',kind:'evidence',value:'ts-reply',target:'[data-evidence="ts-reply"]',view:'contact'},
    { id:'evidence-review',phase:'判断を記録する',title:'集めた3つの根拠を確認する',instruction:'「対応記録」の「登録した証拠」を確認し、「次へ」を押してください。',why:'ログが示す接続の範囲と操作は申請と一致し、担当者も実施と完了を確認しています。申請があるだけで判断せず、実際の作業が承認範囲に収まったと確かめたことが大切です。',result:'次は、証拠から導いた判断を記録します。',kind:'read',target:'.evidence-tray'},
    { id:'verdict',phase:'判断を記録する',title:'調査結果の判定を選ぶ',instruction:'「判定」で「正当な操作・業務」を選んでください。',why:'今回は承認済みの資産検査です。短時間に接続先が増えたという理由だけで攻撃と決めません。',result:'正当な業務による事象として判定を記録しました。',kind:'draft',field:'verdict',value:'benign',target:'#draft-verdict'},
    { id:'priority',phase:'判断を記録する',title:'確認後の対応優先度を決める',instruction:'「対応優先度」で「低」を選んでください。',why:'承認された範囲内での検査完了を確認できました。左の「検知：中」は機械が付けた重要度です。調査後の対応優先度とは異なっていて構いません。',result:'調査結果に基づく対応優先度を記録しました。',kind:'draft',field:'priority',value:'low',target:'#draft-priority'},
    { id:'target',phase:'判断を記録する',title:'どの端末についての判断かを残す',instruction:'「対象端末」で「scan-lab-01」を選んでください。',why:'担当者が交代しても、どの端末について調査したのか分かるようにします。',result:'調査対象を記録しました。',kind:'draft',field:'target',value:'scan-lab-01',target:'#draft-target'},
    { id:'action',phase:'判断を記録する',title:'この案件の次の対応を選ぶ',instruction:'「次の対応」で「根拠を添えてクローズ」を選んでください。',why:'クローズは、根拠を残して案件の確認を終えることです。今回は、セキュリティ上の隔離やアカウント停止は不要と判断できます。',result:'案件を根拠付きで終了する方針を記録しました。',kind:'draft',field:'action',value:'close',target:'#draft-action'},
    { id:'summary',phase:'報告を仕上げる',title:'何が分かり、なぜそう判断したかを書く',instruction:'「確認した事実・判断の理由」に入力してください。下の「この欄に入力例を入れる」も使えます。',why:'事実と根拠をつないで報告します。例文を入れた後に、自分の言葉へ直しても構いません。',result:'調査で確認した事実と、判断の理由を記録しました。',kind:'text',field:'summary',target:'#draft-summary',example:'scan-lab-01 からの複数接続は資産検査 INV-310 によるものだった。ログの対象4台、TCP 443 番への接続、実施時刻08:52は、資産検査申請 REQ-310 の承認範囲と一致した。森田さんも実施範囲と完了を確認しており、正当な業務と判断した。'},
    { id:'next-step',phase:'報告を仕上げる',title:'案件を閉じた後の引き継ぎを残す',instruction:'「未確認事項・引き継ぎ」に入力してください。この欄にも入力例を用意しています。',why:'今回の確認結果がどこまで通用するかも残します。自由記述の意味は自動採点されないため、報告例と比べて振り返ります。',result:'次の担当者が何をするかまで記録できました。',kind:'text',field:'nextStep',target:'#draft-nextStep',example:'実施範囲のログ、作業申請、担当者の回答を根拠にクローズする。今回の確認だけで同じ端末の将来の通信を一括許可せず、申請外の接続があれば別案件として調査する。'},
    { id:'submit',phase:'報告を仕上げる',title:'判断と対応を記録して、案件を完了する',instruction:'「判断と対応を記録する」を押してください。',why:'証拠・判定・対象・対応がそろっているかを確認します。ボタンを押すまでは下書きです。実際のシステムの設定変更や連絡は行いません。',result:'案件が「対応済み」になりました。「次へ」で、この調査の流れを振り返りましょう。',kind:'submitted',target:'#case-form .submit'},
    { id:'finish',phase:'振り返る',title:'最初の調査を、最後までできました',instruction:'依頼を読む → ログを調べる → 資料・担当者と照合 → 証拠を残す → 判断と対応を記録する。「終了して勤務選択へ」を押し、この順番を次は自分で試してみましょう。',why:'この専用問題は操作を覚えるため、判断の理由と入力例を案内しました。通常勤務では別の問題を使い、インシデント・正当な業務・判断できない案件を、自分で見極めます。',result:'通常勤務の進捗は変更していません。終了すると、元の勤務選択へ戻れます。',kind:'submitted',target:'.assessment'}
  ];
  const flags = new Set(STEPS.filter(x=>x.flag).map(x=>x.flag));
  function create(){return {version:2,step:0,seen:[],query:'',openLogs:[]};}
  function mark(state,flag){if(flags.has(flag)&&!state.seen.includes(flag))state.seen.push(flag);}
  function complete(step,state,session){const r=session?.records?.[CASE_ID];if(!r)return false;
    if(step.kind==='read')return true;
    if(step.kind==='seen')return state.seen.includes(step.flag);
    if(step.kind==='evidence')return r.evidenceIds.includes(step.value);
    if(step.kind==='request')return r.requestAt!==null;
    if(step.kind==='draft')return r.draft[step.field]===step.value;
    if(step.kind==='text')return r.draft[step.field].trim().length>0;
    return r.status==='resolved';
  }
  function normalize(state,session){for(let i=0;i<state.step;i++){if(!complete(STEPS[i],state,session)){state.step=i;break;}}return state;}
  function hydrate(raw,session){if(!raw||raw.version!==2||!Number.isInteger(raw.step)||raw.step<0||raw.step>=STEPS.length||!Array.isArray(raw.seen)||raw.seen.length>flags.size||raw.seen.some(f=>!flags.has(f))||session?.scenarioId!=='tutorial'||session?.difficulty!=='low'||session?.individualCaseId!==CASE_ID)throw new Error('チュートリアルの保存内容が不正です。');const state={version:2,step:raw.step,seen:[...new Set(raw.seen)],query:typeof raw.query==='string'?raw.query.slice(0,200):'',openLogs:Array.isArray(raw.openLogs)&&raw.openLogs.includes(PRIMARY_LOG_ID)?[PRIMARY_LOG_ID]:[]};return normalize(state,session);}
  root.SocTutorial = Object.freeze({CASE_ID,SEARCH_QUERY,PRIMARY_LOG_ID,STEPS,create,mark,complete,normalize,hydrate});
  if(typeof module==='object'&&module.exports)module.exports=root.SocTutorial;
})(globalThis);
