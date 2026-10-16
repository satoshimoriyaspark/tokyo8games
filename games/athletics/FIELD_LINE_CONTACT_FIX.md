黄色ライン判定・踏切板の調整

Runtime: b005094029d75917117bf4ea1586689bfb43150a
Preview: https://tokyo8games-602lelw1t-tokyo8games.vercel.app/games/athletics/index.html

幅跳びの緑の27×6pxガイドを、黄色ライン手前の地面に沿う12×4pxの白い踏切板へ変更。
両フィールド競技の従来40mでの判定を、表示上の黄色ライン終端に対応する(326+4-32)/7.1へ移動。約14px猶予を追加し、ファウル表示時に足元が黄色ラインに重なる。幅跳びの加点は従来40mまでで固定し、猶予による距離加点なし。通常競走の判定は不変。
変更: index.html、tests/{long-jump,javeball}-probe.js、対応する検証JSON。
Node全回帰PASS。クラウドChromeでも幅跳び39項目、ジャベボール39項目PASS。両競技のFOUL場面と白い踏切板を目視確認。実機・Safari・Edge・端末エミュレーション未確認。mainおよび本番未変更。
