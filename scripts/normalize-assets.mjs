// Converts the raw drops in src/img/PRODUCTOS-todos and src/img/CLIENTES-todos
// into web-ready assets under src/img/catalogo/<categoria>/ and
// src/img/clientes/<sector>/.
//
// The raw folders are not usable as-is: names carry spaces, accents, bullets and
// trailing underscores; 21 files are ".svg" wrappers around a base64 PNG (which
// Astro would ship unoptimised); 10 are ".jfif" and 4 have no extension at all.
// Everything here is read as a buffer and sniffed by sharp, so the source
// extension never matters — only the real bytes do.
//
// Run: node scripts/normalize-assets.mjs

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(root, 'src', 'img');
const SRC_PRODUCTS = path.join(IMG, 'PRODUCTOS-todos');
const SRC_CLIENTS = path.join(IMG, 'CLIENTES-todos');
const OUT_CATALOG = path.join(IMG, 'catalogo');
const OUT_CLIENTS = path.join(IMG, 'clientes');

// Source subfolder → destination slug + display name. The subfolders are the
// source of truth for what we actually have photos of; the display names are
// what the site shows. `dir: null` means the line is offered but has no photo
// yet (empty or missing folder) — it still renders, just without a thumbnail.
const CATEGORIES = [
  {
    key: 'escolares',
    dir: 'UNIFORMES PARA COLEGIOS E INSTITUCIONES PÚBLICAS Y PRIVADAS',
    items: [
      { slug: 'uniformes-escolares', name: 'Uniformes escolares', dir: 'Uniformes escolares' },
      { slug: 'buzos-deportivos', name: 'Buzos deportivos', dir: 'Buzos deportivos' },
      { slug: 'polos-institucionales', name: 'Polos institucionales', dir: 'Polos institucionales' },
      { slug: 'camisas-escolares', name: 'Camisas escolares', dir: 'Camisas escolares' },
      { slug: 'casacas-institucionales', name: 'Casacas institucionales', dir: 'Casacas institucionales' },
      { slug: 'chalecos', name: 'Chalecos', dir: 'Chalecos' },
      { slug: 'pantalones-faldas', name: 'Pantalones y faldas escolares', dir: 'Pantalones y faldas escolares' },
    ],
  },
  {
    key: 'promocion',
    dir: 'PRENDAS DE PROMOCIÓN',
    items: [
      { slug: 'casacas-promocion', name: 'Casacas de promoción', dir: 'Casacas de promoción' },
      { slug: 'poleras-promocion', name: 'Poleras de promoción', dir: 'Poleras de promoción' },
      { slug: 'polos-promocion', name: 'Polos de promoción', dir: 'Polos de promoción' },
      { slug: 'buzos-promocion', name: 'Buzos de promoción', dir: null },
      { slug: 'chalecos-promocion', name: 'Chalecos de promoción', dir: null },
    ],
  },
  {
    key: 'corporativos',
    dir: 'UNIFORMES CORPORATIVOS',
    items: [
      { slug: 'polos-corporativos', name: 'Polos corporativos', dir: 'Polos corporativos' },
      { slug: 'camisas', name: 'Camisas', dir: 'Camisas' },
      { slug: 'casacas', name: 'Casacas', dir: 'Casacas' },
      { slug: 'chalecos', name: 'Chalecos', dir: 'Chalecos' },
      { slug: 'uniformes-administrativos', name: 'Uniformes administrativos', dir: 'Uniformes administrativos' },
    ],
  },
  {
    key: 'medicos',
    dir: 'UNIFORMES MÉDICOS',
    items: [
      { slug: 'scrubs', name: 'Scrubs médicos', dir: 'Scrubs médicos' },
      { slug: 'mandiles', name: 'Mandiles', dir: 'Mandiles' },
      { slug: 'chaquetas-medicas', name: 'Chaquetas médicas', dir: '• Chaquetas médicas' },
      { slug: 'uniformes-clinicos', name: 'Uniformes clínicos', dir: '• Uniformes clínicos' },
      { slug: 'buzos-institucionales', name: 'Buzos corporativos e institucionales', dir: 'Buzos Corporativos - Institucionales' },
      { slug: 'polos-institucionales', name: 'Polos institucionales', dir: 'Polos Institucionales' },
    ],
  },
  {
    key: 'industrial',
    dir: 'Uniformes Industriales para el sector minero y construcción',
    items: [
      { slug: 'overoles', name: 'Overoles industriales', dir: 'Overoles Industriales' },
      { slug: 'camisas-industriales', name: 'Camisas industriales', dir: null },
      { slug: 'pantalones-industriales', name: 'Pantalones industriales', dir: 'Pantalones Industriales' },
      { slug: 'polos-industriales', name: 'Polos industriales', dir: 'Polos Industriales' },
      { slug: 'casacas-industriales', name: 'Casacas industriales', dir: 'Casacas Industriales' },
      { slug: 'chalecos-reflectivos', name: 'Chalecos reflectivos', dir: 'Chalecos Reflectivos' },
      { slug: 'ropa-reflectiva', name: 'Ropa reflectiva', dir: 'Ropa reflectiva' },
      { slug: 'antiflama', name: 'Uniformes antiflama', dir: 'Uniforme anti flama' },
      { slug: 'antiacidos', name: 'Uniformes antiácidos', dir: 'Uniformes antiácidos' },
      { slug: 'arc-flash', name: 'Uniformes Arc Flash', dir: 'Uniformes Arc Flash' },
    ],
  },
  {
    key: 'automovilismo',
    dir: '_ INDUMENTARIA PARA COMPETENCIAS AUTOMOVILÍSTICAS',
    items: [
      { slug: 'uniformes-competencia', name: 'Uniformes de competencia', dir: 'Uniformes de Competencia' },
      { slug: 'casacas-equipos', name: 'Casacas para equipos', dir: 'Casacas para Equipos' },
      { slug: 'camisas-polos', name: 'Camisas y polos', dir: 'Camisas y Polos' },
      { slug: 'chalecos', name: 'Chalecos', dir: 'CHALECOS' },
      { slug: 'accesorios', name: 'Accesorios', dir: 'Accesorios' },
    ],
  },
  {
    key: 'anfitrionas',
    dir: 'UNIFORMES DE ANFITRIONAS Y PROMOTORAS',
    items: [
      { slug: 'anfitrionas', name: 'Uniformes para anfitrionas', dir: 'Uniformes para Anfitrionas' },
      { slug: 'promotoras', name: 'Uniformes para promotoras', dir: 'Uniformes para Promotoras' },
      { slug: 'ferias', name: 'Uniformes para ferias y exposiciones', dir: 'Uniformes para Ferias y Exposiciones' },
      { slug: 'btl', name: 'Uniformes para activaciones BTL y eventos', dir: 'Uniformes para Activaciones BTL y Eventos' },
    ],
  },
  {
    key: 'hoteles',
    dir: 'INDUMENTARIA PARA HOTELES Y RESORTS',
    items: [
      { slug: 'recepcion', name: 'Uniformes para recepción', dir: 'Uniformes para recepción' },
      { slug: 'administrativos', name: 'Uniformes administrativos', dir: 'Uniformes administrativos' },
      { slug: 'housekeeping', name: 'Uniformes para housekeeping', dir: 'Uniformes para housekeeping' },
      { slug: 'mantenimiento', name: 'Uniformes para mantenimiento', dir: 'Uniformes para mantenimiento' },
      { slug: 'atencion-cliente', name: 'Uniformes para atención al cliente', dir: 'Uniformes para atención al cliente' },
      { slug: 'cocina-servicio', name: 'Uniformes para cocina y servicio', dir: 'Uniformes para cocina y servicio' },
    ],
  },
  {
    key: 'restaurantes',
    dir: 'INDUMENTARIA PARA RESTAURANTES Y DISCOTECAS',
    items: [
      { slug: 'chaquetas-chef', name: 'Chaquetas de chef', dir: '•_Chaquetas de chef' },
      { slug: 'mandiles', name: 'Mandiles gastronómicos', dir: '•_Mandiles gastronómicos' },
      { slug: 'cocina', name: 'Uniformes para cocina', dir: '•_Uniformes para cocina' },
      { slug: 'mozos', name: 'Uniformes para mozos', dir: '•_Uniformes para mozos' },
      { slug: 'bartenders', name: 'Uniformes para bartenders', dir: '•_Uniformes para bartenders' },
      { slug: 'polos-camisas', name: 'Polos y camisas personalizadas', dir: '•_Polos y camisas personalizadas' },
      { slug: 'chalecos', name: 'Chalecos', dir: '•_Chalecos' },
    ],
  },
  {
    key: 'merchandising',
    dir: 'ARTÍCULOS PUBLICITARIOS Y MERCHANDISING',
    items: [
      { slug: 'polos-publicitarios', name: 'Polos publicitarios', dir: 'POLOS PUBLICITARIOS' },
      { slug: 'gorras', name: 'Gorras', dir: 'GORRAS' },
      { slug: 'tomatodos', name: 'Tomatodos', dir: 'TOMATODO' },
      { slug: 'mochilas', name: 'Mochilas', dir: 'MOCHILAS' },
      { slug: 'bolsos', name: 'Bolsos', dir: 'BOLSOS' },
      { slug: 'lanyards', name: 'Lanyards', dir: 'LANYARDS' },
      { slug: 'promocionales', name: 'Artículos promocionales personalizados', dir: null },
    ],
  },
];

