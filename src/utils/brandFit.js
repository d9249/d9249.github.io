/*
 * Fitting a name set in the brand face (Archivo 800, width 112%) to its column, without measuring
 * in the browser: the advance widths below are Archivo's own (fontTools, wght 800 · wdth 112),
 * in em, for printable ASCII. Hangul falls back to IBM Plex Sans KR (about 1em a syllable).
 *
 *   nameFit(name) → the width, in em, of the widest line when the name is set on at most two
 *   lines broken at spaces (the best split), including the leaf dot in front. CSS divides the
 *   column by it: font-size = 100cqi / fit (see .project-hero-name in site.css).
 */

const ASCII =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const WIDTHS = [
  0.244, 0.335, 0.496, 0.689, 0.642, 1.055, 0.905, 0.271, 0.373, 0.373, 0.419,
  0.691, 0.333, 0.373, 0.333, 0.305, 0.702, 0.663, 0.701, 0.704, 0.7, 0.704,
  0.705, 0.674, 0.711, 0.705, 0.339, 0.342, 0.691, 0.691, 0.691, 0.661, 1.124,
  0.836, 0.826, 0.843, 0.841, 0.778, 0.716, 0.91, 0.884, 0.35, 0.68, 0.857,
  0.686, 1.026, 0.883, 0.907, 0.776, 0.907, 0.838, 0.779, 0.758, 0.872, 0.813,
  1.091, 0.834, 0.821, 0.766, 0.363, 0.305, 0.363, 0.691, 0.592, 0.287, 0.693,
  0.696, 0.688, 0.696, 0.696, 0.414, 0.696, 0.69, 0.301, 0.299, 0.669, 0.301,
  1.047, 0.69, 0.705, 0.696, 0.696, 0.442, 0.642, 0.441, 0.689, 0.637, 0.964,
  0.685, 0.637, 0.595, 0.378, 0.279, 0.378, 0.691,
];
const WIDTH = new Map([...ASCII].map((ch, i) => [ch, WIDTHS[i]]));
const TRACKING = -0.015; // letter-spacing on .project-hero-name
const DOT = 0.48; // the leaf dot (0.26em) and its gap (0.22em)

const charWidth = (ch) =>
  WIDTH.get(ch) ??
  (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(ch) ? 1 : 0.7);

export const brandWidth = (text) =>
  [...text].reduce((sum, ch) => sum + charWidth(ch) + TRACKING, 0);

export const nameFit = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  const line = (part) => brandWidth(part.join(" "));
  let best = line(words) + DOT; // one line
  for (let k = 1; k < words.length; k += 1)
    best = Math.min(
      best,
      Math.max(line(words.slice(0, k)) + DOT, line(words.slice(k))),
    );
  return Math.round(best * 1.03 * 1000) / 1000; // slack for kerning and rounding
};
