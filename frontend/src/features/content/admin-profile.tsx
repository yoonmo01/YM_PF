"use client";

import { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";

const fields = [["name", "이름", "text"], ["headline", "헤드라인", "text"], ["shortBio", "짧은 소개", "textarea"], ["longBio", "상세 소개", "textarea"], ["email", "공개 이메일", "email"], ["githubUrl", "GitHub URL(HTTPS)", "url"], ["linkedinUrl", "LinkedIn URL(HTTPS)", "url"]] as const;

export function AdminProfile() {
  const client = useQueryClient(); const query = useQuery({ queryKey: ["admin", "profile"], queryFn: contentApi.profile });
  const save = useMutation({ mutationFn: contentApi.updateProfile, onSuccess: (data) => client.setQueryData(["admin", "profile"], data) });
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); save.mutate({ name: String(data.get("name")), headline: String(data.get("headline")), shortBio: String(data.get("shortBio")), longBio: String(data.get("longBio")), email: String(data.get("email")), githubUrl: String(data.get("githubUrl")) || null, linkedinUrl: String(data.get("linkedinUrl")) || null }); }
  return <AdminPage title="프로필" description="공개 홈과 소개, 연락 화면에 표시되는 기본 정보입니다.">{query.isPending && <LoadingState />}{query.isError && <ErrorState retry={() => query.refetch()} />}{!query.isPending && !query.isError && <form className="rounded-2xl border border-line bg-surface p-6" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2">{fields.map(([name, label, type]) => <label className={type === "textarea" ? "sm:col-span-2" : ""} key={name}><span className="mb-2 block text-sm font-semibold">{label}</span>{type === "textarea" ? <textarea className="min-h-28 w-full rounded-lg border border-line p-3 text-sm" defaultValue={query.data?.[name] ?? ""} name={name} required /> : <input className="min-h-11 w-full rounded-lg border border-line px-3 text-sm" defaultValue={query.data?.[name] ?? ""} name={name} required={!name.endsWith("Url")} type={type} />}</label>)}</div>{save.isError && <p className="mt-4 text-sm text-red-700" role="alert">저장하지 못했습니다. 입력값을 확인해 주세요.</p>}<button className="mt-6 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={save.isPending} type="submit">{save.isPending ? "저장 중…" : "프로필 저장"}</button></form>}</AdminPage>;
}
