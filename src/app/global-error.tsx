"use client";

import { useEffect } from "react";

/**
 * app/global-error.tsx — catches errors in the root layout itself.
 * This is the last-resort error boundary. It must render its own <html>
 * and <body> tags since the root layout is what crashed.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#faf7f0",
          fontFamily: "Georgia, serif",
          color: "#1a1714",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: "480px", textAlign: "center", padding: "40px 24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#faf0d4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
            }}
          >
            <span style={{ fontSize: "24px", color: "#b8901f" }} aria-hidden="true" role="img">⚠</span>
            <span className="sr-only">Warning</span>
          </div>

          <p
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#b8901f",
              marginBottom: "16px",
            }}
          >
            Critical Error
          </p>

          <h1 style={{ fontSize: "28px", fontWeight: 400, marginBottom: "16px" }}>
            The site encountered a critical error.
          </h1>

          <p style={{ fontSize: "15px", color: "#6b5d4f", lineHeight: 1.7, marginBottom: "32px" }}>
            An unexpected error occurred. Please try refreshing the page. If the
            problem persists, our concierge team will help you.
          </p>

          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              background: "#1a1714",
              color: "#faf7f0",
              border: "none",
              borderRadius: "2px",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
            }}
          >
            Try Again
          </button>

          {error.digest && (
            <p style={{ fontSize: "11px", color: "#9b8d7a", marginTop: "40px" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
