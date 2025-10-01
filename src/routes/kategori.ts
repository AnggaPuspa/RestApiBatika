import { Router } from 'express';
import {
  getAllKategori,
  getKategoriById,
  createKategori,
  updateKategori,
  deleteKategori,
  getProdukCategories
} from '../controllers/kategoriController';
import { authMiddleware, requirePenjual } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/kategori - Ambil semua kategori dengan filter dan pagination
router.get('/', getAllKategori);

// GET /api/kategori/categories - Kategori produk (dari produkController)
router.get('/categories', getProdukCategories);

// GET /api/kategori/:id - Ambil kategori by ID
router.get('/:id', getKategoriById);

// POST /api/kategori - Buat kategori baru (hanya penjual yang terverifikasi)
router.post('/', authMiddleware, requirePenjual, createKategori);

// PUT /api/kategori/:id - Update kategori (hanya penjual yang terverifikasi)
router.put('/:id', authMiddleware, requirePenjual, updateKategori);

// DELETE /api/kategori/:id - Hapus kategori (hanya penjual yang terverifikasi)
router.delete('/:id', authMiddleware, requirePenjual, deleteKategori);

export default router;