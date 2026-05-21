# Project Update Applying Guide

This file explains how to apply the changes from the project update plan in a clean, practical, and low-risk way.

Each step below includes the files that will reflect the change, so implementation stays tied to the actual code surface instead of remaining conceptual.

## Phase 0: Preparation

### Step 1: Audit the current codebase
Apply this by reading the backend routes, controllers, models, and middleware first, then the frontend pages, components, and context. Identify the exact files that own each behavior before changing anything, and note duplicated logic, missing validation, and hardcoded values so the next edits stay local.

Files to review:
- [backend/index.js](backend/index.js)
- [backend/config.js](backend/config.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)
- [backend/model/user.model.js](backend/model/user.model.js)
- [backend/model/promt.model.js](backend/model/promt.model.js)
- [frontend/src/App.jsx](frontend/src/App.jsx)
- [frontend/src/main.jsx](frontend/src/main.jsx)
- [frontend/src/context/AuthProvider.jsx](frontend/src/context/AuthProvider.jsx)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

### Step 2: Secure configuration
Apply this by keeping secrets only in `.env` files, adding example env files for documentation, and making sure no real credentials are committed. Document each variable next to the area that uses it so setup stays easy to follow for both local and deployed environments.

Files to update or create:
- [backend/.env](backend/.env)
- [backend/.env.example](backend/.env.example)
- [frontend/.env.example](frontend/.env.example)
- [backend/index.js](backend/index.js)
- [backend/config.js](backend/config.js)
- [frontend/src/config.js](frontend/src/config.js)
- [README.md](README.md)
- [frontend/README.md](frontend/README.md)

### Step 3: Establish baseline verification
Apply this by confirming the backend starts, the frontend builds, and the main auth and chat flow works before any refactor. Record the current behavior and known issues so later changes can be checked against the same baseline instead of guesswork.

Files involved in verification:
- [backend/package.json](backend/package.json)
- [frontend/package.json](frontend/package.json)
- [backend/index.js](backend/index.js)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

## Phase 1: Backend Hardening

### Step 4: Add centralized error handling
Apply this by creating one global error middleware and routing unexpected failures through it. Keep response shapes consistent so the frontend can handle errors in one place, and only leave route-specific status codes where they are truly needed.

Files to change:
- [backend/index.js](backend/index.js)
- [backend/middleware/](backend/middleware)
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)

### Step 5: Add validation layer
Apply this by validating request bodies before controller logic runs, especially for signup, login, and prompt submission. Reject bad input early with clear messages, and keep validation rules near the route layer so the rules are easy to update later.

Files to change:
- [backend/middleware/](backend/middleware)
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)

### Step 6: Add health endpoints
Apply this by exposing lightweight health checks that do not depend on the main business flow. Keep `/health` simple for liveness, keep `/ready` for dependency checks like MongoDB and AI availability, and make both endpoints cheap to call during debugging and deployment.

Files to change:
- [backend/index.js](backend/index.js)
- [backend/routes/](backend/routes)
- [backend/config.js](backend/config.js)
- [README.md](README.md)

### Step 7: Improve auth robustness
Apply this by treating JWT configuration, cookie settings, and token expiry as explicit deployment concerns. Keep local development permissive enough to work, but make production settings strict and predictable so auth behaves the same after deployment.

Files to change:
- [backend/config.js](backend/config.js)
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)
- [backend/index.js](backend/index.js)
- [frontend/src/context/AuthProvider.jsx](frontend/src/context/AuthProvider.jsx)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

## Phase 2: Frontend Stabilization

### Step 8: Move API URLs to environment variables
Apply this by replacing hardcoded API URLs with one shared configuration value. Use that value everywhere the frontend calls the backend so local development and deployed builds stay aligned without editing multiple components.

Files to change:
- [frontend/src/config.js](frontend/src/config.js)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/.env.example](frontend/.env.example)

### Step 9: Improve auth UI flow
Apply this by keeping loading and error states visible in login and signup flows. Replace alert-driven feedback with inline or toast-style feedback when you touch those screens, and keep the form behavior predictable so the user always knows whether the request is still running or failed.

Files to change:
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/App.jsx](frontend/src/App.jsx)

### Step 10: Improve chat UI states
Apply this by adding an empty state before the first message, a clear loading indicator while the AI is responding, and better mobile sidebar interaction. Keep the main chat layout simple and responsive so new states do not make the screen feel cramped or unstable.

Files to change:
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/index.css](frontend/src/index.css)

### Step 11: Clean up local storage handling
Apply this by standardizing storage keys for the token and user, then using the same keys everywhere the app reads or clears session data. Make logout remove all stored auth state in one pass so stale data does not cause confusing session bugs.

Files to change:
- [frontend/src/context/AuthProvider.jsx](frontend/src/context/AuthProvider.jsx)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)

## Phase 3: Chat Data Model Upgrade

### Step 12: Introduce conversation structure
Apply this by separating conversation metadata from message records. Create a session collection for chat threads and a message collection for ordered content, then link both to the authenticated user so history can scale cleanly.

