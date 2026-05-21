import { randomUUID } from 'crypto';

const requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const logEntry = {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
};

export default requestLogger;