describe("content API URLs", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("keeps media requests on the frontend origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
    const { mediaUrl } = await import("./api");

    expect(mediaUrl("/api/public/media/image-id/content")).toBe(
      "/api/public/media/image-id/content",
    );
  });
});
