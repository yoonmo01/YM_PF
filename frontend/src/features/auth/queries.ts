"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "./api";

export const authQueryKey = ["auth", "me"] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    refetchOnMount: "always",
    staleTime: 30_000,
  });
}
