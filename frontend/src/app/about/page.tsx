import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";

export const metadata: Metadata = { title: "소개", description: portfolio.profile.longBio };
export default function AboutPage() {
  return <PublicShell><Container className="py-12 sm:py-16"><div className="max-w-[48rem]">
    <p className="text-sm font-semibold text-accent">소개</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{portfolio.profile.name}</h1>
    <p className="mt-7 whitespace-pre-wrap text-base leading-8 text-muted">{portfolio.profile.longBio}</p>
    {portfolio.skills.length > 0 && <section className="mt-12 border-t border-line pt-7"><h2 className="text-xl font-semibold">기술</h2><ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{portfolio.skills.map((skill) => <li className="text-sm font-medium text-muted" key={skill}>{skill}</li>)}</ul></section>}
  </div></Container></PublicShell>;
}
