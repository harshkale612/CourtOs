/** Aggregated mock API surface — import as `import { api } from "@/lib/api"`. */
import { analyticsApi } from "./analytics";
import { authApi } from "./auth";
import { coachesApi } from "./coaches";
import { courtsApi } from "./courts";
import { eventsApi } from "./events";
import { membersApi } from "./members";
import { notificationsApi } from "./notifications";
import { paymentsApi } from "./payments";
import { plansApi } from "./plans";
import { reservationsApi } from "./reservations";

export const api = {
  auth: authApi,
  courts: courtsApi,
  reservations: reservationsApi,
  members: membersApi,
  coaches: coachesApi,
  events: eventsApi,
  plans: plansApi,
  payments: paymentsApi,
  notifications: notificationsApi,
  analytics: analyticsApi,
};

export { ApiError } from "./client";
export type { Kpi, RevenuePoint, HeatCell, SportBreakdown } from "./analytics";
export type { CreateReservationInput } from "./reservations";
