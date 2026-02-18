import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAProvider } from "@/components/PWAProvider";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvoiceUMKM - Solusi Invoice Modern",
  description: "Solusi invoice modern untuk UMKM Indonesia. Terintegrasi QRIS dan siap digunakan dalam hitungan detik.",
  keywords: ["Invoice", "UMKM", "QRIS", "Indonesia", "Billing"],
  authors: [{ name: "InvoiceUMKM Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InvoiceUMKM",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "InvoiceUMKM",
    description: "Solusi invoice modern untuk UMKM Indonesia",
    url: "https://invoiceumkm.id",
    siteName: "InvoiceUMKM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceUMKM",
    description: "Solusi invoice modern untuk UMKM Indonesia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalyticsProvider>
            <PWAProvider>
              {children}
              <Toaster />
            </PWAProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
