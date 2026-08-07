const sourceLinePattern = /(?:^|\n)Sources:\s*(.+?)\s*$/i;
const sourcesSectionPattern = /(?:^|\n)##\s+Sources\s*\n+([\s\S]+?)\s*$/i;
const numberedSourcePattern =
  /^\[\d+\]\s+(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/\S+))(?:\s+[—–-]\s+(.+))?$/;
const bulletedSourcePattern =
  /^-\s+(?:(.+?):\s*)?(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/\S+))(?:\s+[—–-]\s+(.+))?$/;

const getSourceLabel = (href) => {
  try {
    const url = new URL(href);
    return url.hostname.replace(/^www\./, "");
  } catch (error) {
    return href;
  }
};

const splitSourceList = (sourceLine) => {
  const sources = [];
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  let sourceStart = 0;

  for (let index = 0; index < sourceLine.length; index += 1) {
    const character = sourceLine[index];

    if (character === "[") bracketDepth += 1;
    if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    if (character === "(") parenthesisDepth += 1;
    if (character === ")") {
      parenthesisDepth = Math.max(0, parenthesisDepth - 1);
    }

    const nextSource = sourceLine
      .slice(index + 1)
      .match(/^\s*(?:https?:\/\/|\[)/);
    if (
      character === "," &&
      bracketDepth === 0 &&
      parenthesisDepth === 0 &&
      nextSource
    ) {
      sources.push(sourceLine.slice(sourceStart, index).trim());
      sourceStart = index + 1;
    }
  }

  sources.push(sourceLine.slice(sourceStart).trim());
  return sources.filter(Boolean);
};

const parseSectionSource = (line) => {
  const numberedSource = line.match(numberedSourcePattern);

  if (numberedSource) {
    const href = numberedSource[2] || numberedSource[3];
    const label =
      numberedSource[4] || numberedSource[1] || getSourceLabel(href);

    return { href, label };
  }

  const bulletedSource = line.match(bulletedSourcePattern);

  if (!bulletedSource) return null;

  const href = bulletedSource[3] || bulletedSource[4];
  const label =
    bulletedSource[5] ||
    bulletedSource[1] ||
    bulletedSource[2] ||
    getSourceLabel(href);

  return { href, label };
};

const getPostSources = (rawMarkdownBody) => {
  const sectionMatch = rawMarkdownBody?.match(sourcesSectionPattern);

  if (sectionMatch) {
    return sectionMatch[1]
      .split("\n")
      .map((line) => parseSectionSource(line.trim()))
      .filter(Boolean);
  }

  const legacyMatch = rawMarkdownBody?.match(sourceLinePattern);
  if (!legacyMatch) return [];

  return splitSourceList(legacyMatch[1]).map((source) => {
    const markdownLink = source.match(/^\[(.+)\]\((https?:\/\/[^)]+)\)$/);
    const href = markdownLink ? markdownLink[2] : source;
    const label = markdownLink ? markdownLink[1] : getSourceLabel(href);

    return { href, label };
  });
};

const removePostSources = (html) =>
  html
    .replace(/\s*<h2(?:\s[^>]*)?>\s*Sources\s*<\/h2>[\s\S]*$/i, "")
    .replace(/\s*<p>Sources:\s*[\s\S]*?<\/p>\s*$/i, "");

const citationMarkerPattern = /\[(\d{1,3})\]/g;
const htmlTagPattern = /<[^>]+>/g;
const citationSuppressedTags = new Set([
  "a",
  "code",
  "kbd",
  "pre",
  "samp",
  "script",
  "style",
]);

const getCitationTagName = (tag) => {
  const match = tag.match(/^<\/?\s*([a-zA-Z0-9-]+)/);

  return match ? match[1].toLowerCase() : "";
};

const linkTextCitations = (text, sourceCount) =>
  text.replace(citationMarkerPattern, (marker, number) => {
    const index = Number(number);

    if (index < 1 || index > sourceCount) {
      return marker;
    }

    return `<a class="citation-ref" href="#post-source-${index}" aria-label="Source ${index}">${marker}</a>`;
  });

const linkPostCitations = (html, sourceCount) => {
  const source = String(html ?? "");

  if (!sourceCount) {
    return source;
  }

  let result = "";
  let suppressedDepth = 0;
  let cursor = 0;
  let match;

  htmlTagPattern.lastIndex = 0;

  while ((match = htmlTagPattern.exec(source))) {
    const text = source.slice(cursor, match.index);

    result += suppressedDepth > 0 ? text : linkTextCitations(text, sourceCount);

    const tag = match[0];
    const tagName = getCitationTagName(tag);

    if (citationSuppressedTags.has(tagName) && !/\/\s*>$/.test(tag)) {
      suppressedDepth += /^<\//.test(tag) ? -1 : 1;
      suppressedDepth = Math.max(0, suppressedDepth);
    }

    result += tag;
    cursor = match.index + tag.length;
  }

  const tail = source.slice(cursor);

  result += suppressedDepth > 0 ? tail : linkTextCitations(tail, sourceCount);

  return result;
};

exports.getPostSources = getPostSources;
exports.linkPostCitations = linkPostCitations;
exports.removePostSources = removePostSources;
