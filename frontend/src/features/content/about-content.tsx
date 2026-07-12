"use client";

import { useQueries } from "@tanstack/react-query";
import { contentApi } from "./api";
import { ErrorState, LoadingState } from "./query-state";

export function AboutContent() {
  const [profile, experiences, educations, skills, certificates] = useQueries({ queries: [
    { queryKey: ["public", "profile"], queryFn: contentApi.publicProfile },
    { queryKey: ["public", "experiences"], queryFn: contentApi.publicExperiences },
    { queryKey: ["public", "educations"], queryFn: contentApi.publicEducations },
    { queryKey: ["public", "skills"], queryFn: contentApi.publicSkills },
    { queryKey: ["public", "certificates"], queryFn: contentApi.publicCertificates },
  ] });
  if ([profile, experiences, educations, skills, certificates].some((q) => q.isPending)) return <LoadingState />;
  if ([profile, experiences, educations, skills, certificates].some((q) => q.isError)) return <ErrorState />;
  return <div className="max-w-4xl"><p className="text-sm font-semibold text-accent">About</p><h1 className="mt-3 text-4xl font-semibold">{profile.data?.name ?? "소개"}</h1><p className="mt-6 whitespace-pre-wrap text-base leading-8 text-muted">{profile.data?.longBio ?? "소개를 준비하고 있습니다."}</p>
    <Section title="기술"><div className="flex flex-wrap gap-2">{skills.data?.map((item) => <span className="rounded-full border border-line bg-surface px-3 py-2 text-sm" key={item.id}>{item.name}</span>)}</div></Section>
    <Section title="경력">{experiences.data?.map((item) => <Timeline key={item.id} title={`${item.organization} · ${item.title}`} dates={`${item.startDate} — ${item.current ? "현재" : item.endDate}`} description={item.description} />)}</Section>
    <Section title="학력·교육">{educations.data?.map((item) => <Timeline key={item.id} title={`${item.institution} · ${item.program}`} dates={`${item.startDate} — ${item.endDate}`} description={item.description} />)}</Section>
    <Section title="자격증">{certificates.data?.map((item) => <Timeline key={item.id} title={item.name} dates={`${item.issuer} · ${item.issuedDate}`} description={item.score ?? ""} />)}</Section>
  </div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-14"><h2 className="text-2xl font-semibold">{title}</h2><div className="mt-5 space-y-4">{children}</div></section>; }
function Timeline({ title, dates, description }: { title: string; dates: string; description: string }) { return <article className="rounded-2xl border border-line bg-surface p-6"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs text-accent-strong">{dates}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">{description}</p></article>; }
