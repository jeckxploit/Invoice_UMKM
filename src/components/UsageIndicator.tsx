"use client";

import { Plan } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FREE_PLAN_LIMIT } from "@/lib/plans";

interface UsageIndicatorProps {
  currentCount: number;
  plan: Plan;
}

export function UsageIndicator({ currentCount, plan }: UsageIndicatorProps) {
  const isPro = plan === "PRO";
  const limit = isPro ? 9999 : FREE_PLAN_LIMIT;
  const percentage = Math.min((currentCount / limit) * 100, 100);
  const remaining = isPro ? Infinity : limit - currentCount;
  const isNearLimit = remaining <= 2 && !isPro;
  const isLimitReached = remaining <= 0 && !isPro;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invoice Usage</span>
        </div>
        {isPro ? (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
            Unlimited
          </span>
        ) : (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {currentCount} dari {limit} invoice
          </span>
        )}
      </div>

      {!isPro && (
        <>
          <Progress
            value={percentage}
            className={cn(
              "h-2 mb-4 transition-all",
              isLimitReached && "bg-red-100 dark:bg-red-900/20",
              isNearLimit && !isLimitReached && "bg-amber-100 dark:bg-amber-900/20",
              !isNearLimit && "bg-gray-100 dark:bg-gray-800",
              isLimitReached && "[&>div]:bg-red-500",
              isNearLimit && !isLimitReached && "[&>div]:bg-amber-500",
              !isNearLimit && "[&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500"
            )}
          />

          {isNearLimit && !isLimitReached && (
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5 rounded-xl">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="font-medium">Tinggal {remaining} invoice lagi. Upgrade ke Pro untuk unlimited!</span>
            </div>
          )}

          {isLimitReached && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2.5 rounded-xl">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="font-medium">Batas invoice tercapai! Upgrade ke Pro untuk membuat invoice baru.</span>
              </div>
              <Link href="/pricing">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade ke Pro
                </Button>
              </Link>
            </div>
          )}
        </>
      )}

      {isPro && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs bg-green-50 dark:bg-green-900/20 px-3 py-2.5 rounded-xl">
          <Crown className="h-4 w-4" />
          <span className="font-medium">Unlimited invoice dengan Pro Plan</span>
        </div>
      )}
    </div>
  );
}
