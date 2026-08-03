import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { getImage } from 'astro:assets';

import p1 from '../img/productos/1.jpg';
import p2 from '../img/productos/2.jpg';
import p3 from '../img/productos/3.jpg';
import p4 from '../img/productos/4.jpg';
import p5 from '../img/productos/5.jpg';
import p6 from '../img/productos/6.jpg';
import p7 from '../img/productos/7.jpg';
import p8 from '../img/productos/8.jpg';
import p9 from '../img/productos/9.jpg';
import p10 from '../img/productos/10.jpg';
import p11 from '../img/productos/11.jpg';
import p12 from '../img/productos/12.jpg';
import p13 from '../img/productos/13.jpg';
import p14 from '../img/productos/14.jpg';
import p15 from '../img/productos/15.jpg';
import p16 from '../img/productos/16.jpg';
import p17 from '../img/productos/17.jpg';
import p18 from '../img/productos/18.jpg';
import p19 from '../img/productos/19.jpg';

const optimize = (src: typeof p1) => getImage({ src, width: 700, format: 'webp', quality: 78 });
const [
  o1, o2, o3, o4, o5, o6, o7, o8, o9, o10, o11, o12, o13, o14, o15, o16, o17, o18, o19,
] = await Promise.all(
  [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19].map(optimize)
);

// Optimised src values differ between `astro dev` and `astro build` (dev serves
// /_image?href=/src/..., build serves /_image?href=/_astro/<hash>.jpg). Storing
// them in the DB freezes one context's URLs and 500s in the other. Instead we
// seed a stable "seed:N" token and resolve it to the current context's src at
// render time via resolveProductImage().
const SEED_IMAGE_SRCS: Record<number, string> = {
  1: o1.src, 2: o2.src, 3: o3.src, 4: o4.src, 5: o5.src, 6: o6.src, 7: o7.src,
  8: o8.src, 9: o9.src, 10: o10.src, 11: o11.src, 12: o12.src, 13: o13.src,
  14: o14.src, 15: o15.src, 16: o16.src, 17: o17.src, 18: o18.src, 19: o19.src,
};

const dataDir = path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, 'fair-company.db'));

// WAL mode: readers don't block on writes, and writes batch more efficiently —
// meaningful on the slower I/O of a Docker bind-mounted volume.
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('hero', 'mobile')),
    image_url TEXT NOT NULL,
    link_url TEXT,
    title TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Optional image override per product category (keyed by the category's stable
  -- slug from src/lib/categories.ts). When absent, the page falls back to the
  -- code-defined default image (a seeded photo or an icon placeholder).
  CREATE TABLE IF NOT EXISTS category_images (
    key TEXT PRIMARY KEY,
    image_url TEXT NOT NULL
  );
