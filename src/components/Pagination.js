import * as React from "react";
import { Link } from "gatsby";

const getPaginationItems = (currentPage, pageCount) => {
  const pages = new Set([1, pageCount, currentPage]);

  if (currentPage <= 3) {
    [2, 3, 4].forEach((page) => pages.add(page));
  }

  if (currentPage >= pageCount - 2) {
    [pageCount - 3, pageCount - 2, pageCount - 1].forEach((page) =>
      pages.add(page),
    );
  }

  [currentPage - 1, currentPage + 1].forEach((page) => pages.add(page));

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);
  const items = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push(`gap-${previousPage}-${page}`);
    }

    items.push(page);
  });

  return items;
};

const PaginationStep = ({ disabled, label, page, getPagePath }) => {
  const className = `pagination-step${disabled ? " is-disabled" : ""}`;

  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {label}
      </span>
    );
  }

  return (
    <Link className={className} to={getPagePath(page)}>
      {label}
    </Link>
  );
};

const Pagination = ({
  className = "",
  currentPage,
  pageCount,
  compact = false,
  getPagePath,
}) => {
  if (pageCount <= 1) {
    return null;
  }

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < pageCount ? currentPage + 1 : null;
  const paginationItems = getPaginationItems(currentPage, pageCount);
  const paginationClassName = [
    "pagination",
    compact ? "is-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={paginationClassName} aria-label="Blog pages">
      <PaginationStep
        disabled={!previousPage}
        getPagePath={getPagePath}
        label="이전"
        page={previousPage}
      />
      {compact ? null : (
        <div className="pagination-pages" aria-label="Page list">
          {paginationItems.map((item) =>
            typeof item === "string" ? (
              <span className="pagination-gap" key={item} aria-hidden="true">
                ...
              </span>
            ) : item === currentPage ? (
              <span
                className="pagination-page is-active"
                key={item}
                aria-current="page"
              >
                {item}
              </span>
            ) : (
              <Link
                className="pagination-page"
                key={item}
                to={getPagePath(item)}
              >
                {item}
              </Link>
            ),
          )}
        </div>
      )}
      <PaginationStep
        disabled={!nextPage}
        getPagePath={getPagePath}
        label="다음"
        page={nextPage}
      />
    </nav>
  );
};

export default Pagination;
