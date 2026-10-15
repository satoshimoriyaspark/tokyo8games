# バンザイの腕・コマ順修正（2026-10-15）

対象: feature/8bit-athletics-web-beta / games/athletics/。
実装コミット: e9a77069b570e62a1dc0765dbedafd2c26f36864
確認済みPreview: https://tokyo8games-f9sluhwjr-tokyo8games.vercel.app/games/athletics/index.html

原因: victory_front.pngの各コマで左右の腕の形・手の高さが不揃い。演出も旧順序0→1→2を繰り返し、腕を下ろした直後に再び上がっていた。

修正:
- 既存PNGの左腕を基準に、肩と頭・胴体の境界を避けた領域だけ右腕を対称化。全3コマ、155ピクセル変更。
- 144×48、48×48の3コマ、基準点を維持。腕以外の顔・髪・胴体・足の全ピクセルは変更なし。
- 演出を2→0→1→1→0→2（下ろす→曲げる→バンザイ保持→曲げる→下ろす）へ変更。バンザイは0.4秒保持。
- キャラクター再構築時も腕修正を適用するようにした。

変更ファイル:
- assets/sprites/cute_v2/victory_front.png
- index.html
- tools/align-victory-arms.cjs、tools/build-cute-sprites.cjs
- tests/victory-checks.cjs、tests/victory.html
- tests/evidence/victory-before.png、victory-browser.jpg
- VICTORY_ARMS_FIX.md

検証:
- victory-checks.cjs成功。3コマの腕対称、腕以外のピクセル一致、透明度0/255、コマ順を確認。
- 既存node-checks.cjs成功（competition 211、time 335、longjump 38、jave 28、regression 206、motion 38）。
- クラウドChrome実ブラウザで、暗い背景・明るい背景の全3コマと実ゲーム描画関数によるゴール後演出を確認。再生・各ポーズ停止を操作し、比較画像を保存。
- スマートフォン実機確認・端末エミュレーションは未実施。
- main・本番・他ゲームは変更なし。

画像編集:
組み込みimagegen編集モードで対称な腕の参考案を確認。顔・身体を確実に維持するため、実装PNGは既存の腕ピクセルを左右対応させた。生成画像をそのまま置換していない。
指示: 既存3コマの腕と手だけを修正し、曲げる・バンザイ・下ろすの各姿勢で左右の手の高さと腕の長さを揃える。顔・髪・胴体・脚・靴・頭身・基準点を維持。太い角張った輪郭、48pxグリッド、透過背景、補間なし。
実装素材の保存先: games/athletics/assets/sprites/cute_v2/victory_front.png
