import { sentryNextjs } from "@sentry/nextjs";

const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: 0.1,

  debug: false,
};

export default sentryNextjs.init(sentryConfig);
