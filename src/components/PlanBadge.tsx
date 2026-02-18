"use client";

import { Plan } from "@prisma/client";
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  plan: Plan;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const isPro = plan === Plan.PRO;

  return (
    <Badge
      variant={isPro ? "default" : "secondary"}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 text-sm font-medium transition-all duration-300 hover:scale-105",
        isPro
          ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 border-0"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {isPro && <Crown className="h-3.5 w-3.5 animate-pulse-slow" />}
      {isPro ? "Pro" : "Free"}
    </Badge>
  );
}
