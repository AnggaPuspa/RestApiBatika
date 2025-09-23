import { Router } from 'express';
import {
  getAllReview,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getProdukRating,
  canReview
} from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/review - Ambil semua review
router.get('/', getAllReview);

// GET /api/review/produk/:produk_id/rating - Ambil rating produk
router.get('/produk/:produk_id/rating', getProdukRating);

// GET /api/review/can-review/:produk_id - Cek apakah user bisa review
router.get('/can-review/:produk_id', canReview);

// GET /api/review/:id - Ambil review by ID
router.get('/:id', getReviewById);

// POST /api/review - Buat review baru (hanya user yang sudah login)
router.post('/', authMiddleware, createReview);

// PUT /api/review/:id - Update review (hanya user yang sudah login)
router.put('/:id', authMiddleware, updateReview);

// DELETE /api/review/:id - Hapus review (hanya user yang sudah login)
router.delete('/:id', authMiddleware, deleteReview);

export default router;
