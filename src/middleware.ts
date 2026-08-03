import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, isValidSessionToken } from './lib/auth';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/api/admin/login'];

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!isAdminArea || PUBLIC_ADMIN_PATHS.includes(pathname)) {
    return next();
  }

  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    if (pathname.startsWith('/api/admin')) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login');
  }

  return next();
});
