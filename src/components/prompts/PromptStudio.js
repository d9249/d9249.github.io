import * as React from "react";
import { Copy, Download, History, RotateCcw } from "lucide-react";
import { copyText, downloadText, useStoredList } from "./promptClient";
import { Button } from "../ui";

const HISTORY_KEY = "d9249:prompts:studio-history";
const HISTORY_LIMIT = 8;

const IMAGE_FIELDS = [
  {
    key: "subject",
    label: "주제 · 피사체",
    required: true,
    multiline: true,
    placeholder: "예: 비 갠 골목에서 노란 우비를 입고 웅덩이를 건너뛰는 아이",
    chips: [],
  },
  {
    key: "action",
    label: "동작 · 상태",
    placeholder: "예: 우산을 접으며 하늘을 올려다보는",
    chips: [
      "standing still, looking off-frame",
      "mid-stride, natural motion",
      "seated, relaxed posture",
      "holding a small object close",
      "floating weightlessly",
    ],
  },
  {
    key: "style",
    label: "스타일 · 매체",
    placeholder: "예: documentary photograph",
    chips: [
      "documentary photograph",
      "studio product photography",
      "soft watercolor illustration",
      "flat vector illustration",
      "isometric 3D render",
      "claymation-style miniature",
      "ink line drawing with light wash",
      "cinematic film still",
    ],
  },
  {
    key: "composition",
    label: "구도",
    placeholder: "예: rule-of-thirds composition",
    chips: [
      "rule-of-thirds composition",
      "centered symmetrical framing",
      "low-angle hero shot",
      "top-down flat lay",
      "wide establishing shot",
      "tight close-up with negative space",
    ],
  },
  {
    key: "setting",
    label: "공간 · 배경",
    placeholder: "예: quiet city street after rain",
    chips: [
      "seamless studio backdrop",
      "quiet city street after rain",
      "sunlit wooden interior",
      "minimal white space",
      "misty forest edge",
      "rooftop at dusk",
    ],
  },
  {
    key: "lighting",
    label: "조명",
    placeholder: "예: warm late-afternoon side light",
    chips: [
      "soft overcast daylight",
      "warm late-afternoon side light",
      "single softbox key light",
      "backlit rim light",
      "blue-hour ambient light",
      "practical lamps at night",
    ],
  },
  {
    key: "camera",
    label: "카메라 · 렌즈",
    placeholder: "예: 85mm lens, shallow depth of field",
    chips: [
      "35mm lens, natural perspective",
      "85mm lens, shallow depth of field",
      "macro lens, fine detail",
      "wide-angle 24mm lens",
      "tilt-shift miniature effect",
    ],
  },
  {
    key: "palette",
    label: "색감",
    placeholder: "예: muted earth tones",
    chips: [
      "muted earth tones",
      "cool blue and silver",
      "warm cream and terracotta",
      "high-contrast monochrome",
      "pastel mint and peach",
      "deep navy with one coral accent",
    ],
  },
  {
    key: "details",
    label: "질감 · 디테일",
    placeholder: "예: subtle film grain",
    chips: [
      "subtle film grain",
      "visible material texture",
      "crisp clean edges",
      "soft bokeh highlights",
      "hand-drawn imperfections",
    ],
  },
  {
    key: "negative",
    label: "빼고 싶은 것",
    placeholder: "예: text, watermark",
    chips: [
      "text, letters, watermark",
      "logos or brand marks",
      "extra or distorted fingers",
      "oversaturated colors",
      "blurry focus",
      "cluttered background",
    ],
  },
];

