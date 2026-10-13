import type { Metadata } from "next";
import PilotForm from "./PilotForm";

export const metadata: Metadata = {
  title: "Join the Free Pilot",
  description:
    "Grant Scout Pro is looking for about 10 pilot users to try the AI grant platform for free and share feedback. Apply in two minutes.",
  alternates: { canonical: "/pilot" },
  openGraph: {
    title: "Join the Grant Scout Pro Free Pilot",
    description: "Try the AI grant platform free and help shape it. Limited to about 10 pilot users.",
    url: "https://www.grantscoutpro.com/pilot",
    siteName: "Grant Scout Pro",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join the Grant Scout Pro Free Pilot",
    description: "Try the AI grant platform free and help shape it. Limited to about 10 pilot users.",
    images: ["/og-image.png"],
  },
};

const perks = [
  { t: "Free access", d: "Use the full platform at no cost while you test it on your real work." },
  { t: "Real influence", d: "Your feedback goes straight to the founder and shapes what gets built next." },
  { t: "Small group", d: "About 10 pilot users, so every voice counts and support is personal." },
];

export default function PilotPage() {
  return (
    <main style={{ background: "#071633", color: "#F4F6F9", minHeight: "100vh", padding: "72px 20px 96px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ color: "#F5C542", fontWeight: 700, letterSpacing: 3, fontSize: 13, textTransform: "uppercase", margin: "0 0 14px" }}>
          Pilot program
        </p>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1.08, fontWeight: 700, color: "#fff", margin: "0 0 18px" }}>
          Try Grant Scout Pro free, and help shape it.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#CBD5E1", margin: "0 0 36px" }}>
          I&apos;m Darryl Barnes, a U.S. Army veteran who runs a veteran-focused nonprofit. I built Grant Scout Pro because
          small teams shouldn&apos;t need a grants department. I&apos;m looking for about 10 pilot users to try it on real
          work and tell me honestly what works and what doesn&apos;t.
        </p>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 40 }}>
          {perks.map((p) => (
            <div key={p.t} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: 18 }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#5FE3FF" }}>{p.t}</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "#CBD5E1" }}>{p.d}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "28px 24px" }}>
          <PilotForm />
        </div>

        <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 20, lineHeight: 1.6 }}>
          We use your answers only to review your application and contact you about the pilot.
          See our <a href="/privacy" style={{ color: "#5FE3FF" }}>privacy policy</a>.
        </p>
      </div>
    </main>
  );
}
