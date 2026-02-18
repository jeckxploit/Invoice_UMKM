'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, Upload, X, QrCode, Palette, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceFormProps {
  isPro?: boolean;
  userId?: string;
}

const PRESET_COLORS = [
  '#000000', '#dc2626', '#ea580c', '#d97706', '#65a30d',
  '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#9333ea',
  '#c026d3', '#db2777',
];

export function InvoiceForm({ isPro = false, userId: propUserId }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showQris, setShowQris] = useState(false);
  const [userId, setUserId] = useState<string>(propUserId || '');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: '', description: '', quantity: 1, price: 0 },
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    const newId = (items.length + 1).toString();
    setItems((prev) => [
      ...prev,
      { id: newId, name: '', description: '', quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast({
        title: 'Error',
        description: 'Minimal harus ada 1 item',
        variant: 'destructive',
      });
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setLogoUrl(result.data.url);
        toast({
          title: 'Berhasil',
          description: 'Logo berhasil diupload',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal upload logo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl('');
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerName.trim()) {
      toast({
        title: 'Error',
        description: 'Nama pelanggan wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Minimal harus ada 1 item dengan nama',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Auto-create user if needed (use customer email as user email)
      let currentUserId = userId;
      if (!currentUserId && formData.customerEmail) {
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.customerEmail,
          }),
        });
        const userResult = await userResponse.json();
        if (userResult.success) {
          currentUserId = userResult.data.id;
          setUserId(currentUserId);
        }
      }

      // If still no userId, create a default user
      if (!currentUserId) {
        const userResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: `user-${Date.now()}@invoiceumkm.id`,
          }),
        });
        const userResult = await userResponse.json();
        if (userResult.success) {
          currentUserId = userResult.data.id;
          setUserId(currentUserId);
        }
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          ...formData,
          logoUrl,
          themeColor: selectedColor,
          items: validItems,
          isPro,
          hasQris: showQris && isPro,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Invoice berhasil dibuat!',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal membuat invoice',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat membuat invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <Card className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Upload className="h-5 w-5" />
            Logo Perusahaan
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Upload logo untuk tampilan invoice yang lebih profesional</CardDescription>
        </CardHeader>
        <CardContent>
          {logoUrl ? (
            <div className="flex items-start gap-4 animate-fade-in">
              <div className="w-32 h-32 border rounded-lg p-2 flex items-center justify-center bg-white dark:bg-gray-800 shadow-md">
                <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Logo berhasil diupload</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeLogo}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Logo
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-300">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse-slow" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload logo (PNG, JPG) - Maks 2MB
              </p>
              <div className="flex justify-center">
                <label className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-300">
                  <Upload className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Pilih File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              {uploading && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Mengupload...</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Color - PRO Feature */}
      {isPro && (
        <Card className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Palette className="h-5 w-5" />
              Tema Warna
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Pilih warna tema untuk invoice Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColor === color
                      ? 'border-gray-900 dark:border-white scale-110 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      <Card className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Informasi Pelanggan</CardTitle>
          <CardDescription className="dark:text-gray-400">Isi data pelanggan untuk invoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customerName" className="dark:text-gray-300">Nama Pelanggan *</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Masukkan nama pelanggan"
              required
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerEmail" className="dark:text-gray-300">Email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="email@contoh.com"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="dark:text-gray-300">No. Telepon</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="081234567890"
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="dark:text-gray-300">Alamat</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Alamat lengkap pelanggan"
              rows={2}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Item Invoice</CardTitle>
          <CardDescription className="dark:text-gray-400">Tambahkan item yang akan diinvoice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Item #{index + 1}
                </span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 transition-all duration-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`item-name-${item.id}`} className="dark:text-gray-300">Nama Item *</Label>
                <Input
                  id={`item-name-${item.id}`}
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(item.id, 'name', e.target.value)
                  }
                  placeholder="Nama item atau jasa"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label htmlFor={`item-desc-${item.id}`} className="dark:text-gray-300">Deskripsi</Label>
                <Input
                  id={`item-desc-${item.id}`}
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(item.id, 'description', e.target.value)
                  }
                  placeholder="Deskripsi item (opsional)"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`item-qty-${item.id}`} className="dark:text-gray-300">Jumlah *</Label>
                  <Input
                    id={`item-qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'quantity',
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor={`item-price-${item.id}`} className="dark:text-gray-300">Harga (Rp) *</Label>
                  <Input
                    id={`item-price-${item.id}`}
                    type="number"
                    min="0"
                    step="1000"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'price',
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="text-right text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subtotal: </span>
                <span className="font-semibold dark:text-white">
                  {formatCurrency(item.quantity * item.price)}
                </span>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full hover:shadow-md transition-all duration-300 dark:border-gray-700 dark:text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Item
          </Button>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium dark:text-white">Total Invoice</span>
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* QRIS - PRO Feature */}
      {isPro && (
        <Card className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <QrCode className="h-5 w-5" />
              QRIS Payment
            </CardTitle>
            <CardDescription className="dark:text-gray-400">Aktifkan QRIS untuk pembayaran instan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">Tampilkan QRIS di Invoice</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pelanggan bisa scan QRIS untuk pembayaran
                </p>
              </div>
              <Switch
                checked={showQris}
                onCheckedChange={setShowQris}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card className="hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Catatan</CardTitle>
          <CardDescription className="dark:text-gray-400">Tambahkan catatan untuk pelanggan (opsional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Catatan tambahan untuk invoice ini..."
            rows={3}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 animate-fade-in-delay">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1 hover:shadow-md transition-all duration-300 dark:border-gray-700 dark:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          {loading ? (
            'Menyimpan...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Invoice
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
