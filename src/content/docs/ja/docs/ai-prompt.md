---
title: AIチャットツールでconfigを生成する
description: 洗濯機とアイロンの写真、そして洗濯物の説明を、このアプリが読み込めるconfigファイルに変換するためのコピペ用プロンプト。
---

このページはドキュメントのみです — ウェブアプリ自体は画像処理を一切行わず、AI呼び出しも自分では行いません。このプロンプトと自分の写真を、普段使っているAIチャットツールに貼り付け、返ってきた結果を、他のconfigファイルと同じようにヘッダーの「Upload config」ボタンからアップロードしてください。

## 正確な形式を手に入れる

[`/config`](https://washy-washy.ryankes.eu/config/)を開き、**Download**リンクを使ってください。これは、ブラウザで現在有効になっているconfig（すでにアップロードや編集をしていなければ同梱のサンプル）を、アプリが期待する正確な`{ machine, chart }`形式のJSONとしてダウンロードします。形式を記憶に頼って説明する代わりに、このファイルを写真と一緒にチャットに添付してください。これは、あなたの回答をアプリが検証する際に使うのとまったく同じファイル（[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)の`parseConfig`）なので、形式を微妙に間違える心配がありません。

## 家電を撮影する

- 洗濯機のパネル — ダイヤルとすべてのオプションボタン。
- アイロンのサーモスタットのリングまたはダイヤル。

## プロンプト

```text
Attached is a photo of my washing machine's fascia, a photo of my iron's
thermostat, and an example washy-washy config file. Write me the same
"machine" shape for my own appliances, then a "chart" array for the laundry
I describe below, and return the whole thing as one JSON object shaped
exactly like the attached example: { "machine": {...}, "chart": [...] }.

For the machine:
- Copy every label exactly as printed, in whatever language it's in. Do not
  translate anything into English and do not tidy up spelling or
  punctuation — a chart that doesn't match the machine is worse than no
  chart.
- washer.programs is the dial, listed in the order the positions go round
  it, starting at the off position and going clockwise. This order changes
  every other programme's angle in the drawing, so read it off the photo
  rather than grouping the programmes sensibly.
- iron.settings is the thermostat ring, coolest first.

For the chart, one entry per pile of laundry:
- Every machine-facing value has to come out of the machine you just wrote:
  program from washer.programs, temperature from washer.temperatures, spin
  from washer.spins, options from washer.options, iron_setting from
  iron.settings' keys. Spell them exactly as they appear there.
- ironing is "yes" or "no". When it's "no", leave iron_setting empty.
- duration is roughly how long that programme runs on my machine, as
  "~H:MM".

My laundry: <describe it — fabrics, colours, what you own a lot of, what
you line dry, anything with a care label you actually follow>.
```

## 確認してからアップロードする

結果を信用する前に、手作業で確認しておくべきことが2つあります。

どのダイヤル位置がオフなのかは、写真だけでは何も示していないため、モデルは推測するしかありません。これを間違えると、チャート内のすべての図がずれてしまいます。写真を見ながら、自分でオフの位置から時計回りに数えてみてください。

モデルは洗濯温度を自信満々に断定しますが、時々間違えます。ウール、シルク、エラスタン入りのものなど、衣類を傷めかねないものは、チャートを信用する前に実際の洗濯表示と照らし合わせて確認してください。

そのうえで、ヘッダーの「Upload config」ボタンからJSONをアップロードしてください。これは、ダウンロード元と同じ`parseConfig`を通ります。プログラム名の入力ミスやフィールドの欠落があれば、具体的なフィールド名を挙げてそこでエラーになります。架空の値が、洗濯機の前で実際に読むことになるページに紛れ込むことはありません。
