import { Router } from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  getMessages,
  sendMessage,
  markMessageAsRead,
  getUnreadCount
} from '../controllers/chatController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/chat/conversations - Ambil semua conversation user
router.get('/conversations', getConversations);

// GET /api/chat/unread-count - Ambil jumlah unread messages
router.get('/unread-count', getUnreadCount);

// GET /api/chat/conversations/:id - Ambil conversation by ID
router.get('/conversations/:id', getConversationById);

// GET /api/chat/conversations/:id/messages - Ambil messages dalam conversation
router.get('/conversations/:id/messages', getMessages);

// POST /api/chat/conversations - Buat conversation baru (hanya user yang sudah login)
router.post('/conversations', authMiddleware, createConversation);

// POST /api/chat/conversations/:id/messages - Kirim message (hanya user yang sudah login)
router.post('/conversations/:id/messages', authMiddleware, sendMessage);

// PUT /api/chat/messages/:id/read - Mark message as read (hanya user yang sudah login)
router.put('/messages/:id/read', authMiddleware, markMessageAsRead);

export default router;
