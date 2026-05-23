const SUPPRESSED_TAGS = new Set([
  "a",
  "code",
  "kbd",
  "pre",
  "samp",
  "script",
  "style",
]);

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const SENTENCE_ENDINGS = new Set([".", "?", "!", "。", "？", "！"]);
const CLOSING_PUNCTUATION = new Set([
  '"',
  "'",
  ")",
  "]",
  "}",
  "”",
  "’",
  "」",
  "』",
  "〉",
  "》",
]);
const ABBREVIATIONS = new Set([
  "e.g.",
  "i.e.",
  "etc.",
  "vs.",
  "mr.",
  "mrs.",
  "ms.",
  "dr.",
  "prof.",
  "fig.",
  "no.",
  "st.",
]);

const PARAGRAPH_PATTERN = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/g;
const TAG_PATTERN = /<[^>]+>/g;

const isClosingTag = (tag) => /^<\//.test(tag);

const getTagName = (tag) => {
  const match = tag.match(/^<\/?\s*([a-zA-Z0-9-]+)/);

  return match ? match[1].toLowerCase() : "";
};

const isSelfClosingTag = (tag, tagName) =>
  VOID_TAGS.has(tagName) || /\/\s*>$/.test(tag);

const shouldSkipParagraph = (innerHtml) =>
  /<(img|picture|video|iframe|object|embed|br)\b/i.test(innerHtml);

const isWhitespace = (char) => /\s/.test(char);

const isLikelySentenceStart = (char) =>
  /[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Z0-9"“‘'([<{]/u.test(
    char,
  );

const isUrlOrDomainEnding = (text, index) => {
  const before = text.slice(0, index + 1);
  const chunk = before.slice(before.search(/\S+$/));

  return /(?:https?:\/\/|www\.|[\w-]+\.(?:com|org|net|io|ai|dev|kr|co|edu|gov|app)\.?$)/i.test(
    chunk,
  );
};

const isAbbreviationEnding = (text, index) => {
  const before = text.slice(Math.max(0, index - 24), index + 1);
  const token = before.match(/[A-Za-z](?:[A-Za-z]|\.)*\.$/)?.[0];

  if (!token) {
    return false;
  }

  return (
    ABBREVIATIONS.has(token.toLowerCase()) || /^(?:[A-Z]\.){2,}$/.test(token)
  );
};

const shouldBreakAfterSentence = (text, index, boundaryIndex, nextIndex) => {
  const char = text[index];
  const previousChar = text[index - 1] || "";
  const nextChar = text[index + 1] || "";
  const nextVisibleChar = text[nextIndex] || "";

  if (!SENTENCE_ENDINGS.has(char) || nextIndex === -1) {
    return false;
  }

  if (char === "." && /\d/.test(previousChar) && /\d/.test(nextChar)) {
    return false;
  }

  if (
    char === "." &&
    /[A-Za-z0-9]/.test(previousChar) &&
    /[A-Za-z0-9]/.test(nextChar)
  ) {
    return false;
  }

  if (char === "." && isAbbreviationEnding(text, index)) {
    return false;
  }

  if (char === "." && isUrlOrDomainEnding(text, index)) {
    return false;
  }

  if (!isLikelySentenceStart(nextVisibleChar)) {
    return false;
  }

  return boundaryIndex < nextIndex;
};

const collectTextTokens = (innerHtml) => {
  const tokens = [];
  const textMap = [];
  let text = "";
  let suppressedDepth = 0;
  let cursor = 0;
  let match;

  while ((match = TAG_PATTERN.exec(innerHtml))) {
    if (match.index > cursor) {
      const value = innerHtml.slice(cursor, match.index);
      const tokenIndex = tokens.length;
      const suppressed = suppressedDepth > 0;

      tokens.push({ type: "text", value, suppressed });

      const chars = Array.from(value);

      for (let offset = 0; offset < chars.length; offset += 1) {
        textMap.push({ offset, suppressed, tokenIndex });
        text += chars[offset];
      }
    }

    const tag = match[0];
    const tagName = getTagName(tag);

    if (SUPPRESSED_TAGS.has(tagName) && !isSelfClosingTag(tag, tagName)) {
      suppressedDepth += isClosingTag(tag) ? -1 : 1;
      suppressedDepth = Math.max(0, suppressedDepth);
    }

    tokens.push({ type: "tag", value: tag });
    cursor = match.index + tag.length;
  }

  if (cursor < innerHtml.length) {
    const value = innerHtml.slice(cursor);
    const tokenIndex = tokens.length;
    const suppressed = suppressedDepth > 0;

    tokens.push({ type: "text", value, suppressed });

    const chars = Array.from(value);

    for (let offset = 0; offset < chars.length; offset += 1) {
      textMap.push({ offset, suppressed, tokenIndex });
      text += chars[offset];
    }
  }

  return { text, textMap, tokens };
};

const collectBreaks = (text, textMap) => {
  const breaks = [];

  Array.from(text).forEach((char, index) => {
    if (!SENTENCE_ENDINGS.has(char) || textMap[index]?.suppressed) {
      return;
    }

    let boundaryIndex = index;

    while (CLOSING_PUNCTUATION.has(text[boundaryIndex + 1])) {
      boundaryIndex += 1;
    }

    let nextIndex = boundaryIndex + 1;

    while (nextIndex < text.length && isWhitespace(text[nextIndex])) {
      nextIndex += 1;
    }

    if (nextIndex >= text.length) {
      nextIndex = -1;
    }

    if (!shouldBreakAfterSentence(text, index, boundaryIndex, nextIndex)) {
      return;
    }

    breaks.push({
      boundaryIndex,
      spaceStart: boundaryIndex + 1,
      spaceEnd: nextIndex,
    });
  });

  return breaks;
};

const insertSentenceBreaks = (innerHtml) => {
  const { text, textMap, tokens } = collectTextTokens(innerHtml);
  const breaks = collectBreaks(text, textMap);

  if (!breaks.length) {
    return innerHtml;
  }

  const insertsByToken = new Map();
  const skipsByToken = new Map();

  breaks.forEach(({ boundaryIndex, spaceStart, spaceEnd }) => {
    const boundary = textMap[boundaryIndex];

    if (!boundary) {
      return;
    }

    const inserts = insertsByToken.get(boundary.tokenIndex) || new Set();
    inserts.add(boundary.offset);
    insertsByToken.set(boundary.tokenIndex, inserts);

    for (let index = spaceStart; index < spaceEnd; index += 1) {
      const item = textMap[index];

      if (!item) {
        continue;
      }

      const skips = skipsByToken.get(item.tokenIndex) || new Set();
      skips.add(item.offset);
      skipsByToken.set(item.tokenIndex, skips);
    }
  });

  return tokens
    .map((token, tokenIndex) => {
      if (token.type === "tag" || token.suppressed) {
        return token.value;
      }

      const inserts = insertsByToken.get(tokenIndex) || new Set();
      const skips = skipsByToken.get(tokenIndex) || new Set();

      return Array.from(token.value)
        .map((char, offset) => {
          if (skips.has(offset)) {
            return "";
          }

          return inserts.has(offset) ? `${char}<br>` : char;
        })
        .join("");
    })
    .join("");
};

const formatReadableArticleHtml = (html = "") =>
  String(html).replace(
    PARAGRAPH_PATTERN,
    (match, attributes = "", innerHtml) => {
      if (shouldSkipParagraph(innerHtml)) {
        return match;
      }

      return `<p${attributes}>${insertSentenceBreaks(innerHtml)}</p>`;
    },
  );

exports.formatReadableArticleHtml = formatReadableArticleHtml;
