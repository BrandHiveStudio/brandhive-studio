import nodemailer, { type Transporter } from "nodemailer";

function getSmtpTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465 (SSL), false for port 587 (STARTTLS)
    auth: {
      user,
      pass,
    },
  });
}

function getSender(): string {
  return (
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER
      ? `BrandHive Studio <${process.env.SMTP_USER}>`
      : "BrandHive Studio <brandhive.studio.lk@gmail.com>")
  );
}

interface SendPasswordResetParams {
  to: string;
  resetUrl: string;
  adminName: string;
}

interface SendEmailVerificationParams {
  to: string;
  verifyUrl: string;
  adminName: string;
}

/**
 * Dispatches a cryptographically secure password reset link to an administrative user via SMTP.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  adminName,
}: SendPasswordResetParams): Promise<{ success: boolean; error?: string }> {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    console.warn("⚠️ SMTP credentials not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD). Password reset email was not dispatched.");
    return { success: false, error: "SMTP email delivery service is not configured." };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reset Administrative Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0f4f8;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050608; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0b0f14; border: 1px solid #1c2633; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center;">
                  <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #16C7FF, #0D85FF); color: #050608; font-weight: 800; font-size: 18px; margin-bottom: 12px;">BH</div>
                  <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">BrandHive Studio</h1>
                  <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #16C7FF; font-weight: 600;">Admin Security Service</p>
                </td>
              </tr>
              <!-- Content Body -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">Password Reset Request</h2>
                  <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #94a3b8;">
                    Hello <strong style="color: #ffffff;">${adminName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #94a3b8;">
                    A request was submitted to reset your administrative portal password. Click the button below to establish a new password for your account:
                  </p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #16C7FF, #0D85FF); color: #050608; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; letter-spacing: 0.2px; box-shadow: 0 4px 20px rgba(22,199,255,0.35);">
                          Reset My Password &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: rgba(22, 199, 255, 0.05); border: 1px solid rgba(22, 199, 255, 0.15); border-radius: 10px; padding: 14px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: #7dd3fc;">
                      ⏱️ <strong>Security Notice:</strong> This link is single-use and expires in <strong>1 hour</strong>. After successful reset, all active administrative sessions will be invalidated across all devices.
                    </p>
                  </div>
                  <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">If the button above does not open, copy and paste this link into your browser:</p>
                  <p style="margin: 0; font-size: 11px; word-break: break-all; color: #16C7FF;">
                    <a href="${resetUrl}" style="color: #16C7FF; text-decoration: underline;">${resetUrl}</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #475569; line-height: 16px;">
                    If you did not request this password reset, no action is required and your credentials remain safe.
                  </p>
                  <p style="margin: 6px 0 0; font-size: 11px; color: #334155;">
                    BrandHive Studio &bull; Colombo, Sri Lanka &bull; https://brandhivestudio.com.lk
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getSender(),
      to,
      subject: "🔐 BrandHive Studio — Reset Your Administrative Password",
      html,
    });

    if (!info || !info.messageId) {
      console.error("❌ SMTP transmission did not return a valid messageId for password reset.");
      return { success: false, error: "SMTP server did not acknowledge message delivery." };
    }

    return { success: true };
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : "Unknown SMTP transmission error";
    // Sanitize any password leakage from error message
    const sanitized = rawMessage.replace(/pass(word)?[:=]\s*\S+/gi, "password=[REDACTED]");
    console.error("❌ Failed to send password reset email via SMTP:", sanitized);
    return { success: false, error: `Email delivery failed: ${sanitized}` };
  }
}

/**
 * Dispatches an email verification link to verify and activate a new administrative email address via SMTP.
 */
export async function sendEmailVerificationEmail({
  to,
  verifyUrl,
  adminName,
}: SendEmailVerificationParams): Promise<{ success: boolean; error?: string }> {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    console.warn("⚠️ SMTP credentials not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD). Verification email was not dispatched.");
    return { success: false, error: "SMTP email delivery service is not configured." };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Verify New Admin Email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0f4f8;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050608; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0b0f14; border: 1px solid #1c2633; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: center;">
                  <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #16C7FF, #0D85FF); color: #050608; font-weight: 800; font-size: 18px; margin-bottom: 12px;">BH</div>
                  <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">BrandHive Studio</h1>
                  <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #16C7FF; font-weight: 600;">Admin Security Service</p>
                </td>
              </tr>
              <!-- Content Body -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #ffffff;">Confirm Your New Email Address</h2>
                  <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #94a3b8;">
                    Hello <strong style="color: #ffffff;">${adminName}</strong>,
                  </p>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #94a3b8;">
                    You recently initiated an administrative email change for BrandHive Studio. To activate this new address (<strong style="color: #16C7FF;">${to}</strong>), please verify your ownership by clicking below:
                  </p>
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                    <tr>
                      <td align="center">
                        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(90deg, #16C7FF, #0D85FF); color: #050608; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; letter-spacing: 0.2px; box-shadow: 0 4px 20px rgba(22,199,255,0.35);">
                          Confirm & Activate Email &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: rgba(22, 199, 255, 0.05); border: 1px solid rgba(22, 199, 255, 0.15); border-radius: 10px; padding: 14px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; line-height: 18px; color: #7dd3fc;">
                      ⏱️ <strong>Security Notice:</strong> This verification link is single-use and expires in <strong>2 hours</strong>. Your admin email will not be modified until this link is accessed.
                    </p>
                  </div>
                  <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">If the button above does not open, copy and paste this link into your browser:</p>
                  <p style="margin: 0; font-size: 11px; word-break: break-all; color: #16C7FF;">
                    <a href="${verifyUrl}" style="color: #16C7FF; text-decoration: underline;">${verifyUrl}</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #475569; line-height: 16px;">
                    If you did not request this change, please ignore this email or notify your system administrator.
                  </p>
                  <p style="margin: 6px 0 0; font-size: 11px; color: #334155;">
                    BrandHive Studio &bull; Colombo, Sri Lanka &bull; https://brandhivestudio.com.lk
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: getSender(),
      to,
      subject: "✉️ BrandHive Studio — Verify Your New Admin Email",
      html,
    });

    if (!info || !info.messageId) {
      console.error("❌ SMTP transmission did not return a valid messageId for email verification.");
      return { success: false, error: "SMTP server did not acknowledge message delivery." };
    }

    return { success: true };
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : "Unknown SMTP transmission error";
    // Sanitize any password leakage from error message
    const sanitized = rawMessage.replace(/pass(word)?[:=]\s*\S+/gi, "password=[REDACTED]");
    console.error("❌ Failed to send email verification email via SMTP:", sanitized);
    return { success: false, error: `Email delivery failed: ${sanitized}` };
  }
}
