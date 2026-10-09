# アリィ FIXスプライト実装（2026-10-10）

対象: `feature/ary-sprite-qc` の `games/ary/`。main・安定版・他ゲーム・DNSは変更しない。

## 素材

- 正式原画: Google Drive `KATSUCOLLE_CHAR_ARII_FIX_v1.0_20260919.png`（確認済み）。
- 走行: ユーザー添付 `ary_ride_game(1).png` を使用。白い輪郭の指摘を受け、2026-10-10に透過（アルファ）のみ補正。RGB・寸法・フレーム位置は変更しない。384×80、64×80の6コマ。
- アクション: 承認済みシート `CC25583D-7C63-41D2-867E-B6330F1A887E.jpeg` から切り出し。ジャンプ5、二段ジャンプ3、スライド3。各72×88。同じシートから謎の猫の走行2コマも切り出し。
- ジャンプ等は背景マスクと最近傍縮小のみ。RGB変更・再生成・描き直し・色数削減・独自パレット変換をしない。JPEG原本に由来する縁は端末で最終確認が必要。
- 走行用の入力PNGは提供時点でパレット形式だが、透過補正後はRGB値をそのままRGBAで保存し、ブラウザで標準デコードする。パレットの色数削減や独自デコードは行わない。
- `asset-manifest.json` に寸法・SHA-256を記録。再切出しは `tools/extract-actions.py` に原本パスを指定する。

## 実装

- `sprites.js`: 外部PNGの読込、寸法検証、15秒タイムアウト、再試行、フレーム選択、Canvas描画。走行10fps。
- 走行の前輪位置・接地基準をフレーム別アンカーで合わせる。アリィとキックボードは一体の画像として描画する。
- `game.js`: 既存の60Hz進行・115秒ステージ・得点・接触判定・操作を維持。描画レイヤーのエラーを隔離し、アイテムの描画失敗でアリィを消さない。
- 起動時は必要なPNGが読めるまでスタートを待ち、失敗時は再試行を表示する。簡易キャラクターへの差し戻しはない。
- 一段ジャンプは開始/上昇/頂点/下降/着地。二段ジャンプは専用3コマ。スライドは開始6tick/低姿勢30tick/復帰6tick。
- リサイズや縦横切替でCanvasを作り直さず、CSSで表示サイズだけを変更する。背景タブ移動は自動一時停止。
- 旧 `ride-sprite.js` のBase64/インデックス色復元処理は削除。

## 検証と制約

`node games/ary/tests/regression.cjs`（Node.js、`@napi-rs/canvas@0.1.100`）:

- 実PNGデコード、画像エラー/再試行、最近傍、フレーム境界。
- 走行6コマ、ジャンプ5段階、二段ジャンプ/三段目禁止、スライド3段階。
- チップ/取材メモ取得と得点、コーン/看板接触、スライドで看板回避。
- タップ/下スワイプのイベント入力、一時停止/再開、タブ非表示、クリア/リトライ。
- 描画例外注入時にもアリィを描画、3分相当（10,800tick）のシミュレーションと毎フレームの実Canvas描画・ピンク髪ピクセル検査。
- ステージクリア加点の重複と、クリア直前のゲームオーバー上書きを防止。

これはNode Canvasと模擬DOMによる検証。iPhone Safari・Android Chrome・PCブラウザ、実端末の縦横切替、実時間3分の確認は別途必要。実機確認済みと扱わない。

`qa/ary-animation-preview.mp4` はゲーム描画コードで作成した7秒の動作見本。走行/ジャンプ/二段ジャンプ/スライドを表示する。撮影用に障害物を除いた描画検証であり、端末の録画ではない。

## 白い輪郭の修正

ユーザーの実機確認で見つかった白い縁・背景残片を `tools/clean-alpha.py` で除去。透明領域から2px以内の明るい無彩色に近いピクセル、孤立した残片、背後の速度線の白い残りだけを透明化。髪・服・瞳等のRGB値は全ピクセルで維持。元PNGは親コミット `60c05b1` に保管されている。再処理は必ず補正前のPNGを入力し、重ねがけしない。

## Obstacle readability update — 2026-10-10

- Ground obstacle: orange/white traffic cone with tapered silhouette, dark outline and wide base; jump to clear it.
- Overhead obstacle: left-facing crow, four-tick wing cycle (two wing silhouettes), blue feather highlights, beak and ground shadow; slide underneath. Replaces the ambiguous floating sign.
- Artwork is native Canvas pixel geometry in `game.js`; no new image dependency or changes to approved Ary PNGs.
- Crow body stays at logical y=84; an offscreen `!` and `↓ くぐろう！` announce arrival. Cone hint is `↑ ジャンプ！`.
- Alternate hazards every 180 simulation ticks, approximately three seconds apart at the player. Crow scrolls at 3px/tick, cones at 2.25px/tick.
- Solid-body AABB collision uses actual vertical position and slide posture. Wing tips and shadows are not solid. Jumping can also clear a crow if the player's body is fully above it.
- Regression coverage: cone contact/jump clearance, standing crow contact/slide clearance, airborne crow contact, existing scoring and 180-second rendered simulation. Real-device iOS/Android testing remains pending.
