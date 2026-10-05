import * as React from "react";
import Label from "./ui/Label";

/**
 * Kicker + title (+ action, + side note). The page header of list pages (as="h1") and the heading of
 * every section. Styles: .section-head in src/styles/site.css.
 */
const SectionHeading = ({
  as: Heading = "h2",
  kicker,
  title,
  titleId,
  description,
  action,
}) => (
  <div className="section-head">
    <div className="section-heading-copy">
      {kicker && <Label kicker>{kicker}</Label>}
      <div className="section-title-row">
        <Heading id={titleId}>{title}</Heading>
        {action && <div className="section-action">{action}</div>}
      </div>
    </div>
    {description && (
      <div className="section-side">
        <p className="section-note">{description}</p>
      </div>
    )}
  </div>
);

export default SectionHeading;
