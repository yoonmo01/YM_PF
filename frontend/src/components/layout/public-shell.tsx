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
      <Link className="shrink-0 rounded-sm text-base font-semibold tracking-[-0.03em] text-ink" href={`${prefix}/`} aria-label={en ? "Yoonmo Yang portfolio home" : "양윤모 포트폴리오 홈"}>{en ? "Yoonmo Yang" : "양윤모"}</Link>
      <nav aria-label={en ? "Main menu" : "주 메뉴"} className="order-3 w-full sm:order-2 sm:w-auto"><ul className="flex items-center gap-5 text-sm font-semibold text-muted sm:gap-7">
        <li><Link className="rounded-sm py-2 hover:text-accent-strong" href={`${prefix}/about`}>{en ? "About" : "소개"}</Link></li>
        <li><Link className="rounded-sm py-2 hover:text-accent-strong" href={`${prefix}/projects`}>{en ? "Projects" : "프로젝트"}</Link></li>
        <li><Link className="rounded-sm py-2 hover:text-accent-strong" href={`${prefix}/contact`}>{en ? "Contact" : "연락"}</Link></li>
      </ul></nav>
      <div className="order-2 flex items-center gap-1 sm:order-3">
        <a aria-label={en ? "GitHub profile" : "GitHub 프로필"} className="grid size-11 place-items-center rounded-md hover:bg-[#e3f1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={portfolio.profile.githubUrl} rel="noreferrer" target="_blank"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"/></svg></a>
        <a aria-label={en ? "Email Yoonmo Yang" : "이메일 보내기"} className="grid size-11 place-items-center rounded-md hover:bg-[#e3f1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={`mailto:${portfolio.profile.email}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></a>
        <Link aria-label={en ? "EN, switch to Korean" : "KO, switch to English"} className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line px-2 text-xs font-bold hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" href={alternateHref}>{en ? "EN" : "KO"}</Link>
      </div>
    </Container></header>
    <main id="main-content">{children}</main>
    <footer className="mt-24 border-t border-line bg-surface py-8 text-sm text-muted"><Container>{en ? "Yoonmo Yang" : "양윤모"} · AX Engineer · AI Agent Engineer · Backend Engineer</Container></footer>
  </div>;
}