// Sector → destination slug, and each logo's source file (relative to the
// sector folder) → destination slug + display name. Names match the entries in
// src/pages/clientes.astro so the page can join them by slug.
const CLIENT_SECTORS = [
  {
    slug: 'educativas',
    sector: 'Instituciones Educativas',
    dir: 'Instituciones Educativas',
    logos: [
      { slug: 'colegio-high-school', name: 'Colegio High School', file: 'HIGH SCHOOL.png' },
      { slug: 'colegio-salesiano-santa-rosa', name: 'Colegio Salesiano Santa Rosa', file: 'Colegio Salesiano Santa Rosa_.jpg' },
      { slug: 'colegio-andino', name: 'Colegio Andino', file: 'Colegio Andino .png' },
      { slug: 'colegio-claretiano', name: 'Colegio Claretiano', file: 'Colegio Claretiano.jfif' },
      { slug: 'colegio-ingenieria', name: 'Colegio Ingeniería', file: 'Colegio Ingeniería.jfif' },
      { slug: 'colegio-union', name: 'Colegio Unión', file: 'Colegio Unión.jfif' },
      { slug: 'colegio-san-juan-bosco', name: 'Colegio San Juan Bosco', file: 'Colegio San Juan Bosco_.png' },
      { slug: 'colegio-zarate', name: 'Colegio Zárate', file: 'COLEGIO ZARATE.jpg' },
    ],
  },
  {
    slug: 'salud',
    sector: 'Sector Salud',
    dir: 'Sector Salud',
    logos: [
      { slug: 'clinica-ortega', name: 'Clínica Ortega', file: 'Clínicas/Clínica Ortega_.jpg' },
      { slug: 'clinica-confia-salud', name: 'Clínica Confía Salud', file: 'Clínicas/Clínica Confía Salud.jfif' },
      { slug: 'hospital-daniel-alcides-carrion', name: 'Hospital Daniel Alcides Carrión', file: 'Hospitales/Hospital Regional Docente Clínico Quirúrgico Daniel Alcides Carrión.jfif' },
      { slug: 'hospital-ramiro-priale', name: 'Hospital Ramiro Prialé Prialé (EsSalud)', file: 'Hospitales/Hospital Nacional Ramiro Prialé Prialé (EsSalud).jpg' },
      { slug: 'hospital-el-carmen', name: 'Hospital El Carmen', file: 'Hospitales/Hospital El Carmen_.png' },
    ],
  },
  {
    slug: 'financiero',
    sector: 'Sector Financiero',
    dir: 'Sector Financiero',
    logos: [
      { slug: 'caja-huancayo', name: 'Caja Huancayo', file: 'Caja Huancayo.jpg' },
      { slug: 'caja-arequipa', name: 'Caja Arequipa', file: 'CAJA AREQUIPA.png' },
      { slug: 'caja-piura', name: 'Caja Piura', file: 'Caja Piura.png' },
      { slug: 'financiera-confianza', name: 'Financiera Confianza', file: 'Financiera Confianza_.png' },
    ],
  },
  {
    slug: 'publicas',
    sector: 'Instituciones Públicas',
    dir: 'Instituciones Públicas',
    logos: [
      { slug: 'poder-judicial', name: 'Poder Judicial del Perú', file: 'Poder Judicial del Perú_.jpg' },
      { slug: 'sath', name: 'SAT de Huancayo (SATH)', file: 'SATH.jpg' },
    ],
  },
  {
    slug: 'mineria',
    sector: 'Minería e Industria',
    dir: 'Minería e Industria',
    logos: [
      { slug: 'volcan', name: 'Volcan Compañía Minera S.A.A.', file: 'Volcan Compañía Minera S.A.A. .png' },
      { slug: 'chinalco', name: 'Minera Chinalco Perú S.A.', file: 'Minera Chinalco Perú S.A' },
      { slug: 'antamina', name: 'Compañía Minera Antamina S.A.', file: 'Compañía Minera Antamina S.A..jfif' },
    ],
  },
  {
    slug: 'construccion',
    sector: 'Construcción e Inmobiliario',
    dir: 'Construcción e Inmobiliario',
    logos: [
      { slug: 'golden-home', name: 'Golden Home Inmobiliaria', file: 'Golden Home Inmobiliaria_.png' },
      { slug: 'besco', name: 'Besco S.A.C.', file: 'Besco S.A.C_' },
      { slug: 'los-portales', name: 'Los Portales S.A.', file: 'Los Portales S.A._' },
    ],
  },
  {
    slug: 'transporte',
    sector: 'Transporte y Logística',
    dir: 'Transporte y Logística',
    logos: [
      { slug: 'transa', name: 'Transportes Nacionales S.A. – TRANSA', file: 'Transportes Nacionales S.A. – TRANSA_.png' },
      { slug: 'cruz-del-sur', name: 'Cruz del Sur', file: 'Cruz del Sur_.png' },
      { slug: 'transportes-linea', name: 'Transportes Línea S.A.', file: 'Transportes Línea S.A._' },
    ],
  },
  {
    slug: 'hoteleria',
    sector: 'Hotelería y Turismo',
    dir: 'Hotelería y Turismo',
    logos: [
      { slug: 'hotelera-del-centro', name: 'Compañía Hotelera del Centro', file: '•_Compañía Hotelera del Centro_.png' },
      { slug: 'hotel-gran-palma', name: 'Hotel Gran Palma Huancayo', file: 'Hotel Gran Palma Huancayo.jpg' },
    ],
  },
  {
    slug: 'automotrices',
    sector: 'Empresas Automotrices',
    dir: 'Empresas Automotrices',
    logos: [
      { slug: 'toyota', name: 'Toyota del Perú', file: 'Toyota del Perú_.png' },
      { slug: 'derco', name: 'Derco Perú', file: 'Derco Perú_.png' },
    ],
  },
  {
    slug: 'privadas',
    sector: 'Empresas Privadas',
    dir: 'Empresas Privadas',
    logos: [
      { slug: 'golden-home', name: 'Golden Home Inmobiliaria', file: 'Golden Home Inmobiliaria_.png' },
      { slug: 'transa', name: 'Transportes Nacionales S.A. – TRANSA', file: 'Transportes Nacionales S.A. – TRANSA_.png' },
    ],
  },
  {
    slug: 'retail',
    sector: 'Supermercados y Retail',
    dir: 'Supermercados y Retail',
    logos: [{ slug: 'mass', name: 'Mass', file: 'MASS.png' }],
  },
];

