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
const contentRoot = path.join(REPO_ROOT, "content", "portfolio");
const slidesRoot = path.join(contentRoot, "slides");
const deckPath = path.join(contentRoot, "deck.json");
const quality = Number(process.env.PORTFOLIO_IMAGE_QUALITY || "0.92");

const escapeAppleScriptString = (value) =>
  value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const runText = (command, args, options = {}) =>
  childProcess.execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 128,
    ...options,
  });

const runBuffer = (command, args, options = {}) =>
  childProcess.execFileSync(command, args, {
    encoding: null,
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 1024 * 1024 * 256,
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

const decodeXml = (value = "") =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const getAttr = (value, name) => {
  const match = value.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
  return match ? decodeXml(match[1]) : "";
};

const sanitizeText = (value = "") =>
  value
    .replace(/\u2028/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const slideNumberFromName = (fileName) => {
  const match = fileName.match(/\.(\d+)\.jpe?g$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const formatSlideSlug = (index) => `slide-${String(index).padStart(3, "0")}`;

const parseSlideSize = (pptxPath) => {
  const xml = runText("unzip", ["-p", pptxPath, "ppt/presentation.xml"]);
  const sizeTag = xml.match(/<p:sldSz\b[^>]*>/)?.[0] || "";
  return {
    widthEmu: Number(getAttr(sizeTag, "cx") || 12192000),
    heightEmu: Number(getAttr(sizeTag, "cy") || 6858000),
  };
};

const getImageSize = (imagePath) => {
  const output = runText("sips", [
    "-g",
    "pixelWidth",
    "-g",
    "pixelHeight",
    imagePath,
  ]);

  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1] || 1920),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1] || 1080),
  };
};

const emuRectToCanvasRect = (rect, canvas, slideSize) => ({
  x: Math.round((rect.x / slideSize.widthEmu) * canvas.width * 1000) / 1000,
  y: Math.round((rect.y / slideSize.heightEmu) * canvas.height * 1000) / 1000,
  width:
    Math.round((rect.width / slideSize.widthEmu) * canvas.width * 1000) / 1000,
  height:
    Math.round((rect.height / slideSize.heightEmu) * canvas.height * 1000) /
    1000,
});

const parseTransform = (xml) => {
  const xfrm = xml.match(/<a:xfrm\b[\s\S]*?<\/a:xfrm>/)?.[0] || "";
  const off = xfrm.match(/<a:off\b[^>]*>/)?.[0] || "";
  const ext = xfrm.match(/<a:ext\b[^>]*>/)?.[0] || "";
  const rot = Number(getAttr(xfrm.match(/<a:xfrm\b[^>]*>/)?.[0] || "", "rot"));

  return {
    x: Number(getAttr(off, "x") || 0),
    y: Number(getAttr(off, "y") || 0),
    width: Number(getAttr(ext, "cx") || 0),
    height: Number(getAttr(ext, "cy") || 0),
    rotation: Number.isFinite(rot)
      ? Math.round((rot / 60000) * 1000) / 1000
      : 0,
  };
};

const parseColor = (xml, fallback = "") => {
  const srgb = xml.match(/<a:srgbClr\b[^>]*val="([^"]+)"/)?.[1];
  if (srgb) {
    return `#${srgb}`;
  }

  const scheme = xml.match(/<a:schemeClr\b[^>]*val="([^"]+)"/)?.[1];
  if (!scheme) {
    return fallback;
  }

  const colors = {
    accent1: "#4F81BD",
    accent2: "#C0504D",
    accent3: "#9BBB59",
    accent4: "#8064A2",
    accent5: "#4BACC6",
    accent6: "#F79646",
    bg1: "#FFFFFF",
    bg2: "#000000",
    dk1: "#000000",
    dk2: "#1F1F1F",
    lt1: "#FFFFFF",
    lt2: "#F2F2F2",
    tx1: "#000000",
    tx2: "#FFFFFF",
  };

  return colors[scheme] || fallback;
};

const parseFill = (xml) => {
  if (/<a:noFill\b/.test(xml)) {
    return "transparent";
  }

  const solidFill = xml.match(/<a:solidFill\b[\s\S]*?<\/a:solidFill>/)?.[0];
  return solidFill ? parseColor(solidFill, "transparent") : "transparent";
};

const parseStroke = (xml) => {
  const ln = xml.match(/<a:ln\b[\s\S]*?<\/a:ln>/)?.[0];
  return ln ? parseColor(ln, "transparent") : "transparent";
};

const parseOpacity = (xml) => {
  const alpha = Number(xml.match(/<a:alpha\b[^>]*val="([^"]+)"/)?.[1]);
  return Number.isFinite(alpha)
    ? Math.round((alpha / 100000) * 1000) / 1000
    : 1;
};

