"use client";

import { useQuery } from "@tanstack/react-query";
import { contentApi } from "./api";
import { ErrorState, LoadingState } from "./query-state";

export function ContactContent() {
  const query = useQuery({ queryKey: ["public", "profile"], queryFn: contentApi.publicProfile });
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => query.refetch()} />;
  return <div className="max-w-2xl"><p className="text-sm font-semibold text-accent">Contact</p><h1 className="mt-3 text-4xl font-semibold">함께 이야기해요.</h1><p className="mt-5 leading-8 text-muted">채용, 협업 또는 프로젝트에 관해 아래 채널로 연락해 주세요.</p><div className="mt-8 grid gap-3">{query.data?.email && <a className="rounded-xl border border-line bg-surface p-5 font-semibold hover:border-accent" href={`mailto:${query.data.email}`}>이메일 · {query.data.email}</a>}{query.data?.githubUrl && <a className="rounded-xl border border-line bg-surface p-5 font-semibold hover:border-accent" href={query.data.githubUrl} rel="noreferrer" target="_blank">GitHub</a>}{query.data?.linkedinUrl && <a className="rounded-xl border border-line bg-surface p-5 font-semibold hover:border-accent" href={query.data.linkedinUrl} rel="noreferrer" target="_blank">LinkedIn</a>}</div></div>;
}
