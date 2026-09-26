import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";
import { portfolioEn } from "@/content/public-portfolio-en";
import { StaticProjectCard } from "@/features/content/static-project-card";

export const metadata: Metadata = { title: "프로젝트", description: "양윤모가 참여한 AI Agent와 백엔드 프로젝트" };

export function ProjectsContent({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const en = locale === "en";
  const projects = en ? portfolioEn.projects : portfolio.projects;
  return <PublicShell locale={locale} alternateHref={en ? "/projects" : "/en/projects"}><Container className="py-12 sm:py-16"><header className="mb-9"><h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{en ? "Projects" : "프로젝트"}</h1></header><div className="grid gap-5">{projects.map((project) => <StaticProjectCard key={project.slug} project={project} prefix={en ? "/en" : ""} />)}</div></Container></PublicShell>;
}

export default function ProjectsPage() { return <ProjectsContent />; }
