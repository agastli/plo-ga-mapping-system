import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Session payload for password-authenticated users
 */
export type PasswordSessionPayload = {
  userId: number;
  username: string;
  role: "admin" | "editor" | "viewer";
};

/**
 * Create a JWT session token for password-authenticated users
 */
export async function createPasswordSession(
  payload: PasswordSessionPayload
): Promise<string> {
  const secretKey = new TextEncoder().encode(ENV.cookieSecret);
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + 365 * 24 * 60 * 60 * 1000) / 1000); // 1 year

  return new SignJWT({
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
    authType: "password", // Distinguish from OAuth sessions
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Verify a password session token and return the payload
 */
export async function verifyPasswordSession(
  token: string
): Promise<PasswordSessionPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    const { userId, username, role, authType } = payload as Record<string, unknown>;

    // Verify this is a password session (not OAuth)
    if (authType !== "password") {
      return null;
    }

    if (
      typeof userId !== "number" ||
      typeof username !== "string" ||
      (role !== "admin" && role !== "editor" && role !== "viewer")
    ) {
      return null;
    }

    return {
      userId,
      username,
      role,
    };
  } catch (error) {
    console.warn("[PasswordAuth] Session verification failed:", String(error));
    return null;
  }
}
