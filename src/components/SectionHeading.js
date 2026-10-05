import * as React from "react";
import Label from "./ui/Label";

/**
 * Kicker (or slate) + title (+ action, + side note). The heading of every section.
 *
 *   slate  { label, count, unit, colors? } — the reel's slate strip instead of a plain kicker,
 *          as on the page headers (see <PageHeader>)
 *
 * Styles: .section-head in src/styles/site.css, .ui-slate in components.css.
 */
const SectionHeading = ({
  as: Heading = "h2",
  kicker,
  slate,
  title,
  titleId,
  description,
  action,
}) => (
  <div className="section-head">
    <div className="section-heading-copy">
      {slate ? (
        <p className="ui-slate">
          <b>{slate.label}</b>
          {slate.colors?.length ? (
            <span className="ui-slate-bars" aria-hidden="true">
              {slate.colors.map((c, i) => (
                <i key={`${c}-${i}`} style={{ background: c }} />
              ))}
            </span>
          ) : null}
          {slate.count != null ? (
            <span>
              <em>{slate.count}</em> {slate.unit}
            </span>
          ) : null}
        </p>
      ) : (
        kicker && <Label kicker>{kicker}</Label>
      )}
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
