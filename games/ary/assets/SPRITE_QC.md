# アリィ スプライト制作QC

デザイン基準: ユーザー承認済みのキャラクターシート `CC25583D-7C63-41D2-867E-B6330F1A887E.jpeg`。

- 走行6コマ: `ary_ride_qc.png`（384×80、各コマ64×80、背景透過、制作中QC素材）
- 順序: 走行1→走行2→走行3→走行4→走行5→走行6
- 描画基準: 最近傍補間、同一座標で表示、アニメーションは8〜12fps
- 本スプライトはユーザー提供のFIXデザインシートからの切り出し。背景除去の縁やラベル混入などは実機QCが必要
- ジャンプ、スライド、ゴール、探索は別シートから切り出して検証する
- 現在のWebゲームには未組み込み。PNG本体は制作成果物として別途提供し、リポジトリへの配置後に画像読み込み処理を実装する
- 安定版 `feature/ary-run-beta` は変更しない

## 2026-10-10 QC progress
- Verified the extracted source PNG is 384×80 RGBA, six 64×80 frames.
- Built a self-contained browser preview `ary_ride_animation_qc.html` with the actual PNG embedded, nearest-neighbor scaling, adjustable 3–16fps, pause and frame-step controls.
- Preview and PNG are delivered as conversation artifacts; the binary PNG has **not yet been committed** to GitHub, so the deployed game still uses its procedural QC character.
- Next step: upload the approved binary sprite to `games/ary/assets/ary_ride_qc.png`, then integrate an Image-based animation with a fallback sprite, followed by slide/jump frame extraction and visual QC.
- Keep `feature/ary-run-beta` unchanged until regression tests pass.
