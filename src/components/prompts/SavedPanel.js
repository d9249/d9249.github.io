import * as React from "react";
import { Copy, Download, Trash2, X } from "lucide-react";
import { formatPromptMarkdown, getCategoryLabel } from "../../utils/prompts";
import { copyText, downloadText } from "./promptClient";

const SavedPanel = ({
  open,
  items,
  onClose,
  onOpenItem,
  onRemove,
  onClear,
  announce,
}) => {
  const dialogRef = React.useRef(null);
  const [confirmClear, setConfirmClear] = React.useState(false);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setConfirmClear(false);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    if (!open && dialog.open) dialog.close();
  }, [open]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const markdown = () =>
    `# 내 프롬프트 모음\n\n${formatPromptMarkdown(items)}\n`;

  const exportJson = () =>
    JSON.stringify(
      items.map(
        ({
          id,
          title,
          titleEn,
          summary,
          category,
          target,
          prompt,
          source,
        }) => ({
          id,
          title,
          titleEn,
          summary,
          category,
          target,
          prompt,
          source,
        }),
      ),
      null,
      2,
    );

  const handleCopyAll = async () => {
    const ok = await copyText(markdown());
    announce(ok ? `${items.length}개를 복사했습니다` : "복사하지 못했습니다");
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onClear();
    setConfirmClear(false);
    announce("내 모음을 비웠습니다");
  };

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className="prompt-sheet"
      aria-labelledby="prompt-saved-title"
      onClick={handleBackdropClick}
    >
      <div className="prompt-sheet-body">
        <header className="prompt-sheet-head">
          <div>
            <p className="eyebrow">Saved</p>
            <h2 id="prompt-saved-title">
              내 모음 <span>{items.length}</span>
            </h2>
          </div>
          <button
            type="button"
            className="prompt-icon-button"
            onClick={() => dialogRef.current?.close()}
            aria-label="내 모음 닫기"
          >
            <X aria-hidden="true" size={18} strokeWidth={2} />
          </button>
        </header>
        <p className="prompt-sheet-note">
          담은 목록은 이 브라우저에만 저장됩니다. 다른 기기로 옮기려면
          Markdown이나 JSON으로 내보내세요.
        </p>
        <div className="prompt-sheet-actions">
          <button
            type="button"
            className="button-secondary prompt-button"
            onClick={handleCopyAll}
            disabled={!items.length}
          >
            <Copy aria-hidden="true" size={15} strokeWidth={2} />
            전체 복사
          </button>
          <button
            type="button"
            className="button-secondary prompt-button"
            onClick={() =>
              downloadText("my-prompts.md", markdown(), "text/markdown")
            }
            disabled={!items.length}
          >
            <Download aria-hidden="true" size={15} strokeWidth={2} />
            Markdown
          </button>
          <button
            type="button"
            className="button-secondary prompt-button"
            onClick={() =>
              downloadText("my-prompts.json", exportJson(), "application/json")
            }
            disabled={!items.length}
          >
            <Download aria-hidden="true" size={15} strokeWidth={2} />
            JSON
          </button>
          <button
            type="button"
            className={`button-secondary prompt-button ${confirmClear ? "is-danger" : ""}`}
            onClick={handleClear}
            disabled={!items.length}
          >
            <Trash2 aria-hidden="true" size={15} strokeWidth={2} />
            {confirmClear ? "정말 비우기" : "비우기"}
          </button>
        </div>
        {items.length ? (
          <ul className="prompt-saved-list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="prompt-saved-open"
                  onClick={() => onOpenItem(item.id)}
                >
                  <strong>{item.title}</strong>
                  <span>{getCategoryLabel(item.category)}</span>
                </button>
                <button
                  type="button"
                  className="prompt-icon-button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`${item.title} 빼기`}
                  title="빼기"
                >
                  <X aria-hidden="true" size={15} strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state prompt-empty">
            카드의 책갈피 버튼을 누르면 여기에 모입니다.
          </p>
        )}
      </div>
    </dialog>
  );
};

export default SavedPanel;
