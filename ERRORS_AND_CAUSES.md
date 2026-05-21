# Errors and Causes by Phase

This file captures the common places where errors appear in the project, what phase they belong to, and the usual reason they happen.

## Phase 1: Backend

### Startup and server errors
- `MongoDB connection failed`: the `MONGO_URL` value is missing, invalid, or the database is unreachable.
- `JWT secret missing`: `JWT_PASSWORD` is not set in the environment.
- `Gemini API error`: `GEMINI_API_KEY` is missing, expired, or invalid.

Why these happen:
- The backend depends on environment variables for database, auth, and AI access.
- If any required secret is absent, the server may start partially but fail when the affected route is used.

### Request and validation errors
- `Validation failed`: the request body is missing a required field or contains invalid data.
- `Invalid ObjectId`: a route receives an id value that does not match the MongoDB id format.
- `already exists`: a unique field such as email is being reused.

Why these happen:
- The backend validates inputs before saving or querying data.
- Duplicate or malformed values are rejected to keep the database consistent.

### Authentication errors
- `Unauthorized` or `Invalid token`: the Bearer token is missing, expired, or incorrect.
- `Cookie not set`: the browser blocked the cookie or the frontend and backend settings do not match.

Why these happen:
- Auth depends on both the token sent by the frontend and the cookie/session settings allowed by the backend.

## Phase 2: Frontend

### Build errors
- `Cannot resolve module`: an import path is wrong or the dependency is not installed.
- `Build failed due to lint or syntax error`: a component has invalid JavaScript, JSX, or a failing ESLint rule.
- `API URL undefined`: the frontend environment variable for the backend URL is missing.

Why these happen:
- Vite validates imports and syntax during the production build.
- The frontend also depends on the backend base URL being configured correctly.

### Runtime UI errors
- `Login failed` or `Signup failed`: the backend rejected the request or the network call could not complete.
- `Chat response failed`: the token is missing, the backend route rejected the request, or Gemini returned an error.

Why these happen:
- The UI is only the client layer; it reflects backend responses and network status.
- Most failures come from invalid credentials, missing auth, or API connectivity issues.

## Phase 3: Deployment

### Backend deployment errors
- `Service starts locally but fails on Render`: environment variables are not configured in production.
- `CORS blocked`: `FRONTEND_URL` does not match the deployed frontend origin.
- `Database timeout`: production MongoDB access is blocked or the connection string is incorrect.

Why these happen:
- Production services need the same required values as local development, but they must be set separately.
- Cross-origin requests must match the deployed frontend URL exactly.

### Frontend deployment errors
- `Blank page after build`: the deployed API base URL is wrong or the app is referencing localhost.
- `Login works locally but not in production`: the frontend and backend origins do not match the deployed URLs.

Why these happen:
- Production builds do not use local environment assumptions.
- Any hardcoded local URL will break once the app is deployed.

## Phase 4: What the global error handler covers

The backend global error handler converts internal failures into consistent JSON responses.

It currently covers:
- validation errors
- MongoDB cast errors
- duplicate key errors
- custom HTTP status errors

Why this matters:
- It keeps the frontend from guessing how to parse different error shapes.
- It makes debugging easier because the same type of failure always returns the same response structure.

## Quick check list

1. Confirm backend environment variables are set.
2. Confirm frontend API base URL is not pointing to localhost in production.
3. Confirm MongoDB is reachable.
4. Confirm JWT token and cookie flow are both working.
5. Confirm the frontend production build completes before deployment.

## Error Points Summary

