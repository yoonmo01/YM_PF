import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PublicShell } from "@/components/layout/public-shell";
import { ContactContent } from "@/features/content/contact-content";

export const metadata: Metadata = { title: "연락" };
export default function ContactPage() { return <PublicShell><Container className="py-16"><ContactContent /></Container></PublicShell>; }
