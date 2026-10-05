import * as React from "react";

/*
 * Short copy that runs to two or three sentences (a page's lead, a project's summary, a role's
 * description) reads better with each sentence on its own line. These helpers break after a
 * sentence's . ? ! when a new sentence follows (Hangul, a capital, a quote or a bracket), so
 * decimals (0.9188), versions and "vol. 78" stay on one line.
 *
 * Not for long prose (posts, write-ups) or text that is truncated.
 */

const BOUNDARY = /([.?!])\s+(?=[가-힣A-Z"'“‘(「『[])/gu;

// "M.S. Thesis", "J. Smith": a single capital before the period is an initial, not a sentence end
const INITIAL = /(^|[\s.])[A-Z]\.$/;

export const splitSentences = (text) => {
  if (typeof text !== "string") return [text];
  return text
    .replace(BOUNDARY, "$1\n")
    .split("\n")
    .reduce((parts, piece) => {
      const prev = parts[parts.length - 1];
      if (prev !== undefined && INITIAL.test(prev))
        parts[parts.length - 1] = `${prev} ${piece}`;
      else parts.push(piece);
      return parts;
    }, []);
};

/** <Sentences>{text}</Sentences> — the text with a <br> between sentences */
export const Sentences = ({ children }) => {
  if (typeof children !== "string") return children ?? null;
  const parts = splitSentences(children);
  return parts.map((sentence, i) => (
    <React.Fragment key={i}>
      {i > 0 ? <br /> : null}
      {sentence}
    </React.Fragment>
  ));
};

/** for HTML built as a string (the reel): sentences joined with <br> */
export const sentencesHTML = (text) => splitSentences(text).join("<br>");
