import * as React from "react";
import { Link } from "gatsby";
import categories from "../data/categories.json";

const allCategory = { slug: "", label: "All" };
const categoryItems = [allCategory, ...categories];

const CategoryNav = ({ activeCategory }) => {
  const [expanded, setExpanded] = React.useState(false);
  const listId = React.useId();
  const active = activeCategory
    ? categories.find((category) => category.slug === activeCategory)
    : undefined;
  const currentCategory = active || allCategory;

  return (
    <nav
      className="category-nav"
      aria-label="Blog categories"
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="category-nav-mobile-header">
        <span className="tag-nav-label">Categories</span>
        <button
          className="category-nav-toggle"
          type="button"
          aria-controls={listId}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? "카테고리 접기"
              : `카테고리 더 보기 (${categoryItems.length - 1}개 숨김)`
          }
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "접기" : "더 보기"}
        </button>
      </div>
      <div className="category-nav-list" id={listId}>
        {categoryItems.map((category) => (
          <Link
            key={category.slug || "all"}
            to={category.slug ? `/blog/${category.slug}/` : "/blog/"}
            className={
              category.slug === currentCategory.slug ? "is-active" : undefined
            }
          >
            {category.label}
          </Link>
        ))}
      </div>
      <span className="visually-hidden" aria-live="polite">
        {expanded
          ? `전체 ${categoryItems.length}개 카테고리가 표시되었습니다.`
          : `카테고리 목록이 접혔습니다. 현재 선택은 ${currentCategory.label}입니다.`}
      </span>
    </nav>
  );
};

export default CategoryNav;
