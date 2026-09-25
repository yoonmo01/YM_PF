import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./container";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white focus:translate-y-0" href="#main-content">
        본문으로 건너뛰기
      </a>
      <header className="border-b border-line bg-surface">
        <Container className="flex min-h-[4.5rem] items-center justify-between gap-5">
          <Link className="inline-flex shrink-0 items-center gap-3 rounded-sm font-semibold" href="/" aria-label="양윤모 포트폴리오 홈">
            <span className="grid size-9 place-items-center rounded-md bg-ink text-sm font-bold text-white" aria-hidden="true">YM</span>
            <span className="text-sm">양윤모</span>
          </Link>
          <nav aria-label="주 메뉴">
            <ul className="flex items-center gap-3 text-sm font-semibold text-muted sm:gap-8">
              <li><Link className="rounded-sm py-2 hover:text-accent-strong" href="/projects">프로젝트</Link></li>
              <li><Link className="rounded-sm py-2 hover:text-accent-strong" href="/about">소개</Link></li>
              <li><Link className="rounded-sm py-2 hover:text-accent-strong" href="/contact">연락</Link></li>
            </ul>
          </nav>
        </Container>
      </header>
      <main id="main-content">{children}</main>
      <footer className="mt-24 border-t border-line bg-surface py-8 text-sm text-muted">
        <Container>양윤모 · AI Agent Engineer · Backend Engineer</Container>
      </footer>
    </div>
  );
}
