import * as React from "react";

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
      {kicker && <p className="eyebrow">{kicker}</p>}
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
