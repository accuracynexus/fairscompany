import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'fc_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function getSecret(): string {
  // process.env (not import.meta.env) so this is read at request time, not
  // inlined at build time — required for the value to come from the
  // container's runtime environment rather than whatever .env existed at build.
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set in .env');
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyCredentials(user: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER ?? '';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!expectedUser || !expectedPassword) return false;
  return safeEqual(user, expectedUser) && safeEqual(password, expectedPassword);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${expires}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expectedSignature = sign(payload);
  if (!safeEqual(signature, expectedSignature)) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  return true;
}
