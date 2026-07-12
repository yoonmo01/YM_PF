const DEFAULT_ADMIN_PATH = "/admin";

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_ADMIN_PATH;
  }

  try {
    const url = new URL(value, "https://portfolio.local");
    const isAdminPath = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    const isLoginPath = url.pathname === "/admin/login";

    if (url.origin !== "https://portfolio.local" || !isAdminPath || isLoginPath) {
      return DEFAULT_ADMIN_PATH;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_ADMIN_PATH;
  }
}
