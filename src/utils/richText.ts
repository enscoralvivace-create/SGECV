import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "ul",
  "ol",
  "li",
  "a",
];

const ALLOWED_MARKUP_PATTERN =
  /<br\s*\/?>|<(p|strong|b|em|i|ul|ol|li|a)(?:\s[^>]*)?>[\s\S]*?<\/\1>/i;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function plainTextToRichText(value: string): string {
  const normalized = value.replaceAll("\r\n", "\n").trim();

  if (!normalized) {
    return "";
  }

  return normalized
    .split(/\n{2,}/)
    .map(
      (paragraph) =>
        `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
    )
    .join("");
}

export function prepareRichText(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  return ALLOWED_MARKUP_PATTERN.test(trimmed)
    ? trimmed
    : plainTextToRichText(trimmed);
}

export function sanitizeRichText(value: string): string {
  const sanitized = DOMPurify.sanitize(prepareRichText(value), {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
  });

  const container = document.createElement("div");
  container.innerHTML = sanitized;

  container.querySelectorAll("a").forEach((link) => {
    if (!link.getAttribute("href")) {
      link.replaceWith(...link.childNodes);
      return;
    }

    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  if (!container.textContent?.trim()) {
    return "";
  }

  return container.innerHTML;
}

export function richTextToPlainText(
  value: string | null | undefined,
): string {
  const original = value?.trim() ?? "";

  if (!ALLOWED_MARKUP_PATTERN.test(original)) {
    return original;
  }

  const prepared = prepareRichText(value);

  if (!prepared) {
    return "";
  }

  return prepared
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}
