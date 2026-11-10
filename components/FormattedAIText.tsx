type TextBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

function cleanInlineMarkdown(value: string): string {
  return value
    .replace(/\u00e2\u20ac\u2013|\u00e2\u20ac\u2014|\u00e2\u20ac\u2026|\u00e2\u20ac\u2022/g, (symbol) => ({
      "\u00e2\u20ac\u2013": "\u2013",
      "\u00e2\u20ac\u2014": "\u2014",
      "\u00e2\u20ac\u2026": "\u2026",
      "\u00e2\u20ac\u2022": "\u2022",
    } as Record<string, string>)[symbol] ?? symbol)
    .replace(/\uFFFD/g, " ")
    .replace(/\[(.*?)\]\((?:[^)]*)\)/g, "$1")
    .replace(/(\d)\s*\*\s*(\d)/g, "$1 \u00d7 $2")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*/g, "")
    .trim();
}

function formatText(value: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraphLines.join(" ").trim();
    if (text) blocks.push({ kind: "paragraph", text });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length) blocks.push({ kind: "list", items: listItems });
    listItems = [];
  };

  for (const rawLine of value.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line || /^[-*_]{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }

    const listMatch = line.match(/^(?:[-*\u2022\u2013]|\d+[.)])\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      const item = cleanInlineMarkdown(listMatch[1]);
      if (item) listItems.push(item);
      continue;
    }

    flushList();
    paragraphLines.push(cleanInlineMarkdown(line.replace(/^#{1,6}\s+/, "")));
  }

  flushParagraph();
  flushList();
  return blocks;
}

export default function FormattedAIText({
  text,
  className = "",
}: {
  text?: string | null;
  className?: string;
}) {
  const blocks = formatText(text ?? "");

  if (!blocks.length) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => block.kind === "paragraph" ? (
        <p className={index > 0 ? "mt-2" : undefined} key={`p-${index}`}>
          {block.text}
        </p>
      ) : (
        <ul className="my-2 list-disc space-y-1 pl-5" key={`list-${index}`}>
          {block.items.map((item, itemIndex) => <li key={`${index}-${itemIndex}`}>{item}</li>)}
        </ul>
      ))}
    </div>
  );
}
