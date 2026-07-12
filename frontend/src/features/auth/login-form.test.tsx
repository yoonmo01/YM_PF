import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithQueryClient } from "@/test/render-with-query-client";

import { LoginForm } from "./login-form";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("./api", () => ({
  getCurrentUser: mocks.getCurrentUser,
  login: mocks.login,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates email and password before sending credentials", async () => {
    renderWithQueryClient(<LoginForm />);

    fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: "관리자 로그인" }));

    expect(await screen.findByText("올바른 이메일 형식을 입력해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("caches the authenticated user and redirects to a safe next page", async () => {
    const user = { id: "user-1", email: "admin@example.com", role: "ADMIN" };
    mocks.login.mockResolvedValue(undefined);
    mocks.getCurrentUser.mockResolvedValue(user);
    const { queryClient } = renderWithQueryClient(
      <LoginForm nextPath="/admin/projects?status=DRAFT" />,
    );

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: " admin@example.com " },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "correct-horse-battery-staple" },
    });
    fireEvent.click(screen.getByRole("button", { name: "관리자 로그인" }));

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/admin/projects?status=DRAFT");
    });
    expect(mocks.login).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "correct-horse-battery-staple",
    });
    expect(queryClient.getQueryData(["auth", "me"])).toEqual(user);
  });

  it("does not reveal a server authentication error", async () => {
    mocks.login.mockRejectedValue(new Error("admin@example.com does not exist"));
    renderWithQueryClient(<LoginForm />);

    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "관리자 로그인" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "로그인할 수 없습니다. 이메일과 비밀번호를 확인한 뒤 다시 시도해 주세요.",
    );
    expect(screen.queryByText(/does not exist/)).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
