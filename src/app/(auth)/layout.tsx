/**
 * Auth shell — full-height canvas. Login/Signup/Forgot use the <AuthSplit>
 * brand-panel layout; Onboarding renders its own full-width wizard.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-canvas">{children}</div>;
}
