import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { ProjectFilter } from "@/features/content/public-project-filter";
import { StaticProjectCard } from "@/features/content/static-project-card";

export const metadata: Metadata = { title: "프로젝트", description: "양윤모가 참여한 AI Agent와 백엔드 프로젝트" };

export default function ProjectsPage() {
  return <PublicShell><Container className="py-12 sm:py-16"><header className="mb-9 max-w-[48rem]"><h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">프로젝트</h1><p className="mt-4 text-base leading-8 text-muted">문제 정의와 구현 과정, 한계와 회고를 프로젝트별로 정리했습니다.</p></header><ProjectFilter items={portfolio.projects.map((project) => ({ slug: project.slug, skills: project.skills, card: <StaticProjectCard project={project} /> }))} /></Container></PublicShell>;
}
