import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./container";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <a className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white focus:translate-y-0" href="#main-content">
        본문으로 건너뛰기
      </a>
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <Container className="flex min-h-16 items-center justify-between gap-6">
          <Link className="text-sm font-bold tracking-[0.12em]" href="/">YM · PORTFOLIO</Link>
          <nav aria-label="주 메뉴">
            <ul className="flex items-center gap-3 text-sm font-semibold text-muted sm:gap-7">
              <li><Link className="hover:text-accent-strong" href="/projects">프로젝트</Link></li>
              <li><Link className="hover:text-accent-strong" href="/about">소개</Link></li>
              <li><Link className="hover:text-accent-strong" href="/contact">연락</Link></li>
            </ul>
          </nav>
        </Container>
      </header>
      <main id="main-content">{children}</main>
      <footer className="mt-20 border-t border-line bg-surface py-8 text-sm text-muted">
        <Container>© {new Date().getFullYear()} YM Portfolio</Container>
      </footer>
    </div>
  );
}
