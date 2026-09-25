import Link from "next/link";

import type { PortfolioProject } from "@/content/public-portfolio";

export function StaticProjectCard({ project }: { project: PortfolioProject }) {
  return <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
    <div className="mb-5 flex aspect-[16/7] items-center justify-center rounded-xl bg-canvas text-sm text-muted" role="img" aria-label={`${project.title} 대표 이미지 준비 중`}>대표 이미지 준비 중</div>
    <ul className="flex flex-wrap gap-2">{project.skills.map((skill) => <li className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong" key={skill}>{skill}</li>)}</ul>
    <h2 className="mt-5 text-2xl font-semibold"><Link className="hover:text-accent-strong" href={`/projects/${project.slug}`}>{project.title}</Link></h2>
    <p className="mt-3 text-sm leading-7 text-muted">{project.summary}</p>
    {project.role && <p className="mt-4 text-sm font-semibold">{project.role}</p>}
  </article>;
}
