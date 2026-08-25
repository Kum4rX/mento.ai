const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with that email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create session
    req.session.userId = user._id.toString();

    // Explicitly persist session to MongoStore before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error during registration:', err);
        return res.status(500).json({ success: false, message: 'Failed to establish user session' });
      }

      return res.status(201).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = user._id.toString();

    // Explicitly persist session to MongoStore before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error during login:', err);
        return res.status(500).json({ success: false, message: 'Failed to establish user session' });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Log user out / clear session
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Could not log out' });
    }

    res.clearCookie('connect.sid', {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      httpOnly: true
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};
