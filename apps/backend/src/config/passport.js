const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local strategy configuration
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return done(null, false, { message: 'Invalid email format' });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      // Check if user exists
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Update last login timestamp
      user.lastLogin = new Date();
      await user.save();

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

module.exports = { passport, loginLimiter };