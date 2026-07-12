import { screen, waitFor } from "@testing-library/react";

import { renderWithQueryClient } from "@/test/render-with-query-client";

import { ApiError } from "./api";
import { AuthGate } from "./auth-gate";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  pathname: "/admin/resumes",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("./queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./queries")>();
  const { useQuery } = await import("@tanstack/react-query");
  return {
    ...actual,
    useCurrentUser: () =>
      useQuery({
        queryKey: actual.authQueryKey,
        queryFn: mocks.getCurrentUser,
        retry: false,
      }),
  };
});

describe("AuthGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render protected content before authentication is confirmed", async () => {
    let resolveUser: ((value: { id: string; email: string; role: string }) => void) | undefined;
    mocks.getCurrentUser.mockReturnValue(
      new Promise((resolve) => {
        resolveUser = resolve;
      }),
    );

    renderWithQueryClient(
      <AuthGate>
        <p>비공개 이력서</p>
      </AuthGate>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("관리자 권한을 확인하고 있습니다.");
    expect(screen.queryByText("비공개 이력서")).not.toBeInTheDocument();

    resolveUser?.({ id: "user-1", email: "admin@example.com", role: "ADMIN" });
    expect(await screen.findByText("비공개 이력서")).toBeInTheDocument();
  });

  it("redirects a 401 response to login and keeps protected content hidden", async () => {
    mocks.getCurrentUser.mockRejectedValue(
      new ApiError({ status: 401, code: "UNAUTHORIZED", message: "secret backend detail" }),
    );

    renderWithQueryClient(
      <AuthGate>
        <p>비공개 관리자 콘텐츠</p>
      </AuthGate>,
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        "/admin/login?next=%2Fadmin%2Fresumes",
      );
    });
    expect(screen.queryByText("비공개 관리자 콘텐츠")).not.toBeInTheDocument();
    expect(screen.queryByText("secret backend detail")).not.toBeInTheDocument();
  });

  it("does not render admin content for an authenticated non-admin role", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "user-2",
      email: "viewer@example.com",
      role: "VIEWER",
    });

    renderWithQueryClient(
      <AuthGate>
        <p>관리자 전용 설정</p>
      </AuthGate>,
    );

    expect(
      await screen.findByRole("heading", { name: "관리자 접근 권한이 없습니다." }),
    ).toBeInTheDocument();
    expect(screen.queryByText("관리자 전용 설정")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
