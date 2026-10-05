import * as React from "react";
import { ArrowUpRight, Search, Send, Shuffle, Bookmark, X } from "lucide-react";
import Layout from "../components/Layout";
import { Button, PageHeader, SectionHeading } from "../components/ui";
import PromptRows from "../components/prompts/PromptRows";
import PromptSheet from "../components/prompts/PromptSheet";
import PromptStats from "../components/prompts/PromptStats";
import PromptStudio from "../components/prompts/PromptStudio";
import SavedPanel from "../components/prompts/SavedPanel";
import {
  copyText,
  useStatusMessage,
  useStoredList,
} from "../components/prompts/promptClient";
import {
  PROMPT_ISSUES_URL,
  PROMPT_SHARE_URL,
  allPrompts,
  fillPrompt,
  getSourceKey,
  promptById,
  promptCategories,
  promptSources,
  promptTargets,
} from "../utils/prompts";

const PAGE_SIZE = 24;
const SAVED_KEY = "d9249:prompts:saved";
const SHEET_ID = "sm-rag-grounded-answer";
const TABS = [
  { id: "library", label: "라이브러리" },
  { id: "builder", label: "빌더" },
  { id: "numbers", label: "숫자" },
];
const SORTS = [
  { id: "recommended", label: "추천순" },
  { id: "short", label: "짧은 순" },
  { id: "long", label: "긴 순" },
  { id: "title", label: "가나다순" },
  { id: "recent", label: "최근 추가순" },
];

const MIT_NOTICE = `MIT License

Copyright (c) 2022 DAIR.AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const sortPrompts = (items, sort) => {
  const sorted = [...items];
  switch (sort) {
    case "short":
      return sorted.sort((a, b) => a.tokens - b.tokens || a.order - b.order);
    case "long":
      return sorted.sort((a, b) => b.tokens - a.tokens || a.order - b.order);
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    case "recent":
      return sorted.sort(
        (a, b) => b.addedAt.localeCompare(a.addedAt) || a.order - b.order,
      );
    default:
      return sorted.sort(
        (a, b) => Number(b.pick) - Number(a.pick) || a.order - b.order,
      );
  }
};

const setHash = (hash) => {
  try {
    const { pathname, search } = window.location;
    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${search}${hash ? `#${hash}` : ""}`,
    );
  } catch (e) {
    // the URL is a convenience; the page works either way
  }
};

