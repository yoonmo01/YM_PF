"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { contentApi } from "./api";
import { EmptyState, ErrorState, LoadingState } from "./query-state";
import { ProjectCover } from "./project-media";

export function PublicHome() {
  const profile = useQuery({ queryKey: ["public", "profile"], queryFn: contentApi.publicProfile });
  const projects = useQuery({ queryKey: ["public", "projects"], queryFn: contentApi.publicProjects });

  return (
    <>
      <section className="py-20 sm:py-28">
        <Container>
          <p className="text-sm font-semibold tracking-[0.14em] text-accent uppercase">Backend · Full-stack Engineer</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl">
            {profile.data?.headline ?? "문제를 구조화하고, 검증 가능한 제품으로 만듭니다."}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            {profile.data?.shortBio ?? "프로필을 준비하고 있습니다. 아래 프로젝트에서 구현 과정과 기술적 의사결정을 확인해 주세요."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong" href="/projects">프로젝트 보기</Link>
            <Link className="rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold" href="/contact">연락하기</Link>
          </div>
        </Container>
      </section>
      <section className="py-10" aria-labelledby="featured-title">
        <Container>
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-accent">Selected work</p><h2 className="mt-2 text-3xl font-semibold" id="featured-title">주요 프로젝트</h2></div>
            <Link className="text-sm font-semibold text-accent-strong" href="/projects">전체 보기 →</Link>
          </div>
          <div className="mt-8">
            {projects.isPending && <LoadingState />}
            {projects.isError && <ErrorState retry={() => projects.refetch()} />}
            {projects.data?.content.length === 0 && <EmptyState>공개된 프로젝트가 아직 없습니다.</EmptyState>}
            <div className="grid gap-5 md:grid-cols-2">
              {projects.data?.content.filter((item) => item.featured).slice(0, 4).map((project) => (
                <Link className="group rounded-2xl border border-line bg-surface p-6 shadow-sm hover:border-accent" href={`/projects/${project.slug}`} key={project.slug}>
                  <ProjectCover media={project.media} title={project.title} />
                  <h3 className="text-xl font-semibold group-hover:text-accent-strong">{project.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{project.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
