# ジャベボールのライン超過ファウル修正

- 対象: feature/8bit-athletics-web-beta / games/athletics/
- Runtime commit: 50d18591b6d66146fb7d75498deb59df65cd8651
- Preview: https://tokyo8games-lkfwovf8e-tokyo8games.vercel.app/games/athletics/index.html

## 幅跳びの緑の表示
drawLongJumpField の line-27,267 に描画する27×6ピクセルの踏切位置の目印。スプライトの残骸ではない。今回は用途の確認のみで変更なし。

## 修正
ジャベボールの助走が投てき線に達した際の自動投球を廃止し、ファウル・記録なしとして1試技を消費する。B長押し中も同じ判定。超過後のB解除による記録復活を防止。ファウル時は投球の飛行と追従カメラを開始せず、次の試技で状態を初期化する。手前で投げた場合の距離計算、飛行、着地、距離目盛りは維持。

## 変更ファイル
- index.html
- tests/javeball-probe.js
- tests/javeball.html
- tests/evidence/jave-checks.json
- tests/evidence/jave-foul-browser.jpg
- JAVEBALL_FOUL_FIX.md

## 確認
Node: Competition 211 / Time conversion 335 / Long jump 38 / Javeball 38 / Regression 206 / Running-start 38 全PASS。
クラウドChrome: デプロイ済みQAページで38項目PASS、ライン超過場面を実際に描画してFOUL・記録なし、飛行・追従なしを目視確認。ゲーム入口の表示も確認。
画像は旧比較ベースラインと現行版の同じライン超過場面。ベースラインには以前の外観差分も含む。
iPhone / Android実機、Safari / Edgeは今回未確認。端末エミュレーションも今回未実施。
main、本番、他ゲームへの変更なし。
