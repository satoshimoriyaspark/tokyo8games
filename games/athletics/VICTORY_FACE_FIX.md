# バンザイの顔統一
実装: 99cc57b505815a821fc0b27d5f4f48583a4f7b6e
対象: feature/8bit-athletics-web-beta / games/athletics/
Preview: https://tokyo8games-fin77g0fd-tokyo8games.vercel.app/games/athletics/index.html

真ん中のコマを基準として、3コマの顔・髪・目・口を同じ位置・同じピクセルで統一。暗い輪郭も取り込み、腕が下がった時に輪郭が途切れないよう調整。腕・胴体・脚、48pxフレーム、既存のコマ順は維持。
変更ピクセルは左右2コマの頭部415ピクセル。中央コマは変更していない。

変更ファイル（games/athletics/配下）:
- assets/sprites/cute_v2/victory_front.png
- tools/unify-victory-face.cjs、tools/build-cute-sprites.cjs
- tests/victory-checks.cjs、tests/victory.html
- tests/evidence/victory-face-before.png、victory-face-browser.jpg
- VICTORY_FACE_FIX.md

確認:
- victory-checks.cjs成功。顔の基準ピクセル一致、腕の対称性、頭部以外のピクセル不変、透過の0/255、6段階の演出順を確認。
- クラウドChromeで暗い背景・明るい背景の3コマを拡大確認。実ゲーム描画による演出再生と中間ポーズを確認。
- PCの実ブラウザ相当の確認。iPhone/Android実機・端末エミュレーションは未実施。
- main・本番は変更していない。

ImageGenの組み込み編集モードで「中央の顔・頭を3コマに同一化し、腕・ユニフォーム・脚・靴を保持。48pxグリッド、角張った太い輪郭、透過背景」を指示し参考案を確認。
実装では生成案への置換を避け、ユーザーが選んだ既存の中央コマの画素を直接共用。最終素材はassets/sprites/cute_v2/victory_front.png。
