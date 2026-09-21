/**
 * Standardized API Response Utilities
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
