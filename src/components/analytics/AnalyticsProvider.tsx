"use client";

import { useEffect } from "react";

import { initGA4, GA4_MEASUREMENT_ID } from "@/lib/analytics/ga4";
import { initMetaPixel, META_PIXEL_ID } from "@/lib/analytics/meta-pixel";

/**
 * AnalyticsProvider — initializes GA4 + Meta Pixel after consent.
 *
 * On mount, checks localStorage for consent. If consent given AND
 * IDs are configured, loads the analytics scripts. If no consent,
 * scripts are never loaded (privacy-first).
 *
 * Renders nothing — just runs the init effect.
 */

const CONSENT_KEY = "aura-analytics-consent";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const consent = window.localStorage.getItem(CONSENT_KEY);
      if (consent !== "accepted") return;

      window.__analyticsConsent = true;

      if (GA4_MEASUREMENT_ID) {
        initGA4(GA4_MEASUREMENT_ID);
      }
      if (META_PIXEL_ID) {
        initMetaPixel(META_PIXEL_ID);
      }
    } catch {
      // localStorage unavailable — fail quietly, no analytics
    }
  }, []);

  return <>{children}</>;
}

export default AnalyticsProvider;
