/** Join class names, skipping falsy parts. */
const cx = (...parts) => parts.filter(Boolean).join(" ");

export default cx;
