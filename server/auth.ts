import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users, type User } from '../drizzle/schema';
import { getDb } from './db';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate user with username and password
 * Returns user object if successful, null otherwise
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  // Find user by username
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user || !user.password) {
    return null;
  }

  // Block deactivated accounts before checking password
  if (!user.isActive) {
    throw new Error('ACCOUNT_DISABLED');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return user;
}

/**
 * Create a new user with username and password
 */
export async function createUser(data: {
  username: string;
  password: string;
  email?: string;
  name?: string;
  role?: 'admin' | 'viewer' | 'editor';
}): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const now = new Date();
  const result = await db.insert(users).values({
    username: data.username,
    password: hashedPassword,
    openId: null,
    email: data.email || null,
    name: data.name || null,
    role: data.role || 'viewer',
    loginMethod: 'password',
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  });

  // Fetch and return created user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, result[0].insertId));

  return user;
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Check if username exists
 */
export async function usernameExists(username: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return !!user;
}
