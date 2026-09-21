const AppError = require('../utils/appError');

/**
 * Restrict route access to specific user roles
 * @param  {...string} roles - e.g. 'admin', 'instructor'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

module.exports = { authorize };
