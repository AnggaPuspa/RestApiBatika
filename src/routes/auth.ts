import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

router.get('/me', authMiddleware, getMe);

export default router;
