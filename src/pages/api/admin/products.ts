import type { APIRoute } from 'astro';
import db, { setCategoryImage, deleteCategoryImage } from '../../../db/client';
import { saveUploadedImage } from '../../../lib/upload';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');

  // Category image: upload an override, or reset back to the default.
  if (action === 'save_category_image') {
    const key = String(form.get('key') ?? '').trim();
    if (!key) {
      return redirect('/admin/productos?error=Categor%C3%ADa+no+v%C3%A1lida');
    }

    if (form.get('reset')) {
      deleteCategoryImage(key);
      return redirect('/admin/productos');
    }

    const imageFile = form.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
      return redirect('/admin/productos?error=Selecciona+una+imagen+para+la+categor%C3%ADa');
    }

    try {
      const imageUrl = await saveUploadedImage(imageFile);
      setCategoryImage(key, imageUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo subir la imagen';
      return redirect(`/admin/productos?error=${encodeURIComponent(message)}`);
    }

    return redirect('/admin/productos');
  }

  if (action === 'add') {
    const name = String(form.get('name') ?? '').trim();
    const category = String(form.get('category') ?? '').trim() || null;
    const description = String(form.get('description') ?? '').trim() || null;
    const imageFile = form.get('image') as File | null;

    if (!name) {
      return redirect('/admin/productos?error=El+nombre+es+obligatorio');
    }

    const imageUrl = imageFile && imageFile.size > 0 ? await saveUploadedImage(imageFile) : null;
    const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM products').get() as { m: number | null };

    db.prepare(
      'INSERT INTO products (name, category, image_url, description, sort_order, active) VALUES (?, ?, ?, ?, ?, 1)'
    ).run(name, category, imageUrl, description, (maxOrder.m ?? -1) + 1);

    return redirect('/admin/productos');
  }

  if (action === 'update') {
    const id = Number(form.get('id'));
    const name = String(form.get('name') ?? '').trim();
    const category = String(form.get('category') ?? '').trim() || null;
    const description = String(form.get('description') ?? '').trim() || null;
    const active = form.get('active') ? 1 : 0;
    const imageFile = form.get('image') as File | null;

    if (!name) {
      return redirect('/admin/productos?error=El+nombre+es+obligatorio');
    }

    if (imageFile && imageFile.size > 0) {
      const imageUrl = await saveUploadedImage(imageFile);
      db.prepare(
        'UPDATE products SET name = ?, category = ?, description = ?, active = ?, image_url = ? WHERE id = ?'
      ).run(name, category, description, active, imageUrl, id);
    } else {
      db.prepare('UPDATE products SET name = ?, category = ?, description = ?, active = ? WHERE id = ?').run(
        name,
        category,
        description,
        active,
        id
      );
    }

    return redirect('/admin/productos');
  }

  if (action === 'delete') {
    const id = Number(form.get('id'));
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return redirect('/admin/productos');
  }

  return redirect('/admin/productos');
};
