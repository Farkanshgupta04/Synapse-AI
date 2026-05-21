# Synapse AI (MERN + Gemini)

A full-stack Synapse AI application with authentication, protected chat API access, and AI responses powered by Gemini.

## What This Project Includes

- Frontend: React + Vite + Tailwind UI
- Backend: Express API + JWT auth + cookies
- Database: MongoDB with Mongoose models
- AI: Gemini API integration via `@google/genai`

## Project Structure

```
Synapse AI/
	backend/
		controller/
		middleware/
		model/
		routes/
		config.js
		index.js
		package.json
		.env
	frontend/
		src/
			components/
			context/
			App.jsx
			main.jsx
		package.json
```

## Tech Stack

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- React 19
- Vite (rolldown-vite)
- Tailwind CSS
- Axios
- React Router

## Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended
- MongoDB connection
	- Option 1: MongoDB Atlas cluster
	- Option 2: Local MongoDB server
- Gemini API key

## Environment Setup (Backend)

Create `backend/.env` with these variables:

```
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority
JWT_PASSWORD=your_jwt_secret
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### Variable Meaning

- `PORT`: backend API port
- `MONGO_URL`: MongoDB connection string
- `JWT_PASSWORD`: secret key used to sign and verify JWTs
- `NODE_ENV`: set `development` for local dev
- `GEMINI_API_KEY`: key used by Gemini API calls
- `FRONTEND_URL`: allowed CORS origin for frontend

## Deployment Setup

This project is set up for a Vercel frontend and a Render backend.

Backend on Render:

- Set the service root to the `backend` folder
- Use `npm install` as the build step if your Render service requires it
- Use `npm start` as the start command
- Add the backend environment variables from `backend/.env.example`
- Set `FRONTEND_URL` to your Vercel app URL

Frontend on Vercel:

- Set the project root to the `frontend` folder
- Use `npm run build` as the build command
- Add `VITE_API_BASE_URL` with your Render backend base URL
- Redeploy after updating the backend URL so the frontend points to the live API

Important:

- If you already committed real credentials/keys, rotate them immediately.
- Keep `.env` private and never commit production secrets.

## Install Dependencies

Run each command from the correct folder.

Backend:

```
cd backend
npm install
```

Frontend:

```
cd frontend
npm install
```

## Run Locally

Use two terminals.

Terminal 1 (backend):

```
cd backend
npm start
```

Expected logs include:

- `Server is running on port 3000`
- `Connected to MongoDB`

Terminal 2 (frontend):

```
cd frontend
npm run dev
```

Expected output includes:

- `Local: http://localhost:5173/`

Open the app at:

- `http://localhost:5173`

## Authentication and Chat Flow

1. User signs up from frontend.
2. Backend stores user with hashed password.
3. User logs in.
4. Backend returns JWT and also sets `jwt` cookie.
5. Frontend stores token in localStorage.
6. Chat request sends `Authorization: Bearer <token>` header.
7. Middleware verifies JWT and injects `req.userId`.
8. Backend saves user prompt, calls Gemini, saves AI response, and returns the reply.

## API Endpoints

Base URL:

- `http://localhost:3000/api/v1`

User routes:

- `POST /user/signup`
- `POST /user/login`
- `GET /user/logout`

Prompt route:

- `POST /synapse-ai/promt` (protected, requires Bearer token)

### Sample Request: Signup

```
POST /api/v1/user/signup
Content-Type: application/json

{
	"firstName": "John",
	"lastName": "Doe",
	"email": "john@example.com",
	"password": "12345678"
}
```

### Sample Request: Login

```
POST /api/v1/user/login
Content-Type: application/json

{
	"email": "john@example.com",
	"password": "12345678"
}
```

### Sample Request: Chat Prompt

```
POST /api/v1/synapse-ai/promt
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
	"content": "Explain recursion with a simple JavaScript example"
}
```

Expected response:

```
{
	"reply": "...AI generated response..."
}
```

## Data Models

User model:

- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)

Promt model:

- `userId` (ObjectId, ref User, required)
- `role` (`user` or `assisstant`)
- `content` (String, required)
- `createdAt` (Date)

Note: The project currently uses `promt`/`assisstant` spellings in route/model names. These are functional but non-standard spellings.

## Frontend Routes

- `/login` for login
- `/signup` for registration
- `/` for main chat (protected by client auth state)

## Build and Lint

Frontend build:

```
cd frontend
npm run build
```

Frontend lint:

```
cd frontend
npm run lint
```

Backend currently has no test suite configured.

## Common Troubleshooting

### MongoDB Connection Error

Symptoms:

- `MongoDB Connection Error`
- DNS errors like `ENOTFOUND`

Checks:

- verify `MONGO_URL` in `backend/.env`
- verify Atlas cluster is active
- verify DB user/password are correct
- verify IP/network access settings in Atlas
- try local MongoDB URI for local development

Local MongoDB URI example:

```
MONGO_URL=mongodb://127.0.0.1:27017/synapse_ai
```

### CORS Error in Browser

Checks:

- ensure frontend runs on `http://localhost:5173`
- ensure `FRONTEND_URL=http://localhost:5173` in backend `.env`
- restart backend after changing `.env`

### 401 No Token / Invalid Token

Checks:

- login first to receive token
- confirm frontend sends `Authorization: Bearer <token>`
- clear localStorage and login again if token expired
- keep `JWT_PASSWORD` stable between server restarts

### Gemini API Fails

Checks:

- verify `GEMINI_API_KEY` is valid
- ensure billing/quota is available for the key
- inspect backend logs for request errors

## Known Limitations

- Prompt history in UI is currently stored in localStorage per user.
- Backend saves prompts in DB, but no API to fetch full chat history yet.
- No refresh token flow.
- No automated backend tests.

## Suggested Next Improvements

- Add `.env.example` without secrets.
- Add backend health endpoint with DB readiness status.
- Add prompt history API with pagination.
- Add request validation with schema validation library.
- Add backend test setup (Jest/Vitest + supertest).

## License

ISC
