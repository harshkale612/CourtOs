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
import { posApi } from "./pos";
import { reservationsApi } from "./reservations";
import { shopApi } from "./shop";

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
  pos: posApi,
  shop: shopApi,
};

export { ApiError } from "./client";
export type {
  Kpi,
  FacilitySummary,
  RevenuePoint,
  HeatCell,
  SportBreakdown,
  TypeBreakdown,
  CourtRevenue,
  SectionRevenue,
  UtilPoint,
} from "./analytics";
export type { CreateReservationInput } from "./reservations";
export type {
  PosKpi,
  SalesSummary,
  SalesPoint,
  BestSeller,
  CategoryRevenue,
  InventoryValue,
  CommerceSummary,
  ChannelPoint,
  CreateOrderInput,
  PlaceOrderInput,
  PickupRequest,
} from "./pos";
export type { PlaceShopOrderInput, ReorderResult } from "./shop";
