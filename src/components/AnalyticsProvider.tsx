"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize in production
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        rageclick: true,
        session_recording: {
          recordCrossOriginIframes: true,
        },
        // Enable debug mode in development
        debug: process.env.NODE_ENV === "development",
        opt_out_capturing_by_default: false,
        opt_out_persistence_by_default: false,
        persistence: "localStorage+cookie",
      });

      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
