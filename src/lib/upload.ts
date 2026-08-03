import { mkdirSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Stored outside src/public: files written here after the app is built need to be
// served at runtime (see src/pages/uploads/[...file].ts), since Astro only copies
// public/ into dist/client at build time, not on later writes.
export const uploadsDir = path.join(process.cwd(), 'uploads');

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export async function saveUploadedImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error('Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.');
  }

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}
