# 🚀 InvoiceUMKM - Production Setup Guide

## ✅ COMPLETED FEATURES

### 1. 🔒 SECURITY HARDENING

#### Security Headers (next.config.ts)
```typescript
- X-DNS-Prefetch-Control: on
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-XSS-Protection: 1; mode=block
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Content-Security-Policy: Full CSP configured
```

#### API Rate Limiting
- **Location**: `src/middleware/rate-limit.ts`
- **Limits**:
  - General API: 30 requests/minute
  - Auth endpoints: 5 requests/15 minutes
  - Invoice creation: 10 requests/minute
- **Storage**: In-memory (upgrade to Redis for production)

---

### 2. 🐛 ERROR MONITORING (Sentry)

#### Installed Packages
```bash
bun add @sentry/nextjs
```

#### Configuration Files
- `sentry.client.config.ts` - Browser error tracking
- `sentry.server.config.ts` - Server error tracking
- `sentry.edge.config.ts` - Edge runtime tracking

#### Features
- ✅ Automatic error capture
- ✅ Performance monitoring (10% sampling)
- ✅ Session replay
- ✅ Profiling
- ✅ Source maps upload
- ✅ Prisma integration

#### Setup Steps
1. Create account at https://sentry.io
2. Create new project (Next.js)
3. Copy DSN to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@o0.ingest.sentry.io/0"
   ```

---

### 3. 📊 ANALYTICS (PostHog)

#### Installed Packages
```bash
bun add posthog-js posthog-node
```

#### Configuration
- `src/components/AnalyticsProvider.tsx`

#### Features Tracked
- ✅ Page views
- ✅ Page leave
- ✅ Auto capture (clicks, forms)
- ✅ Session recording
- ✅ Rage clicks
- ✅ Custom events

#### Setup Steps
1. Create account at https://app.posthog.com
2. Create new project
3. Copy keys to `.env.local`:
   ```
   NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxx"
   NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
   ```

#### Key Metrics to Track
```typescript
// Invoice created
posthog.capture('invoice_created', {
  userId,
  plan,
  itemCount,
  total
});

// Plan upgraded
posthog.capture('plan_upgraded', {
  userId,
  fromPlan,
  toPlan,
  price
});

// PWA installed
posthog.capture('pwa_installed', {
  userId,
  platform
});
```

---

### 4. 🗄️ DATABASE OPTIMIZATION

#### Prisma Schema Indexes
```prisma
model User {
  email     String   @unique @index
  createdAt DateTime @default(now()) @index
  plan      Plan     @default(FREE) @@index([plan])
}

model Invoice {
  userId        String   @index
  invoiceNumber String   @unique @index
  customerName  String   @index
  customerEmail String?  @index
  total         Float    @index
  status        String   @default("pending") @index
  createdAt     DateTime @default(now()) @index
  
  // Composite indexes
  @@index([userId, createdAt])
  @@index([userId, status])
  @@index([status, createdAt])
  @@index([isPro, createdAt])
}
```

#### Apply Migration
```bash
bun run db:migrate
```

#### Performance Impact
- **Before**: O(n) full table scans
- **After**: O(log n) indexed lookups
- **Expected**: 100x faster queries at 10k records

---

### 5. 💰 SUBSCRIPTION GATE

#### Implementation
- **Location**: `src/lib/subscription.ts`

#### Plan Limits
| Feature | FREE | PRO |
|---------|------|-----|
| Invoices | 20/month | Unlimited |
| Logos | 1 | 10 |
| QRIS | ❌ | ✅ |
| Custom Theme | ❌ | ✅ |
| No Watermark | ❌ | ✅ |
| Priority Support | ❌ | ✅ |
| Users | 1 | 1 |

#### Usage in API Routes
```typescript
import { checkSubscriptionGate } from "@/lib/subscription";

const { allowed, reason } = checkSubscriptionGate(
  user.plan,
  user.invoiceCount
);

