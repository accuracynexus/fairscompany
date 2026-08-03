import type { APIRoute } from 'astro';
import db from '../../../db/client';
import { saveUploadedImage } from '../../../lib/upload';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');

  // Save one hero slide (slot 0..3): optional new desktop/mobile image, plus
  // the text/button overlay for the editable slots (0 and 1).
  if (action === 'save_slide') {
    const slot = Number(form.get('slot'));
    if (!Number.isInteger(slot) || slot < 0 || slot > 3) {
      return redirect('/admin/banners?error=Slide+no+v%C3%A1lido');
    }

    const existing = db
      .prepare("SELECT * FROM banners WHERE type = 'hero' AND sort_order = ?")
      .get(slot) as { id: number; image_url: string; mobile_image_url: string | null } | undefined;

    const desktopFile = form.get('image') as File | null;
    const mobileFile = form.get('mobile_image') as File | null;

    let imageUrl = existing?.image_url ?? `code:hero-${slot + 1}`;
    let mobileImageUrl = existing?.mobile_image_url ?? null;

    try {
      if (desktopFile && desktopFile.size > 0) {
        imageUrl = await saveUploadedImage(desktopFile);
      }
      if (mobileFile && mobileFile.size > 0) {
        mobileImageUrl = await saveUploadedImage(mobileFile);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo subir la imagen';
      return redirect(`/admin/banners?error=${encodeURIComponent(message)}`);
    }

    // "Restaurar por defecto" checkboxes win over any uploaded file.
    if (form.get('reset_desktop')) {
      imageUrl = `code:hero-${slot + 1}`;
    }
    if (form.get('reset_mobile')) {
      mobileImageUrl = null;
    }

    // Text/button only applies to the editable slides (0 and 1).
    const editable = slot < 2;
    const title = editable ? String(form.get('title') ?? '').trim() || null : null;
    const subtitle = editable ? String(form.get('subtitle') ?? '').trim() || null : null;
    const ctaText = editable ? String(form.get('cta_text') ?? '').trim() || null : null;
    const linkUrl = editable ? String(form.get('link_url') ?? '').trim() || null : null;

    if (existing) {
      db.prepare(
        'UPDATE banners SET image_url = ?, mobile_image_url = ?, title = ?, subtitle = ?, cta_text = ?, link_url = ?, active = 1 WHERE id = ?'
      ).run(imageUrl, mobileImageUrl, title, subtitle, ctaText, linkUrl, existing.id);
    } else {
      db.prepare(
        "INSERT INTO banners (type, image_url, mobile_image_url, link_url, title, subtitle, cta_text, sort_order, active) VALUES ('hero', ?, ?, ?, ?, ?, ?, ?, 1)"
      ).run(imageUrl, mobileImageUrl, linkUrl, title, subtitle, ctaText, slot);
    }

    return redirect('/admin/banners?saved=1');
  }

  return redirect('/admin/banners');
};
