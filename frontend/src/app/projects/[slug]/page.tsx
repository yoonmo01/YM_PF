import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio, type PortfolioProject } from "@/content/public-portfolio";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() { return portfolio.projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project: PortfolioProject | undefined = portfolio.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return { title: project.title, description: project.summary };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project: PortfolioProject | undefined = portfolio.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return <PublicShell><Container className="py-16"><article>
    <ul className="flex flex-wrap gap-2">{project.skills.map((skill) => <li className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong" key={skill}>{skill}</li>)}</ul>
    <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{project.title}</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{project.summary}</p>
    {(project.role || project.period || project.teamSize) && <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-surface p-6 text-sm sm:grid-cols-3">
      {project.role && <Meta label="역할" value={project.role} />}{project.period && <Meta label="기간" value={project.period} />}{project.teamSize && <Meta label="인원" value={`${project.teamSize}명`} />}
    </dl>}
    <CaseStudy project={project} />
    {project.links && (project.links.github || project.links.demo) && <section className="mt-14"><h2 className="text-2xl font-semibold">관련 링크</h2><div className="mt-5 flex flex-wrap gap-3">{project.links.github && <a className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold" href={project.links.github} rel="noreferrer" target="_blank">GitHub</a>}{project.links.demo && <a className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white" href={project.links.demo} rel="noreferrer" target="_blank">Demo</a>}</div></section>}
  </article></Container></PublicShell>;
}

function CaseStudy({ project }: { project: PortfolioProject }) {
  const sections = [
    ["문제 정의", project.caseStudy.problem], ["목표와 요구사항", project.caseStudy.goal],
    ["핵심 구현", project.caseStudy.implementation], ["한계", project.caseStudy.limitations],
    ["회고", project.caseStudy.reflection],
  ];
  return sections.map(([title, value]) => <section className="mt-14" key={title}><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 max-w-3xl whitespace-pre-wrap text-base leading-8 text-muted">{value}</p></section>);
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-semibold text-muted">{label}</dt><dd className="mt-1">{value}</dd></div>;
}
