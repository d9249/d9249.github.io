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
