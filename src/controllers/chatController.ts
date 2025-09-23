import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import prisma from '../prismaClient';

// GET /api/chat/conversations - Ambil semua conversation user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return sendError(res, 'user_id wajib diisi', 400);
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyer_id: user_id as string },
          { seller_id: user_id as string }
        ]
      },
      include: {
        buyer: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        seller: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        product: {
          select: {
            id: true,
            nama: true,
            primary_image_url: true
          }
        },
        messages: {
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                is_read: false,
                sender_id: { not: user_id as string }
              }
            }
          }
        }
      },
      orderBy: {
        last_message_at: 'desc'
      }
    });

    return sendSuccess(res, { conversations }, SUCCESS_MESSAGES.CONVERSATIONS_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_CONVERSATIONS, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_CONVERSATIONS, 500, error);
  }
};

// GET /api/chat/conversations/:id - Ambil conversation by ID
export const getConversationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        seller: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        product: {
          select: {
            id: true,
            nama: true,
            primary_image_url: true
          }
        }
      }
    });

    if (!conversation) {
      return sendError(res, ERROR_MESSAGES.CONVERSATION_NOT_FOUND, 404);
    }

    return sendSuccess(res, { conversation }, SUCCESS_MESSAGES.CONVERSATION_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_CONVERSATION_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_CONVERSATION, 500, error);
  }
};

// POST /api/chat/conversations - Buat conversation baru
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { buyer_id, seller_id, product_id } = req.body;

    if (!buyer_id || !seller_id) {
      return sendError(res, 'buyer_id dan seller_id wajib diisi', 400);
    }

    // Cek apakah conversation sudah ada
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        buyer_id,
        seller_id,
        product_id: product_id || null
      }
    });

    if (existingConversation) {
      return sendSuccess(res, { conversation: existingConversation }, SUCCESS_MESSAGES.CONVERSATION_RETRIEVED);
    }

    // Validasi buyer dan seller
    const [buyer, seller] = await Promise.all([
      prisma.pengguna.findUnique({ where: { id: buyer_id } }),
      prisma.pengguna.findUnique({ where: { id: seller_id } })
    ]);

    if (!buyer) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    if (!seller) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    // Validasi product jika ada
    if (product_id) {
      const product = await prisma.produk.findUnique({
        where: { id: product_id }
      });

      if (!product) {
        return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        buyer_id,
        seller_id,
        product_id: product_id || null
      },
      include: {
        buyer: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        seller: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        product: {
          select: {
            id: true,
            nama: true,
            primary_image_url: true
          }
        }
      }
    });

    return sendSuccess(res, { conversation }, SUCCESS_MESSAGES.CONVERSATION_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_CONVERSATION, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_CONVERSATION, 500, error);
  }
};

// GET /api/chat/conversations/:id/messages - Ambil messages dalam conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return sendError(res, ERROR_MESSAGES.CONVERSATION_NOT_FOUND, 404);
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversation_id: id },
        include: {
          sender: {
            select: {
              id: true,
              nama_lengkap: true,
              foto_profil: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.message.count({
        where: { conversation_id: id }
      })
    ]);

    return sendSuccess(res, {
      messages: messages.reverse(), // Reverse untuk urutan ascending
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.MESSAGES_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_MESSAGES, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_MESSAGES, 500, error);
  }
};

// POST /api/chat/conversations/:id/messages - Kirim message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sender_id, content } = req.body;

    if (!sender_id || !content) {
      return sendError(res, 'sender_id dan content wajib diisi', 400);
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return sendError(res, ERROR_MESSAGES.CONVERSATION_NOT_FOUND, 404);
    }

    // Validasi sender adalah participant dalam conversation
    if (sender_id !== conversation.buyer_id && sender_id !== conversation.seller_id) {
      return sendError(res, 'Anda tidak berhak mengirim pesan dalam conversation ini', 403);
    }

    const message = await prisma.message.create({
      data: {
        conversation_id: id,
        sender_id,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        }
      }
    });

    // Update last_message_at di conversation
    await prisma.conversation.update({
      where: { id },
      data: { last_message_at: new Date() }
    });

    return sendSuccess(res, { message }, SUCCESS_MESSAGES.MESSAGE_SENT, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.SEND_MESSAGE, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_SEND_MESSAGE, 500, error);
  }
};

// PUT /api/chat/messages/:id/read - Mark message as read
export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return sendError(res, ERROR_MESSAGES.MESSAGE_NOT_FOUND, 404);
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { is_read: true }
    });

    return sendSuccess(res, { message: updatedMessage }, SUCCESS_MESSAGES.MESSAGE_MARKED_AS_READ);
  } catch (error) {
    console.error(CONSOLE_ERRORS.MARK_MESSAGE_AS_READ, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_MARK_MESSAGE_AS_READ, 500, error);
  }
};

// GET /api/chat/unread-count - Ambil jumlah unread messages
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return sendError(res, 'user_id wajib diisi', 400);
    }

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { buyer_id: user_id as string },
            { seller_id: user_id as string }
          ]
        },
        is_read: false,
        sender_id: { not: user_id as string }
      }
    });

    return sendSuccess(res, { unread_count: unreadCount }, SUCCESS_MESSAGES.UNREAD_COUNT_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_UNREAD_COUNT, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_UNREAD_COUNT, 500, error);
  }
};
