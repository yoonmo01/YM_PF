import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio, type PortfolioProject } from "@/content/public-portfolio";
import { ProjectStudyMarkdown } from "@/features/content/project-study-markdown";

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
  const study = readFileSync(join(process.cwd(), "src", "content", "project-studies", `${project.slug}.md`), "utf8");

  return <PublicShell><Container className="py-12 sm:py-16"><article>
    <header className="max-w-[48rem]">
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-accent-strong">{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
    <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{project.title}</h1>
    <p className="mt-5 text-lg leading-8 text-muted">{project.summary}</p>
    {(project.role || project.period || project.teamSize) && <dl className="mt-9 grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-3">
      {project.role && <Meta label="역할" value={project.role} />}{project.period && <Meta label="기간" value={project.period} />}{project.teamSize && <Meta label="인원" value={`${project.teamSize}명`} />}
    </dl>}
    </header>
    <ProjectStudyMarkdown content={study} />
    {project.links && (project.links.github || project.links.demo) && <section className="mt-12 border-t border-line pt-7"><h2 className="text-lg font-semibold">관련 링크</h2><div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">{project.links.github && <a className="min-h-11 rounded-sm py-3 text-sm font-semibold text-accent-strong underline decoration-line underline-offset-4 hover:decoration-accent" href={project.links.github} rel="noreferrer" target="_blank">GitHub 저장소</a>}{project.links.demo && <a className="min-h-11 rounded-sm py-3 text-sm font-semibold text-accent-strong underline decoration-line underline-offset-4 hover:decoration-accent" href={project.links.demo} rel="noreferrer" target="_blank">Demo</a>}</div></section>}
  </article></Container></PublicShell>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-semibold text-muted">{label}</dt><dd className="mt-1">{value}</dd></div>;
}
