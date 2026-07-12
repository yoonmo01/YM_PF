import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = Array.isArray(params.next) ? params.next[0] : params.next;

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.8fr)_minmax(32rem,1.2fr)]">
      <section className="flex items-center bg-ink px-6 py-12 text-white sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-lg lg:mx-0">
          <Link
            className="rounded-sm text-sm font-bold tracking-[0.12em] outline-offset-4 focus-visible:outline-2 focus-visible:outline-white"
            href="/"
          >
            YM · PF
          </Link>
          <p className="mt-16 text-sm font-semibold tracking-[0.14em] text-cyan-200 uppercase">
            Portfolio workspace
          </p>
          <h1 className="mt-5 text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-5xl">
            관리자 전용 작업 공간
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
            공개 포트폴리오와 회사별 이력서 데이터를 안전하게 관리합니다.
          </p>
        </div>
      </section>

      <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16" aria-labelledby="login-title">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">
            Admin sign in
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink" id="login-title">
            로그인
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            등록된 관리자 계정으로 로그인해 주세요.
          </p>
          <LoginForm nextPath={nextPath} />
          <Link
            className="mt-7 inline-flex min-h-11 items-center text-sm font-semibold text-muted underline-offset-4 hover:text-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href="/"
          >
            공개 포트폴리오로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
