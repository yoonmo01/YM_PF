"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { contentApi } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";

export function AdminProjects() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "projects"], queryFn: contentApi.adminProjects });
  const state = useMutation({ mutationFn: ({ id, action }: { id: string; action: "publish" | "archive" }) => contentApi.projectState(id, action), onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "projects"] }) });
  const remove = useMutation({ mutationFn: contentApi.removeProject, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "projects"] }) });
  return <AdminPage title="프로젝트" description="초안으로 작성한 뒤 검토를 마친 콘텐츠만 공개하세요." actions={<Link className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white" href="/admin/projects/new">프로젝트 추가</Link>}>
    {query.isPending && <LoadingState />}{query.isError && <ErrorState retry={() => query.refetch()} />}
    {query.data && <div className="overflow-hidden rounded-2xl border border-line bg-surface"><ul className="divide-y divide-line">{query.data.content.map((project) => <li className="p-5" key={project.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="font-semibold">{project.title}</h2><span className="rounded-full bg-canvas px-2 py-1 text-xs font-semibold text-muted">{project.status}</span></div><p className="mt-2 max-w-2xl text-sm text-muted">{project.summary}</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" href={`/admin/projects/${project.id}`}>수정</Link>{project.status !== "PUBLISHED" && <button className="rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700" onClick={() => state.mutate({ id: project.id, action: "publish" })} type="button">공개</button>}{project.status !== "ARCHIVED" && <button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => state.mutate({ id: project.id, action: "archive" })} type="button">보관</button>}<button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700" onClick={() => { if (window.confirm("프로젝트를 삭제하시겠습니까?")) remove.mutate(project.id); }} type="button">삭제</button></div></div></li>)}</ul>{query.data.content.length === 0 && <p className="p-8 text-sm text-muted">등록된 프로젝트가 없습니다.</p>}</div>}
    {(state.isError || remove.isError) && <p className="mt-4 text-sm text-red-700" role="alert">상태를 변경하지 못했습니다.</p>}
  </AdminPage>;
}
