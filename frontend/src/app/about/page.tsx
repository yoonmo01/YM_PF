import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { portfolioEn } from "@/content/public-portfolio-en";

export const metadata: Metadata = { title: "소개", description: portfolio.profile.longBio };
export function AboutContent({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  const data = en ? portfolioEn : portfolio;
  return <PublicShell locale={locale} alternateHref={en ? "/about" : "/en/about"}><Container className="py-12 sm:py-16">
    <header className="max-w-[48rem]"><p className="text-sm font-semibold text-accent">{en ? "About" : "소개"}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{data.profile.name}</h1><p className="mt-7 whitespace-pre-wrap text-base leading-8 text-muted">{data.profile.longBio}</p></header>
    <div className="mt-12 grid gap-12 border-t border-line pt-10 lg:grid-cols-2">
      <section><h2 className="text-2xl font-semibold">{en ? "Research" : "연구 활동"}</h2>{data.experiences.map((item) => <article className="mt-5" key={item.organization}><h3 className="text-lg font-semibold">{item.organization}</h3><p className="mt-2 text-sm text-accent-strong">{item.title} · {item.period}</p><p className="mt-3 text-sm leading-7 text-muted">{item.description}</p></article>)}</section>
      <section><h2 className="text-2xl font-semibold">{en ? "Education" : "학력"}</h2>{data.educations.map((item) => <article className="mt-5" key={item.institution}><h3 className="text-lg font-semibold">{item.institution}</h3><p className="mt-2 text-sm text-muted">{item.program}</p><p className="mt-3 text-sm text-muted">{item.period}</p></article>)}</section>
      <section><h2 className="text-2xl font-semibold">{en ? "Awards" : "수상"}</h2><ul className="mt-5 space-y-5">{data.awards.map((award) => <li key={award.title}><p className="font-semibold">{award.title}</p><p className="mt-1 text-sm text-muted">{award.issuer} · {award.date}</p></li>)}</ul></section>
      <section><h2 className="text-2xl font-semibold">{en ? "Papers" : "논문"}</h2><ul className="mt-5 space-y-5">{data.publications.map((paper) => <li key={paper.url}><a className="font-semibold text-accent-strong underline underline-offset-4" href={paper.url} rel="noreferrer" target="_blank">{paper.title}</a><p className="mt-2 text-sm text-muted">{paper.venue} · {paper.date}</p></li>)}</ul></section>
    </div>
    <section className="mt-12 border-t border-line pt-10"><h2 className="text-2xl font-semibold">Skills</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.skillGroups.map((group) => <div key={group.name}><h3 className="font-semibold text-accent-strong">{group.name}</h3><ul className="mt-3 flex flex-wrap gap-2">{group.skills.map((skill) => <li className="rounded-md border border-line bg-surface px-2.5 py-1 text-xs font-medium text-muted" key={skill}>{skill}</li>)}</ul></div>)}</div></section>
  </Container></PublicShell>;
}

export default function AboutPage() { return <AboutContent />; }
