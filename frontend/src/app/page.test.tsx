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
    expect(screen.getByRole("img", { name: "VishBox v2의 Multi-Agent 시스템 구조" })).toBeInTheDocument();
    const projects = screen.getByRole("heading", { name: "대표 프로젝트" });
    const awards = screen.getByRole("heading", { name: "수상" });
    const activity = screen.getByRole("heading", { name: "연구 활동·학력" });
    expect(projects.compareDocumentPosition(awards) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(awards.compareDocumentPosition(activity) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("2026년 1학기 SW캡스톤디자인 경진대회 동상")).toBeInTheDocument();
    expect(screen.getByText("한림대학교 지능형 의사결정시스템 연구실")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "주 메뉴" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "관리자" })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
