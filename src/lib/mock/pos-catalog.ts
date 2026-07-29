import type { ProductCategory, ProductStatus, Sport } from "@/types";

/**
 * Curated, realistic Canadian pro-shop catalog (CAD, pre-tax).
 * Pure data — no imports from the mock DB — so it can seed `data.ts` without
 * any circular dependency. SKUs & barcodes are derived deterministically in
 * data.ts. `low` = lowStockThreshold; omit `track` for stock-tracked goods.
 */
export interface ProductSpec {
  name: string;
  category: ProductCategory;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  low: number;
  emoji: string;
  sport?: Sport;
  /** Override the default 0.13 HST (e.g. 0 for zero-rated fresh food). */
  taxRate?: number;
  /** Services (coaching/passes) don't deplete stock. */
  track?: boolean;
  status?: ProductStatus;
}

export const PRODUCT_SPECS: ProductSpec[] = [
  /* ---- Beverages ---- */
  { name: "Gatorade Cool Blue", category: "beverages", price: 3.75, cost: 1.6, stock: 48, low: 12, emoji: "🥤", description: "600 mL sports drink" },
  { name: "Red Bull Energy 250 mL", category: "beverages", price: 4.5, cost: 2.1, stock: 36, low: 12, emoji: "⚡", description: "Single can" },
  { name: "Smartwater 600 mL", category: "beverages", price: 3.25, cost: 1.1, stock: 60, low: 15, emoji: "💧" },
  { name: "Cold Brew Coffee", category: "beverages", price: 4.25, cost: 1.75, stock: 24, low: 8, emoji: "☕", description: "House cold brew, 355 mL" },
  { name: "Bubly Sparkling Water", category: "beverages", price: 2.75, cost: 0.9, stock: 40, low: 12, emoji: "🫧" },
  { name: "Nestea Iced Tea", category: "beverages", price: 3.5, cost: 1.3, stock: 30, low: 10, emoji: "🧊" },
  { name: "Vanilla Protein Shake", category: "beverages", price: 5.5, cost: 2.8, stock: 18, low: 8, emoji: "🥛", description: "30 g protein" },

  /* ---- Snacks ---- */
  { name: "KIND Dark Chocolate Bar", category: "snacks", price: 3.25, cost: 1.4, stock: 44, low: 12, emoji: "🍫" },
  { name: "Miss Vickie's Chips", category: "snacks", price: 2.5, cost: 0.85, stock: 52, low: 15, emoji: "🥔", description: "Sea Salt & Vinegar" },
  { name: "Clif Energy Bar", category: "snacks", price: 3.75, cost: 1.6, stock: 33, low: 10, emoji: "🍫" },
  { name: "Trail Mix (100 g)", category: "snacks", price: 4.25, cost: 1.9, stock: 20, low: 8, emoji: "🥜" },
  { name: "Fresh Banana", category: "snacks", price: 1.25, cost: 0.35, stock: 40, low: 10, emoji: "🍌", taxRate: 0 },
  { name: "Pretzel Twists", category: "snacks", price: 2.75, cost: 0.95, stock: 28, low: 10, emoji: "🥨" },

  /* ---- Equipment ---- */
  { name: "Wilson US Open Balls (3-can)", category: "equipment", price: 8.99, cost: 4.5, stock: 60, low: 18, emoji: "🎾", sport: "tennis" },
  { name: "Yonex Shuttlecocks (tube of 6)", category: "equipment", price: 22.0, cost: 12.0, stock: 25, low: 10, emoji: "🏸", sport: "badminton" },
  { name: "Tourna Overgrip (3-pack)", category: "equipment", price: 9.5, cost: 3.75, stock: 40, low: 12, emoji: "🎾" },
  { name: "Babolat Boost Racquet", category: "equipment", price: 129.0, cost: 78.0, stock: 8, low: 4, emoji: "🎾", sport: "tennis", description: "Strung, grip 3" },
  { name: "Dunlop Squash Balls (2-pack)", category: "equipment", price: 7.5, cost: 3.2, stock: 30, low: 10, emoji: "⚫", sport: "squash" },
  { name: "Franklin Pickleballs (4-pack)", category: "equipment", price: 14.0, cost: 6.5, stock: 22, low: 8, emoji: "🟡", sport: "pickleball" },
  { name: "Gamma Grip Tape", category: "equipment", price: 5.25, cost: 2.0, stock: 3, low: 8, emoji: "🎾" },
  { name: "Head Padel Balls (can of 3)", category: "equipment", price: 9.0, cost: 4.0, stock: 18, low: 8, emoji: "🎾", sport: "padel" },

  /* ---- Apparel ---- */
  { name: "Baseline Performance Tee", category: "apparel", price: 34.0, cost: 14.0, stock: 26, low: 8, emoji: "👕", description: "Moisture-wicking, unisex" },
  { name: "Baseline Club Hoodie", category: "apparel", price: 68.0, cost: 30.0, stock: 14, low: 6, emoji: "🧥" },
  { name: "Court Socks (2-pack)", category: "apparel", price: 16.0, cost: 6.0, stock: 48, low: 12, emoji: "🧦" },
  { name: "Athletic Shorts", category: "apparel", price: 42.0, cost: 18.0, stock: 20, low: 8, emoji: "🩳" },
  { name: "Sweatband Set", category: "apparel", price: 12.0, cost: 4.5, stock: 2, low: 6, emoji: "💪", description: "Headband + 2 wristbands" },

  /* ---- Merch ---- */
  { name: "Baseline Water Bottle", category: "merch", price: 24.0, cost: 9.0, stock: 30, low: 10, emoji: "🍶", description: "Insulated 750 mL" },
  { name: "Baseline Club Cap", category: "merch", price: 28.0, cost: 11.0, stock: 22, low: 8, emoji: "🧢" },
  { name: "Baseline Tote Bag", category: "merch", price: 18.0, cost: 6.5, stock: 16, low: 6, emoji: "👜" },
  { name: "Enamel Pin", category: "merch", price: 8.0, cost: 2.5, stock: 40, low: 12, emoji: "📌" },
  { name: "Sticker Pack", category: "merch", price: 6.0, cost: 1.5, stock: 0, low: 10, emoji: "✨", status: "out_of_stock" },

  /* ---- Coaching (services — no stock) ---- */
  { name: "Private Lesson (1 hr)", category: "coaching", price: 85.0, stock: 0, low: 0, emoji: "🎾", track: false, description: "One-on-one with a certified pro" },
  { name: "5-Session Coaching Pack", category: "coaching", price: 380.0, stock: 0, low: 0, emoji: "🎓", track: false, description: "Save vs. drop-in rate" },
  { name: "Junior Clinic (Drop-in)", category: "coaching", price: 35.0, stock: 0, low: 0, emoji: "🧒", track: false },

  /* ---- Guest passes (services — no stock) ---- */
  { name: "Guest Day Pass", category: "passes", price: 20.0, stock: 0, low: 0, emoji: "🎟️", track: false, description: "Full-day facility access" },
  { name: "Guest Pass 5-Pack", category: "passes", price: 85.0, stock: 0, low: 0, emoji: "🎫", track: false },
];
