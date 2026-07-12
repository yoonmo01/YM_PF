"use client";

import Link from "next/link";
import { type ReactNode } from "react";

import { LogoutButton } from "@/features/auth/logout-button";
import { useCurrentUser } from "@/features/auth/queries";

type AdminShellProps = {
  children: ReactNode;
};

const sections = [
  ["대시보드", "/admin"],
  ["프로필", "/admin/profile"],
  ["경력", "/admin/experiences"],
  ["학력·교육", "/admin/educations"],
  ["기술", "/admin/skills"],
  ["자격증", "/admin/certificates"],
  ["프로젝트", "/admin/projects"],
] as const;

export function AdminShell({ children }: AdminShellProps) {
  const currentUser = useCurrentUser();

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-24 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white focus:translate-y-0"
        href="#admin-content"
      >
        본문으로 건너뛰기
      </a>

      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-b-0">
        <div className="border-b border-line px-5 py-5 lg:px-6 lg:py-7">
          <Link
            className="rounded-sm text-sm font-bold tracking-[0.08em] text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
            href="/admin"
          >
            YM · PF ADMIN
          </Link>
          <p className="mt-2 truncate text-xs text-muted" title={currentUser.data?.email}>
            {currentUser.data?.email}
          </p>
        </div>

        <nav aria-label="관리자 메뉴" className="px-4 py-4 lg:flex-1 lg:px-5 lg:py-6">
          <ul className="grid gap-2 sm:grid-cols-2 lg:block lg:space-y-1">
            {sections.map(([label, href]) => (
              <li key={href}><Link className="flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold text-muted hover:bg-accent/10 hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-accent" href={href}>{label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 lg:block lg:p-5">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href="/"
          >
            공개 사이트 보기
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="min-w-0" id="admin-content">
        {children}
      </main>
    </div>
  );
}
