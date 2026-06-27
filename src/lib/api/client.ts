import type { Paginated } from "@/types";

/**
 * Mock API client. Simulates network latency, occasional failures, and
 * pagination so the UI exercises real loading / error / empty states.
 *
 * Latency uses a seeded-ish jitter from a counter (not Date.now/random) to
 * stay SSR-safe; failures are opt-in per call.
 */

const BASE_LATENCY = 280; // ms
let tick = 0;

function jitter() {
  tick = (tick + 7) % 13;
  return BASE_LATENCY + tick * 18;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve a value after simulated latency. */
export async function ok<T>(value: T, latency = jitter()): Promise<T> {
  await sleep(latency);
  return value;
}

/** Resolve with a chance of failure (for demoing error states). */
export async function maybe<T>(value: T, failRate = 0): Promise<T> {
  await sleep(jitter());
  if (failRate > 0 && tick / 13 < failRate) {
    throw new ApiError(500, "Something went wrong. Please try again.");
  }
  return value;
}

/** Slice an array into a Paginated<T> envelope. */
export function paginate<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

/** Throw a typed not-found. */
export function notFound(entity: string): never {
  throw new ApiError(404, `${entity} not found`);
}
