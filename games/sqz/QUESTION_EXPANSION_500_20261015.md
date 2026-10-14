# サッカークイズ500問版

対象: feature/soccer-quiz-beta / games/sqz。Previewのみ。本番反映なし。

既存280問を変更せず220問追加。ID、選択肢、解説、難易度を含め既存データの一致を確認。画像、音声、保存形式、4択操作は変更なし。

## 追加内訳

| 分野 | 初級 | 中級 | 上級 | 合計 |
| --- | ---: | ---: | ---: | ---: |
| 基本ルール | 38 | 18 | 4 | 60 |
| 代表国・2022年日本代表の所属クラブ | 40 | 15 | 5 | 60 |
| 欧州クラブの協会・Jクラブの地域 | 53 | 7 | 0 | 60 |
| EUROの歴史 | 0 | 10 | 30 | 40 |

追加131問を初級に設定。初級対象174問（国旗OFFでも161問）、中級対象386問、上級対象500問。中級・上級はそれ以下のレベルも出題対象。既存の深掘り4テーマは各20問を維持し、中級から出題。

## 出典・編集方針

IFAB競技規則、FIFA 2022年W杯公式登録リスト、UEFAクラブ記録・EURO公式記録、Jリーグ公式ホームタウン一覧を照合。国籍ではなく大会での代表チームを問う。所属クラブは2022年大会登録時と明記。EURO 2020は2021年開催。協会区分と国家の区分を混同しない。規則は通常の11人制を対象とし、少年大会などの変更規定は含まない。

各問題にURL、対象時期、短い解説を保存。現役選手の現在の所属や更新される通算記録は追加しない。全500件のID、4択の一意性、正解包含、国旗以外の設問テキストの重複なしを確認。

## 検証

`node --test tests/sqz-shot.test.cjs`: 17件成功。連続回答、スキップ、正誤判定、再開、結果、読み上げ、音声呼び出し、音声ファイルのデコード、初級の3ラウンド30問重複なしを検証。実機での音の聞こえ方はこの変更では再検証していない。

## 追加問題一覧

