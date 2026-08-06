const test = require("node:test");
const assert = require("node:assert/strict");
const { formatReadableArticleHtml } = require("./articleHtml");

test("keeps numeric citation suffixes with the preceding sentence", () => {
  const html = formatReadableArticleHtml(
    "<p>첫 문장이다.[1][6] 다음 문장이다.</p>",
  );

  assert.equal(html, "<p>첫 문장이다.[1][6]<br>다음 문장이다.</p>");
});

test("still separates ordinary adjacent sentences", () => {
  const html = formatReadableArticleHtml("<p>첫 문장이다. 다음 문장이다.</p>");

  assert.equal(html, "<p>첫 문장이다.<br>다음 문장이다.</p>");
});
