import * as React from "react";
import { Link } from "gatsby";
import Layout from "./Layout";
import SectionHeading from "./SectionHeading";
import tipCategories from "../data/tipCategories.json";

const categoryBySlug = new Map(
  tipCategories.map((category) => [category.slug, category]),
);

const getTipCategoryPath = (slug) => (slug ? `/tips/${slug}/` : "/tips/");

const getTipCategoryLabel = (slug) => categoryBySlug.get(slug)?.label || slug;

const getVisibleTips = (tips, activeCategory) =>
  activeCategory
    ? tips.filter((tip) => tip.frontmatter.platforms?.includes(activeCategory))
    : tips;

const getFrontmatterList = (value) => value || [];

const TipCategoryNav = ({ activeCategory }) => (
  <nav className="category-nav" aria-label="Tip platforms">
    <a
      href="/tips/"
      className={!activeCategory ? "is-active" : ""}
      aria-current={!activeCategory ? "page" : undefined}
    >
      All
    </a>
    {tipCategories.map((category) => (
      <a
        key={category.slug}
        href={getTipCategoryPath(category.slug)}
        className={category.slug === activeCategory ? "is-active" : ""}
        aria-current={category.slug === activeCategory ? "page" : undefined}
      >
        {category.label}
      </a>
    ))}
  </nav>
);

const TipCard = ({ tip }) => (
  <article className="tip-card">
    <div className="tip-card-head">
      <div className="meta">{tip.frontmatter.status}</div>
      <span>{tip.frontmatter.license}</span>
    </div>
    <h3>
      <Link to={tip.fields.slug}>{tip.frontmatter.title}</Link>
    </h3>
    <p>{tip.frontmatter.description || tip.excerpt}</p>
    <div className="tip-platforms" aria-label="Supported platforms">
      {getFrontmatterList(tip.frontmatter.platforms).map((platform) => (
        <a key={platform} href={getTipCategoryPath(platform)}>
          {getTipCategoryLabel(platform)}
        </a>
      ))}
    </div>
    {tip.frontmatter.highlights?.length ? (
      <ul className="tip-notes">
        {tip.frontmatter.highlights.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    ) : null}
    {tip.frontmatter.tags?.length ? (
      <div className="tip-tags">
        {tip.frontmatter.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    ) : null}
    <div className="tip-card-foot">
      <span>{tip.frontmatter.repository}</span>
      <a href={tip.frontmatter.sourceUrl} target="_blank" rel="noreferrer">
        Source
      </a>
    </div>
  </article>
);

const TipsIndex = ({ activeCategory, description, label, tips }) => {
  const activeCategoryData = categoryBySlug.get(activeCategory);
  const visibleTips = getVisibleTips(tips, activeCategory);
  const pageTitle = label || activeCategoryData?.label || "Application Tips";
  const pageDescription =
    description ||
    activeCategoryData?.description ||
    "새로 등장하는 응용프로그램과 로컬 도구를 플랫폼별로 빠르게 훑어볼 수 있게 정리합니다.";

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading
          kicker="Tips"
          title={pageTitle}
          description={pageDescription}
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
              <TipCard key={tip.fields.slug} tip={tip} />
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
