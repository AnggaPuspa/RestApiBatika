import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';

const prisma = new PrismaClient();

// GET /api/kategori - Ambil semua kategori
export const getAllKategori = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 50, aktif } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
        { deskripsi: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (aktif !== undefined) {
      where.aktif = aktif === 'true';
    }

    const [kategori, total] = await Promise.all([
      prisma.kategori.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: {
              produk: true
            }
          },
          parent: {
            select: {
              id: true,
              nama: true,
              slug: true
            }
          },
          children: {
            select: {
              id: true,
              nama: true,
              slug: true
            }
          }
        },
        orderBy: [
          { urutan: 'asc' },
          { nama: 'asc' }
        ]
      }),
      prisma.kategori.count({ where })
    ]);

    return sendSuccess(res, {
      kategori,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.KATEGORI_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_KATEGORI, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_KATEGORI, 500, error);
  }
};

// GET /api/kategori/categories - Get produk categories (dipindah dari produkController)
export const getProdukCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.kategori.findMany({
      include: {
        _count: {
          select: {
            produk: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    return sendSuccess(res, { categories }, SUCCESS_MESSAGES.PRODUK_CATEGORIES_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PRODUK_CATEGORIES, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PRODUK_CATEGORIES, 500, error);
  }
};

// POST /api/kategori - Create kategori baru
export const createKategori = async (req: Request, res: Response) => {
  try {
    const {
      nama,
      slug,
      deskripsi,
      parent_id,
      urutan = 0,
      aktif = true
    } = req.body;

    if (!nama) {
      return sendError(res, ERROR_MESSAGES.NAMA_REQUIRED, 400);
    }

    // Generate slug jika tidak disediakan
    const finalSlug = slug || nama.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Check if slug already exists
    const existingSlug = await prisma.kategori.findUnique({
      where: { slug: finalSlug }
    });

    if (existingSlug) {
      return sendError(res, ERROR_MESSAGES.SLUG_ALREADY_EXISTS, 409);
    }

    // Validasi parent_id jika ada
    if (parent_id) {
      const parentKategori = await prisma.kategori.findUnique({
        where: { id: parent_id }
      });

      if (!parentKategori) {
        return sendError(res, ERROR_MESSAGES.KATEGORI_PARENT_NOT_FOUND, 404);
      }
    }

    const kategori = await prisma.kategori.create({
      data: {
        nama,
        slug: finalSlug,
        deskripsi,
        parent_id,
        urutan: Number(urutan),
        aktif
      },
      include: {
        parent: {
          select: {
            id: true,
            nama: true,
            slug: true
          }
        },
        _count: {
          select: {
            produk: true
          }
        }
      }
    });

    return sendSuccess(res, { kategori }, SUCCESS_MESSAGES.KATEGORI_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_KATEGORI, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_KATEGORI, 500, error);
  }
};

// GET /api/kategori/:id - Ambil kategori by ID
export const getKategoriById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kategori = await prisma.kategori.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            nama: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            nama: true,
            slug: true
          }
        },
        _count: {
          select: {
            produk: true
          }
        }
      }
    });

    if (!kategori) {
      return sendError(res, ERROR_MESSAGES.KATEGORI_NOT_FOUND, 404);
    }

    return sendSuccess(res, { kategori }, SUCCESS_MESSAGES.KATEGORI_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_KATEGORI_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_KATEGORI, 500, error);
  }
};

// PUT /api/kategori/:id - Update kategori
export const updateKategori = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingKategori = await prisma.kategori.findUnique({
      where: { id }
    });

    if (!existingKategori) {
      return sendError(res, ERROR_MESSAGES.KATEGORI_NOT_FOUND, 404);
    }

    if (updateData.slug && updateData.slug !== existingKategori.slug) {
      const existingSlug = await prisma.kategori.findFirst({
        where: { 
          slug: updateData.slug,
          id: { not: id }
        }
      });
      if (existingSlug) {
        return sendError(res, ERROR_MESSAGES.SLUG_ALREADY_EXISTS, 409);
      }
    }

    if (updateData.parent_id) {
      const parentKategori = await prisma.kategori.findUnique({
        where: { id: updateData.parent_id }
      });

      if (!parentKategori) {
        return sendError(res, ERROR_MESSAGES.KATEGORI_PARENT_NOT_FOUND, 404);
      }

      if (updateData.parent_id === id) {
        return sendError(res, ERROR_MESSAGES.KATEGORI_SELF_PARENT, 400);
      }
    }

    const kategori = await prisma.kategori.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            nama: true,
            slug: true
          }
        },
        children: {
          select: {
            id: true,
            nama: true,
            slug: true
          }
        },
        _count: {
          select: {
            produk: true
          }
        }
      }
    });

    return sendSuccess(res, { kategori }, SUCCESS_MESSAGES.KATEGORI_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_KATEGORI, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_KATEGORI, 500, error);
  }
};

// DELETE /api/kategori/:id - Delete kategori
export const deleteKategori = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kategori = await prisma.kategori.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            produk: true,
            children: true
          }
        }
      }
    });

    if (!kategori) {
      return sendError(res, ERROR_MESSAGES.KATEGORI_NOT_FOUND, 404);
    }

    if (kategori._count.produk > 0) {
      return sendError(res, ERROR_MESSAGES.KATEGORI_HAS_PRODUCTS, 400);
    }

    if (kategori._count.children > 0) {
      return sendError(res, ERROR_MESSAGES.KATEGORI_HAS_SUBCATEGORIES, 400);
    }

    await prisma.kategori.delete({
      where: { id }
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.KATEGORI_DELETED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.DELETE_KATEGORI, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_DELETE_KATEGORI, 500, error);
  }
};

export const generateSlug = (nama: string): string => {
  return nama.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};