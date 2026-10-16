# 8BIT ATHLETICS 本番公開確認 — 2026-10-17 JST

- 本番: https://tokyo8games.com/ath
- Commit: 4e3e899bedd28d553a2d71a0625820727ddac100
- Vercel: dpl_AQA63EBpeHH4NscBHCH29FFC3pxm / production / READY
- ベース: 1d88ff2bc0dd3edd8350e297132f947ba60cc52b。既存ゲーム、AIBの非公開ルート、ポータルBGMを保持。

## 変更
- games/athletics/：開発ブランチの完成版を初回公開。スプライト、BGM、5種競技、ハードル調整を含む。
- games/athletics/index.html：/ath用base・canonical・ポータルへの戻るリンク。
- index.html：PLAY/SHARE付きカード、公開日2026年10月17日。
- vercel.json：/ath・/ath/からローカルHTMLへの内部rewrite。

## 確認
- Cloud Chrome: プレビューのタイトル→ストーリー→選択→100m→結果→選択→タイトルを確認。
- 本番/athの直接表示、ロゴ・選手画像、ポータル往復、PLAYから/ath、公開日を確認。
- 本番QA: 241 assertions PASS。390px競技画面・ボタン、820pxジャベボール角度ゲージを視認。これはiframe幅変更によるレスポンシブ確認で、端末OSエミュレーション・実機確認ではない。
- Node: competition241/time335/longjump39/javeball39/regression206/motion38 = 898 assertions PASS。
- Audioテスト: gesture lock、継続、loop/one-shot、duck、mute保存、30回再挑戦、load競合の無効化、5音源キャッシュ PASS。
- 本番Audio QA: ユーザー操作後context running、5MP3 decode完了・error空。opening開始回数1のまま種目選択へ継続。game→silent→champion+recordの開始を確認。
- /kks /kwb /sqz の各タイトル・初期画面到達を確認。ソース変更なし。

## 限界
- 実スピーカーの聴取、iPhone Safari・Android Chrome実機、PC Safari/Edgeは未確認。
- 追加プレビューQAページは再認証要求のため、本番公開後に検証。ゲーム本体プレビューの表示確認は公開前に実施。
- Runtimeログ・監視drainの設定確認は未実施。

証跡: tests/evidence/production-20261017.jpg
