import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSignup, validateLogin, validatePromt, validateAIParams } from '../middleware/validation.middleware.js';

const createRes = () => {
  const res = {};
  res.statusCode = 200;
  res.payload = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.payload = payload;
    return res;
  };
  return res;
};

test('validateSignup rejects missing fields', () => {
  const req = { body: {} };
  const res = createRes();
  let nextCalled = false;

  validateSignup(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.error.message, 'Validation failed');
  assert.equal(res.payload.error.details.firstName, 'First name is required');
  assert.equal(res.payload.error.details.email, 'Email is required');
});

test('validateLogin rejects invalid email and missing password', () => {
  const req = { body: { email: 'bad-email', password: '' } };
  const res = createRes();
  let nextCalled = false;

  validateLogin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.error.details.email, 'Invalid email format');
  assert.equal(res.payload.error.details.password, 'Password is required');
});

test('validatePromt accepts valid content', () => {
  const req = { body: { content: 'Explain this code' } };
  const res = createRes();
  let nextCalled = false;

  validatePromt(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.payload, null);
});

test('validateAIParams rejects out-of-range temperature', () => {
  const req = { body: { temperature: 3 } };
  const res = createRes();
  let nextCalled = false;

  validateAIParams(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.error.message, 'Invalid AI parameters');
  assert.equal(res.payload.error.details.temperature, 'Temperature must be between 0 and 2');
});
