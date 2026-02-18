import { sentryNextjs } from "@sentry/nextjs";

const sentryConfig = {
  // For both Client and Server
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1, // 10% sampling rate for production

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable profiling in production
  profilesSampleRate: 0.1,

  // Enable Replay for session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    // HTTP Client Errors
    sentryNextjs.httpClientIntegration({
      failedRequestStatusCodes: [500, 503, 504],
    }),
  ],
};

export default sentryNextjs.init(sentryConfig);
