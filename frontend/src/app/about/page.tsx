import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { AboutContent } from "@/features/content/about-content";

export const metadata: Metadata = { title: "소개" };
export default function AboutPage() { return <PublicShell><Container className="py-16"><AboutContent /></Container></PublicShell>; }
