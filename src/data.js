/* SOCroom v0.4: 15 regular cases, one tutorial, five guided practice cases.
 * Generated from content/*.json by assemble-data.js. Synthetic offline data. */
(function(root){
  "use strict";
  const data = {
  "version": "socroom-2",
  "company": {
    "name": "青凪システムズ",
    "description": "架空の企業のSOCで、監視・調査・初動の引き継ぎを担当します。2026年10月20日の記録を使った演習です。ログ・資料・担当者の回答の時刻はすべてUTC。人物・組織・通信先は教材用の合成データで、アプリは外部へ通信しません。"
  },
  "scenarios": [
    {
      "id": "low",
      "difficulty": "low",
      "title": "基礎監視",
      "subtitle": "端末の記録と事実の確認",
      "caseIds": [
        "low-quarantine",
        "low-lost-device",
        "low-backup",
        "low-mail-rule",
        "low-log-gap"
      ],
      "briefing": [
        "この勤務では、端末1台を中心にした5つの異なる案件を順番に調べます。1件を完了すると、次の案件が届きます。",
        "ログの出来事を、資産の用途や担当者の回答と照合してください。警報の名前だけで結論を決めず、確認できた範囲を報告します。",
        "時間制限はありません。段階ヒントと即時の照会返信を使い、証拠を残してから判断・対応を記録しましょう。"
      ]
    },
    {
      "id": "medium",
      "difficulty": "medium",
      "title": "照合調査",
      "subtitle": "複数のログと業務確認",
      "caseIds": [
        "medium-bulk-upload",
        "medium-mfa-fatigue",
        "medium-waf-import",
        "medium-oauth-consent",
        "medium-saas-gap"
      ],
      "briefing": [
        "この勤務は中難易度専用の5案件です。5件が同時に届くため、権限・扱う情報・観測できない範囲から調査順を決めてください。",
        "単独の警報やHTTPの応答だけでは判断できません。セッションや操作IDを使ってログを結び、作業予定と実施内容を担当者に確認します。",
        "案件ごとの初動期限は20分。照会の返信には待ち時間があります。待っている間も別の案件を調査でき、重要案件の期限超過でゲームオーバーになります。"
      ]
    },
    {
      "id": "high",
      "difficulty": "high",
      "title": "影響調査",
      "subtitle": "複数端末・証拠の限界・優先順位",
      "caseIds": [
        "high-pipeline",
        "high-recovery",
        "high-lateral",
        "high-export",
        "high-rollout"
      ],
      "briefing": [
        "この勤務は高難易度専用の5案件です。45秒ごとに新しい案件が到着し、各案件の初動期限は到着から15分です。",
        "案件には複数端末の記録が含まれます。ログ検索の絞り込みを解除するか「時系列」で関連端末を確認し、同じトークン・接続・作業IDを追ってください。",
        "主な対象端末を選び、関連端末の影響と未確認事項を報告文に記録します。広い範囲を止める前に、必要な封じ込め対象と業務影響を区別し、上位担当へ引き継ぎます。"
      ]
    },
    {
      "id": "tutorial",
      "difficulty": "low",
      "hidden": true,
      "title": "はじめての資産監視",
      "subtitle": "画面操作を学ぶ専用問題",
      "caseIds": [
        "tutorial-scan"
      ],
      "briefing": [
        "検証用ネットワークで接続先の増加が検知されています。上の案内に従い、ログ・作業申請・担当者の回答を照合しましょう。",
        "この案件はチュートリアル専用です。通常勤務の15問には出題されず、時間制限もありません。"
      ]
    },
    {
      "id": "bridge",
      "difficulty": "low",
      "hidden": true,
      "title": "ガイド付き実務演習",
      "subtitle": "個々の操作から、つながる調査へ",
      "caseIds": [
        "bridge-app-update",
        "bridge-usb-copy",
        "bridge-service-auth",
        "bridge-link-followup",
        "bridge-local-admin"
      ],
      "briefing": [
        "この実務演習は、調査から証拠登録・判断・引き継ぎまでをつなげる専用問題です。通常勤務の15問とは別の5件を、1件ずつ担当します。",
        "全件に時間制限はなく、照会はすぐに返信されます。ログと資料の時刻はUTCです。担当者への照会や封じ込め依頼は、教材内の模擬操作です。",
        "確認できた事実と未確認事項を分けて報告してください。提出後は自分の報告と報告例を見比べ、次の案件へ進みます。"
      ]
    }
  ],
  "assets": [
    {
      "id": "sales-lt-017",
      "name": "sales-lt-017",
      "owner": "営業部・木田 優",
      "importance": "高",
      "description": "営業用ノートPC。顧客名簿を一時保存し、MDMからロックを指示できる。"
    },
    {
      "id": "qa-lt-008",
      "name": "qa-lt-008",
      "owner": "品質管理部・藤野 真里",
      "importance": "中",
      "description": "検証用のQA端末。承認された防御機能の動作確認に使用する。"
    },
    {
      "id": "fs-archive-01",
      "name": "fs-archive-01",
      "owner": "情報システム部・保存基盤チーム",
      "importance": "中",
      "description": "保管用ファイルサーバー。社内バックアップ装置へ定期的に複製する。"
    },
    {
      "id": "mail-fin-04",
      "name": "mail-fin-04",
      "owner": "経理部・矢野 杏",
      "importance": "高",
      "description": "請求書を受信する経理担当のメールボックス。外部への自動転送は承認制。"
    },
    {
      "id": "plan-lt-012",
      "name": "plan-lt-012",
      "owner": "企画部・石井 咲",
      "importance": "中",
      "description": "社内企画用の端末。顧客情報は扱わず、リモート管理で状態を確認する。"
    },
    {
      "id": "idp-finance-01",
      "name": "idp-finance-01",
      "owner": "財務部・水野 梨奈",
      "importance": "高",
      "description": "財務ポータルの認証サービス。利用者は支払先情報の参照権限を持つ。"
    },
    {
      "id": "saas-connect-01",
      "name": "saas-connect-01",
      "owner": "営業推進部・安藤 奈々",
      "importance": "高",
      "description": "メールSaaSの連携管理。OAuthの委任権限を持つアプリを管理する。"
    },
    {
      "id": "design-fs-02",
      "name": "design-fs-02",
      "owner": "設計部・共同開発支援チーム",
      "importance": "高",
      "description": "共同開発用の図面を一時保存する共有サーバー。外部共有は案件ごとの承認が必要。"
    },
    {
      "id": "logistics-web-03",
      "name": "logistics-web-03",
      "owner": "物流システム部・取込基盤チーム",
      "importance": "中",
      "description": "取引先の配送データを取り込むポータル。CSVは検証後にデータとして保存する。"
    },
    {
      "id": "hr-saas-01",
      "name": "hr-saas-01",
      "owner": "人事システム部・アクセス管理チーム",
      "importance": "高",
      "description": "人事情報を保持するSaaS。管理者は閲覧範囲とエクスポート権限を変更できる。"
    },
    {
      "id": "asset-ci-control-01",
      "name": "ci-control-01",
      "owner": "開発基盤チーム",
      "importance": "重要",
      "description": "CI定義と本番配布チャネルの制御。10.60.10.10。"
    },
    {
      "id": "asset-build-worker-02",
      "name": "build-worker-02",
      "owner": "開発基盤チーム",
      "importance": "高",
      "description": "リリース用のビルドワーカー。10.60.10.12。"
    },
    {
      "id": "asset-artifact-registry-01",
      "name": "artifact-registry-01",
      "owner": "開発基盤チーム",
      "importance": "高",
      "description": "ビルド成果物を格納する社内レジストリ。10.60.10.20。"
    },
    {
      "id": "asset-release-agent-01",
      "name": "release-agent-01",
      "owner": "サービス運用チーム",
      "importance": "重要",
      "description": "本番カナリア・本番全体への配布を実行。10.60.20.11。"
    },
    {
      "id": "asset-jump-ops-03",
      "name": "jump-ops-03",
      "owner": "会計基盤チーム",
      "importance": "重要",
      "description": "会計系の運用踏み台。10.60.40.31。"
    },
    {
      "id": "asset-finance-db-02",
      "name": "finance-db-02",
      "owner": "会計基盤チーム",
      "importance": "重要",
      "description": "請求情報を保管する会計DB。10.60.40.12。"
    },
    {
      "id": "asset-finance-app-02",
      "name": "finance-app-02",
      "owner": "会計基盤チーム",
      "importance": "高",
      "description": "会計業務アプリケーション。10.60.40.22。"
    },
    {
      "id": "asset-dr-orchestrator-01",
      "name": "dr-orchestrator-01",
      "owner": "復旧運用チーム",
      "importance": "高",
      "description": "復旧訓練と拠点間複製の制御。10.60.70.10。"
    },
    {
      "id": "asset-ledger-db-01",
      "name": "ledger-db-01",
      "owner": "経理基盤チーム",
      "importance": "重要",
      "description": "仕訳情報の本番DB。10.60.70.11。"
    },
    {
      "id": "asset-ledger-dr-01",
      "name": "ledger-dr-01",
      "owner": "復旧運用チーム",
      "importance": "重要",
      "description": "隔離された復旧用DB。10.60.71.11。"
    },
    {
      "id": "asset-endpoint-mgr-02",
      "name": "endpoint-mgr-02",
      "owner": "端末管理チーム",
      "importance": "重要",
      "description": "社内端末へのソフトウェア配布元。10.60.80.20。"
    },
    {
      "id": "asset-sales-lt-061",
      "name": "sales-lt-061",
      "owner": "営業部",
      "importance": "中",
      "description": "パイロット対象の営業端末。10.60.81.61。"
    },
    {
      "id": "asset-hr-lt-024",
      "name": "hr-lt-024",
      "owner": "人事部",
      "importance": "高",
      "description": "パイロット対象の人事端末。10.60.82.24。"
    },
    {
      "id": "asset-design-ws-012",
      "name": "design-ws-012",
      "owner": "制作部",
      "importance": "中",
      "description": "パイロット対象の制作端末。10.60.83.12。"
    },
    {
      "id": "asset-analytics-db-02",
      "name": "analytics-db-02",
      "owner": "データ分析基盤チーム",
      "importance": "重要",
      "description": "顧客分析用ビューを持つDB。10.60.90.12。"
    },
    {
      "id": "asset-export-worker-03",
      "name": "export-worker-03",
      "owner": "データ分析基盤チーム",
      "importance": "高",
      "description": "分析抽出と別業務の転送処理を実行。10.60.90.23。"
    },
    {
      "id": "asset-egress-gw-02",
      "name": "egress-gw-02",
      "owner": "ネットワーク運用チーム",
      "importance": "重要",
      "description": "複数クライアントを多重化する共有出口。10.60.90.2。"
    },
    {
      "id": "asset-tutorial-scan",
      "name": "scan-lab-01",
      "owner": "検証環境担当",
      "importance": "低",
      "description": "検証用サーバー4台の到達性を確認する端末。チュートリアル専用。"
    },
    {
      "id": "asset-bridge-app-update",
      "name": "support-12",
      "owner": "社内サポート",
      "importance": "中",
      "description": "問い合わせ対応用端末。業務アプリの更新は配布管理担当が申請単位で行う。"
    },
    {
      "id": "asset-bridge-usb-copy",
      "name": "legal-08",
      "owner": "法務部",
      "importance": "高",
      "description": "契約関係の機密資料を扱う端末。持ち出しは登録済み暗号化USBに限定する。"
    },
    {
      "id": "asset-bridge-service-auth",
      "name": "metrics-03",
      "owner": "監視基盤担当",
      "importance": "中",
      "description": "svc-metrics の認証を使い、社内メトリクスを集計する端末。"
    },
    {
      "id": "asset-bridge-link-followup",
      "name": "sales-14",
      "owner": "営業部",
      "importance": "中",
      "description": "外出用業務端末。問題のURL操作後にオフラインとなっている。"
    },
    {
      "id": "asset-bridge-local-admin",
      "name": "design-06",
      "owner": "設計部",
      "importance": "高",
      "description": "設計資料を扱う業務端末。利用者判断による新規ローカル管理者追加は禁止。"
    }
  ],
  "cases": [
    {
      "id": "low-lost-device",
      "scenarioId": "low",
      "difficulty": "low",
      "title": "社外で途絶えた端末の通信",
      "subtitle": "営業端末 / SA-LT-017",
      "host": "sales-lt-017",
      "user": "y.kida",
      "source": "MDM",
      "severity": "high",
      "critical": true,
      "context": "営業端末が社外で最後に接続した後、管理サーバーへの通信が途絶えました。端末の管理状態と、利用者からの連絡を確認してください。",
      "logs": [
        {
          "id": "low-lost-device-log-01",
          "time": "09:10:00",
          "offset": 0,
          "source": "MDM",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "端末の定期チェックイン",
          "raw": "2026-10-20T09:10:00Z host=sales-lt-017 user=y.kida device=SA-LT-017 state=online encryption=enabled remote_lock=ready",
          "path": "/var/log/security/mdm.log"
        },
        {
          "id": "low-lost-device-log-02",
          "time": "09:10:02",
          "offset": 0,
          "source": "MDM",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "最後の接続場所を記録",
          "raw": "2026-10-20T09:10:02Z host=sales-lt-017 user=y.kida device=SA-LT-017 network=hotel-guest location=offsite last_seen=09:10:02",
          "path": "/var/log/security/mdm.log"
        },
        {
          "id": "low-lost-device-log-03",
          "time": "09:10:05",
          "offset": 0,
          "source": "監査",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "営業資料のローカル保存",
          "raw": "2026-10-20T09:10:05Z host=sales-lt-017 user=y.kida device=SA-LT-017 action=file_sync directory=/work/customers local_copy=present records=43 classification=confidential",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "low-lost-device-log-04",
          "time": "09:12:00",
          "offset": 0,
          "source": "IdP",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "営業アプリのセッション状態",
          "raw": "2026-10-20T09:12:00Z host=sales-lt-017 user=y.kida device=SA-LT-017 session=SD-17 state=active expires=17:10:00",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "low-lost-device-log-05",
          "time": "09:20:00",
          "offset": 0,
          "source": "MDM",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "定期通信の未着を検知",
          "raw": "2026-10-20T09:20:00Z host=sales-lt-017 user=y.kida device=SA-LT-017 missed_checkins=2 last_seen=09:10:02",
          "path": "/var/log/security/mdm.log"
        },
        {
          "id": "low-lost-device-log-06",
          "time": "09:21:00",
          "offset": 0,
          "source": "MDM",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "現在の遠隔管理状態",
          "raw": "2026-10-20T09:21:00Z host=sales-lt-017 user=y.kida device=SA-LT-017 state=offline lock_command=not_requested wipe_command=not_requested",
          "path": "/var/log/security/mdm.log"
        },
        {
          "id": "low-lost-device-log-07",
          "time": "09:21:10",
          "offset": 0,
          "source": "EDR",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "192.0.2.17",
          "event": "最後に受け取った端末状態",
          "raw": "2026-10-20T09:21:10Z host=sales-lt-017 user=y.kida device=SA-LT-017 sample_time=09:10:00 malware_alerts=0 sample_is_current=false",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "low-lost-device-log-08",
          "time": "09:22:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "sales-lt-017",
          "user": "y.kida",
          "ip": "10.24.0.9",
          "event": "管理サービスの受信状態",
          "raw": "2026-10-20T09:22:00Z host=sales-lt-017 user=y.kida stream=mdm service=healthy other_devices_reporting=true",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "low-lost-device-doc-asset",
          "title": "営業端末の資産台帳",
          "kind": "資産・アカウント",
          "body": "SA-LT-017 / sales-lt-017 は木田 優の貸与端末。ディスク暗号化は有効だが、営業アプリのセッションと顧客43名のローカル資料を保持している。端末がオフラインでもMDMへロック指示を登録でき、再接続時に適用される。"
        },
        {
          "id": "low-lost-device-doc-procedure",
          "title": "端末紛失時の初動手順",
          "kind": "対応手順",
          "body": "所有者に所在を確認し、紛失が確認された端末はセキュリティ案件として高優先度で管理担当へ連携する。端末ロックと関連セッション失効を依頼し、データの種類と最終接続を記録する。通信未着だけで紛失とは断定しない。遠隔消去は責任者がデータ保全・復旧の要否を確認して判断する。"
        }
      ],
      "contact": {
        "id": "low-lost-device-contact",
        "name": "木田 優",
        "role": "営業部・端末利用者",
        "question": "登録済みの電話番号で、端末の所在と最後の利用を確認する",
        "replyId": "low-lost-device-reply",
        "replyTitle": "木田からの回答：端末の所在",
        "replyText": "09:10ごろ宿泊先のロビーで使った後、かばんを置いたまま席を外しました。戻った時には端末がなく、ホテルへの確認でも見つかっていません。09:15以降は操作していません。顧客訪問用の名簿を保存しています。端末番号は SA-LT-017 です。",
        "delaySeconds": 20
      },
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "sales-lt-017",
        "evidenceGroups": [
          [
            "low-lost-device-log-03",
            "low-lost-device-log-04",
            "low-lost-device-log-06"
          ],
          [
            "low-lost-device-reply"
          ]
        ],
        "summary": "利用者が SA-LT-017 の紛失を確認した。端末には顧客資料が保存され、営業アプリのセッションも有効で、現在はオフラインのため現状を確認できない。",
        "nextStep": "管理担当へ高優先度で連携し、MDMのロック指示登録と関連セッション失効を依頼する。データの範囲を確認し、再接続状況を監視する。",
        "explanation": "単なる通信断では紛失は確定しませんが、今回は登録済み連絡先で利用者が所在不明を確認しています。暗号化の有効性を過信せず、残存するセッションとデータを保護します。データが読まれたという証拠はありません。",
        "lessons": [
          "端末紛失もセキュリティ案件として扱います。",
          "確認できた事実と、現時点で不明なデータ閲覧の有無を分けます。"
        ]
      },
      "hints": [
        "端末がオフラインというログだけでは理由が分かりません。利用者へ所在を確認してください。",
        "資料の保存とセッションの状態を示すログを証拠に追加します。",
        "利用者の回答と端末の現在状態を根拠に、ロックとセッションへの初動を依頼します。"
      ]
    },
    {
      "id": "low-quarantine",
      "scenarioId": "low",
      "difficulty": "low",
      "title": "ダウンロードファイルの隔離通知",
      "subtitle": "QA端末 / QA-LT-008",
      "host": "qa-lt-008",
      "user": "m.fujino",
      "source": "EDR",
      "severity": "medium",
      "critical": false,
      "context": "QA端末でファイルが検知され、隔離されました。ファイルの識別子と、本日の作業予定を確認して判断してください。",
      "logs": [
        {
          "id": "low-quarantine-log-01",
          "time": "09:25:00",
          "offset": 0,
          "source": "IdP",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "QA利用者が端末にサインイン",
          "raw": "2026-10-20T09:25:00Z host=qa-lt-008 user=m.fujino device=QA-LT-008 authentication=certificate result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "low-quarantine-log-02",
          "time": "09:26:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "検証作業の開始",
          "raw": "2026-10-20T09:26:00Z host=qa-lt-008 user=m.fujino job=AV-CHECK-31 change=CHG-3101 operator=m.fujino",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "low-quarantine-log-03",
          "time": "09:26:04",
          "offset": 0,
          "source": "Proxy",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "社内検証サイトから取得",
          "raw": "2026-10-20T09:26:04Z host=qa-lt-008 user=m.fujino dst=security-test.internal.example path=/fixtures/checkfile.txt request=QA-31 bytes_in=68 result=allowed",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "low-quarantine-log-04",
          "time": "09:26:04",
          "offset": 0,
          "source": "EDR",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "ダウンロードファイルを検知",
          "raw": "2026-10-20T09:26:04Z host=qa-lt-008 user=m.fujino file=/Downloads/checkfile.txt fingerprint=LAB-TEST-3101 category=antivirus-test-fixture request=QA-31",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "low-quarantine-log-05",
          "time": "09:26:05",
          "offset": 0,
          "source": "EDR",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "ファイルを実行前に隔離",
          "raw": "2026-10-20T09:26:05Z host=qa-lt-008 user=m.fujino file=/Downloads/checkfile.txt fingerprint=LAB-TEST-3101 action=quarantine result=success execution=prevented",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "low-quarantine-log-06",
          "time": "09:26:06",
          "offset": 0,
          "source": "監査",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "隔離イベントを作業票へ保存",
          "raw": "2026-10-20T09:26:06Z host=qa-lt-008 user=m.fujino ticket=CHG-3101 evidence=QA-31 operator=m.fujino result=stored",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "low-quarantine-log-07",
          "time": "09:27:00",
          "offset": 0,
          "source": "EDR",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "検知後の端末状態",
          "raw": "2026-10-20T09:27:00Z host=qa-lt-008 user=m.fujino agent=healthy related_process_started=false new_detections=0",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "low-quarantine-log-08",
          "time": "09:27:10",
          "offset": 0,
          "source": "ジョブ",
          "host": "qa-lt-008",
          "user": "m.fujino",
          "ip": "10.24.50.8",
          "event": "検証ジョブの終了",
          "raw": "2026-10-20T09:27:10Z host=qa-lt-008 user=m.fujino job=AV-CHECK-31 observed=quarantine result=completed",
          "path": "/var/log/jobs/scheduler.log"
        }
      ],
      "documents": [
        {
          "id": "low-quarantine-doc-asset",
          "title": "QA端末の用途",
          "kind": "資産・アカウント",
          "body": "qa-lt-008 は品質管理部が使用する検証端末。通常の業務データや顧客資料は保存しない。藤野が管理し、セキュリティ検証は作業票に対象と検証用ファイルの識別子を記録する。"
        },
        {
          "id": "low-quarantine-doc-change",
          "title": "変更申請 CHG-3101",
          "kind": "変更申請",
          "body": "承認済み。10月20日09:25〜09:35、qa-lt-008 でウイルス対策の隔離動作を確認する。社内サイト security-test.internal.example から教材用の無害な検証ファイルを取得する。識別子 LAB-TEST-3101、68バイト。期待する結果は実行前隔離。担当は藤野。外部サイトのファイルや他端末は対象外。"
        }
      ],
      "contact": {
        "id": "low-quarantine-contact",
        "name": "藤野 真里",
        "role": "品質管理・検証担当",
        "question": "検証ファイルの取得と隔離結果が作業票と一致するか確認する",
        "replyId": "low-quarantine-reply",
        "replyTitle": "藤野からの回答：検証実施記録",
        "replyText": "CHG-3101 の検証を私が実施しました。QA-31 は作業票どおりの無害な検証ファイルです。実行はせず、実行前に隔離されたことを確認して終了しました。識別子は LAB-TEST-3101 で一致しています。",
        "delaySeconds": 20
      },
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "qa-lt-008",
        "evidenceGroups": [
          [
            "low-quarantine-log-04",
            "low-quarantine-log-05"
          ],
          [
            "low-quarantine-doc-change"
          ]
        ],
        "summary": "検知されたのは CHG-3101 で承認された無害な検証ファイルで、端末・時間帯・識別子が一致している。予定どおり実行前に隔離された。",
        "nextStep": "作業票と隔離ログを添えてクローズする。隔離機能の検証結果を担当者へ返す。",
        "explanation": "隔離済みという事実だけでは無害と判断できません。今回は検証ファイルの識別子と承認済み作業の対象が一致し、期待した防御動作を確認できます。一般の検知ファイルまで許可してはいけません。",
        "lessons": [
          "ファイル名より識別子と作業票の一致を確認します。",
          "隔離されたことと、元の活動が正当だったことは別の判断です。"
        ]
      },
      "hints": [
        "検知ログの fingerprint と資料の識別子を比較してください。",
        "対象端末と実施時間も作業票に含まれています。",
        "隔離ログと変更申請を証拠に登録し、今回の正当な検証をクローズします。"
      ]
    },
    {
      "id": "low-backup",
      "scenarioId": "low",
      "difficulty": "low",
      "title": "深夜帯に増えたストレージ通信",
      "subtitle": "ファイルサーバー / FS-ARCHIVE-01",
      "host": "fs-archive-01",
      "user": "svc-snapshot",
      "source": "Proxy",
      "severity": "medium",
      "critical": false,
      "context": "ファイルサーバーからの送信量が通常より増えています。送信先とジョブの実行内容を照合し、予定された処理か確認してください。",
      "logs": [
        {
          "id": "low-backup-log-01",
          "time": "02:00:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.11",
          "event": "保管データの複製を開始",
          "raw": "2026-10-20T02:00:00Z host=fs-archive-01 user=svc-snapshot job=BK-2010 mode=full destination=backup-vault.internal.example ticket=OPS-3110",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "low-backup-log-02",
          "time": "02:00:02",
          "offset": 0,
          "source": "IdP",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.11",
          "event": "複製用サービスの認証",
          "raw": "2026-10-20T02:00:02Z host=fs-archive-01 user=svc-snapshot account=svc-snapshot auth=client_certificate result=success scope=backup.write",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "low-backup-log-03",
          "time": "02:01:00",
          "offset": 0,
          "source": "Proxy",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.90",
          "event": "社内保管先への送信を開始",
          "raw": "2026-10-20T02:01:00Z host=fs-archive-01 user=svc-snapshot src=10.24.60.11 dst=backup-vault.internal.example dst_ip=10.24.60.90 job=BK-2010 bytes_out=2147483648",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "low-backup-log-04",
          "time": "02:05:00",
          "offset": 0,
          "source": "Proxy",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.90",
          "event": "通信量ルールが検知",
          "raw": "2026-10-20T02:05:00Z host=fs-archive-01 user=svc-snapshot dst=10.24.60.90 job=BK-2010 bytes_out_total=8589934592 rule=LARGE_TRANSFER",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "low-backup-log-05",
          "time": "02:08:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.11",
          "event": "複製対象の集計",
          "raw": "2026-10-20T02:08:00Z host=fs-archive-01 user=svc-snapshot job=BK-2010 dataset=archive-2025 type=full files=6240 bytes=12884901888",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "low-backup-log-06",
          "time": "02:10:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.90",
          "event": "複製先で整合性確認",
          "raw": "2026-10-20T02:10:00Z host=fs-archive-01 user=svc-snapshot job=BK-2010 destination=backup-vault.internal.example checksum_match=true files=6240 result=success",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "low-backup-log-07",
          "time": "02:10:10",
          "offset": 0,
          "source": "Proxy",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.90",
          "event": "ジョブ通信の集計",
          "raw": "2026-10-20T02:10:10Z host=fs-archive-01 user=svc-snapshot job=BK-2010 destinations=10.24.60.90 external_connections=0 bytes_out=12884901888",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "low-backup-log-08",
          "time": "02:11:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "fs-archive-01",
          "user": "svc-snapshot",
          "ip": "10.24.60.11",
          "event": "保管データの複製を終了",
          "raw": "2026-10-20T02:11:00Z host=fs-archive-01 user=svc-snapshot job=BK-2010 phase=end result=success",
          "path": "/var/log/jobs/scheduler.log"
        }
      ],
      "documents": [
        {
          "id": "low-backup-doc-asset",
          "title": "ファイル保管基盤の構成",
          "kind": "資産・アカウント",
          "body": "fs-archive-01（10.24.60.11）は過年度の社内文書を保管する。バックアップ装置 backup-vault.internal.example（10.24.60.90）は同社が管理する社内装置で、svc-snapshot に書き込み権限がある。外部の共有サービスではない。"
        },
        {
          "id": "low-backup-doc-schedule",
          "title": "作業予定 OPS-3110",
          "kind": "作業予定",
          "body": "承認済み。10月20日02:00〜02:30、過年度データ archive-2025 を全量バックアップする。対象 fs-archive-01、送信先 backup-vault.internal.example（10.24.60.90）、ジョブ BK-2010。予定は6,240ファイル・12GiB。普段の差分複製より通信量が増える。完了条件は送信先での整合性確認成功。"
        }
      ],
      "contact": {
        "id": "low-backup-contact",
        "name": "長岡 誠",
        "role": "保存基盤担当",
        "question": "ジョブの実施と送信先の管理者を確認する",
        "replyId": "low-backup-reply",
        "replyTitle": "長岡からの回答：全量バックアップの結果",
        "replyText": "OPS-3110 を実施しました。BK-2010 は社内の保管装置への全量複製です。6,240ファイルの整合性確認を終えており、外部サービスへのコピーは行っていません。来月以降の全量処理も作業票へ記録します。",
        "delaySeconds": 20
      },
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "fs-archive-01",
        "evidenceGroups": [
          [
            "low-backup-log-06",
            "low-backup-log-07"
          ],
          [
            "low-backup-doc-schedule"
          ]
        ],
        "summary": "BK-2010 は OPS-3110 で予定された全量バックアップで、社内の保管先・データ量・ファイル数が一致している。送信先の整合性確認も成功した。",
        "nextStep": "ログと作業予定を添えてクローズする。通常の差分処理との違いを記録し、必要なら予定された全量処理の検知条件を検討する。",
        "explanation": "通信量の大きさだけでは流出とは判断できません。今回は社内の管理された送信先へ、予定された量の全量複製が完了しています。送信元・送信先・ジョブID・作業予定の照合が判断の根拠です。",
        "lessons": [
          "大量通信では送信先と処理の目的を確認します。",
          "「バックアップ」という名前だけでなく、実行内容を予定と比較します。"
        ]
      },
      "hints": [
        "送信先の名前とIPを、資産資料で確認してください。",
        "作業予定のジョブID・ファイル数・容量をログと比較します。",
        "整合性確認ログと作業予定を証拠に登録すると、正当な処理と説明できます。"
      ]
    },
    {
      "id": "low-mail-rule",
      "scenarioId": "low",
      "difficulty": "low",
      "title": "受信メールの転送設定が追加された",
      "subtitle": "経理メール / MAIL-FIN-04",
      "host": "mail-fin-04",
      "user": "a.yano",
      "source": "メール",
      "severity": "high",
      "critical": true,
      "context": "経理担当のメールボックスに転送ルールが追加されました。転送先と実際の配信、利用者の意図を確認してください。",
      "logs": [
        {
          "id": "low-mail-rule-log-01",
          "time": "10:05:00",
          "offset": 0,
          "source": "IdP",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "198.51.100.44",
          "event": "メールサービスにログイン",
          "raw": "2026-10-20T10:05:00Z host=mail-fin-04 user=a.yano session=MR-44 client=webmail src=198.51.100.44 result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "low-mail-rule-log-02",
          "time": "10:05:13",
          "offset": 0,
          "source": "メール",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "198.51.100.44",
          "event": "転送ルールを追加",
          "raw": "2026-10-20T10:05:13Z host=mail-fin-04 user=a.yano session=MR-44 action=create_rule rule=R-FWD-44 match=all forward_to=receipts@invoice-share.example enabled=true",
          "path": "/var/log/mail/audit.log"
        },
        {
          "id": "low-mail-rule-log-03",
          "time": "10:06:00",
          "offset": 0,
          "source": "メール",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "10.24.70.4",
          "event": "請求メールを受信",
          "raw": "2026-10-20T10:06:00Z host=mail-fin-04 user=a.yano message=MSG-4401 recipient=a.yano subject_class=invoice attachments=1",
          "path": "/var/log/mail/audit.log"
        },
        {
          "id": "low-mail-rule-log-04",
          "time": "10:06:01",
          "offset": 0,
          "source": "メール",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "198.51.100.45",
          "event": "追加ルールで外部へ転送",
          "raw": "2026-10-20T10:06:01Z host=mail-fin-04 user=a.yano message=MSG-4401 rule=R-FWD-44 recipient=receipts@invoice-share.example delivery=accepted external=true",
          "path": "/var/log/mail/audit.log"
        },
        {
          "id": "low-mail-rule-log-05",
          "time": "10:07:00",
          "offset": 0,
          "source": "メール",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "10.24.70.4",
          "event": "社内の通常配信",
          "raw": "2026-10-20T10:07:00Z host=mail-fin-04 user=a.yano message=MSG-4402 recipient=accounting-team.internal.example delivery=success rule=default",
          "path": "/var/log/mail/audit.log"
        },
        {
          "id": "low-mail-rule-log-06",
          "time": "10:08:00",
          "offset": 0,
          "source": "監査",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "10.24.70.4",
          "event": "現在の転送ルール状態",
          "raw": "2026-10-20T10:08:00Z host=mail-fin-04 user=a.yano mailbox=a.yano rule=R-FWD-44 state=enabled created_by_session=MR-44",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "low-mail-rule-log-07",
          "time": "10:08:10",
          "offset": 0,
          "source": "IdP",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "198.51.100.44",
          "event": "該当セッションは有効",
          "raw": "2026-10-20T10:08:10Z host=mail-fin-04 user=a.yano session=MR-44 account=a.yano state=active",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "low-mail-rule-log-08",
          "time": "10:09:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "mail-fin-04",
          "user": "a.yano",
          "ip": "10.24.0.9",
          "event": "メール監査の受信確認",
          "raw": "2026-10-20T10:09:00Z host=mail-fin-04 user=a.yano stream=mail-audit last_received=10:09:00 gaps=none",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "low-mail-rule-doc-asset",
          "title": "経理メールの利用規則",
          "kind": "資産・アカウント",
          "body": "mail-fin-04 は矢野 杏の経理業務用メールボックス。取引先の請求書を扱う。外部への自動転送は情報管理担当の承認が必要。invoice-share.example は社内のメールドメインでも承認済み転送先でもない。"
        },
        {
          "id": "low-mail-rule-doc-change",
          "title": "経理メールの設定変更一覧",
          "kind": "変更申請",
          "body": "10月20日午前の承認済み設定変更は、共有宛先 accounting-team.internal.example への社内振り分けのみ。外部への自動転送は申請されていない。緊急変更の有無はアカウント所有者に確認する。"
        }
      ],
      "contact": {
        "id": "low-mail-rule-contact",
        "name": "矢野 杏",
        "role": "経理担当・メール利用者",
        "question": "登録済みの社内連絡先で、転送ルールを設定したか確認する",
        "replyId": "low-mail-rule-reply",
        "replyTitle": "矢野からの回答：転送先と操作の確認",
        "replyText": "invoice-share.example は知りません。10:05のログインも転送ルールの追加も私の操作ではありません。経理メールの外部転送を誰かに依頼したこともありません。請求書を受信するアカウントなので、情報システム担当へ停止を依頼してください。",
        "delaySeconds": 25
      },
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "mail-fin-04",
        "evidenceGroups": [
          [
            "low-mail-rule-log-04"
          ],
          [
            "low-mail-rule-reply"
          ]
        ],
        "summary": "本人が否定する転送ルール R-FWD-44 により、請求メール MSG-4401 が未承認の外部宛先へ配信された。ルールと該当セッションは現在も有効である。",
        "nextStep": "メール管理担当へ高優先度で連携し、ルール停止・セッション失効・アカウント保護を依頼する。既に転送されたメールの範囲と添付情報を調査する。",
        "explanation": "ルールの追加だけでなく、外部への実際の配信と本人の否定がそろっています。継続する転送を止める初動が必要です。確認できた1通を根拠に全メールの流出を断定せず、範囲を追加調査します。",
        "lessons": [
          "設定変更と、その設定が引き起こした動作を分けて確認します。",
          "動作が継続中なら、記録を保全して管理者へ停止を依頼します。"
        ]
      },
      "hints": [
        "転送ルールの作成ログだけでなく、delivery=accepted の配信記録を見てください。",
        "利用者に、該当ルールと転送先を知っているか確認します。",
        "外部配信のログと本人の回答を証拠に、ルールとセッションの停止を依頼します。"
      ]
    },
    {
      "id": "low-log-gap",
      "scenarioId": "low",
      "difficulty": "low",
      "title": "端末から届かなくなった監視ログ",
      "subtitle": "企画端末 / PLAN-LT-012",
      "host": "plan-lt-012",
      "user": "s.ishii",
      "source": "収集基盤",
      "severity": "medium",
      "critical": false,
      "context": "企画端末の監視ログが途絶えました。監視基盤全体の障害なのか、端末側の問題なのか、現時点で確認できる範囲を整理してください。",
      "logs": [
        {
          "id": "low-log-gap-log-01",
          "time": "10:15:00",
          "offset": 0,
          "source": "EDR",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.50.12",
          "event": "端末の最終ハートビート",
          "raw": "2026-10-20T10:15:00Z host=plan-lt-012 user=s.ishii device=PLAN-LT-012 agent_version=7.2 state=healthy detections=0",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "low-log-gap-log-02",
          "time": "10:16:00",
          "offset": 0,
          "source": "Proxy",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.50.12",
          "event": "社内ドキュメントへの通信",
          "raw": "2026-10-20T10:16:00Z host=plan-lt-012 user=s.ishii src=10.24.50.12 dst=planning.internal.example status=200 bytes=4912",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "low-log-gap-log-03",
          "time": "10:20:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.0.9",
          "event": "ハートビートの未着を検知",
          "raw": "2026-10-20T10:20:00Z host=plan-lt-012 user=s.ishii device=PLAN-LT-012 stream=edr last_received=10:15:00 missed=3",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "low-log-gap-log-04",
          "time": "10:21:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.0.9",
          "event": "他端末の受信状態を確認",
          "raw": "2026-10-20T10:21:00Z host=plan-lt-012 user=s.ishii scope=planning-floor healthy_devices=19 affected_devices=PLAN-LT-012 collector=healthy",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "low-log-gap-log-05",
          "time": "10:21:10",
          "offset": 0,
          "source": "MDM",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.0.9",
          "event": "端末への状態確認がタイムアウト",
          "raw": "2026-10-20T10:21:10Z host=plan-lt-012 user=s.ishii device=PLAN-LT-012 request=PING-12 result=timeout reason=unreachable",
          "path": "/var/log/security/mdm.log"
        },
        {
          "id": "low-log-gap-log-06",
          "time": "10:22:00",
          "offset": 0,
          "source": "Proxy",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.50.12",
          "event": "最後の通信時刻を集計",
          "raw": "2026-10-20T10:22:00Z host=plan-lt-012 user=s.ishii src=10.24.50.12 last_seen=10:16:00 current_traffic=none",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "low-log-gap-log-07",
          "time": "10:22:10",
          "offset": 0,
          "source": "収集基盤",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.0.9",
          "event": "停止理由は収集されていない",
          "raw": "2026-10-20T10:22:10Z host=plan-lt-012 user=s.ishii device=PLAN-LT-012 shutdown_event=not_received agent_stop_event=not_received",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "low-log-gap-log-08",
          "time": "10:23:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "plan-lt-012",
          "user": "s.ishii",
          "ip": "10.24.0.9",
          "event": "未着状態が継続",
          "raw": "2026-10-20T10:23:00Z host=plan-lt-012 user=s.ishii device=PLAN-LT-012 stream=edr state=missing current_state=unknown",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "low-log-gap-doc-asset",
          "title": "企画端末の管理台帳",
          "kind": "資産・アカウント",
          "body": "plan-lt-012 は石井 咲の企画業務端末。社内の一般資料を扱う。端末の電源断、ネットワーク断、エージェント停止はいずれもログ未着の原因になり得る。現在の電源状態とエージェント状態は、端末での確認が必要。"
        },
        {
          "id": "low-log-gap-doc-procedure",
          "title": "単一端末の監視欠落時の確認手順",
          "kind": "対応手順",
          "body": "収集基盤と他端末の受信を確認し、所有者または端末管理担当に電源・回線・エージェントの確認を依頼する。攻撃を示す証拠がなくても監視欠落を放置しない。復旧するまで原因は確定せず、欠落期間を記録する。"
        }
      ],
      "contact": {
        "id": "low-log-gap-contact",
        "name": "尾形 航",
        "role": "端末管理担当",
        "question": "端末の電源・接続・エージェント状態を確認してもらう",
        "replyId": "low-log-gap-reply",
        "replyTitle": "尾形からの回答：端末確認の進捗",
        "replyText": "収集サーバーには異常がなく、同じ部署の19台からは受信しています。石井さんは会議中で、端末の画面や電源状態はまだ確認できていません。管理サービスからも到達できません。電源断か故障か、意図的な停止かは今の情報では判断できません。端末確認のチケットを受け付けます。",
        "delaySeconds": 20
      },
      "answer": {
        "verdict": "unknown",
        "priorities": [
          "medium"
        ],
        "actions": [
          "escalate"
        ],
        "target": "plan-lt-012",
        "evidenceGroups": [
          [
            "low-log-gap-log-03",
            "low-log-gap-log-07",
            "low-log-gap-log-08"
          ],
          [
            "low-log-gap-reply"
          ]
        ],
        "summary": "plan-lt-012 の監視ログが10:15以降未着で、管理サービスからも到達できない。他端末は正常だが、対象の電源・回線・エージェント状態は未確認で、停止原因は判断できない。",
        "nextStep": "端末管理担当へ確認を引き継ぎ、端末の状態と監視復旧を追跡する。欠落期間を記録し、復旧後にローカルログを回収する。",
        "explanation": "ログの欠落は攻撃の証明でも安全の証明でもありません。単一端末の監視不能を認識し、確認できていない理由を示して追加調査へつなぎます。現在の証拠から端末隔離を必須とする根拠はありません。",
        "lessons": [
          "観測できない期間を明確にします。",
          "正常か攻撃かを無理に決めず、確認先と調査内容を具体化します。"
        ]
      },
      "hints": [
        "監視基盤全体と、対象端末だけの状態を分けて確認してください。",
        "端末管理担当から、電源やエージェントを確認できたか聞きます。",
        "未着ログと担当者の回答を根拠に、原因を断定せず端末確認へ引き継ぎます。"
      ]
    },
    {
      "id": "medium-mfa-fatigue",
      "scenarioId": "medium",
      "difficulty": "medium",
      "title": "連続する承認要求のあとに成功した認証",
      "subtitle": "財務認証 / IDP-FINANCE-01",
      "host": "idp-finance-01",
      "user": "r.mizuno",
      "source": "IdP",
      "severity": "high",
      "critical": true,
      "context": "財務担当者に短時間で複数のMFA承認要求が送られ、そのうち1件が承認されました。端末と要求の対応、認証後の操作を追い、本人へ確認してください。",
      "logs": [
        {
          "id": "medium-mfa-fatigue-log-01",
          "time": "11:00:00",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "10.24.80.22",
          "event": "登録端末からの通常ログイン",
          "raw": "2026-10-20T11:00:00Z host=idp-finance-01 user=r.mizuno device=FIN-LT-022 src=10.24.80.22 session=MF-NORMAL factor=device_certificate result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-mfa-fatigue-log-02",
          "time": "11:03:01",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "新しい接続元でパスワード認証",
          "raw": "2026-10-20T11:03:01Z host=idp-finance-01 user=r.mizuno device=unregistered src=203.0.113.122 request=MF-701 password_result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-mfa-fatigue-log-03",
          "time": "11:03:05",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "MFA要求を送信",
          "raw": "2026-10-20T11:03:05Z host=idp-finance-01 user=r.mizuno request=MF-701 factor=push number_match=not_enabled delivery=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-mfa-fatigue-log-04",
          "time": "11:03:10",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "利用者が承認を拒否",
          "raw": "2026-10-20T11:03:10Z host=idp-finance-01 user=r.mizuno request=MF-701 factor=push result=denied",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-mfa-fatigue-log-05",
          "time": "11:04:20",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "承認要求が繰り返された",
          "raw": "2026-10-20T11:04:20Z host=idp-finance-01 user=r.mizuno request_series=MF-702..MF-707 src=203.0.113.122 push_requests=6 denied=6",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-mfa-fatigue-log-06",
          "time": "11:05:02",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "同じ接続元の要求が承認された",
          "raw": "2026-10-20T11:05:02Z host=idp-finance-01 user=r.mizuno request=MF-708 src=203.0.113.122 factor=push result=approved session=MF-FOREIGN device=unregistered",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-mfa-fatigue-log-07",
          "time": "11:05:05",
          "offset": 0,
          "source": "Web",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "財務ポータルを表示",
          "raw": "2026-10-20T11:05:05Z host=idp-finance-01 user=r.mizuno session=MF-FOREIGN request=PAY-81 path=/payments/payees status=200",
          "path": "/var/log/web/access.log"
        },
        {
          "id": "medium-mfa-fatigue-log-08",
          "time": "11:05:20",
          "offset": 0,
          "source": "監査",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "支払先一覧を出力",
          "raw": "2026-10-20T11:05:20Z host=idp-finance-01 user=r.mizuno session=MF-FOREIGN request=PAY-82 action=payee_export records=218 result=success export=EXP-81",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-mfa-fatigue-log-09",
          "time": "11:05:22",
          "offset": 0,
          "source": "Web",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "同じセッションへ出力を返却",
          "raw": "2026-10-20T11:05:22Z host=idp-finance-01 user=r.mizuno session=MF-FOREIGN export=EXP-81 path=/exports/EXP-81 status=200 bytes=42891",
          "path": "/var/log/web/access.log"
        },
        {
          "id": "medium-mfa-fatigue-log-10",
          "time": "11:06:00",
          "offset": 0,
          "source": "Proxy",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "10.24.80.22",
          "event": "登録端末の継続通信",
          "raw": "2026-10-20T11:06:00Z host=idp-finance-01 user=r.mizuno device=FIN-LT-022 session=MF-NORMAL dst=calendar.internal.example status=200",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "medium-mfa-fatigue-log-11",
          "time": "11:06:20",
          "offset": 0,
          "source": "監査",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "10.24.80.22",
          "event": "同時間帯の別セッションの操作",
          "raw": "2026-10-20T11:06:20Z host=idp-finance-01 user=r.mizuno session=MF-NORMAL action=view_calendar result=success finance_export=none",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-mfa-fatigue-log-12",
          "time": "11:07:00",
          "offset": 0,
          "source": "IdP",
          "host": "idp-finance-01",
          "user": "r.mizuno",
          "ip": "203.0.113.122",
          "event": "未登録端末のセッション状態",
          "raw": "2026-10-20T11:07:00Z host=idp-finance-01 user=r.mizuno session=MF-FOREIGN state=active last_activity=11:05:22 expires=19:05:02",
          "path": "/var/log/identity/idp.log"
        }
      ],
      "documents": [
        {
          "id": "medium-mfa-fatigue-doc-asset",
          "title": "財務アカウントと端末の台帳",
          "kind": "資産・アカウント",
          "body": "r.mizuno の登録端末は FIN-LT-022。財務ポータルで支払先一覧の参照・出力が可能。支払の確定権限はない。新端末や緊急の代理操作は担当責任者の申請が必要。"
        },
        {
          "id": "medium-mfa-fatigue-doc-workflow",
          "title": "MFA通知の取扱い",
          "kind": "運用手順",
          "body": "自身が開始していない承認要求は拒否し、SOCへ連絡する。MFAの承認記録は認証要素を通過した事実を示すが、本人がその接続を意図したことまでは証明しない。繰り返された通知も要求IDと接続元を追跡する。"
        },
        {
          "id": "medium-mfa-fatigue-doc-change",
          "title": "本日の財務アクセス申請",
          "kind": "変更申請",
          "body": "10月20日11:00〜12:00の新端末・外部経路からの操作申請はなし。通常業務は FIN-LT-022 から実施。支払先一覧の共有が必要な場合も、担当者と依頼票を確認する。"
        }
      ],
      "contact": {
        "id": "medium-mfa-fatigue-contact",
        "name": "水野 梨奈",
        "role": "財務担当・アカウント所有者",
        "question": "登録済みの連絡先で、MFAの承認理由と一覧出力の実施を確認する",
        "replyId": "medium-mfa-fatigue-reply",
        "replyTitle": "水野からの回答：通知とポータル操作",
        "replyText": "11時から社内の FIN-LT-022 で仕事をしています。突然通知が続き、最初は拒否しましたが止まらないので最後に1回承認してしまいました。社外からの接続や、支払先一覧の出力はしていません。MF-FOREIGN の操作は私のものではありません。",
        "delaySeconds": 40
      },
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "idp-finance-01",
        "evidenceGroups": [
          [
            "medium-mfa-fatigue-log-06"
          ],
          [
            "medium-mfa-fatigue-log-08",
            "medium-mfa-fatigue-log-09"
          ],
          [
            "medium-mfa-fatigue-reply"
          ]
        ],
        "summary": "繰り返し拒否された接続元の要求 MF-708 が承認され、未登録端末のセッション MF-FOREIGN が成立した。同じセッションで支払先218件が出力・返却され、本人はその接続と出力を否定している。",
        "nextStep": "ID・財務システム担当へ即時連携し、MF-FOREIGN の失効とアカウント保護を依頼する。出力内容と他操作を調査し、MFAの再登録・通知対策を検討する。",
        "explanation": "MFA成功だけを根拠に正当なアクセスとはできません。今回は承認した理由、本人が否定する接続、同一セッションのデータ出力がそろっています。記録にない支払変更や全社侵害まで断定する必要はありません。",
        "lessons": [
          "要求IDからセッションIDへつなぎ、認証後の行動まで追います。",
          "本人の意図は認証ログだけでは分かりません。",
          "異なるセッションの正常業務を不正セッションの説明に使いません。"
        ]
      },
      "hints": [
        "拒否された要求と承認された要求の接続元を比較してください。",
        "MF-FOREIGN と MF-NORMAL を混同せず、財務データ出力を行ったセッションを特定します。",
        "認証成功、同じセッションの出力、本人の否定という3種類の根拠を登録します。"
      ]
    },
    {
      "id": "medium-oauth-consent",
      "scenarioId": "medium",
      "difficulty": "medium",
      "title": "外部アプリへの同意後に増えたメールAPI利用",
      "subtitle": "連携管理 / SAAS-CONNECT-01",
      "host": "saas-connect-01",
      "user": "n.ando",
      "source": "SaaS",
      "severity": "high",
      "critical": true,
      "context": "新しい連携アプリへの同意が記録され、その直後からメールAPIの利用が増えました。アプリID、付与権限、APIを使った主体を照合してください。",
      "logs": [
        {
          "id": "medium-oauth-consent-log-01",
          "time": "11:20:00",
          "offset": 0,
          "source": "IdP",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "10.24.20.32",
          "event": "通常端末でSaaSへ認証",
          "raw": "2026-10-20T11:20:00Z host=saas-connect-01 user=n.ando device=SA-LT-032 session=OA-USER result=success src=10.24.20.32",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-oauth-consent-log-02",
          "time": "11:22:00",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "10.24.20.32",
          "event": "外部アプリの同意画面を表示",
          "raw": "2026-10-20T11:22:00Z host=saas-connect-01 user=n.ando session=OA-USER application=Meeting-Helper app_id=APP-772 publisher=unverified",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-03",
          "time": "11:22:12",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "10.24.20.32",
          "event": "メール読取権限を付与",
          "raw": "2026-10-20T11:22:12Z host=saas-connect-01 user=n.ando session=OA-USER action=consent app_id=APP-772 grant=G-772 scopes=Mail.Read,offline_access result=success",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-04",
          "time": "11:22:14",
          "offset": 0,
          "source": "IdP",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "198.51.100.172",
          "event": "アプリ用のトークンを発行",
          "raw": "2026-10-20T11:22:14Z host=saas-connect-01 user=n.ando app_id=APP-772 grant=G-772 token_ref=T-772 actor=delegated_app result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-oauth-consent-log-05",
          "time": "11:23:00",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "198.51.100.172",
          "event": "連携アプリがメール一覧を取得",
          "raw": "2026-10-20T11:23:00Z host=saas-connect-01 user=n.ando app_id=APP-772 token_ref=T-772 request=API-7721 operation=messages.list items=100 status=200",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-06",
          "time": "11:23:08",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "198.51.100.172",
          "event": "同じアプリが本文を取得",
          "raw": "2026-10-20T11:23:08Z host=saas-connect-01 user=n.ando app_id=APP-772 token_ref=T-772 request=API-7722 operation=messages.read mailbox=n.ando items=100 status=200",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-07",
          "time": "11:23:20",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "198.51.100.172",
          "event": "メールAPI利用量が増加",
          "raw": "2026-10-20T11:23:20Z host=saas-connect-01 user=n.ando app_id=APP-772 token_ref=T-772 operation=messages.read total_items=540 rule=MAIL_API_BURST",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-08",
          "time": "11:24:00",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "192.0.2.10",
          "event": "既存の予定表アプリが同期",
          "raw": "2026-10-20T11:24:00Z host=saas-connect-01 user=n.ando app_id=APP-CALENDAR-10 operation=calendar.read items=12 status=200",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-09",
          "time": "11:24:10",
          "offset": 0,
          "source": "IdP",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "10.24.20.32",
          "event": "利用者がブラウザをサインアウト",
          "raw": "2026-10-20T11:24:10Z host=saas-connect-01 user=n.ando session=OA-USER action=logout result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-oauth-consent-log-10",
          "time": "11:24:50",
          "offset": 0,
          "source": "IdP",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "198.51.100.172",
          "event": "連携アプリがトークンを更新",
          "raw": "2026-10-20T11:24:50Z host=saas-connect-01 user=n.ando app_id=APP-772 grant=G-772 operation=refresh_token result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-oauth-consent-log-11",
          "time": "11:25:00",
          "offset": 0,
          "source": "SaaS",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "198.51.100.172",
          "event": "サインアウト後もメールを取得",
          "raw": "2026-10-20T11:25:00Z host=saas-connect-01 user=n.ando app_id=APP-772 grant=G-772 operation=messages.read items=20 status=200",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-oauth-consent-log-12",
          "time": "11:26:00",
          "offset": 0,
          "source": "監査",
          "host": "saas-connect-01",
          "user": "n.ando",
          "ip": "10.24.0.9",
          "event": "付与権限は現在も有効",
          "raw": "2026-10-20T11:26:00Z host=saas-connect-01 user=n.ando app_id=APP-772 grant=G-772 state=active scopes=Mail.Read,offline_access revoked=false",
          "path": "/var/log/audit/audit.log"
        }
      ],
      "documents": [
        {
          "id": "medium-oauth-consent-doc-asset",
          "title": "メール連携の承認台帳",
          "kind": "資産・アカウント",
          "body": "許可された予定表アプリは APP-CALENDAR-10。予定表の参照権限のみを使用する。APP-772 / Meeting-Helper は未審査で、メール本文の取得や長期利用権限は承認されていない。表示名だけで既存アプリと同一とは判断しない。"
        },
        {
          "id": "medium-oauth-consent-doc-scope",
          "title": "連携トークンの取扱い",
          "kind": "運用手順",
          "body": "Mail.Read はメール本文を読む権限。offline_access の同意により、利用者のブラウザがサインアウトした後もアプリがトークンを更新できる。不要な連携はアプリ同意・付与権限・関連トークンを管理者が失効させる。"
        },
        {
          "id": "medium-oauth-consent-doc-ticket",
          "title": "営業推進部の業務依頼一覧",
          "kind": "業務依頼",
          "body": "当日の依頼は既存の予定表同期のみ。メール本文の一括収集、外部連携先への移管、Meeting-Helper の導入依頼はない。新しい連携の権限は情報システム部が審査する。"
        }
      ],
      "contact": {
        "id": "medium-oauth-consent-contact",
        "name": "安藤 奈々",
        "role": "営業推進・アカウント所有者",
        "question": "同意した目的と、メール本文の利用を依頼したか確認する",
        "replyId": "medium-oauth-consent-reply",
        "replyTitle": "安藤からの回答：アプリ導入の経緯",
        "replyText": "会議の時刻を表示できるという案内から Meeting-Helper に同意しましたが、メールの本文を読むつもりはありませんでした。APP-772 の導入申請もしていません。気付いて11:24にサインアウトしました。本文の一括取得は業務として依頼しておらず、この連携は止めたいです。",
        "delaySeconds": 45
      },
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "saas-connect-01",
        "evidenceGroups": [
          [
            "medium-oauth-consent-log-03",
            "medium-oauth-consent-log-12"
          ],
          [
            "medium-oauth-consent-log-06",
            "medium-oauth-consent-log-07",
            "medium-oauth-consent-log-11"
          ],
          [
            "medium-oauth-consent-reply"
          ]
        ],
        "summary": "未審査アプリ APP-772 にメール読取と継続利用の権限が付与され、同じアプリがメール本文を大量に取得した。本人は本文取得を意図・依頼しておらず、サインアウト後も連携が継続している。",
        "nextStep": "SaaS管理者へ即時連携し、APP-772 の同意・付与権限・関連トークンの失効を依頼する。取得対象メールと同じアプリへ同意した他利用者を調査する。",
        "explanation": "本人が同意ボタンを押していても、未承認のアプリによる意図しないメール取得を放置できません。アプリIDを軸に同意とAPI利用を結び、利用者セッションの終了だけで対処済みとしないことが重要です。",
        "lessons": [
          "表示名ではなくアプリIDと付与権限で照合します。",
          "利用者のブラウザセッションとアプリの権限を区別します。",
          "業務上の意図と実際に付与した権限の差を確認します。"
        ]
      },
      "hints": [
        "APP-772 と既存の APP-CALENDAR-10 を分けて見てください。",
        "G-772 の権限付与後にどのAPIが使われたか、サインアウト後も追います。",
        "権限、実際の本文取得、本人の意図を示す3種類の証拠を登録し、連携の失効を依頼します。"
      ]
    },
    {
      "id": "medium-bulk-upload",
      "scenarioId": "medium",
      "difficulty": "medium",
      "title": "設計共有領域からの大容量送信",
      "subtitle": "設計共有 / DESIGN-FS-02",
      "host": "design-fs-02",
      "user": "svc-project-sync",
      "source": "DLP",
      "severity": "medium",
      "critical": false,
      "context": "設計共有サーバーから外部ストレージへの送信が検知されました。承認された共同作業の可能性もあります。送信先のテナント、対象データ、実行担当の記録を照合してください。",
      "logs": [
        {
          "id": "medium-bulk-upload-log-01",
          "time": "12:00:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "10.24.90.12",
          "event": "プロジェクト同期を開始",
          "raw": "2026-10-20T12:00:00Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 ticket=REQ-3210 project=P42 dataset=release-candidate",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-bulk-upload-log-02",
          "time": "12:00:03",
          "offset": 0,
          "source": "IdP",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "10.24.90.12",
          "event": "同期用サービスが認証",
          "raw": "2026-10-20T12:00:03Z host=design-fs-02 user=svc-project-sync account=svc-project-sync scope=project-P42.write tenant=TEN-PARTNER-42 result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-bulk-upload-log-03",
          "time": "12:01:00",
          "offset": 0,
          "source": "DNS",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "192.0.2.142",
          "event": "外部ストレージの名前解決",
          "raw": "2026-10-20T12:01:00Z host=design-fs-02 user=svc-project-sync query=design-share.example answer=192.0.2.142 result=success",
          "path": "/var/log/network/dns.log"
        },
        {
          "id": "medium-bulk-upload-log-04",
          "time": "12:01:05",
          "offset": 0,
          "source": "Proxy",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "192.0.2.142",
          "event": "外部ストレージへの接続",
          "raw": "2026-10-20T12:01:05Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 dst=design-share.example dst_ip=192.0.2.142 tenant=TEN-PARTNER-42 bucket=project-P42/review",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "medium-bulk-upload-log-05",
          "time": "12:01:10",
          "offset": 0,
          "source": "監査",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "10.24.90.12",
          "event": "送信するデータの一覧を確定",
          "raw": "2026-10-20T12:01:10Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 manifest=MAN-P42-10 files=86 dataset=release-candidate classification=partner-share redactions=verified",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-bulk-upload-log-06",
          "time": "12:03:00",
          "offset": 0,
          "source": "DLP",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "192.0.2.142",
          "event": "大量の外部送信を検知",
          "raw": "2026-10-20T12:03:00Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 rule=EXTERNAL_BULK data_label=partner-share bytes_out=2147483648 action=alert_only",
          "path": "/var/log/security/dlp.log"
        },
        {
          "id": "medium-bulk-upload-log-07",
          "time": "12:04:10",
          "offset": 0,
          "source": "ジョブ",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "192.0.2.142",
          "event": "同期待ちの項目を再送",
          "raw": "2026-10-20T12:04:10Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 object=drawing-014.pdf retry=1 result=success duplicate_content=false",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-bulk-upload-log-08",
          "time": "12:06:00",
          "offset": 0,
          "source": "Proxy",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "10.24.90.31",
          "event": "別ジョブの社内通信",
          "raw": "2026-10-20T12:06:00Z host=design-fs-02 user=svc-project-sync job=DESIGN-INDEX dst=search.internal.example bytes_out=94211 status=200",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "medium-bulk-upload-log-09",
          "time": "12:07:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "192.0.2.142",
          "event": "転送完了を確認",
          "raw": "2026-10-20T12:07:00Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 manifest=MAN-P42-10 files=86 bytes=3221225472 tenant=TEN-PARTNER-42 checksum_match=true result=success",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-bulk-upload-log-10",
          "time": "12:07:10",
          "offset": 0,
          "source": "SaaS",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "192.0.2.142",
          "event": "共有先のアクセス制御を記録",
          "raw": "2026-10-20T12:07:10Z host=design-fs-02 user=svc-project-sync tenant=TEN-PARTNER-42 bucket=project-P42/review public_access=false members=project-P42-approved expiry=2026-10-27",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-bulk-upload-log-11",
          "time": "12:08:00",
          "offset": 0,
          "source": "監査",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "10.24.90.12",
          "event": "共同作業領域以外は送信なし",
          "raw": "2026-10-20T12:08:00Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 manifest=MAN-P42-10 non_project_files=0 internal_only_files=0",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-bulk-upload-log-12",
          "time": "12:09:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "design-fs-02",
          "user": "svc-project-sync",
          "ip": "10.24.90.12",
          "event": "同期ジョブを終了",
          "raw": "2026-10-20T12:09:00Z host=design-fs-02 user=svc-project-sync job=SYNC-P42 phase=end result=success",
          "path": "/var/log/jobs/scheduler.log"
        }
      ],
      "documents": [
        {
          "id": "medium-bulk-upload-doc-asset",
          "title": "設計共有サーバーの運用台帳",
          "kind": "資産・アカウント",
          "body": "design-fs-02 は共同開発と社内専用の両方の設計資料を保持する。外部共有はプロジェクトごとに審査し、ファイル単位の送信一覧を残す。ホスト名だけで全データの外部共有を許可しない。"
        },
        {
          "id": "medium-bulk-upload-doc-approval",
          "title": "共同開発の共有承認 REQ-3210",
          "kind": "業務承認",
          "body": "承認済み。10月20日12:00〜12:30、P42の公開前レビュー用資料86ファイル・3GiBを送信する。対象一覧 MAN-P42-10、匿名化確認済み。送信先 design-share.example の TEN-PARTNER-42 / project-P42/review に限定。公開リンクは禁止し、承認されたP42参加者のみが10月27日まで利用する。担当は柏木。"
        },
        {
          "id": "medium-bulk-upload-doc-destination",
          "title": "共同開発ストレージの契約台帳",
          "kind": "資産・契約",
          "body": "design-share.example は契約した外部ストレージ。TEN-PARTNER-42 はP42の共同開発契約にひも付く専用テナント。ホスティングサービスのドメインが同じでも、別テナントは未承認となる。"
        }
      ],
      "contact": {
        "id": "medium-bulk-upload-contact",
        "name": "柏木 美月",
        "role": "共同開発・データ共有責任者",
        "question": "送信一覧、テナント、アクセス制限が承認どおりか確認する",
        "replyId": "medium-bulk-upload-reply",
        "replyTitle": "柏木からの回答：共有処理の確認",
        "replyText": "REQ-3210 の依頼者です。MAN-P42-10 の86ファイルを私が確認し、社内専用情報を含まないレビュー版を送信しました。TEN-PARTNER-42 の指定領域へ3GiBを転送済みで、参加者限定・期限付きの設定も確認しました。他のテナントや公開リンクは利用していません。",
        "delaySeconds": 50
      },
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low",
          "medium"
        ],
        "actions": [
          "close"
        ],
        "target": "design-fs-02",
        "evidenceGroups": [
          [
            "medium-bulk-upload-log-09"
          ],
          [
            "medium-bulk-upload-doc-approval"
          ],
          [
            "medium-bulk-upload-reply"
          ]
        ],
        "summary": "外部送信は REQ-3210 で承認されたP42レビュー資料の共有だった。送信一覧・件数・容量、専用テナントと領域が一致し、担当責任者も参加者限定・期限付きの共有を確認している。",
        "nextStep": "承認票と実行記録、担当者確認を添えてクローズする。期限後の共有終了を業務担当の作業として引き継ぐ。",
        "explanation": "外部宛てという理由だけでインシデントとは限りません。今回は送信先ドメインだけでなく、テナント・送信一覧・アクセス条件まで承認内容と一致しています。サービス全体を許可対象に広げる必要はありません。",
        "lessons": [
          "外部ストレージはテナントや共有領域まで確認します。",
          "データの範囲と公開範囲の両方を照合します。",
          "許可された一度の送信を、将来の送信全体の許可と混同しません。"
        ]
      },
      "hints": [
        "外部ストレージのドメインだけでなく、テナントIDを資料と比較してください。",
        "MAN-P42-10 の件数・容量・アクセス条件が実行記録と一致するか確認します。",
        "実行ログ、共有承認、責任者の回答という3種類の根拠を登録します。"
      ]
    },
    {
      "id": "medium-waf-import",
      "scenarioId": "medium",
      "difficulty": "medium",
      "title": "CSV取込で繰り返されたWAF検知",
      "subtitle": "物流ポータル / LOGISTICS-WEB-03",
      "host": "logistics-web-03",
      "user": "svc-csv-import",
      "source": "WAF",
      "severity": "medium",
      "critical": false,
      "context": "物流ポータルのCSV取込でWAFが攻撃パターンを検知しています。一方で同時刻には成功したWeb要求もあります。要求IDを分け、遮断対象と実際の処理結果を確認してください。",
      "logs": [
        {
          "id": "medium-waf-import-log-01",
          "time": "12:30:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "配送データ取込を開始",
          "raw": "2026-10-20T12:30:00Z host=logistics-web-03 user=svc-csv-import job=IMP-330 ticket=OPS-3220 source=partner-csv manifest=CSV-330 rows=1200",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-waf-import-log-02",
          "time": "12:30:10",
          "offset": 0,
          "source": "WAF",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "取込要求の文字列を検知",
          "raw": "2026-10-20T12:30:10Z host=logistics-web-03 user=svc-csv-import request=CSV-REQ-31 path=/api/import/csv rule=SQL_PATTERN field=delivery_note action=block matched_fragment=union_sample query_executed=unknown",
          "path": "/var/log/web/waf.log"
        },
        {
          "id": "medium-waf-import-log-03",
          "time": "12:30:10",
          "offset": 0,
          "source": "Web",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "対象要求へ遮断応答",
          "raw": "2026-10-20T12:30:10Z host=logistics-web-03 user=svc-csv-import request=CSV-REQ-31 path=/api/import/csv status=403 upstream_forwarded=false",
          "path": "/var/log/web/access.log"
        },
        {
          "id": "medium-waf-import-log-04",
          "time": "12:31:00",
          "offset": 0,
          "source": "WAF",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "同じデータの再試行を遮断",
          "raw": "2026-10-20T12:31:00Z host=logistics-web-03 user=svc-csv-import request=CSV-REQ-32 payload_manifest=CSV-330 rule=SQL_PATTERN action=block",
          "path": "/var/log/web/waf.log"
        },
        {
          "id": "medium-waf-import-log-05",
          "time": "12:31:00",
          "offset": 0,
          "source": "Web",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "再試行もアプリへ未転送",
          "raw": "2026-10-20T12:31:00Z host=logistics-web-03 user=svc-csv-import request=CSV-REQ-32 status=403 upstream_forwarded=false",
          "path": "/var/log/web/access.log"
        },
        {
          "id": "medium-waf-import-log-06",
          "time": "12:31:05",
          "offset": 0,
          "source": "Web",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.0.8",
          "event": "別要求の通常ヘルスチェック",
          "raw": "2026-10-20T12:31:05Z host=logistics-web-03 user=svc-csv-import request=HEALTH-330 path=/health status=200 upstream_forwarded=true actor=monitor",
          "path": "/var/log/web/access.log"
        },
        {
          "id": "medium-waf-import-log-07",
          "time": "12:32:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "取込処理を待機へ変更",
          "raw": "2026-10-20T12:32:00Z host=logistics-web-03 user=svc-csv-import job=IMP-330 manifest=CSV-330 imported_rows=0 status=waiting reason=edge_block",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-waf-import-log-08",
          "time": "12:33:00",
          "offset": 0,
          "source": "監査",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "対象ジョブのDB操作状況",
          "raw": "2026-10-20T12:33:00Z host=logistics-web-03 user=svc-csv-import job=IMP-330 request_ids=CSV-REQ-31,CSV-REQ-32 db_queries=0 audit_coverage=complete",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-waf-import-log-09",
          "time": "12:34:00",
          "offset": 0,
          "source": "監査",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "別ジョブの参照処理",
          "raw": "2026-10-20T12:34:00Z host=logistics-web-03 user=svc-csv-import job=ROUTE-LOOKUP actor=svc-route query_type=prepared_select rows=24 result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-waf-import-log-10",
          "time": "12:34:20",
          "offset": 0,
          "source": "ジョブ",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "入力内容の再検証",
          "raw": "2026-10-20T12:34:20Z host=logistics-web-03 user=svc-csv-import job=IMP-330 manifest=CSV-330 schema_valid=true formula_fields=0 executable_fields=0 field=delivery_note type=quoted_text",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-waf-import-log-11",
          "time": "12:35:00",
          "offset": 0,
          "source": "EDR",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.100.23",
          "event": "アプリプロセスの稼働状況",
          "raw": "2026-10-20T12:35:00Z host=logistics-web-03 user=svc-csv-import service=csv-import worker=healthy unexpected_child_processes=0",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "medium-waf-import-log-12",
          "time": "12:36:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "logistics-web-03",
          "user": "svc-csv-import",
          "ip": "10.24.0.9",
          "event": "関連監査の到着確認",
          "raw": "2026-10-20T12:36:00Z host=logistics-web-03 user=svc-csv-import streams=waf,web,db-audit job=IMP-330 gaps=none",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "medium-waf-import-doc-asset",
          "title": "CSV取込の処理仕様",
          "kind": "資産・アプリ仕様",
          "body": "logistics-web-03 の /api/import/csv は配送データを受信する。配送メモ delivery_note は引用符付きの文字列として検証し、SQLのパラメーターへ渡す。WAFで遮断された要求はアプリに転送されない。Webの200応答は要求IDごとに確認する。"
        },
        {
          "id": "medium-waf-import-doc-job",
          "title": "取込依頼 OPS-3220",
          "kind": "業務依頼",
          "body": "承認済み。10月20日12:30、配送データ CSV-330 の1,200行をジョブ IMP-330 で取り込む。備考には取引先の商品名「Union Sample Pack」が含まれる。送信元は10.24.100.23。取込失敗時は内容と遮断理由を確認し、WAFの全体無効化は行わない。"
        },
        {
          "id": "medium-waf-import-doc-inspection",
          "title": "入力ファイルの確認記録",
          "kind": "検証記録",
          "body": "CSV-330 を取得元の原本と照合した結果、件数・識別子が一致している。該当欄の union_sample は配送メモの商品名を正規化した文字列で、命令文ではない。取り込み担当は原本を保管している。今回のデータに限定した検知見直しは、Web防御担当がレビューする。"
        }
      ],
      "contact": {
        "id": "medium-waf-import-contact",
        "name": "宮本 修",
        "role": "物流データ取込担当",
        "question": "入力の出所と遮断された要求、成功した要求の関係を確認する",
        "replyId": "medium-waf-import-reply",
        "replyTitle": "宮本からの回答：取込要求と原本の確認",
        "replyText": "IMP-330 は OPS-3220 の定期取込で、CSV-REQ-31 と CSV-REQ-32 は私たちの再試行です。原本の商品名がWAFのパターンに一致しています。HEALTH-330 は別の監視要求で、取込成功ではありません。CSVはまだ1行も取り込まれておらず、限定した調整をWeb防御担当へ依頼します。",
        "delaySeconds": 40
      },
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low",
          "medium"
        ],
        "actions": [
          "close"
        ],
        "target": "logistics-web-03",
        "evidenceGroups": [
          [
            "medium-waf-import-log-03",
            "medium-waf-import-log-05",
            "medium-waf-import-log-08"
          ],
          [
            "medium-waf-import-doc-job",
            "medium-waf-import-doc-inspection"
          ],
          [
            "medium-waf-import-reply"
          ]
        ],
        "summary": "WAF検知は承認済みの配送CSVに含まれる商品名への一致で、対象要求 CSV-REQ-31/32 はアプリへ未転送だった。200応答は別の監視要求で、原本確認と担当者の回答から正当な業務の遮断と判断できる。",
        "nextStep": "セキュリティの侵害調査は根拠を添えてクローズし、取込未完了を業務担当へ引き継ぐ。Web防御担当に対象を限定した検知調整を依頼する。",
        "explanation": "遮断されたから正当という判断ではありません。原本・業務依頼・担当者確認によって入力の意図と出所を確認でき、要求ID別のログでも攻撃成立を示す事実はありません。業務停止の解消は別途必要です。",
        "lessons": [
          "同じ時刻の403と200を同一要求と扱いません。",
          "検知文字列だけで入力の意味を断定しません。",
          "正当な業務への誤検知でも、防御機能全体の無効化は避けます。"
        ]
      },
      "hints": [
        "CSV-REQ-31/32 と HEALTH-330 を要求IDで分けて追ってください。",
        "配送メモの文字列が、業務依頼と原本確認の内容に一致するか照合します。",
        "遮断範囲のログ、業務または原本の資料、実施担当の回答を証拠に登録します。"
      ]
    },
    {
      "id": "medium-saas-gap",
      "scenarioId": "medium",
      "difficulty": "medium",
      "title": "管理権限の変更通知と途切れた監査",
      "subtitle": "人事SaaS / HR-SAAS-01",
      "host": "hr-saas-01",
      "user": "未確認",
      "source": "SaaS",
      "severity": "high",
      "critical": true,
      "context": "人事SaaSで管理ロールが変わったという通知が届きましたが、詳細監査の収集が止まっています。通知の確度と、確認できていない変更内容を整理してください。",
      "logs": [
        {
          "id": "medium-saas-gap-log-01",
          "time": "13:00:00",
          "offset": 0,
          "source": "SaaS",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "変更前の管理ロールを取得",
          "raw": "2026-10-20T13:00:00Z host=hr-saas-01 user=unknown snapshot=HR-SNAP-60 roles=hr.viewer:18,hr.admin:2 fetched_at=13:00:00 result=success",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-saas-gap-log-02",
          "time": "13:01:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "10.24.110.10",
          "event": "定期的な属性同期を開始",
          "raw": "2026-10-20T13:01:00Z host=hr-saas-01 user=unknown job=HR-SYNC-601 ticket=CHG-3230 scope=department_attributes phase=start",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-saas-gap-log-03",
          "time": "13:02:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "SaaS監査APIへの接続に失敗",
          "raw": "2026-10-20T13:02:00Z host=hr-saas-01 user=unknown stream=hr-admin-audit cursor=HR-A-9901 response=503 last_success=13:01:50",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "medium-saas-gap-log-04",
          "time": "13:02:30",
          "offset": 0,
          "source": "SaaS",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "ロール変更の通知を受信",
          "raw": "2026-10-20T13:02:30Z host=hr-saas-01 user=unknown notification=HR-N-602 event=role_mapping_changed actor=redacted correlation=HR-C-602 delivery_channel=webhook signature=valid",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-saas-gap-log-05",
          "time": "13:03:00",
          "offset": 0,
          "source": "監査",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "10.24.0.9",
          "event": "通知のローカル受信を確認",
          "raw": "2026-10-20T13:03:00Z host=hr-saas-01 user=unknown notification=HR-N-602 payload_fields=event,correlation signature_validation=passed details_in_audit_api=true",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "medium-saas-gap-log-06",
          "time": "13:03:10",
          "offset": 0,
          "source": "ジョブ",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "10.24.110.10",
          "event": "属性同期が完了",
          "raw": "2026-10-20T13:03:10Z host=hr-saas-01 user=unknown job=HR-SYNC-601 changed_departments=24 role_change_requested=false result=success",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-saas-gap-log-07",
          "time": "13:04:00",
          "offset": 0,
          "source": "IdP",
          "host": "hr-saas-01",
          "user": "svc-hr-admin",
          "ip": "10.24.110.10",
          "event": "サービスアカウントの認証",
          "raw": "2026-10-20T13:04:00Z host=hr-saas-01 user=svc-hr-admin account=svc-hr-admin auth=certificate client=hr-sync request=HR-T-601 result=success",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "medium-saas-gap-log-08",
          "time": "13:04:30",
          "offset": 0,
          "source": "収集基盤",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "ロール情報の再取得に失敗",
          "raw": "2026-10-20T13:04:30Z host=hr-saas-01 user=unknown operation=current_roles response=503 snapshot_available=HR-SNAP-60 snapshot_age_seconds=270",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "medium-saas-gap-log-09",
          "time": "13:05:00",
          "offset": 0,
          "source": "SaaS",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "一般利用画面の稼働確認",
          "raw": "2026-10-20T13:05:00Z host=hr-saas-01 user=unknown path=/employee/home status=200 operation=healthcheck admin_audit_status=unknown",
          "path": "/var/log/saas/audit.log"
        },
        {
          "id": "medium-saas-gap-log-10",
          "time": "13:05:20",
          "offset": 0,
          "source": "収集基盤",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "監査の欠落期間が継続",
          "raw": "2026-10-20T13:05:20Z host=hr-saas-01 user=unknown stream=hr-admin-audit missing_since=13:01:50 records_recovered=0",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "medium-saas-gap-log-11",
          "time": "13:06:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "10.24.110.10",
          "event": "通知と同期ジョブの相関を確認",
          "raw": "2026-10-20T13:06:00Z host=hr-saas-01 user=unknown job=HR-SYNC-601 correlation=HR-C-601 notification_correlation=HR-C-602 match=false",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "medium-saas-gap-log-12",
          "time": "13:07:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "hr-saas-01",
          "user": "未確認",
          "ip": "192.0.2.160",
          "event": "管理API障害を再確認",
          "raw": "2026-10-20T13:07:00Z host=hr-saas-01 user=unknown operations=admin_audit,current_roles response=503 retry_after=60 current_role_state=unknown",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "medium-saas-gap-doc-asset",
          "title": "人事SaaSの権限構成",
          "kind": "資産・アカウント",
          "body": "hr-saas-01 には社員の個人情報が保存されている。hr.admin は閲覧範囲とデータ出力権限を変更できる。ロール変更通知の簡略ペイロードには、変更前後の権限や実際の操作主体は含まれず、詳細監査APIで確認する。"
        },
        {
          "id": "medium-saas-gap-doc-change",
          "title": "変更申請 CHG-3230",
          "kind": "変更申請",
          "body": "承認済み。13:00〜13:10の HR-SYNC-601 は異動に伴う部署属性24件の更新のみ。ロールマッピングや管理権限の付与は含まれない。ジョブの相関IDは HR-C-601。別の緊急変更は人事システム責任者の確認が必要。"
        },
        {
          "id": "medium-saas-gap-doc-gap",
          "title": "取得できている情報と欠落範囲",
          "kind": "収集状況",
          "body": "13:01:50以降の管理操作監査と現在のロール一覧が取得できていない。13:00の HR-SNAP-60 は変更前の状態であり、現在の権限を示さない。署名付き通知 HR-N-602 の受信は確認済みだが、何がどう変わったかは未確認。一般利用画面の稼働確認では管理権限の安全性は判断できない。"
        }
      ],
      "contact": {
        "id": "medium-saas-gap-contact",
        "name": "大庭 悠",
        "role": "人事SaaS運用担当",
        "question": "権限変更の予定と、詳細監査・現在のロールの確認状況を問い合わせる",
        "replyId": "medium-saas-gap-reply",
        "replyTitle": "大庭からの回答：権限変更は確認継続中",
        "replyText": "CHG-3230 の部署属性更新は完了しましたが、HR-C-602 のロール変更はそのジョブと別です。私の担当作業に権限変更はありません。ほかの管理者の緊急作業か不正操作かはまだ確認できず、API障害で変更内容も見られません。人事情報への影響があるため、責任者とSaaS提供元に監査回収と現在権限の確認を優先依頼してください。",
        "delaySeconds": 60
      },
      "answer": {
        "verdict": "unknown",
        "priorities": [
          "high"
        ],
        "actions": [
          "escalate"
        ],
        "target": "hr-saas-01",
        "evidenceGroups": [
          [
            "medium-saas-gap-log-04",
            "medium-saas-gap-log-05"
          ],
          [
            "medium-saas-gap-doc-gap",
            "medium-saas-gap-log-08",
            "medium-saas-gap-log-10",
            "medium-saas-gap-log-12"
          ],
          [
            "medium-saas-gap-reply"
          ]
        ],
        "summary": "署名を確認したロール変更通知 HR-N-602 を受信したが、管理監査と現在ロールの取得障害により、操作主体・変更内容・影響範囲が分からない。予定された部署属性更新とは相関IDが異なり、担当者も正当性を確認できていない。",
        "nextStep": "人事システム責任者へ高優先度で引き継ぎ、SaaS提供元に監査回収と現在の権限確認を依頼する。別管理者の緊急変更の有無を確認し、保護措置の要否を責任者が判断できる材料をそろえる。",
        "explanation": "正しい署名の通知は実イベントの根拠になりますが、不正変更の断定には足りません。古いスナップショットで安全と決めることもできません。人事管理権限への影響と観測不能を踏まえ、高優先度で確認を進めるのが適切です。",
        "lessons": [
          "通知の受信確認と、変更内容の確定を区別します。",
          "古いスナップショットを現在の状態として扱いません。",
          "重大な対象では、未確定でも優先して追加調査を依頼します。"
        ]
      },
      "hints": [
        "通知 HR-C-602 と定期同期 HR-C-601 は同じ処理でしょうか。",
        "13:00のロール一覧が、通知後の現在状態を示せるか確認してください。",
        "通知を受信した根拠、現在状態を見られない根拠、担当者の未確認事項を示す回答を登録します。"
      ]
    },
    {
      "id": "high-pipeline",
      "scenarioId": "high",
      "difficulty": "high",
      "title": "リリース経路に現れた新しい実行",
      "subtitle": "CI制御・成果物・配布先の照合",
      "host": "ci-control-01",
      "relatedHosts": [
        "build-worker-02",
        "artifact-registry-01",
        "release-agent-01"
      ],
      "user": "svc-release",
      "source": "監査",
      "severity": "high",
      "critical": true,
      "context": "CIのリリース用トークンが、通常と異なる経路で利用されました。その後、ビルドと配布先で複数の記録が届いています。どの変更がどこまで届いたかを追い、止めるべき範囲を示してください。",
      "logs": [
        {
          "id": "hi-ci-01",
          "time": "08:40:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "ci-control-01",
          "user": "svc-release",
          "ip": "10.60.10.12",
          "event": "朝の定期ビルドが完了",
          "raw": "2026-10-20T08:40:00Z host=ci-control-01 run=CI-640 revision=rev-8d1 trigger=schedule status=success artifact=app-6.4.0",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ci-02",
          "time": "08:42:05",
          "offset": 0,
          "source": "IdP",
          "host": "ci-control-01",
          "user": "svc-release",
          "ip": "198.51.100.151",
          "event": "リリース用トークンの利用",
          "raw": "2026-10-20T08:42:05Z host=ci-control-01 token_id=REL-T19 src=198.51.100.151 device=unregistered auth=service_token result=success session=CI-S992",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "hi-ci-03",
          "time": "08:42:09",
          "offset": 0,
          "source": "監査",
          "host": "ci-control-01",
          "user": "svc-release",
          "ip": "198.51.100.151",
          "event": "ビルド定義の更新",
          "raw": "2026-10-20T08:42:09Z host=ci-control-01 session=CI-S992 action=workflow_update workflow=release-prod old_revision=wf-77 new_revision=wf-78 added_step=postpackage-helper result=success approval_ref=none",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-04",
          "time": "08:42:11",
          "offset": 0,
          "source": "監査",
          "host": "ci-control-01",
          "user": "svc-release",
          "ip": "198.51.100.151",
          "event": "手動ビルドの開始",
          "raw": "2026-10-20T08:42:11Z host=ci-control-01 session=CI-S992 action=run_create run=CI-641 workflow_revision=wf-78 source_revision=rev-8d1 reason=manual",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-05",
          "time": "08:42:12",
          "offset": 0,
          "source": "ジョブ",
          "host": "build-worker-02",
          "user": "svc-build",
          "ip": "10.60.10.12",
          "event": "指定された定義でジョブを開始",
          "raw": "2026-10-20T08:42:12Z host=build-worker-02 run=CI-641 workflow_revision=wf-78 source_revision=rev-8d1 runner=build-worker-02 state=started",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ci-06",
          "time": "08:42:40",
          "offset": 0,
          "source": "EDR",
          "host": "build-worker-02",
          "user": "svc-build",
          "ip": "10.60.10.12",
          "event": "追加ステップによる成果物の書き換え",
          "raw": "2026-10-20T08:42:40Z host=build-worker-02 run=CI-641 parent=build-agent step=postpackage-helper action=file_write path=/build/output/app/runtime-settings.json new_endpoint=telemetry-cache.example signer=none",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-ci-07",
          "time": "08:42:55",
          "offset": 0,
          "source": "監査",
          "host": "artifact-registry-01",
          "user": "svc-build",
          "ip": "10.60.10.12",
          "event": "成果物の登録",
          "raw": "2026-10-20T08:42:55Z host=artifact-registry-01 run=CI-641 artifact=app-6.4.1 digest=lab-a641 workflow_revision=wf-78 published_by=svc-build result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-08",
          "time": "08:43:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "build-worker-02",
          "user": "svc-test",
          "ip": "10.60.10.12",
          "event": "通常の単体試験が完了",
          "raw": "2026-10-20T08:43:00Z host=build-worker-02 run=CI-641 test_suite=unit result=passed config_integrity_check=not_in_suite",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ci-09",
          "time": "08:43:08",
          "offset": 0,
          "source": "監査",
          "host": "ci-control-01",
          "user": "svc-release",
          "ip": "198.51.100.151",
          "event": "配布チャネルの更新",
          "raw": "2026-10-20T08:43:08Z host=ci-control-01 session=CI-S992 action=release_channel_update channel=production old_artifact=app-6.4.0 new_artifact=app-6.4.1 digest=lab-a641 change_ref=none",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-10",
          "time": "08:43:15",
          "offset": 0,
          "source": "監査",
          "host": "release-agent-01",
          "user": "svc-deploy",
          "ip": "10.60.20.11",
          "event": "配布エージェントが成果物を取得",
          "raw": "2026-10-20T08:43:15Z host=release-agent-01 deployment=DEP-641 artifact=app-6.4.1 digest=lab-a641 registry=artifact-registry-01 result=downloaded",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-11",
          "time": "08:43:18",
          "offset": 0,
          "source": "ジョブ",
          "host": "release-agent-01",
          "user": "svc-deploy",
          "ip": "10.60.20.11",
          "event": "本番カナリアへの反映",
          "raw": "2026-10-20T08:43:18Z host=release-agent-01 deployment=DEP-641 target_group=prod-canary nodes=2 artifact=app-6.4.1 result=activated remaining_nodes=18 state=waiting_health_gate",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ci-12",
          "time": "08:43:20",
          "offset": 0,
          "source": "Proxy",
          "host": "release-agent-01",
          "user": "svc-deploy",
          "ip": "10.60.20.11",
          "event": "通常のヘルスチェック",
          "raw": "2026-10-20T08:43:20Z host=release-agent-01 deployment=DEP-641 dst=health.internal.example response=200 check=process_liveness",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "hi-ci-13",
          "time": "08:43:22",
          "offset": 0,
          "source": "監査",
          "host": "artifact-registry-01",
          "user": "svc-build",
          "ip": "10.60.10.13",
          "event": "別プロジェクトの成果物が登録",
          "raw": "2026-10-20T08:43:22Z host=artifact-registry-01 project=docs run=DOC-810 artifact=docs-2.1.8 digest=lab-doc218 result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-14",
          "time": "08:43:35",
          "offset": 0,
          "source": "収集基盤",
          "host": "ci-control-01",
          "user": "svc-collector",
          "ip": "10.60.0.9",
          "event": "CI操作監査の連続性を確認",
          "raw": "2026-10-20T08:43:35Z host=ci-control-01 stream=ci-admin-audit interval=08:40:00-08:43:30 missing_events=0 sequence=complete",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "hi-ci-15",
          "time": "08:43:45",
          "offset": 0,
          "source": "監査",
          "host": "ci-control-01",
          "user": "svc-release",
          "ip": "198.51.100.151",
          "event": "同じトークンが引き続き有効",
          "raw": "2026-10-20T08:43:45Z host=ci-control-01 token_id=REL-T19 session=CI-S992 state=active scope=workflow.write,channel.write expires=18:00:00",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ci-16",
          "time": "08:44:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "release-agent-01",
          "user": "svc-deploy",
          "ip": "10.60.20.11",
          "event": "残りの配布は待機中",
          "raw": "2026-10-20T08:44:00Z host=release-agent-01 deployment=DEP-641 target_group=prod-main nodes=18 state=waiting_health_gate automatic_promotion_at=08:50:00",
          "path": "/var/log/jobs/scheduler.log"
        }
      ],
      "documents": [
        {
          "id": "hi-ci-doc-route",
          "title": "CIから本番までの経路",
          "kind": "構成・権限",
          "body": "ci-control-01 はビルド定義と本番チャネルを管理する。REL-T19 は通常 build-worker-02（10.60.10.12）から定期リリースに使うサービス用トークンで、workflow.write と channel.write を持つ。成果物は artifact-registry-01 を通り release-agent-01 が配布する。IPだけで所有者を特定できないため、操作・成果物ID・担当者の回答を照合する。時刻はすべてUTC。"
        },
        {
          "id": "hi-ci-doc-change",
          "title": "本日のリリース計画 REL-620",
          "kind": "変更申請",
          "body": "承認済み対象は08:40 UTCの CI-640、定義 wf-77、ソース rev-8d1、成果物 app-6.4.0。09:30 UTCまで追加リリースは予定なし。postpackage-helper の追加、外部エンドポイントへの設定変更、app-6.4.1 の登録・本番チャネル切り替えはいずれもこの承認に含まれない。別プロジェクト docs の定期ビルドは独立した計画。"
        },
        {
          "id": "hi-ci-doc-response",
          "title": "配布事故時の初動手順",
          "kind": "対応手順",
          "body": "まずリリース責任者へ連絡し、対象トークンと DEP-641 の後続配布を停止する。成果物・定義・CI監査の保全後、反映済みカナリア2台を確認して既知の正常版への復旧を判断する。稼働中の全サービスやCI全体を無条件に停止しない。ヘルスチェック成功は設定の正当性を検証したものではない。"
        }
      ],
      "hints": [
        "トークン利用・定義更新・ビルドをセッションIDとrunでつなぎます。",
        "同じソース版でもビルド定義が変われば成果物が変わります。digestと配布先まで追ってください。",
        "単体試験や死活監視の成功は承認の代わりになりません。停止範囲をトークンと該当配布に限定します。"
      ],
      "contact": {
        "id": "hi-ci-contact",
        "name": "真田 悠",
        "role": "リリース責任者",
        "question": "CI-641の承認と、配布済み範囲・トークン利用者を確認する",
        "replyId": "hi-ci-reply",
        "replyTitle": "真田 悠からの回答",
        "replyText": "CI-641、wf-78、app-6.4.1 の変更はチームの誰も承認・実施していません。CI管理者による緊急作業もありません。REL-620で承認したのはCI-640だけです。DEP-641 はカナリア2台へ反映済みで、残り18台はゲート待ちです。REL-T19の失効とこの配布の停止を担当できます。成果物と監査を保全して引き継いでください。",
        "delaySeconds": 80
      },
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "ci-control-01",
        "evidenceGroups": [
          [
            "hi-ci-03",
            "hi-ci-04"
          ],
          [
            "hi-ci-06",
            "hi-ci-07"
          ],
          [
            "hi-ci-10",
            "hi-ci-11"
          ],
          [
            "hi-ci-reply"
          ]
        ],
        "summary": "REL-T19で未承認の定義wf-78が作成され、CI-641で設定を書き換えたapp-6.4.1（lab-a641）が登録された。同じ成果物がDEP-641として本番カナリア2台へ反映済み。責任者は変更・トークン利用の正当性を否定した。",
        "nextStep": "ci-control-01のREL-T19失効とDEP-641後続配布停止を責任者へ依頼する。build-worker-02の実行情報、レジストリの成果物、release-agent-01の配布履歴を保全し、反映済み2台の影響と正常版への復旧を確認する。",
        "explanation": "不審なIPだけではなく、未承認の操作から変更成果物と実配布まで連続した証拠があります。通常の試験成功は追加設定の正当性を保証しません。主対象は制御権限を持つci-control-01ですが、保全と影響調査はビルド・レジストリ・配布先へ広げます。通信先への設定変更は確認できても、実際の外部送信や内容まで断定しません。",
        "lessons": [
          "アカウントの利用元から、ビルド定義・成果物・配布先まで同じIDで追います。",
          "検証の成功が何を確認し、何を確認していないかを分けます。",
          "封じ込めは制御権限と後続配布を優先し、業務影響を限定します。"
        ]
      }
    },
    {
      "id": "high-lateral",
      "scenarioId": "high",
      "difficulty": "high",
      "title": "踏み台の認証と会計系の変更",
      "subtitle": "複数ホストにまたがるセッション",
      "host": "jump-ops-03",
      "relatedHosts": [
        "finance-db-02",
        "finance-app-02"
      ],
      "user": "svc-finops",
      "source": "認証",
      "severity": "high",
      "critical": true,
      "context": "運用踏み台でサービス用アカウントの対話ログインが検知されました。同じ時間帯に会計系でも接続と設定変更が発生しています。踏み台の警報だけで止めず、移動先と実行された変更を確認してください。",
      "logs": [
        {
          "id": "hi-lm-01",
          "time": "08:35:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "finance-app-02",
          "user": "svc-invoice",
          "ip": "10.60.40.22",
          "event": "定例の請求計算が終了",
          "raw": "2026-10-20T08:35:00Z host=finance-app-02 job=invoice-daily run=INV-288 state=complete rows=912",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-lm-02",
          "time": "08:41:03",
          "offset": 0,
          "source": "認証",
          "host": "jump-ops-03",
          "user": "svc-finops",
          "ip": "203.0.113.172",
          "event": "サービスアカウントで鍵認証",
          "raw": "2026-10-20T08:41:03Z host=jump-ops-03 src=203.0.113.172 account=svc-finops auth=publickey key_id=FIN-K8 session=J-731 result=accepted",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-lm-03",
          "time": "08:41:05",
          "offset": 0,
          "source": "認証",
          "host": "jump-ops-03",
          "user": "svc-finops",
          "ip": "203.0.113.172",
          "event": "対話セッションを開始",
          "raw": "2026-10-20T08:41:05Z host=jump-ops-03 session=J-731 tty=pts/3 interactive=true account=svc-finops",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-lm-04",
          "time": "08:41:18",
          "offset": 0,
          "source": "監査",
          "host": "jump-ops-03",
          "user": "svc-finops",
          "ip": "203.0.113.172",
          "event": "DB接続情報ファイルの参照",
          "raw": "2026-10-20T08:41:18Z host=jump-ops-03 session=J-731 action=file_read path=/etc/finops/db-maint.conf result=success bytes=1840 credential_ref=DB-M12",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-lm-05",
          "time": "08:41:22",
          "offset": 0,
          "source": "EDR",
          "host": "jump-ops-03",
          "user": "svc-finops",
          "ip": "10.60.40.31",
          "event": "対話セッションからDBクライアント起動",
          "raw": "2026-10-20T08:41:22Z host=jump-ops-03 session=J-731 pid=7210 parent=login-shell image=db-client target=finance-db-02 credential_ref=DB-M12",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-lm-06",
          "time": "08:41:23",
          "offset": 0,
          "source": "Flow",
          "host": "jump-ops-03",
          "user": "svc-finops",
          "ip": "10.60.40.12",
          "event": "会計DBへの内部接続",
          "raw": "2026-10-20T08:41:23Z host=jump-ops-03 flow=F-973 src=10.60.40.31 dst=10.60.40.12 dst_port=5432 process_pid=7210 state=established",
          "path": "/var/log/network/flow.log"
        },
        {
          "id": "hi-lm-07",
          "time": "08:41:24",
          "offset": 0,
          "source": "認証",
          "host": "finance-db-02",
          "user": "db-maint",
          "ip": "10.60.40.31",
          "event": "会計DB側で接続を受理",
          "raw": "2026-10-20T08:41:24Z host=finance-db-02 session=DB-991 src=10.60.40.31 account=db-maint credential_ref=DB-M12 client_tag=J-731 result=success",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-lm-08",
          "time": "08:41:28",
          "offset": 0,
          "source": "監査",
          "host": "finance-db-02",
          "user": "db-maint",
          "ip": "10.60.40.31",
          "event": "保守ロールを使った権限変更",
          "raw": "2026-10-20T08:41:28Z host=finance-db-02 session=DB-991 action=role_grant role=finance.export grantee=svc-finops result=success change_ref=none",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-lm-09",
          "time": "08:41:33",
          "offset": 0,
          "source": "認証",
          "host": "finance-db-02",
          "user": "svc-invoice",
          "ip": "10.60.40.22",
          "event": "通常のアプリ接続",
          "raw": "2026-10-20T08:41:33Z host=finance-db-02 session=DB-992 account=svc-invoice src=10.60.40.22 purpose=invoice-read result=success",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-lm-10",
          "time": "08:41:46",
          "offset": 0,
          "source": "監査",
          "host": "finance-db-02",
          "user": "db-maint",
          "ip": "10.60.40.31",
          "event": "新しい定期処理を登録",
          "raw": "2026-10-20T08:41:46Z host=finance-db-02 session=DB-991 action=schedule_create schedule=fin-maint-extra owner=svc-finops task=export-summary destination=/srv/exports/adhoc enabled=true result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-lm-11",
          "time": "08:41:51",
          "offset": 0,
          "source": "ジョブ",
          "host": "finance-db-02",
          "user": "svc-finops",
          "ip": "10.60.40.12",
          "event": "追加の定期処理が実行",
          "raw": "2026-10-20T08:41:51Z host=finance-db-02 schedule=fin-maint-extra run=ADHOC-91 operation=export-summary rows=42800 output=/srv/exports/adhoc/ADHOC-91.csv result=success",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-lm-12",
          "time": "08:42:00",
          "offset": 0,
          "source": "EDR",
          "host": "finance-db-02",
          "user": "svc-finops",
          "ip": "10.60.40.12",
          "event": "新規出力ファイルの作成",
          "raw": "2026-10-20T08:42:00Z host=finance-db-02 schedule=fin-maint-extra run=ADHOC-91 path=/srv/exports/adhoc/ADHOC-91.csv bytes=14572032 network_upload=not_observed",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-lm-13",
          "time": "08:42:11",
          "offset": 0,
          "source": "認証",
          "host": "finance-app-02",
          "user": "svc-finops",
          "ip": "10.60.40.31",
          "event": "アプリサーバーにも認証を試行",
          "raw": "2026-10-20T08:42:11Z host=finance-app-02 src=10.60.40.31 auth=publickey key_id=FIN-K8 result=denied reason=account_not_allowed session=none",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-lm-14",
          "time": "08:42:30",
          "offset": 0,
          "source": "認証",
          "host": "jump-ops-03",
          "user": "m.kishi",
          "ip": "10.60.20.36",
          "event": "別の運用担当が通常経路で接続",
          "raw": "2026-10-20T08:42:30Z host=jump-ops-03 src=10.60.20.36 account=m.kishi session=J-732 auth=certificate result=success change_ref=CHG-611",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-lm-15",
          "time": "08:43:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "finance-db-02",
          "user": "svc-collector",
          "ip": "10.60.0.9",
          "event": "DB監査の受信状態",
          "raw": "2026-10-20T08:43:00Z host=finance-db-02 stream=db-role-schedule-audit last_sequence=88192 gaps=0 state=healthy",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "hi-lm-16",
          "time": "08:43:12",
          "offset": 0,
          "source": "認証",
          "host": "jump-ops-03",
          "user": "svc-finops",
          "ip": "203.0.113.172",
          "event": "最初の対話セッションが継続",
          "raw": "2026-10-20T08:43:12Z host=jump-ops-03 session=J-731 state=active remote=203.0.113.172",
          "path": "/var/log/auth.log"
        }
      ],
      "documents": [
        {
          "id": "hi-lm-doc-identity",
          "title": "会計運用アカウントの利用規則",
          "kind": "資産・権限",
          "body": "jump-ops-03（10.60.40.31）のsvc-finopsは、閉域ジョブランナーからの非対話の状態確認専用。外部からの対話利用は認められない。DB-M12はfinance-db-02（10.60.40.12）の保守用認証情報で、通常のDB変更は承認された当番担当が個人アカウントで実施する。finance-app-02は10.60.40.22。監視上の未登録IPだけで不正利用者の身元は特定できない。"
        },
        {
          "id": "hi-lm-doc-change",
          "title": "会計基盤の当日作業一覧",
          "kind": "変更申請",
          "body": "CHG-611は岸による08:42〜09:00 UTCの踏み台ディスク使用率確認。対象はjump-ops-03、担当m.kishi。DBの権限付与、定期処理登録、データ出力、svc-finopsの対話操作は含まれない。本日の承認済みDB定期処理はinvoice-dailyのみで、fin-maint-extraという名前は登録されていない。"
        },
        {
          "id": "hi-lm-doc-scope",
          "title": "会計システムの影響範囲と保全",
          "kind": "対応手順",
          "body": "会計DBは請求情報を持つ。接続拒否が確認できたホストと、操作成功が確認できたホストを区別する。DB監査・追加スケジュール定義・出力ファイル・踏み台セッションを保全する。踏み台の接続制限と疑わしい資格情報の失効を当番責任者へ依頼し、DB全体の停止は業務責任者と判断する。"
        }
      ],
      "hints": [
        "踏み台のJ-731とDB側のclient_tagを比較し、接続先の成功記録まで追います。",
        "アプリサーバーへの拒否ログは、DB側の操作成功を否定しません。",
        "未承認の変更と承認された別担当の作業を区別し、確認済みの影響と未確認の外部送信を分けます。"
      ],
      "contact": {
        "id": "hi-lm-contact",
        "name": "岸 誠",
        "role": "会計基盤の当番責任者",
        "question": "svc-finopsの利用とDB権限・定期処理の変更を確認する",
        "replyId": "hi-lm-reply",
        "replyTitle": "岸 誠からの回答",
        "replyText": "私はCHG-611のディスク確認だけを実施しています。J-731、DB-991、finance.exportの付与、fin-maint-extraの登録は担当者にも確認しましたが承認・実施していません。svc-finopsの対話利用もありません。DBを止める前に、対象セッションと認証情報を制限し、追加スケジュールの停止を調整します。ADHOC-91の出力と監査は消さずに保全してください。",
        "delaySeconds": 85
      },
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "jump-ops-03",
        "evidenceGroups": [
          [
            "hi-lm-03",
            "hi-lm-04"
          ],
          [
            "hi-lm-07",
            "hi-lm-08"
          ],
          [
            "hi-lm-10",
            "hi-lm-11"
          ],
          [
            "hi-lm-reply"
          ]
        ],
        "summary": "svc-finopsの対話セッションJ-731からfinance-db-02のDB-991へ接続がつながり、未承認の権限付与とfin-maint-extraの登録・実行を確認した。finance-app-02への試行は拒否されている。責任者はこれらの操作を否定した。",
        "nextStep": "jump-ops-03の疑わしいセッション制限、FIN-K8とDB-M12の失効・更新、DB側追加処理の停止を責任者へ依頼する。踏み台・DBの監査とADHOC-91を保全し、権限変更の復旧と他接続先を確認する。外部流出は未確認として切り分ける。",
        "explanation": "踏み台のログインだけでなく、別ホストの受信側監査とDBの実変更がつながるため、侵害後の横展開を確認できます。一方、アプリサーバーでは拒否しか確認できず、そこまで侵害済みとは扱いません。出力ファイル作成は確認できても、外部へ送信された証拠はこの教材にはありません。",
        "lessons": [
          "送信側の接続記録と受信側の認証・操作記録を照合します。",
          "複数ホストを一律に侵害済みと扱わず、成功・拒否・未確認を分けます。",
          "封じ込めでは入口だけでなく、到達先の権限と継続実行の設定も扱います。"
        ]
      }
    },
    {
      "id": "high-recovery",
      "scenarioId": "high",
      "difficulty": "high",
      "title": "拠点間コピーと連続する認証切り替え",
      "subtitle": "復旧系へのデータ移動を照合",
      "host": "dr-orchestrator-01",
      "relatedHosts": [
        "ledger-db-01",
        "ledger-dr-01"
      ],
      "user": "svc-dr-sync",
      "source": "Flow",
      "severity": "high",
      "critical": false,
      "context": "通常より大きい拠点間転送と、サービス認証情報の切り替えが同時に検知されました。復旧用の設備が関係していますが、計画があるだけで処理全体を正当とは決められません。対象・転送内容・到達先を照合してください。",
      "logs": [
        {
          "id": "hi-dr-01",
          "time": "08:30:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "複製ジョブが開始",
          "raw": "2026-10-20T08:30:00Z host=dr-orchestrator-01 job=DR-1020 change=DRILL-88 phase=prepare source=ledger-db-01 target=ledger-dr-01",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-dr-02",
          "time": "08:30:02",
          "offset": 0,
          "source": "IdP",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "短期サービス認証情報を発行",
          "raw": "2026-10-20T08:30:02Z host=dr-orchestrator-01 job=DR-1020 credential=DR-88-A scope=snapshot.read source=ledger-db-01 ttl=1800s issuer=vault-dr",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "hi-dr-03",
          "time": "08:30:04",
          "offset": 0,
          "source": "認証",
          "host": "ledger-db-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "コピー元への認証を受理",
          "raw": "2026-10-20T08:30:04Z host=ledger-db-01 job=DR-1020 credential=DR-88-A src=10.60.70.10 scope=snapshot.read result=success session=SRC-88",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-dr-04",
          "time": "08:30:08",
          "offset": 0,
          "source": "監査",
          "host": "ledger-db-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "指定スナップショットを参照",
          "raw": "2026-10-20T08:30:08Z host=ledger-db-01 job=DR-1020 session=SRC-88 snapshot=ledger-snap-20261020T0825Z manifest=M-DR88 mode=read_only",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-dr-05",
          "time": "08:30:10",
          "offset": 0,
          "source": "IdP",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "書き込み先を限定した認証情報を発行",
          "raw": "2026-10-20T08:30:10Z host=dr-orchestrator-01 job=DR-1020 credential=DR-88-B scope=restore.write target=ledger-dr-01 path=/restore/DR-1020 ttl=1800s interactive=false",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "hi-dr-06",
          "time": "08:30:12",
          "offset": 0,
          "source": "認証",
          "host": "ledger-dr-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "コピー先への認証を受理",
          "raw": "2026-10-20T08:30:12Z host=ledger-dr-01 job=DR-1020 credential=DR-88-B scope=restore.write result=success session=DST-88",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-dr-07",
          "time": "08:30:14",
          "offset": 0,
          "source": "Flow",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.71.11",
          "event": "復旧拠点への転送を開始",
          "raw": "2026-10-20T08:30:14Z host=dr-orchestrator-01 job=DR-1020 flow=DR-F88 src=10.60.70.11 dst=10.60.71.11 route=private-dr-link port=443 state=established",
          "path": "/var/log/network/flow.log"
        },
        {
          "id": "hi-dr-08",
          "time": "08:32:00",
          "offset": 0,
          "source": "Flow",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.71.11",
          "event": "転送量が日常基準を超過",
          "raw": "2026-10-20T08:32:00Z host=dr-orchestrator-01 job=DR-1020 flow=DR-F88 bytes_out=21474836480 rule=LARGE_INTERNAL_TRANSFER baseline_daily=1073741824",
          "path": "/var/log/network/flow.log"
        },
        {
          "id": "hi-dr-09",
          "time": "08:32:30",
          "offset": 0,
          "source": "ジョブ",
          "host": "ledger-db-01",
          "user": "svc-ledger",
          "ip": "10.60.70.11",
          "event": "通常の仕訳処理が継続",
          "raw": "2026-10-20T08:32:30Z host=ledger-db-01 job=ledger-ingest run=LED-884 status=success rows=168 no_relation=DR-1020",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-dr-10",
          "time": "08:34:10",
          "offset": 0,
          "source": "ジョブ",
          "host": "ledger-dr-01",
          "user": "svc-dr-sync",
          "ip": "10.60.71.11",
          "event": "受信したスナップショットの検証",
          "raw": "2026-10-20T08:34:10Z host=ledger-dr-01 job=DR-1020 manifest=M-DR88 received_bytes=34359738368 digest=lab-dr88 source_digest=lab-dr88 verify=match destination=/restore/DR-1020",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-dr-11",
          "time": "08:34:12",
          "offset": 0,
          "source": "監査",
          "host": "ledger-dr-01",
          "user": "svc-dr-sync",
          "ip": "10.60.71.11",
          "event": "復旧環境の属性を確認",
          "raw": "2026-10-20T08:34:12Z host=ledger-dr-01 job=DR-1020 environment=isolated-dr network_profile=no-production-write retention=24h data_class=financial",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-dr-12",
          "time": "08:35:00",
          "offset": 0,
          "source": "IdP",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.70.10",
          "event": "一時認証情報を失効",
          "raw": "2026-10-20T08:35:00Z host=dr-orchestrator-01 job=DR-1020 credentials=DR-88-A,DR-88-B reason=copy_complete state=revoked",
          "path": "/var/log/identity/idp.log"
        },
        {
          "id": "hi-dr-13",
          "time": "08:35:15",
          "offset": 0,
          "source": "ジョブ",
          "host": "ledger-dr-01",
          "user": "svc-dr-verify",
          "ip": "10.60.71.11",
          "event": "復旧検証が完了",
          "raw": "2026-10-20T08:35:15Z host=ledger-dr-01 job=DR-1020 manifest=M-DR88 table_count=42 integrity=passed verification=read_only",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-dr-14",
          "time": "08:35:30",
          "offset": 0,
          "source": "Flow",
          "host": "dr-orchestrator-01",
          "user": "svc-dr-sync",
          "ip": "10.60.71.11",
          "event": "転送セッションが終了",
          "raw": "2026-10-20T08:35:30Z host=dr-orchestrator-01 job=DR-1020 flow=DR-F88 bytes_out_total=34359738368 path=private-dr-link connection=closed",
          "path": "/var/log/network/flow.log"
        },
        {
          "id": "hi-dr-15",
          "time": "08:36:00",
          "offset": 0,
          "source": "Proxy",
          "host": "dr-orchestrator-01",
          "user": "svc-monitor",
          "ip": "10.60.70.10",
          "event": "通常の監視通知",
          "raw": "2026-10-20T08:36:00Z host=dr-orchestrator-01 dst=monitor.internal.example method=POST event=job-complete bytes=881 job=DR-1020",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "hi-dr-16",
          "time": "08:36:10",
          "offset": 0,
          "source": "収集基盤",
          "host": "dr-orchestrator-01",
          "user": "svc-collector",
          "ip": "10.60.0.9",
          "event": "演習区間のログ収集状態",
          "raw": "2026-10-20T08:36:10Z host=dr-orchestrator-01 interval=08:30:00-08:36:00 sources=identity,flow,job streams=complete gaps=0",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "hi-dr-doc-plan",
          "title": "復旧訓練計画 DRILL-88",
          "kind": "変更申請",
          "body": "承認済み。10月20日08:30〜08:45 UTC、dr-orchestrator-01がledger-db-01の08:25 UTCスナップショットをledger-dr-01へ複製する。ジョブDR-1020、マニフェストM-DR88、32GiB、教材用ダイジェストlab-dr88。金融データを含むため復旧用隔離環境に限定。復旧読み取り検証後24時間で削除。担当は復旧運用の夏目。"
        },
        {
          "id": "hi-dr-doc-network",
          "title": "復旧系の経路・資産台帳",
          "kind": "構成・データ取扱",
          "body": "ledger-db-01は10.60.70.11、ledger-dr-01は10.60.71.11。private-dr-linkは社内管理下の拠点間専用経路で、インターネット宛て経路ではない。dr-orchestrator-01は10.60.70.10。復旧環境は本番への書き戻しを禁止する。通常時は差分1GiB程度、訓練時は承認済みスナップショットの全量コピーを行う。"
        },
        {
          "id": "hi-dr-doc-identity",
          "title": "復旧ジョブの認証設計",
          "kind": "権限・運用",
          "body": "一回の復旧ジョブで読み取り用DR-88-Aと書き込み用DR-88-Bを別々に発行する。前者はコピー元のスナップショット読み取り、後者はコピー先/restore/DR-1020への書き込みに限定し、対話操作は禁止する。完了時に双方を失効させる。多数の発行・失効イベントだけで認証情報の窃取とは判断しない。"
        }
      ],
      "hints": [
        "大量通信という検知と、通信先が外部かどうかは別です。経路台帳で送受信元を確認します。",
        "計画のスナップショット・量・マニフェストを、受信側の照合結果と比較してください。",
        "認証情報は数だけでなく権限範囲、対話可否、失効まで確認します。"
      ],
      "contact": {
        "id": "hi-dr-contact",
        "name": "夏目 理央",
        "role": "復旧運用の責任者",
        "question": "訓練対象・受信結果・認証情報の終了処理を確認する",
        "replyId": "hi-dr-reply",
        "replyTitle": "夏目 理央からの回答",
        "replyText": "DRILL-88を実施しました。DR-1020はledger-db-01から隔離されたledger-dr-01へ32GiBをコピーし、M-DR88と受信ダイジェストlab-dr88を照合済みです。DR-88-A/Bはジョブ終了で失効しました。検証は読み取りだけで、本番書き戻しはしていません。24時間後の削除担当も作業票に記録しています。ほかの送信先やデータの追加はありません。",
        "delaySeconds": 65
      },
      "answer": {
        "verdict": "benign",
        "priorities": [
          "medium",
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "dr-orchestrator-01",
        "evidenceGroups": [
          [
            "hi-dr-doc-plan"
          ],
          [
            "hi-dr-10",
            "hi-dr-13"
          ],
          [
            "hi-dr-05",
            "hi-dr-12"
          ],
          [
            "hi-dr-reply"
          ]
        ],
        "summary": "DRILL-88と一致するDR-1020が、社内専用経路でledger-db-01からledger-dr-01へ32GiBを複製した。受信側のM-DR88とダイジェストが一致し、一時認証情報の範囲・失効も計画どおりで、責任者が実施内容を確認した。",
        "nextStep": "根拠を添えてクローズし、24時間後の復旧データ削除を運用作業票で確認する。検知調整を行う場合も、対象・時間・ジョブIDを限定し、大容量転送全体は除外しない。",
        "explanation": "承認の存在だけでは不十分ですが、今回は計画と実際の受信対象・量・ダイジェストが合い、認証情報の権限と終了処理も確認できています。社内の復旧経路を外部流出と誤認しないことがポイントです。担当者の回答だけに頼らず、両拠点の記録で整合性を確認します。",
        "lessons": [
          "送信量が大きいというだけで情報流出とは判断しません。",
          "コピー元・コピー先・成果物の照合結果を同じジョブで結びます。",
          "認証情報の発行から失効、データの削除予定まで作業範囲を確認します。"
        ]
      }
    },
    {
      "id": "high-rollout",
      "scenarioId": "high",
      "difficulty": "high",
      "title": "複数端末へのサービス登録",
      "subtitle": "配布元と端末側の実体確認",
      "host": "endpoint-mgr-02",
      "relatedHosts": [
        "sales-lt-061",
        "hr-lt-024",
        "design-ws-012"
      ],
      "user": "svc-endpoint",
      "source": "EDR",
      "severity": "high",
      "critical": false,
      "context": "端末管理サーバーから複数の業務端末に接続し、サービスの登録と監視設定の変更が続いています。同じ実行ファイル名でも正当性は判断できません。配布物・対象端末・変更範囲を確認してください。",
      "logs": [
        {
          "id": "hi-ed-01",
          "time": "08:28:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "endpoint-mgr-02",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "端末配布キャンペーンを開始",
          "raw": "2026-10-20T08:28:00Z host=endpoint-mgr-02 campaign=EDR-730 change=CHG-730 package=sensor-7.3.0 cohort=pilot-three state=started",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ed-02",
          "time": "08:28:05",
          "offset": 0,
          "source": "監査",
          "host": "endpoint-mgr-02",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "配布マニフェストを読み込み",
          "raw": "2026-10-20T08:28:05Z host=endpoint-mgr-02 campaign=EDR-730 manifest=PILOT-730 hosts=sales-lt-061,hr-lt-024,design-ws-012 expected_digest=lab-sensor730 expected_signer=Fictional-Sensor-Vendor",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ed-03",
          "time": "08:28:10",
          "offset": 0,
          "source": "認証",
          "host": "sales-lt-061",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "端末管理サーバーから管理認証",
          "raw": "2026-10-20T08:28:10Z host=sales-lt-061 campaign=EDR-730 src=10.60.80.20 auth=device_certificate channel=management result=success",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-ed-04",
          "time": "08:28:14",
          "offset": 0,
          "source": "監査",
          "host": "sales-lt-061",
          "user": "svc-endpoint",
          "ip": "10.60.81.61",
          "event": "新しいサービスの登録",
          "raw": "2026-10-20T08:28:14Z host=sales-lt-061 campaign=EDR-730 action=service_install service=SensorGuard image=/opt/sensorguard/agent version=7.3.0 result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ed-05",
          "time": "08:28:15",
          "offset": 0,
          "source": "EDR",
          "host": "sales-lt-061",
          "user": "SYSTEM",
          "ip": "10.60.81.61",
          "event": "サービス登録に対する検知",
          "raw": "2026-10-20T08:28:15Z host=sales-lt-061 campaign=EDR-730 rule=REMOTE_SERVICE_INSTALL parent=endpoint-deployer service=SensorGuard alert=true",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-ed-06",
          "time": "08:28:18",
          "offset": 0,
          "source": "EDR",
          "host": "sales-lt-061",
          "user": "SYSTEM",
          "ip": "10.60.81.61",
          "event": "実行ファイルの検証結果",
          "raw": "2026-10-20T08:28:18Z host=sales-lt-061 campaign=EDR-730 image=/opt/sensorguard/agent digest=lab-sensor730 signer=Fictional-Sensor-Vendor signature=valid attestation=local-measurement",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-ed-07",
          "time": "08:28:22",
          "offset": 0,
          "source": "監査",
          "host": "sales-lt-061",
          "user": "SYSTEM",
          "ip": "10.60.81.61",
          "event": "旧エージェントから監視を引き継ぎ",
          "raw": "2026-10-20T08:28:22Z host=sales-lt-061 campaign=EDR-730 old_sensor=7.2.4 old_state=stopped new_sensor=7.3.0 new_state=healthy gap_seconds=2",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ed-08",
          "time": "08:29:00",
          "offset": 0,
          "source": "認証",
          "host": "hr-lt-024",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "別端末への管理認証",
          "raw": "2026-10-20T08:29:00Z host=hr-lt-024 campaign=EDR-730 src=10.60.80.20 auth=device_certificate channel=management result=success",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-ed-09",
          "time": "08:29:10",
          "offset": 0,
          "source": "監査",
          "host": "hr-lt-024",
          "user": "SYSTEM",
          "ip": "10.60.82.24",
          "event": "同じサービスを登録",
          "raw": "2026-10-20T08:29:10Z host=hr-lt-024 campaign=EDR-730 action=service_install service=SensorGuard image=/opt/sensorguard/agent digest=lab-sensor730 signer=Fictional-Sensor-Vendor result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ed-10",
          "time": "08:29:13",
          "offset": 0,
          "source": "EDR",
          "host": "hr-lt-024",
          "user": "SYSTEM",
          "ip": "10.60.82.24",
          "event": "監視の引き継ぎ結果",
          "raw": "2026-10-20T08:29:13Z host=hr-lt-024 campaign=EDR-730 sensor=7.3.0 state=healthy old_sensor=removed gap_seconds=3",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-ed-11",
          "time": "08:29:45",
          "offset": 0,
          "source": "認証",
          "host": "design-ws-012",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "3台目への管理認証",
          "raw": "2026-10-20T08:29:45Z host=design-ws-012 campaign=EDR-730 src=10.60.80.20 auth=device_certificate channel=management result=success",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-ed-12",
          "time": "08:29:55",
          "offset": 0,
          "source": "監査",
          "host": "design-ws-012",
          "user": "SYSTEM",
          "ip": "10.60.83.12",
          "event": "配布した実体と監視状態",
          "raw": "2026-10-20T08:29:55Z host=design-ws-012 campaign=EDR-730 action=service_install image=/opt/sensorguard/agent digest=lab-sensor730 signer=Fictional-Sensor-Vendor result=success sensor_state=healthy",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ed-13",
          "time": "08:30:10",
          "offset": 0,
          "source": "ジョブ",
          "host": "endpoint-mgr-02",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "対象一覧と完了一覧を照合",
          "raw": "2026-10-20T08:30:10Z host=endpoint-mgr-02 campaign=EDR-730 manifest=PILOT-730 requested=3 completed=3 extra_hosts=0 hosts=sales-lt-061,hr-lt-024,design-ws-012 result=match",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ed-14",
          "time": "08:30:15",
          "offset": 0,
          "source": "Proxy",
          "host": "hr-lt-024",
          "user": "SYSTEM",
          "ip": "10.60.82.24",
          "event": "新エージェントの収集先通信",
          "raw": "2026-10-20T08:30:15Z host=hr-lt-024 process=/opt/sensorguard/agent dst=sensor-collector.internal.example certificate=internal-pki bytes_out=8024 result=success",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "hi-ed-15",
          "time": "08:30:25",
          "offset": 0,
          "source": "監査",
          "host": "design-ws-012",
          "user": "k.nagata",
          "ip": "10.60.83.12",
          "event": "利用者の通常アプリ更新",
          "raw": "2026-10-20T08:30:25Z host=design-ws-012 action=application_update package=design-viewer version=5.8.2 manager=user-app-store campaign=none",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ed-16",
          "time": "08:31:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "endpoint-mgr-02",
          "user": "svc-collector",
          "ip": "10.60.0.9",
          "event": "配布後の監視受信状況",
          "raw": "2026-10-20T08:31:00Z host=endpoint-mgr-02 campaign=EDR-730 sensors=3 streams=3 all_healthy=true coverage=process,file,network last_event_delay_seconds=4",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "hi-ed-17",
          "time": "08:31:05",
          "offset": 0,
          "source": "ジョブ",
          "host": "endpoint-mgr-02",
          "user": "svc-endpoint",
          "ip": "10.60.80.20",
          "event": "パイロット配布が終了",
          "raw": "2026-10-20T08:31:05Z host=endpoint-mgr-02 campaign=EDR-730 state=complete next_cohort=disabled awaiting=pilot_review",
          "path": "/var/log/jobs/scheduler.log"
        }
      ],
      "documents": [
        {
          "id": "hi-ed-doc-change",
          "title": "端末監視更新 CHG-730",
          "kind": "変更申請",
          "body": "承認済み。10月20日08:28〜08:40 UTC、endpoint-mgr-02からsales-lt-061、hr-lt-024、design-ws-012の3台だけへSensorGuard 7.3.0を配布する。マニフェストPILOT-730。/opt/sensorguard/agent、署名Fictional-Sensor-Vendor、教材用ダイジェストlab-sensor730。最大5秒の監視引き継ぎを許容。次の配布は評価後に別承認。"
        },
        {
          "id": "hi-ed-doc-architecture",
          "title": "端末管理と監視の経路",
          "kind": "構成・権限",
          "body": "endpoint-mgr-02（10.60.80.20）は端末証明書を使う管理配布元。svc-endpointの管理チャネル認証後、端末上ではSYSTEMでサービスを登録する。新エージェントの収集先はsensor-collector.internal.example。端末上の測定値をマニフェストと照合し、実行ファイル名だけでは判断しない。"
        },
        {
          "id": "hi-ed-doc-baseline",
          "title": "更新時の期待する挙動と終了条件",
          "kind": "運用手順",
          "body": "旧監視サービスの停止は新サービス正常起動への引き継ぎ時だけ許可する。対象3台でプロセス・ファイル・ネットワークの監視受信が再開し、対象外への配布がなく、次コホートが無効のままで完了。署名が有効でも承認外ホスト・承認外の権限変更・監視未復旧があればクローズしない。"
        }
      ],
      "hints": [
        "配布元・キャンペーンIDを軸に、端末側の署名とダイジェストを照合します。",
        "承認に合う端末が1台あるだけでは不十分です。対象一覧と実際の完了一覧を確認します。",
        "監視停止のログだけでなく、引き継ぎ時間と復旧後の収集状況を読みます。"
      ],
      "contact": {
        "id": "hi-ed-contact",
        "name": "矢島 菜月",
        "role": "端末管理の変更担当",
        "question": "配布した実体と対象3台、監視復旧を確認する",
        "replyId": "hi-ed-reply",
        "replyTitle": "矢島 菜月からの回答",
        "replyText": "CHG-730の実施者です。PILOT-730の3台に7.3.0を配布し、それぞれの端末測定値がlab-sensor730であることを確認しました。旧サービスからの引き継ぎは2〜3秒で、全台の監視受信は復旧しています。対象外配布はなく、次コホートは無効のままです。design-viewerの更新は利用者の通常作業で、このキャンペーンには含まれません。",
        "delaySeconds": 60
      },
      "answer": {
        "verdict": "benign",
        "priorities": [
          "medium",
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "endpoint-mgr-02",
        "evidenceGroups": [
          [
            "hi-ed-doc-change"
          ],
          [
            "hi-ed-06",
            "hi-ed-09",
            "hi-ed-12"
          ],
          [
            "hi-ed-13",
            "hi-ed-16"
          ],
          [
            "hi-ed-reply"
          ]
        ],
        "summary": "EDR-730はCHG-730で承認された3台へのパイロット更新だった。各端末の実体と署名・ダイジェストはマニフェストに一致し、対象外配布はなく、監視の引き継ぎ後に全台の受信が復旧している。担当者も同じ作業を確認した。",
        "nextStep": "証拠を添えてクローズし、3台の評価結果を変更担当へ返す。検知除外を検討する場合は承認された配布元・実体・キャンペーン期間へ限定し、次コホートは別途承認する。",
        "explanation": "複数端末へのサービス登録や旧監視の停止は横展開や防御回避にも見えますが、今回は承認、端末実体、配布範囲、監視復旧が整合しています。署名だけ、担当者の説明だけで判断せず、各端末と制御側の記録をつなぎます。",
        "lessons": [
          "署名とダイジェストの一致に加え、配布対象・時間・目的も確認します。",
          "監視の停止と正常な引き継ぎを、復旧状況と観測の連続性で区別します。",
          "一部の正当な端末だけで、全ホストへの操作を正当化しません。"
        ]
      }
    },
    {
      "id": "high-export",
      "scenarioId": "high",
      "difficulty": "high",
      "title": "DB抽出と共有出口の大量通信",
      "subtitle": "確定できる操作と追跡の限界",
      "host": "analytics-db-02",
      "relatedHosts": [
        "export-worker-03",
        "egress-gw-02"
      ],
      "user": "svc-analytics-export",
      "source": "監査",
      "severity": "high",
      "critical": true,
      "context": "顧客分析DBで通常より大きい抽出が行われ、その直後に共有出口で外向き通信が増えています。時間が近いだけで、同じファイルの外部送信とは断定できません。観測できる範囲を切り分け、追加取得すべき証拠を具体化してください。",
      "logs": [
        {
          "id": "hi-ex-01",
          "time": "08:25:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "export-worker-03",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "通常の集計ジョブが完了",
          "raw": "2026-10-20T08:25:00Z host=export-worker-03 run=AGG-201 dataset=aggregate-daily rows=24 output_bytes=4812 result=success",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ex-02",
          "time": "08:39:40",
          "offset": 0,
          "source": "認証",
          "host": "analytics-db-02",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "抽出ワーカーからDB認証",
          "raw": "2026-10-20T08:39:40Z host=analytics-db-02 session=DB-E772 src=10.60.90.23 auth=service_certificate result=success requester_identity=not_in_db_session",
          "path": "/var/log/auth.log"
        },
        {
          "id": "hi-ex-03",
          "time": "08:39:42",
          "offset": 0,
          "source": "監査",
          "host": "analytics-db-02",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "顧客分析用ビューの読み取り",
          "raw": "2026-10-20T08:39:42Z host=analytics-db-02 session=DB-E772 run=EXP-772 action=query view=customer-detail-v rows_returned=184200 columns=customer_ref,region,purchase_history result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ex-04",
          "time": "08:39:47",
          "offset": 0,
          "source": "ジョブ",
          "host": "export-worker-03",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "抽出ファイルをローカルへ生成",
          "raw": "2026-10-20T08:39:47Z host=export-worker-03 run=EXP-772 db_session=DB-E772 path=/srv/export/EXP-772.bin encryption=enabled bytes=805306368 digest=lab-exp772 state=complete",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ex-05",
          "time": "08:39:48",
          "offset": 0,
          "source": "監査",
          "host": "export-worker-03",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "依頼メタデータの参照が失敗",
          "raw": "2026-10-20T08:39:48Z host=export-worker-03 run=EXP-772 action=read_request_metadata request_ref=REQ-772 result=unavailable reason=request-index-timeout",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ex-06",
          "time": "08:40:02",
          "offset": 0,
          "source": "Proxy",
          "host": "egress-gw-02",
          "user": "proxy-service",
          "ip": "192.0.2.221",
          "event": "ストレージゲートウェイへの暗号化接続",
          "raw": "2026-10-20T08:40:02Z host=egress-gw-02 gateway_session=GX-440 upstream=storage-relay.example dst_ip=192.0.2.221 tls=1.3 client_identity=multiplexed inspection=excluded",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "hi-ex-07",
          "time": "08:40:10",
          "offset": 0,
          "source": "Flow",
          "host": "export-worker-03",
          "user": "svc-analytics-export",
          "ip": "10.60.90.2",
          "event": "共有出口への接続を確認",
          "raw": "2026-10-20T08:40:10Z host=export-worker-03 flow=EF-772 src=10.60.90.23 dst=10.60.90.2 dst_port=443 bytes_out=67108864 process=export-worker state=established",
          "path": "/var/log/network/flow.log"
        },
        {
          "id": "hi-ex-08",
          "time": "08:40:12",
          "offset": 0,
          "source": "Flow",
          "host": "egress-gw-02",
          "user": "proxy-service",
          "ip": "192.0.2.221",
          "event": "外向き転送が検知閾値を超過",
          "raw": "2026-10-20T08:40:12Z host=egress-gw-02 gateway_session=GX-440 bytes_out_interval=268435456 aggregation=multiple_clients rule=HIGH_EGRESS_VOLUME",
          "path": "/var/log/network/flow.log"
        },
        {
          "id": "hi-ex-09",
          "time": "08:40:20",
          "offset": 0,
          "source": "ジョブ",
          "host": "export-worker-03",
          "user": "svc-media-sync",
          "ip": "10.60.90.23",
          "event": "別ワーカー処理が共有出口を使用",
          "raw": "2026-10-20T08:40:20Z host=export-worker-03 run=MEDIA-219 task=approved-catalog-images route=egress-gw-02 queued_bytes=3221225472",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ex-10",
          "time": "08:40:45",
          "offset": 0,
          "source": "Proxy",
          "host": "egress-gw-02",
          "user": "proxy-service",
          "ip": "192.0.2.221",
          "event": "同じゲートウェイセッションが継続",
          "raw": "2026-10-20T08:40:45Z host=egress-gw-02 gateway_session=GX-440 bytes_out_total=1073741824 active_clients=4 object_key=not_logged destination_tenant=not_logged",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "hi-ex-11",
          "time": "08:41:00",
          "offset": 0,
          "source": "収集基盤",
          "host": "egress-gw-02",
          "user": "svc-collector",
          "ip": "10.60.0.9",
          "event": "クライアント対応表が未収集",
          "raw": "2026-10-20T08:41:00Z host=egress-gw-02 stream=egress-client-map last_received=08:10:00 state=buffering gateway_session_mapping=unavailable local_buffer=recoverable",
          "path": "/var/log/security/collector.log"
        },
        {
          "id": "hi-ex-12",
          "time": "08:41:10",
          "offset": 0,
          "source": "監査",
          "host": "analytics-db-02",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "DB接続の終了",
          "raw": "2026-10-20T08:41:10Z host=analytics-db-02 session=DB-E772 run=EXP-772 state=closed queried_view=customer-detail-v rows_returned_total=184200",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ex-13",
          "time": "08:41:20",
          "offset": 0,
          "source": "EDR",
          "host": "export-worker-03",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "抽出ファイルの状態",
          "raw": "2026-10-20T08:41:20Z host=export-worker-03 run=EXP-772 path=/srv/export/EXP-772.bin digest=lab-exp772 local_state=present upload_receipt=not_collected file_read_audit=disabled",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "hi-ex-14",
          "time": "08:41:35",
          "offset": 0,
          "source": "ジョブ",
          "host": "export-worker-03",
          "user": "svc-analytics-export",
          "ip": "10.60.90.23",
          "event": "依頼一覧取得が再度失敗",
          "raw": "2026-10-20T08:41:35Z host=export-worker-03 request_ref=REQ-772 request_service=export-request-index result=timeout requester=unknown approval=unknown",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "hi-ex-15",
          "time": "08:42:00",
          "offset": 0,
          "source": "Proxy",
          "host": "egress-gw-02",
          "user": "proxy-service",
          "ip": "192.0.2.221",
          "event": "共有出口の通信が継続",
          "raw": "2026-10-20T08:42:00Z host=egress-gw-02 gateway_session=GX-440 state=active bytes_out_total=1342177280 clients=4",
          "path": "/var/log/network/proxy.log"
        },
        {
          "id": "hi-ex-16",
          "time": "08:42:10",
          "offset": 0,
          "source": "監査",
          "host": "analytics-db-02",
          "user": "svc-health",
          "ip": "10.60.0.8",
          "event": "通常の監視クエリ",
          "raw": "2026-10-20T08:42:10Z host=analytics-db-02 session=DB-H773 view=health_check rows_returned=1 result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "hi-ex-17",
          "time": "08:42:30",
          "offset": 0,
          "source": "収集基盤",
          "host": "analytics-db-02",
          "user": "svc-collector",
          "ip": "10.60.0.9",
          "event": "DB読み取り監査は収集済み",
          "raw": "2026-10-20T08:42:30Z host=analytics-db-02 stream=db-read-audit interval=08:35:00-08:42:00 sequence=complete gaps=0 coverage=query_view,row_count",
          "path": "/var/log/security/collector.log"
        }
      ],
      "documents": [
        {
          "id": "hi-ex-doc-policy",
          "title": "分析データ抽出と共有の承認範囲",
          "kind": "データ取扱",
          "body": "analytics-db-02のcustomer-detail-vには顧客参照IDと購買履歴が含まれる。大規模抽出には依頼者・用途・対象範囲の承認が必要。外部共有には送信先テナントと共有対象の追加確認が必要。storage-relay.exampleは複数の社内・取引先テナントを中継するゲートウェイで、ドメインが許可済みでも任意の受信者へ共有してよいわけではない。"
        },
        {
          "id": "hi-ex-doc-visibility",
          "title": "DBから出口までの観測範囲",
          "kind": "収集状況",
          "body": "analytics-db-02（10.60.90.12）はDBセッションと参照ビュー・返却行数を監査する。export-worker-03（10.60.90.23）は抽出ファイルを生成するが、アプリの依頼インデックスが不調でREQ-772の依頼者と承認を取得できない。egress-gw-02（10.60.90.2）は複数クライアントの通信を一つの上流セッションへ多重化する。TLS内容、オブジェクトキー、テナントは収集されず、クライアント対応表の転送も停止中。時刻・バイト数の近さだけでは外向き通信とEXP-772を結びつけられない。"
        },
        {
          "id": "hi-ex-doc-workflow",
          "title": "抽出業務と追加調査の手順",
          "kind": "運用手順",
          "body": "定例AGG系は集約値のみだが、EXP系には承認済みの個別分析依頼もある。EXPという名前だけで未承認とは判断しない。REQ-772の依頼・承認レコード、出口のローカル対応表、ストレージ受信側のオブジェクト・テナント・受領履歴を回収する。顧客データの可能性があるためデータ所有者と当番責任者へ優先連携し、対象依頼の保留可否を判断する。"
        }
      ],
      "hints": [
        "DBの読み取りとファイル生成は確認できています。外向き通信との対応も同じ粒度で確認できていますか。",
        "共有出口の量は複数クライアントの合計です。名前・時刻・サイズが似ていても内容の証明にはなりません。",
        "依頼承認、クライアント対応、受信先の受領記録という不足を分け、高優先度で回収を依頼します。"
      ],
      "contact": {
        "id": "hi-ex-contact",
        "name": "桐山 蓮",
        "role": "分析基盤とデータ取扱の当番",
        "question": "REQ-772の依頼承認と、受信先・内容の回収状況を確認する",
        "replyId": "hi-ex-reply",
        "replyTitle": "桐山 蓮からの回答",
        "replyText": "DB-E772が18万4200行を読み、EXP-772.binを作成したところまでは確認しました。REQ-772の依頼者と承認はインデックス復旧待ちです。共有出口では画像配信など別業務も同時に動いており、GX-440の量だけでEXP-772が送信されたとは言えません。出口の対応表とストレージ受領履歴は取得依頼中です。顧客情報のため高優先度で責任者へ引き継ぎ、対象ジョブの保留可否を相談してください。",
        "delaySeconds": 90
      },
      "answer": {
        "verdict": "unknown",
        "priorities": [
          "high"
        ],
        "actions": [
          "escalate"
        ],
        "target": "analytics-db-02",
        "evidenceGroups": [
          [
            "hi-ex-03",
            "hi-ex-04"
          ],
          [
            "hi-ex-10",
            "hi-ex-11",
            "hi-ex-doc-visibility"
          ],
          [
            "hi-ex-05",
            "hi-ex-14"
          ],
          [
            "hi-ex-reply"
          ]
        ],
        "summary": "DB-E772でcustomer-detail-vの18万4200行を参照し、EXP-772のローカル抽出ファイルを生成したことは確認できた。REQ-772の依頼承認は不明。共有出口GX-440には複数業務が混在し、対応表・受信側履歴がないためEXP-772の外部送信や受信先は特定できない。",
        "nextStep": "analytics-db-02を主対象として高優先度でデータ所有者と当番責任者へ引き継ぐ。export-worker-03のEXP-772とDB監査を保全し、REQ-772の承認、egress-gw-02の対応表、ストレージ側の受領内容とテナントを回収する。対象ジョブの保留・共有制限の要否を判断してもらう。",
        "explanation": "顧客データの抽出は事実ですが、抽出の承認も外向き通信との対応も未確認です。大容量通信を流出確定と扱うのも、許可済みドメインだから安全と扱うのも証拠を超えます。影響が大きい可能性と現在の可視性の限界を踏まえ、具体的な回収先を示した高優先度の追加調査が適切です。",
        "lessons": [
          "確認済みのDB参照、ローカル出力、未確認の送信内容を分けて報告します。",
          "多重化された通信では時間や合計量だけでファイルを対応付けられません。",
          "断定できなくてもデータの重要性に応じて優先し、必要な証拠を具体的に依頼します。"
        ]
      }
    },
    {
      "id": "tutorial-scan",
      "scenarioId": "tutorial",
      "difficulty": "low",
      "title": "短時間に広がった接続先",
      "subtitle": "scan-lab-01 / 検証用ネットワーク",
      "host": "scan-lab-01",
      "user": "svc-inspect",
      "source": "EDR",
      "severity": "medium",
      "critical": false,
      "context": "scan-lab-01 から複数の端末へ短時間に接続が行われ、接続先の急増を知らせる警報が出ました。接続した範囲、目的、事前の申請と実際の作業を確認してください。これは操作を覚えるためのチュートリアル専用案件です。通常勤務とは別の問題です。",
      "logs": [
        {
          "id": "ts-01",
          "time": "08:52:00",
          "offset": 0,
          "source": "ジョブ",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.10",
          "event": "資産検査ジョブを開始",
          "raw": "2026-10-20T08:52:00Z host=scan-lab-01 job=asset-reachability run=INV-310 user=svc-inspect request=REQ-310 mode=connect_only phase=start",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "ts-02",
          "time": "08:52:01",
          "offset": 0,
          "source": "監査",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.10",
          "event": "検査設定を読み込み",
          "raw": "2026-10-20T08:52:01Z host=scan-lab-01 run=INV-310 config=lab-scope-v3 targets=10.24.90.21,10.24.90.22,10.24.90.23,10.24.90.24 port=443 authentication=false configuration_change=false",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "ts-03",
          "time": "08:52:03",
          "offset": 0,
          "source": "監査",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.21",
          "event": "検査対象の2台へ接続",
          "raw": "2026-10-20T08:52:03Z host=scan-lab-01 run=INV-310 src=10.24.90.10 dst=10.24.90.21,10.24.90.22 dst_port=443 operation=tcp_connect result=reachable",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "ts-04",
          "time": "08:52:05",
          "offset": 0,
          "source": "EDR",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.10",
          "event": "短時間の接続先増加を検知",
          "raw": "2026-10-20T08:52:05Z host=scan-lab-01 user=svc-inspect process=inventory-check run=INV-310 dst_count=4 interval=5s rule=DESTINATION_FANOUT severity=medium",
          "path": "/var/log/security/edr.log"
        },
        {
          "id": "ts-05",
          "time": "08:52:06",
          "offset": 0,
          "source": "監査",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.23",
          "event": "残りの検査対象2台へ接続",
          "raw": "2026-10-20T08:52:06Z host=scan-lab-01 run=INV-310 src=10.24.90.10 dst=10.24.90.23,10.24.90.24 dst_port=443 operation=tcp_connect result=reachable",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "ts-06",
          "time": "08:52:10",
          "offset": 0,
          "source": "監査",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.10",
          "event": "資産検査の実施範囲を確認",
          "raw": "2026-10-20T08:52:10Z host=scan-lab-01 run=INV-310 request=REQ-310 user=svc-inspect src=10.24.90.10 targets=10.24.90.21,10.24.90.22,10.24.90.23,10.24.90.24 dst_port=443 operation=tcp_connect scope_check=match outside_scope_connections=0 audit_coverage=complete result=success",
          "path": "/var/log/audit/audit.log"
        },
        {
          "id": "ts-07",
          "time": "08:52:12",
          "offset": 0,
          "source": "ジョブ",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.10",
          "event": "検査結果を社内台帳へ記録",
          "raw": "2026-10-20T08:52:12Z host=scan-lab-01 run=INV-310 destination=inventory.internal.example asset_count=4 output=INV-310-result result=success",
          "path": "/var/log/jobs/scheduler.log"
        },
        {
          "id": "ts-08",
          "time": "08:54:00",
          "offset": 0,
          "source": "EDR",
          "host": "scan-lab-01",
          "user": "svc-inspect",
          "ip": "10.24.90.10",
          "event": "定期ヘルスチェック",
          "raw": "2026-10-20T08:54:00Z host=scan-lab-01 agent=healthy heartbeat=success",
          "path": "/var/log/security/edr.log"
        }
      ],
      "documents": [
        {
          "id": "ts-doc-asset",
          "title": "検証用ネットワークの資産台帳",
          "kind": "資産・アカウント",
          "body": "scan-lab-01（10.24.90.10）は検証用ネットワークの到達性を確認する専用端末。svc-inspect は検査ジョブ専用アカウント。検証対象は lab-app-01〜04（10.24.90.21〜24）の4台。本番ネットワークの資産検査はこの端末の担当範囲に含まれない。今回の監査ログは、ジョブの開始から完了までの接続先と接続方式を欠落なく記録している。"
        },
        {
          "id": "ts-doc-plan",
          "title": "資産検査申請 REQ-310",
          "kind": "作業申請",
          "body": "承認済み。10月20日08:50〜09:10（UTC）、scan-lab-01 の svc-inspect により、検証用サーバー 10.24.90.21、10.24.90.22、10.24.90.23、10.24.90.24 の4台を対象に資産検査を行う。許可する操作は TCP 443 番ポートへの接続による到達性確認のみ。対象への認証、設定変更、申請外の接続先への検査は禁止。実行IDは INV-310、設定は lab-scope-v3。担当は森田。"
        }
      ],
      "contact": {
        "id": "ts-contact",
        "name": "森田 彩",
        "role": "検証環境担当",
        "question": "資産検査の実施と、申請された範囲を確認する",
        "replyId": "ts-reply",
        "replyTitle": "森田からの回答：検査の実施結果",
        "delaySeconds": 0,
        "replyText": "REQ-310 に従って08:52に私が検査を実施しました。実行ID INV-310、設定 lab-scope-v3 の結果を照合し、申請した 10.24.90.21〜24 の4台、TCP 443 番への接続のみで完了したことを確認しました。認証や設定変更はしていません。台帳への結果記録も完了しています。今回の検知はこの検査によるものですが、同じ端末の今後の通信を無条件に許可する必要はありません。"
      },
      "hints": [
        "まず資産検査の実施範囲を確認したログを読み、接続元・接続先・時刻・操作をメモします。",
        "作業申請 REQ-310 と、実行ID INV-310 の対象や操作が一致するか確認します。",
        "申請は予定です。担当者の回答を取り寄せて実施結果も照合し、根拠を3つ登録します。"
      ],
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "scan-lab-01",
        "evidenceGroups": [
          [
            "ts-06"
          ],
          [
            "ts-doc-plan"
          ],
          [
            "ts-reply"
          ]
        ],
        "summary": "scan-lab-01 の短時間の複数接続は、承認済みの資産検査 REQ-310 によるものだった。実行ID INV-310 の監査ログは申請された4台の TCP 443 番への接続のみを示し、時刻・実施端末・操作内容も申請と一致した。森田さんが実施結果と完了を確認しているため、正当な業務と判断した。",
        "nextStep": "実施範囲の監査ログ、作業申請、担当者の回答を添えてクローズする。今回の確認だけで将来の通信や同種の警報を一括許可せず、申請外の接続があれば別案件として調査する。",
        "explanation": "複数の接続先への通信は調査のきっかけですが、それだけで攻撃とは決まりません。この案件では、実際の接続先・時刻・操作、承認された申請、担当者の実施確認が一致しています。申請があることだけで終了せず、実際の作業が承認範囲に収まったと確かめるのがポイントです。",
        "lessons": [
          "警報の名前から結論を決めず、実際に行われた操作を確認します。",
          "予定された作業と、実施された作業の対象・時刻・操作を照合します。",
          "ログ、申請、担当者の確認という別々の根拠を報告に残します。"
        ]
      }
    },
    {
      "id": "bridge-app-update",
      "scenarioId": "bridge",
      "difficulty": "low",
      "title": "業務アプリのサービスが入れ替わった",
      "subtitle": "support-12 / 承認と実績を照合する",
      "host": "support-12",
      "user": "svc-appdeploy",
      "source": "EDR",
      "severity": "medium",
      "critical": false,
      "context": "サポート端末 support-12 で業務アプリのサービス実行ファイルが変更され、EDRが警報を出しました。正規の更新によるものか、予定外の変更かを調べます。実施記録と申請内容を照合し、担当者の回答を含めて報告してください。",
      "logs": [
        {
          "id": "bg1-01",
          "time": "09:09:50",
          "offset": 0,
          "source": "配布管理",
          "host": "support-12",
          "user": "svc-appdeploy",
          "ip": "10.28.10.12",
          "event": "配布管理の事前確認",
          "raw": "2026-10-20T09:09:50Z host=support-12 run=DEP-421 request=CHG-421 package=DeskHelp-7.4 operation=precheck result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg1-02",
          "time": "09:10:00",
          "offset": 0,
          "source": "配布管理",
          "host": "support-12",
          "user": "svc-appdeploy",
          "ip": "10.28.10.12",
          "event": "更新ジョブを開始",
          "raw": "2026-10-20T09:10:00Z host=support-12 user=svc-appdeploy run=DEP-421 request=CHG-421 package=DeskHelp-7.4 action=start",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg1-03",
          "time": "09:10:08",
          "offset": 0,
          "source": "EDR",
          "host": "support-12",
          "user": "svc-appdeploy",
          "ip": "10.28.10.12",
          "event": "サービスの実行ファイル変更を検知",
          "raw": "2026-10-20T09:10:08Z host=support-12 user=svc-appdeploy run=DEP-421 service=DeskHelpAgent operation=service_binary_change old=DeskHelp-7.3 new=DeskHelp-7.4 rule=SERVICE_BINARY_CHANGED",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg1-05",
          "time": "09:10:12",
          "offset": 0,
          "source": "OS監査",
          "host": "support-12",
          "user": "svc-appdeploy",
          "ip": "10.28.10.12",
          "event": "新しいバージョンのサービスが起動",
          "raw": "2026-10-20T09:10:12Z host=support-12 user=svc-appdeploy run=DEP-421 service=DeskHelpAgent version=7.4 operation=service_start result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg1-04",
          "time": "09:10:20",
          "offset": 0,
          "source": "配布管理",
          "host": "support-12",
          "user": "svc-appdeploy",
          "ip": "10.28.10.12",
          "event": "更新の実施内容と完了を記録",
          "raw": "2026-10-20T09:10:20Z host=support-12 user=svc-appdeploy run=DEP-421 request=CHG-421 package=DeskHelp-7.4 publisher=DeskHelpLtd signature=valid target=support-12 changed_service=DeskHelpAgent other_service_changes=0 result=success audit_coverage=complete",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg1-06",
          "time": "09:11:00",
          "offset": 0,
          "source": "アプリ",
          "host": "support-12",
          "user": "support-user",
          "ip": "10.28.10.12",
          "event": "問い合わせ画面の起動確認",
          "raw": "2026-10-20T09:11:00Z host=support-12 user=support-user app=DeskHelp version=7.4 operation=healthcheck result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg1-07",
          "time": "09:12:00",
          "offset": 0,
          "source": "EDR",
          "host": "support-12",
          "user": "svc-appdeploy",
          "ip": "10.28.10.12",
          "event": "定期ヘルスチェック",
          "raw": "2026-10-20T09:12:00Z host=support-12 agent=healthy heartbeat=success",
          "path": "/var/log/audit/events.log"
        }
      ],
      "documents": [
        {
          "id": "bg1-doc-asset",
          "title": "サポート端末の配布管理",
          "kind": "資産・運用",
          "body": "support-12 は問い合わせ対応用端末。DeskHelpAgent は業務アプリのサービスで、svc-appdeploy が更新する。配布管理ログは今回のジョブが変更したサービスと完了結果を記録している。サービス変更は更新でも発生するが、申請外の変更は担当者確認が必要。"
        },
        {
          "id": "bg1-doc-change",
          "title": "更新申請 CHG-421",
          "kind": "作業申請",
          "body": "承認済み。10月20日09:00〜09:30 UTC、support-12 の DeskHelp を7.3から7.4へ更新する。アカウント svc-appdeploy、実行ID DEP-421 を使用。DeskHelp Ltd の署名が有効な DeskHelp-7.4 パッケージで DeskHelpAgent を更新し、再起動する。他のサービス変更は申請に含まれない。担当は大野。"
        }
      ],
      "contact": {
        "id": "bg1-contact",
        "name": "大野 蓮",
        "role": "配布管理担当",
        "question": "CHG-421 の実施内容と完了結果を確認する",
        "replyId": "bg1-reply",
        "replyTitle": "大野からの回答：更新結果",
        "delaySeconds": 0,
        "replyText": "CHG-421 に従って DEP-421 を09:10に実行しました。support-12 の DeskHelpAgent を7.4へ更新し、再起動と動作確認が完了しています。配布管理の結果一覧でも変更したサービスは DeskHelpAgent だけでした。申請外の端末や別のサービスにこの申請を適用しないでください。"
      },
      "hints": [
        "サービス名と更新ジョブが実際に変更した対象を比べます。",
        "申請の端末・時間帯・アカウント・パッケージが実績と一致するか確認します。",
        "完了ログ、更新申請、担当者の実施確認という3種類の根拠を残します。"
      ],
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "support-12",
        "evidenceGroups": [
          [
            "bg1-04"
          ],
          [
            "bg1-doc-change"
          ],
          [
            "bg1-reply"
          ]
        ],
        "summary": "support-12 のサービス変更は承認済みの更新 CHG-421 に対応する。DEP-421 の完了ログで、時間帯・端末・アカウント・パッケージと変更サービスが申請範囲に一致し、他サービスの変更がないことを確認した。担当者から更新と動作確認の完了回答も得たため、正当な業務と判断した。",
        "nextStep": "完了ログ、CHG-421、担当者回答を添えてクローズする。今回の確認を根拠に、別端末・別サービスの変更まで一括して許可しない。",
        "explanation": "サービス変更は更新でも発生します。今回は実施内容と承認範囲が一致し、完了も確認できています。申請があるだけでなく、実際の変更がその範囲内かを照合します。",
        "lessons": [
          "警報名ではなく実際の変更内容を確認する。",
          "端末・時刻・実行ID・サービスで予定と実績を結び付ける。",
          "確認できた今回の作業に範囲を限定してクローズする。"
        ]
      },
      "bridge": {
        "stage": "guided",
        "objective": "サービス変更の実施内容・承認範囲・担当者の確認をつなぎ、根拠を添えて対応を提出する。",
        "focus": "警報から即断せず、予定と実績を照合する。",
        "steps": [
          {
            "id": "context",
            "title": "警報の対象と確認事項を整理する",
            "instruction": "「依頼・状況」を開き、対象端末・利用者・検知された操作を確認します。変更理由と申請範囲内の操作かを確かめます。",
            "why": "最初に対象と確認事項を絞ると、別の端末や操作を混ぜずに調査できます。",
            "target": "[data-action=\"context\"]",
            "kind": "seen",
            "flag": "context"
          },
          {
            "id": "logs",
            "title": "実際に起きた操作を生ログで確認する",
            "instruction": "「ログ検索」で「更新の実施内容と完了を記録」の「生ログを表示」を押します。DEP-421 を手がかりに、サービス・パッケージ・結果を読み取ります。",
            "why": "短いイベント名だけで結論を出さず、実行した主体・対象・結果を元の記録で確かめます。",
            "target": "[data-log-details=\"bg1-04\"] > summary",
            "tab": "logs",
            "kind": "seen",
            "flag": "raw"
          },
          {
            "id": "log-evidence",
            "title": "判断の根拠になるログを登録する",
            "instruction": "同じ「更新の実施内容と完了を記録」の「証拠に追加」を押します。警報だけでなく実際の変更内容が分かる記録を選びます。",
            "why": "報告を受ける人が同じ事実をたどれるよう、判断を支える具体的な記録を残します。",
            "target": "[data-evidence=\"bg1-04\"]",
            "kind": "evidence",
            "source": "log",
            "tab": "logs"
          },
          {
            "id": "resources",
            "title": "資料から許可範囲と判断基準を確認する",
            "instruction": "「資産・資料」を開きます。CHG-421 の端末・時刻・アカウント・変更対象をログと比べます。",
            "why": "操作が起きた事実と、その操作が許可されたかどうかは別々に確かめます。",
            "target": "[data-tab=\"resources\"]",
            "tab": "resources",
            "kind": "seen",
            "flag": "resources"
          },
          {
            "id": "document-evidence",
            "title": "ログと照合した資料を証拠に残す",
            "instruction": "判断に用いた資料を証拠登録します。ログのどの部分と一致・不一致なのかを考えてください。",
            "why": "ログだけでは分からない業務上の背景を、独立した根拠として報告に残します。",
            "target": "[data-evidence=\"bg1-doc-change\"]",
            "tab": "resources",
            "kind": "evidence",
            "source": "document"
          },
          {
            "id": "request",
            "title": "担当者に実施内容と未確認事項を照会する",
            "instruction": "「照会」タブの「確認を依頼する」を押して回答を読みます。申請の存在と申請どおりの完了を分けて確認します。",
            "why": "予定だけで実施結果を決めつけず、担当者が確認した範囲も調べます。",
            "target": "[data-action=\"contact\"]",
            "tab": "contact",
            "kind": "request"
          },
          {
            "id": "reply-evidence",
            "title": "担当者の回答を根拠に加える",
            "instruction": "回答を証拠登録し、ログで確認できた事実と担当者の説明を区別します。",
            "why": "複数の根拠が一致しているか、追加確認が必要な点が残るかを整理します。",
            "target": "[data-evidence=\"bg1-reply\"]",
            "tab": "contact",
            "kind": "evidence",
            "source": "reply"
          },
          {
            "id": "draft",
            "title": "判断・根拠・次の対応を自分の言葉でまとめる",
            "instruction": "判定・優先度・対象・対応を選び、「確認した事実・判断の理由」と「未確認事項・引き継ぎ」を記入します。「何が起きたか → 何と照合したか → 判断できること」の順に書いてみましょう。次の対応には、誰が何をするかと対象範囲を書きます。",
            "why": "他の担当者へ引き継げる報告にします。推測を事実のように書かず、確認できた範囲を示します。",
            "target": "#draft-summary",
            "kind": "draft",
            "fields": [
              "verdict",
              "priority",
              "target",
              "action",
              "summary",
              "nextStep"
            ]
          },
          {
            "id": "submitted",
            "title": "対応を提出し、根拠と報告を振り返る",
            "instruction": "証拠と記入内容を見直して「判断と対応を記録する」を押します。不足が示されたら調査を補って再提出できます。",
            "why": "自分の報告と参考例を比べ、根拠や未確認事項が伝わるかを振り返ります。",
            "target": "#case-form .submit",
            "kind": "submitted"
          }
        ]
      }
    },
    {
      "id": "bridge-usb-copy",
      "scenarioId": "bridge",
      "difficulty": "low",
      "title": "取り外し媒体へファイルがコピーされた",
      "subtitle": "legal-08 / 許可範囲と実際の持ち出し",
      "host": "legal-08",
      "user": "y.izumi",
      "source": "DLP",
      "severity": "high",
      "critical": false,
      "context": "法務端末 legal-08 で媒体へのファイルコピーがDLPに記録されました。DLPは検知モードのため、警報が出てもコピーを止めたとは限りません。結果・媒体の識別番号・利用者の申請を調べ、確認できた影響と次の対応を整理してください。",
      "logs": [
        {
          "id": "bg2-01",
          "time": "10:14:40",
          "offset": 0,
          "source": "ファイル監査",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "契約資料フォルダを開く",
          "raw": "2026-10-20T10:14:40Z host=legal-08 user=y.izumi operation=folder_open path=C:/legal/contracts result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg2-02",
          "time": "10:15:00",
          "offset": 0,
          "source": "OS監査",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "USB媒体を接続",
          "raw": "2026-10-20T10:15:00Z host=legal-08 user=y.izumi operation=usb_attach device_serial=HOME-882 volume=E encryption=none result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg2-04",
          "time": "10:15:24",
          "offset": 0,
          "source": "DLP",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "機密資料の媒体コピーを検知",
          "raw": "2026-10-20T10:15:24Z host=legal-08 user=y.izumi operation=file_copy device_serial=HOME-882 classification=restricted policy=MEDIA_EXPORT mode=detect_only action=alert transfer_id=COPY-882",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg2-03",
          "time": "10:15:25",
          "offset": 0,
          "source": "ファイル監査",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "媒体へのコピー完了を記録",
          "raw": "2026-10-20T10:15:25Z host=legal-08 user=y.izumi transfer_id=COPY-882 destination=usb:HOME-882 files=contract-A.pdf,contract-B.pdf,contract-C.pdf file_count=3 classification=restricted bytes=146320 result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg2-05",
          "time": "10:15:26",
          "offset": 0,
          "source": "DLP",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "警報を監視基盤へ配送",
          "raw": "2026-10-20T10:15:26Z host=legal-08 transfer_id=COPY-882 operation=alert_delivery result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg2-06",
          "time": "10:16:00",
          "offset": 0,
          "source": "OS監査",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "USB媒体の取り外しを記録",
          "raw": "2026-10-20T10:16:00Z host=legal-08 user=y.izumi operation=usb_detach device_serial=HOME-882 result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg2-07",
          "time": "10:17:00",
          "offset": 0,
          "source": "EDR",
          "host": "legal-08",
          "user": "y.izumi",
          "ip": "10.28.20.8",
          "event": "端末の管理通信は正常",
          "raw": "2026-10-20T10:17:00Z host=legal-08 agent=healthy heartbeat=success",
          "path": "/var/log/audit/events.log"
        }
      ],
      "documents": [
        {
          "id": "bg2-doc-media",
          "title": "法務部の媒体持ち出しルールと今回の申請",
          "kind": "持ち出し申請",
          "body": "契約資料（restricted）の持ち出しは承認された社給暗号化USBに限る。個人媒体へのコピーは禁止。申請 OUT-882 は10月20日の契約打合せ用として、泉が legal-08 から契約書 contract-A.pdf、contract-B.pdf、contract-C.pdf の3件を社給暗号化USB CORP-114 へコピーすることを承認した。承認対象の媒体識別番号は CORP-114 のみ。"
        },
        {
          "id": "bg2-doc-response",
          "title": "媒体コピー時の対応手順",
          "kind": "対応基準",
          "body": "mode=detect_only は通知のみで、コピー遮断の意味ではない。申請外媒体への機密資料コピーが完了した場合は情報持ち出しのインシデントとして扱う。端末の追加操作と媒体の状況を担当部署に確認し、媒体の確保・回収と影響確認を依頼する。ログにないファイルや第三者への再配布を断定しない。端末隔離だけでは取り外された媒体は回収できない。"
        }
      ],
      "contact": {
        "id": "bg2-contact",
        "name": "泉 優",
        "role": "法務部・端末利用者",
        "question": "使用したUSB媒体とコピー後の状況を確認する",
        "replyId": "bg2-reply",
        "replyTitle": "泉からの回答：使った媒体",
        "delaySeconds": 0,
        "replyText": "社給の CORP-114 が見つからず、私物USBの HOME-882 に契約書3件をコピーしました。個人媒体の使用申請はしていません。USBはいま自分の机にあり、別の端末にはまだ挿していません。これ以上操作せず回収の指示を待ちます。"
      },
      "hints": [
        "DLP通知だけでは遮断されたと判断できません。コピー結果を確認します。",
        "申請はファイルだけでなく媒体も指定しています。",
        "コピー完了ログ、許可された媒体の資料、利用者回答を根拠にします。"
      ],
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "escalate",
          "contain"
        ],
        "target": "legal-08",
        "evidenceGroups": [
          [
            "bg2-03"
          ],
          [
            "bg2-doc-media"
          ],
          [
            "bg2-reply"
          ]
        ],
        "summary": "legal-08 から契約資料3件が私物USB HOME-882 へコピーされたことを COPY-882 の成功ログで確認した。OUT-882 が許可した媒体は CORP-114 であり、実際の媒体は承認範囲外だった。利用者も私物USBの使用を認めている。DLPは検知のみで、申請外の機密資料持ち出しとして対応する。",
        "nextStep": "法務部と対応担当へ連絡し、legal-08 の追加操作抑止と HOME-882 の確保・回収、保管を依頼する。「他端末では未使用」は利用者の申告として残し、媒体の利用履歴と対象3件の扱いを確認する。端末隔離とは別に媒体回収が必要。第三者への流出は未確認と記載する。",
        "explanation": "検知モードの通知は遮断の証明になりません。コピー成功と実際の媒体を確認すると、承認範囲外へのコピーが成立しています。端末だけでなく、取り外された媒体の確保も引き継ぎます。",
        "lessons": [
          "検知・遮断・成功を区別する。",
          "承認対象の識別子を実際の操作と照合する。",
          "端末対処と既にコピーされた媒体の回収を分けて考える。"
        ]
      },
      "bridge": {
        "stage": "guided",
        "objective": "コピーが実行されたかと、使った媒体が許可されたものかを別々に確かめて報告する。",
        "focus": "検知と遮断、申請と許可対象を区別する。",
        "steps": [
          {
            "id": "context",
            "title": "警報の対象と確認事項を整理する",
            "instruction": "「依頼・状況」を開き、対象端末・利用者・検知された操作を確認します。コピーは成功したか、その媒体は承認されていたかを分けて調べます。",
            "why": "最初に対象と確認事項を絞ると、別の端末や操作を混ぜずに調査できます。",
            "target": "[data-action=\"context\"]",
            "kind": "seen",
            "flag": "context"
          },
          {
            "id": "logs",
            "title": "実際に起きた操作を生ログで確認する",
            "instruction": "「ログ検索」で「媒体へのコピー完了を記録」の「生ログを表示」を押します。COPY-882 を追い、DLPの mode とファイル監査の result・媒体を比べます。",
            "why": "短いイベント名だけで結論を出さず、実行した主体・対象・結果を元の記録で確かめます。",
            "target": "[data-log-details=\"bg2-03\"] > summary",
            "tab": "logs",
            "kind": "seen",
            "flag": "raw"
          },
          {
            "id": "log-evidence",
            "title": "判断の根拠になるログを登録する",
            "instruction": "同じ「媒体へのコピー完了を記録」の「証拠に追加」を押します。コピー成否と、どの媒体へ何件コピーされたか分かる記録を選びます。",
            "why": "報告を受ける人が同じ事実をたどれるよう、判断を支える具体的な記録を残します。",
            "target": "[data-evidence=\"bg2-03\"]",
            "kind": "evidence",
            "source": "log",
            "tab": "logs"
          },
          {
            "id": "resources",
            "title": "資料から許可範囲と判断基準を確認する",
            "instruction": "「資産・資料」を開きます。OUT-882 が許可したファイルと媒体を実際のコピーと照合します。",
            "why": "操作が起きた事実と、その操作が許可されたかどうかは別々に確かめます。",
            "target": "[data-tab=\"resources\"]",
            "tab": "resources",
            "kind": "seen",
            "flag": "resources"
          },
          {
            "id": "document-evidence",
            "title": "ログと照合した資料を証拠に残す",
            "instruction": "判断に用いた資料を証拠登録します。ログのどの部分と一致・不一致なのかを考えてください。",
            "why": "ログだけでは分からない業務上の背景を、独立した根拠として報告に残します。",
            "target": "[data-evidence=\"bg2-doc-media\"]",
            "tab": "resources",
            "kind": "evidence",
            "source": "document"
          },
          {
            "id": "request",
            "title": "担当者に実施内容と未確認事項を照会する",
            "instruction": "「照会」タブの「確認を依頼する」を押して回答を読みます。媒体の現在地とコピー後の利用状況を確認します。",
            "why": "予定だけで実施結果を決めつけず、担当者が確認した範囲も調べます。",
            "target": "[data-action=\"contact\"]",
            "tab": "contact",
            "kind": "request"
          },
          {
            "id": "reply-evidence",
            "title": "担当者の回答を根拠に加える",
            "instruction": "回答を証拠登録し、ログで確認できた事実と担当者の説明を区別します。",
            "why": "複数の根拠が一致しているか、追加確認が必要な点が残るかを整理します。",
            "target": "[data-evidence=\"bg2-reply\"]",
            "tab": "contact",
            "kind": "evidence",
            "source": "reply"
          },
          {
            "id": "draft",
            "title": "判断・根拠・次の対応を自分の言葉でまとめる",
            "instruction": "判定・優先度・対象・対応を選び、「確認した事実・判断の理由」と「未確認事項・引き継ぎ」を記入します。確認済みのファイル数・媒体・結果を含め、利用者の申告とログの事実を区別します。次の対応は端末側と媒体側で必要なことを考えて書きます。",
            "why": "他の担当者へ引き継げる報告にします。推測を事実のように書かず、確認できた範囲を示します。",
            "target": "#draft-summary",
            "kind": "draft",
            "fields": [
              "verdict",
              "priority",
              "target",
              "action",
              "summary",
              "nextStep"
            ]
          },
          {
            "id": "submitted",
            "title": "対応を提出し、根拠と報告を振り返る",
            "instruction": "証拠と記入内容を見直して「判断と対応を記録する」を押します。不足が示されたら調査を補って再提出できます。",
            "why": "自分の報告と参考例を比べ、根拠や未確認事項が伝わるかを振り返ります。",
            "target": "#case-form .submit",
            "kind": "submitted"
          }
        ]
      }
    },
    {
      "id": "bridge-service-auth",
      "scenarioId": "bridge",
      "difficulty": "low",
      "title": "サービス用アカウントの認証失敗が続いた",
      "subtitle": "metrics-03 / 時系列で設定変更を照合する",
      "host": "metrics-03",
      "user": "svc-metrics",
      "source": "認証",
      "severity": "medium",
      "critical": false,
      "context": "監視集計端末 metrics-03 のサービス用アカウントで認証失敗が続きました。同じ時間帯に資格情報の更新作業が予定されています。要求の出所と実行ID、更新前後の結果を照合し、警報をどう扱うか判断してください。",
      "logs": [
        {
          "id": "bg3-01",
          "time": "11:00:00",
          "offset": 0,
          "source": "認証",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "サービス用パスワードが更新された",
          "raw": "2026-10-20T11:00:00Z host=metrics-03 user=svc-metrics actor=secret-rotation request=ROT-203 credential_version=32 operation=password_rotate result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg3-02",
          "time": "11:00:05",
          "offset": 0,
          "source": "認証",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "集計ジョブの認証が失敗",
          "raw": "2026-10-20T11:00:05Z host=metrics-03 user=svc-metrics src=10.28.30.3 client=metrics-collector job=MET-203 credential_version=31 result=failed reason=old_credential",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg3-03",
          "time": "11:00:35",
          "offset": 0,
          "source": "認証",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "同じジョブの再試行で失敗が継続",
          "raw": "2026-10-20T11:00:35Z host=metrics-03 user=svc-metrics src=10.28.30.3 client=metrics-collector job=MET-203 credential_version=31 result=failed reason=old_credential attempts=6",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg3-04",
          "time": "11:01:00",
          "offset": 0,
          "source": "運用",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "サービスに更新済み資格情報を反映",
          "raw": "2026-10-20T11:01:00Z host=metrics-03 user=svc-metrics actor=ops-secret request=ROT-203 service=metrics-collector credential_version=32 operation=reload result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg3-05",
          "time": "11:01:10",
          "offset": 0,
          "source": "認証",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "更新後の集計ジョブが認証に成功",
          "raw": "2026-10-20T11:01:10Z host=metrics-03 user=svc-metrics src=10.28.30.3 client=metrics-collector job=MET-203 credential_version=32 result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg3-07",
          "time": "11:02:00",
          "offset": 0,
          "source": "アプリ",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "メトリクス集計結果を更新",
          "raw": "2026-10-20T11:02:00Z host=metrics-03 user=svc-metrics job=MET-203 operation=aggregate_publish result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg3-06",
          "time": "11:05:00",
          "offset": 0,
          "source": "監査",
          "host": "metrics-03",
          "user": "svc-metrics",
          "ip": "10.28.30.3",
          "event": "警報対象要求の出所と終息を集計",
          "raw": "2026-10-20T11:05:00Z host=metrics-03 user=svc-metrics alert=AUTH-203 window=11:00:00-11:05:00 failed_requests=6 failed_src=10.28.30.3 failed_client=metrics-collector failed_job=MET-203 reason=old_credential last_failure=11:00:35 success_after_reload=4 unexpected_sources=0 audit_coverage=complete",
          "path": "/var/log/audit/events.log"
        }
      ],
      "documents": [
        {
          "id": "bg3-doc-rotation",
          "title": "資格情報更新 ROT-203 とサービス構成",
          "kind": "作業申請",
          "body": "承認済み。10月20日11:00〜11:05 UTC、svc-metrics の資格情報を31から32へ更新する。利用元は metrics-03（10.28.30.3）の metrics-collector。実行中の集計ジョブ MET-203 が古い資格情報で再試行する場合は、11:01に設定を再読込して新しい資格情報を反映する。今回の対象はこのサービスのみ。"
        },
        {
          "id": "bg3-doc-coverage",
          "title": "認証監査の見方",
          "kind": "監査仕様",
          "body": "AUTH-203 の集計は11:00〜11:05 UTCの警報対象要求を網羅する。failed_src、failed_client、failed_job は失敗要求の送信元・クライアント・実行ID。success_after_reload は再読込後に同じサービスで成功した要求数。audit_coverage=complete はこの時間帯・集計範囲の収集に欠落がない意味であり、将来の操作まで安全だという保証ではない。"
        }
      ],
      "contact": {
        "id": "bg3-contact",
        "name": "小林 真",
        "role": "監視基盤担当",
        "question": "資格情報更新と集計サービスの復旧を確認する",
        "replyId": "bg3-reply",
        "replyTitle": "小林からの回答：更新後の確認",
        "delaySeconds": 0,
        "replyText": "ROT-203 を実施しました。MET-203 が古い資格情報を使って再試行したため11:01に再読込しました。以後の認証と集計は成功し、監視画面への反映も確認済みです。今回の警報の6回の失敗は同じジョブからの要求でした。次回は再読込のタイミングを見直します。"
      },
      "hints": [
        "失敗件数だけでなく src・client・job を確認します。",
        "資格情報更新、古い情報での失敗、再読込、新しい情報での成功を時系列で並べます。",
        "警報と作業を結び付ける根拠と、復旧結果を登録します。"
      ],
      "answer": {
        "verdict": "benign",
        "priorities": [
          "low"
        ],
        "actions": [
          "close"
        ],
        "target": "metrics-03",
        "evidenceGroups": [
          [
            "bg3-06"
          ],
          [
            "bg3-doc-rotation"
          ],
          [
            "bg3-reply"
          ]
        ],
        "summary": "認証失敗6回は metrics-03 の metrics-collector、MET-203 が古い資格情報を使った要求に限定されていた。ROT-203 の予定と更新・再読込の時系列が一致し、再読込後の成功を確認した。担当者も集計の復旧を確認しているため、承認された更新に伴う警報として扱う。",
        "nextStep": "監査集計、ROT-203、担当者回答を添えてクローズする。次回の再読込順序を運用担当に見直してもらう。別の送信元や実行IDの失敗を今回と同一原因として扱わない。",
        "explanation": "失敗回数だけで攻撃とは決められません。今回は対象要求が既知のジョブに限定され、資格情報更新と復旧につながっています。予定があるだけでなく、警報の要求の出所と復旧を確認します。",
        "lessons": [
          "件数だけでなく要求の主体と実行IDを見る。",
          "予定・失敗原因・復旧を時系列でつなぐ。",
          "クローズの判断と運用改善の引き継ぎを両立する。"
        ]
      },
      "bridge": {
        "stage": "checklist",
        "objective": "認証失敗の発生元・設定更新・その後の結果をつなぎ、警報への対応を提出する。",
        "focus": "時系列と実行元から原因と復旧範囲を判断する。",
        "steps": [
          {
            "id": "context",
            "title": "対象アカウントと警報時間帯を確認する",
            "instruction": "「依頼・状況」を開き、対象端末・利用者・検知された操作を確認します。警報時間帯とサービスを確認します。",
            "why": "最初に対象と確認事項を絞ると、別の端末や操作を混ぜずに調査できます。",
            "target": "[data-action=\"context\"]",
            "kind": "seen",
            "flag": "context"
          },
          {
            "id": "logs",
            "title": "失敗・設定反映・成功を時系列で照合する",
            "instruction": "「ログ検索」で関連する行の生ログを展開します。AUTH-203 と MET-203 の時系列を比べます。",
            "why": "短いイベント名だけで結論を出さず、実行した主体・対象・結果を元の記録で確かめます。",
            "target": "[data-tab=\"logs\"]",
            "tab": "logs",
            "kind": "seen",
            "flag": "raw"
          },
          {
            "id": "log-evidence",
            "title": "失敗要求の出所を示すログを残す",
            "instruction": "ログ行の「証拠に追加」ボタンを押します。失敗の出所と設定反映後の状態を示す記録を選びます。",
            "why": "報告を受ける人が同じ事実をたどれるよう、判断を支える具体的な記録を残します。",
            "target": ".evidence-tray",
            "kind": "evidence",
            "source": "log"
          },
          {
            "id": "resources",
            "title": "更新申請の対象と実施時刻を照合する",
            "instruction": "「資産・資料」を開きます。申請の実行元・時間帯・資格情報バージョンを照合します。",
            "why": "操作が起きた事実と、その操作が許可されたかどうかは別々に確かめます。",
            "target": "[data-tab=\"resources\"]",
            "tab": "resources",
            "kind": "seen",
            "flag": "resources"
          },
          {
            "id": "document-evidence",
            "title": "照合に使った更新申請を残す",
            "instruction": "判断に用いた資料を証拠登録します。ログのどの部分と一致・不一致なのかを考えてください。",
            "why": "ログだけでは分からない業務上の背景を、独立した根拠として報告に残します。",
            "target": "[data-tab=\"resources\"]",
            "tab": "resources",
            "kind": "evidence",
            "source": "document"
          },
          {
            "id": "request",
            "title": "集計処理の復旧を担当者に確認する",
            "instruction": "「照会」タブの「確認を依頼する」を押して回答を読みます。本来の集計処理が復旧したかも確認します。",
            "why": "予定だけで実施結果を決めつけず、担当者が確認した範囲も調べます。",
            "target": "[data-tab=\"contact\"]",
            "tab": "contact",
            "kind": "request"
          },
          {
            "id": "reply-evidence",
            "title": "復旧確認の回答を根拠に残す",
            "instruction": "回答を証拠登録し、ログで確認できた事実と担当者の説明を区別します。",
            "why": "複数の根拠が一致しているか、追加確認が必要な点が残るかを整理します。",
            "target": "[data-tab=\"contact\"]",
            "tab": "contact",
            "kind": "evidence",
            "source": "reply"
          },
          {
            "id": "draft",
            "title": "原因・確認範囲・次の対応を報告する",
            "instruction": "判定・優先度・対象・対応を選び、「確認した事実・判断の理由」と「未確認事項・引き継ぎ」を記入します。判断を支える時系列と、その判断が適用できる範囲を書きます。",
            "why": "他の担当者へ引き継げる報告にします。推測を事実のように書かず、確認できた範囲を示します。",
            "target": "#draft-summary",
            "kind": "draft",
            "fields": [
              "verdict",
              "priority",
              "target",
              "action",
              "summary",
              "nextStep"
            ]
          },
          {
            "id": "submitted",
            "title": "提出して根拠と報告を振り返る",
            "instruction": "証拠と記入内容を見直して「判断と対応を記録する」を押します。不足が示されたら調査を補って再提出できます。",
            "why": "自分の報告と参考例を比べ、根拠や未確認事項が伝わるかを振り返ります。",
            "target": "#case-form .submit",
            "kind": "submitted"
          }
        ]
      }
    },
    {
      "id": "bridge-link-followup",
      "scenarioId": "bridge",
      "difficulty": "low",
      "title": "メールのURLを開いた後の状態が分からない",
      "subtitle": "sales-14 / 確認済みの事実と不明点を分ける",
      "host": "sales-14",
      "user": "n.endo",
      "source": "Proxy",
      "severity": "medium",
      "critical": false,
      "context": "営業担当者から「メールのURLを開くと読み込みが続いたので閉じた」と連絡がありました。新しく観測されたドメインのためProxyの通知も届いています。接続の許可と実際の取得・実行を区別し、現時点で言えることと必要な確認を報告してください。",
      "logs": [
        {
          "id": "bg4-04",
          "time": "12:19:40",
          "offset": 0,
          "source": "EDR",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "URL操作前の端末状態を受信",
          "raw": "2026-10-20T12:19:40Z host=sales-14 user=n.endo agent=healthy last_event_received=2026-10-20T12:19:40Z process_audit_watermark=2026-10-20T12:19:40Z",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg4-01",
          "time": "12:20:00",
          "offset": 0,
          "source": "Proxy",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "メール内URLへの接続要求を受信",
          "raw": "2026-10-20T12:20:00Z host=sales-14 user=n.endo request_id=WEB-614 method=GET url=https://delivery-notice.example/view/new domain_age_category=newly_observed operation=request_received",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg4-02",
          "time": "12:20:00",
          "offset": 0,
          "source": "Proxy",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "接続要求に許可判定を記録",
          "raw": "2026-10-20T12:20:00Z host=sales-14 user=n.endo request_id=WEB-614 destination=delivery-notice.example policy_decision=allow stage=request_policy response_status=not_recorded response_bytes=not_recorded",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg4-06",
          "time": "12:20:01",
          "offset": 0,
          "source": "Proxy",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "新しく観測した宛先の通知",
          "raw": "2026-10-20T12:20:01Z host=sales-14 request_id=WEB-614 destination=delivery-notice.example category=newly_observed threat_verdict=unclassified action=notify",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg4-03",
          "time": "12:20:02",
          "offset": 0,
          "source": "Proxy",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "応答側の記録が未収集と判明",
          "raw": "2026-10-20T12:20:02Z host=sales-14 user=n.endo request_id=WEB-614 operation=response_audit status=unavailable reason=collector_restart coverage=request_only",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg4-05",
          "time": "12:22:00",
          "offset": 0,
          "source": "端末管理",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "現在は端末へ照会できない",
          "raw": "2026-10-20T12:22:00Z host=sales-14 user=n.endo connection=offline remote_query=unavailable last_contact=2026-10-20T12:19:40Z",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg4-07",
          "time": "12:23:00",
          "offset": 0,
          "source": "端末管理",
          "host": "sales-14",
          "user": "n.endo",
          "ip": "10.28.40.14",
          "event": "端末の追加照会は保留中",
          "raw": "2026-10-20T12:23:00Z host=sales-14 operation=remote_inventory status=pending reason=device_offline query_scope=post_12:20",
          "path": "/var/log/audit/events.log"
        }
      ],
      "documents": [
        {
          "id": "bg4-doc-meaning",
          "title": "Proxyの判定段階と端末確認",
          "kind": "記録の仕様",
          "body": "policy_decision=allow は要求時点で接続を止めない判断であり、応答・取得の完了や取得物の実行を保証しない。WEB-614 の応答記録は収集器再起動で未取得。EDRの process_audit_watermark より後の端末操作は、この画面の記録では確認できない。newly_observed は初観測の分類であり、悪性の確定ではない。"
        },
        {
          "id": "bg4-doc-procedure",
          "title": "未確認のURL操作を引き継ぐ基準",
          "kind": "対応基準",
          "body": "悪性や取得・実行の成否を確定できない場合、確認済みの要求と不足記録を分けて追加調査へ引き継ぐ。URLを再度開いて確かめるよう依頼しない。安全に調査可能になった後に、操作時刻付近のブラウザ履歴・ダウンロード記録・プロセス履歴と、Proxy応答記録の復元可否を確認する。送信元メールも保全する。"
        }
      ],
      "contact": {
        "id": "bg4-contact",
        "name": "遠藤 奈央",
        "role": "営業部・端末利用者",
        "question": "URL操作時の表示と現在の端末状態を確認する",
        "replyId": "bg4-reply",
        "replyTitle": "遠藤からの回答：操作時の記憶",
        "delaySeconds": 0,
        "replyText": "12:20ごろリンクを押しました。読み込みが続き、何の画面か分からないまま閉じました。ダウンロードしたかは確認していません。移動のため端末を閉じ、現在はネットワークにつながっていません。メールは残っています。リンクはもう開かず、調査方法の案内を待ちます。"
      },
      "hints": [
        "allow はどの段階の判定か資料で確かめます。",
        "操作時刻とEDRが確認済みの時刻を比べます。",
        "不明点を「何が分からないか」「何を確認すれば埋められるか」に分けます。"
      ],
      "answer": {
        "verdict": "unknown",
        "priorities": [
          "medium"
        ],
        "actions": [
          "escalate"
        ],
        "target": "sales-14",
        "evidenceGroups": [
          [
            "bg4-03"
          ],
          [
            "bg4-doc-meaning"
          ],
          [
            "bg4-reply"
          ]
        ],
        "summary": "sales-14 から12:20に delivery-notice.example への要求があり、Proxyは要求時点で許可していた。ただしWEB-614 の応答記録は未収集で、取得の成否は不明。EDRの確認済み時刻も操作より前で、その後の実行有無を確認できない。利用者も取得結果を確認していないため、悪性や端末への影響を確定せず追加調査とする。",
        "nextStep": "調査担当へ WEB-614 の応答記録復元可否と、sales-14 の12:20前後のブラウザ履歴・ダウンロード記録・プロセス履歴の確認を依頼する。メールを保全し、再アクセスしないよう伝える。担当者と安全な端末調査方法を調整し、取得・実行や認証情報入力など追加事実が分かり次第、判定と優先度を見直す。",
        "explanation": "接続許可は取得完了の証明ではなく、記録に実行がないことも実行しなかった証明にはなりません。確認範囲が操作時刻に届かないため、悪性とも無害とも確定できません。不足する証拠と収集方法を具体的に引き継ぎます。",
        "lessons": [
          "要求・許可・完了・実行を分けて読む。",
          "確認済み時刻と調査対象時刻を比較する。",
          "判定保留でも追加確認と確認先を具体的に報告する。"
        ]
      },
      "bridge": {
        "stage": "checklist",
        "objective": "URL操作について確認済みの範囲を整理し、不明点を埋める具体的な追加調査を引き継ぐ。",
        "focus": "許可・完了・実行を混同せず、判定を保留する根拠を示す。",
        "steps": [
          {
            "id": "context",
            "title": "アクセス先と操作時刻を確認する",
            "instruction": "「依頼・状況」を開き、対象端末・利用者・検知された操作を確認します。確認済みの事実と未確認事項を分けます。",
            "why": "最初に対象と確認事項を絞ると、別の端末や操作を混ぜずに調査できます。",
            "target": "[data-action=\"context\"]",
            "kind": "seen",
            "flag": "context"
          },
          {
            "id": "logs",
            "title": "接続許可と取得・実行の成否を区別する",
            "instruction": "「ログ検索」で関連する行の生ログを展開します。要求時刻、応答記録、端末の確認済み時刻を読みます。",
            "why": "短いイベント名だけで結論を出さず、実行した主体・対象・結果を元の記録で確かめます。",
            "target": "[data-tab=\"logs\"]",
            "tab": "logs",
            "kind": "seen",
            "flag": "raw"
          },
          {
            "id": "log-evidence",
            "title": "ログの確認範囲が分かる記録を残す",
            "instruction": "ログ行の「証拠に追加」ボタンを押します。記録がどこまで確認でき、どこから不明か示す根拠を選びます。",
            "why": "報告を受ける人が同じ事実をたどれるよう、判断を支える具体的な記録を残します。",
            "target": ".evidence-tray",
            "kind": "evidence",
            "source": "log"
          },
          {
            "id": "resources",
            "title": "記録の項目と確認済み時刻の意味を確かめる",
            "instruction": "「資産・資料」を開きます。allow と newly_observed の意味を確認します。",
            "why": "操作が起きた事実と、その操作が許可されたかどうかは別々に確かめます。",
            "target": "[data-tab=\"resources\"]",
            "tab": "resources",
            "kind": "seen",
            "flag": "resources"
          },
          {
            "id": "document-evidence",
            "title": "確認範囲の判断に用いた資料を残す",
            "instruction": "判断に用いた資料を証拠登録します。ログのどの部分と一致・不一致なのかを考えてください。",
            "why": "ログだけでは分からない業務上の背景を、独立した根拠として報告に残します。",
            "target": "[data-tab=\"resources\"]",
            "tab": "resources",
            "kind": "evidence",
            "source": "document"
          },
          {
            "id": "request",
            "title": "操作時の様子と端末の状況を照会する",
            "instruction": "「照会」タブの「確認を依頼する」を押して回答を読みます。利用者が確認したことと不明なことを分けます。",
            "why": "予定だけで実施結果を決めつけず、担当者が確認した範囲も調べます。",
            "target": "[data-tab=\"contact\"]",
            "tab": "contact",
            "kind": "request"
          },
          {
            "id": "reply-evidence",
            "title": "利用者の確認範囲が分かる回答を残す",
            "instruction": "回答を証拠登録し、ログで確認できた事実と担当者の説明を区別します。",
            "why": "複数の根拠が一致しているか、追加確認が必要な点が残るかを整理します。",
            "target": "[data-tab=\"contact\"]",
            "tab": "contact",
            "kind": "evidence",
            "source": "reply"
          },
          {
            "id": "draft",
            "title": "事実・不明点・追加確認先を報告する",
            "instruction": "判定・優先度・対象・対応を選び、「確認した事実・判断の理由」と「未確認事項・引き継ぎ」を記入します。未確認事項を明記し、追加で必要な記録と確認先を具体化します。",
            "why": "他の担当者へ引き継げる報告にします。推測を事実のように書かず、確認できた範囲を示します。",
            "target": "#draft-summary",
            "kind": "draft",
            "fields": [
              "verdict",
              "priority",
              "target",
              "action",
              "summary",
              "nextStep"
            ]
          },
          {
            "id": "submitted",
            "title": "提出して根拠と報告を振り返る",
            "instruction": "証拠と記入内容を見直して「判断と対応を記録する」を押します。不足が示されたら調査を補って再提出できます。",
            "why": "自分の報告と参考例を比べ、根拠や未確認事項が伝わるかを振り返ります。",
            "target": "#case-form .submit",
            "kind": "submitted"
          }
        ]
      }
    },
    {
      "id": "bridge-local-admin",
      "scenarioId": "bridge",
      "difficulty": "low",
      "title": "業務端末に管理者アカウントが追加された",
      "subtitle": "design-06 / 自力で調査を完了する",
      "host": "design-06",
      "user": "a.nishi",
      "source": "OS監査",
      "severity": "high",
      "critical": false,
      "context": "設計端末 design-06 にローカルアカウントが作られ、管理者グループへ追加された通知が届きました。あなたがこの案件の担当です。関連記録を調査し、判断と根拠、影響範囲、次の対応をまとめて提出してください。時間制限はありません。",
      "logs": [
        {
          "id": "bg5-01",
          "time": "13:30:00",
          "offset": 0,
          "source": "認証",
          "host": "design-06",
          "user": "a.nishi",
          "ip": "10.28.50.6",
          "event": "業務アカウントが端末にログオン",
          "raw": "2026-10-20T13:30:00Z host=design-06 user=a.nishi session_id=SES-906 operation=interactive_logon result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg5-02",
          "time": "13:32:10",
          "offset": 0,
          "source": "OS監査",
          "host": "design-06",
          "user": "a.nishi",
          "ip": "10.28.50.6",
          "event": "ローカルアカウントを作成",
          "raw": "2026-10-20T13:32:10Z host=design-06 actor=a.nishi session_id=SES-906 operation=local_user_create target_user=help-cache target_sid=S-1-5-21-906-1051 result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg5-03",
          "time": "13:32:12",
          "offset": 0,
          "source": "OS監査",
          "host": "design-06",
          "user": "a.nishi",
          "ip": "10.28.50.6",
          "event": "新規アカウントを管理者グループへ追加",
          "raw": "2026-10-20T13:32:12Z host=design-06 actor=a.nishi session_id=SES-906 operation=local_group_add target_sid=S-1-5-21-906-1051 target_user=help-cache group=Administrators result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg5-06",
          "time": "13:32:13",
          "offset": 0,
          "source": "OS監査",
          "host": "design-06",
          "user": "a.nishi",
          "ip": "10.28.50.6",
          "event": "権限変更の通知を転送",
          "raw": "2026-10-20T13:32:13Z host=design-06 target_user=help-cache target_sid=S-1-5-21-906-1051 operation=alert_forward result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg5-04",
          "time": "13:33:00",
          "offset": 0,
          "source": "認証",
          "host": "design-06",
          "user": "help-cache",
          "ip": "10.28.50.6",
          "event": "追加されたアカウントでログオン",
          "raw": "2026-10-20T13:33:00Z host=design-06 user=help-cache user_sid=S-1-5-21-906-1051 session_id=SES-907 operation=interactive_logon result=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg5-05",
          "time": "13:34:00",
          "offset": 0,
          "source": "端末管理",
          "host": "design-06",
          "user": "system",
          "ip": "10.28.50.6",
          "event": "追加された管理者権限が現在も有効",
          "raw": "2026-10-20T13:34:00Z host=design-06 operation=account_inventory target_user=help-cache target_sid=S-1-5-21-906-1051 enabled=true local_group=Administrators collected=success",
          "path": "/var/log/audit/events.log"
        },
        {
          "id": "bg5-07",
          "time": "13:35:00",
          "offset": 0,
          "source": "EDR",
          "host": "design-06",
          "user": "system",
          "ip": "10.28.50.6",
          "event": "端末の管理通信は継続中",
          "raw": "2026-10-20T13:35:00Z host=design-06 agent=healthy heartbeat=success",
          "path": "/var/log/audit/events.log"
        }
      ],
      "documents": [
        {
          "id": "bg5-doc-policy",
          "title": "設計端末のアカウント管理と当日の作業申請",
          "kind": "権限・申請",
          "body": "design-06 の利用者は西。管理アカウントは端末管理担当が管理し、利用者判断による新規ローカル管理者作成は禁止。10月20日のこの端末に対するアカウント追加・権限付与の承認申請はない。a.nishi には旧設定により管理者操作権限が残っており是正対象だが、技術的に操作できることは操作の承認を意味しない。"
        },
        {
          "id": "bg5-doc-response",
          "title": "未承認の管理者追加時の対応基準",
          "kind": "対応基準",
          "body": "未承認のローカル管理者追加が実際に成功した場合は権限管理のインシデントとして対応する。追加アカウントの利用抑止と端末の追加操作抑止を管理担当に依頼し、作成・権限付与・利用記録を保全する。削除や再インストールを急いで証拠を消さない。確認済みの端末範囲を報告し、他端末への展開や情報持ち出しは追加調査で判断する。"
        }
      ],
      "contact": {
        "id": "bg5-contact",
        "name": "西 明",
        "role": "設計部・端末利用者",
        "question": "新規アカウント作成と管理者追加の意図を確認する",
        "replyId": "bg5-reply",
        "replyTitle": "西からの回答：操作の経緯",
        "delaySeconds": 0,
        "replyText": "社外の掲示板で見つけたアプリ改善手順を見て、13:32ごろ help-cache を作り管理者グループへ追加し、そのアカウントでログオンしました。社内申請も端末管理担当への相談もしていません。いまは操作を止めています。参照した手順と実施内容を共有できます。"
      },
      "hints": [
        "名前とSIDを使い、作成・権限付与・利用の記録を照合します。",
        "操作権限があったことと業務上の承認を分けて確認します。",
        "対象端末とアカウントを特定し、権限の利用抑止と記録保全を引き継ぎます。"
      ],
      "answer": {
        "verdict": "incident",
        "priorities": [
          "high"
        ],
        "actions": [
          "contain",
          "escalate"
        ],
        "target": "design-06",
        "evidenceGroups": [
          [
            "bg5-03",
            "bg5-05"
          ],
          [
            "bg5-doc-policy"
          ],
          [
            "bg5-reply"
          ]
        ],
        "summary": "design-06 で help-cache（SID S-1-5-21-906-1051）が作成され、Administrators への追加に成功した。追加後のログオンと現在も有効な権限を確認した。承認申請はなく、利用者も社外手順に従い未申請で作成したと回答しているため、未承認の管理者権限付与として対応する。他端末や情報持ち出しへの影響は未確認。",
        "nextStep": "端末管理担当と対応担当へ連絡し、help-cache の利用抑止、design-06 の追加操作抑止、作成・権限付与・ログオン記録の保全を依頼する。参照した手順と実施内容を取得し、追加ログオン後の操作と他の変更有無を確認する。a.nishi の過剰な権限も管理担当へ是正を引き継ぐ。",
        "explanation": "操作できることは業務上の承認を意味しません。今回は権限追加の成功、現在の状態、承認状況、回答が一致しています。攻撃者による侵入と断定する必要はありませんが、残存する権限を抑止し、実施操作を調べる必要があります。",
        "lessons": [
          "操作権限と承認を区別する。",
          "名前だけでなくSIDで操作を結び付ける。",
          "確認済みの変更に対処し、未確認の影響を別途調べる。"
        ]
      },
      "bridge": {
        "stage": "independent",
        "objective": "自分で調査の順序を決め、判定・優先度・対象・対応と、証拠付きの調査要約・次の対応を提出する。",
        "focus": "根拠を自分で選び、引き継げる報告を完成させる。",
        "steps": []
      }
    }
  ]
};
  root.SOC_DATA=data;
  if(typeof module==="object"&&module.exports)module.exports=data;
})(globalThis);
