import * as React from "react";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Copy,
  Link as LinkIcon,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Button } from "../ui";
import {
  fillPrompt,
  getCategoryLabel,
  getLicenseLabel,
  getSourceKey,
  getTargetLabel,
} from "../../utils/prompts";

/*
 * The prompt library as rows on hairlines, like the projects index: the margin carries the use
 * and the AI, the line carries the name and what it does. Pressing a row opens the prompt in
 * place — the slots to fill, the finished text on the terminal, copy / save / link, and where it
 * came from. Open rows put their id in the URL hash (/prompts/#acp-linux-terminal).
 *
 * Styles: .prompt-row in src/styles/site.css.
 */

const LONG_VALUE_HINT =
  /(문서|본문|내용|로그|diff|텍스트|기록|답변|답안|조각|메모|원문|프롬프트|context|text|output)( \d+)?$/i;

const isLongField = (variable) =>
  variable.defaultValue.includes("\n") ||
  variable.defaultValue.length > 60 ||
  LONG_VALUE_HINT.test(variable.name);

const sourceNotes = {
  acp: "prompts.chat에 CC0 1.0으로 공개된 원문을 그대로 옮겼습니다.",
  dair: "Prompt Engineering Guide의 예제 원문입니다. 빈칸 표기만 {input} → ${input}으로 맞췄습니다.",
  original:
    "이 블로그에서 직접 썼습니다. 출처를 밝히면 자유롭게 고쳐 쓸 수 있습니다.",
  community: "공유한 분이 권리를 확인하고 고른 라이선스로 보낸 프롬프트입니다.",
};

