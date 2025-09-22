import { Router } from 'express';
import {
  createPenjual,
  getAllPenjual,
  getPenjualById
} from '../controllers/penjualController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/penjual - Ambil semua penjual
router.get('/', getAllPenjual);

// GET /api/penjual/:id - Ambil penjual by ID
router.get('/:id', getPenjualById);

// POST /api/penjual - Buat penjual baru (hanya user yang sudah login)
router.post('/', authMiddleware, createPenjual);

export default router;