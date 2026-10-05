import * as React from "react";
import cx from "./cx";
import Label from "./Label";

/**
 * The top of every list and overview page, framed like a shot from the home reel:
 * crop marks at the corners, a slate naming the page, a large title and the page's own picture
 * on the right (the tree for projects, the roots for research, …).
 *
 *   slate   { label, colors, count, unit } — the slate strip: page name, the colours of what the
 *           page lists (leaf / root / result), and how many there are
 *   kicker  plain label instead of a slate (pages with nothing to count)
 *   size    "hero" gives the aside room for a picture; default is compact
 *
 * Styles: .ui-page-header in src/styles/components.css.
 */
const PageHeader = ({
  slate,
  kicker,
  title,
  lead,
  actions,
  aside,
  size,
  className,
}) => (
  <header
    className={cx(
      "ui-page-header",
      size === "hero" && "ui-page-header--hero",
      aside && "has-aside",
      className,
    )}
  >
    <span className="ui-marks" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
    <div className="ui-page-header-main">
      {slate ? (
        <p className="ui-slate">
          <b>{slate.label}</b>
          {slate.colors?.length ? (
            <span className="ui-slate-bars" aria-hidden="true">
              {slate.colors.slice(0, 12).map((c, i) => (
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
      <h1>{title}</h1>
      {lead && <p className="ui-page-header-lead">{lead}</p>}
      {actions && <div className="ui-page-header-actions">{actions}</div>}
    </div>
    {aside && <div className="ui-page-header-aside">{aside}</div>}
  </header>
);

export default PageHeader;
