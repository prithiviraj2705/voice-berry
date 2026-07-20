import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import rideRoutes from './routes/rides';
import paymentRoutes from './routes/payments';
import chatRoutes from './routes/chat';
import webhookRoutes from './routes/webhooks';
import addressRoutes from './routes/addresses';
import userRoutes from './routes/users';

const app = express();
const port = process.env.PORT || 3000;

// Webhooks need raw body for Stripe signature validation, so they should be mounted before express.json()
app.use('/api/webhooks', webhookRoutes);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
