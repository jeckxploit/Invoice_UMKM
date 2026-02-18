"use client";

import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradeBannerProps {
  className?: string;
}

export function UpgradeBanner({ className }: UpgradeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-6 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02]">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 animate-pulse-slow"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-all duration-300">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">Upgrade ke Pro</h3>
            <p className="text-sm text-indigo-100 max-w-md">
              Dapatkan unlimited invoice, fitur premium, dan prioritas support untuk bisnis Anda.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-indigo-100">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Unlimited Invoice</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-100">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Fitur Premium</span>
              </div>
            </div>
          </div>
        </div>
        <Link href="/pricing">
          <Button className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg shadow-black/20 font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
            Upgrade Sekarang
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