if (!allowed) {
  return NextResponse.json(
    { error: reason },
    { status: 403 }
  );
}
```

---

## 📁 ENVIRONMENT VARIABLES

Create `.env.local`:
```bash
# Database
DATABASE_URL="file:./dev.db"

# Sentry
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@o0.ingest.sentry.io/0"

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="phc_xxxxxxxxxx"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🏗️ BUILD & DEPLOY

### Development
```bash
bun run dev
```

### Production Build
```bash
bun run build
```

### Production Start
```bash
bun run start:prod
```

---

## 📊 MONITORING DASHBOARD

### Sentry Dashboard
1. **Errors**: Real-time error tracking
2. **Performance**: API route latency
3. **Releases**: Version tracking
4. **Cron Monitors**: Scheduled tasks

### PostHog Dashboard
1. **Users**: Active users, retention
2. **Events**: Feature usage
3. **Funnels**: Conversion rates
4. **Session Recording**: User behavior

---

## 🔐 SECURITY CHECKLIST

- [x] Security headers configured
- [x] Rate limiting enabled
- [x] CSP (Content Security Policy) set
- [x] HTTPS enforced (HSTS)
- [x] X-Frame-Options (clickjacking protection)
- [x] X-Content-Type-Options (MIME sniffing)
- [x] Referrer-Policy configured
- [x] Permissions-Policy set

---

## 📈 PERFORMANCE CHECKLIST

- [x] Database indexes added
- [x] Image optimization enabled
- [x] Static generation where possible
- [x] Rate limiting to prevent abuse
- [x] Console logs removed in production
- [x] Package imports optimized
- [x] Compression enabled

---

## 🎯 GROWTH METRICS

### Track These Events
```typescript
// PWA Installation
posthog.capture('pwa_installed')

// Invoice Creation
posthog.capture('invoice_created', { plan, itemCount })

// Upgrade Funnel
posthog.capture('view_pricing')
posthog.capture('start_checkout')
posthog.capture('complete_upgrade')

// Feature Usage
posthog.capture('use_qris')
posthog.capture('download_pdf')
posthog.capture('upload_logo')
```

### Key Metrics
1. **DAU/MAU**: Daily/Monthly Active Users
2. **Conversion Rate**: Free → Pro
3. **Retention**: Week 1, Week 4
4. **PWA Installs**: Total & weekly
5. **Invoice Volume**: Per user per month

---

## 🚨 ALERTS SETUP

### Sentry Alerts
1. Go to Settings → Alerts
2. Create alert for:
   - Error rate > 1%
   - Apdex score < 0.9
   - Fatal errors (instant notification)

### PostHog Alerts
1. Dashboard → Insights
2. Set thresholds for:
   - Drop in active users
   - Drop in conversions
   - Unusual churn rate

---

## 📱 PWA INSTALLATION TRACKING

```typescript
// In PWAProvider.tsx
useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    posthog.capture('pwa_install_prompted');
  });

  window.addEventListener('appinstalled', () => {
    posthog.capture('pwa_installed');
  });
}, []);
```

---

## 🔄 NEXT STEPS

### Phase 1: Launch (Week 1)
- [ ] Setup Sentry production project
- [ ] Setup PostHog cloud
- [ ] Configure environment variables
- [ ] Test all error flows
- [ ] Verify analytics events

### Phase 2: Growth (Week 2-4)
- [ ] A/B test pricing page
- [ ] Optimize conversion funnel
- [ ] Add email notifications
- [ ] Implement referral system

### Phase 3: Scale (Month 2+)
- [ ] Migrate to PostgreSQL
- [ ] Add Redis for rate limiting
- [ ] Implement caching layer
- [ ] Add CDN for static assets

---

## 📞 SUPPORT

### Sentry Support
- Docs: https://docs.sentry.io
- Discord: https://discord.gg/sentry

### PostHog Support
- Docs: https://posthog.com/docs
- Slack: https://posthog.com/slack

### Prisma Support
- Docs: https://www.prisma.io/docs
- Slack: https://prisma.io/slack

---

**Last Updated**: February 2026  
**Version**: 2.0.0 (Production Ready)
