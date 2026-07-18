export const getWelcomeEmailTemplate = (name: string, role: string, email: string, generatedPassword: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h2 style="color: #172554;">Welcome to Roamly!</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your account has been successfully created with the role: <strong>${role}</strong>.</p>
    <p>You can log in to the platform using the following credentials:</p>
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;">Email: <strong>${email}</strong></p>
      <p style="margin: 0;">Password: <strong>${generatedPassword}</strong></p>
    </div>
    <p><em>Please ensure you log in and change your password as soon as possible for security reasons.</em></p>
    <p>Best regards,<br>Roamly Team</p>
  </div>
`;
