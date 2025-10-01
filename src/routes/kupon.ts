import express from 'express';
import {
  getKupon,
  getKuponById,
  createKupon,
  updateKupon,
  deleteKupon
} from '../controllers/kuponController';

const router = express.Router();

// Routes untuk kupon
router.get('/', getKupon);
router.get('/:id', getKuponById);
router.post('/', createKupon);
router.put('/:id', updateKupon);
router.delete('/:id', deleteKupon);

export default router;