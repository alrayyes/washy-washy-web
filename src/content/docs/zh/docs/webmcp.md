---
title: 面向代理的 WebMCP 工具
description: 本站为支持 WebMCP 的浏览器或扩展注册的五个工具，让代理可以直接读取、校验并编辑你的图表和机器。
---

[WebMCP](https://webmachinelearning.github.io/webmcp/) 是一个实验性的浏览器 API——W3C Web Machine Learning Community Group 的一份草案，目前还没有任何浏览器默认支持——它允许页面声明一些工具，供 AI 代理直接在你自己的浏览器标签页里、针对你自己的数据调用。它是[用 AI 聊天工具生成配置](/zh/docs/ai-prompt/)的自动化版本：不再需要你粘贴下载好的配置、再把结果粘贴回来，一个理解 WebMCP 的代理会直接读取并写入你浏览器里已经生效的配置，其校验方式与两条路径完全一致。

对于没有这类浏览器或扩展的人来说，这个应用没有任何变化：`document.modelContext` 根本不存在，这个页面的五个工具也永远不会被注册。无论哪种情况，配置都不会被发送到任何地方：一次工具调用读取和写入的，正是这里其他页面已经在用的、由 `localStorage` 保存的同一份配置。

## 五个工具

| 工具                   | 作用                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `washy_get_config`     | 读取当前生效的图表和机器——你自己的，或者内置示例。                                                                                              |
| `washy_validate_chart` | 对照当前生效的机器检查图表行，不保存任何内容。                                                                                                  |
| `washy_set_chart`      | 先校验，再替换当前生效的图表——和在 [`/config`](https://washy-washy.ryankes.eu/config/) 上点保存一样。                                           |
| `washy_set_machine`    | 替换当前生效的洗衣机和熨斗，并对照它们重新校验当前图表——和在 [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/) 上点保存一样。 |
| `washy_export_pdf`     | 把当前图表渲染成 PDF（手机版或打印版布局），以数据形式返回，而不是直接下载。                                                                    |

这些工具全部走的是页面编辑器本身使用的同一套
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)
校验——代理写入的一行如果不符合你的机器，会得到和图表编辑器一样的、指明具体行和列的错误，而不是一个悄悄的猜测。

## 保存的修改会重新加载页面

`washy_set_chart` 和 `washy_set_machine` 一旦保存成功就会重新加载页面，和通过页眉上传配置的效果完全一样——打开的编辑器和工具调用之间没有实时同步，重新加载就是它追上变化的方式。

## 亲自试试

安装一个支持 WebMCP 的浏览器扩展，或者在本站打开浏览器的开发者控制台，调用 `await document.modelContext.getTools()`——一旦有原生支持或 polyfill 存在，它就会在你调用任何工具之前，把这五个工具的名称和说明都列出来。
