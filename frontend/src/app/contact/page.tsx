import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";

export const metadata: Metadata = { title: "연락", description: `${portfolio.profile.name}에게 이메일로 연락하기` };
export default function ContactPage() {
  return <PublicShell><Container className="py-12 sm:py-16"><div className="max-w-[48rem]">
    <p className="text-sm font-semibold text-accent">연락</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">함께 이야기해요.</h1><p className="mt-5 text-base leading-8 text-muted">채용, 협업 또는 프로젝트에 관해 이메일이나 GitHub로 연락해 주세요.</p>
    <div className="mt-9 divide-y divide-line border-y border-line"><a className="flex min-h-14 items-center justify-between gap-4 py-4 font-semibold hover:text-accent-strong" href={`mailto:${portfolio.profile.email}`}><span>{portfolio.profile.email}</span><span aria-hidden="true">↗</span></a><a className="flex min-h-14 items-center justify-between gap-4 py-4 font-semibold hover:text-accent-strong" href={portfolio.profile.githubUrl} rel="noreferrer" target="_blank"><span>GitHub 프로필</span><span aria-hidden="true">↗</span></a></div>
  </div></Container></PublicShell>;
}
