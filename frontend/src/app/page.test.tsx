import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import Home from "./page";

describe("Home", () => {
  it("renders the public portfolio and an explicit empty project state", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    renderWithQueryClient(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "문제를 구조화하고, 검증 가능한 제품으로 만듭니다." })).toBeInTheDocument();
    expect(await screen.findByText("공개된 프로젝트가 아직 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "주 메뉴" })).toBeInTheDocument();
  });
});
