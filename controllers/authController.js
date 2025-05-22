const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/sendEmail');

// -------------------- Register --------------------
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      email,
      password: hashedPassword,
      verificationToken,
    });

    await user.save();

    const verificationLink = `http://localhost:5000/api/auth/verify-registration?token=${verificationToken}`;
    const message = `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`;

    await sendVerificationEmail(user.email, 'Email Verification', message);

    res.status(201).json({ message: 'User registered, please verify your email' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------- Email Verification --------------------
const verifyRegistration = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------- Login --------------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isLoggedIn) {
      return res.status(400).json({ message: 'User already logged in from another session.' });
    }

    user.isLoggedIn = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------- Logout --------------------
const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isLoggedIn = false;
    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// -------------------- Protected Route --------------------
const protectedRoute = (req, res) => {
  res.status(200).json({ message: 'You have access to this route' });
};

// -------------------- Forgot Password --------------------
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetURL = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
    const message = `
      <h3>Password Reset Request</h3>
      <p>Click <a href="${resetURL}">here</a> to reset your password. This link expires in 15 minutes.</p>
    `;

    await sendVerificationEmail(user.email, 'Reset Your Password', message);

    res.status(200).json({ message: 'Password reset link sent to email' });

  } catch (err) {
    console.error('Forgot Password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------- Reset Password --------------------
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (err) {
    console.error('Reset Password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  verifyRegistration,
  loginUser,
  logoutUser,
  protectedRoute,
  forgotPassword,
  resetPassword
};

