---
title: WebMCP tools for agents
description: The five tools this site registers for a WebMCP-aware browser or extension, so an agent can read, validate and edit your chart and machine directly.
---

[WebMCP](https://webmachinelearning.github.io/webmcp/) is an experimental
browser API — a W3C Web Machine Learning Community Group draft, not yet
shipped by default in any browser — that lets a page declare tools an AI
agent can call directly, in your own browser tab, against your own data.
It's the automated version of [generating a config with an AI chat
tool](/docs/ai-prompt/): instead of you pasting a downloaded config and
pasting the result back, an agent that understands WebMCP reads and writes
the config already active in your browser, validated the same way either
path validates it.

Nothing here changes what the app does for anyone without such a browser or
extension — `document.modelContext` simply won't exist, and this page's five
tools are never registered. No config is sent anywhere either way: a tool
call reads and writes the same `localStorage`-backed config every other page
here already uses.

## The five tools

| Tool                   | Does                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `washy_get_config`     | Reads the active chart and machine — your own, or the bundled example.                                                                                                                |
| `washy_validate_chart` | Checks chart rows against the active machine without saving anything.                                                                                                                 |
| `washy_set_chart`      | Replaces the active chart, validated first — the same as clicking Save on [`/config`](https://washy-washy.ryankes.eu/config/).                                                        |
| `washy_set_machine`    | Replaces the active washer and iron, re-validating the current chart against them — the same as clicking Save on [`/config/machine`](https://washy-washy.ryankes.eu/config/machine/). |
| `washy_export_pdf`     | Renders the active chart as a PDF (phone or print layout), returned as data rather than downloaded.                                                                                   |

Every one of them runs through the same
[`@washy-washy/core`](https://github.com/alrayyes/washy-washy-core)
validation the on-page editors use — a row an agent writes that doesn't fit
your machine fails with the same row-and-column error the chart editor would
show you, not a silent guess.

## Saved edits reload the page

`washy_set_chart` and `washy_set_machine` reload the page once they've
saved, the same way uploading a config through the header already does —
there's no live syncing between an open editor and a tool call, so a reload
is how it catches up.

## Trying it yourself

Install a WebMCP-aware browser extension, or open your browser's devtools
console on this site and call `await document.modelContext.getTools()` —
once native support or a polyfill is present, it lists all five tools by
name and description before you call any of them.
