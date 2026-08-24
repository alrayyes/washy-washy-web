---
title: チャートと洗濯機のファイル
description: チャートの各項目、洗濯機ファイルであなたの洗濯機とアイロンをどう記述するか、そして混ぜ合わせルールがどのように同じドラムで洗えるかを決めるか。
---

ひとつのJSONオブジェクトですべてを記述します。`machine`の下に洗濯機とアイロン、`chart`の下に洗濯物の山ごとに1エントリです。CLIとウェブアプリのアップロード機能はどちらもこの形をそのまま受け付けます — これは[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)の`parseConfig`が検証している形そのものです。

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## チャート

`chart`の各エントリは、洗濯物の山ひとつ分です。

| フィールド        | 内容                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `clothing_type`   | その山を何と呼ぶか — カードの見出しになります                        |
| `detergent`       | 使う洗剤とその量                                                     |
| `fabric_softener` | `yes`か`no`                                                          |
| `temperature`     | 洗濯機が対応している温度のひとつ                                     |
| `spin`            | 洗濯機が対応している脱水速度のひとつ                                 |
| `duration`        | だいたいの所要時間、`~H:MM`の形で                                    |
| `program`         | ダイヤルの位置。パネルの表記どおりに                                 |
| `options`         | オプションボタン、パイプ区切り。何もなければ空                       |
| `ironing`         | `yes`か`no` — そもそもアイロンをかけるかどうか                       |
| `ironing_notes`   | 文章：どうアイロンをかけるか、あるいはなぜかけないか。空のことが多い |
| `iron_setting`    | サーモスタットの位置。`ironing`が`no`なら空                          |
| `drying`          | 文章：どう乾かすか                                                   |
| `colour_group`    | `white`、`colour`、`dark`、`sport`、`any`のいずれか                  |
| `mix_tags`        | パイプ区切り：`lint-shedder`、`lint-magnet`、`dye-bleeder`、`solo`   |
| `notes`           | その他知っておくべきこと                                             |

洗濯機に関わる値 — `program`、`temperature`、`spin`、`options`、`iron_setting` — はすべて、あなたの`machine`が実際に対応しているものと照合されます。そのため入力ミスがあると、どの行のどの列が問題かを具体的に示してエラーになります。ダイヤルが存在しない位置を指すカードが出来上がることはありません。

## 洗濯機

`machine.washer`には、ダイヤルのラベルを実際の並び順どおりに、そしてディスプレイが表示する温度、脱水速度、オプションボタンを列挙します。`machine.iron`にはサーモスタットの位置を、低温から高温の順に列挙します。目の前の表示にある通りのラベルを、そのままの言語でコピーしてください。ここでは表示ラベルを翻訳することは一切ありません。洗濯機の前で読み直す必要のあるチャートは、チャートがないより悪いからです。

`washer.programs`の並び順は意味を持ちます。最初のエントリがオフの位置で、12時の方向に描かれます。それ以外の各目盛りの角度は、リスト内での位置から決まります。1つ抜かすと、それが消えるだけでなく、それ以降のすべての目盛りの位置がずれます。

ウェブアプリ自体の[`/config/machine`](https://washy-washy.ryankes.eu/config/machine/)エディタも、まったく同じ形式で書き出します — そこでプログラムリストを並べ替えるのは、JSON配列を並べ替えるのとまったく同じことです。

<img class="theme-shot" data-variant="light" src="/docs/media/machine-editor-light.png" alt="洗濯機エディタの脱水速度、ボタン、アイロン設定の表" />
<img class="theme-shot" data-variant="dark" src="/docs/media/machine-editor-dark.png" alt="洗濯機エディタの脱水速度、ボタン、アイロン設定の表" />

```json
{
  "washer": {
    "name": "Generic front loader",
    "capacity": "1–8 kg",
    "programs": ["Off", "Cottons", "Delicates / Silk", "Wool"],
    "temperatures": ["cold", "20", "30", "40", "60", "90"],
    "spins": ["0", "400", "600", "800", "1200", "1400"],
    "options": ["Speed", "Eco", "Easy Iron", "Extra Rinse"]
  },
  "iron": {
    "name": "Generic steam iron",
    "settings": [
      {
        "key": "min",
        "dots": "",
        "label": "MIN",
        "detail": "no heat",
        "steam": false
      },
      {
        "key": "3",
        "dots": "•••",
        "label": "•••",
        "detail": "cotton, linen · 200 °C",
        "steam": true
      }
    ]
  }
}
```

## 一緒に洗えるもの

2つの山が同じドラムを共有できるのは、以下がすべて成り立つときだけです。順番にチェックされ、最初に不成立になった条件が、まさに互換性の判定理由になります。

1. どちらも`solo`のタグが付いていない。
2. どちらかが`lint-shedder`なら、もう片方も`lint-shedder`である。
3. `colour_group`が一致している（`any`はすべてに一致）。
4. `program`、`temperature`、`spin`、`options`の組み合わせが完全に一致している。

複数の山が1枚のカードにまとまり、ダイヤルの図をひとつだけ共有するのは、実際に手で設定するものがすべて一致している場合です。プログラム、温度、脱水、オプション、柔軟剤を入れるかどうか、アイロンのサーモスタットの位置。文章のフィールド（`detergent`、`drying`、`notes`）はこの判定に意図的に含まれていません。2つの山が違う洗剤を使いたくても同じカードを共有でき、その場合カードには両方の記載が、それぞれの山に対応づけて載ります。
