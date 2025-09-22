import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';

const prisma = new PrismaClient();

// POST /api/penjual - Create new penjual
export const createPenjual = async (req: Request, res: Response) => {
  try {
    const {
      pengguna_id,
      nama_toko,
      slug_toko,
      origin_region,
      badges,
      verification_level,
      verification_docs,
      default_currency,
      rating_rata,
      rating_jumlah
    } = req.body;

   
    if (!pengguna_id) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_ID_REQUIRED, 400);
    }


    const pengguna = await prisma.pengguna.findUnique({
      where: { id: pengguna_id }
    });

    if (!pengguna) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    
    const existingPenjual = await prisma.penjual.findUnique({
      where: { pengguna_id }
    });

    if (existingPenjual) {
      return sendError(res, ERROR_MESSAGES.PENJUAL_ALREADY_EXISTS, 409);
    }

    
    if (slug_toko) {
      const slugExists = await prisma.penjual.findUnique({
        where: { slug_toko }
      });

      if (slugExists) {
        return sendError(res, ERROR_MESSAGES.SLUG_TOKO_ALREADY_EXISTS, 409);
      }
    }

    const penjual = await prisma.penjual.create({
      data: {
        pengguna_id,
        nama_toko,
        slug_toko,
        origin_region,
        badges,
        verification_level,
        verification_docs,
        default_currency,
        rating_rata: rating_rata ? parseFloat(rating_rata) : null,
        rating_jumlah: rating_jumlah ? parseInt(rating_jumlah) : null
      },
      include: {
        pengguna: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            telepon: true
          }
        }
      }
    });

    return sendSuccess(res, { penjual }, SUCCESS_MESSAGES.PENJUAL_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_PENJUAL, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_PENJUAL, 500, error);
  }
};

// GET /api/penjual - Ambil semua penjual
export const getAllPenjual = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, verification_level } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nama_toko: { contains: search as string, mode: 'insensitive' } },
        { origin_region: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (verification_level) {
      where.verification_level = verification_level;
    }

    const [penjual, total] = await Promise.all([
      prisma.penjual.findMany({
        where,
        include: {
          pengguna: {
            select: {
              id: true,
              nama_lengkap: true,
              email: true,
              telepon: true
            }
          },
          _count: {
            select: {
              produk: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.penjual.count({ where })
    ]);

    return sendSuccess(res, {
      penjual,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.PENJUAL_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PENJUAL, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PENJUAL, 500, error);
  }
};

// GET /api/penjual/:id - Ambil penjual by ID
export const getPenjualById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const penjual = await prisma.penjual.findUnique({
      where: { id },
      include: {
        pengguna: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            telepon: true,
            foto_profil: true
          }
        },
        produk: {
          where: {
            aktif: true
          },
          include: {
            produk_kategori: {
              include: {
                kategori: true
              }
            },
            varian_produk: true,
            _count: {
              select: {
                review: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            produk: true
          }
        }
      }
    });

    if (!penjual) {
      return sendError(res, ERROR_MESSAGES.PENJUAL_NOT_FOUND, 404);
    }

    return sendSuccess(res, { penjual }, SUCCESS_MESSAGES.PENJUAL_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PENJUAL_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PENJUAL, 500, error);
  }
};

// PUT /api/penjual/:id - Update penjual
export const updatePenjual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    
    const existingPenjual = await prisma.penjual.findUnique({
      where: { id }
    });

    if (!existingPenjual) {
      return sendError(res, ERROR_MESSAGES.PENJUAL_NOT_FOUND, 404);
    }

    
    if (updateData.slug_toko && updateData.slug_toko !== existingPenjual.slug_toko) {
      const existingSlug = await prisma.penjual.findFirst({
        where: { 
          slug_toko: updateData.slug_toko,
          id: { not: id }
        }
      });
      if (existingSlug) {
        return sendError(res, ERROR_MESSAGES.SLUG_TOKO_ALREADY_EXISTS, 409);
      }
    }

    const penjual = await prisma.penjual.update({
      where: { id },
      data: updateData,
      include: {
        pengguna: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            telepon: true
          }
        }
      }
    });

    return sendSuccess(res, { penjual }, SUCCESS_MESSAGES.PENJUAL_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_PENJUAL, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_PENJUAL, 500, error);
  }
};

// DELETE /api/penjual/:id - Delete penjual
export const deletePenjual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    
    const penjual = await prisma.penjual.findUnique({
      where: { id }
    });

    if (!penjual) {
      return sendError(res, ERROR_MESSAGES.PENJUAL_NOT_FOUND, 404);
    }

    
    await prisma.pengguna.update({
      where: { id: penjual.pengguna_id },
      data: { adalah_penjual: false }
    });

        
    await prisma.penjual.delete({
      where: { id }
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.PENJUAL_DELETED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.DELETE_PENJUAL, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_DELETE_PENJUAL, 500, error);
  }
};