import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";

export const metadata: Metadata = { title: "소개", description: portfolio.profile.longBio };
export default function AboutPage() {
  return <PublicShell><Container className="py-12 sm:py-16">
    <header className="max-w-[48rem]"><p className="text-sm font-semibold text-accent">소개</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{portfolio.profile.name}</h1><p className="mt-7 whitespace-pre-wrap text-base leading-8 text-muted">{portfolio.profile.longBio}</p></header>
    <div className="mt-12 grid gap-12 border-t border-line pt-10 lg:grid-cols-2">
      <section><h2 className="text-2xl font-semibold">연구 활동</h2>{portfolio.experiences.map((item) => <article className="mt-5" key={item.organization}><h3 className="text-lg font-semibold">{item.organization}</h3><p className="mt-2 text-sm text-accent-strong">{item.title} · {item.period}</p><p className="mt-3 text-sm leading-7 text-muted">{item.description}</p></article>)}</section>
      <section><h2 className="text-2xl font-semibold">학력</h2>{portfolio.educations.map((item) => <article className="mt-5" key={item.institution}><h3 className="text-lg font-semibold">{item.institution}</h3><p className="mt-2 text-sm text-muted">{item.program}</p><p className="mt-3 text-sm text-muted">{item.period}</p></article>)}</section>
      <section><h2 className="text-2xl font-semibold">수상</h2><ul className="mt-5 space-y-5">{portfolio.awards.map((award) => <li key={award.title}><p className="font-semibold">{award.title}</p><p className="mt-1 text-sm text-muted">{award.issuer} · {award.date}</p></li>)}</ul></section>
      <section><h2 className="text-2xl font-semibold">논문</h2><ul className="mt-5 space-y-5">{portfolio.publications.map((paper) => <li key={paper.url}><a className="font-semibold text-accent-strong underline underline-offset-4" href={paper.url} rel="noreferrer" target="_blank">{paper.title}</a><p className="mt-2 text-sm text-muted">{paper.venue} · {paper.date}</p></li>)}</ul></section>
    </div>
    {portfolio.skills.length > 0 && <section className="mt-12 border-t border-line pt-10"><h2 className="text-2xl font-semibold">주요 분야</h2><ul className="mt-5 flex flex-wrap gap-2">{portfolio.skills.map((skill) => <li className="rounded-full bg-[#e3f1ed] px-4 py-2 text-sm font-medium text-accent-strong" key={skill}>{skill}</li>)}</ul></section>}
  </Container></PublicShell>;
}
