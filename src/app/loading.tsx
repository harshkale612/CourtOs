export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-brand"
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}
