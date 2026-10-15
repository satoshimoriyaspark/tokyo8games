# BGM・キャラクター更新（2026-10-15）

対象: satoshimoriyaspark/tokyo8games / feature/8bit-athletics-web-beta / games/athletics/
実装コミット: 43179142d1e1af31785321b161c0a40e475bd0b9
確認済みPreview: https://tokyo8games-b8mi00ops-tokyo8games.vercel.app/games/athletics/index.html
main・本番には反映していません。

## BGM
Google Drive指定フォルダの音源をそのまま配置。元曲の削除・上書きなし。

| 配置（assets/audio/） | 元ファイル | 再生条件 |
|---|---|---|
| opening.mp3 | Track & Field 8-Bit.mp3 | 最初の操作後、タイトル・ストーリー・種目選択・説明でループ。同じ曲の画面間は継続 |
| game.mp3 | Finish Line Dash.mp3 | GOでループ開始。ゴール・記録確定で停止 |
| result-short.mp3 | result-short.mp3 | 1位でも新記録でもない通常結果で1回 |
| champion-short.mp3 | champion-short.mp3 | 1位の結果表示で1回 |
| new-record-short.mp3 | new-record-short.mp3 | NEW RECORD表示で1回。1位時はChampionに重ねる |

READY・ゴール演出中はBGM停止。再挑戦はREADYを経てGOで曲を最初から開始。タイトルへ戻るとopeningを再生。
単一AudioContext、共有master gain、5曲のデコードキャッシュで管理。同一sceneの呼び出しは再スタートしない。非同期読み込みは世代番号で古い再生要求を無効化。
BGM音量0.4、新記録0.75。Champion＋新記録時はChampionを0.18に下げ、終了後0.4へ戻す。
既存効果音は同じmasterへ接続。全音声ON/OFFをlocalStorageに保存。操作前はAudioContextを作らず、初回操作内でresume。非表示時suspend。

## キャラクター
11シート・39コマをcute_v2へ追加。顔の色数・目の周辺・靴の灰色を整理し、正面の笑顔を明瞭化。
既存の輪郭、頭身、髪型、ポーズ、透明領域、フレーム寸法、基準点、足元を維持。CPU色替えも維持。
ImageGenの透過編集モードで元39コマのアトラスを参照し顔案を生成。その顔部分だけを元の顔マスク内に統合し、生成された身体は採用していない。
生成指示の要旨: 同じ39コマ・8列5行、茶髪と黄色ユニフォーム、角張った太い輪郭を保ち、顔のドット・目・笑顔を簡潔に。ポーズや頭身を変えず、透明背景、アンチエイリアスなし。
生成素材: assets/sprites/cute_v2/face-design-source.png
再生成処理: tools/build-cute-sprites.cjs
比較画像: tests/evidence/cute-comparison.png（上:変更前、下:変更後）
処理記録: assets/sprites/cute_v2/build-report.json。顔3667ピクセル変更。孤立ピクセル削除数は0で、今回の主な整理対象は内部の色・顔表現。

## 変更ファイル
すべてgames/athletics/配下。
- index.html、audio.js
- assets/audio/: opening.mp3、game.mp3、result-short.mp3、champion-short.mp3、new-record-short.mp3
- assets/sprites/cute_v2/: idle_right.png、start_right.png、sprint_right.png、jog_right.png、victory_front.png、podium_front.png、hurdle_right.png、javeball_prepare_right.png、javeball_release_right.png、long_jump_provisional.png、javeball_follow_right.png
- 同フォルダ: face-design-source.png、frame-map.json、build-report.json
- tools/build-cute-sprites.cjs
- tests/audio-checks.cjs、tests/audio-probe.js、tests/audio.html、tests/node-checks.cjs
- tests/evidence/cute-comparison.png、jave-checks.json、bgm-cute-browser.jpg
- BGM_AND_CHARACTER_UPDATE.md（本報告）

## 確認結果
PC相当: クラウドChrome実ブラウザ。端末エミュレーションではないが、利用者のPC実機ではない。
- QA画面で初回操作前の音声ロック、操作後の5曲デコード、AudioContext running、読み込みerrorなしを確認。
- タイトル→種目選択でopeningの開始回数が増えないことを確認。
- READY停止、GOでgame、ゴール停止、通常result、1位champion、新記録record、1位＋新記録champion＋recordを再生状態表示で確認。
- 再挑戦停止とタイトル復帰、音声OFF→ON、ゲーム画面へ移動後ON保持を確認。
- 実ゲームでタイトル→ストーリー→種目選択→100m説明→スタート画面を操作し、新スプライトの描画を確認。bgm-cute-browser.jpgを保存。
- 音声は再生状態とデコードを検証。スピーカー出力の聴感評価は未実施。
- Safari / Edge: 未実施。
- iPhone Safari実機: 未実施。iPhoneエミュレーションも未実施。
- Android Chrome実機: 未実施。Androidエミュレーションも未実施。

自動検証:
audio-checks.cjs成功。30回の再挑戦、同一sceneの連続呼び出し、ループ/単発、Championの音量復帰、ミュート保存、遅延ロードのキャンセルを確認。
既存node-checks.cjs成功: competition 211、time 335、longjump 38、jave 28、regression 206、motion 38。
数値得点は維持。NEW BEST表示のNEW RECORDへの変更に伴い、検証は得点文字列でなく数値を比較。
自動検証はブラウザやスマートフォン実機の代替ではありません。

## 本番反映
開発プレビューへ反映済み。本番反映前にSafari/Edge、iPhone Safari、Android Chromeで初回音声解放・連続プレイ・音量バランスの確認が必要です。現時点で全環境確認済みとは判断していません。
