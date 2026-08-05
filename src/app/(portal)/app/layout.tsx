import { RoleGate } from "@/components/auth/role-gate";
import { AppShell } from "@/components/shell/app-shell";
import { PORTAL_NAV } from "@/lib/constants/nav";
import { CartSheet } from "@/features/shop/cart-sheet";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate role="member">
      <AppShell sections={PORTAL_NAV} basePath="/app" variant="portal">
        {children}
      </AppShell>
      {/* Mounted shell-wide so "add to cart" works from the shop AND a booking. */}
      <CartSheet />
    </RoleGate>
  );
}
