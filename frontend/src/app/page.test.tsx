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

    expect(screen.getByRole("heading", { level: 1, name: "AI Agent의 판단을 검증 가능한 서비스로 연결합니다." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "VishBox v2" })).toHaveAttribute("href", "/projects/vishbox-v2");
    expect(screen.getByRole("navigation", { name: "주 메뉴" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "관리자" })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
