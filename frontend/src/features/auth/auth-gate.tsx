"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { ApiError } from "./api";
import { useCurrentUser } from "./queries";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const isUnauthorized =
    currentUser.error instanceof ApiError && currentUser.error.status === 401;
  const isForbidden = currentUser.isSuccess && currentUser.data.role !== "ADMIN";

  useEffect(() => {
    if (isUnauthorized) {
      const next = encodeURIComponent(pathname || "/admin");
      router.replace(`/admin/login?next=${next}`);
    }
  }, [isUnauthorized, pathname, router]);

  if (currentUser.isPending || isUnauthorized) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <div className="text-center" role="status">
          <span
            aria-hidden="true"
            className="mx-auto block size-8 animate-spin rounded-full border-3 border-line border-t-accent"
          />
          <p className="mt-4 text-sm font-medium text-muted">
            관리자 권한을 확인하고 있습니다.
          </p>
        </div>
      </main>
    );
  }

  if (currentUser.isError) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-ink">인증 상태를 확인하지 못했습니다.</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            네트워크 연결을 확인한 뒤 다시 시도해 주세요.
          </p>
          <button
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => void currentUser.refetch()}
            type="button"
          >
            다시 시도
          </button>
        </section>
      </main>
    );
  }

  if (isForbidden) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <section className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-ink">관리자 접근 권한이 없습니다.</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            이 계정은 관리자 작업 공간을 사용할 수 없습니다.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-semibold text-ink hover:border-accent/50 hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href="/"
          >
            공개 사이트로 이동
          </Link>
        </section>
      </main>
    );
  }

  return children;
}
