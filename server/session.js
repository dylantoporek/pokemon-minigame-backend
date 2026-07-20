const crypto = require("crypto");

// Stateless HMAC-signed session cookie (stands in for Rails' cookie store).
const COOKIE_NAME = "pokemon_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret() {
  return process.env.SESSION_SECRET || "dev-only-insecure-secret";
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function verify(token) {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

function readSession(req) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE_NAME) return verify(decodeURIComponent(rest.join("=")));
  }
  return null;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
    maxAge: MAX_AGE_SECONDS * 1000,
    path: "/",
  };
}

function setSession(res, userId) {
  const token = sign({ user_id: userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS });
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

function clearSession(res) {
  res.cookie(COOKIE_NAME, "", { ...cookieOptions(), maxAge: 0 });
}

module.exports = { readSession, setSession, clearSession };
