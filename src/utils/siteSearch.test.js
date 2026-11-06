const test = require("node:test");
const assert = require("node:assert/strict");
const { createSearchIndex, searchSite } = require("./siteSearch");

const post = (id, title, extra = {}) => ({
  id,
  fields: {
    contentType: "blog-post",
    slug: `/blog/${id}/`,
    category: "agent-systems",
  },
  frontmatter: { title, ...extra },
});

test("finds a project by its display name and normalizes full-width input", () => {
  const project = {
    ...post("avlan", "항공 안전 분석", { projectName: "A-VLAN" }),
    fields: { contentType: "project", slug: "/projects/avlan/" },
  };
  const index = createSearchIndex([project], []);
  assert.deepEqual(
    searchSite(index, "Ａ－ＶＬＡＮ").map((item) => item.fields.slug),
    ["/projects/avlan/"],
  );
});

test("returns every matching entry so the UI can page through all results", () => {
  const index = createSearchIndex(
    Array.from({ length: 25 }, (_, id) => post(String(id), `RAG ${id}`)),
    [],
  );
  assert.equal(searchSite(index, "RAG").length, 25);
});

test("includes navigation pages in site search", () => {
  const index = createSearchIndex(
    [],
    [{ label: "contact", ko: "연락처", to: "/contact/" }],
  );
  assert.equal(searchSite(index, "연락처")[0].fields.slug, "/contact/");
});

test("requires all query tokens and searches tags as well as article text", () => {
  const index = createSearchIndex(
    [
      post("match", "검색 시스템", { tags: ["RAG", "ACL"] }),
      post("partial", "RAG 검색"),
    ],
    [],
  );
  assert.deepEqual(
    searchSite(index, "rag acl").map((item) => item.id),
    ["match"],
  );
});

test("shows a title match before a newer entry that only mentions the term", () => {
  const index = createSearchIndex(
    [
      { ...post("mention", "제품 비교"), rawMarkdownBody: "A-VLAN 연동" },
      post("title", "A-VLAN"),
    ],
    [],
  );
  assert.equal(searchSite(index, "A-VLAN")[0].id, "title");
});
