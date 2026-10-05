import * as React from "react";
import {
  Bookmark,
  BookmarkCheck,
  Bot,
  Braces,
  Copy,
  ImageIcon,
  MessageSquare,
  Star,
  Upload,
} from "lucide-react";
import {
  getCategoryLabel,
  getLicenseLabel,
  getTargetLabel,
} from "../../utils/prompts";

export const targetIcons = {
  chat: MessageSquare,
  agent: Bot,
  image: ImageIcon,
};

const PREVIEW_LENGTH = 240;

const PromptCard = ({ item, saved, onOpen, onCopy, onToggleSave }) => {
  const TargetIcon = targetIcons[item.target] || MessageSquare;
  // Show slots compactly as {name} instead of the raw ${name:default} syntax.
  const compact = item.prompt.replace(
    /\$\{([^}:\n]{1,60})(?::[^}]*)?\}/g,
    "{$1}",
  );
  const preview =
    compact.length > PREVIEW_LENGTH
      ? `${compact.slice(0, PREVIEW_LENGTH).trimEnd()}…`
      : compact;

  return (
    <article className="prompt-card" data-target={item.target}>
      <div className="prompt-card-meta">
        <span className="prompt-chip">{getCategoryLabel(item.category)}</span>
        <span className="prompt-chip is-quiet">
          <TargetIcon aria-hidden="true" size={13} strokeWidth={2} />
          {getTargetLabel(item.target)}
        </span>
        {item.pick ? (
          <span className="prompt-pick">
            <Star aria-hidden="true" size={12} strokeWidth={2.2} />
            에디터 픽
          </span>
        ) : null}
      </div>
      <h3 className="prompt-card-title">
        <button
          type="button"
          className="prompt-card-open"
          onClick={() => onOpen(item.id)}
        >
          {item.title}
        </button>
      </h3>
      {item.titleEn ? <p className="prompt-card-en">{item.titleEn}</p> : null}
      <p className="prompt-card-summary">{item.summary}</p>
      <pre
        className="prompt-card-preview"
        data-lang={item.lang}
        aria-hidden="true"
      >
        <span>{preview}</span>
      </pre>
      <div className="prompt-card-foot">
        <dl className="prompt-card-facts">
          {item.variables.length ? (
            <div>
              <dt className="visually-hidden">변수</dt>
              <dd>
                <Braces aria-hidden="true" size={13} strokeWidth={2} />
                변수 {item.variables.length}
              </dd>
            </div>
          ) : null}
          {item.needsUpload ? (
            <div>
              <dt className="visually-hidden">준비물</dt>
              <dd>
                <Upload aria-hidden="true" size={13} strokeWidth={2} />
                이미지 첨부
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="visually-hidden">길이</dt>
            <dd>≈{item.tokens.toLocaleString("ko-KR")} 토큰</dd>
          </div>
          <div>
            <dt className="visually-hidden">라이선스</dt>
            <dd>{getLicenseLabel(item.source?.license)}</dd>
          </div>
        </dl>
        <div className="prompt-card-actions">
          <button
            type="button"
            className="prompt-icon-button"
            onClick={() => onCopy(item)}
            aria-label={`${item.title} 프롬프트 복사`}
            title="복사"
          >
            <Copy aria-hidden="true" size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="prompt-icon-button"
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
              <BookmarkCheck aria-hidden="true" size={16} strokeWidth={2} />
            ) : (
              <Bookmark aria-hidden="true" size={16} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default React.memo(PromptCard);
