import test from 'node:test';
import assert from 'node:assert/strict';
import errorHandler from '../middleware/error.middleware.js';

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

test('errorHandler maps duplicate key errors to 409', () => {
  const err = {
    name: 'MongoServerError',
    code: 11000,
    keyPattern: { email: 1 },
    message: 'duplicate key error',
  };
  const req = {};
  const res = createRes();

  errorHandler(err, req, res, () => {});

  assert.equal(res.statusCode, 409);
  assert.equal(res.payload.success, false);
  assert.equal(res.payload.error.message, 'email already exists');
});

test('errorHandler maps validation errors to 400', () => {
  const err = {
    name: 'ValidationError',
    message: 'validation failed',
    errors: {
      email: { message: 'Email is required' },
    },
  };
  const req = {};
  const res = createRes();

  errorHandler(err, req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.error.message, 'Validation failed');
  assert.deepEqual(res.payload.error.details, [
    { field: 'email', message: 'Email is required' },
  ]);
});
