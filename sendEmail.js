// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (toEmail, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS  // App Password
    }
  });

  const verificationLink = `http://localhost:5000/api/auth/verify-registration?token=${token}`;

  const mailOptions = {
    from: `"Secure Backend" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify Your Email',
    html: `
      <h3>Welcome!</h3>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email error:', err);
  }
};

module.exports = { sendVerificationEmail };
