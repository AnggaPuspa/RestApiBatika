// Load environment variables first
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import supabaseRoutes from './routes/supabase';
import authRoutes from './routes/auth';
import penggunaRoutes from './routes/pengguna';
import penjualRoutes from './routes/penjual';
import produkRoutes from './routes/produk';
import pesananRoutes from './routes/pesanan';
import chatRoutes from './routes/chat';
import reviewRoutes from './routes/review';
import paymentRoutes from './routes/payment';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/supabase', supabaseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/penjual', penjualRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/payment', paymentRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});