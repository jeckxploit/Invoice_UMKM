# Setup Supabase untuk InvoiceUMKM

Panduan lengkap setup Supabase untuk production deployment.

## 📋 Langkah 1: Buat Project Supabase

1. Buka https://supabase.com
2. Klik **"Start your project"** atau **"New Project"**
3. Isi detail project:
   - **Name:** `invoiceumkm`
   - **Database Password:** (simpan password ini!)
   - **Region:** Pilih yang terdekat (Singapore/Tokyo untuk Indonesia)
4. Klik **"Create new project"**
5. Tunggu 2-3 menit sampai project selesai dibuat

## 📋 Langkah 2: Setup Database Schema

1. Di Supabase Dashboard, buka **SQL Editor** (menu kiri)
2. Klik **"New query"**
3. Copy-paste isi file `supabase-schema.sql` ke SQL Editor
4. Klik **"Run"** atau tekan `Ctrl+Enter`
5. Pastikan semua query berhasil (tidak ada error)

## 📋 Langkah 3: Dapatkan API Keys

1. Di Supabase Dashboard, buka **Settings** (menu kiri, icon gear)
2. Klik **API**
3. Copy nilai berikut:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbG...` (panjang)

## 📋 Langkah 4: Setup Environment Variables

### Untuk Development (Local)

1. Copy file `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
   ```

3. Ganti dengan nilai dari Langkah 3

### Untuk Production (Vercel)

1. Buka https://vercel.com/dashboard
2. Pilih project **InvoiceUMKM**
3. Tab **Settings** → **Environment Variables**
4. Tambahkan variables berikut:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-here` |

5. Klik **Save**
6. **Redeploy** project untuk apply changes

## 📋 Langkah 5: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## 📋 Langkah 6: Test Connection

1. Jalankan development server:
   ```bash
   npm run dev
   ```

2. Buka http://localhost:3000
3. Coba buat invoice baru
4. Cek di Supabase Dashboard → **Table Editor** untuk melihat data

## 📋 Langkah 7: Enable Row Level Security (RLS)

Schema sudah include RLS policies. Untuk verify:

1. Di Supabase Dashboard, buka **Authentication** → **Policies**
2. Pastikan semua tables (`users`, `invoices`) punya policies
3. Policies yang dibuat:
   - Users can view own data
   - Users can insert own data
   - Users can update own data
   - Users can delete own invoices

## 📋 Langkah 8: Backup Database (Optional)

### Manual Backup

1. Supabase Dashboard → **Database** → **Backups**
2. Klik **"Create backup"**
3. Pilih schedule (daily/weekly)

### Export Data

1. Supabase Dashboard → **Table Editor**
2. Pilih table (`users` atau `invoices`)
3. Klik menu **...** → **Export to CSV**

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"

- Pastikan `.env.local` ada dan berisi values yang benar
- Restart development server setelah edit .env

### Error: "relation does not exist"

- Jalankan ulang schema SQL di Supabase SQL Editor
- Pastikan semua CREATE TABLE berhasil

### Data tidak muncul di Table Editor

- Check RLS policies di Authentication → Policies
- Pastikan policies tidak terlalu restrictive

### Deploy gagal di Vercel

- Check Environment Variables di Vercel Settings
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ter-set
- Check Build Logs di Vercel Deployments

## 📊 Database Schema Overview

```
users
├── id (UUID, primary key)
├── email (string, unique)
├── name (string, nullable)
├── plan (enum: FREE | PRO)
├── created_at (timestamp)
└── updated_at (timestamp)

invoices
├── id (UUID, primary key)
├── user_id (UUID, foreign key → users.id)
├── invoice_number (string, unique)
├── customer_name (string)
├── customer_email (string, nullable)
├── customer_phone (string, nullable)
├── address (text, nullable)
├── logo_url (text, nullable)
├── notes (text, nullable)
├── items (JSONB)
├── total (decimal)
├── status (string)
├── is_pro (boolean)
├── has_qris (boolean)
├── theme_color (string)
├── tanggal (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## 🎯 Next Steps

Setelah setup selesai:

1. ✅ Test upload logo (base64 mode)
2. ✅ Test create invoice
3. ✅ Test view invoices
4. ✅ Test delete invoice
5. ✅ Deploy ke production (Vercel/Netlify)

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Butuh bantuan?** Check issue di GitHub atau contact support.
