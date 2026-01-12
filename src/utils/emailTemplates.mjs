/**
 * Email Templates Service
 * Provides formatted HTML emails for various notifications
 * Uses CAHSAI brand colors
 */

// Color Constants
const COLORS = {
  PRIMARY: '#6F8375',      // Muted Sage Green
  ACCENT: '#E8F1E8',       // Very Light Green
  TEXT: '#181D27',         // Dark Navy
  SECONDARY_TEXT: '#434342', // Dark Gray
  BORDER: '#D5D7DA',       // Light Gray
  HOVER: '#5a6b60',        // Muted Gray
  WHITE: '#FFFFFF',
  LIGHT_BG: '#F9FAFA',
};

// OTP Verification Email Template
export const otpEmailTemplate = (userName, otp, expiryMinutes = 10) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.HOVER} 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: ${COLORS.WHITE}; margin: 0; font-size: 24px;">Email Verification</h1>
      </div>

      <!-- Body -->
      <div style="background-color: ${COLORS.LIGHT_BG}; padding: 40px; border-radius: 0 0 8px 8px;">
        <p style="color: ${COLORS.TEXT}; font-size: 16px; margin-bottom: 20px;">
          Hello <strong>${userName || 'User'}</strong>,
        </p>

        <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
          Thank you for signing up! To verify your email and complete your account setup, please use the OTP (One-Time Password) below:
        </p>

        <!-- OTP Code -->
        <div style="background-color: ${COLORS.WHITE}; border: 2px solid ${COLORS.PRIMARY}; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: ${COLORS.SECONDARY_TEXT}; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
          <h2 style="color: ${COLORS.PRIMARY}; margin: 10px 0; font-size: 48px; font-weight: bold; letter-spacing: 5px; font-family: 'Courier New', monospace;">
            ${otp}
          </h2>
          <p style="color: ${COLORS.SECONDARY_TEXT}; margin: 10px 0 0 0; font-size: 13px;">
            This code will expire in <strong>${expiryMinutes} minutes</strong>
          </p>
        </div>

        <!-- Instructions -->
        <div style="background-color: ${COLORS.ACCENT}; padding: 20px; border-left: 4px solid ${COLORS.PRIMARY}; margin-bottom: 30px; border-radius: 4px;">
          <h3 style="color: ${COLORS.PRIMARY}; margin-top: 0; font-size: 14px;">How to use:</h3>
          <ol style="color: ${COLORS.TEXT}; padding-left: 20px; margin: 10px 0 0 0;">
            <li>Copy the 6-digit code above</li>
            <li>Return to the app and enter this code</li>
            <li>Click "Verify" to confirm your email</li>
          </ol>
        </div>

        <!-- Security Note -->
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 30px; border-radius: 4px;">
          <p style="color: #856404; margin: 0; font-size: 13px;">
            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. CAHSAI staff will never ask for your OTP.
          </p>
        </div>

        <!-- FAQ -->
        <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
          <strong>Didn't request this code?</strong> If you didn't sign up for this account, please ignore this email. Your email will not be verified without entering this code.
        </p>

        <!-- Footer -->
        <div style="border-top: 1px solid ${COLORS.BORDER}; padding-top: 20px; text-align: center;">
          <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 12px; margin: 0;">
            © 2026 CAHSAI. All rights reserved.<br>
            If you have questions, contact us at <a href="mailto:support@cahsai.com" style="color: ${COLORS.PRIMARY}; text-decoration: none;">support@cahsai.com</a>
          </p>
        </div>
      </div>
    </div>
  `;
};

// Password Reset OTP Email Template
export const passwordResetEmailTemplate = (userName, otp, expiryMinutes = 15) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.HOVER} 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: ${COLORS.WHITE}; margin: 0; font-size: 24px;">Password Reset Request</h1>
      </div>

      <!-- Body -->
      <div style="background-color: ${COLORS.LIGHT_BG}; padding: 40px; border-radius: 0 0 8px 8px;">
        <p style="color: ${COLORS.TEXT}; font-size: 16px; margin-bottom: 20px;">
          Hi <strong>${userName || 'User'}</strong>,
        </p>

        <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset your password. To proceed with resetting your password, please use the verification code below:
        </p>

        <!-- OTP Code -->
        <div style="background-color: ${COLORS.WHITE}; border: 2px solid ${COLORS.PRIMARY}; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
          <p style="color: ${COLORS.SECONDARY_TEXT}; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Reset Code</p>
          <h2 style="color: ${COLORS.PRIMARY}; margin: 10px 0; font-size: 48px; font-weight: bold; letter-spacing: 5px; font-family: 'Courier New', monospace;">
            ${otp}
          </h2>
          <p style="color: ${COLORS.SECONDARY_TEXT}; margin: 10px 0 0 0; font-size: 13px;">
            This code expires in <strong>${expiryMinutes} minutes</strong>
          </p>
        </div>

        <!-- Instructions -->
        <div style="background-color: ${COLORS.ACCENT}; padding: 20px; border-left: 4px solid ${COLORS.PRIMARY}; margin-bottom: 30px; border-radius: 4px;">
          <h3 style="color: ${COLORS.PRIMARY}; margin-top: 0; font-size: 14px;">Steps to reset your password:</h3>
          <ol style="color: ${COLORS.TEXT}; padding-left: 20px; margin: 10px 0 0 0;">
            <li>Enter this code on the password reset page</li>
            <li>Create a new strong password</li>
            <li>Confirm your new password</li>
          </ol>
        </div>

        <!-- Security Note -->
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 30px; border-radius: 4px;">
          <p style="color: #856404; margin: 0; font-size: 13px;">
            <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email and your account will remain secure.
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid ${COLORS.BORDER}; padding-top: 20px; text-align: center;">
          <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 12px; margin: 0;">
            © 2026 CAHSAI. All rights reserved.<br>
            If you have questions, contact us at <a href="mailto:support@cahsai.com" style="color: ${COLORS.PRIMARY}; text-decoration: none;">support@cahsai.com</a>
          </p>
        </div>
      </div>
    </div>
  `;
};

