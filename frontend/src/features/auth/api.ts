import type { ApiFieldError, AuthUser } from "./types";

const DEFAULT_CSRF_HEADER = "X-XSRF-TOKEN";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

type CsrfDetails = {
  token: string;
  headerName: string;
};

type ErrorPayload = {
  code?: unknown;
  message?: unknown;
  fieldErrors?: unknown;
};

type RequestOptions = RequestInit & {
  refreshOnUnauthorized?: boolean;
  useCsrf?: boolean;
};

let csrfDetails: CsrfDetails | null = null;
let csrfRequest: Promise<CsrfDetails> | null = null;
let refreshRequest: Promise<void> | null = null;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fieldErrors: ApiFieldError[];

  constructor({
    status,
    code = null,
    message = "요청을 처리하지 못했습니다.",
    fieldErrors = [],
  }: {
    status: number;
    code?: string | null;
    message?: string;
    fieldErrors?: ApiFieldError[];
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function isMutation(method: string | undefined) {
  const normalizedMethod = (method ?? "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(normalizedMethod);
}

async function fetchWithCookies(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
    headers,
  });
}

function normalizeCsrfDetails(payload: unknown): CsrfDetails {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("token" in payload) ||
    typeof payload.token !== "string" ||
    payload.token.length === 0
  ) {
    throw new ApiError({
      status: 0,
      code: "INVALID_CSRF_RESPONSE",
      message: "보안 토큰을 확인하지 못했습니다.",
    });
  }

  const headerName =
    "headerName" in payload && payload.headerName === DEFAULT_CSRF_HEADER
      ? payload.headerName
      : DEFAULT_CSRF_HEADER;

  return { token: payload.token, headerName };
}

async function getCsrfDetails() {
  if (csrfDetails) {
    return csrfDetails;
  }

  if (!csrfRequest) {
    csrfRequest = (async () => {
      const response = await fetchWithCookies("/api/auth/csrf");
      if (!response.ok) {
        throw await toApiError(response);
      }

      const details = normalizeCsrfDetails(await response.json());
      csrfDetails = details;
      return details;
    })().finally(() => {
      csrfRequest = null;
    });
  }

  return csrfRequest;
}

function clearCsrfDetails() {
  csrfDetails = null;
}

async function requestOnce(path: string, options: RequestOptions = {}) {
  const useCsrf = options.useCsrf ?? true;
  const init = { ...options };
  delete init.refreshOnUnauthorized;
  delete init.useCsrf;
  const headers = new Headers(init.headers);

  if (useCsrf && isMutation(init.method)) {
    const details = await getCsrfDetails();
    headers.set(details.headerName, details.token);
  }

  return fetchWithCookies(path, { ...init, headers });
}

async function refreshSession() {
  const response = await requestOnce("/api/auth/refresh", {
    method: "POST",
    refreshOnUnauthorized: false,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }
}

async function refreshSessionSingleFlight() {
  if (!refreshRequest) {
    refreshRequest = refreshSession().finally(() => {
      refreshRequest = null;
    });
  }

  return refreshRequest;
}

async function request(path: string, options: RequestOptions = {}) {
  const { refreshOnUnauthorized = true } = options;
  let response = await requestOnce(path, options);

  if (response.status !== 401 || !refreshOnUnauthorized) {
    return response;
  }

  try {
    await refreshSessionSingleFlight();
  } catch {
    throw await toApiError(response);
  }

  response = await requestOnce(path, {
    ...options,
    refreshOnUnauthorized: false,
  });
  return response;
}

function isApiFieldError(value: unknown): value is ApiFieldError {
  return typeof value === "object" && value !== null;
}

async function toApiError(response: Response) {
  let payload: ErrorPayload = {};

  try {
    payload = (await response.json()) as ErrorPayload;
  } catch {
    // Some infrastructure errors do not provide a JSON body.
  }

  return new ApiError({
    status: response.status,
    code: typeof payload.code === "string" ? payload.code : null,
    message:
      typeof payload.message === "string"
        ? payload.message
        : "요청을 처리하지 못했습니다.",
    fieldErrors: Array.isArray(payload.fieldErrors)
      ? payload.fieldErrors.filter(isApiFieldError)
      : [],
  });
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

async function expectSuccess(response: Response) {
  if (!response.ok) {
    throw await toApiError(response);
  }
}

export async function apiJson<T>(path: string, options: RequestOptions = {}) {
  return parseJson<T>(await request(path, options));
}

export async function apiVoid(path: string, options: RequestOptions = {}) {
  await expectSuccess(await request(path, options));
}

export async function login(credentials: { email: string; password: string }) {
  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    refreshOnUnauthorized: false,
  });

  await expectSuccess(response);
  clearCsrfDetails();
}

export async function getCurrentUser() {
  const response = await request("/api/auth/me");
  return parseJson<AuthUser>(response);
}

export async function logout() {
  const response = await request("/api/auth/logout", {
    method: "POST",
    refreshOnUnauthorized: false,
  });

  await expectSuccess(response);
  clearCsrfDetails();
}
