import { Container } from "@/components/layout/container";
import { StatusPill } from "@/components/ui/status-pill";

const foundationItems = [
  {
    title: "App Router",
    description: "서버와 클라이언트 컴포넌트를 목적에 맞게 나눌 준비가 됐습니다.",
  },
  {
    title: "Typed data flow",
    description: "TanStack Query, React Hook Form, Zod 기반의 타입 안전한 확장 지점입니다.",
  },
  {
    title: "Quality gates",
    description: "Lint, 타입 검사, 단위 테스트, E2E와 운영 빌드를 같은 흐름으로 검증합니다.",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="border-b border-line/80 bg-surface/80 backdrop-blur">
        <Container className="flex min-h-16 items-center justify-between gap-4">
          <a
            className="rounded-sm text-sm font-semibold tracking-[0.08em] text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
            href="#top"
          >
            YM · PF
          </a>
          <StatusPill>Foundation ready</StatusPill>
        </Container>
      </header>

      <main id="top">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)] lg:items-center lg:py-32">
          <section aria-labelledby="hero-title" className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold tracking-[0.14em] text-accent uppercase">
              Portfolio Hub · Phase 0
            </p>
            <h1
              className="text-balance text-4xl leading-[1.08] font-semibold tracking-[-0.045em] text-ink sm:text-6xl"
              id="hero-title"
            >
              경험을 읽기 쉬운 이야기로 연결합니다.
            </h1>
            <p className="mt-7 max-w-2xl text-pretty text-base leading-8 text-muted sm:text-lg">
              Portfolio Hub는 프로젝트의 문제, 선택, 구현과 검증을 한 흐름으로
              보여주기 위한 서비스입니다. 지금은 다음 기능을 안정적으로 쌓을
              프론트엔드 기반을 준비했습니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href="#foundation"
              >
                기반 구성 확인
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-surface px-6 text-sm font-semibold text-ink transition-colors hover:border-accent/40 hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                href="https://github.com/yoonmo01/YM_PF"
                rel="noreferrer"
                target="_blank"
              >
                GitHub 저장소
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </a>
            </div>
          </section>

          <aside
            aria-label="프론트엔드 상태"
            className="relative rounded-3xl border border-line bg-surface p-6 shadow-[0_24px_80px_-48px_rgba(18,32,51,0.45)] sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
                  Service status
                </p>
                <p className="mt-2 font-semibold text-ink">Frontend foundation</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-full bg-teal-50" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-teal-600 shadow-[0_0_0_5px_rgba(13,148,136,0.12)]" />
              </span>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Runtime</dt>
                <dd className="font-medium text-ink">Next.js · React</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Language</dt>
                <dd className="font-medium text-ink">TypeScript</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Interface</dt>
                <dd className="font-medium text-ink">Responsive · Accessible</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Scope</dt>
                <dd className="font-medium text-ink">Foundation only</dd>
              </div>
            </dl>
          </aside>
        </Container>

        <section className="border-y border-line bg-surface/75" id="foundation">
          <Container className="py-14 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">
                Built to grow
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
                작은 기반부터 검증 가능하게
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {foundationItems.map((item, index) => (
                <article
                  className="rounded-2xl border border-line bg-canvas/60 p-6"
                  key={item.title}
                >
                  <span className="text-xs font-semibold text-accent">
                    0{index + 1}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <footer>
        <Container className="flex flex-col gap-2 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Portfolio Hub</p>
          <p>Phase 0 · 프로젝트 기반</p>
        </Container>
      </footer>
    </div>
  );
}
