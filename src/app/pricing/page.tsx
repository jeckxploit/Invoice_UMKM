"use client";

import { Plan } from "@prisma/client";
import { Check, Crown, Sparkles, Zap, Shield, Headphones, ArrowLeft, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_FEATURES, FREE_PLAN, PRO_PLAN, FREE_PLAN_LIMIT } from "@/lib/plans";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPro: boolean;
  isCurrentPlan?: boolean;
  onUpgrade: () => void;
}

function PricingCard({
  name,
  price,
  period,
  features,
  isPro,
  isCurrentPlan,
  onUpgrade,
}: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-lg ${
        isPro
          ? "border-amber-500 shadow-md shadow-amber-500/10"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
            <Sparkles className="h-3 w-3 mr-1" />
            Best Value
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground text-sm">/{period}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  isPro ? "text-amber-500" : "text-blue-500"
                }`}
              />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className={`w-full ${
            isPro
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
              : ""
          }`}
          variant={isPro ? "default" : "outline"}
          onClick={onUpgrade}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Current Plan
            </>
          ) : isPro ? (
            <>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </>
          ) : (
            "Get Started"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleGetStarted = () => {
    router.push("/create");
  };

  const handleUpgrade = () => {
    router.push("/payment");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header with Back Button and Theme Toggle */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Pricing Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade when you need more. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <PricingCard
            name={FREE_PLAN.name}
            price={FREE_PLAN.price}
            period={FREE_PLAN.period}
            features={FREE_PLAN.features}
            isPro={false}
            onUpgrade={handleGetStarted}
          />
          <PricingCard
            name={PRO_PLAN.name}
            price={PRO_PLAN.price}
            period={PRO_PLAN.period}
            features={PRO_PLAN.features}
            isPro={true}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Feature Comparison */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Compare Features</h2>
            <p className="text-muted-foreground">
              See what&apos;s included in each plan
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y">
                {PLAN_FEATURES.map((feature, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="col-span-1 font-medium">{feature.label}</div>
                    <div className="col-span-1 text-center">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">{feature.free}</span>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      {typeof feature.pro === "boolean" ? (
                        feature.pro ? (
                          <Check className="h-5 w-5 text-amber-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )
                      ) : (
                        <span className="font-medium text-amber-600 dark:text-amber-400">{feature.pro}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
