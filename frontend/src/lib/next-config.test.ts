describe("Next.js API rewrite", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("proxies same-origin API paths to the configured backend", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("API_PROXY_TARGET", "http://backend.test:8080/");
    const { default: nextConfig } = await import("../../next.config");

    const rewrites = await nextConfig.rewrites?.();

    expect(rewrites).toEqual([
      {
        source: "/api/:path*",
        destination: "http://backend.test:8080/api/:path*",
      },
    ]);
  });

  it("does not expose the API proxy in production and keeps security headers", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { default: nextConfig } = await import("../../next.config");

    expect(await nextConfig.rewrites?.()).toEqual([]);
    const headers = await nextConfig.headers?.();
    expect(headers?.[0].headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
    expect(headers?.[0].headers).toContainEqual({ key: "X-Content-Type-Options", value: "nosniff" });
  });
});
