import { fireEvent, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { AdminResumeEditor } from "./admin-resume-editor";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("AdminResumeEditor", () => {
  it("keeps the chosen skill order in the create request", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input); const method = init?.method ?? "GET";
      if (url.includes("/api/admin/experiences")) return json([{ id: "exp-1", organization: "Example", title: "Engineer", description: "경력", startDate: "2024-01-01", endDate: null, current: true, displayOrder: 0 }]);
      if (url.includes("/api/admin/projects")) return json({ content: [{ id: "project-1", title: "Project", summary: "요약", skills: [], media: [] }], page: 0, size: 100, totalElements: 1, totalPages: 1 });
      if (url.includes("/api/admin/skills")) return json([{ id: "skill-1", name: "Java", category: "BACKEND", displayOrder: 0, visible: true }, { id: "skill-2", name: "PostgreSQL", category: "DATABASE", displayOrder: 1, visible: true }]);
      if (url.includes("/api/admin/media")) return json([]);
      if (url.includes("/api/auth/csrf")) return json({ token: "csrf-token", headerName: "X-XSRF-TOKEN" });
      if (url.endsWith("/api/admin/resumes") && method === "POST") return json({ id: "resume-1" }, 201);
      throw new Error(`Unexpected request: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    renderWithQueryClient(<AdminResumeEditor id={null} />);
    await screen.findByRole("heading", { name: "이력서 추가" });

    fill("이력서 제목", "Example 지원"); fill("회사명", "Example Corp"); fill("포지션명", "Backend Engineer");
    fireEvent.change(screen.getByLabelText("맞춤 요약"), { target: { value: "맞춤 요약" } });
    fireEvent.click(screen.getByLabelText("Example · Engineer")); fireEvent.click(screen.getByLabelText("Project"));
    fireEvent.click(screen.getByLabelText("Java · BACKEND")); fireEvent.click(screen.getByLabelText("PostgreSQL · DATABASE"));
    fireEvent.click(screen.getByRole("button", { name: "PostgreSQL · DATABASE 위로" }));
    fireEvent.submit(screen.getByRole("button", { name: "이력서 저장" }).closest("form")!);

    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => String(url).endsWith("/api/admin/resumes") && (init as RequestInit)?.method === "POST")).toBe(true));
    const call = fetchMock.mock.calls.find(([url, init]) => String(url).endsWith("/api/admin/resumes") && (init as RequestInit)?.method === "POST")!;
    const body = JSON.parse(String((call[1] as RequestInit).body));
    expect(body.skills).toEqual([{ skillId: "skill-2", displayOrder: 0 }, { skillId: "skill-1", displayOrder: 1 }]);
  });
});

function fill(label: string, value: string) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }
function json(body: unknown, status = 200) { return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })); }
