"use client";

import { useQuery } from "@tanstack/react-query";
import { contentApi } from "./api";
import { ErrorState, LoadingState } from "./query-state";

export function PublicProjectDetailView({ slug }: { slug: string }) {
  const query = useQuery({ queryKey: ["public", "project", slug], queryFn: () => contentApi.publicProject(slug) });
  if (query.isPending) return <LoadingState label="프로젝트를 불러오는 중입니다." />;
  if (query.isError) return <ErrorState retry={() => query.refetch()} />;
  const project = query.data;
  const sections = [
    ["배경", project.background], ["문제", project.problem], ["목표", project.goal], ["담당 역할", project.role],
    ["구현", project.implementation], ["기술적 의사결정", project.technicalDecisions], ["결과", project.results],
    ["한계", project.limitations], ["회고", project.retrospective],
  ];
  return <article>
    <div className="flex flex-wrap gap-2">{project.skills.map((skill) => <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong" key={`${skill.category}-${skill.name}`}>{skill.name}</span>)}</div>
    <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{project.title}</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{project.summary}</p>
    <div className="mt-10 flex flex-wrap gap-3">{project.githubUrl && <a className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold" href={project.githubUrl} rel="noreferrer" target="_blank">GitHub</a>}{project.demoUrl && <a className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white" href={project.demoUrl} rel="noreferrer" target="_blank">Demo</a>}</div>
    <div className="mt-14 space-y-10">{sections.filter(([, value]) => value).map(([title, value]) => <section key={title}><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 whitespace-pre-wrap text-base leading-8 text-muted">{value}</p></section>)}</div>
    {project.problemSolutions.length > 0 && <section className="mt-14"><h2 className="text-2xl font-semibold">문제 해결 기록</h2><div className="mt-5 grid gap-4">{project.problemSolutions.map((item, index) => <article className="rounded-2xl border border-line bg-surface p-6" key={item.id ?? index}><h3 className="font-semibold">{item.problem}</h3><dl className="mt-4 grid gap-3 text-sm leading-7 text-muted"><div><dt className="font-semibold text-ink">원인</dt><dd>{item.cause}</dd></div><div><dt className="font-semibold text-ink">해결</dt><dd>{item.solution}</dd></div><div><dt className="font-semibold text-ink">검증</dt><dd>{item.verification}</dd></div></dl></article>)}</div></section>}
  </article>;
}