Files to change:
- [backend/model/](backend/model)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)
- [backend/index.js](backend/index.js)

### Step 13: Add chat history APIs
Apply this by introducing focused endpoints for list, read, rename, and delete operations. Keep each endpoint narrow in responsibility so the frontend can fetch history without overloading the existing prompt flow.

Files to change:
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)
- [backend/model/promt.model.js](backend/model/promt.model.js)

### Step 14: Connect history to UI
Apply this by wiring the sidebar to the new history endpoints and loading the selected conversation into the main chat panel. Keep the active session highlighted clearly so users always know which conversation they are editing.

Files to change:
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)
- [frontend/src/context/AuthProvider.jsx](frontend/src/context/AuthProvider.jsx)

## Phase 4: AI Experience Improvements

### Step 15: Add model controls
Apply this by placing model and tuning controls near the chat composer, not deep inside settings. Keep defaults sensible, and store user preferences in a way that survives refreshes without forcing extra complexity into the main send flow.

Files to change:
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/config.js](backend/config.js)

### Step 16: Add streaming responses
Apply this by changing the response rendering path from a single final payload to incremental updates. Keep the UI able to render partial content safely, and add a stop action so the user can interrupt long generations without refreshing the page.

Files to change:
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)

### Step 17: Add response utilities
Apply this by improving code block rendering, adding copy actions, and enabling regenerate behavior where it fits the UI. Keep these actions close to the rendered response so they feel like natural conversation tools instead of extra clutter.

Files to change:
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/index.css](frontend/src/index.css)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)

## Phase 5: Product Features

### Step 18: Add prompt tools
Apply this by introducing reusable prompt templates and a better empty state with suggested prompts. Keep the composer flexible enough for multi-line input and keyboard shortcuts so prompt entry feels fast instead of restrictive.

Files to change:
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)
- [frontend/src/index.css](frontend/src/index.css)

### Step 19: Add chat management actions
Apply this by adding only the actions that can be explained and undone clearly, such as pin, search, export, and delete confirmation. Keep destructive actions guarded and make non-destructive actions easy to access from the conversation list.

Files to change:
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)

### Step 20: Add account features
Apply this by extending the existing auth flow instead of building a separate account system. Add profile editing, password reset, verification, and OAuth only after the main auth flow is stable enough to support them cleanly.

Files to change:
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/model/user.model.js](backend/model/user.model.js)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

## Phase 6: Quality and Reliability

### Step 21: Add test coverage
Apply this by writing tests around the highest-risk boundaries first: controllers, middleware, auth flows, and the prompt route. Keep tests small and targeted so they confirm behavior without becoming brittle when the UI changes.

Files to add or extend:
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)
- [backend/routes/user.route.js](backend/routes/user.route.js)
- [backend/routes/promt.route.js](backend/routes/promt.route.js)
- [frontend/src/components/Login.jsx](frontend/src/components/Login.jsx)
- [frontend/src/components/Signup.jsx](frontend/src/components/Signup.jsx)
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)

### Step 22: Add logging and observability
Apply this by adding structured logs where requests enter and where failures occur. Include request IDs and timing information so troubleshooting production issues is faster and less dependent on guesswork.

Files to change:
- [backend/index.js](backend/index.js)
- [backend/controller/user.controller.js](backend/controller/user.controller.js)
- [backend/controller/promt.controller.js](backend/controller/promt.controller.js)
- [backend/middleware/promt.middleware.js](backend/middleware/promt.middleware.js)

### Step 23: Optimize performance
Apply this by measuring before changing anything, then addressing the biggest avoidable costs such as large bundles, repeated renders, and missing database indexes. Keep performance work incremental so it improves the app without introducing new instability.

Files to change:
- [frontend/src/components/Promt.jsx](frontend/src/components/Promt.jsx)
- [frontend/src/components/Home.jsx](frontend/src/components/Home.jsx)
- [frontend/src/index.css](frontend/src/index.css)
- [backend/model/user.model.js](backend/model/user.model.js)
- [backend/model/promt.model.js](backend/model/promt.model.js)

## Suggested Application Order

1. Audit the current codebase and verify the baseline
2. Secure configuration and environment files
3. Add backend error handling and validation
4. Move frontend API usage to environment-based config
5. Improve chat UI and local storage behavior
6. Add conversation data and history APIs
7. Connect history to the UI
8. Add AI improvements and response utilities
9. Add tests, logging, and performance work

## Definition of Done

- Each change is small enough to review and roll back if needed
- The app still runs locally after each step
- The frontend and backend stay in sync on config and API usage
- Documentation is updated when the behavior changes
- No secrets or deployment mistakes are introduced

## Working Notes

- Prefer changing the smallest file that actually owns the behavior
- Validate after each meaningful edit instead of waiting until the end
- Keep production settings separate from local development settings
- Avoid mixing deployment work into feature implementation steps
- When a step touches multiple files, update the backend and frontend sides together so the app stays runnable throughout the change