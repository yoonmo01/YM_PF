import type { Metadata } from "next";
import { HomeContent } from "../page";

export const metadata: Metadata = { title: { absolute: "Yoonmo Yang | AI Agent · Backend Engineer" }, description: "AI agent research and backend engineering portfolio by Yoonmo Yang." };

export default function EnglishHomePage() { return <HomeContent locale="en" />; }
