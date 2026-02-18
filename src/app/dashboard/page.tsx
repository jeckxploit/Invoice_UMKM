'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Download, Trash2, Calendar, DollarSign, TrendingUp, Crown, Sun, Moon, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlanBadge } from '@/components/PlanBadge';
import { UsageIndicator } from '@/components/UsageIndicator';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpgradeBanner } from '@/components/dashboard/UpgradeBanner';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { Plan } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  total: number;
  status: string;
  isPro: boolean;
  createdAt: string;
  items: InvoiceItem[];
}

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
    let user = localStorage.getItem('gas_invoice_user');
    if (user) {
      resolve(JSON.parse(user));
    } else {
      const newUser = {
        id: `user_${Date.now()}`,
        email: `user_${Date.now()}@example.com`,
      };
      localStorage.setItem('gas_invoice_user', JSON.stringify(newUser));
      resolve(newUser);
    }
  });
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
    await fetchInvoices(userData.id);
  };

  const fetchUsage = async (userId: string) => {
    try {
      const response = await fetch(`/api/usage?userId=${userId}`);
      const result = await response.json();
      if (result.success) {
        setUsage(result.data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const fetchInvoices = async (userId: string) => {
    try {
      const response = await fetch(`/api/invoices?limit=20&userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setInvoices(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal mengambil data invoice',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengambil data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Invoice berhasil dihapus',
        });
        fetchInvoices();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal menghapus invoice',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus invoice',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      });

      const result = await response.json();

      if (result.success) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(result.data.html);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal generate PDF',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat generate PDF',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary' as const, label: 'Menunggu' },
      paid: { variant: 'default' as const, label: 'Lunas' },
      overdue: { variant: 'destructive' as const, label: 'Terlambat' },
    };
    return variants[status] || variants.pending;
  };

  // Calculate stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const pendingRevenue = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  // Calculate invoices this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const invoicesThisMonth = invoices.filter((inv) => {
    const invDate = new Date(inv.createdAt);
    return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-gray-950 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-2.5 group cursor-pointer">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-indigo-500/30">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <Link href="/">
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent cursor-pointer hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-400 dark:hover:to-purple-400 transition-all">
                    InvoiceUMKM
                  </span>
                </Link>
              </div>
              {usage && <PlanBadge plan={usage.plan} />}
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
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5 hover:shadow-md transition-all duration-300">
                  <Crown className="h-4 w-4" />
                  Upgrade
                </Button>
              </Link>
              <Link href="/create">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Buat Invoice
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Zap className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-pulse-slow" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
            </div>
            {usage && (
              <Badge
                variant={usage.isPro ? "default" : "secondary"}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  usage.isPro
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {usage.isPro ? (
                  <>
                    <Crown className="h-4 w-4 animate-pulse" />
                    <span>PRO MEMBER</span>
                  </>
                ) : (
                  <>
                    <span>FREE PLAN</span>
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {usage?.isPro
              ? "Anda adalah Pro Member - Nikmati semua fitur premium tanpa batas!"
              : "Upgrade ke Pro untuk membuka semua fitur premium"}
          </p>
        </div>

        {/* Stats Cards - 3 Card Minimal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Invoice"
            value={invoices.length}
            description={`${paidInvoices.length} sudah lunas`}
            icon={FileText}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            description={formatCurrency(pendingRevenue) + ' belum dibayar'}
            icon={DollarSign}
          />
          <StatsCard
            title="Invoice Bulan Ini"
            value={invoicesThisMonth.length}
            description="Invoice dibuat bulan ini"
            icon={TrendingUp}
          />
        </div>

        {/* Usage + Quick Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 animate-fade-in-delay">
          <div className="lg:col-span-1">
            {usage && <UsageIndicator currentCount={usage.invoiceCount} plan={usage.plan} />}
          </div>
          <div className="lg:col-span-2">
            {usage && <QuickAction plan={usage.plan} currentCount={usage.invoiceCount} />}
          </div>
        </div>

        {/* Upgrade Banner - Only for FREE users */}
        {usage?.plan === 'FREE' && (
          <div className="mb-6 animate-fade-in-delay">
            <UpgradeBanner />
          </div>
        )}

        {/* Invoices Table */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Daftar Invoice</CardTitle>
                <CardDescription className="text-sm">
                  Semua invoice yang pernah Anda buat
                </CardDescription>
              </div>
              <Link href="/create">
                <Button size="sm" variant="outline" className="hidden sm:flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Invoice Baru
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-r-transparent" />
                <p className="text-sm text-gray-500 mt-4">Memuat data...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Belum ada invoice
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Mulai buat invoice pertama Anda untuk mengelola pembayaran dengan lebih profesional
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Invoice Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 dark:border-gray-800">
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-300">No. Invoice</TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Pelanggan</TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Tanggal</TableHead>
                      <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300">Total</TableHead>
                      <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-300">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const statusBadge = getStatusBadge(invoice.status);
                      return (
                        <TableRow key={invoice.id} className="border-b border-gray-50 dark:border-gray-800/50">
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.customerName}</div>
                              {invoice.customerEmail && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {invoice.customerEmail}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(invoice.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={statusBadge.variant}
                              className={cn(
                                "text-xs font-medium px-2.5 py-0.5 rounded-full",
                                statusBadge.variant === 'default' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200",
                                statusBadge.variant === 'secondary' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200",
                                statusBadge.variant === 'destructive' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200"
                              )}
                            >
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(invoice.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(invoice.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={deletingId === invoice.id}
                                    onClick={() => {}}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    {deletingId === invoice.id ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Invoice?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini tidak dapat dibatalkan. Invoice{' '}
                                      <strong>{invoice.invoiceNumber}</strong> akan
                                      dihapus permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(invoice.id)}
                                      disabled={deletingId === invoice.id}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deletingId === invoice.id ? 'Menghapus...' : 'Hapus'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} InvoiceUMKM by Khaleed.</p>
        </div>
      </footer>
    </div>
  );
}

// Helper for conditional class names
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
