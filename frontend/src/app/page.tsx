import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { StaticProjectCard } from "@/features/content/static-project-card";

export const metadata: Metadata = { title: "홈", description: portfolio.profile.shortBio };

export default function HomePage() {
  return <PublicShell>
    <section className="py-20 sm:py-28"><Container>
      <p className="text-sm font-semibold tracking-[0.08em] text-accent">AI Agent Engineer · Backend Engineer</p>
      <p className="mt-4 text-lg font-semibold">{portfolio.profile.name}</p>
      <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl">{portfolio.profile.headline}</h1>
      <p className="mt-7 max-w-2xl text-base leading-8 text-muted sm:text-lg">{portfolio.profile.shortBio}</p>
      <div className="mt-9 flex flex-wrap gap-3"><Link className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white" href="/projects">프로젝트 보기</Link><Link className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold" href="/contact">연락하기</Link><a className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold" href={portfolio.profile.githubUrl} rel="noreferrer" target="_blank">GitHub ↗</a></div>
    </Container></section>
    <section className="py-10" aria-labelledby="featured-title"><Container>
      <div className="flex items-end justify-between gap-4"><h2 className="text-3xl font-semibold" id="featured-title">주요 프로젝트</h2><Link className="text-sm font-semibold text-accent-strong" href="/projects">전체 보기 →</Link></div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">{portfolio.projects.filter((project) => project.featured).map((project) => <StaticProjectCard key={project.slug} project={project} />)}</div>
    </Container></section>
    {portfolio.skills.length > 0 && <section className="mt-14"><Container><h2 className="text-2xl font-semibold">기술 스택</h2><ul className="mt-5 flex flex-wrap gap-2">{portfolio.skills.map((skill) => <li className="rounded-full border border-line bg-surface px-3 py-2 text-sm" key={skill}>{skill}</li>)}</ul></Container></section>}
  </PublicShell>;
}
