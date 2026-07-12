import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithQueryClient } from "@/test/render-with-query-client";

import { LogoutButton } from "./logout-button";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("./api", () => ({ logout: mocks.logout }));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears the cached identity and returns to login after logout", async () => {
    mocks.logout.mockResolvedValue(undefined);
    const { queryClient } = renderWithQueryClient(<LogoutButton />);
    queryClient.setQueryData(["auth", "me"], {
      id: "user-1",
      email: "admin@example.com",
      role: "ADMIN",
    });

    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/admin/login");
    });
    expect(queryClient.getQueryData(["auth", "me"])).toBeUndefined();
  });
});
