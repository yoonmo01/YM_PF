import Link from "next/link";

import type { PortfolioProject } from "@/content/public-portfolio";

export function StaticProjectCard({ project }: { project: PortfolioProject }) {
  return <article className="grid gap-5 py-7 md:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] md:items-start md:gap-10">
    <div>
      <h2 className="text-xl font-semibold leading-snug tracking-[-0.025em] sm:text-2xl"><Link className="rounded-sm decoration-accent decoration-2 underline-offset-4 hover:underline" href={`/projects/${project.slug}`}>{project.title}</Link></h2>
      <p className="mt-3 max-w-[48rem] text-sm leading-7 text-muted sm:text-base">{project.summary}</p>
      {project.role && <p className="mt-4 text-sm font-semibold">{project.role}</p>}
    </div>
    <ul className="flex flex-wrap gap-x-2 gap-y-2 md:pt-1">{project.skills.map((skill) => <li className="border-b border-line px-1 pb-1 text-xs font-medium text-accent-strong sm:text-sm" key={skill}>{skill}</li>)}</ul>
  </article>;
}
