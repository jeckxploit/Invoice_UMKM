import { Plan } from "@prisma/client";

export interface SubscriptionLimits {
  maxInvoices: number;
  maxLogos: number;
  hasQris: boolean;
  hasCustomTheme: boolean;
  hasWatermark: boolean;
  hasPrioritySupport: boolean;
  maxUsers: number;
}

export const SUBSCRIPTION_LIMITS: Record<Plan, SubscriptionLimits> = {
  FREE: {
    maxInvoices: 20,
    maxLogos: 1,
    hasQris: false,
    hasCustomTheme: false,
    hasWatermark: true,
    hasPrioritySupport: false,
    maxUsers: 1,
  },
  PRO: {
    maxInvoices: -1, // Unlimited
    maxLogos: 10,
    hasQris: true,
    hasCustomTheme: true,
    hasWatermark: false,
    hasPrioritySupport: true,
    maxUsers: 1,
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

  // Check invoice limit
  if (limits.maxInvoices > 0 && currentInvoiceCount >= limits.maxInvoices) {
    return {
      allowed: false,
      reason: "Invoice limit reached",
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
    return "You're a Pro member! Enjoy unlimited features.";
  }

  return "Upgrade to Pro for unlimited invoices and premium features.";
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
