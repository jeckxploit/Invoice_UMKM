"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, QrCode, Download, Zap, Sun, Moon, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export default function Home() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-900 overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <span className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">InvoiceUMKM</span>
          </div>
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 md:h-10 md:w-10 hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <Sun className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-12 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6 md:mb-8 animate-bounce">
              <Zap className="h-12 w-12 md:h-16 md:w-16 text-orange-600 mx-auto" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 animate-fade-in leading-tight">
              Bikin Invoice Profesional dalam{" "}
              <span className="text-orange-600">30 Detik</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 animate-fade-in-delay px-2">
              Solusi invoice modern untuk UMKM Indonesia.
              <br className="hidden sm:block" />
              Terintegrasi QRIS dan siap digunakan dalam hitungan detik.
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-base md:text-lg px-6 md:px-10 py-4 md:py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                >
                  <Zap className="mr-2 h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform" />
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900 dark:text-white animate-fade-in">
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 dark:bg-gray-900 dark:border-gray-700">
              <CardHeader>
                <FileText className="h-10 w-10 md:h-12 md:w-12 text-orange-600 mb-2 animate-pulse-slow" />
                <CardTitle className="text-lg md:text-xl dark:text-white">Buat Invoice Cepat</CardTitle>
                <CardDescription className="text-sm md:text-base dark:text-gray-400">
                  Tambah logo, item, dan harga dalam hitungan detik. Auto hitung total.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 dark:bg-gray-900 dark:border-gray-700">
              <CardHeader>
                <Download className="h-10 w-10 md:h-12 md:w-12 text-orange-600 mb-2 animate-pulse-slow" />
                <CardTitle className="text-lg md:text-xl dark:text-white">Download PDF</CardTitle>
                <CardDescription className="text-sm md:text-base dark:text-gray-400">
                  Download invoice dalam format PDF siap kirim ke pelanggan via WhatsApp atau Email.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-300 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 dark:bg-gray-900 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <QrCode className="h-10 w-10 md:h-12 md:w-12 text-orange-600 mb-2 animate-pulse-slow" />
                <CardTitle className="text-lg md:text-xl dark:text-white">QRIS Payment</CardTitle>
                <CardDescription className="text-sm md:text-base dark:text-gray-400">
                  Tambah QRIS untuk pembayaran instan. Pelanggan bayar lebih cepat!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-4 py-12 md:py-16 bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl max-w-5xl shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900 dark:text-white animate-fade-in">
            Pilih Paket Sesuai Kebutuhan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Free Plan */}
            <Card className="border-2 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl dark:text-white">Free</CardTitle>
                <CardDescription className="text-2xl md:text-3xl font-bold text-orange-600">
                  Rp 0
                  <span className="text-sm md:text-base font-normal text-gray-500 dark:text-gray-400">/bulan</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Buat invoice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Tambah logo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Auto hitung total</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Download PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">✗</span>
                    <span className="text-gray-500 dark:text-gray-400">Maks 20 invoice/bulan</span>
                  </li>
                </ul>
                <Link href="/create" className="block mt-4">
                  <Button className="w-full" variant="outline">
                    Mulai Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-orange-500 relative hover:shadow-xl hover:-translate-y-2 transition-all duration-300 dark:bg-gray-800">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-orange-600 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold animate-pulse whitespace-nowrap">
                  POPULER
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl dark:text-white">PRO</CardTitle>
                <CardDescription className="text-2xl md:text-3xl font-bold text-orange-600">
                  Rp 29.000
                  <span className="text-sm md:text-base font-normal text-gray-500 dark:text-gray-400">/bulan</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Semua fitur Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Unlimited invoice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Simpan histori invoice</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Custom template warna</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Tambah QRIS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="dark:text-gray-300">Export tanpa watermark</span>
                  </li>
                </ul>
                <Link href="/payment">
                  <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-300">
                    Upgrade ke PRO
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-12 md:mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2026 InvoiceUMKM by Khaleed.</p>
        </div>
      </footer>
    </div>
  )
}