`);

// Migration: the two editable hero slides carry an overlaid subtitle and a
// button label on top of their image, and every slide can override its baked
// desktop/mobile image with an uploaded one (mobile_image_url). Older databases
// created the banners table without these columns, so add them if missing.
const bannerColumns = (db.prepare('PRAGMA table_info(banners)').all() as { name: string }[]).map(
  (c) => c.name
);
if (!bannerColumns.includes('subtitle')) {
  db.exec('ALTER TABLE banners ADD COLUMN subtitle TEXT');
}
if (!bannerColumns.includes('cta_text')) {
  db.exec('ALTER TABLE banners ADD COLUMN cta_text TEXT');
}
if (!bannerColumns.includes('mobile_image_url')) {
  db.exec('ALTER TABLE banners ADD COLUMN mobile_image_url TEXT');
}

// The hero has 4 slides, one row each (sort_order 0..3). Slides 1 and 2
// ("cambiantes") also carry an editable title / subtitle / button overlay.
// image_url / mobile_image_url hold either a placeholder token ("code:hero-N",
// meaning "use the baked default image") or an uploaded "/uploads/..." path set
// from the admin panel. See src/lib/hero.ts for how these resolve at render.
const HERO_SEED_VERSION = '2';
const heroSeedRow = db.prepare("SELECT value FROM meta WHERE key = 'hero_seed_version'").get() as
  | { value: string }
  | undefined;

if (heroSeedRow?.value !== HERO_SEED_VERSION) {
  db.exec("DELETE FROM banners WHERE type = 'hero'");
  const insertHero = db.prepare(
    "INSERT INTO banners (type, image_url, link_url, title, subtitle, cta_text, sort_order, active) VALUES ('hero', ?, ?, ?, ?, ?, ?, 1)"
  );
  insertHero.run(
    'code:hero-1',
    '/nosotros',
    'PERSONALIZAMOS CADA PRENDA SEGÚN LA IDENTIDAD DE TU MARCA',
    'Bordados, estampados, colores y acabados desarrollados especialmente para ti.',
    'CONOCE NUESTROS SERVICIOS',
    0
  );
  insertHero.run(
    'code:hero-2',
    '/contacto',
    'UNIFORMES INDUSTRIALES Y DE SEGURIDAD A TU MEDIDA',
    'Alta visibilidad, resistencia y tu identidad en cada prenda.',
    'SOLICITA TU COTIZACIÓN',
    1
  );
  // Slides 3 and 4: fixed image-only designs (no overlay text/button).
  insertHero.run('code:hero-3', null, null, null, null, 2);
  insertHero.run('code:hero-4', null, null, null, null, 3);
  db.prepare(
    "INSERT INTO meta (key, value) VALUES ('hero_seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(HERO_SEED_VERSION);
}

const PRODUCTS_SEED_VERSION = '4';
const seedVersionRow = db.prepare("SELECT value FROM meta WHERE key = 'products_seed_version'").get() as
  | { value: string }
  | undefined;

if (seedVersionRow?.value !== PRODUCTS_SEED_VERSION) {
  const catalog = [
    {
      name: 'Casaca Bomber Fair\'s Company',
      category: 'Corporativo',
      image_url: 'seed:1',
      description: 'Casaca bomber tricolor con bordado personalizado.',
    },
    {
      name: 'Short Deportivo Colegios Zárate',
      category: 'Colegios',
      image_url: 'seed:2',
      description: 'Short deportivo con cinta tricolor institucional.',
    },
    {
      name: 'Pantalón Deportivo Colegios Zárate',
      category: 'Colegios',
      image_url: 'seed:3',
      description: 'Pantalón deportivo a juego con cinta institucional.',
    },
    {
      name: 'Polo Manga Larga Caja Huancayo',
      category: 'Empresas',
      image_url: 'seed:4',
      description: 'Polo bicolor manga larga con logo bordado.',
    },
    {
      name: 'Chaleco Institucional Caja Huancayo',
      category: 'Empresas',
      image_url: 'seed:5',
      description: 'Chaleco acolchado con bolsillos reforzados.',
    },
    {
      name: 'Casaca Poder Judicial',
      category: 'Instituciones',
      image_url: 'seed:6',
      description: 'Casaca institucional con diseño bicolor y escudo bordado.',
    },
    {
      name: 'Pantalón Buzo Poder Judicial',
      category: 'Instituciones',
      image_url: 'seed:7',
      description: 'Pantalón buzo cómodo con logo institucional.',
    },
    {
      name: 'Casaca Deportiva Bicolor',
      category: 'Deportivo',
      image_url: 'seed:8',
      description: 'Casaca deportiva ligera en dos tonos.',
    },
    {
      name: 'Pantalón Buzo Deportivo',
      category: 'Deportivo',
      image_url: 'seed:9',
      description: 'Pantalón buzo deportivo con bolsillos laterales.',
    },
    {
      name: 'Uniforme Clínico Confiesalud',
      category: 'Salud',
      image_url: 'seed:10',
      description: 'Casaca médica tipo scrub para personal de salud.',
    },
    {
      name: 'Camisa Alta Visibilidad Transa',
      category: 'Empresas',
      image_url: 'seed:11',
      description: 'Camisa de trabajo con cintas reflectivas de seguridad.',
    },
    {
      name: 'Polo Manga Larga Azul',
      category: 'Empresas',
      image_url: 'seed:12',
      description: 'Polo manga larga con logo bordado en el pecho.',
    },
    {
      name: 'Casaca Varsity Promoción',
      category: 'Colegios',
      image_url: 'seed:13',
      description: 'Casaca varsity personalizada para promociones escolares.',
    },
    {
      name: 'Casaca Bomber Institucional',
      category: 'Instituciones',
      image_url: 'seed:14',
      description: 'Casaca bomber en paño con escudo bordado.',
    },
    {
      name: 'Casaca Deportiva Colegios Zárate',
      category: 'Colegios',
      image_url: 'seed:15',
      description: 'Casaca deportiva tricolor a juego con el uniforme del colegio.',
    },
    {
      name: 'Casaca Softshell Corporativa',
      category: 'Empresas',
      image_url: 'seed:16',
      description: 'Casaca softshell resistente al viento con logo bordado.',
    },
    {
      name: 'Polerón Deportivo Bicolor',
      category: 'Deportivo',
      image_url: 'seed:17',
      description: 'Polerón con capucha y mangas en contraste.',
    },
    {
      name: 'Casaca Varsity Verde',
      category: 'Colegios',
      image_url: 'seed:18',
      description: 'Casaca varsity personalizada con letra bordada.',
    },
    {
      name: 'Polo Manga Larga Colegio Claretiano',
      category: 'Colegios',
      image_url: 'seed:19',
      description: 'Polo manga larga con estampado institucional.',
    },
  ];

  db.exec('DELETE FROM products');
  const insert = db.prepare(
    'INSERT INTO products (name, category, image_url, description, sort_order, active) VALUES (?, ?, ?, ?, ?, 1)'
  );
  catalog.forEach((p, i) => insert.run(p.name, p.category, p.image_url, p.description, i));

  db.prepare(
    "INSERT INTO meta (key, value) VALUES ('products_seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(PRODUCTS_SEED_VERSION);
}

export type Banner = {
  id: number;
  type: 'hero' | 'mobile';
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  sort_order: number;
  active: number;
};

export type Product = {
  id: number;
  name: string;
  category: string | null;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  active: number;
};

export function getActiveHeroBanner(): Banner | undefined {
  return db
    .prepare("SELECT * FROM banners WHERE type = 'hero' AND active = 1 ORDER BY sort_order ASC LIMIT 1")
    .get() as Banner | undefined;
}

// All 4 hero slides (sort_order 0..3), in order. Slides 0 and 1 carry editable
// text/button; every slide can override its baked image. Resolved for rendering
// by resolveHeroSlides() in src/lib/hero.ts.
export function getHeroSlides(): Banner[] {
  return db
    .prepare("SELECT * FROM banners WHERE type = 'hero' ORDER BY sort_order ASC LIMIT 4")
    .all() as Banner[];
}

// Category image overrides, as a { key: image_url } map for quick lookup.
export function getCategoryImages(): Record<string, string> {
  const rows = db.prepare('SELECT key, image_url FROM category_images').all() as {
    key: string;
    image_url: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.image_url]));
}

export function setCategoryImage(key: string, imageUrl: string): void {
  db.prepare(
    'INSERT INTO category_images (key, image_url) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET image_url = excluded.image_url'
  ).run(key, imageUrl);
}

export function deleteCategoryImage(key: string): void {
  db.prepare('DELETE FROM category_images WHERE key = ?').run(key);
}

export function getActiveMobileBanners(): Banner[] {
  return db
    .prepare("SELECT * FROM banners WHERE type = 'mobile' AND active = 1 ORDER BY sort_order ASC")
    .all() as Banner[];
}

export function getAllBanners(): Banner[] {
  return db.prepare('SELECT * FROM banners ORDER BY type ASC, sort_order ASC').all() as Banner[];
}

export function getActiveProducts(): Product[] {
  return db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort_order ASC').all() as Product[];
}

export function getAllProducts(): Product[] {
  return db.prepare('SELECT * FROM products ORDER BY sort_order ASC').all() as Product[];
}

// Resolves a stored image_url for rendering. Seeded products store a stable
// "seed:N" token that maps to the current build/dev context's optimised src;
// admin-uploaded products store a "/uploads/..." path that passes through as-is.
export function resolveProductImage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const seedMatch = /^seed:(\d+)$/.exec(imageUrl);
  if (seedMatch) {
    return SEED_IMAGE_SRCS[Number(seedMatch[1])] ?? null;
  }
  return imageUrl;
}

export default db;
