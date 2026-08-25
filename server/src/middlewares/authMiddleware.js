// Protect routes
exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: 'Not authorized to access this route. Please log in.'
  });
};
