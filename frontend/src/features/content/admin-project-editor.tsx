"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { contentApi } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";
import type { AdminProject, ProblemSolution } from "./types";

const fields = [
  ["title", "제목", true, "text"], ["slug", "슬러그", true, "text"], ["summary", "요약", true, "textarea"],
  ["background", "배경", false, "textarea"], ["problem", "문제", false, "textarea"], ["goal", "목표", false, "textarea"],
  ["role", "역할", false, "text"], ["responsibilities", "담당 업무", false, "textarea"], ["implementation", "핵심 구현", false, "textarea"],
  ["technicalDecisions", "기술적 의사결정", false, "textarea"], ["results", "결과", false, "textarea"], ["limitations", "한계", false, "textarea"], ["retrospective", "회고", false, "textarea"],
] as const;

export function AdminProjectEditor({ id }: { id: string | null }) {
  const project = useQuery({ queryKey: ["admin", "project", id], queryFn: () => contentApi.adminProject(id!), enabled: Boolean(id) });
  const skills = useQuery({ queryKey: ["admin", "skills"], queryFn: () => contentApi.list<{ id: string; name: string }>("skills") });
  if ((id && project.isPending) || skills.isPending) return <AdminPage title="프로젝트 편집"><LoadingState /></AdminPage>;
  if (project.isError || skills.isError) return <AdminPage title="프로젝트 편집"><ErrorState /></AdminPage>;
  return <ProjectForm key={id ?? "new"} id={id} project={project.data ?? null} skills={skills.data ?? []} />;
}

function ProjectForm({ id, project, skills }: { id: string | null; project: AdminProject | null; skills: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemSolution[]>(project?.problemSolutions ?? []);
  const save = useMutation({ mutationFn: (body: unknown) => contentApi.saveProject(id, body), onSuccess: () => router.push("/admin/projects") });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const body: Record<string, unknown> = {};
    fields.forEach(([name]) => { body[name] = String(data.get(name) ?? "") || null; });
    Object.assign(body, { startDate: String(data.get("startDate")) || null, endDate: String(data.get("endDate")) || null, teamSize: data.get("teamSize") ? Number(data.get("teamSize")) : null, githubUrl: String(data.get("githubUrl")) || null, demoUrl: String(data.get("demoUrl")) || null, featured: data.get("featured") === "on", displayOrder: Number(data.get("displayOrder")), skillIds: data.getAll("skillIds").map(String), problemSolutions: problems.map(({ problem, cause, solution, verification }) => ({ problem, cause, solution, verification })) });
    save.mutate(body);
  }
  function updateProblem(index: number, key: keyof ProblemSolution, value: string) { setProblems((items) => items.map((item, i) => i === index ? { ...item, [key]: value } : item)); }
  return <AdminPage title={id ? "프로젝트 수정" : "프로젝트 추가"} description="공개 전에는 초안 상태로 안전하게 저장됩니다."><form className="rounded-2xl border border-line bg-surface p-6" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2">{fields.map(([name, label, required, type]) => <label className={type === "textarea" ? "sm:col-span-2" : ""} key={name}><span className="mb-2 block text-sm font-semibold">{label}</span>{type === "textarea" ? <textarea className="min-h-28 w-full rounded-lg border border-line p-3 text-sm" defaultValue={String(project?.[name] ?? "")} name={name} required={required} /> : <input className="min-h-11 w-full rounded-lg border border-line px-3 text-sm" defaultValue={String(project?.[name] ?? "")} name={name} pattern={name === "slug" ? "[a-z0-9]+(?:-[a-z0-9]+)*" : undefined} required={required} />}</label>)}
      <Input label="시작일" name="startDate" type="date" value={project?.startDate} /><Input label="종료일" name="endDate" type="date" value={project?.endDate} /><Input label="팀 인원" min={1} name="teamSize" type="number" value={project?.teamSize} /><Input label="표시 순서" min={0} name="displayOrder" required type="number" value={project?.displayOrder ?? 0} /><Input label="GitHub URL(HTTPS)" name="githubUrl" type="url" value={project?.githubUrl} /><Input label="Demo URL(HTTPS)" name="demoUrl" type="url" value={project?.demoUrl} />
      <label className="flex items-center gap-3"><input className="size-5 accent-accent" defaultChecked={project?.featured} name="featured" type="checkbox" /><span className="text-sm font-semibold">주요 프로젝트</span></label>
      <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold">사용 기술</legend><div className="mt-3 flex flex-wrap gap-3">{skills.map((skill) => <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm" key={skill.id}><input defaultChecked={project?.skills.some((item) => item.id === skill.id)} name="skillIds" type="checkbox" value={skill.id} />{skill.name}</label>)}</div></fieldset>
    </div>
    <fieldset className="mt-8"><div className="flex items-center justify-between"><legend className="text-lg font-semibold">문제 해결 기록</legend><button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => setProblems((items) => [...items, { problem: "", cause: "", solution: "", verification: "" }])} type="button">기록 추가</button></div><div className="mt-4 grid gap-4">{problems.map((item, index) => <div className="rounded-xl border border-line p-4" key={item.id ?? index}><div className="grid gap-3 sm:grid-cols-2">{(["problem", "cause", "solution", "verification"] as const).map((key) => <label key={key}><span className="mb-1 block text-xs font-semibold">{{ problem: "문제", cause: "원인", solution: "해결", verification: "검증" }[key]}</span><textarea className="min-h-20 w-full rounded-lg border border-line p-2 text-sm" onChange={(e) => updateProblem(index, key, e.target.value)} required value={String(item[key] ?? "")} /></label>)}</div><button className="mt-3 text-sm font-semibold text-red-700" onClick={() => setProblems((items) => items.filter((_, i) => i !== index))} type="button">기록 삭제</button></div>)}</div></fieldset>
    {save.isError && <p className="mt-5 text-sm text-red-700" role="alert">저장하지 못했습니다. 필수값과 URL 형식을 확인해 주세요.</p>}<div className="mt-7 flex gap-3"><button className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={save.isPending} type="submit">{save.isPending ? "저장 중…" : "초안 저장"}</button><button className="rounded-lg border border-line px-5 py-3 text-sm font-semibold" onClick={() => router.push("/admin/projects")} type="button">취소</button></div></form></AdminPage>;
}

function Input({ label, value, ...props }: { label: string; value?: string | number | null } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue">) { return <label><span className="mb-2 block text-sm font-semibold">{label}</span><input {...props} className="min-h-11 w-full rounded-lg border border-line px-3 text-sm" defaultValue={value ?? ""} /></label>; }
