-- Migration: Add username and password authentication
-- Date: 2026-02-25
-- Description: Add username and password fields to users table for traditional authentication

-- Add username column (unique)
ALTER TABLE `users` ADD COLUMN `username` VARCHAR(64) UNIQUE AFTER `id`;

-- Add password column (for bcrypt hash)
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) AFTER `username`;

-- Make openId optional (nullable) since users can now login with username/password
ALTER TABLE `users` MODIFY COLUMN `openId` VARCHAR(64) UNIQUE;

-- Create admin user
-- Password: AdelJapan@1987
-- Bcrypt hash generated with salt rounds = 10
INSERT INTO `users` (
  `username`,
  `password`,
  `email`,
  `name`,
  `role`,
  `loginMethod`,
  `createdAt`,
  `updatedAt`,
  `lastSignedIn`
) VALUES (
  'admin',
  '$2a$10$YQRkN6vHxGjKX8PZE.Zj3OYxH8qZGJQX8qZGJQX8qZGJQX8qZGJQe',
  'adel.gastli@gmail.com',
  'Admin User',
  'admin',
  'password',
  NOW(),
  NOW(),
  NOW()
);

-- Note: The password hash above is a placeholder. 
-- After running this migration, you need to run the create-admin-user.js script
-- to set the correct password hash for 'AdelJapan@1987'
