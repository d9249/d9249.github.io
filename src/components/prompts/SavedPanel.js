import * as React from "react";
import { Copy, Download, Trash2, X } from "lucide-react";
import { Button } from "../ui";
import { formatPromptMarkdown, getCategoryLabel } from "../../utils/prompts";
import { copyText, downloadText } from "./promptClient";

/*
 * "내 모음": the prompts saved in this browser, in a full-height sheet like the site menu —
 * a slate with the count, the exports, then the saved prompts as a ledger.
 * Styles: .prompt-saved in src/styles/site.css.
 */

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
  const json = () =>
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

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogRef}
      className="prompt-saved"
      aria-labelledby="prompt-saved-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <div className="prompt-saved-in">
        <header className="prompt-saved-head">
          <p className="ui-slate">
            <b>Saved</b>
            <span>
              <em>{items.length}</em> prompts
            </span>
          </p>
          <button
            type="button"
            className="ui-icon-button prompt-saved-close"
            onClick={() => dialogRef.current?.close()}
            aria-label="내 모음 닫기"
          >
            <X aria-hidden="true" />
          </button>
          <h2 id="prompt-saved-title">내 모음</h2>
          <p className="prompt-saved-note">
            이 브라우저에만 저장됩니다. 다른 기기로 옮기려면 Markdown이나
            JSON으로 내보내세요.
          </p>
        </header>
        <div className="prompt-saved-actions">
          <Button onClick={handleCopyAll} disabled={!items.length}>
            <Copy aria-hidden="true" />
            전체 복사
          </Button>
          <Button
            onClick={() =>
              downloadText("my-prompts.md", markdown(), "text/markdown")
            }
            disabled={!items.length}
          >
            <Download aria-hidden="true" />
            Markdown
          </Button>
          <Button
            onClick={() =>
              downloadText("my-prompts.json", json(), "application/json")
            }
            disabled={!items.length}
          >
            <Download aria-hidden="true" />
            JSON
          </Button>
          <Button
            variant="tonal"
            onClick={handleClear}
            disabled={!items.length}
          >
            <Trash2 aria-hidden="true" />
            {confirmClear ? "정말 비우기" : "비우기"}
          </Button>
        </div>
        {items.length ? (
          <ol className="prompt-saved-list">
            {items.map((item, index) => (
              <li key={item.id}>
                <span className="prompt-saved-n">
                  {String(index + 1).padStart(2, "0")}
                </span>
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
                  className="ui-icon-button prompt-saved-remove"
                  onClick={() => onRemove(item.id)}
                  aria-label={`${item.title} 빼기`}
                  title="빼기"
                >
                  <X aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="prompt-saved-empty">
            목록의 책갈피 버튼을 누르면 여기에 모입니다.
          </p>
        )}
      </div>
    </dialog>
  );
};

export default SavedPanel;
