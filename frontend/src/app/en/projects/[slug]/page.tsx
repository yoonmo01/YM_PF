import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolioEn } from "@/content/public-portfolio-en";
import { ProjectStudyMarkdown } from "@/features/content/project-study-markdown";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() { return portfolioEn.projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolioEn.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  return { title: project.title, description: project.summary };
}

export default async function EnglishProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = portfolioEn.projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const study = readFileSync(join(process.cwd(), "src", "content", "project-studies", `${slug}.md`), "utf8");
  const sections = [
    ["Problem", project.caseStudy.problem],
    ["Goal", project.caseStudy.goal],
    ["Implementation", project.caseStudy.implementation],
    ["Limitations", project.caseStudy.limitations],
    ["Reflection", project.caseStudy.reflection],
  ];
  return <PublicShell locale="en" alternateHref={`/projects/${slug}`}><Container className="py-12 sm:py-16"><article>
    <header className="max-w-[48rem]"><ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-accent-strong">{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{project.title}</h1><p className="mt-5 text-lg leading-8 text-muted">{project.summary}</p>{project.role && <p className="mt-6 text-sm font-semibold">Role: {project.role}</p>}</header>
    <div className="mt-10 grid gap-6 md:grid-cols-2">{sections.map(([heading, body]) => <section className="border-t border-line pt-4" key={heading}><h2 className="text-lg font-semibold">{heading}</h2><p className="mt-2 text-sm leading-7 text-muted">{body}</p></section>)}</div>
    <section className="mt-14 border-t border-line pt-8"><h2 className="text-2xl font-semibold">Full case study</h2><p className="mt-3 text-sm leading-7 text-muted">The detailed case study, figures, and diagrams below are currently available in Korean. The English summary above covers the main decisions and limits.</p><div lang="ko"><ProjectStudyMarkdown content={study} /></div></section>
    {project.links?.github && <a className="mt-10 inline-flex min-h-11 items-center text-sm font-semibold text-accent-strong underline underline-offset-4" href={project.links.github} rel="noreferrer" target="_blank">GitHub repository ↗</a>}
  </article></Container></PublicShell>;
}
