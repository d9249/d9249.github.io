// Parses a "프롬프트 공유하기" issue form body into a prompt entry.
// Kept dependency-free so it runs in GitHub Actions and under `node --test`.

const LABELS = [
  "제목",
  "한 줄 설명",
  "프롬프트 원문",
  "용도",
  "주로 쓰는 AI",
  "이미지를 함께 첨부해야 하나요?",
  "출처",
  "원 출처 링크",
  "공개 라이선스",
  "표시할 이름",
  "확인",
];

const CATEGORY = {
  "개발·코드": "dev",
  "프롬프트 설계": "prompting",
  "데이터·분석": "data",
  "글쓰기·번역": "writing",
  "학습·교육": "learning",
  "업무·커리어": "business",
  "이미지 생성": "image",
  "창작·놀이": "creative",
  "생활·취미": "life",
};

const LICENSE = [
  [
    "CC BY 4.0",
    "CC-BY-4.0",
    "https://creativecommons.org/licenses/by/4.0/deed.ko",
  ],
  [
    "CC0 1.0",
    "CC0-1.0",
    "https://creativecommons.org/publicdomain/zero/1.0/deed.ko",
  ],
  ["MIT", "MIT", "https://opensource.org/license/mit"],
];

const NO_RESPONSE = "_No response_";

const parseSections = (body) => {
  const text = `\n${(body || "").replace(/\r\n/g, "\n")}`;
  const positions = LABELS.map((label) => ({
    label,
    // Real form headers come after any user text that might imitate them,
    // so the last occurrence is the authoritative one.
    index: text.lastIndexOf(`\n### ${label}\n`),
  }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index);

  const sections = {};
  positions.forEach((entry, i) => {
    const start = entry.index + `\n### ${entry.label}\n`.length;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    const value = text.slice(start, end).trim();
    sections[entry.label] = value === NO_RESPONSE ? "" : value;
  });
  return sections;
};

const stripFence = (value) => {
  const match = value.match(/^```[^\n]*\n([\s\S]*?)\n```$/);
  return (match ? match[1] : value).trim();
};

const oneLine = (value) => value.replace(/\s+/g, " ").trim();

const parsePromptIssue = ({ body, number, login }) => {
  const errors = [];
  const sections = parseSections(body);

  const title = oneLine(sections["제목"] || "");
  const summary = oneLine(sections["한 줄 설명"] || "");
  const prompt = stripFence(sections["프롬프트 원문"] || "");
  const category = CATEGORY[(sections["용도"] || "").trim()];
  const targetText = sections["주로 쓰는 AI"] || "";
  const target = targetText.startsWith("코딩")
    ? "agent"
    : targetText.startsWith("이미지")
      ? "image"
      : targetText.startsWith("챗봇")
        ? "chat"
        : null;
  const needsUpload = (
    sections["이미지를 함께 첨부해야 하나요?"] || ""
  ).startsWith("예");
  const fromPublicSource = (sections["출처"] || "").startsWith("재배포");
  const sourceUrl = (sections["원 출처 링크"] || "").trim();
  const license = LICENSE.find(([prefix]) =>
    (sections["공개 라이선스"] || "").startsWith(prefix),
  );
  const displayName = oneLine(sections["표시할 이름"] || "").slice(0, 40);
  const checked = ((sections["확인"] || "").match(/- \[[xX]\]/g) || []).length;

  if (!title || title.length > 60) errors.push("제목은 1~60자여야 합니다.");
  if (!summary || summary.length > 140)
    errors.push("한 줄 설명은 1~140자여야 합니다.");
  if (prompt.length < 20 || prompt.length > 12000)
    errors.push("프롬프트 원문은 20~12,000자여야 합니다.");
  if (!category) errors.push("용도를 고르지 않았습니다.");
  if (!target) errors.push("주로 쓰는 AI를 고르지 않았습니다.");
  if (!license) errors.push("공개 라이선스를 고르지 않았습니다.");
  if (checked < 2) errors.push("확인 항목 두 개에 모두 체크해야 합니다.");
  if (fromPublicSource && !/^https:\/\/\S+$/.test(sourceUrl))
    errors.push("공개 출처에서 가져온 경우 https 원 출처 링크가 필요합니다.");
  if (sourceUrl && !/^https:\/\/\S+$/.test(sourceUrl))
    errors.push("원 출처 링크는 https:// 로 시작해야 합니다.");

  if (errors.length) return { errors };

  const safeLogin = /^[A-Za-z0-9-]{1,39}$/.test(login || "") ? login : "";
  const authorName = displayName || safeLogin || "익명";
  const issueUrl = `https://github.com/d9249/d9249.github.io/issues/${number}`;

  return {
    errors: [],
    entry: {
      id: `community-${number}`,
      title,
      titleEn: "",
      summary,
      category,
      target,
      pick: false,
      needsUpload,
      lang: /[가-힣]/.test(prompt) ? "ko" : "en",
      prompt,
      addedAt: new Date().toISOString().slice(0, 10),
      source: {
        name: fromPublicSource ? "커뮤니티 공유 · 공개 출처" : "커뮤니티 공유",
        url: fromPublicSource ? sourceUrl : issueUrl,
        issueUrl,
        authors: [
          {
            name: authorName,
            url: safeLogin ? `https://github.com/${safeLogin}` : issueUrl,
          },
        ],
        license: license[1],
        licenseUrl: license[2],
      },
    },
  };
};

module.exports = { parsePromptIssue, parseSections };
