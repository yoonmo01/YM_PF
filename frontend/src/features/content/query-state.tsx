import type { ReactNode } from "react";

export function LoadingState({ label = "콘텐츠를 불러오는 중입니다." }: { label?: string }) {
  return <p className="rounded-2xl border border-line bg-surface p-8 text-sm text-muted" role="status">{label}</p>;
}

export function ErrorState({ retry }: { retry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-800" role="alert">
      <p>콘텐츠를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      {retry && <button className="mt-4 rounded-lg border border-red-300 px-4 py-2 font-semibold" onClick={retry} type="button">다시 시도</button>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line bg-surface p-8 text-sm text-muted">{children}</p>;
}
