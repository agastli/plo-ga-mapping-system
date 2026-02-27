import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// SMTP configuration for Hostinger
const SMTP_CONFIG = {
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'no-reply@gastli.org',
    pass: process.env.SMTP_PASSWORD || process.env.DATABASE_URL?.match(/:(.*?)@/)?.[1] || '',
  },
};

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
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
              color: white; 
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
    console.error('Error sending password reset email:', error);
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
    const loginUrl = `${process.env.VITE_OAUTH_PORTAL_URL}/login`;
    
    const mailOptions = {
      from: '"PLO-GA Mapping System" <no-reply@gastli.org>',
      to,
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
              color: white; 
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
    console.error('Error sending username reminder email:', error);
    return false;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<boolean> {
  try {
    await getTransporter().verify();
    console.log('SMTP configuration is valid');
    return true;
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return false;
  }
}
