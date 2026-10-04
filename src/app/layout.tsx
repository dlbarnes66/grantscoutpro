import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import GlobalHomeButton from "@/components/GlobalHomeButton";
import "./globals.css";

const siteUrl = "https://www.grantscoutpro.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Grant Scout Pro — AI-Powered Grant Discovery & Application Platform",
    template: "%s | Grant Scout Pro",
  },
  description:
    "Grant Scout Pro helps nonprofits and organizations discover federal, state, and foundation grants, track deadlines, and prepare complete application packages with AI-assisted drafting — all in one workspace.",
  applicationName: "Grant Scout Pro",
  keywords: [
    "grant discovery software",
    "nonprofit grant management",
    "federal grant search",
    "SF-424 automation",
    "grant application software",
    "foundation grants database",
  ],
  authors: [{ name: "Venture Collective Group, LLC" }],
  creator: "Venture Collective Group, LLC",
  publisher: "Venture Collective Group, LLC",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Grant Scout Pro",
    title: "Grant Scout Pro — AI-Powered Grant Discovery & Application Platform",
    description:
      "Discover federal, state, and foundation grants, track deadlines, and prepare complete application packages with AI-assisted drafting — all in one workspace.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Grant Scout Pro — The operating system for grant funding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grant Scout Pro — AI-Powered Grant Discovery & Application Platform",
    description:
      "Discover federal, state, and foundation grants, track deadlines, and prepare complete application packages with AI-assisted drafting — all in one workspace.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Grant Scout Pro",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "AI-powered platform for discovering federal, state, and foundation grants, tracking deadlines, and preparing complete grant application packages.",
  offers: {
    "@type": "Offer",
    price: "29",
    priceCurrency: "USD",
    url: `${siteUrl}/pricing`,
  },
  provider: {
    "@type": "Organization",
    name: "Venture Collective Group, LLC",
    url: siteUrl,
    logo: `${siteUrl}/brand/icon-512.png`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <GlobalHomeButton />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
