import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicProjects } from "@/features/content/public-projects";

export const metadata: Metadata = { title: "프로젝트", description: "구현 과정과 기술적 의사결정을 담은 프로젝트 목록" };

export default function ProjectsPage() {
  return <PublicShell><Container className="py-16"><header className="mb-10"><p className="text-sm font-semibold text-accent">Projects</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">프로젝트</h1><p className="mt-4 max-w-2xl leading-7 text-muted">문제 정의부터 구현, 검증과 회고까지 실제 작업의 맥락을 기록했습니다.</p></header><PublicProjects /></Container></PublicShell>;
}
