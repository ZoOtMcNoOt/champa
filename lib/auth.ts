import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "champa_session";

const DEFAULT_DEV_PASSWORD = "champaisthebest";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "dev-only-secret-change-me-before-deploy";
}

function secureCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(now: number = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + SESSION_TTL_SECONDS;
  const payload = `${issuedAt}.${expiresAt}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [issuedAtRaw, expiresAtRaw, signature] = parts;
  const issuedAt = Number(issuedAtRaw);
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    return false;
  }
  if (Math.floor(Date.now() / 1000) >= expiresAt) {
    return false;
  }

  const payload = `${issuedAtRaw}.${expiresAtRaw}`;
  const expected = signPayload(payload);
  return secureCompare(signature, expected);
}

function verifyScryptHash(inputPassword: string, hashSpec: string): boolean {
  const parts = hashSpec.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  const salt = parts[1];
  const expectedHex = parts[2];
  if (!salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const derived = crypto.scryptSync(inputPassword, salt, expected.length);
  return secureCompare(derived.toString("hex"), expectedHex);
}

export function verifyPassword(password: string): boolean {
  const hashSpec = process.env.CHAMPA_PASSWORD_HASH;
  if (!hashSpec) {
    return secureCompare(password, DEFAULT_DEV_PASSWORD);
  }
  return verifyScryptHash(password, hashSpec);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}
