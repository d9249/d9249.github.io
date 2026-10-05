import * as React from "react";
import {
  getSourceKey,
  promptCategories,
  promptSources,
  promptTargets,
} from "../../utils/prompts";

/*
 * The library in numbers, set like the DACON page: stat tiles, then a bar per group. A bar's
 * length is its count against the largest in the group; pressing a use or an AI filters the list.
 * Styles: .stat-tiles / .bar-rows (site.css, shared with DACON) + .prompt-bars.
 */

const Bars = ({ id, title, rows, onSelect }) => {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="prompt-bars" aria-labelledby={id}>
      <h3 id={id} className="prompt-bars-h">
        {title}
      </h3>
      <ul className="bar-rows">
        {rows.map((row) => {
          const content = (
            <>
              <b>{row.label}</b>
              <span className="bar-rows-bar" aria-hidden="true">
                <i style={{ "--k": row.count / max }} />
              </span>
              <span className="bar-rows-n">{row.count}</span>
            </>
          );
          return (
            <li key={row.key}>
              {onSelect && row.count ? (
                <button
                  type="button"
                  onClick={() => onSelect(row.key)}
                  aria-label={`${row.label} ${row.count}개 — 목록에서 보기`}
                >
                  {content}
                </button>
              ) : (
                <div>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const PromptStats = ({ prompts, onSelectCategory, onSelectTarget }) => {
  const count = (test) => prompts.filter(test).length;
  const tokens = prompts.map((item) => item.tokens).sort((a, b) => a - b);
  const median = tokens.length ? tokens[Math.floor(tokens.length / 2)] : 0;

  const tally = (getKey) =>
    prompts.reduce((map, item) => {
      const key = getKey(item);
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map());
  const byCategory = tally((item) => item.category);
  const byTarget = tally((item) => item.target);
  const bySource = tally(getSourceKey);

  const tiles = [
    ["프롬프트", prompts.length],
    ["빈칸 있는 템플릿", count((item) => item.variables.length > 0)],
    ["에디터 픽", count((item) => item.pick)],
    ["이미지 첨부형", count((item) => item.needsUpload)],
    ["길이 중앙값 (토큰)", median],
    ["출처", promptSources.filter((s) => bySource.get(s.key)).length],
  ];

  return (
    <div className="prompt-stats">
      <dl className="stat-tiles">
        {tiles.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value.toLocaleString("ko-KR")}</dd>
          </div>
        ))}
      </dl>
      <Bars
        id="prompt-bars-category"
        title="용도별"
        onSelect={onSelectCategory}
        rows={promptCategories
          .map((category) => ({
            key: category.slug,
            label: category.label,
            count: byCategory.get(category.slug) || 0,
          }))
          .sort((a, b) => b.count - a.count)}
      />
      <Bars
        id="prompt-bars-target"
        title="AI별"
        onSelect={onSelectTarget}
        rows={promptTargets.map((target) => ({
          key: target.slug,
          label: target.label,
          count: byTarget.get(target.slug) || 0,
        }))}
      />
      <Bars
        id="prompt-bars-source"
        title="출처별"
        rows={promptSources.map((source) => ({
          key: source.key,
          label: `${source.short} · ${source.license}`,
          count: bySource.get(source.key) || 0,
        }))}
      />
      <p className="prompt-stats-note">
        토큰은 영문 4자, 한글 1.4자를 1토큰으로 잡은 어림값입니다. 모델마다
        토크나이저가 달라 실제 과금 토큰과는 차이가 납니다.
      </p>
    </div>
  );
};

export default PromptStats;
