import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppChrome } from "@/components/aura/layout/AppChrome";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
  manifest: "/manifest.webmanifest",
  applicationName: "Aura Living",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura Living",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-flash theme script — runs before paint to set data-theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('aura-theme');var m=t?JSON.parse(t).state?.mode:'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');var c=t?JSON.parse(t).state?.contrast:'default';if(c==='high')document.documentElement.setAttribute('data-contrast','high');var f=t?JSON.parse(t).state?.fontSize:'md';if(f!=='md')document.documentElement.setAttribute('data-font-size',f);}catch(e){}})();`,
          }}
        />
        {/* PWA: register service worker for offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){/* silent — offline is progressive enhancement */});});}`,
          }}
        />
      </head>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} antialiased bg-canvas c-ink`}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <QueryProvider>
          <AppChrome>{children}</AppChrome>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
