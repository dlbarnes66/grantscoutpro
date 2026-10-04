import type { Metadata } from "next";
import MarketingHomePage from "./(marketing)/page";

export const metadata: Metadata = {
  title: "Grant Scout Pro — The Operating System for Grant Funding",
  description:
    "Search opportunities, write proposals, collaborate with your team, and manage the entire grant lifecycle in a single AI-powered workspace. Federal, state, and foundation grants in one place.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <MarketingHomePage />;
}