// 21 files carry a ".svg" extension but are really a garment photo plus a
// luminance mask, base64-embedded in an <svg> wrapper that cuts the garment out
// and frames it in a 1080×1080 viewBox. Extracting the raster by hand gives the
// uncut photo — a silhouette on solid black — so we hand the whole wrapper to
// sharp instead and let librsvg apply the mask and the transform. (Astro would
// otherwise pass the SVG straight through at ~1 MB each.)
//
// Photos are flattened onto white: the sources sit on white studio backgrounds,
// so a masked cut-out would be the odd one out on the page's tinted tiles.
async function convert(srcFile, destFile, { width, quality, flatten }) {
  mkdirSync(path.dirname(destFile), { recursive: true });
  const pipeline = sharp(readFileSync(srcFile)).resize({
    width,
    height: width,
    fit: 'inside',
    withoutEnlargement: true,
  });
  if (flatten) pipeline.flatten({ background: '#ffffff' });
  await pipeline.webp({ quality }).toFile(destFile);
  return statSync(destFile).size;
}

const stats = { in: 0, out: 0, files: 0, skipped: [] };

async function buildCatalog() {
  const manifest = [];
  for (const cat of CATEGORIES) {
    const catRoot = path.join(SRC_PRODUCTS, cat.dir);
    const items = [];
    for (const item of cat.items) {
      const images = [];
      if (item.dir) {
        const dir = path.join(catRoot, item.dir);
        if (!existsSync(dir)) {
          stats.skipped.push(`carpeta ausente: ${cat.dir}/${item.dir}`);
        } else {
          // Duplicates only ever matter inside one subfolder (the same photo
          // legitimately appears under two different product lines).
          const seen = new Set();
          const files = readdirSync(dir)
            .filter((f) => statSync(path.join(dir, f)).isFile())
            .sort();
          let n = 0;
          for (const f of files) {
            const src = path.join(dir, f);
            const hash = createHash('md5').update(readFileSync(src)).digest('hex');
            if (seen.has(hash)) {
              stats.skipped.push(`duplicado: ${cat.dir}/${item.dir}/${f}`);
              continue;
            }
            seen.add(hash);
            n += 1;
            const rel = path.join(cat.key, `${item.slug}-${n}.webp`);
            stats.in += statSync(src).size;
            stats.out += await convert(src, path.join(OUT_CATALOG, rel), {
              width: 1200,
              quality: 80,
              flatten: true,
            });
            stats.files += 1;
            images.push(rel.replace(/\\/g, '/'));
          }
        }
      }
      if (!images.length) stats.skipped.push(`sin imagen: ${cat.key}/${item.slug}`);
      items.push({ slug: item.slug, name: item.name, images });
    }
    manifest.push({ key: cat.key, items });
  }
  return manifest;
}

