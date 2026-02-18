import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

// Validate file extension
function isValidExtension(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
}

// Sanitize filename to prevent directory traversal and special characters
function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .replace(/[\/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  return sanitized.replace(/^\.+/, '') || 'unnamed';
}

// Convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type by MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Hanya file gambar yang diperbolehkan (PNG, JPG, JPEG, GIF, WEBP)' },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!isValidExtension(file.name)) {
      return NextResponse.json(
        { success: false, error: 'Ekstensi file tidak valid' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 2MB' },
        { status: 400 }
      );
    }

    // Check if running on serverless (Vercel, Netlify, Cloudflare, etc.)
    const isServerless = !!process.env.VERCEL || !!process.env.NETLIFY || !!process.env.CF_PAGES;

    if (isServerless) {
      // On serverless (Vercel/Netlify): return base64 data URL
      const base64Url = await fileToBase64(file);
      
      return NextResponse.json({
        success: true,
        data: {
          url: base64Url,
          filename: file.name,
          type: file.type,
          size: file.size,
        },
      });
    } else {
      // Local development: save to filesystem
      const uploadsDir = join(process.cwd(), 'public', 'uploads');

      // Create uploads directory if it doesn't exist
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename with sanitization
      const timestamp = Date.now();
      const sanitizedFilename = sanitizeFilename(file.name);
      const filename = `${timestamp}-${sanitizedFilename}`;
      const filepath = resolve(join(uploadsDir, filename));

      // SECURITY: Verify the resolved path is within uploads directory
      const normalizedUploadsDir = resolve(uploadsDir);
      if (!filepath.startsWith(normalizedUploadsDir)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file path' },
          { status: 400 }
        );
      }

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Return the URL
      const fileUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        data: {
          url: fileUrl,
          filename,
        },
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    console.error('[Upload Logo] Error:', errorMessage);
    return NextResponse.json(
      { success: false, error: `Gagal mengupload logo: ${errorMessage}` },
      { status: 500 }
    );
  }
}
