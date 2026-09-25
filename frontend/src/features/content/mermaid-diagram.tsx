"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ source }: { source: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const title = source.match(/accTitle:\s*([^\n]+)/)?.[1] ?? "프로젝트 흐름도";
  const [svg, setSvg] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    import("mermaid").then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
      return mermaid.render(`study-${id}`, source);
    }).then(({ svg: rendered }) => {
      if (active) setSvg(rendered);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [id, source]);

  return <figure role="img" aria-label={title} className="my-8 overflow-x-auto rounded-md border border-line bg-surface p-4">
    {svg ? <div className="min-w-[36rem] [&_svg]:h-auto [&_svg]:max-w-none" dangerouslySetInnerHTML={{ __html: svg }} /> :
      failed ? <pre className="overflow-x-auto whitespace-pre-wrap text-sm">{source}</pre> :
      <p className="text-sm text-muted">다이어그램을 불러오는 중…</p>}
  </figure>;
}
