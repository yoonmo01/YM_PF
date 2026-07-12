"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { contentApi } from "./api";
import { EmptyState, ErrorState, LoadingState } from "./query-state";
import { ProjectCover } from "./project-media";

export function PublicProjects() {
  const query = useQuery({ queryKey: ["public", "projects"], queryFn: contentApi.publicProjects });
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => query.refetch()} />;
  if (!query.data.content.length) return <EmptyState>공개된 프로젝트가 아직 없습니다.</EmptyState>;

  return <div className="grid gap-5 md:grid-cols-2">{query.data.content.map((project) => (
    <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm" key={project.slug}>
      <ProjectCover media={project.media} title={project.title} />
      <div className="flex flex-wrap gap-2">{project.skills.map((skill) => <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong" key={`${skill.category}-${skill.name}`}>{skill.name}</span>)}</div>
      <h2 className="mt-5 text-2xl font-semibold"><Link className="hover:text-accent-strong" href={`/projects/${project.slug}`}>{project.title}</Link></h2>
      <p className="mt-3 text-sm leading-7 text-muted">{project.summary}</p>
      <Link className="mt-6 inline-block text-sm font-semibold text-accent-strong" href={`/projects/${project.slug}`}>상세 보기 →</Link>
    </article>
  ))}</div>;
}
