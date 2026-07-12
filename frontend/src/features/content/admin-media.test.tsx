import { fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { AdminMediaManager } from "./admin-media";

describe("AdminMediaManager", () => {
  it("rejects unsupported files in the browser before upload", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/admin/projects")) return json({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 });
      if (url.includes("/api/admin/media")) return json([]);
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderWithQueryClient(<AdminMediaManager />);
    await screen.findByText("업로드된 파일이 없습니다.");

    const input = screen.getByLabelText("파일");
    const file = new File(["not an image"], "bad.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    fireEvent.change(input);
    fireEvent.change(screen.getByLabelText("대체 텍스트"), { target: { value: "테스트 이미지" } });
    fireEvent.submit(screen.getByRole("button", { name: "업로드" }).closest("form")!);

    expect(await screen.findByRole("alert")).toHaveTextContent("PNG 또는 JPEG 파일만 업로드할 수 있습니다.");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});

function json(body: unknown) { return Promise.resolve(new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } })); }
