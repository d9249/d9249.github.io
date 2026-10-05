const test = require("node:test");
const assert = require("node:assert/strict");
const { parsePromptIssue } = require("./issue-form.cjs");

const body = (overrides = {}) => {
  const values = {
    제목: "회의록 → 액션 아이템",
    "한 줄 설명": "회의 기록에서 결정 사항만 뽑습니다",
    "프롬프트 원문":
      "```text\n아래 회의 기록에서 결정 사항을 정리하세요.\n### 함정 헤더\n### 용도\n가짜 값\n${회의 기록}\n```",
    용도: "업무·커리어",
    "주로 쓰는 AI": "챗봇 (ChatGPT · Claude · Gemini)",
    "이미지를 함께 첨부해야 하나요?": "아니요",
    출처: "제가 직접 썼습니다",
    "원 출처 링크": "_No response_",
    "공개 라이선스": "CC BY 4.0 (출처를 밝히면 자유롭게 이용)",
    "표시할 이름": "_No response_",
    확인: "- [X] 권리 확인\n- [X] 유해 용도 아님",
    ...overrides,
  };
  return Object.entries(values)
    .map(([label, value]) => `### ${label}\n\n${value}`)
    .join("\n\n");
};

test("parses a complete issue form into a community entry", () => {
  const { errors, entry } = parsePromptIssue({
    body: body(),
    number: 42,
    login: "octocat",
  });

  assert.deepEqual(errors, []);
  assert.equal(entry.id, "community-42");
  assert.equal(entry.category, "business");
  assert.equal(entry.target, "chat");
  assert.equal(entry.needsUpload, false);
  assert.equal(entry.source.license, "CC-BY-4.0");
  assert.equal(entry.source.authors[0].name, "octocat");
  assert.match(entry.prompt, /### 함정 헤더/);
  assert.ok(!entry.prompt.startsWith("```"));
});

test("rejects public-source submissions without an https link", () => {
  const { errors } = parsePromptIssue({
    body: body({ 출처: "재배포가 허용된 공개 출처에서 가져왔습니다" }),
    number: 7,
    login: "octocat",
  });

  assert.ok(errors.some((error) => error.includes("원 출처 링크")));
});

test("requires both confirmation boxes", () => {
  const { errors } = parsePromptIssue({
    body: body({ 확인: "- [X] 권리 확인\n- [ ] 유해 용도 아님" }),
    number: 8,
    login: "octocat",
  });

  assert.ok(errors.some((error) => error.includes("확인 항목")));
});

test("ignores unsafe logins and uses the display name", () => {
  const { entry } = parsePromptIssue({
    body: body({ "표시할 이름": "상민" }),
    number: 9,
    login: "bad login$(rm)",
  });

  assert.equal(entry.source.authors[0].name, "상민");
  assert.equal(
    entry.source.authors[0].url,
    "https://github.com/d9249/d9249.github.io/issues/9",
  );
});
