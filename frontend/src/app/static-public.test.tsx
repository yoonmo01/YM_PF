import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import AboutPage from "./about/page";
import ContactPage from "./contact/page";
import HomePage from "./page";
import ProjectDetailPage, { generateMetadata, generateStaticParams } from "./projects/[slug]/page";
import ProjectsPage from "./projects/page";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));

it("renders the public pages from local content without a public API request", async () => {
  const fetchMock = vi.fn(() => Promise.reject(new Error("Public API unavailable")));
  vi.stubGlobal("fetch", fetchMock);

  const { unmount } = render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: "양윤모" })).toBeInTheDocument();
  expect(within(screen.getByRole("region", { name: "Projects" })).getAllByRole("heading", { level: 3 }).map(({ textContent }) => textContent)).toEqual([
    "VishBox v2", "판결문 번역·검수 시스템", "AUTH",
  ]);
  expect(screen.queryByRole("link", { name: "관리자" })).not.toBeInTheDocument();
  unmount();

  render(<ProjectsPage />);
  for (const [slug, title] of [
    ["vishbox-v2", "VishBox v2"], ["legal-translation-review", "판결문 번역·검수 시스템"],
    ["public-audit-ai-viewer", "공공 감사 데이터 AI 분류·조회 시스템"], ["auth-security-audit", "AUTH"],
    ["vishbox", "VishBox v1"], ["polystep", "POLYSTEP"],
  ]) {
    expect(screen.getByRole("link", { name: title })).toHaveAttribute("href", `/projects/${slug}`);
  }
  expect(fetchMock).not.toHaveBeenCalled();
});

it("shows research, education, awards, and the verified publication on the about page", () => {
  const { unmount } = render(<AboutPage />);
  expect(screen.getByText(/업무의 병목을 찾아/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "연구 활동" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "학력" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "수상" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /VishBox v2: A Multi-Agent System/ })).toHaveAttribute("href", "https://aclanthology.org/2026.acl-industry.145/");
  expect(screen.queryByRole("img", { name: /양윤모/ })).not.toBeInTheDocument();
  unmount();

  render(<ContactPage />);
  expect(screen.getByRole("link", { name: /coolalex127@gmail.com/ })).toHaveAttribute("href", "mailto:coolalex127@gmail.com");
});

it("shows project evidence previews from verified screens and architecture", () => {
  render(<ProjectsPage />);
  expect(screen.getByRole("img", { name: "VishBox v2의 Multi-Agent 시스템 구조" })).toBeInTheDocument();
  expect(screen.getByText("PDF 추출 → 문맥 생성 → 번역")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "공공 감사 결과 조회 서비스의 검색 조건 화면" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "AUTH 증거 수집부터 에이전트 분석과 소명까지의 시스템 흐름" })).toBeInTheDocument();
  expect(screen.getByText("공개 감사 결과 약 1만 5천 건 구축")).toBeInTheDocument();
  expect(screen.getByText("VM 모의 시나리오 3/3 일치 · Agent 분석 8분 → 2~3분 (측정)")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "POLYSTEP 정책 검색 서비스 첫 화면" })).toBeInTheDocument();
});

it("pre-renders six detail paths with distinct metadata and returns 404 for unknown slugs", async () => {
  const paths = await generateStaticParams();
  expect(paths.map(({ slug }) => slug)).toEqual([
    "vishbox-v2", "legal-translation-review", "public-audit-ai-viewer", "auth-security-audit", "vishbox", "polystep",
  ]);
  for (const { slug } of paths) {
    const props = { params: Promise.resolve({ slug }) };
    const metadata = await generateMetadata(props);
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    const view = render(await ProjectDetailPage(props));
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    view.unmount();
  }
  await expect(ProjectDetailPage({ params: Promise.resolve({ slug: "missing" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
});
