"use client";

import { useEffect, useState } from "react";
import { FileText, AlertCircle, Crown, Sun, Moon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InvoiceForm } from "@/components/InvoiceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plan } from "@prisma/client";
import { useTheme } from "next-themes";

interface UserUsage {
  plan: Plan;
  invoiceCount: number;
  limit: number;
  remaining: number;
  isPro: boolean;
  canCreate: boolean;
}

// Get or create user session (simplified for demo)
function getOrCreateUser(): Promise<{ id: string; email: string }> {
  return new Promise((resolve) => {
    let user = localStorage.getItem("gas_invoice_user");
    if (user) {
      resolve(JSON.parse(user));
    } else {
      const newUser = {
        id: `user_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
      };
      localStorage.setItem("gas_invoice_user", JSON.stringify(newUser));
      resolve(newUser);
    }
  });
}

export default function CreateInvoicePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const userData = await getOrCreateUser();
    setUser(userData);
    await fetchUsage(userData.id);
  };

  const fetchUsage = async (userId: string) => {
    try {
      const response = await fetch(`/api/usage?userId=${userId}`);
      const result = await response.json();
      if (result.success) {
        setUsage(result.data);
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
        <header className="border-b bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-orange-600 animate-pulse-slow" />
              <span className="text-2xl font-bold text-gray-800 dark:text-white">InvoiceUMKM</span>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-r-transparent mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
          </div>
        </main>
      </div>
    );
  }

  // If limit reached, show upgrade prompt
  if (usage && !usage.canCreate) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
        <header className="border-b bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-orange-600 animate-pulse-slow" />
              <Link href="/">
                <span className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  InvoiceUMKM
                </span>
              </Link>
            </div>
            <nav className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full border-red-200 dark:border-red-800 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2 animate-pulse-slow" />
              <CardTitle className="text-2xl dark:text-white">Invoice Limit Reached</CardTitle>
              <CardDescription className="dark:text-gray-400">
                You&apos;ve created {usage.invoiceCount} invoices. Free plan allows maximum 5 invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-sm text-red-700 dark:text-red-300">
                <p className="font-medium">To create more invoices, upgrade to Pro Plan for:</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Unlimited invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Clean PDF export (no watermark)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>QRIS support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full hover:shadow-md transition-all duration-300">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <FileText className="h-8 w-8 text-orange-600 group-hover:rotate-12 transition-transform duration-300" />
            <Link href="/">
              <span className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                InvoiceUMKM
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-2">
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:shadow-md transition-all duration-300">
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Buat Invoice Baru
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Isi formulir di bawah untuk membuat invoice profesional
            </p>
          </div>

          <div className="animate-fade-in-delay">
            <InvoiceForm isPro={usage?.isPro ?? false} userId={user?.id ?? ""} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2026 InvoiceUMKM by Khaleed.</p>
        </div>
      </footer>
    </div>
  );
}
