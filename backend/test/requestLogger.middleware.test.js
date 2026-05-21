import test from 'node:test';
import assert from 'node:assert/strict';
import requestLogger from '../middleware/requestLogger.middleware.js';

const createRes = () => {
  const res = {};
  res.headers = {};
  res.setHeader = (key, value) => {
    res.headers[key.toLowerCase()] = value;
  };
  res.on = (event, handler) => {
    if (event === 'finish') {
      res.finishHandler = handler;
    }
  };
  return res;
};

test('requestLogger adds request id and header', () => {
  const req = { method: 'GET', url: '/health', headers: {} };
  const res = createRes();
  let nextCalled = false;

  requestLogger(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.ok(req.requestId);
  assert.equal(res.headers['x-request-id'], req.requestId);
});
