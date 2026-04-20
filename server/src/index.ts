import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, closeDB } from './db.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import experimentsRoutes from './routes/experiments.js';
import recommendationsRoutes from './routes/recommendations.js';
import weatherRoutes from './routes/weather.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
];

function getConfiguredOrigins(): string[] {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const configuredOrigins = getConfiguredOrigins();
const allowAllOrigins = configuredOrigins.includes('*');
const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Non-browser calls (curl/postman/server-to-server) may have no origin.
    if (!origin) {
      return callback(null, true);
    }

    if (allowAllOrigins) {
      return callback(null, true);
    }

    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (vercelPreviewRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req: any, res: any, next: any) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', message: 'AI Kisan Salahkar server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/experiments', experimentsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/weather', weatherRoutes);

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log('Allowed CORS origins:', allowAllOrigins ? '*' : configuredOrigins.join(', '));

    app.listen(PORT, () => {
      console.log(`\n🌾 AI Kisan Salahkar server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   POST   /api/auth/signup`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   PUT    /api/auth/preferences`);
      console.log(`   GET    /api/profiles`);
      console.log(`   PUT    /api/profiles`);
      console.log(`   GET    /api/experiments`);
      console.log(`   GET    /api/experiments/:id`);
      console.log(`   POST   /api/experiments`);
      console.log(`   PUT    /api/experiments/:id`);
      console.log(`   POST   /api/experiments/:id/harvest`);
      console.log(`   GET    /api/recommendations/:crop/:state/:district`);
      console.log(`   GET    /api/recommendations`);
      console.log(`   POST   /api/recommendations`);
      console.log(`   GET    /api/weather/current`);
      console.log(`   GET    /api/weather/forecast`);
      console.log(`   GET    /api/weather/alerts`);
      console.log(`   GET    /api/weather/crop-suitability/:crops\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Shutting down server...');
  await closeDB();
  process.exit(0);
});

startServer();
