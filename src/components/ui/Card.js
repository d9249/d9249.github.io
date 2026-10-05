import * as React from "react";
import cx from "./cx";

/**
 * Flat paper sheet with a hairline border. `interactive` lifts on hover (use when the whole card is
 * a link); `color` puts the research / project / result colour on its top edge.
 * Styles: .ui-card in src/styles/components.css.
 */
const Card = ({
  as: Tag = "div",
  interactive = false,
  color,
  className,
  style,
  ...rest
}) => (
  <Tag
    className={cx("ui-card", interactive && "ui-card--interactive", className)}
    style={color ? { ...style, "--c": color } : style}
    {...rest}
  />
);

export default Card;
