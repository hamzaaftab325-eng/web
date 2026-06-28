import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aura-living-1.vercel.app"),
  title: {
    default: "Aura Living — Considered Objects for the Considered Home",
    template: "%s",
  },
  description:
    "Aura Living is a premium home décor atelier offering lamps, mirrors, indoor plants, planters, vases, candles, and sculptural objects. Warm minimalism, artisanal craft, lived-in elegance.",
  keywords: [
    "Aura Living",
    "home décor",
    "premium lighting",
    "ceramic planters",
    "decorative objects",
    "wall art",
    "indoor plants",
  ],
  authors: [{ name: "Aura Living" }],
  creator: "Aura Living",
  publisher: "Aura Living",
  openGraph: {
    title: "Aura Living — Considered Objects for the Considered Home",
    description:
      "Warm minimalism for the considered interior. Lamps, mirrors, plants, planters, and sculptural objects.",
    siteName: "Aura Living",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura Living",
    description: "Considered objects for the considered home.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased bg-canvas c-ink`}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
