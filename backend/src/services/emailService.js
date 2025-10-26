const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Amanzi Ordering System - Password Reset</h2>
      <p>You requested a password reset for your account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #3b82f6; 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
      <p style="color: #ef4444; font-weight: bold;">This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Amanzi Ordering System<br>
        Bringing clean water to your residence
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Amanzi Ordering System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request - Amanzi Ordering System',
      html: message
    });
    
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send password change confirmation
exports.sendPasswordChangeConfirmation = async (email, name) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Password Changed Successfully</h2>
      <p>Hi ${name},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact us immediately.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 12px;">
        Amanzi Ordering System<br>
        Bringing clean water to your residence
      </p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Amanzi Ordering System" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Changed - Amanzi Ordering System',
      html: message
    });
    
    console.log('✅ Password confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};