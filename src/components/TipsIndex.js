import * as React from "react";
import { Link } from "gatsby";
import Layout from "./Layout";
import SectionHeading from "./SectionHeading";
import { tipCategories, tips } from "../data/tips";

const categoryBySlug = new Map(
  tipCategories.map((category) => [category.slug, category]),
);

const getTipCategoryPath = (slug) => (slug ? `/tips/${slug}/` : "/tips/");

const getTipCategoryLabel = (slug) => categoryBySlug.get(slug)?.label || slug;

const getVisibleTips = (activeCategory) =>
  activeCategory
    ? tips.filter((tip) => tip.platforms.includes(activeCategory))
    : tips;

const TipCategoryNav = ({ activeCategory }) => (
  <nav className="category-nav" aria-label="Tip platforms">
    <Link
      to="/tips/"
      className={!activeCategory ? "is-active" : ""}
      aria-current={!activeCategory ? "page" : undefined}
    >
      All
    </Link>
    {tipCategories.map((category) => (
      <Link
        key={category.slug}
        to={getTipCategoryPath(category.slug)}
        className={category.slug === activeCategory ? "is-active" : ""}
        aria-current={category.slug === activeCategory ? "page" : undefined}
      >
        {category.label}
      </Link>
    ))}
  </nav>
);

const TipCard = ({ tip }) => (
  <article className="tip-card">
    <div className="tip-card-head">
      <div className="meta">{tip.status}</div>
      <span>{tip.license}</span>
    </div>
    <h3>
      <a href={tip.sourceUrl} target="_blank" rel="noreferrer">
        {tip.title}
      </a>
    </h3>
    <p>{tip.summary}</p>
    <div className="tip-platforms" aria-label="Supported platforms">
      {tip.platforms.map((platform) => (
        <Link key={platform} to={getTipCategoryPath(platform)}>
          {getTipCategoryLabel(platform)}
        </Link>
      ))}
    </div>
    <ul className="tip-notes">
      {tip.notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
    <div className="tip-tags">
      {tip.tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
    <div className="tip-card-foot">
      <span>{tip.repository}</span>
      <a href={tip.sourceUrl} target="_blank" rel="noreferrer">
        Source
      </a>
    </div>
  </article>
);

const TipsIndex = ({ activeCategory }) => {
  const activeCategoryData = categoryBySlug.get(activeCategory);
  const visibleTips = getVisibleTips(activeCategory);
  const pageTitle = activeCategoryData?.label || "Application Tips";
  const description =
    activeCategoryData?.description ||
    "새로 등장하는 응용프로그램과 로컬 도구를 플랫폼별로 빠르게 훑어볼 수 있게 정리합니다.";

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading
          kicker="Tips"
          title={pageTitle}
          description={description}
        />
        <TipCategoryNav activeCategory={activeCategory} />
        <div className="tips-summary">
          <span>
            {visibleTips.length} tips
            {activeCategoryData ? ` for ${activeCategoryData.label}` : ""}
          </span>
        </div>
        {visibleTips.length > 0 ? (
          <div className="tip-grid">
            {visibleTips.map((tip) => (
              <TipCard key={tip.slug} tip={tip} />
            ))}
          </div>
        ) : (
          <div className="empty-state">아직 정리된 앱이 없습니다.</div>
        )}
      </section>
    </Layout>
  );
};

export default TipsIndex;
