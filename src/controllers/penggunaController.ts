import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';

const prisma = new PrismaClient();

// GET /api/pengguna - Ambil semua pengguna
export const getAllPengguna = async (req: Request, res: Response) => {
  try {
    const pengguna = await prisma.pengguna.findMany({
      include: {
        penjual: true,
        _count: {
          select: {
            pesanan: true,
            pesan: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return sendSuccess(res, { 
      pengguna, 
      count: pengguna.length 
    }, SUCCESS_MESSAGES.PENGUNA_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PENGUNA, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PENGUNA, 500, error);
  }
};

// GET /api/pengguna/id - Ambil pengguna by ID
export const getPenggunaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pengguna = await prisma.pengguna.findUnique({
      where: { id },
      include: {
        penjual: true,
        pesanan: {
          take: 5,
          orderBy: {
            created_at: 'desc'
          }
        },
        pesan: {
          take: 5,
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!pengguna) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    return sendSuccess(res, { pengguna }, SUCCESS_MESSAGES.PENGUNA_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PENGUNA_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PENGUNA, 500, error);
  }
};

// POST /api/pengguna - addd pengguna 
export const createPengguna = async (req: Request, res: Response) => {
  try {
    const { email, telepon, nama_lengkap, adalah_penjual } = req.body;

    if (!email) {
      return sendError(res, ERROR_MESSAGES.EMAIL_REQUIRED, 400);
    }

    const existingPengguna = await prisma.pengguna.findUnique({
      where: { email }
    });

    if (existingPengguna) {
      return sendError(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }

    const pengguna = await prisma.pengguna.create({
      data: {
        email,
        telepon,
        nama_lengkap,
        adalah_penjual: adalah_penjual || false
      }
    });

    return sendSuccess(res, { pengguna }, SUCCESS_MESSAGES.PENGUNA_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_PENGUNA, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_PENGUNA, 500, error);
  }
};

// PUT /api/pengguna/id - Update pengguna
export const updatePengguna = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, telepon, nama_lengkap, adalah_penjual } = req.body;

    const existingPengguna = await prisma.pengguna.findUnique({
      where: { id }
    });

    if (!existingPengguna) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    if (email && email !== existingPengguna.email) {
      const emailExists = await prisma.pengguna.findUnique({
        where: { email }
      });

      if (emailExists) {
        return sendError(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
      }
    }

    const pengguna = await prisma.pengguna.update({
      where: { id },
      data: {
        email: email || existingPengguna.email,
        telepon: telepon !== undefined ? telepon : existingPengguna.telepon,
        nama_lengkap: nama_lengkap !== undefined ? nama_lengkap : existingPengguna.nama_lengkap,
        adalah_penjual: adalah_penjual !== undefined ? adalah_penjual : existingPengguna.adalah_penjual
      }
    });

    return sendSuccess(res, { pengguna }, SUCCESS_MESSAGES.PENGUNA_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_PENGUNA, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_PENGUNA, 500, error);
  }
};

// DELETE /api/pengguna/id - Hapus pengguna
export const deletePengguna = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const existingPengguna = await prisma.pengguna.findUnique({
      where: { id }
    });

    if (!existingPengguna) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    await prisma.pengguna.delete({
      where: { id }
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.PENGUNA_DELETED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.DELETE_PENGUNA, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_DELETE_PENGUNA, 500, error);
  }
};

// GET /api/pengguna/search - Cari pengguna
export const searchPengguna = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q) {
      return sendError(res, ERROR_MESSAGES.QUERY_REQUIRED, 400);
    }

    const pengguna = await prisma.pengguna.findMany({
      where: {
        OR: [
          { nama_lengkap: { contains: q as string, mode: 'insensitive' } },
          { email: { contains: q as string, mode: 'insensitive' } },
          { telepon: { contains: q as string } }
        ]
      },
      include: {
        penjual: true,
        _count: {
          select: {
            pesanan: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: {
        created_at: 'desc'
      }
    });

    const total = await prisma.pengguna.count({
      where: {
        OR: [
          { nama_lengkap: { contains: q as string, mode: 'insensitive' } },
          { email: { contains: q as string, mode: 'insensitive' } },
          { telepon: { contains: q as string } }
        ]
      }
    });

    return sendSuccess(res, {
      pengguna,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.PENGUNA_SEARCHED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.SEARCH_PENGUNA, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_SEARCH_PENGUNA, 500, error);
  }
};