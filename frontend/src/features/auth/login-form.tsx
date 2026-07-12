"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { getCurrentUser, login } from "./api";
import { authQueryKey } from "./queries";
import { safeNextPath } from "./safe-next-path";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해 주세요.")
    .max(254, "이메일은 254자 이하여야 합니다.")
    .email("올바른 이메일 형식을 입력해 주세요."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해 주세요.")
    .max(128, "비밀번호는 128자 이하여야 합니다."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const loginResolver: Resolver<LoginFormValues> = async (values) => {
  const result = loginSchema.safeParse(values);

  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors = result.error.flatten().fieldErrors;
  return {
    values: {},
    errors: {
      ...(errors.email?.[0]
        ? { email: { type: "validation", message: errors.email[0] } }
        : {}),
      ...(errors.password?.[0]
        ? { password: { type: "validation", message: errors.password[0] } }
        : {}),
    },
  };
};

type LoginFormProps = {
  nextPath?: string | null;
};

const GENERAL_LOGIN_ERROR =
  "로그인할 수 없습니다. 이메일과 비밀번호를 확인한 뒤 다시 시도해 주세요.";

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: loginResolver,
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      await login(values);
      return getCurrentUser();
    },
  });

  const isPending = isSubmitting || loginMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");

    try {
      const user = await loginMutation.mutateAsync(values);
      queryClient.setQueryData(authQueryKey, user);
      router.replace(safeNextPath(nextPath));
    } catch {
      setError("root", { type: "server", message: GENERAL_LOGIN_ERROR });
    }
  });

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-semibold text-ink" htmlFor="email">
          이메일
        </label>
        <input
          {...register("email")}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={errors.email ? "true" : "false"}
          autoCapitalize="none"
          autoComplete="username"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink outline-none transition focus:border-accent focus:ring-3 focus:ring-accent/15"
          id="email"
          inputMode="email"
          type="email"
        />
        {errors.email?.message ? (
          <p className="mt-2 text-sm text-red-700" id="email-error">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink" htmlFor="password">
          비밀번호
        </label>
        <input
          {...register("password")}
          aria-describedby={errors.password ? "password-error" : undefined}
          aria-invalid={errors.password ? "true" : "false"}
          autoComplete="current-password"
          className="mt-2 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink outline-none transition focus:border-accent focus:ring-3 focus:ring-accent/15"
          id="password"
          type="password"
        />
        {errors.password?.message ? (
          <p className="mt-2 text-sm text-red-700" id="password-error">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errors.root?.message ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "로그인 확인 중…" : "관리자 로그인"}
      </button>
    </form>
  );
}
