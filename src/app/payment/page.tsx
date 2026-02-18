"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Building, Smartphone, QrCode, ArrowLeft, Shield, Zap, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

type PaymentMethod = "card" | "bank" | "ewallet" | "qris";

export default function PaymentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Pembayaran Berhasil! 🎉",
      description: "Akun Anda telah diupgrade ke Pro Plan.",
      duration: 5000,
    });
    
    setLoading(false);
    router.push("/dashboard");
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Upgrade to Pro</span>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            Pro Plan
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Order Summary */}
          <div className="mb-8 animate-fade-in">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 animate-pulse-slow"></div>
              <CardContent className="p-8 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="h-6 w-6 animate-pulse" />
                      <h1 className="text-2xl font-bold">Pro Plan - Monthly</h1>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Check className="h-4 w-4" />
                        <span>Unlimited Invoice</span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Check className="h-4 w-4" />
                        <span>Custom Branding</span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Check className="h-4 w-4" />
                        <span>QRIS Support</span>
                      </div>
                      <div className="flex items-center gap-2 text-indigo-100">
                        <Check className="h-4 w-4" />
                        <span>Priority Support</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-indigo-200 mb-1">Harga</div>
                    <div className="text-4xl font-bold mb-2">Rp 29.000</div>
                    <div className="text-sm text-indigo-200">/bulan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="md:col-span-2 animate-fade-in-delay">
              <Card className="border-0 shadow-xl dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metode Pembayaran
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Pilih metode pembayaran yang Anda inginkan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                        <Label
                          htmlFor="card"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-900/20 transition-all duration-300"
                        >
                          <CreditCard className="h-8 w-8 mb-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium dark:text-gray-300">Kartu Kredit</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="bank" id="bank" className="peer sr-only" />
                        <Label
                          htmlFor="bank"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-900/20 transition-all duration-300"
                        >
                          <Building className="h-8 w-8 mb-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium dark:text-gray-300">Transfer Bank</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="ewallet" id="ewallet" className="peer sr-only" />
                        <Label
                          htmlFor="ewallet"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-900/20 transition-all duration-300"
                        >
                          <Smartphone className="h-8 w-8 mb-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium dark:text-gray-300">E-Wallet</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="qris" id="qris" className="peer sr-only" />
                        <Label
                          htmlFor="qris"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 peer-data-[state=checked]:border-indigo-600 peer-data-[state=checked]:bg-indigo-50 dark:peer-data-[state=checked]:bg-indigo-900/20 transition-all duration-300"
                        >
                          <QrCode className="h-8 w-8 mb-2 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium dark:text-gray-300">QRIS</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Card Details Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <Label htmlFor="cardNumber" className="dark:text-gray-300">Nomor Kartu</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName" className="dark:text-gray-300">Nama Pemilik Kartu</Label>
                        <Input
                          id="cardName"
                          placeholder="Nama sesuai kartu"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="dark:text-gray-300">Tanggal Expired</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                            maxLength={5}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="dark:text-gray-300">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                            maxLength={3}
                            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Info */}
                  {paymentMethod === "bank" && (
                    <Card className="bg-gray-50 dark:bg-gray-800 border-dashed animate-fade-in">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Building className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <p className="font-semibold dark:text-white">Bank Indonesia</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Transfer Manual</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nomor Rekening</p>
                          <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">1234567890</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Setelah transfer, kirim bukti pembayaran ke WhatsApp kami untuk verifikasi.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* E-Wallet Info */}
                  {paymentMethod === "ewallet" && (
                    <Card className="bg-gray-50 dark:bg-gray-800 border-dashed animate-fade-in">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <p className="font-semibold dark:text-white">E-Wallet Payment</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">OVO / GoPay / Dana</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nomor E-Wallet</p>
                          <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">0812-3456-7890</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* QRIS */}
                  {paymentMethod === "qris" && (
                    <Card className="bg-gray-50 dark:bg-gray-800 border-dashed animate-fade-in">
                      <CardContent className="p-6 space-y-4 text-center">
                        <QrCode className="h-24 w-24 mx-auto text-gray-900 dark:text-white" />
                        <div>
                          <p className="font-semibold dark:text-white">Scan QRIS untuk Bayar</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Support semua e-wallet & mobile banking</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          QR code akan expired dalam 15 menit
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        <span>Bayar Rp 29.000</span>
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="animate-fade-in-delay">
              <Card className="border-0 shadow-xl dark:bg-gray-900 dark:border-gray-800 sticky top-24">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Ringkasan Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pro Plan (Monthly)</span>
                    <span className="font-medium dark:text-white">Rp 29.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Diskon</span>
                    <span className="font-medium text-green-600">- Rp 0</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold dark:text-white">Total</span>
                      <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">Rp 29.000</span>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-2">FITUR PRO:</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span>Unlimited Invoice</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span>No Watermark</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span>Custom Theme</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span>QRIS Payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span>Priority Support</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
                    <Shield className="h-4 w-4" />
                    <span>Pembayaran aman & terenkripsi</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Shield className="h-4 w-4" />
            <span>Secure Payment</span>
          </div>
          <p>© 2026 InvoiceUMKM by Khaleed.</p>
        </div>
      </footer>
    </div>
  );
}
