import type { APIRoute } from 'astro';
import { verifyCredentials, createSessionToken, SESSION_COOKIE } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const user = String(form.get('user') ?? '');
  const password = String(form.get('password') ?? '');

  if (!verifyCredentials(user, password)) {
    return redirect('/admin/login?error=1');
  }

  cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: import.meta.env.PROD,
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return redirect('/admin');
};
