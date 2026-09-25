import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Providers } from "../providers";

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return <Providers>{children}</Providers>;
}
