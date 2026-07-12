import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicProjectDetailView } from "@/features/content/public-project-detail";

export const metadata: Metadata = { title: "프로젝트 상세" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicShell><Container className="py-16"><PublicProjectDetailView slug={slug} /></Container></PublicShell>;
}
