describe("Next.js API rewrite", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("proxies same-origin API paths to the configured backend", async () => {
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
});
