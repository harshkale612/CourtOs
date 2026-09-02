import { cubicBezier } from "framer-motion";

/** The app's signature decelerate curve (--e-out in globals.css), shared by every hero scroll transform. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Same curve as a function, for `useTransform`'s `ease` option (which needs a callable, not a bezier tuple). */
export const EASE_OUT_FN = cubicBezier(...EASE_OUT);
