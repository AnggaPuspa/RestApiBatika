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
import kategoriRoutes from './routes/kategori';
import pesananRoutes from './routes/pesanan';
import chatRoutes from './routes/chat';
import reviewRoutes from './routes/review';
import paymentRoutes from './routes/payment';
import kuponRoutes from './routes/kupon';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
// CORS configuration
const allowedOrigins = [
  'https://batika.page',
  'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Akses tidak diizinkan oleh CORS'));
    }
  },
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Dokumentasi API - Backend E-commerce Batika',
    version: '1.0.0',
    baseUrl: {
      production: 'https://api.internal.batika.page',
      local: 'http://localhost:3001'
    },
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: {
          'POST /register': 'Daftar pengguna baru',
          'POST /login': 'Masuk pengguna',
          'POST /logout': 'Keluar pengguna',
          'POST /refresh': 'Perbarui token akses',
          'GET /me': 'Dapatkan info pengguna saat ini'
        }
      },
      pengguna: {
        base: '/api/pengguna',
        routes: {
          'GET /': 'Dapatkan semua pengguna',
          'GET /:id': 'Dapatkan pengguna berdasarkan ID',
          'PUT /:id': 'Perbarui pengguna',
          'DELETE /:id': 'Hapus pengguna',
          'GET /search': 'Cari pengguna'
        }
      },
      penjual: {
        base: '/api/penjual',
        routes: {
          'GET /': 'Dapatkan semua penjual',
          'POST /': 'Buat penjual baru',
          'GET /:id': 'Dapatkan penjual berdasarkan ID',
          'PUT /:id': 'Perbarui penjual',
          'DELETE /:id': 'Hapus penjual'
        }
      },
      produk: {
        base: '/api/produk',
        routes: {
          'GET /': 'Dapatkan semua produk',
          'POST /': 'Buat produk baru',
          'GET /:id': 'Dapatkan produk berdasarkan ID',
          'PUT /:id': 'Perbarui produk',
          'DELETE /:id': 'Hapus produk',
          'GET /search': 'Cari produk'
        }
      },
      kategori: {
        base: '/api/kategori',
        routes: {
          'GET /': 'Dapatkan semua kategori',
          'POST /': 'Buat kategori baru',
          'GET /:id': 'Dapatkan kategori berdasarkan ID',
          'PUT /:id': 'Perbarui kategori',
          'DELETE /:id': 'Hapus kategori',
          'GET /categories': 'Dapatkan kategori produk'
        }
      },
      pesanan: {
        base: '/api/pesanan',
        routes: {
          'GET /': 'Dapatkan semua pesanan',
          'POST /': 'Buat pesanan baru',
          'GET /:id': 'Dapatkan pesanan berdasarkan ID',
          'PUT /:id': 'Perbarui pesanan',
          'PUT /:id/status': 'Perbarui status pesanan'
        }
      },
      chat: {
        base: '/api/chat',
        routes: {
          'GET /conversations': 'Dapatkan percakapan pengguna',
          'POST /conversations': 'Buat percakapan baru',
          'GET /messages/:conversationId': 'Dapatkan pesan percakapan',
          'POST /messages': 'Kirim pesan baru'
        }
      },
      review: {
        base: '/api/review',
        routes: {
          'GET /': 'Dapatkan semua review',
          'POST /': 'Buat review baru',
          'GET /:id': 'Dapatkan review berdasarkan ID',
          'PUT /:id': 'Perbarui review',
          'DELETE /:id': 'Hapus review'
        }
      },
      pembayaran: {
        base: '/api/payment',
        routes: {
          'POST /create': 'Buat pembayaran baru',
          'GET /:id': 'Dapatkan detail pembayaran',
          'PUT /:id/status': 'Perbarui status pembayaran',
          'POST /:id/refund': 'Proses pengembalian dana'
        }
      },
      utilitas: {
        base: '/api/supabase',
        routes: {
          'GET /test-connection': 'Tes koneksi Supabase'
        }
      }
    }
  });
});

// API Routes
app.use('/api/supabase', supabaseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pengguna', penggunaRoutes);
app.use('/api/penjual', penjualRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/kupon', kuponRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server berjalan di http://localhost:${port}`);
});