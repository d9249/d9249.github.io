#!/usr/bin/env node
// GitHub Actions entry point: reads the labeled issue from GITHUB_EVENT_PATH
// (never from interpolated shell strings) and adds it to community.json.

const fs = require("node:fs");
const path = require("node:path");
const { parsePromptIssue } = require("./issue-form.cjs");

const communityFile = path.resolve(
  __dirname,
  "../../content/prompts/community.json",
);

const writeOutput = (key, value) => {
  if (!process.env.GITHUB_OUTPUT) return;
  const delimiter = `EOF_${Date.now()}`;
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `${key}<<${delimiter}\n${value}\n${delimiter}\n`,
  );
};

const main = () => {
  const event = JSON.parse(
    fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"),
  );
  const issue = event.issue;
  const { errors, entry } = parsePromptIssue({
    body: issue.body,
    number: issue.number,
    login: issue.user && issue.user.login,
  });

  if (errors.length) {
    const message = errors.map((error) => `- ${error}`).join("\n");
    writeOutput("errors", message);
    console.error(message);
    process.exit(1);
  }

  const list = JSON.parse(fs.readFileSync(communityFile, "utf8"));
  const next = [entry, ...list.filter((item) => item.id !== entry.id)];
  fs.writeFileSync(communityFile, `${JSON.stringify(next, null, 2)}\n`);
  writeOutput("id", entry.id);
  console.log(`added ${entry.id}: ${entry.title}`);
};

main();
