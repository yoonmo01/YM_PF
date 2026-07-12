import { type ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { AuthGate } from "@/features/auth/auth-gate";

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
