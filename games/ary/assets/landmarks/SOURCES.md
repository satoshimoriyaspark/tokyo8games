# 亀有香取神社と狛亀 — 出典・制作記録

確認日：2026-10-12。対象は亀有1面のみ。

## 紹介文の事実確認

- 亀有香取神社「神社諸案内」
  https://kameari-katori.or.jp/information/
  創建は建治2年（1276年）。村の鎮守として祀られたという公式沿革に基づき、子ども向けに「1276年にできた、亀有のまちを見守る神社」と要約。
- 葛飾区観光協会「亀有香取神社」
  https://katsushika-kanko.jp/kame-ao/003katori.html
  2013-11-10更新の案内。「アリオ亀有側の鳥居の下」に狛亀があることを確認。創建年も照合。

掲載文は要約であり公式文面の転載ではない。アリィのひとことは創作。営業時間、行事日程、文化財指定など未確認の情報は掲載していない。

## 公式サイトの画像の扱い

観光協会の写真は利用していない。同協会の利用案内は無断転載を禁じ、画像利用について案内の確認と問い合わせを求めているため、掲載写真の加工・転載許可があるとは扱っていない。
https://katsushika-kanko.jp/cont/about.html

神社公式サイトの写真も加工・転載していない。

## 留意点

現地の2026年の配置・植栽・掲示物を実地確認したものではない。写真撮影時点に基づく紹介であり、最新の現地案内図ではない。神社・観光協会の監修や公認は受けていない。

## 使用した参考写真

Higa4, **Katori-jinja (Kameari, Katsushika) 10.jpg**, 2021-11-20撮影。
https://commons.wikimedia.org/wiki/File:Katori-jinja_(Kameari,_Katsushika)_10.jpg

写真ページに作者本人の作品として **CC0 1.0 Universal Public Domain Dedication** が明記されていることを確認。写真の複製・加工・配布・商用利用が可能な条件で公開されている。
https://creativecommons.org/publicdomain/zero/1.0/

参考写真のSHA-256：`8b9d9d3972c4369d617991acb8e495943337b64a74cf1a258bc1befa387bcdf3`

使用画像：`../kameari-katori-guide.png`。Webからの直接画像読込は行わず、ゲームと同じリポジトリに格納。

## 制作方法・構図の確認

組み込みの画像生成ツール（imagegen）で上記写真をドット調イラストに変換。写真のカメラ位置を基準とし、画面左寄りの石鳥居、入口右手の狛亀、狛亀の右側の石標、波模様の台座、柵、参道と奥の緑色の屋根の社殿の関係を照合した。

左側の狛亀は参考写真の画角外なので、想像で描き足していない。アリィ・ロゴは生成せず、画面では既存の承認済み素材を使用。紹介文・ボタン・アリィのひとことはHTMLで表示。写真内の碑文や掲示文字は省略した。彩色と細部は絵として簡略化されており、測量図・忠実な写真複製ではない。

CC0は参考写真の利用条件を示すもので、神社からの監修・公認や、現地撮影規則の確認を示すものではない。現地の現在の状態は未確認。

### 制作プロンプト（組み込みツール、CLI不使用）

Use case: style-transfer. Asset: a finished landmark introduction illustration for a Japanese pixel-art game for children. Edit target: the provided CC0 photograph of Kameari Katori Shrine by Higa4, 20 November 2021. Transform this exact photograph into a polished, richly detailed pixel-art travel illustration, crisp deliberate square pixel clusters and clean forms, sunny welcoming colors, harmonious muted navy shadows, golden autumn foliage and turquoise blue sky. Landscape 4:3, ideally 1536x1152. Preserve the EXACT camera angle, framing and relative positions of all architectural and statue features. The dominant stone torii is left-of-center; its curved top beam and two cylindrical columns remain identical in silhouette. Preserve the single visible koma-game turtle statue in the right foreground exactly: gray-green sculpted turtle body, long upright expressive animal head with open mouth, hexagonal segmented domed shell, carved feet, pointed rear tail, cream sacred rope with tassel around its neck, standing on the tall square pedestal carved with sweeping wave lines. Keep it to the right of the entrance path and to the left of the tall inscribed stone marker at the right edge. The left turtle is outside this photograph: do NOT invent or add a second turtle. Preserve the stone posts, small wooden fences, entrance pavement, tree trunks, distant partly visible green curved roof shrine hall, surrounding buildings and all spatial relationships seen in the photograph. Do NOT invent a generic shrine, temple, pagoda, red torii, extra roofs, symmetrical buildings or new statues. Preserve small distant features at their source scale instead of making up unseen details. Simplify photographic textures into pixel clusters without changing object shapes. Remove ALL letters/numbers from the existing signs, stone marker, banner and plaque, leaving their physical surfaces/shapes in place without fake writing. No overlay text, no captions, no UI, no logos, no characters, no Ary, no invented people, no frames. This must read as a faithful illustrated rendering of this particular real view, with the turtle and torii easy to recognize on a phone.
