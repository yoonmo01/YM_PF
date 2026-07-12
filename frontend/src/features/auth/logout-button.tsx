"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "./api";
import { authQueryKey } from "./queries";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const logoutMutation = useMutation({ mutationFn: logout });

  async function handleLogout() {
    setErrorMessage(null);

    try {
      await logoutMutation.mutateAsync();
      queryClient.removeQueries({ queryKey: authQueryKey });
      router.replace("/admin/login");
    } catch {
      setErrorMessage("로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <div>
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-accent/50 hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
        disabled={logoutMutation.isPending}
        onClick={() => void handleLogout()}
        type="button"
      >
        {logoutMutation.isPending ? "로그아웃 중…" : "로그아웃"}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-xs leading-5 text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
