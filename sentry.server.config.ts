import { sentryNextjs } from "@sentry/nextjs";

const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production
  tracesSampleRate: 0.1,

  // Enable profiling
  profilesSampleRate: 0.1,

  debug: false,

  integrations: [
    // Prisma integration
    sentryNextjs.prismaIntegration(),
    // HTTP Client Errors
    sentryNextjs.httpClientIntegration({
      failedRequestStatusCodes: [500, 503, 504],
    }),
  ],
};

export default sentryNextjs.init(sentryConfig);
