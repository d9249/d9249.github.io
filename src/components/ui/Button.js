import * as React from "react";
import { Link } from "gatsby";
import cx from "./cx";

/**
 * The one button. `to` renders a Gatsby <Link>, `href` an <a>, neither a <button>.
 *
 *   variant  "secondary" (default, outlined) · "primary" (ink fill, one per view) · "tonal" (quiet, accent tint)
 *   compact  square-ish, for icon or page-number buttons
 *   active   selected state (pagination, pressed toggles)
 *
 * Styles: .ui-button in src/styles/components.css.
 */
const Button = React.forwardRef(
  (
    {
      to,
      href,
      variant = "secondary",
      compact = false,
      active = false,
      className,
      type = "button",
      children,
      ...rest
    },
    ref,
  ) => {
    const classes = cx(
      "ui-button",
      variant !== "secondary" && `ui-button--${variant}`,
      compact && "ui-button--compact",
      active && "is-active",
      className,
    );

    if (to) {
      return (
        <Link ref={ref} className={classes} to={to} {...rest}>
          {children}
        </Link>
      );
    }

    if (href) {
      const external = /^https?:/.test(href);
      return (
        <a
          ref={ref}
          className={classes}
          href={href}
          rel={external ? "noreferrer" : undefined}
          {...rest}
        >
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={classes} type={type} {...rest}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
