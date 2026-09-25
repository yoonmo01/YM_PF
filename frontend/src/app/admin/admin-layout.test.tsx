import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import AdminLayout from "./layout";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));

it("returns 404 for all admin children in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(() => render(<AdminLayout><div>Private resume</div></AdminLayout>)).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  vi.unstubAllEnvs();
});

it("keeps admin children available during local development", () => {
  vi.stubEnv("NODE_ENV", "development");
  render(<AdminLayout><div>Local admin</div></AdminLayout>);
  expect(screen.getByText("Local admin")).toBeInTheDocument();
  vi.unstubAllEnvs();
});
