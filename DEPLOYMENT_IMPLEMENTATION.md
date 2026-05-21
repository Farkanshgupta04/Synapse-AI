# Deployment Implementation Plan

This document covers deployment work for the Synapse AI project using a Vercel frontend and a Render backend.

## Phase 1: Backend Deployment

### Step 1: Prepare backend settings
- Use the `backend` folder as the service root
- Keep production secrets in Render environment variables
- Set `NODE_ENV=production` for the live backend
- Set `FRONTEND_URL` to the deployed Vercel URL

### Step 2: Verify backend startup
- Confirm the server starts on Render
- Confirm MongoDB connection works in production
- Confirm AI requests still work with the production key
- Confirm CORS allows the Vercel app

### Step 3: Validate backend routes
- Test signup and login
- Test logout
- Test protected prompt submission
- Confirm cookies and bearer token flow work correctly

## Phase 2: Frontend Deployment

### Step 4: Prepare frontend settings
- Use the `frontend` folder as the project root
- Set `VITE_API_BASE_URL` to the Render backend URL
- Build the app with the production API base URL
- Avoid hardcoded localhost endpoints

### Step 5: Verify frontend startup
- Confirm the build succeeds on Vercel
- Confirm the app loads in production
- Confirm auth flow works against the live backend
- Confirm chat requests hit the deployed API

## Phase 3: Production Checks

### Step 6: Check environment variables
- Backend: `PORT`, `MONGO_URL`, `JWT_PASSWORD`, `NODE_ENV`, `GEMINI_API_KEY`, `FRONTEND_URL`
- Frontend: `VITE_API_BASE_URL`
- Keep production values separate from local development values

### Step 7: Test the live flow
- Sign up a new user
- Log in with the new user
- Send a chat prompt
- Log out and confirm the session clears

### Step 8: Finalize deployment notes
- Document the Render backend URL
- Document the Vercel frontend URL
- Keep a short rollback or redeploy note for future updates

## Suggested Deployment Order

1. Deploy backend to Render
2. Copy the backend URL into the frontend environment
3. Deploy frontend to Vercel
4. Test the live auth and chat flow
5. Document the final URLs and environment values

## Done Criteria

- Backend runs successfully on Render
- Frontend runs successfully on Vercel
- Auth and chat flow work in production
- Environment settings are documented
- No Docker setup is required
