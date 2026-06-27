import type { Role } from "@/types";

export interface RoleConfig {
  id: Role;
  label: string;
  description: string;
  /** Default landing route after auth for this role. */
  home: string;
}

export const ROLES: Record<Role, RoleConfig> = {
  owner: {
    id: "owner",
    label: "Club Owner",
    description: "Full control of the club, billing, and team.",
    home: "/admin",
  },
  admin: {
    id: "admin",
    label: "Administrator",
    description: "Manage courts, reservations, members, and events.",
    home: "/admin",
  },
  coach: {
    id: "coach",
    label: "Coach",
    description: "Manage your sessions, clinics, and availability.",
    home: "/admin",
  },
  member: {
    id: "member",
    label: "Member",
    description: "Book courts, join events, and manage your membership.",
    home: "/app",
  },
};

export const ROLE_LIST: RoleConfig[] = Object.values(ROLES);

/** Roles that may access the admin dashboard. */
export const ADMIN_ROLES: Role[] = ["owner", "admin", "coach"];
