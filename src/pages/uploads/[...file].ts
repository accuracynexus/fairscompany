import type { APIRoute } from 'astro';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { uploadsDir } from '../../lib/upload';

export const prerender = false;

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export const GET: APIRoute = async ({ params }) => {
  const requested = params.file ?? '';
  const filename = path.basename(requested); // strip any path traversal
  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext];

  if (!contentType) {
    return new Response('Not found', { status: 404 });
  }

  const filePath = path.join(uploadsDir, filename);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return new Response('Not found', { status: 404 });
  }

  const buffer = await readFile(filePath);
  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
