import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { portfolio } from "@/content/public-portfolio";

export const metadata: Metadata = {
  title: {
    default: `${portfolio.profile.name} | AI Agent · Backend Engineer`,
    template: `%s | ${portfolio.profile.name}`,
  },
  description: portfolio.profile.shortBio,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        {children}
      </body>
    </html>
  );
}
