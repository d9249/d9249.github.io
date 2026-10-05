import * as React from "react";
import cx from "./cx";

/**
 * Small mono uppercase label — meta line, counter, kicker.
 *   kicker  the label above a heading (.eyebrow: ink, bold, spaced from the heading)
 *   strong  ink + bold without the spacing
 * Styles: .ui-label / .eyebrow in src/styles/components.css.
 */
const Label = ({
  as: Tag = "p",
  kicker = false,
  strong = false,
  className,
  ...rest
}) => (
  <Tag
    className={cx(
      kicker ? "eyebrow" : "ui-label",
      strong && !kicker && "ui-label--strong",
      className,
    )}
    {...rest}
  />
);

export default Label;
