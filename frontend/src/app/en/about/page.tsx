import type { Metadata } from "next";
import { AboutContent } from "../../about/page";

export const metadata: Metadata = { title: "About", description: "Research experience, education, awards, publications, and skills of Yoonmo Yang." };

export default function EnglishAboutPage() { return <AboutContent locale="en" />; }
