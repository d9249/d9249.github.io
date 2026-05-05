import * as React from "react";
import { Link } from "gatsby";
import categories from "../data/categories.json";

const CategoryNav = () => (
  <nav className="category-nav" aria-label="Blog categories">
    <Link to="/blog/" activeClassName="is-active">
      All
    </Link>
    {categories.map((category) => (
      <Link
        key={category.slug}
        to={`/blog/${category.slug}/`}
        activeClassName="is-active"
      >
        {category.label}
      </Link>
    ))}
  </nav>
);

export default CategoryNav;
