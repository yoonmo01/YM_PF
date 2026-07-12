import type { ReactNode } from "react";

export function AdminPage({ eyebrow = "Content", title, description, actions, children }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><header className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold tracking-[0.12em] text-accent uppercase">{eyebrow}</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{title}</h1>{description && <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p>}</div>{actions}</header><div className="mt-9">{children}</div></div>;
}
