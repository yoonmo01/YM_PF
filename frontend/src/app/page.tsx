import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { StaticProjectCard } from "@/features/content/static-project-card";

export const metadata: Metadata = {
  title: { absolute: `${portfolio.profile.name} | AI Agent · Backend Engineer` },
  description: portfolio.profile.shortBio,
};

export default function HomePage() {
  return <PublicShell>
    <section className="py-16 sm:py-24"><Container>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] md:items-end md:gap-14">
        <div>
          <p className="text-sm font-semibold text-accent">AI Agent Engineer · Backend Engineer</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.13] tracking-[-0.045em] text-ink sm:text-6xl">{portfolio.profile.headline}</h1>
        </div>
        <p className="border-l-2 border-accent pl-5 text-base leading-8 text-muted sm:text-lg">{portfolio.profile.shortBio}</p>
      </div>
      <p className="mt-6 text-sm font-medium text-muted">{portfolio.profile.name}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-accent-strong" href="/projects">프로젝트 보기</Link>
        <Link className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 text-sm font-semibold hover:border-accent" href="/contact">연락하기</Link>
        <a className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 text-sm font-semibold hover:border-accent" href={portfolio.profile.githubUrl} rel="noreferrer" target="_blank">GitHub</a>
      </div>
    </Container></section>
    <section className="border-t border-line py-10 sm:py-14" aria-labelledby="featured-title"><Container>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-accent">대표 프로젝트</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl" id="featured-title">문제를 해결한 과정</h2></div><Link className="rounded-sm text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-accent" href="/projects">전체 프로젝트 보기</Link></div>
      <div className="mt-7 divide-y divide-line border-y border-line">{portfolio.projects.filter((project) => project.featured).map((project) => <StaticProjectCard key={project.slug} project={project} />)}</div>
    </Container></section>
    {portfolio.skills.length > 0 && <section className="mt-5 border-t border-line py-10 sm:py-14"><Container><h2 className="text-2xl font-semibold">기술</h2><ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3">{portfolio.skills.map((skill) => <li className="text-sm font-medium text-muted" key={skill}>{skill}</li>)}</ul></Container></section>}
  </PublicShell>;
}
