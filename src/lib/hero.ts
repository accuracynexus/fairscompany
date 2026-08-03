import { getImage } from 'astro:assets';
import type { Banner } from '../db/client';

// Baked default images for the 4 hero slides (desktop + mobile/responsive).
// Slides 1 & 2 ("cambiantes") have an empty area for the editable text overlay;
// slides 3 & 4 ("fijas") are self-contained designs with baked-in text.
import slide1Desktop from '../img/hero/slide-1-personas.png';
import slide1Mobile from '../img/hero/slide-1-personas-mobile.png';
import slide2Desktop from '../img/hero/slide-2-obrero.png';
import slide2Mobile from '../img/hero/slide-2-obrero-mobile.png';
import slide3Desktop from '../img/hero/slide-3-experiencia.png';
import slide3Mobile from '../img/hero/slide-3-experiencia-mobile.png';
import slide4Desktop from '../img/hero/slide-4-peru.png';
import slide4Mobile from '../img/hero/slide-4-peru-mobile.png';

const BAKED: { desktop: ImageMetadata; mobile: ImageMetadata }[] = [
  { desktop: slide1Desktop, mobile: slide1Mobile },
  { desktop: slide2Desktop, mobile: slide2Mobile },
  { desktop: slide3Desktop, mobile: slide3Mobile },
  { desktop: slide4Desktop, mobile: slide4Mobile },
];

// Fallback text for the two editable slides, used only if the DB row is missing.
const DEFAULT_TEXT = [
  {
    title: 'PERSONALIZAMOS CADA PRENDA SEGÚN LA IDENTIDAD DE TU MARCA',
    subtitle: 'Bordados, estampados, colores y acabados desarrollados especialmente para ti.',
    cta: 'CONOCE NUESTROS SERVICIOS',
    link: '/nosotros',
  },
  {
    title: 'UNIFORMES INDUSTRIALES Y DE SEGURIDAD A TU MEDIDA',
    subtitle: 'Alta visibilidad, resistencia y tu identidad en cada prenda.',
    cta: 'SOLICITA TU COTIZACIÓN',
    link: '/contacto',
  },
];

// Optimise the baked images once at module load (same pattern as db/client.ts).
const BAKED_OPT = await Promise.all(
  BAKED.map(async (b) => ({
    desktop: (await getImage({ src: b.desktop, width: 1920, format: 'webp', quality: 78 })).src,
    mobile: (await getImage({ src: b.mobile, width: 900, format: 'webp', quality: 80 })).src,
  }))
);

const isUpload = (value: string | null | undefined): value is string =>
  !!value && value.startsWith('/uploads/');

export interface HeroSlideView {
  index: number;
  editable: boolean;
  image: string;
  mobileImage: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}

// Turn the stored hero rows into ready-to-render slide views: each image is the
// uploaded override when present, otherwise the optimised baked default. Slides
// 0 and 1 also resolve their editable text/button (with a code fallback).
export function resolveHeroSlides(rows: Banner[]): HeroSlideView[] {
  return [0, 1, 2, 3].map((i) => {
    const row = rows.find((r) => r.sort_order === i);
    const editable = i < 2;
    const text = DEFAULT_TEXT[i];
    return {
      index: i,
      editable,
      image: isUpload(row?.image_url) ? (row!.image_url as string) : BAKED_OPT[i].desktop,
      mobileImage: isUpload(row?.mobile_image_url) ? (row!.mobile_image_url as string) : BAKED_OPT[i].mobile,
      title: editable ? row?.title ?? text?.title ?? '' : '',
      subtitle: editable ? row?.subtitle ?? text?.subtitle ?? '' : '',
      cta: editable ? row?.cta_text ?? text?.cta ?? '' : '',
      link: editable ? row?.link_url || text?.link || '/contacto' : '',
    };
  });
}
