import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Import routes
import authRoutes from './modules/auth/auth.routes';
import tripRoutes from './modules/trips/trip.routes';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import driverRoutes from './modules/drivers/driver.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import financeRoutes from './modules/finance/finance.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app = express();

// Configured CORS middleware for production-like safety
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: unauthorized origin.'));
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint (compliant with direct /health and api-prefixed checks)
const healthHandler = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.url}`,
  });
});

// Global Error Handler (Sanitizes internal server details in production)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.message || err);
  
  const status = err.status || 500;
  let message = err.message || 'An unexpected error occurred';
  
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error';
  }

  res.status(status).json({
    success: false,
    message,
  });
});

export default app;
