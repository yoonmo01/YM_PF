import { Children, isValidElement, type ReactElement } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MermaidDiagram } from "./mermaid-diagram";

const imageSizes: Record<string, [number, number]> = {
  "/projects/VP2/fig1-architecture.png": [1776, 944],
  "/projects/VP2/fig2-ppse.png": [888, 416],
  "/projects/VP2/fig3-hmm-vulnerability.png": [888, 424],
  "/projects/VP2/fig4-websearch-ppse.png": [888, 496],
  "/projects/VP/fig1-architecture.png": [1256, 452],
  "/projects/VP/fig2-mcp-dialogue.png": [403, 798],
  "/projects/VP/fig4-accuracy.png": [1014, 640],
  "/projects/VP/fig6-age-scenario.png": [576, 424],
  "/projects/POLYSTEP/fig1-architecture.png": [1613, 908],
  "/projects/POLYSTEP/fig2-core-features.png": [1613, 908],
  "/projects/POLYSTEP/fig3-home.png": [2446, 1226],
  "/projects/POLYSTEP/fig4-graph.png": [1790, 973],
  "/projects/AUDIT/audit-viewer.png": [1285, 420],
  "/projects/AUDIT/audit-home.png": [1365, 900],
  "/projects/AUDIT/audit-map.png": [1365, 1992],
  "/projects/AUDIT/audit-chart.png": [1365, 900],
  "/projects/AUTH/system-flow.svg": [720, 500],
};
const openingImages = new Set([
  "/projects/VP2/fig1-architecture.png",
  "/projects/VP/fig1-architecture.png",
  "/projects/POLYSTEP/fig3-home.png",
  "/projects/AUDIT/audit-home.png",
  "/projects/AUTH/system-flow.svg",
]);

export function ProjectStudyMarkdown({ content }: { content: string }) {
  return <div className="mt-12 min-w-0">
    <Markdown remarkPlugins={[remarkGfm]} components={{
      h2: ({ children }) => <h2 className="mb-4 mt-12 text-2xl font-semibold tracking-[-0.02em]">{children}</h2>,
      h3: ({ children }) => <h3 className="mb-3 mt-8 text-xl font-semibold">{children}</h3>,
      p: ({ children }) => <p className="my-4 text-base leading-8 text-muted">{children}</p>,
      ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 leading-8 text-muted">{children}</ul>,
      ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 leading-8 text-muted">{children}</ol>,
      blockquote: ({ children }) => <blockquote className="my-6 border-l-2 border-accent pl-5 text-ink">{children}</blockquote>,
      table: ({ children }) => <div className="my-6 overflow-x-auto" tabIndex={0}><table className="w-full min-w-[32rem] border-collapse text-left text-sm leading-6">{children}</table></div>,
      th: ({ children }) => <th className="border-b border-line bg-surface px-3 py-2 font-semibold">{children}</th>,
      td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top text-muted">{children}</td>,
      pre: ({ children }) => {
        const code = Children.only(children) as ReactElement<{ className?: string; children?: string }>;
        if (isValidElement(code) && code.props.className === "language-mermaid") {
          return <MermaidDiagram source={String(code.props.children)} />;
        }
        return <pre className="my-6 overflow-x-auto rounded-md border border-line bg-surface p-4 text-sm leading-6" tabIndex={0}>{children}</pre>;
      },
      img: ({ src, alt }) => {
        const size = typeof src === "string" ? imageSizes[src] : undefined;
        return size && typeof src === "string" ? <Image src={src} alt={alt ?? ""} width={size[0]} height={size[1]} loading={openingImages.has(src) ? "eager" : "lazy"} className="my-7 h-auto w-full max-w-full rounded-md border border-line bg-white object-contain" /> : null;
      },
      a: ({ href, children }) => <a href={href} className="text-accent-strong underline underline-offset-4" rel={href?.startsWith("http") ? "noreferrer" : undefined} target={href?.startsWith("http") ? "_blank" : undefined}>{children}</a>,
    }}>{content}</Markdown>
  </div>;
}
