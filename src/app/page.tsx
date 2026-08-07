import { redirect } from "next/navigation";

/**
 * Root page — redirects to default Arabic locale.
 * Includes HTTP redirect + Meta Refresh fallback for Netlify & static hosts.
 */
export default function RootPage() {
  redirect("/ar");

  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0;url=/ar" />
        <title>WebTaky — Redirecting...</title>
      </head>
      <body style={{ backgroundColor: "#0F172A", color: "#ffffff", fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", margin: 0 }}>
        <p>Redirecting to <a href="/ar" style={{ color: "#D4AF37" }}>/ar</a>...</p>
      </body>
    </html>
  );
}
