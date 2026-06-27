/** Navigation config for the portal & admin shells. `icon` = lucide-react key. */

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const PORTAL_NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/app", icon: "layout-dashboard" },
      { label: "Book a Court", href: "/app/booking", icon: "calendar-plus" },
      { label: "Reservations", href: "/app/reservations", icon: "calendar-check" },
      { label: "Events", href: "/app/events", icon: "trophy" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Membership", href: "/app/membership", icon: "badge-check" },
      { label: "Payments", href: "/app/payments", icon: "credit-card" },
      { label: "Notifications", href: "/app/notifications", icon: "bell" },
      { label: "Profile", href: "/app/profile", icon: "user" },
      { label: "Settings", href: "/app/settings", icon: "settings" },
    ],
  },
];

export const ADMIN_NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
      { label: "Reservations", href: "/admin/reservations", icon: "calendar-range" },
      { label: "Courts", href: "/admin/courts", icon: "grid-2x2" },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Members", href: "/admin/members", icon: "users" },
      { label: "Coaches", href: "/admin/coaches", icon: "whistle" },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Plans", href: "/admin/plans", icon: "layers" },
      { label: "Events", href: "/admin/events", icon: "trophy" },
      { label: "Billing", href: "/admin/billing", icon: "receipt" },
      { label: "Analytics", href: "/admin/analytics", icon: "bar-chart-3" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: "settings" }],
  },
];

/** Bottom tab bar (mobile portal). */
export const PORTAL_MOBILE_NAV: NavItem[] = [
  { label: "Home", href: "/app", icon: "home" },
  { label: "Book", href: "/app/booking", icon: "calendar-plus" },
  { label: "Bookings", href: "/app/reservations", icon: "calendar-check" },
  { label: "Events", href: "/app/events", icon: "trophy" },
  { label: "Profile", href: "/app/profile", icon: "user" },
];

export const MARKETING_NAV: NavItem[] = [
  { label: "Features", href: "/features", icon: "sparkles" },
  { label: "Pricing", href: "/pricing", icon: "tag" },
  { label: "Testimonials", href: "/testimonials", icon: "star" },
  { label: "Blog", href: "/blog", icon: "book-open" },
  { label: "Contact", href: "/contact", icon: "mail" },
];
