import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import Home from "./page";

describe("Home", () => {
  it("renders the local portfolio without requesting the public API", () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    renderWithQueryClient(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "양윤모" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "VishBox v2" })).toHaveAttribute("href", "/projects/vishbox-v2");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/yoonmo01");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/yoonmo-yang/");
    expect(screen.queryByRole("link", { name: "프로젝트 보기" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "VishBox v2의 Multi-Agent 시스템 구조" })).toBeInTheDocument();
    const experience = screen.getByRole("heading", { name: "Experience" });
    const awards = screen.getByRole("heading", { name: "Awards" });
    const papers = screen.getByRole("heading", { name: "Papers" });
    const projects = screen.getByRole("heading", { name: "Projects" });
    const skills = screen.getByRole("heading", { name: "Skills" });
    for (const [first, next] of [[experience, awards], [awards, papers], [papers, projects], [projects, skills]]) {
      expect(first.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(screen.getByText("2026년 1학기 SW캡스톤디자인 경진대회 동상")).toBeInTheDocument();
    expect(screen.getByText("한림대학교 지능형 의사결정시스템 연구실")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "주 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^KO/ })).toHaveAttribute("href", "/en");
    expect(screen.queryByRole("link", { name: "관리자" })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
