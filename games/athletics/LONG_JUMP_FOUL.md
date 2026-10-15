# 幅跳び踏切ファウル修正

2026-10-15 JST。runtime f16b9552307a50981cc624d3f63574ba20b866a7。

原因: 助走終了時にposを40へ固定してfinishAttempt()を呼び、32〜40の有効範囲として距離を記録していた。B未入力でも有効記録となり、手動で40超過を設定する従来テストでは検出できなかった。

修正: B未入力で踏切線到達・超過した試技は強制ファウル。遅れてBを押しても救済しない。FOUL／踏切線を越えました・記録なしを表示し、1試技を消費して次へ進む。時間切れも自動ジャンプさせない。手前からの正しいB入力・飛距離式・3回の最高記録・着地追従は維持。

Chromeのtests/long-jump.htmlで38項目通過し、踏切線超過の描画を確認。Nodeでも全既存検証通過。証跡 tests/evidence/long-jump-foul-browser.jpg。左は既存の跳躍演出変更前baseline、右は今回修正版。実機未確認。

確認URL: https://tokyo8games-c4nasbymr-tokyo8games.vercel.app/games/athletics/index.html
変更: index.html / tests/long-jump-probe.js / tests/long-jump.html / tests/evidence/long-jump-checks.json。
main・他ゲーム変更なし。
