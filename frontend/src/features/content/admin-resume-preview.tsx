/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { contentApi, mediaUrl } from "./api";
import { AdminPage } from "./admin-page";
import { ErrorState, LoadingState } from "./query-state";

export function AdminResumePreview({ id }: { id: string }) {
  const query = useQuery({ queryKey: ["admin", "resume", id], queryFn: () => contentApi.resume(id) });
  return <AdminPage eyebrow="Preview" title="이력서 미리보기" actions={<Link className="rounded-lg border border-line px-4 py-2 text-sm font-semibold" href={`/admin/resumes/${id}`}>편집</Link>}>
    {query.isPending && <LoadingState />}{query.isError && <ErrorState retry={() => query.refetch()} />}{query.data && <article className="mx-auto max-w-[800px] bg-white p-8 shadow-lg sm:p-12 print:shadow-none"><header className="border-b border-line pb-7">{query.data.profileMediaUrl && <img alt="이력서 프로필" className="mb-5 size-24 rounded-full object-cover" height={96} src={mediaUrl(query.data.profileMediaUrl)} width={96} />}<h2 className="text-3xl font-semibold">{query.data.positionName}</h2><p className="mt-2 text-lg text-muted">{query.data.companyName}</p><p className="mt-5 whitespace-pre-wrap leading-7">{query.data.customSummary}</p></header><Section title="기술"><p className="leading-7">{query.data.skills.map((item) => item.name).join(" · ") || "선택된 기술 없음"}</p></Section><Section title="경력">{query.data.experiences.map((item) => <div className="mb-5" key={item.id}><h4 className="font-semibold">{item.organization} · {item.title}</h4><p className="mt-1 text-xs text-muted">{item.startDate} — {item.current ? "현재" : item.endDate}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{item.description}</p></div>)}</Section><Section title="프로젝트">{query.data.projects.map((item) => <div className="mb-5" key={item.id}><h4 className="font-semibold">{item.title}</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{item.summary}</p>{item.results && <p className="mt-2 text-sm text-muted">성과 · {item.results}</p>}</div>)}</Section>{query.data.pdfUrl && <p className="mt-8 border-t border-line pt-5 text-sm"><a className="font-semibold text-accent-strong underline" href={mediaUrl(query.data.pdfUrl)} rel="noreferrer" target="_blank">생성된 PDF 열기</a></p>}</article>}
  </AdminPage>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-8"><h3 className="mb-4 text-lg font-semibold">{title}</h3>{children}</section>; }
