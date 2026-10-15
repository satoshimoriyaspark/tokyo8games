# ハードルバランス調整

変更: index.html、tests/competition-probe.js、tests/competition.html。
衝突時の残存速度48%→72%、衝突後0.16秒は加速不可。ジャンプ受付は到達予定0.08〜0.42秒前、PERFECTは0.18〜0.30秒前。PERFECTクリア時は速度+0.45（既存上限内）。再ジャンプは0.6秒間隔でB連打による無敵延長を防止。
CPU速度をハードル専用の5段階9.5/10.6/11.5/11.85/12.15に調整（各CPUの既存skill倍率あり）。他競技のCPUは不変。
Nodeによる毎秒6回A・最適Bの試走: ノーミス8.983秒、1衝突9.150秒、3衝突9.450秒、10衝突10.367秒。難易度3の先頭CPU9.378秒。これはシミュレーション時間。端末の手動試遊結果ではない。
難易度5は毎秒約8.6回A・ノーミスで勝てることも検証。競技241、時間335、幅跳び39、ジャベボール39、回帰206、モーション38項目PASS。
本番main・他ゲームは変更なし。

Chrome確認: デプロイ済みQAで241項目PASS。難易度3・1回衝突の自動試走でゴール後に「結果を見る」まで進め、YOU 24.58秒・1位、CPU1 24.69秒を実画面で確認。画像: tests/evidence/hurdle-balance-result.jpg。実機iPhone/Android・Safari/Edgeは今回未確認。
Runtime commit: 9404ec01ae2663dbaf97f2cd2024f23de96c648b
Preview: https://tokyo8games-145evaath-tokyo8games.vercel.app/games/athletics/index.html
