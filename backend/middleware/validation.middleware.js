/**
 * Request Validation Middleware
 * Provides validation for user input data
 */

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateSignup = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = {};

  if (!firstName || firstName.trim() === '') {
    errors.firstName = 'First name is required';
  } else if (firstName.length > 50) {
    errors.firstName = 'First name must be less than 50 characters';
  }

  if (!lastName || lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  } else if (lastName.length > 50) {
    errors.lastName = 'Last name must be less than 50 characters';
  }

  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    });
  }

  next();
};

export const validatePromt = (req, res, next) => {
  const { content } = req.body;
  const errors = {};

  if (!content || typeof content !== 'string') {
    errors.content = 'Content must be a string';
  } else if (content.trim() === '') {
    errors.content = 'Prompt content cannot be empty';
  } else if (content.length > 5000) {
    errors.content = 'Prompt content must be less than 5000 characters';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    });
  }

  next();
};

export const validateAIParams = (req, res, next) => {
  const { temperature, maxTokens } = req.body;
  const errors = {};

  if (temperature !== undefined) {
    const parsedTemperature = typeof temperature === 'string' ? Number(temperature) : temperature;

    if (Number.isNaN(parsedTemperature)) {
      errors.temperature = 'Temperature must be a number';
    } else if (parsedTemperature < 0 || parsedTemperature > 2) {
      errors.temperature = 'Temperature must be between 0 and 2';
    }
  }

  if (maxTokens !== undefined) {
    const parsedMaxTokens = typeof maxTokens === 'string' ? Number(maxTokens) : maxTokens;

    if (!Number.isInteger(parsedMaxTokens)) {
      errors.maxTokens = 'Max tokens must be an integer';
    } else if (parsedMaxTokens < 100 || parsedMaxTokens > 8000) {
      errors.maxTokens = 'Max tokens must be between 100 and 8000';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid AI parameters',
        details: errors,
      },
    });
  }

  next();
};