| ID | レベル | 設問 | 正解 | 出典 |
| --- | ---: | --- | --- | --- |
| pack500-rules-001 | 1 | 11人制サッカーで、1チームが同時にピッチに立てる最大人数は？ | 11人 | [公式資料](https://www.theifab.com/laws/latest/the-players/) |
| pack500-rules-002 | 1 | 11人の選手のうち、必ず1人置くポジションは？ | ゴールキーパー | [公式資料](https://www.theifab.com/laws/latest/the-players/) |
| pack500-rules-003 | 1 | 通常の成人の11人制サッカーで、前半と後半はそれぞれ何分？ | 45分 | [公式資料](https://www.theifab.com/laws/latest/the-duration-of-the-match/) |
| pack500-rules-004 | 1 | 前半と後半の間に取る休憩は何という？ | ハーフタイム | [公式資料](https://www.theifab.com/laws/latest/the-duration-of-the-match/) |
| pack500-rules-005 | 1 | 試合開始時、センターマークから行う再開方法は？ | キックオフ | [公式資料](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/) |
| pack500-rules-006 | 1 | ゴールが認められた後、キックオフするのはどちら？ | 失点したチーム | [公式資料](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/) |
| pack500-rules-007 | 1 | 後半に入ると、両チームが攻めるゴールの方向はどうなる？ | 前半と入れ替わる | [公式資料](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/) |
| pack500-rules-008 | 1 | ボールがラインの外に出たと判定されるのは？ | ボール全体がラインを越えたとき | [公式資料](https://www.theifab.com/laws/latest/the-ball-in-and-out-of-play/) |
| pack500-rules-009 | 1 | 反則がないとき、ゴールが認められるボールの位置は？ | 全体がゴールラインを越える | [公式資料](https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/) |
| pack500-rules-010 | 1 | 通常、試合の勝者になるのはどんなチーム？ | 得点が多いチーム | [公式資料](https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/) |
| pack500-rules-011 | 1 | ボールがタッチラインを越えて外に出たときの再開方法は？ | スローイン | [公式資料](https://www.theifab.com/laws/latest/the-throw-in/) |
| pack500-rules-012 | 1 | 攻撃側が最後に触り、ゴールにならずゴールラインを越えたら？ | ゴールキック | [公式資料](https://www.theifab.com/laws/latest/the-goal-kick/) |
| pack500-rules-013 | 1 | 守備側が最後に触り、ゴールにならずゴールラインを越えたら？ | コーナーキック | [公式資料](https://www.theifab.com/laws/latest/the-corner-kick/) |
| pack500-rules-014 | 1 | 正しいスローインでボールを投げる手の使い方は？ | 両手を使う | [公式資料](https://www.theifab.com/laws/latest/the-throw-in/) |
| pack500-rules-015 | 1 | スローインのボールは、頭のどちら側から投げる？ | 後方から頭上を通す | [公式資料](https://www.theifab.com/laws/latest/the-throw-in/) |
| pack500-rules-016 | 1 | 誰にも触れないスローインが直接相手ゴールへ入ったら？ | 得点にならずゴールキック | [公式資料](https://www.theifab.com/laws/latest/the-throw-in/) |
| pack500-rules-017 | 1 | ペナルティーキックを蹴るとき、ボールを置く場所は？ | ペナルティーマーク | [公式資料](https://www.theifab.com/laws/latest/the-penalty-kick/) |
| pack500-rules-018 | 1 | PKでキッカーが最初に蹴るボールの方向は？ | 前方 | [公式資料](https://www.theifab.com/laws/latest/the-penalty-kick/) |
| pack500-rules-019 | 1 | 直接フリーキックで、誰にも触れず相手ゴールに入ったら？ | 得点になる | [公式資料](https://www.theifab.com/laws/latest/free-kicks/) |
| pack500-rules-020 | 1 | 間接フリーキックで得点するために必要なことは？ | 蹴った後に別の選手が触る | [公式資料](https://www.theifab.com/laws/latest/free-kicks/) |
| pack500-rules-021 | 1 | 選手がすねを保護するために着ける用具は？ | すね当て | [公式資料](https://www.theifab.com/laws/latest/the-players-equipment/) |
| pack500-rules-022 | 1 | すね当てを覆うように着用するものは？ | ソックス | [公式資料](https://www.theifab.com/laws/latest/the-players-equipment/) |
| pack500-rules-023 | 1 | ゴールキーパーの服の色は、他の選手や審判とどうする？ | 見分けられる色にする | [公式資料](https://www.theifab.com/laws/latest/the-players-equipment/) |
| pack500-rules-024 | 1 | 試合の判定について、最終的な決定をするのは？ | 主審 | [公式資料](https://www.theifab.com/laws/latest/the-referee/) |
| pack500-rules-025 | 1 | タッチライン沿いでオフサイドなどを旗で知らせる審判は？ | 副審 | [公式資料](https://www.theifab.com/laws/latest/the-other-match-officials/) |
| pack500-rules-026 | 1 | サッカーのフィールドの基本的な形は？ | 長方形 | [公式資料](https://www.theifab.com/laws/latest/the-field-of-play/) |
| pack500-rules-027 | 1 | フィールドの長い側の境界線を何という？ | タッチライン | [公式資料](https://www.theifab.com/laws/latest/the-field-of-play/) |
| pack500-rules-028 | 1 | フィールドを前後に二分する線は？ | ハーフウェーライン | [公式資料](https://www.theifab.com/laws/latest/the-field-of-play/) |
| pack500-rules-029 | 1 | 競技規則で定めるサッカーボールの基本的な形は？ | 球形 | [公式資料](https://www.theifab.com/laws/latest/the-ball/) |
| pack500-rules-030 | 1 | ボールがポストに当たり、フィールド内に戻った。原則どうなる？ | そのままプレーを続ける | [公式資料](https://www.theifab.com/laws/latest/the-ball-in-and-out-of-play/) |
| pack500-rules-031 | 1 | 交代やけがの対応などで失われた時間を補うのは？ | アディショナルタイム | [公式資料](https://www.theifab.com/laws/latest/the-duration-of-the-match/) |
| pack500-rules-032 | 2 | 通常、11人制の試合を続行できなくなるのは1チーム何人未満？ | 7人 | [公式資料](https://www.theifab.com/laws/latest/the-players/) |
| pack500-rules-033 | 2 | 試合開始後に退場した選手を、控え選手で補充できる？ | できない | [公式資料](https://www.theifab.com/laws/latest/the-players/) |
| pack500-rules-034 | 2 | フィールド選手がGKとポジションを交代する条件は？ | 主審に伝え、プレー停止中に行う | [公式資料](https://www.theifab.com/laws/latest/the-players/) |
| pack500-rules-035 | 1 | 主将を示すために着けるものは？ | キャプテンアームバンド | [公式資料](https://www.theifab.com/laws/latest/the-players/) |
| pack500-rules-036 | 2 | ハーフタイムの休憩は、競技規則上何分を超えてはいけない？ | 15分 | [公式資料](https://www.theifab.com/laws/latest/the-duration-of-the-match/) |
| pack500-rules-037 | 2 | キックオフのボールを最初に蹴る方向は？ | どの方向でもよい | [公式資料](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/) |
| pack500-rules-038 | 2 | キックオフから直接相手ゴールに入ったら？ | 得点になる | [公式資料](https://www.theifab.com/laws/latest/the-start-and-restart-of-play/) |
| pack500-rules-039 | 1 | オフサイドポジションにいるだけで反則になる？ | いるだけでは反則にならない | [公式資料](https://www.theifab.com/laws/latest/offside/) |
| pack500-rules-040 | 2 | オフサイドの位置の判定で数えない体の部分は？ | 手と腕 | [公式資料](https://www.theifab.com/laws/latest/offside/) |
| pack500-rules-041 | 2 | 味方が蹴った瞬間、自陣内にいる選手の位置は？ | オフサイドポジションではない | [公式資料](https://www.theifab.com/laws/latest/offside/) |
| pack500-rules-042 | 2 | 後方から2人目の相手と同じ位置にいる選手は？ | その相手より前とは判定しない | [公式資料](https://www.theifab.com/laws/latest/offside/) |
| pack500-rules-043 | 2 | 間接フリーキックを示す主審の動作は？ | 片腕を頭上に上げる | [公式資料](https://www.theifab.com/laws/latest/free-kicks/) |
| pack500-rules-044 | 2 | フリーキックを蹴る前のボールはどうする？ | 静止させる | [公式資料](https://www.theifab.com/laws/latest/free-kicks/) |
| pack500-rules-045 | 3 | 通常、相手はフリーキックのボールから最低何m離れる？ | 9.15m | [公式資料](https://www.theifab.com/laws/latest/free-kicks/) |
| pack500-rules-046 | 2 | PKで、キッカーと守備側GK以外の選手はどこで待つ？ | ペナルティーエリアの外 | [公式資料](https://www.theifab.com/laws/latest/the-penalty-kick/) |
| pack500-rules-047 | 2 | スローインの瞬間、両足はどうする？ | 各足の一部をライン上か外側の地面に着ける | [公式資料](https://www.theifab.com/laws/latest/the-throw-in/) |
| pack500-rules-048 | 3 | スローインをする位置から相手が離れる最低距離は？ | 2m | [公式資料](https://www.theifab.com/laws/latest/the-throw-in/) |
| pack500-rules-049 | 1 | ゴールキックを蹴れるのは？ | 守備側のどの選手でもよい | [公式資料](https://www.theifab.com/laws/latest/the-goal-kick/) |
| pack500-rules-050 | 2 | ゴールキックのボールを置ける場所は？ | ゴールエリア内のどこでも | [公式資料](https://www.theifab.com/laws/latest/the-goal-kick/) |
| pack500-rules-051 | 2 | ゴールキックでボールがインプレーになるのは？ | 蹴られて明らかに動いたとき | [公式資料](https://www.theifab.com/laws/latest/the-goal-kick/) |
| pack500-rules-052 | 1 | コーナーキックのために邪魔なコーナーフラッグを動かせる？ | 動かせない | [公式資料](https://www.theifab.com/laws/latest/the-corner-kick/) |
| pack500-rules-053 | 1 | コーナーキックが直接相手ゴールに入ったら？ | 得点になる | [公式資料](https://www.theifab.com/laws/latest/the-corner-kick/) |
| pack500-rules-054 | 3 | 通常の11人制で使うボールの円周は？ | 68〜70cm | [公式資料](https://www.theifab.com/laws/latest/the-ball/) |
| pack500-rules-055 | 3 | 通常の11人制のボールは、試合開始時に何g？ | 410〜450g | [公式資料](https://www.theifab.com/laws/latest/the-ball/) |
| pack500-rules-056 | 2 | プレー中にボールが破損した場合の基本的な再開は？ | ドロップボール | [公式資料](https://www.theifab.com/laws/latest/the-ball/) |
| pack500-rules-057 | 1 | 試合の時間を計り、試合の記録を取る役割があるのは？ | 主審 | [公式資料](https://www.theifab.com/laws/latest/the-referee/) |
| pack500-rules-058 | 1 | 相手を押さえつけて動けなくする反則の基本的な再開は？ | 直接フリーキック | [公式資料](https://www.theifab.com/laws/latest/fouls-and-misconduct/) |
| pack500-rules-059 | 2 | 無謀なタックルに対する懲戒処置は？ | 警告 | [公式資料](https://www.theifab.com/laws/latest/fouls-and-misconduct/) |
| pack500-rules-060 | 2 | 過剰な力で相手の安全を脅かすタックルの処置は？ | 退場 | [公式資料](https://www.theifab.com/laws/latest/fouls-and-misconduct/) |
| pack500-players-001 | 1 | 2022年男子W杯で、リオネル・メッシがメンバーに選ばれた代表は？ | アルゼンチン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-002 | 1 | 2022年男子W杯で、アンヘル・ディ・マリアがメンバーに選ばれた代表は？ | アルゼンチン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-003 | 1 | 2022年男子W杯で、フリアン・アルバレスがメンバーに選ばれた代表は？ | アルゼンチン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-004 | 1 | 2022年男子W杯で、エミリアーノ・マルティネスがメンバーに選ばれた代表は？ | アルゼンチン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-005 | 1 | 2022年男子W杯で、ネイマールがメンバーに選ばれた代表は？ | ブラジル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-006 | 1 | 2022年男子W杯で、ヴィニシウス・ジュニオールがメンバーに選ばれた代表は？ | ブラジル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-007 | 1 | 2022年男子W杯で、カゼミーロがメンバーに選ばれた代表は？ | ブラジル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-008 | 1 | 2022年男子W杯で、アリソンがメンバーに選ばれた代表は？ | ブラジル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-009 | 1 | 2022年男子W杯で、キリアン・エムバペがメンバーに選ばれた代表は？ | フランス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-010 | 1 | 2022年男子W杯で、アントワーヌ・グリーズマンがメンバーに選ばれた代表は？ | フランス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-011 | 1 | 2022年男子W杯で、オリヴィエ・ジルーがメンバーに選ばれた代表は？ | フランス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-012 | 1 | 2022年男子W杯で、ウーゴ・ロリスがメンバーに選ばれた代表は？ | フランス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-013 | 1 | 2022年男子W杯で、ハリー・ケインがメンバーに選ばれた代表は？ | イングランド | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-014 | 1 | 2022年男子W杯で、ブカヨ・サカがメンバーに選ばれた代表は？ | イングランド | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-015 | 1 | 2022年男子W杯で、ジュード・ベリンガムがメンバーに選ばれた代表は？ | イングランド | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-016 | 1 | 2022年男子W杯で、フィル・フォーデンがメンバーに選ばれた代表は？ | イングランド | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-017 | 1 | 2022年男子W杯で、クリスティアーノ・ロナウドがメンバーに選ばれた代表は？ | ポルトガル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-018 | 1 | 2022年男子W杯で、ブルーノ・フェルナンデスがメンバーに選ばれた代表は？ | ポルトガル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-019 | 1 | 2022年男子W杯で、ベルナルド・シウバがメンバーに選ばれた代表は？ | ポルトガル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-020 | 1 | 2022年男子W杯で、ジョアン・フェリックスがメンバーに選ばれた代表は？ | ポルトガル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-021 | 1 | 2022年男子W杯で、ペドリがメンバーに選ばれた代表は？ | スペイン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-022 | 1 | 2022年男子W杯で、ガビがメンバーに選ばれた代表は？ | スペイン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-023 | 1 | 2022年男子W杯で、アルバロ・モラタがメンバーに選ばれた代表は？ | スペイン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-024 | 1 | 2022年男子W杯で、セルヒオ・ブスケツがメンバーに選ばれた代表は？ | スペイン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-025 | 1 | 2022年男子W杯で、マヌエル・ノイアーがメンバーに選ばれた代表は？ | ドイツ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-026 | 1 | 2022年男子W杯で、トーマス・ミュラーがメンバーに選ばれた代表は？ | ドイツ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-027 | 1 | 2022年男子W杯で、ジャマル・ムシアラがメンバーに選ばれた代表は？ | ドイツ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-028 | 1 | 2022年男子W杯で、カイ・ハヴァーツがメンバーに選ばれた代表は？ | ドイツ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-029 | 1 | 2022年男子W杯で、フィルジル・ファン・ダイクがメンバーに選ばれた代表は？ | オランダ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-030 | 1 | 2022年男子W杯で、フレンキー・デ・ヨングがメンバーに選ばれた代表は？ | オランダ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-031 | 1 | 2022年男子W杯で、メンフィス・デパイがメンバーに選ばれた代表は？ | オランダ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-032 | 1 | 2022年男子W杯で、コーディ・ガクポがメンバーに選ばれた代表は？ | オランダ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-033 | 1 | 2022年男子W杯で、ルカ・モドリッチがメンバーに選ばれた代表は？ | クロアチア | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-034 | 1 | 2022年男子W杯で、ケヴィン・デ・ブライネがメンバーに選ばれた代表は？ | ベルギー | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-035 | 1 | 2022年男子W杯で、ロベルト・レヴァンドフスキがメンバーに選ばれた代表は？ | ポーランド | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-036 | 1 | 2022年男子W杯で、ソン・フンミンがメンバーに選ばれた代表は？ | 韓国 | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-037 | 1 | 2022年男子W杯で、アクラフ・ハキミがメンバーに選ばれた代表は？ | モロッコ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-038 | 1 | 2022年男子W杯で、ルイス・スアレスがメンバーに選ばれた代表は？ | ウルグアイ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-039 | 1 | 2022年男子W杯で、アルフォンソ・デイヴィスがメンバーに選ばれた代表は？ | カナダ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-040 | 1 | 2022年男子W杯で、クリスチャン・プリシッチがメンバーに選ばれた代表は？ | アメリカ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-041 | 2 | 2022年男子W杯の登録リストで、三笘薫の所属クラブは？ | ブライトン | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-042 | 2 | 2022年男子W杯の登録リストで、久保建英の所属クラブは？ | レアル・ソシエダ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-043 | 2 | 2022年男子W杯の登録リストで、冨安健洋の所属クラブは？ | アーセナル | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-044 | 2 | 2022年男子W杯の登録リストで、南野拓実の所属クラブは？ | モナコ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-045 | 2 | 2022年男子W杯の登録リストで、遠藤航の所属クラブは？ | シュトゥットガルト | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-046 | 2 | 2022年男子W杯の登録リストで、堂安律の所属クラブは？ | フライブルク | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-047 | 2 | 2022年男子W杯の登録リストで、鎌田大地の所属クラブは？ | フランクフルト | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-048 | 2 | 2022年男子W杯の登録リストで、伊東純也の所属クラブは？ | スタッド・ランス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-049 | 2 | 2022年男子W杯の登録リストで、前田大然の所属クラブは？ | セルティック | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-050 | 2 | 2022年男子W杯の登録リストで、守田英正の所属クラブは？ | スポルティングCP | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-051 | 3 | 2022年男子W杯の登録リストで、浅野拓磨の所属クラブは？ | ボーフム | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-052 | 3 | 2022年男子W杯の登録リストで、吉田麻也の所属クラブは？ | シャルケ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-053 | 3 | 2022年男子W杯の登録リストで、板倉滉の所属クラブは？ | ボルシアMG | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-054 | 3 | 2022年男子W杯の登録リストで、田中碧の所属クラブは？ | デュッセルドルフ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-055 | 3 | 2022年男子W杯の登録リストで、柴崎岳の所属クラブは？ | レガネス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-056 | 2 | 2022年男子W杯の登録リストで、長友佑都の所属クラブは？ | FC東京 | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-057 | 2 | 2022年男子W杯の登録リストで、酒井宏樹の所属クラブは？ | 浦和レッズ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-058 | 2 | 2022年男子W杯の登録リストで、権田修一の所属クラブは？ | 清水エスパルス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-059 | 2 | 2022年男子W杯の登録リストで、山根視来の所属クラブは？ | 川崎フロンターレ | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-players-060 | 2 | 2022年男子W杯の登録リストで、相馬勇紀の所属クラブは？ | 名古屋グランパス | [公式資料](https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf) |
| pack500-clubs-001 | 1 | レアル・マドリードは、どの国・地域のサッカー協会に属するクラブ？ | スペイン | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-002 | 1 | バルセロナは、どの国・地域のサッカー協会に属するクラブ？ | スペイン | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-003 | 1 | アトレティコ・マドリードは、どの国・地域のサッカー協会に属するクラブ？ | スペイン | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-004 | 1 | セビージャは、どの国・地域のサッカー協会に属するクラブ？ | スペイン | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-005 | 1 | バレンシアは、どの国・地域のサッカー協会に属するクラブ？ | スペイン | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-006 | 1 | マンチェスター・ユナイテッドは、どの国・地域のサッカー協会に属するクラブ？ | イングランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-007 | 1 | マンチェスター・シティは、どの国・地域のサッカー協会に属するクラブ？ | イングランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-008 | 1 | リヴァプールは、どの国・地域のサッカー協会に属するクラブ？ | イングランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-009 | 1 | アーセナルは、どの国・地域のサッカー協会に属するクラブ？ | イングランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-010 | 1 | チェルシーは、どの国・地域のサッカー協会に属するクラブ？ | イングランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-011 | 1 | トッテナムは、どの国・地域のサッカー協会に属するクラブ？ | イングランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-012 | 1 | バイエルン・ミュンヘンは、どの国・地域のサッカー協会に属するクラブ？ | ドイツ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-013 | 1 | ドルトムントは、どの国・地域のサッカー協会に属するクラブ？ | ドイツ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-014 | 1 | レヴァークーゼンは、どの国・地域のサッカー協会に属するクラブ？ | ドイツ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-015 | 1 | シャルケは、どの国・地域のサッカー協会に属するクラブ？ | ドイツ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-016 | 1 | RBライプツィヒは、どの国・地域のサッカー協会に属するクラブ？ | ドイツ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-017 | 1 | ユヴェントスは、どの国・地域のサッカー協会に属するクラブ？ | イタリア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-018 | 1 | ACミランは、どの国・地域のサッカー協会に属するクラブ？ | イタリア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-019 | 1 | インテルは、どの国・地域のサッカー協会に属するクラブ？ | イタリア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-020 | 1 | ナポリは、どの国・地域のサッカー協会に属するクラブ？ | イタリア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-021 | 1 | ローマは、どの国・地域のサッカー協会に属するクラブ？ | イタリア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-022 | 1 | ラツィオは、どの国・地域のサッカー協会に属するクラブ？ | イタリア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-023 | 1 | パリ・サンジェルマンは、どの国・地域のサッカー協会に属するクラブ？ | フランス | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-024 | 1 | マルセイユは、どの国・地域のサッカー協会に属するクラブ？ | フランス | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-025 | 1 | リヨンは、どの国・地域のサッカー協会に属するクラブ？ | フランス | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-026 | 1 | ベンフィカは、どの国・地域のサッカー協会に属するクラブ？ | ポルトガル | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-027 | 1 | ポルトは、どの国・地域のサッカー協会に属するクラブ？ | ポルトガル | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-028 | 1 | スポルティングCPは、どの国・地域のサッカー協会に属するクラブ？ | ポルトガル | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-029 | 1 | アヤックスは、どの国・地域のサッカー協会に属するクラブ？ | オランダ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-030 | 1 | PSVは、どの国・地域のサッカー協会に属するクラブ？ | オランダ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-031 | 1 | フェイエノールトは、どの国・地域のサッカー協会に属するクラブ？ | オランダ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-032 | 1 | セルティックは、どの国・地域のサッカー協会に属するクラブ？ | スコットランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-033 | 1 | レンジャーズは、どの国・地域のサッカー協会に属するクラブ？ | スコットランド | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-034 | 2 | アンデルレヒトは、どの国・地域のサッカー協会に属するクラブ？ | ベルギー | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-035 | 2 | クラブ・ブルッヘは、どの国・地域のサッカー協会に属するクラブ？ | ベルギー | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-036 | 2 | ガラタサライは、どの国・地域のサッカー協会に属するクラブ？ | トルコ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-037 | 2 | ベシクタシュは、どの国・地域のサッカー協会に属するクラブ？ | トルコ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-038 | 2 | オリンピアコスは、どの国・地域のサッカー協会に属するクラブ？ | ギリシャ | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-039 | 2 | ディナモ・ザグレブは、どの国・地域のサッカー協会に属するクラブ？ | クロアチア | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-040 | 2 | コペンハーゲンは、どの国・地域のサッカー協会に属するクラブ？ | デンマーク | [公式資料](https://editorial.uefa.com/resources/0282-18407aecf6fe-cb82de053b1e-1000/ucl_202223_all-time_md13.pdf) |
| pack500-clubs-041 | 1 | 鹿島アントラーズのホームタウンがある都道府県は？ | 茨城県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-042 | 1 | 浦和レッズのホームタウンがある都道府県は？ | 埼玉県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-043 | 1 | 柏レイソルのホームタウンがある都道府県は？ | 千葉県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-044 | 1 | FC町田ゼルビアのホームタウンがある都道府県は？ | 東京都 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-045 | 1 | 川崎フロンターレのホームタウンがある都道府県は？ | 神奈川県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-046 | 1 | 清水エスパルスのホームタウンがある都道府県は？ | 静岡県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-047 | 1 | 名古屋グランパスのホームタウンがある都道府県は？ | 愛知県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-048 | 1 | ガンバ大阪のホームタウンがある都道府県は？ | 大阪府 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-049 | 1 | セレッソ大阪のホームタウンがある都道府県は？ | 大阪府 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-050 | 1 | ヴィッセル神戸のホームタウンがある都道府県は？ | 兵庫県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-051 | 1 | サンフレッチェ広島のホームタウンがある都道府県は？ | 広島県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-052 | 1 | アビスパ福岡のホームタウンがある都道府県は？ | 福岡県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-053 | 1 | V・ファーレン長崎のホームタウンがある都道府県は？ | 長崎県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-054 | 1 | ベガルタ仙台のホームタウンがある都道府県は？ | 宮城県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-055 | 1 | ヴァンフォーレ甲府のホームタウンがある都道府県は？ | 山梨県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-056 | 1 | 徳島ヴォルティスのホームタウンがある都道府県は？ | 徳島県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-057 | 1 | FC今治のホームタウンがある都道府県は？ | 愛媛県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-058 | 1 | サガン鳥栖のホームタウンがある都道府県は？ | 佐賀県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-059 | 1 | ロアッソ熊本のホームタウンがある都道府県は？ | 熊本県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-clubs-060 | 1 | FC琉球のホームタウンがある都道府県は？ | 沖縄県 | [公式資料](https://www.jleague.jp/corporate/assets/pdf/about_jclubs/jclub_hometown.pdf) |
| pack500-euro-001 | 3 | 男子EURO 1960（欧州選手権）で優勝した代表は？ | ソ連 | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-002 | 3 | 男子EURO 1964（欧州選手権）で優勝した代表は？ | スペイン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-003 | 3 | 男子EURO 1968（欧州選手権）で優勝した代表は？ | イタリア | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-004 | 3 | 男子EURO 1972（欧州選手権）で優勝した代表は？ | 西ドイツ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-005 | 3 | 男子EURO 1976（欧州選手権）で優勝した代表は？ | チェコスロバキア | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-006 | 3 | 男子EURO 1980（欧州選手権）で優勝した代表は？ | 西ドイツ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-007 | 2 | 男子EURO 1984（欧州選手権）で優勝した代表は？ | フランス | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-008 | 2 | 男子EURO 1988（欧州選手権）で優勝した代表は？ | オランダ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-009 | 2 | 男子EURO 1992（欧州選手権）で優勝した代表は？ | デンマーク | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-010 | 2 | 男子EURO 1996（欧州選手権）で優勝した代表は？ | ドイツ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-011 | 2 | 男子EURO 2000（欧州選手権）で優勝した代表は？ | フランス | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-012 | 2 | 男子EURO 2004（欧州選手権）で優勝した代表は？ | ギリシャ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-013 | 2 | 男子EURO 2008（欧州選手権）で優勝した代表は？ | スペイン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-014 | 2 | 男子EURO 2012（欧州選手権）で優勝した代表は？ | スペイン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-015 | 2 | 男子EURO 2016（欧州選手権）で優勝した代表は？ | ポルトガル | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-016 | 2 | 男子EURO 2020（欧州選手権）で優勝した代表は？ | イタリア | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d81c56ff408-45bf000cd5b6-1000--uefa-european-championship-roll-of-honour/) |
| pack500-euro-017 | 3 | 男子EURO 1976の決勝のPK戦で中央へ浮かせたキックを決め、その技に名前が残った選手は？ | アントニーン・パネンカ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-018 | 3 | 男子EURO 1980の決勝で西ドイツの2得点を両方決めた選手は？ | ホルスト・ルベッシュ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-019 | 3 | 男子EURO 1988の決勝で鋭い角度から有名なボレーシュートを決めたオランダの選手は？ | マルコ・ファン・バステン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-020 | 3 | 男子EURO 1996の決勝のゴールデンゴールを決めたドイツの選手は？ | オリバー・ビアホフ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-021 | 3 | 男子EURO 2000の決勝のゴールデンゴールを決めたフランスの選手は？ | ダヴィド・トレゼゲ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-022 | 3 | 男子EURO 2004の決勝でギリシャの決勝点を決めた選手は？ | アンゲロス・ハリステアス | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-023 | 3 | 男子EURO 2008の決勝でドイツ相手に唯一のゴールを決めたスペインの選手は？ | フェルナンド・トーレス | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-024 | 3 | 男子EURO 2012の決勝でスペインの先制ゴールを決めた選手は？ | ダビド・シルバ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-025 | 3 | 男子EURO 2016の決勝の延長でポルトガルの決勝点を決めた選手は？ | エデル | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-026 | 3 | 男子EURO 2020の決勝でイタリアの同点ゴールを決めた選手は？ | レオナルド・ボヌッチ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0253-0d7f3a860e98-a3743f801bc3-1000--what-happened-in-the-16-euro-finals/) |
| pack500-euro-027 | 3 | 男子EURO 1972で4得点を挙げ、単独得点王になった選手は？ | ゲルト・ミュラー | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-028 | 3 | 男子EURO 1984で9得点を挙げ、単独得点王になった選手は？ | ミシェル・プラティニ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-029 | 3 | 男子EURO 1988で5得点を挙げ、単独得点王になった選手は？ | マルコ・ファン・バステン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-030 | 3 | 男子EURO 1996で5得点を挙げ、単独得点王になった選手は？ | アラン・シアラー | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-031 | 3 | 男子EURO 2004で5得点を挙げ、単独得点王になった選手は？ | ミラン・バロシュ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-032 | 3 | 男子EURO 2008で4得点を挙げ、単独得点王になった選手は？ | ダビド・ビジャ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-033 | 3 | 男子EURO 2016で6得点を挙げ、単独得点王になった選手は？ | アントワーヌ・グリーズマン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-034 | 3 | 男子EURO 1980で3得点を挙げ、単独得点王になった選手は？ | クラウス・アロフス | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-035 | 3 | 男子EURO 1996で大会最優秀選手に選ばれたのは？ | マティアス・ザマー | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-036 | 3 | 男子EURO 2000で大会最優秀選手に選ばれたのは？ | ジネディーヌ・ジダン | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-037 | 3 | 男子EURO 2004で大会最優秀選手に選ばれたのは？ | テオドロス・ザゴラキス | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-038 | 3 | 男子EURO 2008で大会最優秀選手に選ばれたのは？ | シャビ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-039 | 3 | 男子EURO 2012で大会最優秀選手に選ばれたのは？ | アンドレス・イニエスタ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
| pack500-euro-040 | 3 | 男子EURO 2020で大会最優秀選手に選ばれたのは？ | ジャンルイジ・ドンナルンマ | [公式資料](https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/) |
