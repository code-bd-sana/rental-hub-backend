export const forgotPasswordTemplate = (resetCode: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1a1a1a; text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Hello,</p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your Rentals Hub account. Please use the verification code below:</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <span style="display: inline-block; padding: 16px 32px; font-size: 28px; font-weight: bold; color: #1a1a1a; background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 10px; letter-spacing: 4px;">
          ${resetCode}
        </span>
      </div>

      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">This code will expire in <strong>15 minutes</strong>.</p>
      
      <p style="color: #868e96; font-size: 14px; line-height: 1.5; margin-top: 40px; border-top: 1px solid #f1f3f5; padding-top: 20px;">
        If you did not request this password reset, you can safely ignore this email. Your account remains secure.
      </p>
      
      <p style="color: #adb5bd; font-size: 12px; text-align: center; margin-top: 30px;">
        &copy; ${new Date().getFullYear()} Rentals Hub N.V. All rights reserved.
      </p>
    </div>
  `;
};
