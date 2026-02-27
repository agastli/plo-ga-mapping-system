import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { ENV } from './_core/env';

// SMTP configuration for Hostinger
const SMTP_CONFIG = {
  host: 'smtp.hostinger.com',
  port: 587, // Use port 587 with STARTTLS (more reliable than 465)
  secure: false, // Use STARTTLS instead of SSL
  auth: {
    user: 'no-reply@gastli.org',
    pass: ENV.smtpPassword || process.env.SMTP_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  },
  connectionTimeout: 10000, // 10 second timeout
  greetingTimeout: 10000,
  socketTimeout: 10000,
};

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    try {
      transporter = nodemailer.createTransport(SMTP_CONFIG);
      console.log('[Email] SMTP transporter created successfully');
    } catch (error) {
      console.error('[Email] Failed to create SMTP transporter:', error);
      throw error;
    }
  }
  return transporter as Transporter;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  try {
    const resetUrl = `${process.env.VITE_OAUTH_PORTAL_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: '"PLO-GA Mapping System" <no-reply@gastli.org>',
      to,
      bcc: 'no-reply@gastli.org', // BCC admin on all outgoing emails
      subject: 'Password Reset Request - PLO-GA Mapping System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B1538; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              background-color: #8B1538; 
              color: white !important; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              <p>We received a request to reset your password for the PLO-GA Mapping System.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                ${resetUrl}
              </p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact your administrator.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Qatar University. All rights reserved.</p>
              <p>PLO-GA Mapping System | Academic Planning & Quality Assurance Office</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${username},

We received a request to reset your password for the PLO-GA Mapping System.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact your administrator.

© ${new Date().getFullYear()} Qatar University. All rights reserved.
PLO-GA Mapping System | Academic Planning & Quality Assurance Office
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`Password reset email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send password reset email to:', to);
    console.error('[Email] Error details:', error);
    // Don't throw - return false to indicate failure without crashing
    return false;
  }
}

/**
 * Send username reminder email
 */
