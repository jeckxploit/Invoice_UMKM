import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in-memory - for production use Redis)
const requestStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
};

/**
 * Rate limiting middleware
 * Limits requests per IP address to prevent abuse
 */
function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const now = Date.now();
  const windowMs = RATE_LIMIT_CONFIG.windowMs;
  const maxRequests = RATE_LIMIT_CONFIG.maxRequests;
  
  const stored = requestStore.get(ip);
  
  if (!stored || now > stored.resetTime) {
    // Reset window
    requestStore.set(ip, { count: 1, resetTime: now + windowMs });
    return null;
  }
  
  if (stored.count >= maxRequests) {
    // Rate limit exceeded
    return new NextResponse(
      JSON.stringify({ 
        error: 'Terlalu banyak permintaan', 
        message: 'Silakan coba lagi nanti',
        retryAfter: Math.ceil((stored.resetTime - now) / 1000) 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((stored.resetTime - now) / 1000)),
        },
      }
    );
  }
  
  // Increment count
  stored.count++;
  requestStore.set(ip, stored);
  return null;
}

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  return response;
}

/**
 * Main Next.js proxy function
 * Runs on every request
 */
export function proxy(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/robots.txt'
  ) {
    return undefined;
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Let the response continue
  const response = NextResponse.next();

  // Add security headers to all responses
  addSecurityHeaders(response);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, manifest.json, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|uploads|manifest.json|sw.js|robots.txt).*)',
  ],
};
