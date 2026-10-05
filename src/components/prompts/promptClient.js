import * as React from "react";

const readJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Private windows or blocked storage: keep the in-memory value only.
  }
};

// A list persisted in localStorage. It starts empty on the server render and
// loads after hydration so the static HTML never depends on the visitor.
export const useStoredList = (key) => {
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const stored = readJson(key, []);
    if (Array.isArray(stored)) setList(stored);
  }, [key]);

  const update = React.useCallback(
    (updater) => {
      setList((previous) => {
        const next =
          typeof updater === "function" ? updater(previous) : updater;
        writeJson(key, next);
        return next;
      });
    },
    [key],
  );

  return [list, update];
};

export const copyText = async (text) => {
  try {
    await window.navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    } catch (fallbackError) {
      return false;
    }
  }
};

export const downloadText = (filename, text, type = "text/plain") => {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

// One polite live region for the whole page ("복사했습니다" etc.).
export const useStatusMessage = () => {
  const [message, setMessage] = React.useState("");
  const timerRef = React.useRef(null);

  const announce = React.useCallback((text) => {
    window.clearTimeout(timerRef.current);
    setMessage(text);
    timerRef.current = window.setTimeout(() => setMessage(""), 2000);
  }, []);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return [message, announce];
};
