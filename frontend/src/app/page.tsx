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
    <section className="py-10 sm:py-14"><Container>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">AI Agent Engineer · Backend Engineer</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">{portfolio.profile.name}</h1>
      <p className="mt-4 max-w-3xl text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl">{portfolio.profile.headline}</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">{portfolio.profile.shortBio}</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-accent-strong" href="/projects">프로젝트 보기</Link><Link className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-5 text-sm font-semibold hover:border-accent" href="/contact">연락하기</Link></div>
    </Container></section>
    <section className="pb-14 sm:pb-20" aria-labelledby="featured-title"><Container>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl" id="featured-title">대표 프로젝트</h2><Link className="rounded-sm text-sm font-semibold text-accent-strong underline decoration-line underline-offset-4 hover:decoration-accent" href="/projects">전체 프로젝트 보기</Link></div>
      <div className="grid gap-5">{portfolio.projects.filter((project) => project.featured).map((project, index) => <StaticProjectCard key={project.slug} project={project} headingLevel={3} spotlight={index === 0} />)}</div>
    </Container></section>
    <section className="border-t border-line py-14 sm:py-20" aria-labelledby="awards-title"><Container>
      <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl" id="awards-title">수상</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{portfolio.awards.map((award) => <article className="rounded-xl border border-line bg-surface p-6" key={award.title}><p className="text-xs font-semibold tabular-nums text-accent-strong">{award.date}</p><h3 className="mt-3 text-lg font-semibold leading-7">{award.title}</h3><p className="mt-3 text-sm text-muted">{award.issuer}</p></article>)}</div>
    </Container></section>
    <section className="border-t border-line py-14 sm:py-20" aria-labelledby="activity-title"><Container>
      <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl" id="activity-title">연구 활동·학력</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-line bg-surface p-6"><h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">연구 활동</h3>{portfolio.experiences.map((item) => <div className="mt-4" key={item.organization}><p className="text-lg font-semibold">{item.organization}</p><p className="mt-2 text-sm text-muted">{item.title} · {item.period}</p><p className="mt-3 text-sm leading-7 text-muted">{item.description}</p></div>)}</div><div className="rounded-xl border border-line bg-surface p-6"><h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">학력</h3>{portfolio.educations.map((item) => <div className="mt-4" key={item.institution}><p className="text-lg font-semibold">{item.institution}</p><p className="mt-2 text-sm text-muted">{item.program}</p><p className="mt-3 text-sm text-muted">{item.period}</p></div>)}</div></div>
    </Container></section>
    <section className="border-t border-line bg-[#e3f1ed] py-14 sm:py-20"><Container><h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">함께 이야기해요.</h2><p className="mt-3 text-sm leading-7 text-muted">프로젝트와 협업에 관한 이야기를 기다립니다.</p><a className="mt-5 inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-accent-strong" href={`mailto:${portfolio.profile.email}`}>{portfolio.profile.email} ↗</a></Container></section>
  </PublicShell>;
}