const PromptPanel = ({ item, saved, onCopy, onCopyLink, onToggleSave }) => {
  const [values, setValues] = React.useState({});
  const [showRaw, setShowRaw] = React.useState(false);
  const filled = fillPrompt(item.prompt, values);
  const hasValues = Object.values(values).some((value) => value.trim());
  const hasSlots = item.variables.length > 0;

  return (
    <div className="prompt-row-more">
      {hasSlots ? (
        <section
          className="prompt-row-slots"
          aria-label={`${item.title} 빈칸 채우기`}
        >
          <h3 className="branch-row-h">
            빈칸 <span>{item.variables.length}</span>
            {hasValues ? (
              <button
                type="button"
                className="prompt-row-reset"
                onClick={() => setValues({})}
              >
                <RotateCcw aria-hidden="true" />
                비우기
              </button>
            ) : null}
          </h3>
          <div className="prompt-fields">
            {item.variables.map((variable, index) => {
              const id = `${item.id}-slot-${index}`;
              const long = isLongField(variable);
              const props = {
                id,
                value: values[variable.name] || "",
                placeholder:
                  variable.defaultValue || "비워 두면 [이름]으로 남습니다",
                onChange: (event) =>
                  setValues((previous) => ({
                    ...previous,
                    [variable.name]: event.target.value,
                  })),
              };
              return (
                <label
                  key={variable.name}
                  htmlFor={id}
                  className={`prompt-field${long ? " is-wide" : ""}`}
                >
                  <span>{variable.name}</span>
                  {long ? (
                    <textarea rows={3} {...props} />
                  ) : (
                    <input type="text" {...props} />
                  )}
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="prompt-row-text" aria-label={`${item.title} 본문`}>
        <div className="prompt-term">
          <p className="prompt-term-bar">
            <span>
              {hasSlots && !showRaw ? "완성본" : "프롬프트"} · ≈
              {item.tokens.toLocaleString("ko-KR")} 토큰
            </span>
            {hasSlots ? (
              <button
                type="button"
                onClick={() => setShowRaw((value) => !value)}
                aria-pressed={showRaw}
              >
                {showRaw ? "완성본 보기" : "원문 템플릿 보기"}
              </button>
            ) : null}
          </p>
          <pre data-lang={item.lang} tabIndex={0}>
            {showRaw ? item.prompt : filled}
          </pre>
        </div>
        {item.needsUpload ? (
          <p className="prompt-row-note">
            <Upload aria-hidden="true" />
            이미지를 함께 첨부해야 하는 프롬프트입니다. 본인 사진이나 쓸 권리가
            있는 이미지만 쓰고, 다른 사람의 얼굴은 동의 없이 넣지 마세요.
          </p>
        ) : null}
        <div className="prompt-row-actions">
          <Button
            variant="primary"
            onClick={() => onCopy(item, showRaw ? item.prompt : filled)}
          >
            <Copy aria-hidden="true" />
            복사
          </Button>
          <Button onClick={() => onToggleSave(item.id)} aria-pressed={saved}>
            {saved ? (
              <BookmarkCheck aria-hidden="true" />
            ) : (
              <Bookmark aria-hidden="true" />
            )}
            {saved ? "내 모음에 담김" : "내 모음에 담기"}
          </Button>
          <Button variant="tonal" onClick={() => onCopyLink(item)}>
            <LinkIcon aria-hidden="true" />
            링크 복사
          </Button>
        </div>
      </section>

      <footer className="prompt-row-source">
        <dl>
          <div>
            <dt>출처</dt>
            <dd>
              <a href={item.source.url} target="_blank" rel="noreferrer">
                {item.source.name}
              </a>
            </dd>
          </div>
          {item.source.authors?.length ? (
            <div>
              <dt>작성 · 기여</dt>
              <dd>
                {item.source.authors.map((author, index) => (
                  <React.Fragment key={author.name}>
                    {index > 0 ? ", " : null}
                    {author.url ? (
                      <a href={author.url} target="_blank" rel="noreferrer">
                        {author.name}
                      </a>
                    ) : (
                      author.name
                    )}
                  </React.Fragment>
                ))}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>라이선스</dt>
            <dd>
              <a href={item.source.licenseUrl} target="_blank" rel="noreferrer">
                {getLicenseLabel(item.source.license)}
              </a>
            </dd>
          </div>
        </dl>
        <p>{sourceNotes[getSourceKey(item)]}</p>
      </footer>
    </div>
  );
};

const PromptRow = ({
  item,
  open,
  saved,
  onToggle,
  onCopy,
  onCopyLink,
  onToggleSave,
}) => {
  const buttonId = `${item.id}-toggle`;
  const panelId = `${item.id}-more`;
  // mount the panel on first open and keep it, so closing can animate and typed slots survive
  const [mounted, setMounted] = React.useState(open);
  React.useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  return (
    <article id={item.id} className={`prompt-row${open ? " is-open" : ""}`}>
      <div className="prompt-row-top">
        <p className="prompt-row-meta">
          <span>{getCategoryLabel(item.category)}</span>
          <span>{getTargetLabel(item.target)}</span>
          {item.pick ? <b>PICK</b> : null}
        </p>
        <div className="prompt-row-main">
          <h3 className="prompt-row-title">
            <button
              type="button"
              id={buttonId}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggle(item.id)}
            >
              {item.title}
            </button>
          </h3>
          {item.titleEn ? (
            <p className="prompt-row-en">{item.titleEn}</p>
          ) : null}
          <p className="prompt-row-desc">{item.summary}</p>
        </div>
        <div className="prompt-row-side">
          <p className="prompt-row-facts">
            {item.variables.length ? (
              <span>빈칸 {item.variables.length}</span>
            ) : null}
            {item.needsUpload ? <span>이미지 첨부</span> : null}
            <span>≈{item.tokens.toLocaleString("ko-KR")} 토큰</span>
            <span>{getLicenseLabel(item.source?.license)}</span>
          </p>
          <div className="prompt-row-tools">
            <button
              type="button"
              className="ui-icon-button"
              onClick={() => onCopy(item)}
              aria-label={`${item.title} 복사`}
              title="복사"
            >
              <Copy aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ui-icon-button"
              onClick={() => onToggleSave(item.id)}
              aria-pressed={saved}
              aria-label={
                saved
                  ? `${item.title} 내 모음에서 빼기`
                  : `${item.title} 내 모음에 담기`
              }
              title={saved ? "내 모음에서 빼기" : "내 모음에 담기"}
            >
              {saved ? (
                <BookmarkCheck aria-hidden="true" />
              ) : (
                <Bookmark aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <span
          className="branch-row-toggle prompt-row-toggle"
          aria-hidden="true"
        >
          <ChevronDown />
        </span>
      </div>
      <div
        className="prompt-row-panel"
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={open ? undefined : ""}
      >
        <div className="prompt-row-panel-in">
          {mounted ? (
            <PromptPanel
              item={item}
              saved={saved}
              onCopy={onCopy}
              onCopyLink={onCopyLink}
              onToggleSave={onToggleSave}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
};

const PromptRows = ({ items, open, saved, ...handlers }) => (
  <div className="prompt-rows">
    {items.map((item) => (
      <PromptRow
        key={item.id}
        item={item}
        open={open.has(item.id)}
        saved={saved.has(item.id)}
        {...handlers}
      />
    ))}
  </div>
);

export default PromptRows;
