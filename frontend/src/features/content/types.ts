export type Profile = {
  name: string;
  headline: string;
  shortBio: string;
  longBio: string;
  email: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
};

export type Skill = {
  id: string;
  name: string;
  category: "BACKEND" | "FRONTEND" | "DATABASE" | "INFRASTRUCTURE" | "AI";
  displayOrder: number;
  visible: boolean;
};

export type Experience = {
  id: string;
  organization: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  displayOrder: number;
};

export type Education = {
  id: string;
  institution: string;
  program: string;
  description: string;
  startDate: string;
  endDate: string;
  displayOrder: number;
};

export type Certificate = {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiresDate: string | null;
  credentialUrl: string | null;
  score: string | null;
  displayOrder: number;
};

export type ProjectSkill = Pick<Skill, "name" | "category"> & { id?: string };
export type ProblemSolution = {
  id?: string;
  problem: string;
  cause: string;
  solution: string;
  verification: string;
  displayOrder?: number;
};

export type PublicMedia = { mediaRole: "COVER" | "CONTENT" | "ARCHITECTURE" | "DASHBOARD" | "RESULT"; displayOrder: number; altText: string; caption: string | null; width: number; height: number; url: string };
export type AdminMedia = { id: string; originalName: string; mimeType: string; fileSize: number; width: number | null; height: number | null; altText: string; caption: string | null; url: string; usageCount: number; createdAt: string; updatedAt: string };
export type AdminProjectMedia = PublicMedia & { id: string; mediaId: string; originalName: string };

export type PublicProject = {
  slug: string;
  title: string;
  summary: string;
  role: string | null;
  results: string | null;
  featured: boolean;
  startDate: string | null;
  skills: ProjectSkill[];
  media: PublicMedia[];
};

export type PublicProjectDetail = PublicProject & {
  background: string | null;
  problem: string | null;
  goal: string | null;
  responsibilities: string | null;
  implementation: string | null;
  technicalDecisions: string | null;
  limitations: string | null;
  retrospective: string | null;
  endDate: string | null;
  teamSize: number | null;
  githubUrl: string | null;
  demoUrl: string | null;
  problemSolutions: ProblemSolution[];
};

export type AdminProject = PublicProjectDetail & {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;
  featured: boolean;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Dashboard = {
  publishedProjectCount: number;
  draftProjectCount: number;
  mediaFileCount: number;
  resumeCount: number;
  recentItems: Array<{ type: string; id: string; title: string; updatedAt: string }>;
};

export type ResumeStatus = "DRAFT" | "READY" | "SUBMITTED" | "ARCHIVED";
export type ResumeSummary = { id: string; title: string; companyName: string; positionName: string; deadline: string | null; status: ResumeStatus; hasPdf: boolean; submittedAt: string | null; updatedAt: string };
export type ResumeExperience = { id: string; organization: string; title: string; description: string; startDate: string; endDate: string | null; current: boolean; displayOrder: number };
export type ResumeProject = { id: string; title: string; summary: string; role: string | null; results: string | null; displayOrder: number };
export type ResumeSkill = { id: string; name: string; category: string; displayOrder: number };
export type ResumeDetail = { id: string; title: string; companyName: string; positionName: string; jobPostingUrl: string | null; deadline: string | null; customSummary: string; profileMediaId: string | null; profileMediaUrl: string | null; notes: string | null; status: ResumeStatus; pdfMediaId: string | null; pdfUrl: string | null; submittedAt: string | null; createdAt: string; updatedAt: string; experiences: ResumeExperience[]; projects: ResumeProject[]; skills: ResumeSkill[] };
export type ResumeRequest = { title: string; companyName: string; positionName: string; jobPostingUrl: string | null; deadline: string | null; customSummary: string; profileMediaId: string | null; notes: string | null; experiences: Array<{ experienceId: string; displayOrder: number; customDescription: string | null }>; projects: Array<{ projectId: string; displayOrder: number; customSummary: string | null }>; skills: Array<{ skillId: string; displayOrder: number }> };
