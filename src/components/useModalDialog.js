import * as React from "react";

export default function useModalDialog(ref, enabled = true, returnFocus) {
  React.useEffect(() => {
    if (!enabled) return undefined;
    const dialog = ref.current;
    const opener = returnFocus || document.activeElement;
    dialog.showModal();
    dialog.querySelector("button:not([disabled])")?.focus();
    const keepFocus = (event) => {
      if (event.key !== "Tab" || event.ctrlKey || event.metaKey || event.altKey)
        return;
      const controls = [
        ...dialog.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, iframe, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter(
        (element) =>
          element.getClientRects().length &&
          getComputedStyle(element).visibility !== "hidden" &&
          !element.closest("[inert]"),
      );
      const target = event.shiftKey ? controls.at(-1) : controls[0];
      const boundary = event.shiftKey ? controls[0] : controls.at(-1);
      // Chromium's embedded PDF viewer can otherwise send reverse Tab to browser chrome.
      if (document.activeElement === boundary || !controls.length) {
        event.preventDefault();
        (target || dialog).focus();
      }
    };
    dialog.addEventListener("keydown", keepFocus);
    return () => {
      dialog.removeEventListener("keydown", keepFocus);
      dialog.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [enabled, ref, returnFocus]);
}
