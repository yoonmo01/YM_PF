import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("renders the Phase 0 foundation landing with an accessible status region", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "경험을 읽기 쉬운 이야기로 연결합니다.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Frontend foundation")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "프론트엔드 상태" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기반 구성 확인" })).toHaveAttribute(
      "href",
      "#foundation",
    );
  });
});
