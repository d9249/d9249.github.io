import * as React from "react";
import { Link } from "gatsby";
import Layout from "./Layout";
import Pagination from "./Pagination";
import SectionHeading from "./SectionHeading";
import TagNav from "./TagNav";
import tipCategories from "../data/tipCategories.json";
import { getTipTagPath } from "../utils/tags";
import { truncateText } from "../utils/text";

const categoryBySlug = new Map(
  tipCategories.map((category) => [category.slug, category]),
);

const getTipCategoryPath = (slug) => (slug ? `/tips/${slug}/` : "/tips/");

const getTipCategoryLabel = (slug) => categoryBySlug.get(slug)?.label || slug;

const getFrontmatterList = (value) => value || [];

const getTipsPagePath = ({ category, page, tag }) => {
  const basePath = tag
    ? getTipTagPath(tag)
    : category
      ? `/tips/${category}/`
      : "/tips/";

  return page <= 1 ? basePath : `${basePath}page/${page}/`;
};

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

const TipCard = ({ tip }) => {
  const description = tip.frontmatter.description || tip.excerpt;

  return (
    <article className="tip-card">
      <div className="tip-card-head">
        <div className="meta">{tip.frontmatter.status}</div>
        <span title={tip.frontmatter.license}>{tip.frontmatter.license}</span>
      </div>
      <h3>
        <Link
          to={tip.fields.slug}
          aria-label={tip.frontmatter.title}
          title={tip.frontmatter.title}
        >
          {truncateText(tip.frontmatter.title, 48)}
        </Link>
      </h3>
      <p title={description}>{truncateText(description, 124)}</p>
      <div className="tip-platforms" aria-label="Supported platforms">
        {getFrontmatterList(tip.frontmatter.platforms).map((platform) => (
          <a
            key={platform}
            href={getTipCategoryPath(platform)}
            title={getTipCategoryLabel(platform)}
          >
            {getTipCategoryLabel(platform)}
          </a>
        ))}
      </div>
      {tip.frontmatter.highlights?.length ? (
        <ul className="tip-notes">
          {tip.frontmatter.highlights.map((note) => (
            <li key={note} title={note}>
              {truncateText(note, 92)}
            </li>
          ))}
        </ul>
      ) : null}
      {tip.frontmatter.tags?.length ? (
        <div className="tip-tags">
          {tip.frontmatter.tags.map((tag) => (
            <Link key={tag} to={getTipTagPath(tag)} title={tag}>
              {tag}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="tip-card-foot">
        <span title={tip.frontmatter.repository}>
          {tip.frontmatter.repository}
        </span>
        {tip.frontmatter.sourceUrl ? (
          <a href={tip.frontmatter.sourceUrl} target="_blank" rel="noreferrer">
            Source
          </a>
        ) : (
          <span>Unavailable</span>
        )}
      </div>
    </article>
  );
};

const TipsIndex = ({
  activeCategory,
  activeTag,
  currentPage = 1,
  description,
  label,
  pageCount = 1,
  skip = 0,
  tagSummaries,
  tips,
  totalTips,
}) => {
  const activeCategoryData = categoryBySlug.get(activeCategory);
  const visibleTips = tips;
  const totalVisibleTips = totalTips ?? visibleTips.length;
  const firstTipNumber = totalVisibleTips === 0 ? 0 : skip + 1;
  const lastTipNumber = Math.min(totalVisibleTips, skip + visibleTips.length);
  const pageTitle = label || activeCategoryData?.label || "Application Tips";
  const pageDescription =
    description ?? activeCategoryData?.description ?? null;

  return (
    <Layout>
      <section className="shell section">
        <SectionHeading
          as="h1"
          kicker="Tips"
          title={pageTitle}
          description={pageDescription}
        />
        <TipCategoryNav activeCategory={activeCategory} />
        <TagNav
          ariaLabel="Tip tags"
          activeTag={activeTag}
          getTagPathForTag={getTipTagPath}
          tagSummaries={tagSummaries}
        />
        <div className="tips-summary blog-list-summary" aria-live="polite">
          <span className="blog-list-count">
            {totalVisibleTips} tips
            {activeTag
              ? ` tagged #${activeTag}`
              : activeCategoryData
                ? ` for ${activeCategoryData.label}`
                : ""}
            {totalVisibleTips > 0
              ? `, ${firstTipNumber}-${lastTipNumber} showing`
              : ""}
          </span>
          <div className="blog-list-meta">
            <strong>
              {currentPage} / {pageCount}
            </strong>
            <Pagination
              ariaLabel="Tip pages"
              className="blog-top-pagination"
              compact
              currentPage={currentPage}
              getPagePath={(page) =>
                getTipsPagePath({
                  category: activeCategory,
                  page,
                  tag: activeTag,
                })
              }
              iconOnly
              pageCount={pageCount}
            />
          </div>
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
        <Pagination
          ariaLabel="Tip pages"
          currentPage={currentPage}
          getPagePath={(page) =>
            getTipsPagePath({
              category: activeCategory,
              page,
              tag: activeTag,
            })
          }
          pageCount={pageCount}
        />
      </section>
    </Layout>
  );
};

export default TipsIndex;