const TEXT_FIELDS = [
  {
    key: "role",
    label: "역할",
    placeholder: "예: 꼼꼼한 시니어 소프트웨어 엔지니어",
    chips: [
      "꼼꼼한 시니어 소프트웨어 엔지니어",
      "데이터 분석가",
      "기술 문서 편집자",
      "프로덕트 매니저",
      "친절한 튜터",
      "정보 추출기",
    ],
    single: true,
  },
  {
    key: "task",
    label: "할 일",
    required: true,
    multiline: true,
    placeholder: "예: 아래 회의록에서 결정 사항과 액션 아이템을 정리해 주세요.",
    chips: [],
  },
  {
    key: "context",
    label: "배경 · 맥락",
    multiline: true,
    placeholder: "누가 읽는지, 왜 필요한지, 이미 알고 있는 것",
    chips: [],
  },
  {
    key: "input",
    label: "입력 자료",
    multiline: true,
    placeholder: "비워두면 ${입력 자료} 변수로 남아 나중에 채울 수 있습니다",
    chips: [],
  },
  {
    key: "format",
    label: "출력 형식",
    placeholder: "예: 핵심 3줄 요약 + 불릿",
    chips: [
      "핵심 3줄 요약",
      "불릿 5개 이내",
      "Markdown 표",
      "JSON 한 개",
      "단계별 번호 목록",
      "3문단 이내",
    ],
  },
  {
    key: "constraints",
    label: "지켜야 할 것",
    multiline: true,
    placeholder: "한 줄에 하나씩",
    chips: [
      "근거 없는 내용은 추측하지 않기",
      "원문에 없는 수치는 만들지 않기",
      "전문 용어는 처음 나올 때 풀어 쓰기",
      "코드는 실행 가능한 형태로",
      "찾지 못한 값은 null로 두기",
      "설명 없이 결과만 출력하기",
      "요청 사항과 기한을 분명히 쓰기",
    ],
    lines: true,
  },
  {
    key: "tone",
    label: "어조",
    placeholder: "예: 간결하고 직설적으로",
    chips: [
      "간결하고 직설적으로",
      "친절하고 쉽게",
      "공식 문서체",
      "정중하지만 간결하게",
    ],
    single: true,
  },
  {
    key: "examples",
    label: "예시 (선택)",
    multiline: true,
    placeholder: "원하는 결과의 예시를 하나 넣으면 형식이 훨씬 안정됩니다",
    chips: [],
  },
];

const IMAGE_TARGETS = [
  {
    slug: "natural",
    label: "문장형",
    hint: "GPT Image · Nano Banana · Gemini",
  },
  { slug: "midjourney", label: "Midjourney", hint: "--ar · --no 파라미터" },
  { slug: "keywords", label: "키워드형", hint: "SDXL · Flux, 네거티브 분리" },
];

const ASPECT_RATIOS = ["1:1", "4:5", "2:3", "3:2", "16:9", "9:16"];

const IMAGE_PRESETS = [
  {
    label: "제품 컷",
    fields: {
      subject: "a ceramic coffee mug with a matte speckled glaze",
      style: "studio product photography",
      composition: "centered symmetrical framing",
      setting: "seamless studio backdrop",
      lighting: "single softbox key light",
      camera: "85mm lens, shallow depth of field",
      palette: "warm cream and terracotta",
      details: "visible material texture",
      negative: "text, letters, watermark, logos or brand marks",
    },
    aspect: "4:5",
  },
  {
    label: "블로그 커버",
    fields: {
      subject:
        "abstract layered shapes suggesting data flowing through a pipeline",
      style: "flat vector illustration",
      composition: "rule-of-thirds composition with empty space on the left",
      palette: "deep navy with one coral accent",
      details: "crisp clean edges",
      negative: "text, letters, watermark",
    },
    aspect: "16:9",
  },
  {
    label: "아이소메트릭",
    fields: {
      subject: "a compact server room with racks, cables and a cooling unit",
      style: "isometric 3D render",
      setting: "minimal white space",
      lighting: "soft overcast daylight",
      palette: "cool blue and silver",
      details: "crisp clean edges",
      negative: "text, letters, watermark",
    },
    aspect: "1:1",
  },
  {
    label: "수채화 풍경",
    fields: {
      subject: "a quiet seaside village in the early morning",
      style: "soft watercolor illustration",
      composition: "wide establishing shot",
      lighting: "warm late-afternoon side light",
      palette: "pastel mint and peach",
      details: "hand-drawn imperfections",
    },
    aspect: "3:2",
  },
  {
    label: "거리 스냅",
    fields: {
      subject: "a cyclist passing a neon-lit noodle shop",
      action: "mid-stride, natural motion",
      style: "documentary photograph",
      setting: "quiet city street after rain",
      lighting: "practical lamps at night",
      camera: "35mm lens, natural perspective",
      details: "subtle film grain",
    },
    aspect: "2:3",
  },
];

