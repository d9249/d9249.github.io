const test = require("node:test");
const assert = require("node:assert/strict");
const { getPostSources, removePostSources } = require("./articleSources");

test("extracts a final numbered Sources section", () => {
  const markdown = `본문이다.[1]

## Sources

[1] https://arxiv.org/abs/2607.18839 — arXiv abstract
[2] https://example.com/model — Official model page`;

  assert.deepEqual(getPostSources(markdown), [
    { href: "https://arxiv.org/abs/2607.18839", label: "arXiv abstract" },
    { href: "https://example.com/model", label: "Official model page" },
  ]);
});

test("removes the rendered numbered Sources section from the article body", () => {
  const html = `<p>본문이다.[1]</p>
<h2>Sources</h2>
<p>[1] <a href="https://arxiv.org/abs/2607.18839">https://arxiv.org/abs/2607.18839</a> — arXiv abstract
[2] <a href="https://example.com/model">https://example.com/model</a> — Official model page</p>`;

  assert.equal(removePostSources(html), "<p>본문이다.[1]</p>");
});

test("keeps support for the legacy single-line Sources format", () => {
  const markdown =
    "본문\n\nSources: [Paper](https://arxiv.org/abs/1234.5678), https://example.com";

  assert.deepEqual(getPostSources(markdown), [
    { href: "https://arxiv.org/abs/1234.5678", label: "Paper" },
    { href: "https://example.com", label: "example.com" },
  ]);
});

test("extracts Markdown-link bullets from a final Sources section", () => {
  const markdown = `본문

## Sources

- Paper: [Research title](https://arxiv.org/abs/1234.5678)
- GitHub: [owner/project](https://github.com/owner/project)`;

  assert.deepEqual(getPostSources(markdown), [
    { href: "https://arxiv.org/abs/1234.5678", label: "Paper" },
    { href: "https://github.com/owner/project", label: "GitHub" },
  ]);
});

test("removes a final Sources section rendered as a list", () => {
  const html = `<p>본문</p>
<h2>Sources</h2>
<ul><li>Paper: <a href="https://arxiv.org/abs/1234.5678">Research title</a></li></ul>`;

  assert.equal(removePostSources(html), "<p>본문</p>");
});

test("links in-text citation markers to matching source anchors", () => {
  const { linkPostCitations } = require("./articleSources");
  const html = "<p>본문이다.[1]<br>다음 문장.[2][3]</p>";

  assert.equal(
    linkPostCitations(html, 3),
    '<p>본문이다.<a class="citation-ref" href="#post-source-1" aria-label="Source 1">[1]</a><br>' +
      '다음 문장.<a class="citation-ref" href="#post-source-2" aria-label="Source 2">[2]</a>' +
      '<a class="citation-ref" href="#post-source-3" aria-label="Source 3">[3]</a></p>',
  );
});

test("ignores citation markers outside the source range", () => {
  const { linkPostCitations } = require("./articleSources");
  const html = "<p>배열 [0]과 범위 밖 [9]는 그대로 둔다.[1]</p>";

  assert.equal(
    linkPostCitations(html, 1),
    '<p>배열 [0]과 범위 밖 [9]는 그대로 둔다.<a class="citation-ref" href="#post-source-1" aria-label="Source 1">[1]</a></p>',
  );
});

test("does not link markers inside code, pre, or existing links", () => {
  const { linkPostCitations } = require("./articleSources");
  const html =
    '<p><code>items[1]</code> 그리고 <a href="https://example.com">[1] 링크</a>와 본문.[1]</p><pre><code>rows[2]</code></pre>';

  assert.equal(
    linkPostCitations(html, 2),
    '<p><code>items[1]</code> 그리고 <a href="https://example.com">[1] 링크</a>와 ' +
      '본문.<a class="citation-ref" href="#post-source-1" aria-label="Source 1">[1]</a></p><pre><code>rows[2]</code></pre>',
  );
});

test("returns html unchanged when the post has no sources", () => {
  const { linkPostCitations } = require("./articleSources");
  const html = "<p>본문이다.[1]</p>";

  assert.equal(linkPostCitations(html, 0), html);
});
