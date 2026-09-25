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
  expect(screen.getByRole("heading", { level: 1, name: /AI Agent의 판단/ })).toBeInTheDocument();
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

it("omits empty public sections and shows confirmed contact details", () => {
  const { unmount } = render(<AboutPage />);
  expect(screen.getByText(/AI가 내놓은 답을 사용자가/)).toBeInTheDocument();
  for (const title of ["경력", "학력·교육", "논문", "수상"]) {
    expect(screen.queryByRole("heading", { name: title })).not.toBeInTheDocument();
  }
  unmount();

  render(<ContactPage />);
  expect(screen.getByRole("link", { name: /coolalex127@gmail.com/ })).toHaveAttribute("href", "mailto:coolalex127@gmail.com");
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
