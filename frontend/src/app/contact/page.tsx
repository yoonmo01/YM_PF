import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";

export const metadata: Metadata = { title: "연락", description: `${portfolio.profile.name}에게 이메일로 연락하기` };
export default function ContactPage() {
  return <PublicShell><Container className="py-16"><div className="max-w-2xl">
    <p className="text-sm font-semibold text-accent">Contact</p><h1 className="mt-3 text-4xl font-semibold">함께 이야기해요.</h1><p className="mt-5 leading-8 text-muted">채용, 협업 또는 프로젝트에 관해 아래 채널로 연락해 주세요.</p>
    <div className="mt-8 grid gap-3"><a className="rounded-xl border border-line bg-surface p-5 font-semibold hover:border-accent" href={`mailto:${portfolio.profile.email}`}>이메일 · {portfolio.profile.email}</a><a className="rounded-xl border border-line bg-surface p-5 font-semibold hover:border-accent" href={portfolio.profile.githubUrl} rel="noreferrer" target="_blank">GitHub</a></div>
  </div></Container></PublicShell>;
}
