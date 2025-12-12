import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import chalk from "chalk";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { httpLogger } from './middleware/logger.js';
import { cacheMiddleware, CACHE_DURATIONS } from './middleware/cache.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';

const app = express();

// Environment validation
if (!process.env.MONGO) {
  console.error(chalk.red("MONGO environment variable is required"));
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(chalk.red("JWT_SECRET environment variable is required"));
  process.exit(1);
}

const mongoURI = process.env.MONGO;
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  }
});

app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(httpLogger);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.green("MongoDB connected successfully to database"));
  })
  .catch((err) => {
    console.error(chalk.red("Error connecting to MongoDB:", err));
    process.exit(1);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', cacheMiddleware(CACHE_DURATIONS.MEDIUM), productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Legacy route compatibility (gradually migrate these)
app.use('/', authRoutes); // For /login, /register, etc.
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/', userRoutes); // For /save-address, etc.

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'E-commerce API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      users: '/api/users'
    },
    documentation: '/api/docs' // Future: Add Swagger/OpenAPI docs
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(chalk.yellow('SIGTERM received. Shutting down gracefully...'));
  mongoose.connection.close(() => {
    console.log(chalk.green('MongoDB connection closed.'));
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('SIGINT received. Shutting down gracefully...'));
  mongoose.connection.close(() => {
    console.log(chalk.green('MongoDB connection closed.'));
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(chalk.blue(`🚀 Server is running on port ${PORT}`));
  console.log(chalk.green(`📊 Environment: ${process.env.NODE_ENV || 'development'}`));
  console.log(chalk.cyan(`🔗 API Documentation: http://localhost:${PORT}/api`));
  console.log(chalk.magenta(`💚 Health Check: http://localhost:${PORT}/health`));
});