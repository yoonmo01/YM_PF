"use client";

import { useQuery } from "@tanstack/react-query";
import { contentApi } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";

export function AdminDashboard() {
  const query = useQuery({ queryKey: ["admin", "dashboard"], queryFn: contentApi.dashboard });
  return <AdminPage eyebrow="Dashboard" title="콘텐츠 현황" description="공개 상태와 최근 변경 사항을 한눈에 확인합니다.">
    {query.isPending && <LoadingState />}{query.isError && <ErrorState retry={() => query.refetch()} />}
    {query.data && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
      ["공개 프로젝트", query.data.publishedProjectCount], ["초안 프로젝트", query.data.draftProjectCount], ["미디어", query.data.mediaFileCount], ["이력서", query.data.resumeCount],
    ].map(([label, value]) => <article className="rounded-2xl border border-line bg-surface p-6 shadow-sm" key={label}><p className="text-sm text-muted">{label}</p><p className="mt-4 text-3xl font-semibold">{value}</p></article>)}</div>
    <section className="mt-8 rounded-2xl border border-line bg-surface p-6"><h2 className="text-lg font-semibold">최근 변경</h2>{query.data.recentItems.length ? <ul className="mt-4 divide-y divide-line">{query.data.recentItems.map((item) => <li className="flex justify-between gap-4 py-3 text-sm" key={`${item.type}-${item.id}`}><span>{item.title}</span><time className="text-muted">{new Date(item.updatedAt).toLocaleDateString("ko-KR")}</time></li>)}</ul> : <p className="mt-4 text-sm text-muted">최근 변경된 콘텐츠가 없습니다.</p>}</section></>}
  </AdminPage>;
}
