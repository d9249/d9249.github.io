import * as React from "react";
import cx from "./cx";

/**
 * Metadata chip (a tag, a stack item, a venue) — never a mini card.
 * `color` (a CSS colour or var(--c-*)) shows a swatch; with `solid` it fills the chip.
 * Styles: .ui-chip in src/styles/components.css.
 */
const Chip = ({
  as: Tag = "span",
  color,
  solid = false,
  className,
  style,
  ...rest
}) => (
  <Tag
    className={cx("ui-chip", solid && "ui-chip--solid", className)}
    style={color ? { ...style, "--c": color } : style}
    {...rest}
  />
);

export default Chip;
