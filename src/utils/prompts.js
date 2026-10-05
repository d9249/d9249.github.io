import openSourcePrompts from "../../content/prompts/open-sources.json";
import originalPrompts from "../../content/prompts/original.json";
import communityPrompts from "../../content/prompts/community.json";

export const PROMPT_REPO = "d9249/d9249.github.io";
export const PROMPT_SHARE_URL = `https://github.com/${PROMPT_REPO}/issues/new?template=prompt-share.yml`;
export const PROMPT_ISSUES_URL = `https://github.com/${PROMPT_REPO}/issues?q=label%3Aprompt%3Asubmission`;

// A prompt opens in place on /prompts/, like a project row on /projects/: its id is the hash.
export const promptUrl = (id) => `https://d9249.github.io/prompts/#${id}`;

export const promptCategories = [
  { slug: "dev", label: "개발·코드" },
  { slug: "prompting", label: "프롬프트 설계" },
  { slug: "data", label: "데이터·분석" },
  { slug: "writing", label: "글쓰기·번역" },
  { slug: "learning", label: "학습·교육" },
  { slug: "business", label: "업무·커리어" },
  { slug: "image", label: "이미지 생성" },
  { slug: "creative", label: "창작·놀이" },
  { slug: "life", label: "생활·취미" },
];

export const promptTargets = [
  { slug: "chat", label: "챗봇", hint: "ChatGPT · Claude · Gemini" },
  {
    slug: "agent",
    label: "코딩 에이전트",
    hint: "Claude Code · Codex · Cursor",
  },
  {
    slug: "image",
    label: "이미지 모델",
    hint: "Nano Banana · GPT Image · Midjourney",
  },
];

export const licenseLabels = {
  "CC0-1.0": "CC0 1.0",
  MIT: "MIT",
  "CC-BY-4.0": "CC BY 4.0",
};

const categoryLabelBySlug = new Map(
  promptCategories.map((category) => [category.slug, category.label]),
);
const targetLabelBySlug = new Map(
  promptTargets.map((target) => [target.slug, target.label]),
);

export const getCategoryLabel = (slug) => categoryLabelBySlug.get(slug) || slug;
export const getTargetLabel = (slug) => targetLabelBySlug.get(slug) || slug;
export const getLicenseLabel = (license) => licenseLabels[license] || license;

// `${name}` or `${name:default}` — the slot syntax shared by every source.
const VARIABLE_PATTERN = /\$\{([^}:\n]{1,60})(?::([^}]*))?\}/g;

export const getPromptVariables = (prompt) => {
  const seen = new Map();

  for (const match of prompt.matchAll(VARIABLE_PATTERN)) {
    const name = match[1].trim();
    if (!name || seen.has(name)) continue;
    seen.set(name, { name, defaultValue: (match[2] ?? "").trim() });
  }

  return [...seen.values()];
};

// Split a prompt into text and slot segments (for drawing the slots as blanks).
export const promptSegments = (prompt) => {
  const segments = [];
  let last = 0;
  for (const match of prompt.matchAll(VARIABLE_PATTERN)) {
    if (match.index > last)
      segments.push({ type: "text", value: prompt.slice(last, match.index) });
    segments.push({ type: "slot", name: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < prompt.length)
    segments.push({ type: "text", value: prompt.slice(last) });
  return segments;
};

export const fillPrompt = (prompt, values = {}) =>
  prompt.replace(VARIABLE_PATTERN, (whole, rawName, rawDefault) => {
    const name = rawName.trim();
    const value = values[name];
    if (typeof value === "string" && value.trim()) return value;
    if (rawDefault && rawDefault.trim()) return rawDefault.trim();
    return `[${name}]`;
  });

export const estimateTokens = (text) => {
  let ascii = 0;
  let hangul = 0;
  let other = 0;

  for (const char of text) {
    const code = char.codePointAt(0);
    if (code < 128) ascii += 1;
    else if (code >= 0xac00 && code <= 0xd7a3) hangul += 1;
    else other += 1;
  }

  return Math.max(1, Math.round(ascii / 4 + hangul / 1.4 + other / 2));
};

const normalize = (item, order) => {
  const variables = getPromptVariables(item.prompt);

  return {
    ...item,
    order,
    variables,
    tokens: estimateTokens(item.prompt),
    searchText: [
      item.title,
      item.titleEn,
      item.summary,
      item.prompt,
      getCategoryLabel(item.category),
      getTargetLabel(item.target),
      ...(item.source?.authors || []).map((author) => author.name),
    ]
      .filter(Boolean)
      .join("\n")
      .toLowerCase(),
  };
};

// Community submissions first (newest work), then the blog's own prompts,
// then curated open-source picks in curation order.
export const allPrompts = [
  ...communityPrompts,
  ...originalPrompts,
  ...openSourcePrompts,
].map(normalize);

export const promptById = new Map(allPrompts.map((item) => [item.id, item]));

export const promptSources = [
  {
    key: "community",
    short: "커뮤니티",
    name: "커뮤니티 공유",
    license: "항목별 표기",
    url: PROMPT_ISSUES_URL,
    note: "GitHub 이슈 폼으로 받은 프롬프트를 검토해 싣습니다. 작성자가 고른 라이선스(CC0 1.0 · CC BY 4.0)를 따릅니다.",
  },
  {
    key: "original",
    short: "직접 작성",
    name: "d9249.github.io 직접 작성",
    license: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/deed.ko",
    note: "이 블로그에서 직접 쓴 프롬프트입니다. 출처(Sangmin Lee · 이 페이지 링크)를 밝히면 자유롭게 고쳐 쓰고 공유할 수 있습니다.",
  },
  {
    key: "acp",
    short: "prompts.chat",
    name: "f/awesome-chatgpt-prompts (prompts.chat)",
    license: "CC0 1.0",
    url: "https://github.com/f/awesome-chatgpt-prompts",
    note: "프롬프트 데이터 전체가 CC0 1.0(퍼블릭 도메인 헌정)입니다. 의무는 없지만 기여자 GitHub 계정을 함께 표기합니다.",
  },
  {
    key: "dair",
    short: "DAIR.AI",
    name: "dair-ai/Prompt-Engineering-Guide",
    license: "MIT",
    url: "https://github.com/dair-ai/Prompt-Engineering-Guide",
    note: "기법별 예제 프롬프트를 MIT 라이선스 고지와 함께 옮겼습니다.",
  },
];

export const getSourceKey = (item) => {
  if (item.id.startsWith("acp-")) return "acp";
  if (item.id.startsWith("dair-")) return "dair";
  if (item.id.startsWith("sm-")) return "original";
  return "community";
};

export const formatPromptMarkdown = (items) =>
  items
    .map((item) => {
      const authors = (item.source?.authors || [])
        .map((author) => author.name)
        .join(", ");
      return [
        `## ${item.title}${item.titleEn ? ` (${item.titleEn})` : ""}`,
        "",
        item.summary,
        "",
        "```text",
        item.prompt,
        "```",
        "",
        `- 출처: ${item.source?.name || "-"}${authors ? ` · ${authors}` : ""}`,
        `- 라이선스: ${getLicenseLabel(item.source?.license)}`,
        `- 링크: ${promptUrl(item.id)}`,
      ].join("\n");
    })
    .join("\n\n");
