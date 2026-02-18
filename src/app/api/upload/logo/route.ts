import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, normalize, resolve } from 'path';
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
  // Remove path separators and dangerous characters
  const sanitized = filename
    .replace(/[\/\\]/g, '_')  // Remove path separators
    .replace(/\.\./g, '_')    // Remove parent directory references
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .toLowerCase();
  
  // Ensure filename doesn't start with a dot
  return sanitized.replace(/^\.+/, '') || 'unnamed';
}

export async function POST(request: NextRequest) {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui';
    return NextResponse.json(
      { success: false, error: `Gagal mengupload logo: ${errorMessage}` },
      { status: 500 }
    );
  }
}