const TEXT_PRESETS = [
  {
    label: "코드 리뷰",
    fields: {
      role: "꼼꼼한 시니어 소프트웨어 엔지니어",
      task: "아래 코드를 리뷰하고 버그, 보안 문제, 성능 문제를 심각도 순으로 알려 주세요.",
      format: "항목마다 [심각도] 위치 — 문제 → 수정 제안",
      constraints: "근거 없는 내용은 추측하지 않기\n코드는 실행 가능한 형태로",
      tone: "간결하고 직설적으로",
    },
  },
  {
    label: "문서 요약",
    fields: {
      role: "기술 문서 편집자",
      task: "아래 문서를 바쁜 의사결정자를 위해 요약해 주세요.",
      format: "핵심 3줄 요약 + 결정이 필요한 항목 불릿",
      constraints:
        "원문에 없는 수치는 만들지 않기\n전문 용어는 처음 나올 때 풀어 쓰기",
      tone: "공식 문서체",
    },
  },
  {
    label: "JSON 추출",
    fields: {
      role: "정보 추출기",
      task: "아래 텍스트에서 회사명, 날짜, 금액을 추출해 주세요.",
      format: 'JSON 한 개 — {"company": "", "date": "YYYY-MM-DD", "amount": 0}',
      constraints: "찾지 못한 값은 null로 두기\n설명 없이 결과만 출력하기",
    },
  },
  {
    label: "메일 초안",
    fields: {
      role: "업무 메일을 잘 쓰는 동료",
      task: "아래 상황을 바탕으로 협력사에 보낼 일정 조율 메일을 써 주세요.",
      format: "제목 1줄 + 본문 3문단 이내",
      constraints: "요청 사항과 기한을 분명히 쓰기",
      tone: "정중하지만 간결하게",
    },
  },
];

const clean = (value) => (value || "").trim();

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const buildImagePrompt = (fields, target, aspect) => {
  const subject = clean(fields.subject);
  if (!subject) return { prompt: "", negative: "" };

  const negative = clean(fields.negative);
  const keys = [
    "action",
    "composition",
    "setting",
    "lighting",
    "camera",
    "palette",
    "details",
  ];

  if (target === "natural") {
    const opener = clean(fields.style)
      ? `${capitalize(clean(fields.style))} of ${subject}`
      : `An image of ${subject}`;
    const lines = [
      `${opener}${clean(fields.action) ? `, ${clean(fields.action)}` : ""}.`,
      clean(fields.composition) && `Composition: ${clean(fields.composition)}.`,
      clean(fields.setting) && `Setting: ${clean(fields.setting)}.`,
      clean(fields.lighting) && `Lighting: ${clean(fields.lighting)}.`,
      clean(fields.camera) && `Camera: ${clean(fields.camera)}.`,
      clean(fields.palette) && `Color palette: ${clean(fields.palette)}.`,
      clean(fields.details) && `Details: ${clean(fields.details)}.`,
      `Aspect ratio ${aspect}.`,
      negative && `Avoid: ${negative}.`,
    ].filter(Boolean);
    return { prompt: lines.join(" "), negative: "" };
  }

  const parts = [
    clean(fields.style) ? `${clean(fields.style)} of ${subject}` : subject,
    ...keys.map((key) => clean(fields[key])).filter(Boolean),
  ];

  if (target === "midjourney") {
    const params = [`--ar ${aspect}`, negative && `--no ${negative}`]
      .filter(Boolean)
      .join(" ");
    return { prompt: `${parts.join(", ")} ${params}`, negative: "" };
  }

  return { prompt: `${parts.join(", ")}, aspect ratio ${aspect}`, negative };
};

