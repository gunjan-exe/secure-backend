const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyRegistration,
  loginUser,
  logoutUser,
  protectedRoute,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { registerLimiter, loginLimiter } = require('../middleware/rateLimit');
const authenticateToken = require('../middleware/authMiddleware');

// Apply rate limiters
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);

// Auth routes
router.post('/verify-registration', verifyRegistration);
router.get('/verify-registration', verifyRegistration);
router.post('/logout', logoutUser);
router.get('/protected', authenticateToken, protectedRoute);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/reset-password/:token', resetPassword);
// 🔧 Temporary route to test email functionality
router.get('/test-mail', async (req, res) => {
  const { sendVerificationEmail } = require('../utils/sendEmail');
  try {
    await sendVerificationEmail(
      'gunjancsharma24@gmail.com',
      'Test Email from Secure Backend',
      '<h3>This is a test email. Your Nodemailer config is working!</h3>'
    );
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error('❌ Email test failed:', err);
    res.status(500).send('Email test failed.');
  }
});

module.exports = router;

