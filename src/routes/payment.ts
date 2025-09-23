import { Router } from 'express';
import {
  getAllPayment,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  getPaymentByPesananId,
  processRefund,
  getPaymentStatistics
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/payment - Ambil semua payment
router.get('/', getAllPayment);

// GET /api/payment/statistics - Ambil statistik payment
router.get('/statistics', getPaymentStatistics);

// GET /api/payment/pesanan/:pesanan_id - Ambil payment by pesanan ID
router.get('/pesanan/:pesanan_id', getPaymentByPesananId);

// GET /api/payment/:id - Ambil payment by ID
router.get('/:id', getPaymentById);

// POST /api/payment - Buat payment baru (hanya user yang sudah login)
router.post('/', authMiddleware, createPayment);

// PUT /api/payment/:id/status - Update payment status (hanya user yang sudah login)
router.put('/:id/status', authMiddleware, updatePaymentStatus);

// POST /api/payment/:id/refund - Proses refund (hanya user yang sudah login)
router.post('/:id/refund', authMiddleware, processRefund);

export default router;
