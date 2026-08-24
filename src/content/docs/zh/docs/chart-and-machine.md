---
title: 图表与机器文件
description: 图表中的每个字段、机器文件如何描述你的洗衣机和熨斗，以及混洗规则如何决定哪些衣物可以共用一个滚筒。
---

一个 JSON 对象描述了一切：`machine` 下是你的洗衣机和熨斗，`chart` 下则是每一堆衣物各占一条。CLI 和网页应用的上传功能接受的都是完全相同的结构——这正是 [`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core) 的 `parseConfig` 所校验的内容。

```json
{
  "machine": { "washer": { "..." }, "iron": { "..." } },
  "chart": [{ "clothing_type": "..." }]
}
```

## 图表

`chart` 下的每一条对应一堆衣物：

| Field             | 填写内容                                                         |
| ----------------- | ---------------------------------------------------------------- |
| `clothing_type`   | 你给这堆衣物起的名字——即卡片的标题                               |
| `detergent`       | 用哪种洗涤剂、用量多少                                           |
| `fabric_softener` | `yes` 或 `no`                                                    |
| `temperature`     | 你的洗衣机提供的某个温度                                         |
| `spin`            | 你的洗衣机提供的某个脱水转速                                     |
| `duration`        | 大致运行时长，格式为 `~H:MM`                                     |
| `program`         | 一个刻度盘位置，拼写需与机身面板上完全一致                       |
| `options`         | 功能按钮，用竖线分隔；没有则留空                                 |
| `ironing`         | `yes` 或 `no`——是否需要熨烫                                      |
| `ironing_notes`   | 文字说明：怎么熨，或者为什么不熨。通常为空                       |
| `iron_setting`    | 温控挡位。当 `ironing` 为 `no` 时留空                            |
| `drying`          | 文字说明：怎么晾干                                               |
| `colour_group`    | `white`、`colour`、`dark`、`sport` 或 `any`                      |
| `mix_tags`        | 用竖线分隔：`lint-shedder`、`lint-magnet`、`dye-bleeder`、`solo` |
| `notes`           | 其他任何值得记录的信息                                           |

每一个面向机器的值——`program`、`temperature`、`spin`、`options`、`iron_setting`——都会与你自己的 `machine` 所提供的选项进行核对，因此拼写错误会精确指出出错的行和列，而不会生成一张让你把旋钮转到根本不存在的位置的卡片。

## 机器

`machine.washer` 按刻度盘上的物理顺序列出各个标签，以及显示屏提供的温度、脱水转速和功能按钮。`machine.iron` 则按从最低温到最高温的顺序列出温控挡位。请原样抄下你眼前印着的每一个标签，不论它是什么语言——这里的任何内容都不会翻译面板上的标签，因为一张需要你站在机器前再翻译回去的图表，还不如没有图表。

`washer.programs` 的顺序是有实际作用的：第一项是关机位置，绘制在十二点钟方向，其余每一格刻度的角度都取决于它在列表中的位置。漏掉一项不只是少了它——还会把它之后的每一格都挪动位置。

网页应用自带的 [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/) 编辑器写入的正是同一种结构——在那里调整程序列表的顺序，效果与调整 JSON 数组的顺序完全一样：

<img class="theme-shot" data-variant="light" src="/docs/media/zh/machine-editor-light.png" alt="机器编辑器中的脱水转速、按钮和熨斗挡位表格" />
<img class="theme-shot" data-variant="dark" src="/docs/media/zh/machine-editor-dark.png" alt="机器编辑器中的脱水转速、按钮和熨斗挡位表格" />

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

## 哪些衣物可以一起洗

只有当以下所有条件都满足时，两堆衣物才可以共用一个滚筒——检查按顺序进行，第一个未通过的条件就是兼容性矩阵会给出的原因：

1. 两者都没有被标记为 `solo`。
2. 如果其中一堆是 `lint-shedder`，另一堆也必须是。
3. 两者的 `colour_group` 相匹配（`any` 与任何值都匹配）。
4. `program`、`temperature`、`spin` 以及 `options` 的集合完全相同。

当你实际要设置的一切都一致时——程序、温度、脱水转速、功能选项、是否加柔顺剂，以及熨斗温控指向哪里——多堆衣物就会合并到同一张卡片上，共用同一张刻度盘图。文字类字段（`detergent`、`drying`、`notes`）刻意不参与这项判断——两堆衣物即使需要不同的洗涤剂，也可以共用一张卡片，卡片会把两行说明分别对应标注在各自所属的衣物堆下面。
