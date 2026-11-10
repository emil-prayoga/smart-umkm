import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function FormattedAIText({
  text,
  className = "",
}: {
  text?: string | null;
  className?: string;
}) {
  if (!text?.trim()) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h3 className="mb-2 mt-4 text-base font-bold text-neutral-100 first:mt-0">{children}</h3>,
          h2: ({ children }) => <h3 className="mb-2 mt-4 text-base font-bold text-neutral-100 first:mt-0">{children}</h3>,
          h3: ({ children }) => <h4 className="mb-2 mt-3 text-sm font-semibold text-neutral-100 first:mt-0">{children}</h4>,
          h4: ({ children }) => <h4 className="mb-2 mt-3 text-sm font-semibold text-neutral-100 first:mt-0">{children}</h4>,
          p: ({ children }) => <p className="mb-3 whitespace-pre-wrap last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="ps-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-neutral-100">{children}</strong>,
          blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-[#E9A923] pl-4 text-neutral-300">{children}</blockquote>,
          table: ({ children }) => (
            <div className="my-4 max-w-full overflow-x-auto rounded-lg border border-neutral-700">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-neutral-800 text-neutral-100">{children}</thead>,
          th: ({ children }) => <th className="border-b border-neutral-700 px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-neutral-800 px-3 py-2 align-top">{children}</td>,
          code: ({ children }) => <code className="rounded bg-neutral-800 px-1 py-0.5 font-mono text-[0.92em] text-emerald-200">{children}</code>,
          pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-lg bg-neutral-950 p-3 text-xs">{children}</pre>,
          hr: () => <hr className="my-4 border-neutral-700" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
