import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/user.route.js"
import promtRoutes from "./routes/promt.route.js"
import chatRoutes from "./routes/chat.route.js"
import cors from "cors";
import errorHandler from './middleware/error.middleware.js';
import requestLogger from './middleware/requestLogger.middleware.js';
dotenv.config()

const app = express();
const port = process.env.PORT || 3001;
const MONGO_URL=process.env.MONGO_URL;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '').split(',').map((origin) => origin.trim()),
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedOrigin =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app');

    if (isAllowedOrigin) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};


// middleware
app.use(express.json());
app.use(cookieParser());//frontend mai use kar payenge iss se 
app.use(requestLogger);
// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello world')
})

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

app.get('/ready', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      return res.status(200).json({ 
        status: 'ready', 
        message: 'Server and dependencies are ready',
        database: 'connected'
      });
    } else {
      return res.status(503).json({ 
        status: 'not_ready',
        message: 'Database not connected',
        database: 'disconnected'
      });
    }
  } catch (error) {
    res.status(503).json({ status: 'not_ready', message: error.message });
  }
});

// db connection here
mongoose.connect(MONGO_URL).
then(()=>console.log("Connected to MongoDB"))
.catch((error)=>console.error("MongoDB Connection Error:",error));

// routes
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/synapse-ai",promtRoutes);
app.use("/api/v1/chat",chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
