"use client";

import { useQuery } from "@tanstack/react-query";
import { contentApi } from "./api";
import { ErrorState, LoadingState } from "./query-state";
import { MediaGallery, ProjectCover } from "./project-media";

export function PublicProjectDetailView({ slug }: { slug: string }) {
  const query = useQuery({ queryKey: ["public", "project", slug], queryFn: () => contentApi.publicProject(slug) });
  if (query.isPending) return <LoadingState label="프로젝트를 불러오는 중입니다." />;
  if (query.isError) return <ErrorState retry={() => query.refetch()} />;
  const project = query.data;
  return <article>
    <ProjectCover media={project.media} title={project.title} />
    <div className="flex flex-wrap gap-2">{project.skills.map((skill) => <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-strong" key={`${skill.category}-${skill.name}`}>{skill.name}</span>)}</div>
    <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{project.title}</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{project.summary}</p>
    <dl className="mt-8 grid gap-4 rounded-2xl border border-line bg-surface p-6 text-sm sm:grid-cols-4"><Meta label="기간" value={[project.startDate, project.endDate].filter(Boolean).join(" — ") || "미정"} /><Meta label="인원" value={project.teamSize ? `${project.teamSize}명` : "미정"} /><Meta label="역할" value={project.role || "미정"} /><Meta label="상태" value="공개" /></dl>
    <TextSection title="프로젝트 배경" value={project.background} /><TextSection title="문제 정의" value={project.problem} /><TextSection title="목표와 요구사항" value={project.goal} /><TextSection title="담당 업무" value={project.responsibilities} /><TextSection title="기술 선택 이유" value={project.technicalDecisions} />
    {project.media.some((item) => item.mediaRole === "ARCHITECTURE") && <section className="mt-14"><h2 className="text-2xl font-semibold">시스템 아키텍처</h2><div className="mt-5"><MediaGallery media={project.media.filter((item) => item.mediaRole === "ARCHITECTURE")} /></div></section>}
    <TextSection title="핵심 구현" value={project.implementation} />
    {project.problemSolutions.length > 0 && <section className="mt-14"><h2 className="text-2xl font-semibold">문제 해결 기록</h2><div className="mt-5 grid gap-4">{project.problemSolutions.map((item, index) => <article className="rounded-2xl border border-line bg-surface p-6" key={item.id ?? index}><h3 className="font-semibold">{item.problem}</h3><dl className="mt-4 grid gap-3 text-sm leading-7 text-muted"><div><dt className="font-semibold text-ink">원인</dt><dd>{item.cause}</dd></div><div><dt className="font-semibold text-ink">해결</dt><dd>{item.solution}</dd></div><div><dt className="font-semibold text-ink">검증</dt><dd>{item.verification}</dd></div></dl></article>)}</div></section>}
    <TextSection title="검증 및 성과" value={project.results} /><TextSection title="한계" value={project.limitations} /><TextSection title="회고" value={project.retrospective} />
    {project.media.some((item) => item.mediaRole !== "COVER" && item.mediaRole !== "ARCHITECTURE") && <section className="mt-14"><h2 className="text-2xl font-semibold">이미지 갤러리</h2><div className="mt-5"><MediaGallery media={project.media.filter((item) => item.mediaRole !== "COVER" && item.mediaRole !== "ARCHITECTURE")} /></div></section>}
    {(project.githubUrl || project.demoUrl) && <section className="mt-14"><h2 className="text-2xl font-semibold">관련 링크</h2><div className="mt-5 flex flex-wrap gap-3">{project.githubUrl && <a className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold" href={project.githubUrl} rel="noreferrer" target="_blank">GitHub</a>}{project.demoUrl && <a className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white" href={project.demoUrl} rel="noreferrer" target="_blank">Demo</a>}</div></section>}
  </article>;
}

function TextSection({ title, value }: { title: string; value: string | null }) { return value ? <section className="mt-14"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 whitespace-pre-wrap text-base leading-8 text-muted">{value}</p></section> : null; }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="font-semibold text-muted">{label}</dt><dd className="mt-1 font-semibold text-ink">{value}</dd></div>; }
