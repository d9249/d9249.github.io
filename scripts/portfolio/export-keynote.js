#!/usr/bin/env node

const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_KEYNOTE_PATH = path.join(
  os.homedir(),
  "Library",
  "Mobile Documents",
  "com~apple~Keynote",
  "Documents",
  "Portfolio-이상민.key",
);

const keynotePath = path.resolve(
  process.env.PORTFOLIO_KEYNOTE_PATH || DEFAULT_KEYNOTE_PATH,
);
const staticPortfolioDir = path.join(REPO_ROOT, "static", "portfolio");
const slidesDir = path.join(staticPortfolioDir, "slides");
const manifestPath = path.join(
  REPO_ROOT,
  "src",
  "data",
  "portfolioSlides.json",
);
const quality = Number(process.env.PORTFOLIO_IMAGE_QUALITY || "0.92");

const escapeAppleScriptString = (value) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const run = (command, args, options = {}) =>
  childProcess.execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 128,
    ...options,
  });

const runAppleScript = (script) =>
  childProcess.spawnSync("osascript", [], {
    input: script,
    encoding: "utf8",
    stdio: ["pipe", "inherit", "inherit"],
  });

const ensureCleanDir = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

const slideNumberFromName = (fileName) => {
  const match = fileName.match(/\.(\d+)\.jpe?g$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const decodeXml = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const extractSlideTexts = (pptxPath) => {
  const list = run("unzip", ["-Z1", pptxPath]);
  const slideNames = list
    .split(/\r?\n/)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const aIndex = Number(a.match(/slide(\d+)\.xml$/)?.[1] || "0");
      const bIndex = Number(b.match(/slide(\d+)\.xml$/)?.[1] || "0");
      return aIndex - bIndex;
    });

  return slideNames.map((slideName) => {
    const xml = run("unzip", ["-p", pptxPath, slideName]);
    const textParts = [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((match) => decodeXml(match[1]).trim())
      .filter(Boolean);
    const text = textParts.join(" ").replace(/\s+/g, " ").trim();
    const title =
      textParts.find((part) => part.length > 2 && !/^\d+$/.test(part)) || "";

    return {
      title,
      text,
    };
  });
};

const getImageSize = (imagePath) => {
  const output = run("sips", [
    "-g",
    "pixelWidth",
    "-g",
    "pixelHeight",
    imagePath,
  ]);
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] || 0),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] || 0),
  };
};

const formatSlideName = (index) =>
  `slide-${String(index).padStart(3, "0")}.jpeg`;

if (!fs.existsSync(keynotePath)) {
  console.error(`Keynote file not found: ${keynotePath}`);
  process.exit(1);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-keynote-"));
const tmpImagesDir = path.join(tmpDir, "images");
const tmpPptxPath = path.join(tmpDir, "portfolio.pptx");
fs.mkdirSync(tmpImagesDir, { recursive: true });

const appleScript = `
set inputFile to POSIX file "${escapeAppleScriptString(keynotePath)}"
set outputFolder to POSIX file "${escapeAppleScriptString(tmpImagesDir)}"
set pptxFile to POSIX file "${escapeAppleScriptString(tmpPptxPath)}"
tell application id "com.apple.iWork.Keynote"
  set theDoc to open inputFile
  export theDoc to outputFolder as slide images with properties {image format:JPEG, compression factor:${quality}, skipped slides:true}
  export theDoc to pptxFile as Microsoft PowerPoint
  close theDoc saving no
end tell
`;

console.log(`Exporting Keynote: ${keynotePath}`);
const result = runAppleScript(appleScript);
if (result.status !== 0) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  process.exit(result.status || 1);
}

const exportedImages = fs
  .readdirSync(tmpImagesDir)
  .filter((fileName) => /\.jpe?g$/i.test(fileName))
  .sort((a, b) => slideNumberFromName(a) - slideNumberFromName(b));

if (exportedImages.length === 0) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.error("No slide images were exported.");
  process.exit(1);
}

ensureCleanDir(slidesDir);

const slideTexts = fs.existsSync(tmpPptxPath)
  ? extractSlideTexts(tmpPptxPath)
  : [];
const slides = exportedImages.map((fileName, index) => {
  const slideIndex = index + 1;
  const outputName = formatSlideName(slideIndex);
  const sourceImage = path.join(tmpImagesDir, fileName);
  const targetImage = path.join(slidesDir, outputName);
  fs.copyFileSync(sourceImage, targetImage);

  const textInfo = slideTexts[index] || {};
  const { width, height } = getImageSize(targetImage);

  return {
    index: slideIndex,
    src: `/portfolio/slides/${outputName}`,
    title: textInfo.title || `Slide ${slideIndex}`,
    alt: textInfo.title
      ? `Portfolio slide ${slideIndex}: ${textInfo.title}`
      : `Portfolio slide ${slideIndex}`,
    width,
    height,
    text: textInfo.text || "",
  };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  source: {
    keynoteFile: path.basename(keynotePath),
    slideCount: slides.length,
    imageFormat: "jpeg",
    imageQuality: quality,
  },
  slides,
};

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`Generated ${slides.length} slides`);
console.log(`Slides: ${path.relative(REPO_ROOT, slidesDir)}`);
console.log(`Manifest: ${path.relative(REPO_ROOT, manifestPath)}`);
