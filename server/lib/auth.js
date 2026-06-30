import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
const COOKIE = 'carazin_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12h

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${mac}`;
}

function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [data, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  // timing-safe compare
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || 'admin';
  if (!password) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function issueSession(res) {
  const token = sign({ role: 'admin', exp: Date.now() + MAX_AGE_MS });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE);
}

export function requireAdmin(req, res, next) {
  const session = verify(req.cookies?.[COOKIE]);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.admin = session;
  next();
}

export function isAuthed(req) {
  return !!verify(req.cookies?.[COOKIE]);
}
