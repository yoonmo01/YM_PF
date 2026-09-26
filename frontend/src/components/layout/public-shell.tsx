import Link from "next/link";
import type { ReactNode } from "react";

import { portfolio } from "@/content/public-portfolio";
import { Container } from "./container";

export function PublicShell({ children, locale = "ko", alternateHref = "/en" }: { children: ReactNode; locale?: "ko" | "en"; alternateHref?: string }) {
  const en = locale === "en";
  const prefix = en ? "/en" : "";
  return <div className="min-h-screen" lang={en ? "en" : undefined}>
    <a className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white focus:translate-y-0" href="#main-content">{en ? "Skip to content" : "본문으로 건너뛰기"}</a>
    <header className="border-b border-line bg-surface"><Container className="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-x-5 gap-y-2 py-3 sm:flex-nowrap">
      <Link className="inline-flex shrink-0 items-center gap-3 rounded-sm font-semibold" href={`${prefix}/`} aria-label={en ? "Yoonmo Yang portfolio home" : "양윤모 포트폴리오 홈"}><span className="grid size-9 place-items-center rounded-md bg-ink text-sm font-bold text-white" aria-hidden="true">YM</span><span className="text-sm">{en ? "Yoonmo Yang" : "양윤모"}</span></Link>
      <nav aria-label={en ? "Main menu" : "주 메뉴"} className="order-3 w-full sm:order-2 sm:w-auto"><ul className="flex items-center gap-5 text-sm font-semibold text-muted sm:gap-7">
        <li><Link className="rounded-sm py-2 hover:text-accent-strong" href={`${prefix}/about`}>{en ? "About" : "소개"}</Link></li>
        <li><Link className="rounded-sm py-2 hover:text-accent-strong" href={`${prefix}/projects`}>{en ? "Projects" : "프로젝트"}</Link></li>
        <li><Link className="rounded-sm py-2 hover:text-accent-strong" href={`${prefix}/contact`}>{en ? "Contact" : "연락"}</Link></li>
      </ul></nav>
      <div className="order-2 flex items-center gap-1 sm:order-3">
        <a aria-label={en ? "GitHub profile" : "GitHub 프로필"} className="grid size-11 place-items-center rounded-md hover:bg-[#e3f1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={portfolio.profile.githubUrl} rel="noreferrer" target="_blank"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.13c-3.1.68-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.63-1.24-1.63-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .17 1.69.64 2.08 1.12.1-.73.39-1.23.71-1.51-2.47-.28-5.06-1.24-5.06-5.49 0-1.21.43-2.2 1.14-2.98-.11-.28-.49-1.42.11-2.95 0 0 .93-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.67.11 2.95.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.08 5.48.4.35.76 1.03.76 2.08v3.09c0 .3.21.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg></a>
        <a aria-label={en ? "Email Yoonmo Yang" : "이메일 보내기"} className="grid size-11 place-items-center rounded-md hover:bg-[#e3f1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={`mailto:${portfolio.profile.email}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></a>
        <Link aria-label={en ? "EN, switch to Korean" : "KO, switch to English"} className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line px-2 text-xs font-bold hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={alternateHref}>{en ? "EN" : "KO"}</Link>
      </div>
    </Container></header>
    <main id="main-content">{children}</main>
    <footer className="mt-24 border-t border-line bg-surface py-8 text-sm text-muted"><Container>{en ? "Yoonmo Yang" : "양윤모"} · AX Engineer · AI Agent Engineer · Backend Engineer</Container></footer>
  </div>;
}
