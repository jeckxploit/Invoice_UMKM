import { Plan } from "@prisma/client";

export const FREE_PLAN_LIMIT = 5;
export const PRO_PLAN_LIMIT = Infinity;

export interface PlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

export const PLAN_FEATURES: PlanFeature[] = [
  { label: "Invoices per month", free: `${FREE_PLAN_LIMIT}`, pro: "Unlimited" },
  { label: "Dashboard analytics", free: "Basic", pro: "Advanced" },
  { label: "PDF export", free: "With watermark", pro: "Clean PDF" },
  { label: "Custom branding", free: false, pro: true },
  { label: "QRIS support", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
];

export const FREE_PLAN = {
  name: "Free Plan",
  price: "Rp 0",
  period: "forever",
  limit: FREE_PLAN_LIMIT,
  features: [
    `${FREE_PLAN_LIMIT} invoices per month`,
    "Basic dashboard",
    "Community support",
    "PDF export with watermark",
  ],
};

export const PRO_PLAN = {
  name: "Pro Plan",
  price: "Rp 29.000",
  period: "per month",
  limit: PRO_PLAN_LIMIT,
  features: [
    "Unlimited invoices",
    "Advanced analytics",
    "Priority support",
    "Clean PDF export",
    "Custom branding",
    "QRIS support",
  ],
};

export function getUserPlanLimits(plan: Plan): { limit: number; isPro: boolean } {
  if (plan === Plan.PRO) {
    return { limit: PRO_PLAN_LIMIT, isPro: true };
  }
  return { limit: FREE_PLAN_LIMIT, isPro: false };
}

export function canCreateInvoice(currentCount: number, plan: Plan): boolean {
  const { limit } = getUserPlanLimits(plan);
  return currentCount < limit;
}

export function getRemainingInvoices(currentCount: number, plan: Plan): number {
  const { limit, isPro } = getUserPlanLimits(plan);
  if (isPro) return Infinity;
  return Math.max(0, limit - currentCount);
}
