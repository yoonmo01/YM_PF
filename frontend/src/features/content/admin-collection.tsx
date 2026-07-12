"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ApiError } from "@/features/auth/api";
import { contentApi } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";

type Resource = "experiences" | "educations" | "skills" | "certificates";
type Item = Record<string, unknown> & { id: string };
type Field = { name: string; label: string; type?: "text" | "textarea" | "date" | "number" | "checkbox" | "select" | "url"; required?: boolean; options?: string[] };

const configs: Record<Resource, { title: string; singular: string; summary: (item: Item) => string; fields: Field[] }> = {
  experiences: { title: "경력", singular: "경력", summary: (i) => `${i.organization} · ${i.title}`, fields: [
    { name: "organization", label: "조직", required: true }, { name: "title", label: "직책", required: true }, { name: "description", label: "설명", type: "textarea", required: true }, { name: "startDate", label: "시작일", type: "date", required: true }, { name: "endDate", label: "종료일", type: "date" }, { name: "current", label: "현재 재직", type: "checkbox" }, { name: "displayOrder", label: "표시 순서", type: "number", required: true },
  ] },
  educations: { title: "학력·교육", singular: "학력·교육", summary: (i) => `${i.institution} · ${i.program}`, fields: [
    { name: "institution", label: "기관", required: true }, { name: "program", label: "과정", required: true }, { name: "description", label: "설명", type: "textarea", required: true }, { name: "startDate", label: "시작일", type: "date", required: true }, { name: "endDate", label: "종료일", type: "date", required: true }, { name: "displayOrder", label: "표시 순서", type: "number", required: true },
  ] },
  skills: { title: "기술", singular: "기술", summary: (i) => `${i.name} · ${i.category}`, fields: [
    { name: "name", label: "기술명", required: true }, { name: "category", label: "분류", type: "select", required: true, options: ["BACKEND", "FRONTEND", "DATABASE", "INFRASTRUCTURE", "AI"] }, { name: "displayOrder", label: "표시 순서", type: "number", required: true }, { name: "visible", label: "공개", type: "checkbox" },
  ] },
  certificates: { title: "자격증", singular: "자격증", summary: (i) => `${i.name} · ${i.issuer}`, fields: [
    { name: "name", label: "자격명", required: true }, { name: "issuer", label: "발급기관", required: true }, { name: "issuedDate", label: "취득일", type: "date", required: true }, { name: "expiresDate", label: "만료일", type: "date" }, { name: "credentialUrl", label: "검증 URL(HTTPS)", type: "url" }, { name: "score", label: "점수" }, { name: "displayOrder", label: "표시 순서", type: "number", required: true },
  ] },
};

export function AdminCollection({ resource }: { resource: Resource }) {
  const config = configs[resource];
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Item | null>(null);
  const [adding, setAdding] = useState(false);
  const query = useQuery({ queryKey: ["admin", resource], queryFn: () => contentApi.list<Item>(resource) });
  const save = useMutation({ mutationFn: ({ id, body }: { id?: string; body: unknown }) => id ? contentApi.update<Item>(resource, id, body) : contentApi.create<Item>(resource, body), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["admin", resource] }); setEditing(null); setAdding(false); } });
  const remove = useMutation({ mutationFn: (id: string) => contentApi.remove(resource, id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", resource] }) });

  return <AdminPage title={config.title} actions={<button className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white" onClick={() => { setEditing(null); setAdding(true); }} type="button">{config.singular} 추가</button>}>
    {(adding || editing) && <Editor config={config} item={editing} pending={save.isPending} error={save.error} onCancel={() => { setAdding(false); setEditing(null); }} onSubmit={(body) => save.mutate({ id: editing?.id, body })} />}
    {query.isPending && <LoadingState />}{query.isError && <ErrorState retry={() => query.refetch()} />}
    {query.data && <div className="overflow-hidden rounded-2xl border border-line bg-surface"><ul className="divide-y divide-line">{query.data.map((item) => <li className="flex flex-wrap items-center justify-between gap-4 p-5" key={item.id}><span className="font-semibold">{config.summary(item)}</span><div className="flex gap-2"><button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => { setAdding(false); setEditing(item); }} type="button">수정</button><button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700" disabled={remove.isPending} onClick={() => { if (window.confirm("정말 삭제하시겠습니까?")) remove.mutate(item.id); }} type="button">삭제</button></div></li>)}</ul>{query.data.length === 0 && <p className="p-8 text-sm text-muted">등록된 항목이 없습니다.</p>}</div>}
    {remove.error && <p className="mt-4 text-sm text-red-700" role="alert">{message(remove.error)}</p>}
  </AdminPage>;
}

function Editor({ config, item, pending, error, onCancel, onSubmit }: { config: (typeof configs)[Resource]; item: Item | null; pending: boolean; error: Error | null; onCancel: () => void; onSubmit: (body: Record<string, unknown>) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const body: Record<string, unknown> = {};
    config.fields.forEach((field) => { const value = data.get(field.name); body[field.name] = field.type === "checkbox" ? value === "on" : field.type === "number" ? Number(value) : value === "" ? null : value; }); onSubmit(body);
  }
  return <form className="mb-8 rounded-2xl border border-line bg-surface p-6" onSubmit={submit}><h2 className="text-xl font-semibold">{item ? "항목 수정" : "새 항목"}</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{config.fields.map((field) => <label className={field.type === "textarea" ? "sm:col-span-2" : ""} key={field.name}><span className="mb-2 block text-sm font-semibold">{field.label}</span><Control field={field} value={item?.[field.name]} /></label>)}</div>{error && <p className="mt-4 text-sm text-red-700" role="alert">{message(error)}</p>}<div className="mt-6 flex gap-3"><button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50" disabled={pending} type="submit">{pending ? "저장 중…" : "저장"}</button><button className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold" onClick={onCancel} type="button">취소</button></div></form>;
}

function Control({ field, value }: { field: Field; value: unknown }) {
  const classes = "min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-accent focus:outline-none";
  if (field.type === "textarea") return <textarea className={`${classes} min-h-28 py-3`} defaultValue={String(value ?? "")} name={field.name} required={field.required} />;
  if (field.type === "checkbox") return <input defaultChecked={Boolean(value)} name={field.name} type="checkbox" className="size-5 accent-accent" />;
  if (field.type === "select") return <select className={classes} defaultValue={String(value ?? field.options?.[0] ?? "")} name={field.name}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select>;
  return <input className={classes} defaultValue={String(value ?? (field.type === "number" ? 0 : ""))} min={field.type === "number" ? 0 : undefined} name={field.name} required={field.required} type={field.type ?? "text"} />;
}

function message(error: Error) { return error instanceof ApiError ? error.message : "요청을 처리하지 못했습니다."; }