const buildTextPrompt = (fields, toggles) => {
  const task = clean(fields.task);
  if (!task) return { prompt: "", negative: "" };

  const constraints = clean(fields.constraints)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (toggles.noGuess)
    constraints.push("모르는 내용은 추측하지 말고 모른다고 답합니다.");
  if (toggles.askFirst)
    constraints.push(
      "요구사항이 모호하면 작업을 시작하기 전에 질문을 최대 3개까지 먼저 합니다.",
    );

  const sections = [
    clean(fields.role) && `당신은 ${clean(fields.role)}입니다.`,
    `## 할 일\n${task}`,
    clean(fields.context) && `## 배경\n${clean(fields.context)}`,
    `## 입력 자료\n<input>\n${clean(fields.input) || "${입력 자료}"}\n</input>`,
    clean(fields.format) && `## 출력 형식\n${clean(fields.format)}`,
    constraints.length &&
      `## 지켜야 할 것\n${constraints.map((line) => `- ${line}`).join("\n")}`,
    clean(fields.tone) && `## 어조\n${clean(fields.tone)}`,
    clean(fields.examples) && `## 예시\n${clean(fields.examples)}`,
  ].filter(Boolean);

  return { prompt: sections.join("\n\n"), negative: "" };
};

const appendChip = (current, chip, { single, lines }) => {
  if (single) return current === chip ? "" : chip;
  const separator = lines ? "\n" : ", ";
  const parts = (current || "")
    .split(lines ? "\n" : ",")
    .map((part) => part.trim())
    .filter(Boolean);
  const index = parts.indexOf(chip);
  if (index >= 0) parts.splice(index, 1);
  else parts.push(chip);
  return parts.join(separator);
};

const hasChip = (current, chip, { single, lines }) => {
  if (single) return current === chip;
  return (current || "")
    .split(lines ? "\n" : ",")
    .map((part) => part.trim())
    .includes(chip);
};

const formatTime = (iso) => {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch (error) {
    return "";
  }
};

