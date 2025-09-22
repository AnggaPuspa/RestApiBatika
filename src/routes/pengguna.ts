import { Router } from 'express';
import {
  getAllPengguna,
  getPenggunaById,
  createPengguna,
  updatePengguna,
  deletePengguna,
  searchPengguna
} from '../controllers/penggunaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/pengguna - Ambil semua pengguna
router.get('/', getAllPengguna);

// GET /api/pengguna/search - Cari pengguna
router.get('/search', searchPengguna);

// GET /api/pengguna/:id - Ambil pengguna by ID
router.get('/:id', getPenggunaById);

// POST /api/pengguna - Buat pengguna baru (hanya user yang sudah login)
router.post('/', authMiddleware, createPengguna);

// PUT /api/pengguna/:id - Update pengguna (hanya user yang sudah login)
router.put('/:id', authMiddleware, updatePengguna);

// DELETE /api/pengguna/:id - Hapus pengguna (hanya user yang sudah login)
router.delete('/:id', authMiddleware, deletePengguna);

export default router;