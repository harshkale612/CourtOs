"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { initials } from "@/lib/utils/format";
import { ROLES } from "@/lib/constants/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ basePath = "/app" }: { basePath?: string }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none ring-brand transition focus-visible:ring-2">
        <Avatar className="size-9">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar className="size-9">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="truncate text-xs text-ink-tertiary">{ROLES[user.role].label}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {basePath === "/app" && (
          <DropdownMenuItem asChild>
            <Link href="/app/profile">
              <Icon name="user" /> Profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`${basePath}/settings`}>
            <Icon name="settings" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-danger focus:text-danger">
          <Icon name="log-out" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
