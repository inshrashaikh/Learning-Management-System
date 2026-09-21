const { ZodError } = require('zod');
const { errorResponse } = require('../utils/apiResponse');

const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    // Optionally assign back sanitized data
    if (validatedData.body) req.body = validatedData.body;
    if (validatedData.query) req.query = validatedData.query;
    if (validatedData.params) req.params = validatedData.params;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.slice(1).join('.'),
        message: err.message
      }));
      return errorResponse(res, 400, 'Validation failed', formattedErrors);
    }
    next(error);
  }
};

module.exports = validate;
