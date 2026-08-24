---
title: 用 AI 聊天工具生成配置
description: 一段可直接复制粘贴的提示词，能把你洗衣机和熨斗的照片，加上你对自己衣物的描述，变成这个应用可以加载的配置文件。
---

这个页面只是文档——网页应用本身不处理图片，也不会自己调用任何 AI。你需要把这段提示词和你自己的照片粘贴进你已经在用的任意 AI 聊天工具，然后把返回的结果通过页眉的"上传配置"按钮上传，方式和上传任何其他配置文件一样。

## 获取准确的格式

打开 [`/config`](https://washy-washy.ryankes.eu/config/)，使用它的**下载**链接。这会把你浏览器中当前生效的配置——除非你已经上传或编辑过，否则就是内置示例——下载为应用所期望的、精确的 `{ machine, chart }` JSON 结构。把这个文件和你的照片一起附加到对话中，而不要凭记忆描述这个结构：它正是应用用来校验你答案的同一个文件（[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core) 的 `parseConfig`），因此不存在格式上会被悄悄搞错的情况。

## 给你的电器拍照

- 你洗衣机的面板——刻度盘和每一个功能按钮。
- 你熨斗的温控环或温控盘。

## 提示词

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

## 检查后再上传

在你信任结果之前，有两件事值得手动检查一下。

照片本身并不能说明哪个位置是关机位，所以模型只能猜——猜错了，图表里的每一张刻度图都会跟着转错方向。请自己从关机位开始，对照照片顺时针数一遍。

模型在给出洗涤温度时会显得非常笃定，但有时是错的。凡是可能毁掉衣物的项目——羊毛、真丝、任何含氨纶的衣物——在你信任图表之前，请对照实际的洗涤标签核实一遍。

然后通过页眉的"上传配置"按钮上传这份 JSON。它会经过与下载时同一个 `parseConfig` 的校验：程序名称中的拼写错误或缺失的字段都会在这里被拦下，并指出具体是哪个字段出了问题，这样一个凭空编造的值就永远不会出现在你站在机器前阅读的那个页面上。
