import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { portfolioEn } from "@/content/public-portfolio-en";
import { StaticProjectCard } from "@/features/content/static-project-card";

export const metadata: Metadata = { title: { absolute: `${portfolio.profile.name} | AI Agent · Backend Engineer` }, description: portfolio.profile.shortBio };

export function HomeContent({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  const data = en ? portfolioEn : portfolio;
  const prefix = en ? "/en" : "";
  const titleClass = "text-2xl font-semibold tracking-[-0.035em] sm:text-3xl";
  return <PublicShell locale={locale} alternateHref={en ? "/" : "/en"}>
    <section className="py-10 sm:py-14"><Container>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">AI Agent Engineer · Backend Engineer</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">{data.profile.name}</h1>
      <p className="mt-4 max-w-3xl text-xl font-medium leading-8 tracking-[-0.025em] sm:text-2xl">{data.profile.headline}</p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">{data.profile.shortBio}</p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-accent-strong">
        <a aria-label="GitHub" className="inline-flex min-h-11 items-center underline decoration-line underline-offset-4 hover:decoration-accent" href={data.profile.githubUrl} rel="noreferrer" target="_blank">GitHub ↗</a>
        <a aria-label="LinkedIn" className="inline-flex min-h-11 items-center underline decoration-line underline-offset-4 hover:decoration-accent" href={data.profile.linkedinUrl} rel="noreferrer" target="_blank">LinkedIn ↗</a>
        <a className="inline-flex min-h-11 items-center underline decoration-line underline-offset-4 hover:decoration-accent" href={`mailto:${data.profile.email}`}>{en ? "Email" : "이메일"} ↗</a>
      </div>
    </Container></section>
    <section className="border-t border-line py-12 sm:py-16" aria-labelledby="experience-title"><Container>
      <h2 className={titleClass} id="experience-title">Experience</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {data.experiences.map((item) => <article className="border-l-2 border-accent pl-5 py-2" key={item.organization}><p className="text-xs font-semibold text-accent-strong">{en ? "Research" : "연구 활동"}</p><h3 className="mt-2 text-lg font-semibold">{item.organization}</h3><p className="mt-1 text-sm text-muted">{item.title} · {item.period}</p><p className="mt-3 text-sm leading-7 text-muted">{item.description}</p></article>)}
        {data.educations.map((item) => <article className="border-l-2 border-accent pl-5 py-2" key={item.institution}><p className="text-xs font-semibold text-accent-strong">{en ? "Education" : "학력"}</p><h3 className="mt-2 text-lg font-semibold">{item.institution}</h3><p className="mt-1 text-sm text-muted">{item.program}</p><p className="mt-3 text-sm text-muted">{item.period}</p></article>)}
      </div>
    </Container></section>
    <section className="border-t border-line py-12 sm:py-16" aria-labelledby="awards-title"><Container>
      <h2 className={titleClass} id="awards-title">Awards</h2>
      <div className="mt-6 divide-y divide-line border-y border-line">{data.awards.map((award) => <article className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6" key={award.title}><p className="text-sm tabular-nums text-accent-strong">{award.date}</p><div><h3 className="font-semibold leading-6">{award.title}</h3><p className="mt-1 text-sm text-muted">{award.issuer}</p></div></article>)}</div>
    </Container></section>
    <section className="border-t border-line py-12 sm:py-16" aria-labelledby="papers-title"><Container>
      <h2 className={titleClass} id="papers-title">Papers</h2>
      <ol className="mt-6 space-y-5">{data.publications.map((paper) => <li className="border-l-2 border-line pl-5" key={paper.url}><a className="font-semibold leading-7 text-accent-strong underline decoration-line underline-offset-4 hover:decoration-accent" href={paper.url} rel="noreferrer" target="_blank">{paper.title} ↗</a><p className="mt-1 text-sm text-muted">{paper.venue} · {paper.date}</p></li>)}</ol>
    </Container></section>
    <section className="border-t border-line py-12 sm:py-16" aria-labelledby="projects-title"><Container>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><h2 className={titleClass} id="projects-title">Projects</h2><Link className="rounded-sm text-sm font-semibold text-accent-strong underline decoration-line underline-offset-4 hover:decoration-accent" href={`${prefix}/projects`}>{en ? "View all six projects" : "전체 프로젝트 보기"}</Link></div>
      <div className="grid gap-5">{data.projects.filter((project) => project.featured).map((project, index) => <StaticProjectCard key={project.slug} project={project} headingLevel={3} spotlight={index === 0} prefix={prefix} />)}</div>
    </Container></section>
    <section className="border-t border-line py-12 sm:py-16" aria-labelledby="skills-title"><Container>
      <h2 className={titleClass} id="skills-title">Skills</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.skillGroups.map((group) => <div key={group.name}><h3 className="text-sm font-semibold text-accent-strong">{group.name}</h3><p className="mt-2 text-sm leading-7 text-muted">{group.skills.join(" · ")}</p></div>)}</div>
    </Container></section>
    <section className="border-t border-line bg-[#e3f1ed] py-12 sm:py-16"><Container><h2 className={titleClass}>{en ? "Let's talk." : "함께 이야기해요."}</h2><p className="mt-3 text-sm leading-7 text-muted">{en ? "I'm open to conversations about projects and collaboration." : "프로젝트와 협업에 관한 이야기를 기다립니다."}</p><a className="mt-5 inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-semibold text-white hover:bg-accent-strong" href={`mailto:${data.profile.email}`}>{data.profile.email} ↗</a></Container></section>
  </PublicShell>;
}

export default function HomePage() { return <HomeContent />; }
