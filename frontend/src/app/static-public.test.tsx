import { render, screen } from "@testing-library/react";
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
  expect(screen.getAllByRole("link", { name: /VishBox v2|판결문 번역|공공 감사|AUTH/ })).toHaveLength(4);
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
  expect(screen.getByText(/AI가 내놓은 답을 사용자가/)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "연구 활동" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "학력" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "수상" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /VishBox v2: A Multi-Agent System/ })).toHaveAttribute("href", "https://aclanthology.org/2026.acl-industry.145/");
  expect(screen.queryByRole("img", { name: /양윤모/ })).not.toBeInTheDocument();
  unmount();

  render(<ContactPage />);
  expect(screen.getByRole("link", { name: /coolalex127@gmail.com/ })).toHaveAttribute("href", "mailto:coolalex127@gmail.com");
});

it("shows project evidence previews without invented screenshots", () => {
  render(<ProjectsPage />);
  expect(screen.getByRole("img", { name: "VishBox v2의 Multi-Agent 시스템 구조" })).toBeInTheDocument();
  expect(screen.getByText("PDF 추출 → 문맥 생성 → 번역")).toBeInTheDocument();
  expect(screen.getByText("약 1만 5천 건")).toBeInTheDocument();
  expect(screen.getByText("가상환경 모의 시나리오 예상 위험 등급 일치")).toBeInTheDocument();
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
