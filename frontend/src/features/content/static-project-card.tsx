import Image from "next/image";
import Link from "next/link";

import type { PortfolioProject } from "@/content/public-portfolio";

export function StaticProjectCard({ project, spotlight = false, headingLevel = 2 }: { project: PortfolioProject; spotlight?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <article className={`grid min-w-0 overflow-hidden rounded-2xl border ${spotlight ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink"} lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.88fr)]`}>
    <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${spotlight ? "text-[#9ad9d0]" : "text-accent-strong"}`}>{spotlight ? "Featured project" : "Project"}</p>
        <Heading className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.035em] sm:text-3xl"><Link className="rounded-sm underline-offset-4 hover:underline" href={`/projects/${project.slug}`}>{project.title}</Link></Heading>
        <p className={`mt-4 text-sm leading-7 sm:text-base ${spotlight ? "text-[#d9e8e5]" : "text-muted"}`}>{project.summary}</p>
        {project.role && <p className={`mt-5 text-sm font-medium leading-6 ${spotlight ? "text-[#c3dcd8]" : "text-ink"}`}>{project.role}</p>}
      </div>
      <ul className="mt-7 flex flex-wrap gap-2">{project.skills.slice(0, 4).map((skill) => <li className={`rounded-full px-3 py-1 text-xs font-medium ${spotlight ? "bg-white/10 text-white" : "bg-[#e3f1ed] text-accent-strong"}`} key={skill}>{skill}</li>)}</ul>
    </div>
    <ProjectPreview project={project} eager={spotlight} />
  </article>;
}

function ProjectPreview({ project, eager }: { project: PortfolioProject; eager: boolean }) {
  const preview = project.preview;
  if (preview.kind === "image") return <div className="relative min-h-52 bg-white p-4 sm:min-h-64 sm:p-6"><Image src={preview.src} alt={preview.alt} fill sizes="(max-width: 1024px) 100vw, 45vw" loading={eager ? "eager" : "lazy"} className="object-contain p-4 sm:p-6" /></div>;
  if (preview.kind === "flow") return <figure className="flex min-h-52 flex-col justify-center bg-[#e3f1ed] p-6 text-ink sm:p-8"><figcaption className="text-sm font-semibold text-accent-strong">{preview.caption}</figcaption><ol className="mt-5 grid gap-3">{preview.steps.map((step, index) => <li className="flex items-center gap-4 rounded-lg border border-[#c8ded8] bg-white px-4 py-3 text-sm font-semibold" key={step}><span className="text-xs tabular-nums text-accent">0{index + 1}</span>{step}</li>)}</ol></figure>;
  return <figure className="flex min-h-52 flex-col justify-center bg-[#e3f1ed] p-6 text-ink sm:p-8"><p className="text-4xl font-semibold tracking-[-0.05em] text-accent-strong sm:text-5xl">{preview.value}</p><figcaption className="mt-4 text-base font-semibold leading-7">{preview.label}</figcaption><p className="mt-3 text-sm leading-6 text-muted">{preview.detail}</p></figure>;
}
