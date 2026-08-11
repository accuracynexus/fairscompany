import { mkdirSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

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

// Banners are full-bleed backgrounds, so 2400px covers desktop at 2x without
// ever being the bottleneck. Anything narrower is left at its own size.
const MAX_WIDTH = 2400;
const WEBP_QUALITY = 80;

export async function saveUploadedImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error('Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF.');
  }

  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Uploads are served straight from disk by src/pages/uploads/[...file].ts —
  // they never touch Astro's image pipeline, so a 2 MB PNG dropped in the admin
  // panel would be shipped to every visitor byte for byte. Re-encode to WebP
  // here, which is the only place that can shrink them.
  //
  // GIFs are passed through untouched: they may be animated, and a still WebP
  // would silently drop the animation.
  if (file.type !== 'image/gif') {
    try {
      const optimised = await sharp(buffer)
        .rotate() // honour EXIF orientation before the metadata is dropped
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      const webpName = `${randomUUID()}.webp`;
      await writeFile(path.join(uploadsDir, webpName), optimised);
      return `/uploads/${webpName}`;
    } catch {
      // sharp is an optional dependency of Astro, so it can be absent on an
      // unsupported platform. Losing compression is worth far less than losing
      // the upload: fall through and store the original bytes.
    }
  }

  const filename = `${randomUUID()}${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return `/uploads/${filename}`;
}
