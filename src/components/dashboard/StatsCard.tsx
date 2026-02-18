import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-sm rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group",
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className={`text-xs font-semibold ${
                  trend.value >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-gray-400">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
