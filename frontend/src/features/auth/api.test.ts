describe("auth API client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("keeps browser API requests on the frontend origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({ id: "user-1", email: "admin@example.com", role: "ADMIN" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getCurrentUser } = await import("./api");

    await getCurrentUser();

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/auth/me");
  });

  it("uses credentialed cookies and an in-memory CSRF token without browser storage", async () => {
    const storageSet = vi.spyOn(Storage.prototype, "setItem");
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ token: "csrf-token", headerName: "X-XSRF-TOKEN" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const { login } = await import("./api");

    await login({ email: "admin@example.com", password: "password" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const csrfInit = fetchMock.mock.calls[0]?.[1];
    const loginInit = fetchMock.mock.calls[1]?.[1];
    expect(csrfInit?.credentials).toBe("include");
    expect(loginInit?.credentials).toBe("include");
    expect(new Headers(loginInit?.headers).get("X-XSRF-TOKEN")).toBe("csrf-token");
    expect(storageSet).not.toHaveBeenCalled();
  });

  it("shares one refresh request and retries each unauthorized request once", async () => {
    let meCalls = 0;
    let refreshCalls = 0;
    let csrfCalls = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);

      if (url.endsWith("/api/auth/me")) {
        meCalls += 1;
        if (meCalls <= 2) {
          return new Response(
            JSON.stringify({ code: "UNAUTHORIZED", message: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({ id: `user-${meCalls}`, email: "admin@example.com", role: "ADMIN" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/auth/csrf")) {
        csrfCalls += 1;
        return new Response(
          JSON.stringify({ token: "refresh-csrf", headerName: "X-XSRF-TOKEN" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/auth/refresh") && init?.method === "POST") {
        refreshCalls += 1;
        expect(new Headers(init.headers).get("X-XSRF-TOKEN")).toBe("refresh-csrf");
        return new Response(null, { status: 204 });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getCurrentUser } = await import("./api");

    const users = await Promise.all([getCurrentUser(), getCurrentUser()]);

    expect(users).toEqual([
      { id: "user-3", email: "admin@example.com", role: "ADMIN" },
      { id: "user-4", email: "admin@example.com", role: "ADMIN" },
    ]);
    expect(meCalls).toBe(4);
    expect(refreshCalls).toBe(1);
    expect(csrfCalls).toBe(1);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.credentials).toBe("include");
    }
  });

  it("does not enter a refresh loop when the retried request is still unauthorized", async () => {
    let meCalls = 0;
    let refreshCalls = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);

      if (url.endsWith("/api/auth/me")) {
        meCalls += 1;
        return new Response(
          JSON.stringify({ code: "UNAUTHORIZED", message: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.endsWith("/api/auth/csrf")) {
        return new Response(
          JSON.stringify({ token: "csrf-token", headerName: "X-XSRF-TOKEN" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.endsWith("/api/auth/refresh")) {
        refreshCalls += 1;
        return new Response(null, { status: 204 });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { getCurrentUser } = await import("./api");

    await expect(getCurrentUser()).rejects.toEqual(
      expect.objectContaining({ status: 401 }),
    );
    expect(meCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it("refreshes the CSRF token and retries a mutation once after CSRF_INVALID", async () => {
    let csrfCalls = 0;
    let profileCalls = 0;
    const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
      const url = String(input);

      if (url.endsWith("/api/auth/csrf")) {
        csrfCalls += 1;
        return new Response(
          JSON.stringify({
            token: csrfCalls === 1 ? "stale-csrf" : "fresh-csrf",
            headerName: "X-XSRF-TOKEN",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/admin/profile") && init?.method === "PUT") {
        profileCalls += 1;
        const csrfHeader = new Headers(init.headers).get("X-XSRF-TOKEN");

        if (profileCalls === 1) {
          expect(csrfHeader).toBe("stale-csrf");
          return new Response(
            JSON.stringify({ code: "CSRF_INVALID", message: "Invalid CSRF token" }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          );
        }

        expect(csrfHeader).toBe("fresh-csrf");
        return new Response(JSON.stringify({ name: "Updated profile" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const { apiJson } = await import("./api");

    const profile = await apiJson<{ name: string }>("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated profile" }),
    });

    expect(profile).toEqual({ name: "Updated profile" });
    expect(csrfCalls).toBe(2);
    expect(profileCalls).toBe(2);
  });

  it("sends logout with cookies and CSRF protection", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ token: "logout-csrf", headerName: "X-XSRF-TOKEN" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const { logout } = await import("./api");

    await logout();

    const [logoutUrl, logoutInit] = fetchMock.mock.calls[1] ?? [];
    expect(logoutUrl).toBe("/api/auth/logout");
    expect(logoutInit?.method).toBe("POST");
    expect(logoutInit?.credentials).toBe("include");
    expect(new Headers(logoutInit?.headers).get("X-XSRF-TOKEN")).toBe("logout-csrf");
  });
});
