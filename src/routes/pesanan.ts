import { Router } from 'express';
import {
  getAllPesanan,
  getPesananById,
  createPesanan,
  updatePesananStatus,
  getPesananTracking,
  cancelPesanan
} from '../controllers/pesananController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/pesanan - Ambil semua pesanan
router.get('/', getAllPesanan);

// GET /api/pesanan/:id - Ambil pesanan by ID
router.get('/:id', getPesananById);

// GET /api/pesanan/:id/tracking - Tracking pesanan
router.get('/:id/tracking', getPesananTracking);

// POST /api/pesanan - Buat pesanan baru (hanya user yang sudah login)
router.post('/', authMiddleware, createPesanan);

// PUT /api/pesanan/:id - Update status pesanan (hanya user yang sudah login)
router.put('/:id', authMiddleware, updatePesananStatus);

// DELETE /api/pesanan/:id - Cancel pesanan (hanya user yang sudah login)
router.delete('/:id', authMiddleware, cancelPesanan);

export default router;
