"use client";

import { useState } from "react";
import { Menu, X, Home, FileText, PlusCircle, CreditCard, Settings, LogOut, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  isPro?: boolean;
}

export function MobileMenu({ isPro = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: FileText },
    { href: "/create", label: "Buat Invoice", icon: PlusCircle },
    { href: "/pricing", label: "Harga", icon: CreditCard },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg dark:text-white">InvoiceUMKM</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {isPro && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <Crown className="h-3 w-3" />
                PRO MEMBER
              </span>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-800 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Settings className="h-5 w-5" />
            <span>Pengaturan</span>
          </Link>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            onClick={() => setIsOpen(false)}
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}
