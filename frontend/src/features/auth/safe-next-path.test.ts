import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it.each([
    [null, "/admin"],
    ["//evil.example/admin", "/admin"],
    ["https://evil.example/admin", "/admin"],
    ["/admin/login", "/admin"],
    ["/administrator", "/admin"],
    ["/projects", "/admin"],
    ["/admin/projects?status=DRAFT", "/admin/projects?status=DRAFT"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});