export async function sendUsernameReminderEmail(
  to: string,
  username: string
): Promise<boolean> {
  try {
    const loginUrl = `https://plo-ga.gastli.org/login`;
    
    const mailOptions = {
      from: '"PLO-GA Mapping System" <no-reply@gastli.org>',
      to,
      bcc: 'no-reply@gastli.org', // BCC admin on all outgoing emails
      subject: 'Username Reminder - PLO-GA Mapping System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B1538; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .username-box {
              background-color: #fff;
              border: 2px solid #8B1538;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
              font-size: 18px;
              font-weight: bold;
            }
            .button { 
              display: inline-block; 
              background-color: #8B1538; 
              color: white !important; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Username Reminder</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested a reminder of your username for the PLO-GA Mapping System.</p>
              <div class="username-box">
                Your username is: ${username}
              </div>
              <p>You can use this username to log in to the system:</p>
              <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Go to Login Page</a>
              </p>
              <p>If you didn't request this information, please contact your administrator.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Qatar University. All rights reserved.</p>
              <p>PLO-GA Mapping System | Academic Planning & Quality Assurance Office</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello,

You requested a reminder of your username for the PLO-GA Mapping System.

Your username is: ${username}

You can use this username to log in at:
${loginUrl}

If you didn't request this information, please contact your administrator.

© ${new Date().getFullYear()} Qatar University. All rights reserved.
PLO-GA Mapping System | Academic Planning & Quality Assurance Office
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`Username reminder email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send username reminder email to:', to);
    console.error('[Email] Error details:', error);
    // Don't throw - return false to indicate failure without crashing
    return false;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    await getTransporter().verify();
    console.log('[Email] SMTP configuration is valid and connection successful');
    return true;
  } catch (error) {
    console.error('[Email] SMTP configuration test failed');
    console.error('[Email] Error details:', error);
    // Don't throw - return false to indicate failure without crashing
    return false;
  }
}

/**
 * Send welcome email to newly created user
 */
export async function sendWelcomeEmail(
  to: string,
  username: string,
  password: string,
  role: 'admin' | 'viewer' | 'editor'
): Promise<boolean> {
  try {
    const loginUrl = `https://plo-ga.gastli.org/login`;
    
    // Role-specific information
    const roleInfo = {
      admin: {
        title: 'System Administrator',
        description: 'As an Administrator, you have full access to all system features including user management, organizational structure configuration, program management, and analytics across the entire university.',
        responsibilities: [
          'Manage user accounts and access permissions',
          'Configure organizational structure (colleges, clusters, departments)',
          'Oversee all program mappings and analytics',
          'Monitor system-wide data quality and completeness',
        ],
      },
      viewer: {
        title: 'Viewer',
        description: 'As a Viewer, you can access dashboards and analytics for your assigned organizational units (college, cluster, department, or programs). You have read-only access to view program mappings and reports.',
        responsibilities: [
          'View program-level outcomes and graduate attributes mappings',
          'Access analytics and reports for your assigned units',
          'Monitor alignment scores and competency coverage',
          'Export reports for your assigned programs',
        ],
      },
      editor: {
        title: 'Editor',
        description: 'As an Editor, you can view and edit program mappings for your assigned organizational units. You have the same viewing privileges as a Viewer, plus the ability to modify program learning outcomes mappings.',
        responsibilities: [
          'Edit program learning outcomes (PLOs) mappings',
          'Update graduate attributes and competencies alignments',
          'Modify weighting factors and justifications',
          'View analytics and reports for your assigned units',
        ],
      },
    };

    const info = roleInfo[role];
    
    const mailOptions = {
      from: '"PLO-GA Mapping System" <no-reply@gastli.org>',
      to,
      bcc: 'no-reply@gastli.org', // BCC admin on all outgoing emails
      subject: 'Welcome to PLO-GA Mapping System - Your Account Has Been Created',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8B1538; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .credentials-box {
              background-color: #fff;
              border: 2px solid #8B1538;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .credential-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .credential-row:last-child {
              border-bottom: none;
            }
            .credential-label {
              font-weight: bold;
              color: #8B1538;
            }
            .credential-value {
              font-family: monospace;
              background: #f5f5f5;
              padding: 5px 10px;
              border-radius: 3px;
            }
            .role-badge {
              display: inline-block;
              background-color: #8B1538;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .info-section {
              background-color: #fff;
              padding: 20px;
              margin: 20px 0;
              border-left: 4px solid #8B1538;
            }
            .responsibilities {
              list-style: none;
              padding: 0;
            }
            .responsibilities li {
              padding: 8px 0;
              padding-left: 25px;
              position: relative;
            }
            .responsibilities li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #8B1538;
              font-weight: bold;
            }
            .button { 
              display: inline-block; 
              background-color: #8B1538; 
              color: white !important; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning-box {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PLO-GA Mapping System</h1>
              <p>Academic Planning & Quality Assurance Office</p>
            </div>
            <div class="content">
              <h2>Your Account Has Been Created</h2>
              <p>Hello,</p>
              <p>An administrator has created an account for you in the <strong>PLO-GA Mapping Management System</strong>.</p>
              
              <div class="info-section">
                <h3>About the System</h3>
                <p>The PLO-GA Mapping System is Qatar University's comprehensive platform for managing and analyzing the alignment between Program Learning Outcomes (PLOs) and Graduate Attributes (GAs). This system helps ensure that our academic programs meet quality standards and accreditation requirements by:</p>
                <ul>
                  <li>Mapping PLOs to Graduate Attributes and Competencies</li>
                  <li>Tracking alignment scores and coverage across programs</li>
                  <li>Generating analytics and reports for quality assurance</li>
                  <li>Supporting continuous program improvement</li>
                </ul>
              </div>

              <div class="credentials-box">
                <h3 style="margin-top: 0;">Your Login Credentials</h3>
                <div class="credential-row">
                  <span class="credential-label">Username:</span>
                  <span class="credential-value">${username}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Password:</span>
                  <span class="credential-value">${password}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">Role:</span>
                  <span class="role-badge">${info.title}</span>
                </div>
              </div>

              <div class="warning-box">
                <strong>⚠️ Important Security Notice:</strong><br>
                Please change your password immediately after your first login. You can do this by accessing your profile settings after logging in.
              </div>

              <div class="info-section">
                <h3>Your Role: ${info.title}</h3>
                <p>${info.description}</p>
                <h4>Your Responsibilities:</h4>
                <ul class="responsibilities">
                  ${info.responsibilities.map(r => `<li>${r}</li>`).join('')}
                </ul>
              </div>

              <h3>Getting Started</h3>
              <ol>
                <li>Click the button below to access the login page</li>
                <li>Enter your username and password</li>
                <li>Change your password in your profile settings</li>
                <li>Explore your dashboard and assigned programs</li>
              </ol>

              <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Login to System</a>
              </p>

              <p>If you have any questions or need assistance, please contact the system administrator or the Academic Planning & Quality Assurance Office.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Qatar University. All rights reserved.</p>
              <p>PLO-GA Mapping System | Academic Planning & Quality Assurance Office</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to PLO-GA Mapping System
Academic Planning & Quality Assurance Office

Your Account Has Been Created
==============================

Hello,

An administrator has created an account for you in the PLO-GA Mapping Management System.

ABOUT THE SYSTEM
----------------
The PLO-GA Mapping System is Qatar University's comprehensive platform for managing and analyzing the alignment between Program Learning Outcomes (PLOs) and Graduate Attributes (GAs). This system helps ensure that our academic programs meet quality standards and accreditation requirements.

YOUR LOGIN CREDENTIALS
-----------------------
Username: ${username}
Password: ${password}
Role: ${info.title}

⚠️ IMPORTANT SECURITY NOTICE:
Please change your password immediately after your first login. You can do this by accessing your profile settings after logging in.

YOUR ROLE: ${info.title}
${info.description}

Your Responsibilities:
${info.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

GETTING STARTED
---------------
1. Visit the login page: ${loginUrl}
2. Enter your username and password
3. Change your password in your profile settings
4. Explore your dashboard and assigned programs

If you have any questions or need assistance, please contact the system administrator or the Academic Planning & Quality Assurance Office.

© ${new Date().getFullYear()} Qatar University. All rights reserved.
PLO-GA Mapping System | Academic Planning & Quality Assurance Office
      `,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`Welcome email sent to: ${to} (${role})`);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send welcome email to:', to);
    console.error('[Email] Error details:', error);
    // Don't throw - return false to indicate failure without crashing
    return false;
  }
}
