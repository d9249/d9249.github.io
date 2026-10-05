import * as React from "react";
import { ArrowRight } from "lucide-react";
import { promptSegments } from "../../utils/prompts";

/*
 * The prompts page's header picture: a template written out on the reel's ruled movement sheet,
 * its slots left as blanks to fill. The blanks draw in once (the page's one moment of motion).
 * Pressing it opens that template in the list below.
 *
 * Styles: .prompt-sheet in src/styles/site.css.
 */

const MAX_LINES = 14;

const toLines = (prompt) => {
  const lines = [[]];
  promptSegments(prompt).forEach((segment) => {
    if (segment.type === "slot") {
      lines[lines.length - 1].push(segment);
      return;
    }
    segment.value.split("\n").forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: "text", value: part });
    });
  });
  return lines;
};

const PromptSheet = ({ item, onOpen }) => {
  if (!item) return null;
  const lines = toLines(item.prompt);
  const shown = lines.slice(0, MAX_LINES);
  let slot = 0;

  return (
    <figure className="prompt-sheet">
      <p className="ui-slate prompt-sheet-slate">
        <b>Template</b>
        <span>{item.title}</span>
        <span>
          <em>{item.variables.length}</em> blanks
        </span>
      </p>
      <div className="prompt-sheet-paper" aria-hidden="true">
        {shown.map((line, index) => (
          <p key={index}>
            {line.length
              ? line.map((segment, i) =>
                  segment.type === "slot" ? (
                    <span
                      key={i}
                      className="prompt-sheet-slot"
                      style={{ "--i": slot++ }}
                    >
                      {segment.name}
                    </span>
                  ) : (
                    <React.Fragment key={i}>{segment.value}</React.Fragment>
                  ),
                )
              : " "}
          </p>
        ))}
        {lines.length > MAX_LINES ? (
          <p className="prompt-sheet-more">…</p>
        ) : null}
      </div>
      <figcaption>
        <button type="button" onClick={() => onOpen(item.id)}>
          이 템플릿 펼치기
          <ArrowRight aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  );
};

export default PromptSheet;
