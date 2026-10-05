import * as React from "react";
import {
  ArrowUpRight,
  Bookmark,
  ChartNoAxesColumn,
  Library,
  Search,
  Send,
  Shuffle,
  WandSparkles,
  X,
} from "lucide-react";
import Layout from "../components/Layout";
import SectionHeading from "../components/SectionHeading";
import PromptCard from "../components/prompts/PromptCard";
import PromptDialog from "../components/prompts/PromptDialog";
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
import "../styles/prompts.css";

const PAGE_SIZE = 24;
const SAVED_KEY = "d9249:prompts:saved";
const TABS = [
  { id: "library", label: "라이브러리", icon: Library },
  { id: "builder", label: "프롬프트 빌더", icon: WandSparkles },
  { id: "stats", label: "통계", icon: ChartNoAxesColumn },
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

const setUrlState = ({ promptId, tab }) => {
  const url = new URL(window.location.href);
  if (promptId) url.searchParams.set("p", promptId);
  else url.searchParams.delete("p");
  url.hash = tab && tab !== "library" ? tab : "";
  window.history.replaceState(window.history.state, "", url);
};

const FilterChip = ({ active, onClick, children }) => (
  <button
    type="button"
    className={`prompt-filter-chip ${active ? "is-active" : ""}`}
    aria-pressed={active}
    onClick={onClick}
  >
    {children}
  </button>
);

const PromptsPage = () => {
  const [tab, setTab] = React.useState("library");
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [onlyTemplates, setOnlyTemplates] = React.useState(false);
  const [onlyPicks, setOnlyPicks] = React.useState(false);
  const [onlySaved, setOnlySaved] = React.useState(false);
  const [onlyUploads, setOnlyUploads] = React.useState(false);
  const [sort, setSort] = React.useState("recommended");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [openId, setOpenId] = React.useState(null);
  const [savedOpen, setSavedOpen] = React.useState(false);
  const [saved, setSaved] = useStoredList(SAVED_KEY);
  const [status, announce] = useStatusMessage();
  const deferredQuery = React.useDeferredValue(query);
  const tabRefs = React.useRef({});

  const savedSet = React.useMemo(() => new Set(saved), [saved]);

  React.useEffect(() => {
    const syncTabFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (TABS.some((item) => item.id === hash)) setTab(hash);
    };
    syncTabFromHash();
    const promptId = new URLSearchParams(window.location.search).get("p");
    if (promptId && promptById.has(promptId)) setOpenId(promptId);
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  const filtered = React.useMemo(() => {
    const terms = deferredQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const matches = allPrompts.filter(
      (item) =>
        (!category || item.category === category) &&
        (!target || item.target === target) &&
        (!onlyTemplates || item.variables.length > 0) &&
        (!onlyPicks || item.pick) &&
        (!onlyUploads || item.needsUpload) &&
        (!onlySaved || savedSet.has(item.id)) &&
        terms.every((term) => item.searchText.includes(term)),
    );
    return sortPrompts(matches, sort);
  }, [
    category,
    deferredQuery,
    onlyPicks,
    onlySaved,
    onlyTemplates,
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
    onlyTemplates,
    onlyUploads,
    sort,
    target,
  ]);

  const hasFilters =
    query ||
    category ||
    target ||
    onlyTemplates ||
    onlyPicks ||
    onlySaved ||
    onlyUploads;

  const resetFilters = () => {
    setQuery("");
    setCategory("");
    setTarget("");
    setOnlyTemplates(false);
    setOnlyPicks(false);
    setOnlySaved(false);
    setOnlyUploads(false);
  };

  const selectTab = (nextTab, { focus = false } = {}) => {
    setTab(nextTab);
    setUrlState({ promptId: openId, tab: nextTab });
    if (focus) tabRefs.current[nextTab]?.focus();
  };

  const handleTabKeyDown = (event) => {
    const index = TABS.findIndex((item) => item.id === tab);
    let next = null;
    if (event.key === "ArrowRight") next = TABS[(index + 1) % TABS.length];
    if (event.key === "ArrowLeft")
      next = TABS[(index - 1 + TABS.length) % TABS.length];
    if (event.key === "Home") next = TABS[0];
    if (event.key === "End") next = TABS[TABS.length - 1];
    if (next) {
      event.preventDefault();
      selectTab(next.id, { focus: true });
    }
  };

  const openPrompt = React.useCallback(
    (id) => {
      setSavedOpen(false);
      setOpenId(id);
      setUrlState({ promptId: id, tab });
    },
    [tab],
  );

  const closePrompt = React.useCallback(() => {
    setOpenId(null);
    setUrlState({ promptId: null, tab });
  }, [tab]);

  const openRandom = () => {
    const pool = filtered.length ? filtered : allPrompts;
    const candidates =
      pool.length > 1 ? pool.filter((item) => item.id !== openId) : pool;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) openPrompt(pick.id);
  };

  const handleCopy = React.useCallback(
    async (item, text) => {
      const body = text ?? fillPrompt(item.prompt);
      const ok = await copyText(body);
      announce(
        ok
          ? item.variables.length && text === undefined
            ? "복사했습니다 · 변수는 기본값이나 [이름]으로 채웠습니다"
            : "복사했습니다"
          : "복사하지 못했습니다",
      );
    },
    [announce],
  );

  const handleCopyLink = async (item) => {
    const url = `${window.location.origin}/prompts/?p=${item.id}`;
    const ok = await copyText(url);
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
  const openItem = openId ? promptById.get(openId) : null;
  const visible = filtered.slice(0, visibleCount);
  const sourceCounts = allPrompts.reduce((map, item) => {
    const key = getSourceKey(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());

  return (
    <Layout>
      <section
        className="shell section prompts-page"
        aria-labelledby="prompts-title"
      >
        <SectionHeading
          as="h1"
          kicker="Prompts"
          title="프롬프트 라이브러리"
          titleId="prompts-title"
          description="바로 복사해 쓰는 프롬프트를 용도와 AI별로 모았습니다. 항목마다 출처와 라이선스를 밝히고, 좋은 프롬프트는 누구나 공유할 수 있습니다."
        />

        <div className="prompts-intro">
          <dl className="prompts-counts">
            <div>
              <dt>프롬프트</dt>
              <dd>{allPrompts.length}</dd>
            </div>
            <div>
              <dt>변수 템플릿</dt>
              <dd>
                {allPrompts.filter((item) => item.variables.length).length}
              </dd>
            </div>
            <div>
              <dt>출처</dt>
              <dd>{[...sourceCounts.values()].filter(Boolean).length}</dd>
            </div>
          </dl>
          <div className="prompts-intro-actions">
            <a
              className="button-primary prompt-button"
              href={PROMPT_SHARE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Send aria-hidden="true" size={16} strokeWidth={2} />
              프롬프트 공유하기
            </a>
            <button
              type="button"
              className="button-secondary prompt-button"
              onClick={openRandom}
            >
              <Shuffle aria-hidden="true" size={16} strokeWidth={2} />
              아무거나 뽑기
            </button>
            <button
              type="button"
              className="button-secondary prompt-button"
              onClick={() => setSavedOpen(true)}
            >
              <Bookmark aria-hidden="true" size={16} strokeWidth={2} />내 모음
              <span className="prompt-count-badge">{savedItems.length}</span>
            </button>
          </div>
        </div>

        <div
          className="prompt-tabs"
          role="tablist"
          aria-label="프롬프트 보기 방식"
        >
          {TABS.map((item) => {
            const Icon = item.icon;
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
                className={selected ? "is-active" : ""}
                onClick={() => selectTab(item.id)}
                onKeyDown={handleTabKeyDown}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="prompt-panel-library"
          aria-labelledby="prompt-tab-library"
          hidden={tab !== "library"}
        >
          <div className="prompt-filters">
            <div className="prompt-search">
              <Search aria-hidden="true" size={17} strokeWidth={2} />
              <label htmlFor="prompt-search" className="visually-hidden">
                프롬프트 검색
              </label>
              <input
                id="prompt-search"
                type="search"
                value={query}
                placeholder="제목, 내용, 기여자로 검색 — 예: 코드 리뷰, SQL, poster"
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
                  <X aria-hidden="true" size={15} strokeWidth={2} />
                </button>
              ) : null}
            </div>

            <div className="prompt-filter-row" role="group" aria-label="용도">
              <span className="prompt-filter-label">용도</span>
              <FilterChip active={!category} onClick={() => setCategory("")}>
                전체
              </FilterChip>
              {promptCategories.map((item) => (
                <FilterChip
                  key={item.slug}
                  active={category === item.slug}
                  onClick={() =>
                    setCategory(category === item.slug ? "" : item.slug)
                  }
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
            <div className="prompt-filter-row" role="group" aria-label="AI">
              <span className="prompt-filter-label">AI</span>
              <FilterChip active={!target} onClick={() => setTarget("")}>
                전체
              </FilterChip>
              {promptTargets.map((item) => (
                <FilterChip
                  key={item.slug}
                  active={target === item.slug}
                  onClick={() =>
                    setTarget(target === item.slug ? "" : item.slug)
                  }
                >
                  <span title={item.hint}>{item.label}</span>
                </FilterChip>
              ))}
            </div>
            <div className="prompt-filter-row" role="group" aria-label="조건">
              <span className="prompt-filter-label">조건</span>
              <FilterChip
                active={onlyPicks}
                onClick={() => setOnlyPicks((value) => !value)}
              >
                에디터 픽
              </FilterChip>
              <FilterChip
                active={onlyTemplates}
                onClick={() => setOnlyTemplates((value) => !value)}
              >
                변수 템플릿
              </FilterChip>
              <FilterChip
                active={onlyUploads}
                onClick={() => setOnlyUploads((value) => !value)}
              >
                이미지 첨부형
              </FilterChip>
              <FilterChip
                active={onlySaved}
                onClick={() => setOnlySaved((value) => !value)}
              >
                내 모음만
              </FilterChip>
            </div>
          </div>

          <div className="prompt-results-bar">
            <p aria-live="polite">
              <strong>{filtered.length}</strong>개
              {hasFilters ? (
                <button
                  type="button"
                  className="prompt-text-button"
                  onClick={resetFilters}
                >
                  필터 초기화
                </button>
              ) : null}
            </p>
            <label className="prompt-sort">
              <span>정렬</span>
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

          {visible.length ? (
            <div className="prompt-grid">
              {visible.map((item) => (
                <PromptCard
                  key={item.id}
                  item={item}
                  saved={savedSet.has(item.id)}
                  onOpen={openPrompt}
                  onCopy={handleCopy}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state prompt-empty">
              조건에 맞는 프롬프트가 없습니다.
              {hasFilters ? (
                <button
                  type="button"
                  className="prompt-text-button"
                  onClick={resetFilters}
                >
                  필터 초기화
                </button>
              ) : null}
            </div>
          )}

          {filtered.length > visible.length ? (
            <div className="prompt-more">
              <button
                type="button"
                className="button-secondary prompt-button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                더 보기 ({visible.length} / {filtered.length})
              </button>
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
          id="prompt-panel-stats"
          aria-labelledby="prompt-tab-stats"
          hidden={tab !== "stats"}
        >
          {tab === "stats" ? (
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
          description="GitHub 이슈 폼으로 보내 주시면 검토한 뒤 라이브러리에 올립니다. 승인 라벨이 붙으면 자동으로 추가되고 배포됩니다."
          action={
            <a
              className="button-primary prompt-button"
              href={PROMPT_SHARE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <Send aria-hidden="true" size={16} strokeWidth={2} />
              GitHub으로 공유하기
            </a>
          }
        />
        <ol className="share-steps">
          <li>
            <strong>이슈 폼 작성</strong>
            <p>
              제목, 프롬프트 원문, 용도와 AI, 공개 라이선스(CC0 1.0 또는 CC BY
              4.0)를 고릅니다. GitHub 계정이 필요합니다.
            </p>
          </li>
          <li>
            <strong>검토</strong>
            <p>
              권리 문제, 개인정보, 유해 요소를 확인합니다. 고칠 점이 있으면 이슈
              댓글로 이야기합니다.
            </p>
          </li>
          <li>
            <strong>자동 반영</strong>
            <p>
              승인되면 카드에 공유자 이름과 라이선스가 붙어 올라가고, 이슈가
              닫히면서 링크가 달립니다.
            </p>
          </li>
        </ol>
        <div className="share-rules">
          <div>
            <h3>받는 프롬프트</h3>
            <ul>
              <li>직접 쓴 프롬프트</li>
              <li>
                CC0 · CC BY · MIT처럼 재배포가 허용된 출처의 원문 (출처 링크
                필수)
              </li>
              <li>
                {
                  "변수는 ${이름:기본값} 형태로 쓰면 변수 채우기 화면이 생깁니다"
                }
              </li>
            </ul>
          </div>
          <div>
            <h3>받지 않는 프롬프트</h3>
            <ul>
              <li>라이선스 표기가 없는 다른 사이트·SNS의 프롬프트를 옮긴 것</li>
              <li>실존 인물의 얼굴이나 목소리를 동의 없이 합성하는 용도</li>
              <li>개인정보, 성인물, 탈옥·악성코드 등 해로운 용도</li>
            </ul>
          </div>
        </div>
        <a
          className="prompt-inline-link"
          href={PROMPT_ISSUES_URL}
          target="_blank"
          rel="noreferrer"
        >
          공유된 프롬프트 이슈 보기
          <ArrowUpRight aria-hidden="true" size={15} strokeWidth={2} />
        </a>
      </section>

      <section
        className="shell section prompts-license"
        id="license"
        aria-labelledby="license-title"
      >
        <SectionHeading
          kicker="Sources & License"
          title="출처와 라이선스"
          titleId="license-title"
          description="재배포가 허용된 출처만 원문으로 싣습니다. 권리 문제가 있는 항목은 이슈나 메일로 알려 주시면 확인 즉시 내립니다."
        />
        <div className="license-table-wrap">
          <table className="license-table">
            <thead>
              <tr>
                <th scope="col">출처</th>
                <th scope="col">라이선스</th>
                <th scope="col">수록</th>
                <th scope="col">비고</th>
              </tr>
            </thead>
            <tbody>
              {promptSources.map((source) => (
                <tr key={source.key}>
                  <th scope="row">
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.name}
                    </a>
                  </th>
                  <td>{source.license}</td>
                  <td>{sourceCounts.get(source.key) || 0}</td>
                  <td>{source.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="license-notice">
          <summary>DAIR.AI Prompt Engineering Guide MIT 라이선스 전문</summary>
          <pre>{MIT_NOTICE}</pre>
        </details>
        <p className="license-related">
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
          설명은 각 운영자의 권리이므로 이곳에 옮기지 않았습니다. 더 많은
          프롬프트는 해당 사이트에서 확인하세요.
        </p>
        <p className="license-related">
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

      <PromptDialog
        item={openItem}
        saved={openItem ? savedSet.has(openItem.id) : false}
        onClose={closePrompt}
        onCopy={handleCopy}
        onCopyLink={handleCopyLink}
        onToggleSave={toggleSave}
        onRandom={openRandom}
      />
      <SavedPanel
        open={savedOpen}
        items={savedItems}
        onClose={() => setSavedOpen(false)}
        onOpenItem={openPrompt}
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
      content="출처와 라이선스를 밝힌 AI 프롬프트 라이브러리. 용도·AI별 검색, 변수 템플릿, 프롬프트 빌더, 공유 기능을 제공합니다."
    />
  </>
);
