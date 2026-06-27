import { RoleGate } from "@/components/auth/role-gate";
import { AppShell } from "@/components/shell/app-shell";
import { ADMIN_NAV } from "@/lib/constants/nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="admin">
      <AppShell sections={ADMIN_NAV} basePath="/admin" variant="admin">
        {children}
      </AppShell>
    </RoleGate>
  );
}