const countBy = (getKey) =>
  allPrompts.reduce((map, item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());
const categoryCounts = countBy((item) => item.category);
const targetCounts = countBy((item) => item.target);
const sourceCounts = countBy(getSourceKey);

const Filter = ({ active, onClick, count, children }) => (
  <button
    type="button"
    className="ui-filter"
    aria-pressed={active}
    onClick={onClick}
  >
    {children}
    {count != null ? <small>{count}</small> : null}
  </button>
);

const PromptsPage = () => {
  const [tab, setTab] = React.useState("library");
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [onlySlots, setOnlySlots] = React.useState(false);
  const [onlyPicks, setOnlyPicks] = React.useState(false);
  const [onlySaved, setOnlySaved] = React.useState(false);
  const [onlyUploads, setOnlyUploads] = React.useState(false);
  const [sort, setSort] = React.useState("recommended");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [open, setOpen] = React.useState(() => new Set());
  const [savedOpen, setSavedOpen] = React.useState(false);
  const [saved, setSaved] = useStoredList(SAVED_KEY);
  const [status, announce] = useStatusMessage();
  const [pendingReveal, setPendingReveal] = React.useState(null);
  const deferredQuery = React.useDeferredValue(query);
  const tabRefs = React.useRef({});

  const savedSet = React.useMemo(() => new Set(saved), [saved]);

  const filtered = React.useMemo(() => {
    const terms = deferredQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return sortPrompts(
      allPrompts.filter(
        (item) =>
          (!category || item.category === category) &&
          (!target || item.target === target) &&
          (!onlySlots || item.variables.length > 0) &&
          (!onlyPicks || item.pick) &&
          (!onlyUploads || item.needsUpload) &&
          (!onlySaved || savedSet.has(item.id)) &&
          terms.every((term) => item.searchText.includes(term)),
      ),
      sort,
    );
  }, [
    category,
    deferredQuery,
    onlyPicks,
    onlySaved,
    onlySlots,
    onlyUploads,
    savedSet,
    sort,
    target,
  ]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [
    category,
    deferredQuery,
    onlyPicks,
    onlySaved,
    onlySlots,
    onlyUploads,
    sort,
    target,
  ]);

  const hasFilters = Boolean(
    query ||
    category ||
    target ||
    onlySlots ||
    onlyPicks ||
    onlySaved ||
    onlyUploads,
  );

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setTarget("");
    setOnlySlots(false);
    setOnlyPicks(false);
    setOnlySaved(false);
    setOnlyUploads(false);
  };

  // open a prompt from outside the list (the header sheet, a #link, the random pick):
  // show the library, make sure the row is rendered, open it, then scroll to it
  const reveal = React.useCallback(
    (id, smooth = true) => {
      if (!promptById.has(id)) return;
      setTab("library");
      const index = filtered.findIndex((item) => item.id === id);
      if (index < 0) {
        resetFilters();
        const all = sortPrompts(allPrompts, sort);
        const at = all.findIndex((item) => item.id === id);
        setVisibleCount(Math.max(PAGE_SIZE, at + 1));
      } else if (index >= visibleCount) {
        setVisibleCount(index + 1);
      }
      setOpen((previous) =>
        previous.has(id) ? previous : new Set(previous).add(id),
      );
      setHash(id);
      setPendingReveal({ id, smooth });
    },
    [filtered, sort, visibleCount],
  );

  React.useEffect(() => {
    if (!pendingReveal) return;
    const row = document.getElementById(pendingReveal.id);
    if (!row) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    row.scrollIntoView({
      behavior: pendingReveal.smooth && !reduce ? "smooth" : "auto",
      block: "start",
    });
    row
      .querySelector(".prompt-row-title button")
      ?.focus({ preventScroll: true });
    setPendingReveal(null);
  });

  React.useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (TABS.some((item) => item.id === hash)) setTab(hash);
      else if (promptById.has(hash)) reveal(hash, false);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // run once: later reveals come from the page itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    const opening = !open.has(id);
    setOpen((previous) => {
      const next = new Set(previous);
      if (opening) next.add(id);
      else next.delete(id);
      return next;
    });
    if (opening) setHash(id);
    else if (window.location.hash === `#${id}`) setHash(null);
  };

  const selectTab = (next, { focus = false } = {}) => {
    setTab(next);
    setHash(next === "library" ? null : next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const handleTabKeyDown = (event) => {
    const index = TABS.findIndex((item) => item.id === tab);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    let next = null;
    if (step) next = TABS[(index + step + TABS.length) % TABS.length];
    if (event.key === "Home") next = TABS[0];
    if (event.key === "End") next = TABS[TABS.length - 1];
    if (next) {
      event.preventDefault();
      selectTab(next.id, { focus: true });
    }
  };

  const openRandom = () => {
    const pool = filtered.length ? filtered : allPrompts;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) reveal(pick.id);
  };

  const handleCopy = React.useCallback(
    async (item, text) => {
      const ok = await copyText(text ?? fillPrompt(item.prompt));
      announce(
        !ok
          ? "복사하지 못했습니다"
          : item.variables.length && text === undefined
            ? "복사했습니다 · 빈칸은 기본값이나 [이름]으로 채웠습니다"
            : "복사했습니다",
      );
    },
    [announce],
  );

  const handleCopyLink = async (item) => {
    const ok = await copyText(`${window.location.origin}/prompts/#${item.id}`);
    announce(ok ? "링크를 복사했습니다" : "복사하지 못했습니다");
  };

  const toggleSave = React.useCallback(
    (id) => {
      const exists = savedSet.has(id);
      setSaved((previous) =>
        exists
          ? previous.filter((value) => value !== id)
          : previous.includes(id)
            ? previous
            : [...previous, id],
      );
      announce(exists ? "내 모음에서 뺐습니다" : "내 모음에 담았습니다");
    },
    [announce, savedSet, setSaved],
  );

  const savedItems = saved.map((id) => promptById.get(id)).filter(Boolean);
  const visible = filtered.slice(0, visibleCount);

  return (
    <Layout>
      <section className="shell prompts-page">
        <PageHeader
          size="hero"
          slate={{
            label: "Prompts",
            count: allPrompts.length,
            unit: "prompts",
          }}
          title="프롬프트"
          lead="바로 복사해 쓰는 AI 프롬프트를 용도와 AI별로 모았습니다. 항목마다 출처와 라이선스를 밝힙니다. 빈칸이 있는 템플릿은 채우면 완성본이 바로 만들어집니다."
          actions={
            <>
              <Button variant="primary" href={PROMPT_SHARE_URL}>
                <Send aria-hidden="true" />
                프롬프트 공유하기
              </Button>
              <Button onClick={openRandom}>
                <Shuffle aria-hidden="true" />
                아무거나 뽑기
              </Button>
            </>
          }
          aside={
            <PromptSheet item={promptById.get(SHEET_ID)} onOpen={reveal} />
          }
        />

        <div className="prompt-rail-row">
          <div
            className="prompt-rail"
            role="tablist"
            aria-label="프롬프트 보기"
          >
            {TABS.map((item, index) => {
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[item.id] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`prompt-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`prompt-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectTab(item.id)}
                  onKeyDown={handleTabKeyDown}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
          <Button
            className="prompt-rail-saved"
            aria-label={`내 모음 ${savedItems.length}개`}
            onClick={() => setSavedOpen(true)}
          >
            <Bookmark aria-hidden="true" />
            <span className="prompt-rail-saved-label">내 모음</span>
            <span className="prompt-count">{savedItems.length}</span>
          </Button>
        </div>

        <div
          role="tabpanel"
          id="prompt-panel-library"
          aria-labelledby="prompt-tab-library"
          hidden={tab !== "library"}
        >
          <div className="prompt-filters">
            <div className="prompt-search">
              <Search aria-hidden="true" />
              <label htmlFor="prompt-search" className="visually-hidden">
                프롬프트 검색
              </label>
              <input
                id="prompt-search"
                type="search"
                value={query}
                placeholder="제목, 내용, 기여자로 찾기 — 코드 리뷰, SQL, poster"
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  className="prompt-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="검색어 지우기"
                >
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <div className="prompt-filter-row" role="group" aria-label="용도">
              <span className="ui-label">용도</span>
              <Filter active={!category} onClick={() => setCategory("")}>
                전체
              </Filter>
              {promptCategories.map((item) => (
                <Filter
                  key={item.slug}
                  active={category === item.slug}
                  count={categoryCounts.get(item.slug) || 0}
                  onClick={() =>
                    setCategory(category === item.slug ? "" : item.slug)
                  }
                >
                  {item.label}
                </Filter>
              ))}
            </div>
            <div className="prompt-filter-row" role="group" aria-label="AI">
              <span className="ui-label">AI</span>
              <Filter active={!target} onClick={() => setTarget("")}>
                전체
              </Filter>
              {promptTargets.map((item) => (
                <Filter
                  key={item.slug}
                  active={target === item.slug}
                  count={targetCounts.get(item.slug) || 0}
                  onClick={() =>
                    setTarget(target === item.slug ? "" : item.slug)
                  }
                >
                  {item.label}
                </Filter>
              ))}
            </div>
            <div className="prompt-filter-row" role="group" aria-label="조건">
              <span className="ui-label">조건</span>
              <Filter
                active={onlyPicks}
                onClick={() => setOnlyPicks((value) => !value)}
              >
                에디터 픽
              </Filter>
              <Filter
                active={onlySlots}
                onClick={() => setOnlySlots((value) => !value)}
              >
                빈칸 있는 템플릿
              </Filter>
              <Filter
                active={onlyUploads}
                onClick={() => setOnlyUploads((value) => !value)}
              >
                이미지 첨부형
              </Filter>
              <Filter
                active={onlySaved}
                onClick={() => setOnlySaved((value) => !value)}
              >
                내 모음만
              </Filter>
            </div>
          </div>

          <div className="prompt-results">
            <p className="ui-label" aria-live="polite">
              <em>{filtered.length}</em> prompts
              {hasFilters ? (
                <button
                  type="button"
                  className="prompt-text-action"
                  onClick={resetFilters}
                >
                  필터 초기화
                </button>
              ) : null}
            </p>
            <label className="prompt-sort">
              <span className="ui-label">정렬</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {SORTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <h2 className="visually-hidden">프롬프트 목록</h2>
          {visible.length ? (
            <PromptRows
              items={visible}
              open={open}
              saved={savedSet}
              onToggle={toggle}
              onCopy={handleCopy}
              onCopyLink={handleCopyLink}
              onToggleSave={toggleSave}
            />
          ) : (
            <p className="prompt-empty">
              조건에 맞는 프롬프트가 없습니다.{" "}
              <button
                type="button"
                className="prompt-text-action"
                onClick={resetFilters}
              >
                필터 초기화
              </button>
            </p>
          )}
          {filtered.length > visible.length ? (
            <div className="prompt-more">
              <Button
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                더 보기
                <span className="prompt-count">
                  {visible.length} / {filtered.length}
                </span>
              </Button>
            </div>
          ) : null}
        </div>

        <div
          role="tabpanel"
          id="prompt-panel-builder"
          aria-labelledby="prompt-tab-builder"
          hidden={tab !== "builder"}
        >
          {tab === "builder" ? <PromptStudio announce={announce} /> : null}
        </div>

        <div
          role="tabpanel"
          id="prompt-panel-numbers"
          aria-labelledby="prompt-tab-numbers"
          hidden={tab !== "numbers"}
        >
          {tab === "numbers" ? (
            <PromptStats
              prompts={allPrompts}
              onSelectCategory={(slug) => {
                resetFilters();
                setCategory(slug);
                selectTab("library");
              }}
              onSelectTarget={(slug) => {
                resetFilters();
                setTarget(slug);
                selectTab("library");
              }}
            />
          ) : null}
        </div>
      </section>

      <section
        className="shell section prompts-share"
        id="share"
        aria-labelledby="share-title"
      >
        <SectionHeading
          kicker="Share"
          title="프롬프트 공유하기"
          titleId="share-title"
          description="GitHub 이슈 폼으로 보내 주시면 검토한 뒤 올립니다. 승인 라벨이 붙으면 목록에 자동으로 추가되고 배포됩니다."
          action={
            <Button href={PROMPT_SHARE_URL}>
              <Send aria-hidden="true" />
              GitHub으로 공유하기
            </Button>
          }
        />
        <ol className="prompt-ledger">
          <li>
            <span className="prompt-ledger-n">01</span>
            <strong>이슈 폼 작성</strong>
            <p>
              제목, 프롬프트 원문, 용도와 AI, 공개 라이선스(CC0 1.0 · CC BY
              4.0)를 고릅니다. GitHub 계정이 필요합니다.
            </p>
          </li>
          <li>
            <span className="prompt-ledger-n">02</span>
            <strong>검토</strong>
            <p>
              권리 문제, 개인정보, 해로운 용도가 없는지 봅니다. 고칠 점은 이슈
              댓글로 이야기합니다.
            </p>
          </li>
          <li>
            <span className="prompt-ledger-n">03</span>
            <strong>자동 반영</strong>
            <p>
              승인되면 공유한 분의 이름과 라이선스를 달고 목록에 올라가며,
              이슈에 링크를 남기고 닫습니다.
            </p>
          </li>
        </ol>
        <div className="prompt-rules">
          <div>
            <h3 className="branch-row-h">받는 프롬프트</h3>
            <ul>
              <li>직접 쓴 프롬프트</li>
              <li>
                CC0 · CC BY · MIT처럼 재배포가 허용된 출처의 원문 (원 출처 링크
                필수)
              </li>
              <li>
                {
                  "빈칸은 ${이름} 또는 ${이름:기본값}으로 쓰면 채우기 칸이 생깁니다"
                }
              </li>
            </ul>
          </div>
          <div>
            <h3 className="branch-row-h">받지 않는 프롬프트</h3>
            <ul>
              <li>라이선스 표기가 없는 다른 사이트·SNS의 프롬프트를 옮긴 것</li>
              <li>실존 인물의 얼굴이나 목소리를 동의 없이 합성하는 용도</li>
              <li>개인정보, 성인물, 탈옥·악성코드처럼 해로운 용도</li>
            </ul>
          </div>
        </div>
        <p className="prompt-note">
          <a href={PROMPT_ISSUES_URL} target="_blank" rel="noreferrer">
            공유된 프롬프트 이슈 보기
            <ArrowUpRight aria-hidden="true" />
          </a>
        </p>
      </section>

      <section
        className="shell section prompts-license"
        id="license"
        aria-labelledby="license-title"
      >
        <SectionHeading
          kicker="Sources"
          title="출처와 라이선스"
          titleId="license-title"
          description="재배포가 허용된 출처만 원문으로 싣습니다. 권리 문제가 있는 항목은 알려 주시면 확인하는 대로 내립니다."
        />
        <ol className="prompt-sources">
          {promptSources.map((source) => (
            <li key={source.key}>
              <p className="prompt-sources-license">{source.license}</p>
              <div>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.name}
                </a>
                <p>{source.note}</p>
              </div>
              <p className="prompt-sources-n">
                {sourceCounts.get(source.key) || 0}
              </p>
            </li>
          ))}
        </ol>
        <details className="prompt-notice">
          <summary>
            DAIR.AI Prompt Engineering Guide — MIT 라이선스 전문
          </summary>
          <pre>{MIT_NOTICE}</pre>
        </details>
        <p className="prompt-note">
          검색·필터, 아무거나 뽑기, 내 모음 내보내기, 프롬프트 빌더 같은 기능은{" "}
          <a href="https://builderlog.net/" target="_blank" rel="noreferrer">
            빌더로그 프롬프트 도감
          </a>
          과{" "}
          <a
            href="https://reactor-prompts-magazine.pages.dev/"
            target="_blank"
            rel="noreferrer"
          >
            Reactor Prompts Magazine
          </a>
          을 보고 아이디어를 얻어 새로 만들었습니다. 두 사이트의 프롬프트와
          설명은 각 운영자의 권리라 이곳에 옮기지 않았습니다.
        </p>
        <p className="prompt-note">
          권리 신고: <a href="mailto:dodo9249@gmail.com">dodo9249@gmail.com</a>{" "}
          ·{" "}
          <a
            href="https://github.com/d9249/d9249.github.io/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            GitHub 이슈
          </a>
        </p>
      </section>

      <SavedPanel
        open={savedOpen}
        items={savedItems}
        onClose={() => setSavedOpen(false)}
        onOpenItem={(id) => {
          setSavedOpen(false);
          reveal(id);
        }}
        onRemove={toggleSave}
        onClear={() => setSaved([])}
        announce={announce}
      />
      <div className="prompt-status" role="status" aria-live="polite">
        {status}
      </div>
    </Layout>
  );
};

export default PromptsPage;

export const Head = () => (
  <>
    <title>Prompts</title>
    <meta
      name="description"
      content="출처와 라이선스를 밝힌 AI 프롬프트 라이브러리. 용도·AI별 검색, 빈칸 템플릿, 프롬프트 빌더, 공유 기능을 제공합니다."
    />
  </>
);
