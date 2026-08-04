// Image index for the product catalogue and the client logos.
//
// Assets are produced by scripts/normalize-assets.mjs into
//   src/img/catalogo/<categoria>/<linea>-<n>.webp
//   src/img/clientes/<sector>/<cliente>.webp
// Globbing them keeps this index in sync with what's actually on disk, so
// adding a photo is a re-run of the script — there is no import list to
// maintain by hand.

import { getImage } from 'astro:assets';
import { categories } from './categories';

const catalogModules = import.meta.glob<{ default: ImageMetadata }>('../img/catalogo/*/*.webp', {
  eager: true,
});

const clientModules = import.meta.glob<{ default: ImageMetadata }>('../img/clientes/*/*.webp', {
  eager: true,
});

// category key → line slug → images, in file order (linea-1, linea-2, …).
const catalog: Record<string, Record<string, ImageMetadata[]>> = {};

const numeric = new Intl.Collator('en', { numeric: true });
for (const [file, mod] of Object.entries(catalogModules).sort(([a], [b]) => numeric.compare(a, b))) {
  const match = /\/catalogo\/([^/]+)\/(.+)-\d+\.webp$/.exec(file);
  if (!match) continue;
  const [, category, line] = match;
  const lines = (catalog[category] ??= {});
  (lines[line] ??= []).push(mod.default);
}

// sector slug → client slug → logo.
const logos: Record<string, Record<string, ImageMetadata>> = {};

for (const [file, mod] of Object.entries(clientModules)) {
  const match = /\/clientes\/([^/]+)\/([^/]+)\.webp$/.exec(file);
  if (!match) continue;
  const [, sector, client] = match;
  (logos[sector] ??= {})[client] = mod.default;
}

/** Every photo of one product line, e.g. ('hoteles', 'recepcion'). */
export function getLineImages(category: string, line: string): ImageMetadata[] {
  return catalog[category]?.[line] ?? [];
}

/** The representative photo of a product line, or null if it has none yet. */
export function getLineImage(category: string, line: string): ImageMetadata | null {
  return getLineImages(category, line)[0] ?? null;
}

export function getClientLogo(sector: string, client: string): ImageMetadata | null {
  return logos[sector]?.[client] ?? null;
}

// Optimised srcs for every line photo, resolved once at module load rather
// than per request. One variant serves both the small grid thumbnail and the
// quick-view panel, which is at most ~380 px wide.
export const lineImageSrcs: Record<string, Record<string, string[]>> = {};

await Promise.all(
  Object.entries(catalog).flatMap(([category, lines]) =>
    Object.entries(lines).map(async ([line, images]) => {
      const srcs = await Promise.all(
        images.map(async (image) => {
          const optimised = await getImage({ src: image, width: 640, format: 'webp', quality: 80 });
          return optimised.src;
        })
      );
      (lineImageSrcs[category] ??= {})[line] = srcs;
    })
  )
);

// Category cover = the first photo of the line named in `cat.cover`. Resolved
// once at module load, like the seeded gallery photos in src/db/client.ts, so
// the optimised src matches the current dev/build context.
export const categoryCovers: Record<string, string | null> = Object.fromEntries(
  await Promise.all(
    categories.map(async (cat) => {
      const image = getLineImage(cat.key, cat.cover);
      if (!image) return [cat.key, null];
      const optimised = await getImage({ src: image, width: 320, format: 'webp', quality: 80 });
      return [cat.key, optimised.src];
    })
  )
);
