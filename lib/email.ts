import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOTPEmail(email: string, otp: string, userName?: string): Promise<boolean> {
    try {
        const mailOptions = {
            from: `"ChatBot" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Login OTP - ChatBot",
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <div style="max-width: 500px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">🔐 Login OTP</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Hi${userName ? ` ${userName}` : ''},
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                Your one-time password for ChatBot login is:
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e40af;">
                  ${otp}
                </span>
              </div>
              
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                ⏱️ This OTP expires in <strong>5 minutes</strong>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                If you didn't request this, please ignore this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ChatBot. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        return false;
    }
}

export async function verifyEmailConfig(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log("Email configuration verified successfully");
        return true;
    } catch (error) {
        console.error("Email configuration error:", error);
        return false;
    }
}
