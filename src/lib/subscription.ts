import { Plan } from "@prisma/client";
import { FREE_PLAN_LIMIT, PRO_PLAN_LIMIT } from "./plans";

export interface SubscriptionLimits {
  maxInvoices: number;
  maxLogos: number;
  hasQris: boolean;
  hasCustomTheme: boolean;
  hasWatermark: boolean;
  hasPrioritySupport: boolean;
  maxUsers: number;
}

// Use consistent limits from plans.ts
const FREE_INVOICE_LIMIT = FREE_PLAN_LIMIT; // 5 invoices for FREE
const PRO_INVOICE_LIMIT = -1; // Unlimited for PRO

export const SUBSCRIPTION_LIMITS: Record<Plan, SubscriptionLimits> = {
  FREE: {
    maxInvoices: FREE_INVOICE_LIMIT,
    maxLogos: 1,
    hasQris: false,
    hasCustomTheme: false,
    hasWatermark: true,
    hasPrioritySupport: false,
    maxUsers: 1,
  },
  PRO: {
    maxInvoices: PRO_INVOICE_LIMIT, // -1 means unlimited
    maxLogos: 10,
    hasQris: true,
    hasCustomTheme: true,
    hasWatermark: false,
    hasPrioritySupport: true,
    maxUsers: 5,
  },
};

export function checkSubscriptionGate(
  plan: Plan,
  currentInvoiceCount: number
): {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
} {
  const limits = SUBSCRIPTION_LIMITS[plan];

  // Check invoice limit (-1 means unlimited)
  if (limits.maxInvoices > 0 && currentInvoiceCount >= limits.maxInvoices) {
    return {
      allowed: false,
      reason: "Batas invoice tercapai. Upgrade ke Pro untuk invoice unlimited.",
      limit: limits.maxInvoices,
      current: currentInvoiceCount,
    };
  }

  return {
    allowed: true,
  };
}

export function getUpgradePrompt(plan: Plan): string {
  if (plan === "PRO") {
    return "Anda adalah member Pro! Nikmati fitur unlimited.";
  }

  return "Upgrade ke Pro untuk invoice unlimited dan fitur premium.";
}

export function canAccessFeature(
  plan: Plan,
  feature: "qris" | "customTheme" | "noWatermark" | "prioritySupport"
): boolean {
  const limits = SUBSCRIPTION_LIMITS[plan];

  switch (feature) {
    case "qris":
      return limits.hasQris;
    case "customTheme":
      return limits.hasCustomTheme;
    case "noWatermark":
      return !limits.hasWatermark;
    case "prioritySupport":
      return limits.hasPrioritySupport;
    default:
      return false;
  }
}

export function getRemainingInvoices(currentCount: number, plan: Plan): number {
  const limits = SUBSCRIPTION_LIMITS[plan];
  if (limits.maxInvoices < 0) return Infinity;
  return Math.max(0, limits.maxInvoices - currentCount);
}
