/**
 * A minimal markup for translated strings that need an inline link, code
 * span or emphasis — just enough that a translation can reorder a sentence
 * around a linked word (German/Japanese word order rarely matches English),
 * without hand-authoring HTML per locale. Supports `[label](url)`,
 * `` `code` `` and `*emphasis*`; everything else is escaped plain text.
 * Trusted input only — every string this runs on is our own translation
 * dictionary (i18n/ui.ts), never user-supplied.
 */
const TOKEN = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*([^*]+)\*/g;

const LINK_CLASS =
  "underline decoration-hairline underline-offset-2 hover:text-accent-text hover:decoration-accent";
const CODE_CLASS = "text-sm text-ink";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function richText(input: string): string {
  let html = "";
  let lastIndex = 0;
  for (const match of input.matchAll(TOKEN)) {
    html += escapeHtml(input.slice(lastIndex, match.index));
    const [, linkLabel, linkUrl, code, emphasis] = match;
    if (linkLabel !== undefined && linkUrl !== undefined) {
      html += `<a href="${escapeHtml(linkUrl)}" class="${LINK_CLASS}">${escapeHtml(linkLabel)}</a>`;
    } else if (code !== undefined) {
      html += `<code class="${CODE_CLASS}">${escapeHtml(code)}</code>`;
    } else if (emphasis !== undefined) {
      html += `<em>${escapeHtml(emphasis)}</em>`;
    }
    lastIndex = match.index + match[0].length;
  }
  html += escapeHtml(input.slice(lastIndex));
  return html;
}