async function buildClients() {
  const manifest = [];
  for (const sector of CLIENT_SECTORS) {
    const logos = [];
    for (const logo of sector.logos) {
      const src = path.join(SRC_CLIENTS, sector.dir, logo.file);
      if (!existsSync(src)) {
        stats.skipped.push(`logo ausente: ${sector.dir}/${logo.file}`);
        continue;
      }
      const rel = path.join(sector.slug, `${logo.slug}.webp`);
      stats.in += statSync(src).size;
      // Logos keep their alpha: several are transparent PNGs whose lettering is
      // white, which would disappear if flattened onto the tile.
      stats.out += await convert(src, path.join(OUT_CLIENTS, rel), { width: 600, quality: 88 });
      stats.files += 1;
      logos.push({ slug: logo.slug, name: logo.name, image: rel.replace(/\\/g, '/') });
    }
    manifest.push({ slug: sector.slug, sector: sector.sector, logos });
  }
  return manifest;
}

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// Start clean so removing a source file actually removes its output.
for (const dir of [OUT_CATALOG, ...CLIENT_SECTORS.map((s) => path.join(OUT_CLIENTS, s.slug))]) {
  if (existsSync(dir)) rmSync(dir, { recursive: true });
}

const catalog = await buildCatalog();
const clients = await buildClients();

console.log(`\n${stats.files} imágenes convertidas — ${mb(stats.in)} → ${mb(stats.out)}\n`);
for (const cat of catalog) {
  const total = cat.items.reduce((n, i) => n + i.images.length, 0);
  console.log(`  ${cat.key.padEnd(15)} ${String(total).padStart(3)} img / ${cat.items.length} líneas`);
}
console.log('');
for (const sector of clients) {
  console.log(`  ${sector.slug.padEnd(15)} ${String(sector.logos.length).padStart(3)} logos`);
}
if (stats.skipped.length) {
  console.log(`\nSin imagen (${stats.skipped.length}):`);
  for (const s of stats.skipped) console.log(`  - ${s}`);
}
