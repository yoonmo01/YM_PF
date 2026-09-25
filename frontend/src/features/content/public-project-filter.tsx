"use client";

import { type ReactNode, useState } from "react";

type Item = { slug: string; skills: string[]; card: ReactNode };

export function ProjectFilter({ items }: { items: Item[] }) {
  const [skill, setSkill] = useState("");
  const skills = [...new Set(items.flatMap((item) => item.skills))].sort();
  const visible = items.filter((item) => !skill || item.skills.includes(skill));

  return <>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <label className="text-sm font-semibold">사용 기술<select className="mt-2 block min-h-11 min-w-44 rounded-md border border-line bg-surface px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onChange={(event) => setSkill(event.target.value)} value={skill}><option value="">전체 기술</option>{skills.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      <p className="py-3 text-sm text-muted" role="status" aria-live="polite">{visible.length}개 프로젝트</p>
    </div>
    {visible.length ? <div className="divide-y divide-line border-y border-line">{visible.map(({ slug, card }) => <div key={slug}>{card}</div>)}</div> : <p className="border-y border-line py-7 text-sm text-muted">선택한 기술의 프로젝트가 없습니다.</p>}
  </>;
}
