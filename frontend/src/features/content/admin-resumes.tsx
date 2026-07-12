"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { contentApi, mediaUrl } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";

export function AdminResumes() {
  const client = useQueryClient(); const router = useRouter(); const query = useQuery({ queryKey: ["admin", "resumes"], queryFn: contentApi.resumes });
  const copy = useMutation({ mutationFn: contentApi.copyResume, onSuccess: (data) => { client.invalidateQueries({ queryKey: ["admin", "resumes"] }); router.push(`/admin/resumes/${data.id}`); } });
  const state = useMutation({ mutationFn: ({ id, action }: { id: string; action: "ready" | "submit" | "archive" }) => contentApi.resumeState(id, action), onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "resumes"] }) });
  const pdf = useMutation({ mutationFn: contentApi.generateResumePdf, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "resumes"] }) });
  const remove = useMutation({ mutationFn: contentApi.removeResume, onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "resumes"] }) });
  return <AdminPage title="회사별 이력서" description="지원처마다 강조할 경력·프로젝트·기술을 선택하고 PDF를 생성합니다." actions={<Link className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white" href="/admin/resumes/new">이력서 추가</Link>}>
    {query.isPending && <LoadingState />}{query.isError && <ErrorState retry={() => query.refetch()} />}
    {query.data && <div className="overflow-hidden rounded-2xl border border-line bg-surface"><ul className="divide-y divide-line">{query.data.map((resume) => <li className="p-5" key={resume.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold">{resume.title}</h2><span className="rounded-full bg-canvas px-2 py-1 text-xs font-semibold text-muted">{resume.status}</span></div><p className="mt-2 text-sm text-muted">{resume.companyName} · {resume.positionName}{resume.deadline && ` · 마감 ${resume.deadline}`}</p></div><div className="flex flex-wrap gap-2"><Link className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" href={`/admin/resumes/${resume.id}`}>수정</Link><Link className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" href={`/admin/resumes/${resume.id}/preview`}>미리보기</Link><button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => copy.mutate(resume.id)} type="button">복제</button>{resume.status === "DRAFT" && <button className="rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700" onClick={() => state.mutate({ id: resume.id, action: "ready" })} type="button">준비 완료</button>}{resume.status !== "ARCHIVED" && <button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => pdf.mutate(resume.id)} type="button">PDF 생성</button>}{resume.status === "READY" && resume.hasPdf && <button className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white" onClick={() => state.mutate({ id: resume.id, action: "submit" })} type="button">제출 처리</button>}{resume.status !== "ARCHIVED" && <button className="rounded-lg border border-line px-3 py-2 text-sm font-semibold" onClick={() => state.mutate({ id: resume.id, action: "archive" })} type="button">보관</button>}<button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700" onClick={() => { if (window.confirm("이력서를 삭제하시겠습니까?")) remove.mutate(resume.id); }} type="button">삭제</button></div></div></li>)}</ul>{query.data.length === 0 && <p className="p-8 text-sm text-muted">작성된 이력서가 없습니다.</p>}</div>}
    {(copy.error || state.error || pdf.error || remove.error) && <p className="mt-4 text-sm text-red-700" role="alert">요청을 처리하지 못했습니다. 현재 상태와 필수 선택 항목을 확인해 주세요.</p>}
    {pdf.data && <p className="mt-4 text-sm text-green-800" role="status">PDF가 생성되었습니다. <a className="font-semibold underline" href={mediaUrl(pdf.data.url)} rel="noreferrer" target="_blank">{pdf.data.filename} 열기</a></p>}
  </AdminPage>;
}