const StudioField = ({ field, value, onChange }) => {
  const id = `studio-${field.key}`;
  const Control = field.multiline ? "textarea" : "input";

  return (
    <div className="studio-row">
      <label htmlFor={id} className="studio-row-label">
        {field.label}
        {field.required ? <b aria-hidden="true"> *</b> : null}
      </label>
      <div className="studio-row-control">
        <Control
          id={id}
          value={value}
          placeholder={field.placeholder}
          required={field.required}
          rows={field.multiline ? 3 : undefined}
          type={field.multiline ? undefined : "text"}
          onChange={(event) => onChange(field.key, event.target.value)}
        />
        {field.chips.length ? (
          <div
            className="studio-chips"
            role="group"
            aria-label={`${field.label} 제안`}
          >
            {field.chips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="ui-filter"
                aria-pressed={hasChip(value, chip, field)}
                onClick={() =>
                  onChange(field.key, appendChip(value, chip, field))
                }
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

// a small set of mutually exclusive choices: pill buttons, the chosen one in ink
const Choice = ({ label, options, value, onChange }) => (
  <div className="studio-choice" role="group" aria-label={label}>
    {options.map((option) => (
      <Button
        key={option.slug}
        aria-pressed={value === option.slug}
        title={option.hint}
        onClick={() => onChange(option.slug)}
      >
        {option.label}
      </Button>
    ))}
  </div>
);

const PromptStudio = ({ announce }) => {
  const [mode, setMode] = React.useState("image");
  const [imageFields, setImageFields] = React.useState({});
  const [textFields, setTextFields] = React.useState({});
  const [target, setTarget] = React.useState("natural");
  const [aspect, setAspect] = React.useState("4:5");
  const [toggles, setToggles] = React.useState({
    noGuess: true,
    askFirst: false,
  });
  const [history, setHistory] = useStoredList(HISTORY_KEY);

  const fieldsDef = mode === "image" ? IMAGE_FIELDS : TEXT_FIELDS;
  const fields = mode === "image" ? imageFields : textFields;
  const setFields = mode === "image" ? setImageFields : setTextFields;
  const presets = mode === "image" ? IMAGE_PRESETS : TEXT_PRESETS;

  const result =
    mode === "image"
      ? buildImagePrompt(imageFields, target, aspect)
      : buildTextPrompt(textFields, toggles);
  const filledCount = fieldsDef.filter((field) =>
    clean(fields[field.key]),
  ).length;
  const targetHint = IMAGE_TARGETS.find((item) => item.slug === target)?.hint;

  const handleChange = (key, value) =>
    setFields((previous) => ({ ...previous, [key]: value }));

  const remember = () => {
    if (!result.prompt) return;
    setHistory((previous) => {
      const entry = {
        id: `${Date.now()}`,
        mode,
        text: result.prompt,
        negative: result.negative,
        fields,
        target,
        aspect,
        at: new Date().toISOString(),
      };
      return [
        entry,
        ...previous.filter((item) => item.text !== entry.text),
      ].slice(0, HISTORY_LIMIT);
    });
  };

  const handleCopy = async (text, label = "프롬프트를") => {
    if (!text) return;
    const ok = await copyText(text);
    announce(ok ? `${label} 복사했습니다` : "복사하지 못했습니다");
    if (ok) remember();
  };

  const handleRestore = (entry) => {
    setMode(entry.mode);
    if (entry.mode === "image") {
      setImageFields(entry.fields || {});
      if (entry.target) setTarget(entry.target);
      if (entry.aspect) setAspect(entry.aspect);
    } else {
      setTextFields(entry.fields || {});
    }
    announce("기록을 불러왔습니다");
  };

  return (
    <div className="studio">
      <div className="studio-toolbar">
        <Choice
          label="만들 프롬프트 종류"
          value={mode}
          onChange={setMode}
          options={[
            { slug: "image", label: "이미지 프롬프트" },
            { slug: "text", label: "텍스트 · LLM 프롬프트" },
          ]}
        />
        <div className="studio-presets" role="group" aria-label="빠른 시작">
          <span className="ui-label">빠른 시작</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="ui-filter"
              onClick={() => {
                setFields({ ...preset.fields });
                if (preset.aspect) setAspect(preset.aspect);
              }}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            className="prompt-text-action"
            onClick={() => setFields({})}
          >
            <RotateCcw aria-hidden="true" />
            비우기
          </button>
        </div>
      </div>

      <div className="studio-layout">
        <form
          className="studio-form"
          onSubmit={(event) => event.preventDefault()}
          aria-label={
            mode === "image" ? "이미지 프롬프트 요소" : "텍스트 프롬프트 요소"
          }
        >
          <p className="studio-progress" aria-live="polite">
            <span
              style={{ "--k": filledCount / fieldsDef.length }}
              aria-hidden="true"
            />
            <b>
              {filledCount} / {fieldsDef.length}
            </b>{" "}
            채움
          </p>
          {fieldsDef.map((field) => (
            <StudioField
              key={`${mode}-${field.key}`}
              field={field}
              value={fields[field.key] || ""}
              onChange={handleChange}
            />
          ))}
          {mode === "text" ? (
            <div
              className="studio-row studio-toggles"
              role="group"
              aria-labelledby="studio-toggles-label"
            >
              <span id="studio-toggles-label" className="studio-row-label">
                안전장치
              </span>
              <div className="studio-row-control">
                <label>
                  <input
                    type="checkbox"
                    checked={toggles.noGuess}
                    onChange={(event) =>
                      setToggles((previous) => ({
                        ...previous,
                        noGuess: event.target.checked,
                      }))
                    }
                  />
                  모르면 모른다고 답하게 하기
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={toggles.askFirst}
                    onChange={(event) =>
                      setToggles((previous) => ({
                        ...previous,
                        askFirst: event.target.checked,
                      }))
                    }
                  />
                  모호하면 먼저 질문하게 하기
                </label>
              </div>
            </div>
          ) : null}
        </form>

        <aside className="studio-output" aria-label="완성된 프롬프트">
          {mode === "image" ? (
            <div className="studio-output-options">
              <span className="ui-label">대상 모델</span>
              <Choice
                label="대상 모델"
                value={target}
                onChange={setTarget}
                options={IMAGE_TARGETS}
              />
              <p className="studio-hint">{targetHint}</p>
              <span className="ui-label">화면비</span>
              <div className="studio-chips" role="group" aria-label="화면비">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    className="ui-filter"
                    aria-pressed={aspect === ratio}
                    onClick={() => setAspect(ratio)}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="prompt-term">
            <p className="prompt-term-bar">
              <span>
                Output ·{" "}
                {result.prompt
                  ? `${result.prompt.length.toLocaleString("ko-KR")}자`
                  : "대기 중"}
              </span>
            </p>
            <pre data-lang={mode === "text" ? "ko" : "en"} tabIndex={0}>
              {result.prompt ||
                (mode === "image"
                  ? "주제를 입력하면 여기에 프롬프트가 만들어집니다."
                  : "할 일을 입력하면 여기에 프롬프트가 만들어집니다.")}
            </pre>
          </div>
          {result.negative ? (
            <div className="prompt-term">
              <p className="prompt-term-bar">
                <span>Negative prompt</span>
              </p>
              <pre data-lang="en" tabIndex={0}>
                {result.negative}
              </pre>
            </div>
          ) : null}
          <div className="prompt-row-actions">
            <Button
              variant="primary"
              onClick={() => handleCopy(result.prompt)}
              disabled={!result.prompt}
            >
              <Copy aria-hidden="true" />
              복사
            </Button>
            {result.negative ? (
              <Button onClick={() => handleCopy(result.negative, "네거티브를")}>
                <Copy aria-hidden="true" />
                네거티브 복사
              </Button>
            ) : null}
            <Button
              disabled={!result.prompt}
              onClick={() => {
                const body = result.negative
                  ? `${result.prompt}\n\nNegative prompt:\n${result.negative}\n`
                  : `${result.prompt}\n`;
                downloadText(`prompt-${mode}.txt`, body);
                remember();
              }}
            >
              <Download aria-hidden="true" />
              TXT
            </Button>
          </div>
          {mode === "image" ? (
            <p className="studio-hint">
              한국어로 써도 되지만 대부분의 이미지 모델은 영어 묘사에서 결과가
              더 안정적입니다. 실존 인물·상표·캐릭터 이름은 넣지 않는 편이
              안전합니다.
            </p>
          ) : null}

          <section
            className="studio-history"
            aria-labelledby="studio-history-title"
          >
            <h3 id="studio-history-title" className="branch-row-h">
              <History aria-hidden="true" />
              최근 기록 <span>{history.length}</span>
              {history.length ? (
                <button
                  type="button"
                  className="prompt-row-reset"
                  onClick={() => setHistory([])}
                >
                  비우기
                </button>
              ) : null}
            </h3>
            {history.length ? (
              <ol>
                {history.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="studio-history-item"
                      onClick={() => handleRestore(entry)}
                      title="불러오기"
                    >
                      <span>
                        {entry.mode === "image" ? "이미지" : "텍스트"} ·{" "}
                        {formatTime(entry.at)}
                      </span>
                      <strong>{entry.text.split("\n")[0].slice(0, 90)}</strong>
                    </button>
                    <button
                      type="button"
                      className="ui-icon-button"
                      onClick={() => handleCopy(entry.text)}
                      aria-label="이 기록 복사"
                      title="복사"
                    >
                      <Copy aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="studio-hint">
                복사하거나 저장한 결과가 이 브라우저에 최근 {HISTORY_LIMIT}
                개까지 남습니다.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PromptStudio;