const parseText = (xml) => {
  const paragraphs = [...xml.matchAll(/<a:p\b[\s\S]*?<\/a:p>/g)]
    .map((paragraph) =>
      [...paragraph[0].matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
        .map((match) => decodeXml(match[1]))
        .join(""),
    )
    .map(sanitizeText)
    .filter(Boolean);

  return paragraphs.join("\n");
};

const parseTextStyle = (shapeXml) => {
  const txBody = shapeXml.match(/<p:txBody\b[\s\S]*?<\/p:txBody>/)?.[0] || "";
  const spPr = shapeXml.match(/<p:spPr\b[\s\S]*?<\/p:spPr>/)?.[0] || "";
  const size = Number(txBody.match(/\bsz="(\d+)"/)?.[1]);
  const align = txBody.match(/\balgn="([^"]+)"/)?.[1] || "l";
  const fontFace = txBody.match(/\btypeface="([^"]+)"/)?.[1] || "";

  const alignMap = {
    ctr: "center",
    r: "right",
    just: "justify",
    l: "left",
  };

  return {
    fontFamily: fontFace || "-apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: Number.isFinite(size) ? Math.round((size / 100) * 1.333) : 24,
    fontWeight: /\bb="1"/.test(txBody) ? 700 : 400,
    fontStyle: /\bi="1"/.test(txBody) ? "italic" : "normal",
    color: parseColor(txBody, "#111111"),
    textAlign: alignMap[align] || "left",
    lineHeight: 1.18,
    backgroundColor: parseFill(spPr),
  };
};

const parseRelationships = (pptxPath, slideName) => {
  const relName = slideName.replace(
    /^ppt\/slides\/(slide\d+\.xml)$/,
    "ppt/slides/_rels/$1.rels",
  );

  let xml = "";
  try {
    xml = runText("unzip", ["-p", pptxPath, relName]);
  } catch (error) {
    return new Map();
  }

  const relationships = new Map();
  for (const match of xml.matchAll(/<Relationship\b([^>]+?)\/>/g)) {
    const attrs = match[1];
    const id = getAttr(attrs, "Id");
    const target = getAttr(attrs, "Target");
    if (!id || !target) {
      continue;
    }

    relationships.set(
      id,
      path.posix.normalize(
        path.posix.join(path.posix.dirname(slideName), target),
      ),
    );
  }

  return relationships;
};

const listPptxSlides = (pptxPath) =>
  runText("unzip", ["-Z1", pptxPath])
    .split(/\r?\n/)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const aIndex = Number(a.match(/slide(\d+)\.xml$/)?.[1] || "0");
      const bIndex = Number(b.match(/slide(\d+)\.xml$/)?.[1] || "0");
      return aIndex - bIndex;
    });

const copyPptxAsset = (pptxPath, mediaPath, destination) => {
  const content = runBuffer("unzip", ["-p", pptxPath, mediaPath]);
  fs.writeFileSync(destination, content);
};

const writeWebAsset = (pptxPath, mediaPath, slideDir, assetBaseName) => {
  const ext = (path.posix.extname(mediaPath) || ".png").toLowerCase();

  if (ext === ".tif" || ext === ".tiff") {
    const tmpSource = path.join(os.tmpdir(), `${assetBaseName}${ext}`);
    const assetFile = `assets/${assetBaseName}.png`;
    const destination = path.join(slideDir, assetFile);
    copyPptxAsset(pptxPath, mediaPath, tmpSource);
    runText("sips", ["-s", "format", "png", tmpSource, "--out", destination]);
    fs.rmSync(tmpSource, { force: true });
    return assetFile;
  }

  const assetFile = `assets/${assetBaseName}${ext}`;
  copyPptxAsset(pptxPath, mediaPath, path.join(slideDir, assetFile));
  return assetFile;
};

