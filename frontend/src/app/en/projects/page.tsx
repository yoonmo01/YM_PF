import type { Metadata } from "next";
import { ProjectsContent } from "../../projects/page";

export const metadata: Metadata = { title: "Projects", description: "Six AI agent, data, and backend engineering case studies by Yoonmo Yang." };

export default function EnglishProjectsPage() { return <ProjectsContent locale="en" />; }
