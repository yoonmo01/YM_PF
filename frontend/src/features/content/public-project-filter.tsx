"use client";

import { type ReactNode, useState } from "react";

type Item = { slug: string; skills: string[]; card: ReactNode };

export function ProjectFilter({ items }: { items: Item[] }) {
  const [skill, setSkill] = useState("");
  const skills = [...new Set(items.flatMap((item) => item.skills))].sort();
  const visible = items.filter((item) => !skill || item.skills.includes(skill));

  return <>
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <label className="text-sm font-semibold">사용 기술<select className="mt-2 block min-h-11 rounded-lg border border-line bg-surface px-3" onChange={(event) => setSkill(event.target.value)} value={skill}><option value="">전체 기술</option>{skills.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
      <p className="py-3 text-sm text-muted" role="status">{visible.length}개 프로젝트</p>
    </div>
    {visible.length ? <div className="grid gap-5 md:grid-cols-2">{visible.map(({ slug, card }) => <div key={slug}>{card}</div>)}</div> : <p className="rounded-xl border border-line bg-surface p-6 text-sm text-muted">선택한 기술의 프로젝트가 없습니다.</p>}
  </>;
}
