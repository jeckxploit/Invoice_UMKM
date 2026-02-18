"use client";

import { Button } from "@/components/ui/button";
import { Plus, Crown, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Plan } from "@prisma/client";
import { FREE_PLAN_LIMIT } from "@/lib/plans";

interface QuickActionProps {
  plan: Plan;
  currentCount: number;
  className?: string;
}

export function QuickAction({ plan, currentCount, className }: QuickActionProps) {
  const isPro = plan === "PRO";
  const remaining = isPro ? Infinity : FREE_PLAN_LIMIT - currentCount;
  const isNearLimit = remaining <= 2 && !isPro;

  if (isNearLimit && !isPro) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center animate-pulse-slow">
            <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Hampir Penuh!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Anda tinggal {remaining} invoice lagi. Upgrade ke Pro untuk unlimited.
            </p>
          </div>
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade ke Pro
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
          <Plus className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Buat Invoice Baru
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isPro
              ? "Unlimited invoice tersedia untuk Pro member"
              : `${remaining} invoice tersisa bulan ini`
            }
          </p>
        </div>
        <Link href="/create">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105 transition-all duration-300 px-8">
            <Plus className="mr-2 h-4 w-4" />
            Buat Invoice
          </Button>
        </Link>
      </div>
    </div>
  );
}
