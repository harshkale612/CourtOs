"use client";

import { Toaster } from "sonner";

/** Premium glass toasts, themed to the design system. */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "var(--bg-raised)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--sh-3)",
        },
      }}
    />
  );
}
