import { RoleGate } from "@/components/auth/role-gate";
import { AppShell } from "@/components/shell/app-shell";
import { PORTAL_NAV } from "@/lib/constants/nav";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="member">
      <AppShell sections={PORTAL_NAV} basePath="/app" variant="portal">
        {children}
      </AppShell>
    </RoleGate>
  );
}
