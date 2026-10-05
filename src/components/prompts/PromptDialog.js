import * as React from "react";
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  RotateCcw,
  Shuffle,
  Star,
  Upload,
  X,
} from "lucide-react";
import {
  fillPrompt,
  getCategoryLabel,
  getLicenseLabel,
  getSourceKey,
  getTargetLabel,
} from "../../utils/prompts";
import { targetIcons } from "./PromptCard";

const LONG_VALUE_HINT =
  /(문서|본문|내용|로그|diff|텍스트|기록|답변|답안|조각|메모|원문|프롬프트|context|text|output)( \d+)?$/i;

const isLongField = (variable) =>
  variable.defaultValue.includes("\n") ||
  variable.defaultValue.length > 60 ||
  LONG_VALUE_HINT.test(variable.name);

const sourceNotes = {
  acp: "prompts.chat에 CC0 1.0으로 공개된 원문을 그대로 옮겼습니다.",
  dair: "Prompt Engineering Guide 예제 원문입니다. 빈칸 표기만 {input} → ${input}으로 통일했습니다.",
  original:
    "이 블로그에서 직접 작성했습니다. 출처를 밝히면 자유롭게 고쳐 쓸 수 있습니다.",
  community:
    "공유자가 권리를 확인하고 선택한 라이선스로 제출한 프롬프트입니다.",
};

const PromptDialog = ({
  item,
  saved,
  onClose,
  onCopy,
  onCopyLink,
  onToggleSave,
  onRandom,
}) => {
  const dialogRef = React.useRef(null);
  const [values, setValues] = React.useState({});
  const [showRaw, setShowRaw] = React.useState(false);

  React.useEffect(() => {
    setValues({});
    setShowRaw(false);
  }, [item?.id]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    if (!item && dialog.open) dialog.close();
  }, [item]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  };

  const filled = item ? fillPrompt(item.prompt, values) : "";
  const TargetIcon = item ? targetIcons[item.target] : null;
  const sourceKey = item ? getSourceKey(item) : "community";
  const hasValues = Object.values(values).some((value) => value.trim());

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className="prompt-dialog"
      aria-labelledby="prompt-dialog-title"
      onClick={handleBackdropClick}
    >
      {item ? (
        <div className="prompt-dialog-body">
          <header className="prompt-dialog-head">
            <div className="prompt-card-meta">
              <span className="prompt-chip">
                {getCategoryLabel(item.category)}
              </span>
              <span className="prompt-chip is-quiet">
                {TargetIcon ? (
                  <TargetIcon aria-hidden="true" size={13} strokeWidth={2} />
                ) : null}
                {getTargetLabel(item.target)}
              </span>
              {item.pick ? (
                <span className="prompt-pick">
                  <Star aria-hidden="true" size={12} strokeWidth={2.2} />
                  에디터 픽
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className="prompt-icon-button prompt-dialog-close"
              onClick={() => dialogRef.current?.close()}
              aria-label="닫기"
            >
              <X aria-hidden="true" size={18} strokeWidth={2} />
            </button>
            <h2 id="prompt-dialog-title">{item.title}</h2>
            {item.titleEn ? (
              <p className="prompt-card-en">{item.titleEn}</p>
            ) : null}
            <p className="prompt-dialog-summary">{item.summary}</p>
          </header>

          {item.needsUpload ? (
            <p className="prompt-notice">
              <Upload aria-hidden="true" size={15} strokeWidth={2} />
              이미지를 함께 첨부해야 하는 프롬프트입니다. 본인 사진이나 사용
              권리가 있는 이미지만 쓰고, 다른 사람의 얼굴은 동의 없이 넣지
              마세요.
            </p>
          ) : null}

          {item.variables.length ? (
            <section
              className="prompt-variables"
              aria-labelledby="prompt-variables-title"
            >
              <div className="prompt-subhead">
                <h3 id="prompt-variables-title">
                  변수 채우기 <span>{item.variables.length}</span>
                </h3>
                {hasValues ? (
                  <button
                    type="button"
                    className="prompt-text-button"
                    onClick={() => setValues({})}
                  >
                    <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
                    지우기
                  </button>
                ) : null}
              </div>
              <div className="prompt-variable-grid">
                {item.variables.map((variable, index) => {
                  const inputId = `prompt-var-${index}`;
                  const long = isLongField(variable);
                  const commonProps = {
                    id: inputId,
                    value: values[variable.name] || "",
                    placeholder:
                      variable.defaultValue || "비워두면 [변수명]으로 남습니다",
                    onChange: (event) =>
                      setValues((previous) => ({
                        ...previous,
                        [variable.name]: event.target.value,
                      })),
                  };

                  return (
                    <label
                      key={variable.name}
                      htmlFor={inputId}
                      className={`prompt-field ${long ? "is-wide" : ""}`}
                    >
                      <span>{variable.name}</span>
                      {long ? (
                        <textarea rows={3} {...commonProps} />
                      ) : (
                        <input type="text" {...commonProps} />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="prompt-text" aria-labelledby="prompt-text-title">
            <div className="prompt-subhead">
              <h3 id="prompt-text-title">
                {item.variables.length && !showRaw
                  ? "완성된 프롬프트"
                  : "프롬프트"}
              </h3>
              {item.variables.length ? (
                <button
                  type="button"
                  className="prompt-text-button"
                  onClick={() => setShowRaw((value) => !value)}
                  aria-pressed={showRaw}
                >
                  {showRaw ? "완성본 보기" : "원문 템플릿 보기"}
                </button>
              ) : null}
            </div>
            <pre className="prompt-full" data-lang={item.lang} tabIndex={0}>
              {showRaw ? item.prompt : filled}
            </pre>
          </section>

          <div className="prompt-dialog-actions">
            <button
              type="button"
              className="button-primary prompt-button"
              onClick={() => onCopy(item, showRaw ? item.prompt : filled)}
            >
              <Copy aria-hidden="true" size={16} strokeWidth={2} />
              복사
            </button>
            <button
              type="button"
              className="button-secondary prompt-button"
              onClick={() => onToggleSave(item.id)}
              aria-pressed={saved}
            >
              {saved ? (
                <BookmarkCheck aria-hidden="true" size={16} strokeWidth={2} />
              ) : (
                <Bookmark aria-hidden="true" size={16} strokeWidth={2} />
              )}
              {saved ? "담음" : "내 모음에 담기"}
            </button>
            <button
              type="button"
              className="button-secondary prompt-button"
              onClick={() => onCopyLink(item)}
            >
              <LinkIcon aria-hidden="true" size={16} strokeWidth={2} />
              링크 복사
            </button>
            <button
              type="button"
              className="button-secondary prompt-button"
              onClick={onRandom}
            >
              <Shuffle aria-hidden="true" size={16} strokeWidth={2} />
              하나 더 뽑기
            </button>
          </div>

          <footer className="prompt-source">
            <dl>
              <div>
                <dt>출처</dt>
                <dd>
                  <a href={item.source.url} target="_blank" rel="noreferrer">
                    {item.source.name}
                    <ExternalLink
                      aria-hidden="true"
                      size={13}
                      strokeWidth={2}
                    />
                  </a>
                </dd>
              </div>
              {item.source.authors?.length ? (
                <div>
                  <dt>작성·기여</dt>
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
                  <a
                    href={item.source.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {getLicenseLabel(item.source.license)}
                  </a>
                </dd>
              </div>
            </dl>
            <p>{sourceNotes[sourceKey]}</p>
          </footer>
        </div>
      ) : null}
    </dialog>
  );
};

export default PromptDialog;
