export const siteConfig = {
  name: "CourtOS",
  tagline: "The premium operating system for racquet clubs.",
  description:
    "CourtOS is the all-in-one platform for tennis, pickleball, padel, badminton, and squash clubs — booking, memberships, events, and analytics, beautifully unified.",
  url: "https://courtos.app",
  email: "hello@courtos.app",
  social: {
    twitter: "https://twitter.com/courtos",
    instagram: "https://instagram.com/courtos",
    linkedin: "https://linkedin.com/company/courtos",
  },
} as const;

export type SiteConfig = typeof siteConfig;
