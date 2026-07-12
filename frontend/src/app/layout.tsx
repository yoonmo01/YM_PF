import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Portfolio Hub",
    template: "%s | Portfolio Hub",
  },
  description: "프로젝트와 경력을 명확하게 보여주는 개인 포트폴리오 허브",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
