import { apiJson, apiVoid } from "@/features/auth/api";
import type {
  AdminProject,
  Certificate,
  Dashboard,
  Education,
  Experience,
  PageResponse,
  Profile,
  PublicProject,
  PublicProjectDetail,
  Skill,
  AdminMedia,
  AdminProjectMedia,
} from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
export function mediaUrl(path: string) { return `${API_BASE_URL}${path}`; }

export const contentApi = {
  publicProfile: () => apiJson<Profile | null>("/api/public/profile", { refreshOnUnauthorized: false }),
  publicExperiences: () => apiJson<Experience[]>("/api/public/experiences", { refreshOnUnauthorized: false }),
  publicEducations: () => apiJson<Education[]>("/api/public/educations", { refreshOnUnauthorized: false }),
  publicSkills: () => apiJson<Skill[]>("/api/public/skills", { refreshOnUnauthorized: false }),
  publicCertificates: () => apiJson<Certificate[]>("/api/public/certificates", { refreshOnUnauthorized: false }),
  publicProjects: () => apiJson<PageResponse<PublicProject>>("/api/public/projects?size=100", { refreshOnUnauthorized: false }),
  publicProject: (slug: string) => apiJson<PublicProjectDetail>(`/api/public/projects/${encodeURIComponent(slug)}`, { refreshOnUnauthorized: false }),
  dashboard: () => apiJson<Dashboard>("/api/admin/dashboard"),
  profile: () => apiJson<Profile>("/api/admin/profile"),
  updateProfile: (body: Omit<Profile, never>) => apiJson<Profile>("/api/admin/profile", json("PUT", body)),
  list: <T>(resource: string) => apiJson<T[]>(`/api/admin/${resource}`),
  create: <T>(resource: string, body: unknown) => apiJson<T>(`/api/admin/${resource}`, json("POST", body)),
  update: <T>(resource: string, id: string, body: unknown) => apiJson<T>(`/api/admin/${resource}/${id}`, json("PUT", body)),
  remove: (resource: string, id: string) => apiVoid(`/api/admin/${resource}/${id}`, { method: "DELETE" }),
  adminProjects: () => apiJson<PageResponse<AdminProject>>("/api/admin/projects?size=100"),
  adminProject: (id: string) => apiJson<AdminProject>(`/api/admin/projects/${id}`),
  saveProject: (id: string | null, body: unknown) => apiJson<AdminProject>(id ? `/api/admin/projects/${id}` : "/api/admin/projects", json(id ? "PUT" : "POST", body)),
  projectState: (id: string, state: "publish" | "archive") => apiJson<AdminProject>(`/api/admin/projects/${id}/${state}`, { method: "POST" }),
  removeProject: (id: string) => apiVoid(`/api/admin/projects/${id}`, { method: "DELETE" }),
  media: () => apiJson<AdminMedia[]>("/api/admin/media"),
  uploadMedia: (body: FormData) => apiJson<AdminMedia>("/api/admin/media", { method: "POST", body }),
  updateMedia: (id: string, body: { altText: string; caption: string | null }) => apiJson<AdminMedia>(`/api/admin/media/${id}`, json("PUT", body)),
  removeMedia: (id: string) => apiVoid(`/api/admin/media/${id}`, { method: "DELETE" }),
  projectMedia: (projectId: string) => apiJson<AdminProjectMedia[]>(`/api/admin/projects/${projectId}/media`),
  attachMedia: (projectId: string, body: { mediaId: string; mediaRole: string; displayOrder: number }) => apiJson<AdminProjectMedia>(`/api/admin/projects/${projectId}/media`, json("POST", body)),
  reorderMedia: (projectId: string, items: Array<{ projectMediaId: string; displayOrder: number }>) => apiJson<AdminProjectMedia[]>(`/api/admin/projects/${projectId}/media/order`, json("PUT", { items })),
  detachMedia: (projectId: string, id: string) => apiVoid(`/api/admin/projects/${projectId}/media/${id}`, { method: "DELETE" }),
};

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
