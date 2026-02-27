import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
import * as db from './db';
import { hashPassword } from './auth';

describe('User Profile & Password Change', () => {
  let testUserId: number;
  let testUsername: string;
  const testPassword = 'testpass123';
  let hashedPassword: string;

  beforeAll(async () => {
    // Create a test user
    testUsername = `testuser_${Date.now()}`;
    hashedPassword = await hashPassword(testPassword);
    
    testUserId = await db.createUser({
      username: testUsername,
      password: hashedPassword,
      name: 'Test User',
      email: 'test@example.com',
      role: 'viewer',
    });
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      await db.deleteUser(testUserId);
    }
  });

  describe('updateProfile', () => {
    it('should update user profile name and email', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          username: testUsername,
          role: 'viewer',
        },
      } as TrpcContext);

      const result = await caller.auth.updateProfile({
        name: 'Updated Name',
        email: 'updated@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Profile updated successfully');

      // Verify the update in database
      const user = await db.getUserById(testUserId);
      expect(user?.name).toBe('Updated Name');
      expect(user?.email).toBe('updated@example.com');
    });

    it('should update only name when email is not provided', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          username: testUsername,
          role: 'viewer',
        },
      } as TrpcContext);

      const result = await caller.auth.updateProfile({
        name: 'Name Only Update',
      });

      expect(result.success).toBe(true);

      const user = await db.getUserById(testUserId);
      expect(user?.name).toBe('Name Only Update');
    });

    it('should update only email when name is not provided', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          username: testUsername,
          role: 'viewer',
        },
      } as TrpcContext);

      const result = await caller.auth.updateProfile({
        email: 'email-only@example.com',
      });

      expect(result.success).toBe(true);

      const user = await db.getUserById(testUserId);
      expect(user?.email).toBe('email-only@example.com');
    });

    it('should require authentication', async () => {
      const caller = appRouter.createCaller({
        user: null,
      } as TrpcContext);

      await expect(
        caller.auth.updateProfile({
          name: 'Should Fail',
        })
      ).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    it('should change password with correct current password', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          username: testUsername,
          role: 'viewer',
        },
      } as TrpcContext);

      const newPassword = 'newpass456';
      const result = await caller.auth.changePassword({
        currentPassword: testPassword,
        newPassword,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password changed successfully');

      // Verify we can authenticate with new password
      const { authenticateUser } = await import('./auth');
      const user = await authenticateUser(testUsername, newPassword);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(testUserId);

      // Update the password back for other tests
      const rehashedPassword = await hashPassword(testPassword);
      await db.updateUserPassword(testUserId, rehashedPassword);
    });

    it('should reject incorrect current password', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          username: testUsername,
          role: 'viewer',
        },
      } as TrpcContext);

      await expect(
        caller.auth.changePassword({
          currentPassword: 'wrongpassword',
          newPassword: 'newpass789',
        })
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should require authentication', async () => {
      const caller = appRouter.createCaller({
        user: null,
      } as TrpcContext);

      await expect(
        caller.auth.changePassword({
          currentPassword: testPassword,
          newPassword: 'newpass789',
        })
      ).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const caller = appRouter.createCaller({
        user: {
          id: testUserId,
          username: testUsername,
          role: 'viewer',
        },
      } as TrpcContext);

      await expect(
        caller.auth.changePassword({
          currentPassword: testPassword,
          newPassword: '12345', // Only 5 characters
        })
      ).rejects.toThrow();
    });
  });
});
