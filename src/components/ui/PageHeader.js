import * as React from "react";
import cx from "./cx";
import Label from "./Label";

/**
 * The top of every list and overview page: kicker, h1, optional lead, actions and an aside
 * (stats, facts). Detail pages (a post, a project) keep their own article header.
 * Styles: .ui-page-header in src/styles/components.css.
 */
const PageHeader = ({ kicker, title, lead, actions, aside, className }) => (
  <header className={cx("ui-page-header", className)}>
    <div className="ui-page-header-main">
      {kicker && <Label kicker>{kicker}</Label>}
      <h1>{title}</h1>
      {lead && <p className="ui-page-header-lead">{lead}</p>}
      {actions && <div className="ui-page-header-actions">{actions}</div>}
    </div>
    {aside && <div className="ui-page-header-aside">{aside}</div>}
  </header>
);

export default PageHeader;
