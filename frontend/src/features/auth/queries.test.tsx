import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";

import { authQueryKey, useCurrentUser } from "./queries";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("./api", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

describe("useCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates a fresh cached identity when the admin area mounts again", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    queryClient.setQueryData(authQueryKey, {
      id: "cached-user",
      email: "cached@example.com",
      role: "ADMIN",
    });
    mocks.getCurrentUser.mockResolvedValue({
      id: "current-user",
      email: "current@example.com",
      role: "ADMIN",
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCurrentUser(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual({
        id: "current-user",
        email: "current@example.com",
        role: "ADMIN",
      });
    });
  });
});
