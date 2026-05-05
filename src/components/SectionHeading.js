import * as React from "react";

const SectionHeading = ({ kicker, title, description, action }) => (
  <div className="section-head">
    <div>
      {kicker && <p className="eyebrow">{kicker}</p>}
      <h2>{title}</h2>
    </div>
    {(description || action) && (
      <div className="section-side">
        {description && <p className="section-note">{description}</p>}
        {action && <div className="section-action">{action}</div>}
      </div>
    )}
  </div>
);

export default SectionHeading;