const parseSlideObjects = (
  pptxPath,
  slideName,
  canvas,
  slideSize,
  slideDir,
) => {
  const xml = runText("unzip", ["-p", pptxPath, slideName]);
  const relationships = parseRelationships(pptxPath, slideName);
  const objects = [];
  const copiedAssets = new Map();
  let assetIndex = 0;

  const convertRect = (fragment) => {
    const transform = parseTransform(fragment);
    return {
      ...emuRectToCanvasRect(transform, canvas, slideSize),
      rotation: transform.rotation,
    };
  };

  for (const match of xml.matchAll(/<p:sp\b[\s\S]*?<\/p:sp>/g)) {
    const shapeXml = match[0];
    const rect = convertRect(shapeXml);
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }

    const text = parseText(shapeXml);
    const spPr = shapeXml.match(/<p:spPr\b[\s\S]*?<\/p:spPr>/)?.[0] || "";
    const fill = parseFill(spPr);
    const stroke = parseStroke(spPr);
    const shapeKind =
      spPr.match(/<a:prstGeom\b[^>]*prst="([^"]+)"/)?.[1] || "rect";

    if (text) {
      objects.push({
        type: "text",
        id: `text-${String(objects.length + 1).padStart(3, "0")}`,
        text,
        style: {
          ...rect,
          ...parseTextStyle(shapeXml),
        },
      });
      continue;
    }

    if (fill !== "transparent" || stroke !== "transparent") {
      objects.push({
        type: "shape",
        id: `shape-${String(objects.length + 1).padStart(3, "0")}`,
        shape: shapeKind,
        style: {
          ...rect,
          fill,
          stroke,
          opacity: parseOpacity(spPr),
        },
      });
    }
  }

  for (const match of xml.matchAll(/<p:pic\b[\s\S]*?<\/p:pic>/g)) {
    const picXml = match[0];
    const rect = convertRect(picXml);
    const relId = picXml.match(/r:embed="([^"]+)"/)?.[1];
    const mediaPath = relId ? relationships.get(relId) : "";
    if (!mediaPath || rect.width <= 0 || rect.height <= 0) {
      continue;
    }

    let assetFile = copiedAssets.get(mediaPath);
    if (!assetFile) {
      assetIndex += 1;
      fs.mkdirSync(path.join(slideDir, "assets"), { recursive: true });
      assetFile = writeWebAsset(
        pptxPath,
        mediaPath,
        slideDir,
        `image-${String(assetIndex).padStart(3, "0")}`,
      );
      copiedAssets.set(mediaPath, assetFile);
    }

    objects.push({
      type: "image",
      id: `image-${String(objects.length + 1).padStart(3, "0")}`,
      src: assetFile,
      style: rect,
    });
  }

  return {
    background: parseFill(xml.match(/<p:bg\b[\s\S]*?<\/p:bg>/)?.[0] || ""),
    objects,
  };
};

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

const exportedPreviews = fs
  .readdirSync(tmpImagesDir)
  .filter((fileName) => /\.jpe?g$/i.test(fileName))
  .sort((a, b) => slideNumberFromName(a) - slideNumberFromName(b));
const pptxSlides = listPptxSlides(tmpPptxPath);

if (exportedPreviews.length === 0 || pptxSlides.length === 0) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.error("No portfolio slides were exported.");
  process.exit(1);
}

fs.mkdirSync(contentRoot, { recursive: true });
ensureCleanDir(slidesRoot);

const slideSize = parseSlideSize(tmpPptxPath);
const slideEntries = exportedPreviews.map((previewName, index) => {
  const slideIndex = index + 1;
  const slug = formatSlideSlug(slideIndex);
  const slideDir = path.join(slidesRoot, slug);
  const previewSource = path.join(tmpImagesDir, previewName);
  const previewTarget = path.join(slideDir, "preview.jpeg");
  fs.mkdirSync(slideDir, { recursive: true });
  fs.copyFileSync(previewSource, previewTarget);

  const canvas = getImageSize(previewTarget);
  const parsed = parseSlideObjects(
    tmpPptxPath,
    pptxSlides[index],
    canvas,
    slideSize,
    slideDir,
  );

  const titleObject = parsed.objects.find(
    (object) => object.type === "text" && object.text.trim().length > 2,
  );
  const slideData = {
    index: slideIndex,
    slug,
    title: titleObject
      ? titleObject.text.split(/\n/)[0]
      : `Slide ${slideIndex}`,
    canvas: {
      width: canvas.width,
      height: canvas.height,
      background:
        parsed.background && parsed.background !== "transparent"
          ? parsed.background
          : "#ffffff",
    },
    preview: "preview.jpeg",
    objects: parsed.objects,
    rawText: parsed.objects
      .filter((object) => object.type === "text")
      .map((object) => object.text)
      .join("\n\n"),
  };

  fs.writeFileSync(
    path.join(slideDir, "slide.json"),
    `${JSON.stringify(slideData, null, 2)}\n`,
  );

  return {
    index: slideIndex,
    slug,
    title: slideData.title,
    path: `slides/${slug}/slide.json`,
  };
});

const deck = {
  generatedAt: new Date().toISOString(),
  source: {
    keynoteFile: path.basename(keynotePath),
    slideCount: slideEntries.length,
    imageFormat: "jpeg",
    imageQuality: quality,
  },
  canvas: {
    width: slideSize.widthEmu,
    height: slideSize.heightEmu,
    unit: "emu",
  },
  slides: slideEntries,
};

fs.writeFileSync(deckPath, `${JSON.stringify(deck, null, 2)}\n`);
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`Generated ${slideEntries.length} slide content bundles`);
console.log(`Deck: ${path.relative(REPO_ROOT, deckPath)}`);
console.log(`Slides: ${path.relative(REPO_ROOT, slidesRoot)}`);
