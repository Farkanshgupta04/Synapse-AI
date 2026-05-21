/**
 * Global Error Handler Middleware
 * Centralizes error handling and response formatting
 */

const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error(`[ERROR] ${err.name || 'Unknown'}: ${err.message}`);
  console.error(err.stack);

  // Default error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'An unexpected error occurred',
      code: err.code || 'INTERNAL_ERROR',
    },
  };

  // Determine status code
  let statusCode = 500;

  // Handle different error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error.message = 'Validation failed';
    errorResponse.error.details = Object.entries(err.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorResponse.error.message = `Invalid ${err.kind}: ${err.value}`;
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    if (err.code === 11000) {
      // Duplicate key error
      statusCode = 409;
      const field = Object.keys(err.keyPattern)[0];
      errorResponse.error.message = `${field} already exists`;
    } else {
      statusCode = 500;
    }
  } else if (err.statusCode) {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
