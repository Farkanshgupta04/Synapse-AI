# Deployment Applying Guide

This file explains how to apply the deployment plan for the Synapse AI project in a clean, repeatable way.

Each step below includes the files that should be updated or checked, so deployment work stays connected to the real code surface instead of remaining abstract.

## Phase 1: Backend Deployment

### Step 1: Prepare backend settings
Apply this by making the backend ready for Render first. Keep production values in Render environment variables, keep the service rooted at the backend folder, and make sure the server reads `NODE_ENV` and `FRONTEND_URL` from the environment rather than from hardcoded values.

Files to update:
- [backend/index.js](backend/index.js)
- [backend/config.js](backend/config.js)
- [backend/package.json](backend/package.json)
- [backend/.env.example](backend/.env.example)
- [backend/.env](backend/.env)
- [README.md](README.md)

### Step 2: Verify backend startup
Apply this by confirming that the deployed backend can start cleanly, connect to MongoDB, and load Gemini credentials before any frontend deployment is attempted. Keep this check focused on server startup and dependency readiness so failures are easy to isolate.

Files to verify:
- [backend/index.js](backend/index.js)
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)
- [backend/config.js](backend/config.js)

### Step 3: Validate backend routes
Apply this by checking the live auth and prompt routes after the backend is running on Render. Confirm signup, login, logout, and protected prompt requests still behave correctly when CORS, cookies, and bearer tokens are coming from production settings.

Files to test:
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)
- [backend/index.js](backend/index.js)

## Phase 2: Frontend Deployment

### Step 4: Prepare frontend settings
Apply this by making the frontend point at the Render backend through an environment variable. Keep the Vercel build pointed at the frontend folder, avoid localhost API URLs, and make sure the frontend reads the deployed backend URL through a shared config helper.

Files to update:
- [frontend/src/config.js](frontend/src/config.js)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/package.json](frontend/package.json)
- [frontend/.env.example](frontend/.env.example)

### Step 5: Verify frontend startup
Apply this by confirming the Vercel build succeeds and the app loads correctly against the live Render backend. Keep the check centered on the auth screens, the chat composer, and the sidebar so the deployed user flow is validated end to end.

Files to verify:
- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/main.jsx](frontend/src/main.jsx)
- [frontend/src/context/AuthProvider.jsx](frontend/src/context/AuthProvider.jsx)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

## Phase 3: Production Checks

### Step 6: Check environment variables
Apply this by making sure each environment variable is present in the right place and only the right place. Keep backend secrets in Render, keep the frontend API URL in Vercel, and keep local `.env` files separate from production values.

Files to update or verify:
- [backend/.env.example](backend/.env.example)
- [frontend/.env.example](frontend/.env.example)
- [backend/index.js](backend/index.js)
- [backend/config.js](backend/config.js)
- [frontend/src/config.js](frontend/src/config.js)
- [README.md](README.md)
- [frontend/README.md](frontend/README.md)

### Step 7: Test the live flow
Apply this by running the full production flow after both services are deployed. Sign up, log in, send a prompt, and log out to confirm the deployed backend and frontend are still synchronized.

Files to observe during testing:
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

### Step 8: Finalize deployment notes
Apply this by documenting the live URLs, the environment values, and any deployment-specific behavior that future updates need to respect. Keep this information in the main documentation files so the next deployment does not depend on memory.

Files to update:
- [README.md](README.md)
- [frontend/README.md](frontend/README.md)
- [DEPLOYMENT_IMPLEMENTATION.md](DEPLOYMENT_IMPLEMENTATION.md)

## Suggested Deployment Order

1. Prepare and deploy the backend to Render
2. Set the frontend API URL to the Render backend URL
3. Deploy the frontend to Vercel
4. Test the live auth and chat flow
5. Document the final URLs and environment variables

## Definition of Done

- Backend runs successfully on Render
- Frontend runs successfully on Vercel
- Auth and chat flows work in production
- Environment settings are documented clearly
- No Docker setup is required

## Working Notes

- Keep backend and frontend deployment changes in sync
- Use environment variables instead of hardcoded URLs
- Validate production behavior after every deployment update
- Keep documentation updated whenever a live URL or env value changes