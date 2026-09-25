import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { ProjectFilter } from "@/features/content/public-project-filter";
import { StaticProjectCard } from "@/features/content/static-project-card";

export const metadata: Metadata = { title: "프로젝트", description: "양윤모의 AI Agent와 백엔드 프로젝트 여섯 가지" };

export default function ProjectsPage() {
  return <PublicShell><Container className="py-16"><header className="mb-10"><p className="text-sm font-semibold text-accent">Projects</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">프로젝트</h1><p className="mt-4 max-w-2xl leading-7 text-muted">문제 정의부터 구현, 검증과 회고까지 실제 작업의 맥락을 기록했습니다.</p></header><ProjectFilter items={portfolio.projects.map((project) => ({ slug: project.slug, skills: project.skills, card: <StaticProjectCard project={project} /> }))} /></Container></PublicShell>;
}
