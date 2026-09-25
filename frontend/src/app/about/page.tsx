import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { portfolio } from "@/content/public-portfolio";

export const metadata: Metadata = { title: "소개", description: portfolio.profile.longBio };
export default function AboutPage() {
  return <PublicShell><Container className="py-16"><div className="max-w-4xl">
    <p className="text-sm font-semibold text-accent">About</p>
    <h1 className="mt-3 text-4xl font-semibold">{portfolio.profile.name}</h1>
    <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-muted">{portfolio.profile.longBio}</p>
    {portfolio.skills.length > 0 && <section className="mt-14"><h2 className="text-2xl font-semibold">기술</h2><ul className="mt-5 flex flex-wrap gap-2">{portfolio.skills.map((skill) => <li className="rounded-full border border-line bg-surface px-3 py-2 text-sm" key={skill}>{skill}</li>)}</ul></section>}
  </div></Container></PublicShell>;
}
