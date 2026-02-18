import { NextRequest, NextResponse } from "next/server";

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // API endpoints rate limits
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  // Auth endpoints (stricter)
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },
  // Invoice creation
  invoice: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 invoices per minute
  },
};

// In-memory store (use Redis in production)
const requestStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime < now) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`;
}

function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: { interval: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = getRateLimitKey(identifier, endpoint);
  const record = requestStore.get(key);

  if (!record || record.resetTime < now) {
    // New window
    requestStore.set(key, {
      count: 1,
      resetTime: now + config.interval,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.interval,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  requestStore.set(key, record);
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

function getEndpointType(path: string): "api" | "auth" | "invoice" | null {
  if (path.includes("/api/auth") || path.includes("/api/login") || path.includes("/api/register")) {
    return "auth";
  }
  if (path.includes("/api/invoices") && path.includes("POST")) {
    return "invoice";
  }
  if (path.startsWith("/api/")) {
    return "api";
  }
  return null;
}

export function rateLimitMiddleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Skip non-API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get identifier (IP address or user ID)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userId = request.headers.get("x-user-id") || searchParams.get("userId");
  const identifier = userId || ip;

  // Determine endpoint type
  const endpointType = getEndpointType(pathname);
  if (!endpointType) {
    return NextResponse.next();
  }

  const config = RATE_LIMIT_CONFIG[endpointType];
  const result = checkRateLimit(identifier, endpointType, config);

  // Add rate limit headers
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", result.resetTime.toString());

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
      },
      {
        status: 429,
        headers,
      }
    );
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}
