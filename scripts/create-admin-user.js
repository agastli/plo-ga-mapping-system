/**
 * Script to create admin user with correct password hash
 * Run this after the database migration
 * 
 * Usage: node scripts/create-admin-user.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'AdelJapan@1987';
const ADMIN_EMAIL = 'adel.gastli@gmail.com';
const ADMIN_NAME = 'Admin User';

async function createAdminUser() {
  let connection;
  
  try {
    // Get database connection from environment
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to database...');
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('Connected successfully');

    // Generate password hash
    console.log('Generating password hash...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    console.log('Password hash generated');

    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [ADMIN_USERNAME]
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists. Updating password...');
      await connection.execute(
        'UPDATE users SET password = ?, email = ?, name = ?, role = ?, updatedAt = NOW() WHERE username = ?',
        [passwordHash, ADMIN_EMAIL, ADMIN_NAME, 'admin', ADMIN_USERNAME]
      );
      console.log('Admin user password updated successfully');
    } else {
      console.log('Creating new admin user...');
      await connection.execute(
        `INSERT INTO users (username, password, email, name, role, loginMethod, createdAt, updatedAt, lastSignedIn)
         VALUES (?, ?, ?, ?, 'admin', 'password', NOW(), NOW(), NOW())`,
        [ADMIN_USERNAME, passwordHash, ADMIN_EMAIL, ADMIN_NAME]
      );
      console.log('Admin user created successfully');
    }

    console.log('\n✅ Admin user setup complete!');
    console.log('Username:', ADMIN_USERNAME);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Email:', ADMIN_EMAIL);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();
