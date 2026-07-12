import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 대시보드",
  robots: { index: false, follow: false },
};

const dashboardItems = [
  { label: "공개 프로젝트", description: "Phase 2에서 콘텐츠 API와 연결됩니다." },
  { label: "임시저장 프로젝트", description: "Phase 2에서 상태 관리가 추가됩니다." },
  { label: "저장된 미디어", description: "Phase 3에서 안전한 업로드를 연결합니다." },
  { label: "회사별 이력서", description: "Phase 4에서 관리자 전용으로 제공됩니다." },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <header>
        <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
          콘텐츠 현황
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          관리자 인증이 완료되었습니다. 콘텐츠 기능은 각 Phase에서 실제 데이터와 연결됩니다.
        </p>
      </header>

      <section aria-labelledby="content-status-title" className="mt-10">
        <h2 className="sr-only" id="content-status-title">
          콘텐츠 연결 상태
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardItems.map((item) => (
            <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm" key={item.label}>
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-6 text-2xl font-semibold text-muted" aria-label="아직 연결되지 않음">
                —
              </p>
              <p className="mt-3 text-xs leading-5 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8" aria-labelledby="security-title">
        <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">Session</p>
        <h2 className="mt-3 text-xl font-semibold text-ink" id="security-title">
          인증 세션이 보호되고 있습니다.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          브라우저 저장소에 인증 토큰을 보관하지 않으며, 관리자 요청은 서버의 쿠키 세션과 CSRF 검증을 사용합니다.
        </p>
      </section>
    </div>
  );
}