// Welcome Email Template
export const welcomeEmailTemplate = (firstName) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.HOVER} 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: ${COLORS.WHITE}; margin: 0; font-size: 28px;">🎉 Welcome to CAHSAI!</h1>
      </div>

      <!-- Body -->
      <div style="background-color: ${COLORS.LIGHT_BG}; padding: 40px; border-radius: 0 0 8px 8px;">
        <p style="color: ${COLORS.TEXT}; font-size: 16px; margin-bottom: 20px;">
          Hello <strong>${firstName || 'User'}</strong>,
        </p>

        <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
          Welcome to CAHSAI! We're thrilled to have you join our community. Your account has been successfully created and verified.
        </p>

        <!-- Features -->
        <div style="background-color: ${COLORS.WHITE}; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid ${COLORS.BORDER};">
          <h3 style="color: ${COLORS.PRIMARY}; margin-top: 0; font-size: 16px; margin-bottom: 20px;">Get Started with These Features:</h3>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <div style="display: flex; align-items: flex-start;">
              <span style="color: ${COLORS.PRIMARY}; font-size: 20px; margin-right: 12px;">📋</span>
              <div>
                <strong style="color: ${COLORS.TEXT};">Browse Listings</strong>
                <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 13px; margin: 5px 0 0 0;">Explore available properties and find your perfect match</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <span style="color: ${COLORS.PRIMARY}; font-size: 20px; margin-right: 12px;">📅</span>
              <div>
                <strong style="color: ${COLORS.TEXT};">Schedule Tours</strong>
                <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 13px; margin: 5px 0 0 0;">Book tours at your convenience with property managers</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <span style="color: ${COLORS.PRIMARY}; font-size: 20px; margin-right: 12px;">💬</span>
              <div>
                <strong style="color: ${COLORS.TEXT};">Connect & Communicate</strong>
                <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 13px; margin: 5px 0 0 0;">Message agents and property owners directly</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://cahsai.com" style="background: linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.HOVER} 100%); color: ${COLORS.WHITE}; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid ${COLORS.BORDER}; padding-top: 20px; text-align: center;">
          <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 12px; margin: 0;">
            © 2026 CAHSAI. All rights reserved.<br>
            Questions? Contact us at <a href="mailto:support@cahsai.com" style="color: ${COLORS.PRIMARY}; text-decoration: none;">support@cahsai.com</a>
          </p>
        </div>
      </div>
    </div>
  `;
};

// Generic Notification Email Template
export const notificationEmailTemplate = (title, userName, message, details = []) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.HOVER} 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: ${COLORS.WHITE}; margin: 0; font-size: 24px;">📬 ${title}</h1>
      </div>

      <!-- Body -->
      <div style="background-color: ${COLORS.LIGHT_BG}; padding: 40px; border-radius: 0 0 8px 8px;">
        <p style="color: ${COLORS.TEXT}; font-size: 16px; margin-bottom: 20px;">
          Hello <strong>${userName || 'User'}</strong>,
        </p>

        <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
          ${message}
        </p>

        ${details.length > 0 ? `
          <div style="background-color: ${COLORS.WHITE}; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid ${COLORS.PRIMARY};">
            ${details.map(detail => `
              <p style="color: ${COLORS.TEXT}; margin: 10px 0;">
                <strong>${detail.label}:</strong> ${detail.value}
              </p>
            `).join('')}
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="border-top: 1px solid ${COLORS.BORDER}; padding-top: 20px; text-align: center;">
          <p style="color: ${COLORS.SECONDARY_TEXT}; font-size: 12px; margin: 0;">
            © 2026 CAHSAI. All rights reserved.<br>
            If you have questions, contact us at <a href="mailto:support@cahsai.com" style="color: ${COLORS.PRIMARY}; text-decoration: none;">support@cahsai.com</a>
          </p>
        </div>
      </div>
    </div>
  `;
};
