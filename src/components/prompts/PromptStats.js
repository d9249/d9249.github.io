import * as React from "react";
import {
  getSourceKey,
  promptCategories,
  promptSources,
  promptTargets,
} from "../../utils/prompts";

const BarList = ({ title, rows, total, onSelect }) => {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="stats-panel" aria-labelledby={`stats-${title}`}>
      <h3 id={`stats-${title}`}>{title}</h3>
      <ul className="stats-bars">
        {rows.map((row) => {
          const share = total ? Math.round((row.count / total) * 100) : 0;
          const content = (
            <>
              <span className="stats-bar-label">{row.label}</span>
              <span className="stats-bar-track" aria-hidden="true">
                <span
                  className="stats-bar-fill"
                  style={{ "--stats-share": row.count / max }}
                />
              </span>
              <span className="stats-bar-value">
                {row.count}
                <small>{share}%</small>
              </span>
            </>
          );

          return (
            <li
              key={row.key}
              title={`${row.label}: ${row.count}개 (${share}%)`}
            >
              {onSelect && row.count ? (
                <button type="button" onClick={() => onSelect(row.key)}>
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
  const total = prompts.length;
  const templates = prompts.filter((item) => item.variables.length).length;
  const uploads = prompts.filter((item) => item.needsUpload).length;
  const tokens = prompts.map((item) => item.tokens).sort((a, b) => a - b);
  const median = tokens.length ? tokens[Math.floor(tokens.length / 2)] : 0;

  const countBy = (getKey) =>
    prompts.reduce((map, item) => {
      const key = getKey(item);
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map());

  const byCategory = countBy((item) => item.category);
  const byTarget = countBy((item) => item.target);
  const bySource = countBy(getSourceKey);

  const categoryRows = promptCategories
    .map((category) => ({
      key: category.slug,
      label: category.label,
      count: byCategory.get(category.slug) || 0,
    }))
    .sort((a, b) => b.count - a.count);
  const targetRows = promptTargets.map((target) => ({
    key: target.slug,
    label: target.label,
    count: byTarget.get(target.slug) || 0,
  }));
  const sourceRows = promptSources.map((source) => ({
    key: source.key,
    label: `${source.name} · ${source.license}`,
    count: bySource.get(source.key) || 0,
  }));

  const tiles = [
    { label: "전체 프롬프트", value: total },
    { label: "변수 템플릿", value: templates },
    { label: "이미지 첨부형", value: uploads },
    { label: "길이 중앙값", value: `≈${median}`, unit: "토큰" },
  ];

  return (
    <div className="prompt-stats">
      <dl className="stats-tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className="stats-tile">
            <dt>{tile.label}</dt>
            <dd>
              {typeof tile.value === "number"
                ? tile.value.toLocaleString("ko-KR")
                : tile.value}
              {tile.unit ? <small>{tile.unit}</small> : null}
            </dd>
          </div>
        ))}
      </dl>
      <div className="stats-grid">
        <BarList
          title="용도별"
          rows={categoryRows}
          total={total}
          onSelect={onSelectCategory}
        />
        <div className="stats-stack">
          <BarList
            title="AI별"
            rows={targetRows}
            total={total}
            onSelect={onSelectTarget}
          />
          <BarList title="출처 · 라이선스별" rows={sourceRows} total={total} />
        </div>
      </div>
      <p className="stats-note">
        토큰 수는 영문 4자, 한글 1.4자를 1토큰으로 잡은 어림값입니다. 모델마다
        토크나이저가 달라 실제 과금 토큰과는 차이가 납니다.
      </p>
    </div>
  );
};

export default PromptStats;
