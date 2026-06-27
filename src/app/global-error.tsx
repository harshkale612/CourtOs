"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080B14",
          color: "#F8FAFC",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>A critical error occurred</h1>
          <p style={{ color: "#94A3B8", marginTop: ".5rem" }}>
            Please reload the application.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              height: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: ".75rem",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