`MongoDB connection failed` - `MONGO_URL` is missing, invalid, or the database server cannot be reached. In depth: the backend cannot open a stable connection to MongoDB, so any route that needs data will fail before it can read or write documents.
`JWT secret missing` - `JWT_PASSWORD` is not configured, so auth token creation or verification fails. In depth: the backend uses this secret to sign and validate tokens, and without it the login and protected routes cannot trust the request.
`Gemini API error` - `GEMINI_API_KEY` is missing, invalid, or the AI service rejects the request. In depth: the AI request cannot be authenticated, so the prompt controller cannot get a model response.
`Validation failed` - the request body does not include required fields or the input format is wrong. In depth: the middleware stops bad input early so invalid requests do not reach the database or AI layer.
`Invalid ObjectId` - a route is receiving an id that is not in the MongoDB ObjectId format. In depth: MongoDB queries expect a specific id shape, so malformed ids break lookups and cast operations.
`already exists` - a unique value like email is being reused in a create or signup request. In depth: the database unique index rejects duplicates to protect account identity and data integrity.
`Unauthorized` or `Invalid token` - the Bearer token is missing, expired, or does not match the backend secret. In depth: the auth middleware cannot verify the user, so the server blocks access to protected APIs.
`Cookie not set` - the browser blocked the cookie or frontend and backend settings do not match. In depth: cross-origin auth depends on the browser accepting the cookie and both sides agreeing on credentials handling.
`Cannot resolve module` - an import path is wrong or the dependency is not installed. In depth: the bundler cannot find the file or package, so the app cannot compile the module graph.
`Build failed due to lint or syntax error` - JavaScript, JSX, or ESLint rules are broken in the component code. In depth: the build process refuses to bundle code that is invalid or violates the configured quality rules.
`API URL undefined` - the frontend environment variable for the backend URL is missing or incorrect. In depth: the fetch/axios calls have no valid target, so requests go to the wrong place or fail immediately.
`Login failed` or `Signup failed` - the backend rejected the credentials or the network request could not complete. In depth: authentication only works if the server validates the payload and returns a success response, otherwise the UI stays blocked.
`Chat response failed` - the token is missing, the backend route rejects the request, or Gemini returns an error. In depth: the chat screen depends on a valid auth token plus a successful AI call, so any failure in that chain stops the reply.
`Failed to fetch` - the browser could not complete the request because the backend is down, the URL is wrong, or CORS blocks the call. In depth: the request never reaches the normal response path, so the frontend only sees a network-level failure.
`401 Unauthorized` - the request reached the backend but the Bearer token was missing, expired, or invalid. In depth: the auth middleware rejected the request before the chat route could generate a reply.
`Service starts locally but fails on Render` - production environment variables are not configured correctly. In depth: deployment platforms do not inherit local settings, so missing secrets or wrong runtime values cause runtime failures.
`CORS blocked` - `FRONTEND_URL` does not match the deployed frontend origin. In depth: the browser blocks cross-origin requests unless the backend explicitly allows the exact frontend host.
`Database timeout` - MongoDB access is slow, blocked, or the connection string is incorrect. In depth: the app waits too long for the database, then fails because the server cannot confirm the connection in time.
`Blank page after build` - the deployed app is using a wrong API URL or a localhost assumption. In depth: the bundle loads but cannot contact the backend, so the UI has no data to render.
`Login works locally but not in production` - the frontend and backend deployment origins do not match. In depth: auth cookies, CORS, and API URLs all depend on the final deployed domains being configured together.

## Encountered Errors (confirmed during development)

- **Gemini model not found (404)**: Backend requested `gemini-2.0-pro` for a v1beta `generateContent` call; the model ID isn't supported for that API/method. Cause: model/version mismatch or deprecated identifier. Temporary fix applied: controller falls back to `gemini-2.5-flash` on 404.

- **Gemini quota / rate limit (429)**: Provider returned quota exceeded on burst requests. Cause: API plan limits or concurrent usage spikes. Mitigation: exponential backoff, retries, or upgrade the API plan.

- **Validation rejections (400)**: Requests with invalid `temperature`, missing `content`, or unsupported `model` are rejected by middleware. Cause: malformed client payloads or string-typed multipart fields. Fix: coerce and validate inputs before sending.

- **Authentication failures (401)**: Missing, expired, or invalid JWT tokens block protected endpoints. Cause: `JWT_PASSWORD` mismatch or token expiry. Check token issuance flow and environment variable.

- **MongoDB connection issues**: Failures when `MONGO_URL` is missing/incorrect or MongoDB is unreachable. Cause: incorrect env or network. Verify connection string and DB availability.

- **File upload errors**: Multer can fail if the `uploads/` directory is missing or permissions are incorrect. Cause: filesystem path or permission issues. Ensure `backend/uploads` exists and is writable.

- **CORS / network (Failed to fetch)**: Frontend requests blocked by CORS or wrong API base URL. Cause: mismatched `FRONTEND_URL`, localhost used in production, or incorrect CORS config. Verify origins and server CORS settings.

- **Frontend build / module errors**: Vite build failures due to missing dependencies or incorrect import paths. Cause: dependency mismatch or bad imports. Run `npm install` and fix imports reported by the build.

### Quick verification commands

- Start backend and watch logs:
```powershell
cd "c:\Users\88827\Desktop\Synapse AI\backend"
npm run start
```

- List available Gemini models (replace `$ACCESS_TOKEN`):
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" "https://generativelanguage.googleapis.com/v1beta/models" | jq .
```

If you'd like, I can run these checks for you (I will need a valid JWT for protected endpoints or the Gemini API key to list models).
