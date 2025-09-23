import { Router } from 'express';
import {
  createPenjual,
  getAllPenjual,
  getPenjualById,
  updatePenjual,
  deletePenjual,
  updateVerificationStatus,
  getVerificationStatus
} from '../controllers/penjualController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/penjual - Ambil semua penjual
router.get('/', getAllPenjual);

// GET /api/penjual/:id - Ambil penjual by ID
router.get('/:id', getPenjualById);

// POST /api/penjual - Buat penjual baru (hanya user yang sudah login)
router.post('/', authMiddleware, createPenjual);

// PUT /api/penjual/:id - Update penjual (hanya user yang sudah login)
router.put('/:id', authMiddleware, updatePenjual);

// DELETE /api/penjual/:id - Delete penjual (hanya user yang sudah login)
router.delete('/:id', authMiddleware, deletePenjual);

// PUT /api/penjual/:id/verify - Update verification status (hanya user yang sudah login)
router.put('/:id/verify', authMiddleware, updateVerificationStatus);

// GET /api/penjual/:id/verification-status - Ambil verification status
router.get('/:id/verification-status', getVerificationStatus);

export default router;