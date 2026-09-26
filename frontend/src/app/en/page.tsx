import type { Metadata } from "next";
import { HomeContent } from "../page";

export const metadata: Metadata = { title: { absolute: "Yoonmo Yang | AX Engineer · AI Agent · Backend Engineer" }, description: "AX engineering, multi-agent research, and backend services by Yoonmo Yang." };

export default function EnglishHomePage() { return <HomeContent locale="en" />; }
