import type { Metadata } from "next";
import type { ReactNode } from "react";

import { LocaleHtml } from "./locale-html";

export const metadata: Metadata = { title: { default: "Yoonmo Yang | AI Agent · Backend Engineer", template: "%s | Yoonmo Yang" }, description: "AI agent research and backend engineering portfolio by Yoonmo Yang." };

export default function EnglishLayout({ children }: { children: ReactNode }) { return <><LocaleHtml />{children}</>; }
