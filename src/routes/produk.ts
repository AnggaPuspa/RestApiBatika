import { Router } from 'express';
import {
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  searchProduk,
  getFeaturedProduk,
  getProdukCategories
} from '../controllers/produkController';
import { authMiddleware, requirePenjual } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/produk - Ambil semua produk dengan filter
router.get('/', getAllProduk);

// GET /api/produk/featured - Produk unggulan
router.get('/featured', getFeaturedProduk);

// GET /api/produk/categories - Kategori produk
router.get('/categories', getProdukCategories);

// GET /api/produk/search - Cari produk dengan filter
router.get('/search', searchProduk);

// GET /api/produk/:id - Ambil produk by ID
router.get('/:id', getProdukById);

// POST /api/produk - Buat produk baru (hanya penjual)
router.post('/', authMiddleware, requirePenjual, createProduk);

// PUT /api/produk/:id - Update produk (hanya penjual)
router.put('/:id', authMiddleware, requirePenjual, updateProduk);

// DELETE /api/produk/:id - Hapus produk (hanya penjual)
router.delete('/:id', authMiddleware, requirePenjual, deleteProduk);

export default router;