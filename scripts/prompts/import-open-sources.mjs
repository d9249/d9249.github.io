#!/usr/bin/env node
// Rebuilds content/prompts/open-sources.json from redistributable upstream
// sources. Run with: node scripts/prompts/import-open-sources.mjs
//
// Only the picks listed in ./curation.mjs are imported. Contributor fields that
// look like e-mail addresses are never published.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACP_PICKS, DAIR_PICKS } from "./curation.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.resolve(here, "../../content/prompts/open-sources.json");
const ADDED_AT = process.env.PROMPTS_ADDED_AT || "2026-10-05";

const ACP = {
  csvUrl:
    "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv",
  repoUrl: "https://github.com/f/awesome-chatgpt-prompts",
  name: "awesome-chatgpt-prompts (prompts.chat)",
  license: "CC0-1.0",
  licenseUrl:
    "https://github.com/f/awesome-chatgpt-prompts/blob/main/LICENSE-CC0",
};

const DAIR = {
  rawBase:
    "https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/pages/prompts/",
  siteBase: "https://www.promptingguide.ai/prompts/",
  repoUrl: "https://github.com/dair-ai/Prompt-Engineering-Guide",
  name: "Prompt Engineering Guide (DAIR.AI)",
  author: "DAIR.AI",
  license: "MIT",
  licenseUrl:
    "https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/LICENSE.md",
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body
    .filter((cells) => cells.length === header.length)
    .map((cells) =>
      Object.fromEntries(header.map((key, index) => [key, cells[index]])),
    );
};

const slugify = (value) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const contributorsFrom = (value) =>
  (value || "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name && !name.includes("@") && /^[\w.-]+$/.test(name))
    .map((name) => ({ name, url: `https://github.com/${name}` }));

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.text();
};

const extractDairPrompt = (mdx) => {
  const pick = (heading) => {
    const start = mdx.indexOf(`\n## ${heading}\n`);
    if (start < 0) return null;
    const rest = mdx.slice(start + heading.length + 5);
    const nextHeading = rest.search(/\n## /);
    const section = nextHeading >= 0 ? rest.slice(0, nextHeading) : rest;
    const match = section.match(/```[^\n]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const prompt = pick("Prompt Template") || pick("Prompt");
  if (!prompt) return null;

  // Normalise `{input}` style slots to the `${name}` syntax used site-wide.
  return prompt.replace(/(?<!\$)\{([a-zA-Z_][\w ]{0,30})\}/g, "${$1}");
};

const flagsToFields = (flags) => ({
  pick: flags.includes("p"),
  needsUpload: flags.includes("u"),
});

const main = async () => {
  const items = [];
  const csv = parseCsv(await fetchText(ACP.csvUrl));
  const byAct = new Map();
  csv.forEach((row) => {
    const key = row.act.trim();
    if (!byAct.has(key)) byAct.set(key, row);
  });

  for (const [act, title, summary, category, target, flags] of ACP_PICKS) {
    const row = byAct.get(act);
    if (!row) {
      console.warn(`missing in prompts.csv: ${act}`);
      continue;
    }

    const prompt = row.prompt.trim();
    items.push({
      id: `acp-${slugify(act)}`,
      title,
      titleEn: act,
      summary,
      category,
      target,
      ...flagsToFields(flags),
      lang: "en",
      prompt,
      addedAt: ADDED_AT,
      source: {
        name: ACP.name,
        url: ACP.repoUrl,
        authors: contributorsFrom(row.contributor),
        license: ACP.license,
        licenseUrl: ACP.licenseUrl,
      },
    });
  }

  for (const [pagePath, title, summary, category, flags] of DAIR_PICKS) {
    const mdx = await fetchText(`${DAIR.rawBase}${pagePath}.en.mdx`);
    const prompt = extractDairPrompt(mdx);
    if (!prompt) {
      console.warn(`no prompt block: ${pagePath}`);
      continue;
    }

    const heading = (mdx.match(/^# (.+)$/m) || [])[1] || pagePath;
    items.push({
      id: `dair-${slugify(pagePath)}`,
      title,
      titleEn: heading.trim(),
      summary,
      category,
      target: "chat",
      ...flagsToFields(flags),
      lang: "en",
      prompt,
      addedAt: ADDED_AT,
      source: {
        name: DAIR.name,
        url: `${DAIR.siteBase}${pagePath}`,
        authors: [{ name: DAIR.author, url: "https://github.com/dair-ai" }],
        license: DAIR.license,
        licenseUrl: DAIR.licenseUrl,
      },
    });
  }

  const ids = new Set();
  items.forEach((item) => {
    if (ids.has(item.id)) throw new Error(`duplicate id ${item.id}`);
    ids.add(item.id);
  });

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, `${JSON.stringify(items, null, 2)}\n`);
  console.log(
    `wrote ${items.length} prompts → ${path.relative(process.cwd(), outFile)}`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
