import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import prisma from '../prismaClient';

// GET /api/review - Ambil semua review
export const getAllReview = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, produk_id, rating, status = 'approved' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      status: status as string
    };
    
    if (produk_id) {
      where.produk_id = produk_id;
    }

    if (rating) {
      where.rating = parseInt(rating as string);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          pengguna: {
            select: {
              id: true,
              nama_lengkap: true,
              foto_profil: true
            }
          },
          produk: {
            select: {
              id: true,
              nama: true,
              primary_image_url: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.review.count({ where })
    ]);

    return sendSuccess(res, {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.REVIEW_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_REVIEW, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_REVIEW, 500, error);
  }
};

// GET /api/review/:id - Ambil review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        pengguna: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        produk: {
          select: {
            id: true,
            nama: true,
            primary_image_url: true
          }
        }
      }
    });

    if (!review) {
      return sendError(res, ERROR_MESSAGES.REVIEW_NOT_FOUND, 404);
    }

    return sendSuccess(res, { review }, SUCCESS_MESSAGES.REVIEW_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_REVIEW_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_REVIEW, 500, error);
  }
};

// POST /api/review - Buat review baru
export const createReview = async (req: Request, res: Response) => {
  try {
    const {
      pengguna_id,
      produk_id,
      pesanan_id,
      rating,
      judul,
      komentar
    } = req.body;

    if (!pengguna_id || !produk_id || !rating) {
      return sendError(res, 'pengguna_id, produk_id, dan rating wajib diisi', 400);
    }

    if (rating < 1 || rating > 5) {
      return sendError(res, 'Rating harus antara 1-5', 400);
    }

    // Validasi pengguna dan produk
    const [pengguna, produk] = await Promise.all([
      prisma.pengguna.findUnique({ where: { id: pengguna_id } }),
      prisma.produk.findUnique({ where: { id: produk_id } })
    ]);

    if (!pengguna) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    if (!produk) {
      return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
    }

    // Validasi apakah pengguna sudah pernah review produk ini
    const existingReview = await prisma.review.findFirst({
      where: {
        pengguna_id,
        produk_id
      }
    });

    if (existingReview) {
      return sendError(res, 'Anda sudah memberikan review untuk produk ini', 409);
    }

    // Validasi apakah pengguna sudah membeli produk (verified buyer)
    let isVerified = false;
    if (pesanan_id) {
      const pesanan = await prisma.pesanan.findFirst({
        where: {
          id: pesanan_id,
          pembeli_id: pengguna_id,
          status: 'delivered',
          item_pesanan: {
            some: {
              varian: {
                produk_id: produk_id
              }
            }
          }
        }
      });

      if (pesanan) {
        isVerified = true;
      }
    } else {
      // Cek tanpa pesanan_id
      const pesanan = await prisma.pesanan.findFirst({
        where: {
          pembeli_id: pengguna_id,
          status: 'delivered',
          item_pesanan: {
            some: {
              varian: {
                produk_id: produk_id
              }
            }
          }
        }
      });

      if (pesanan) {
        isVerified = true;
      }
    }

    const review = await prisma.review.create({
      data: {
        pengguna_id,
        produk_id,
        pesanan_id: pesanan_id || null,
        rating: parseInt(rating),
        judul: judul || null,
        komentar: komentar || null,
        is_verified: isVerified
      },
      include: {
        pengguna: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        produk: {
          select: {
            id: true,
            nama: true,
            primary_image_url: true
          }
        }
      }
    });

    return sendSuccess(res, { review }, SUCCESS_MESSAGES.REVIEW_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_REVIEW, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_REVIEW, 500, error);
  }
};

// PUT /api/review/:id - Update review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, judul, komentar } = req.body;

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return sendError(res, ERROR_MESSAGES.REVIEW_NOT_FOUND, 404);
    }

    if (rating && (rating < 1 || rating > 5)) {
      return sendError(res, 'Rating harus antara 1-5', 400);
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ? parseInt(rating) : existingReview.rating,
        judul: judul !== undefined ? judul : existingReview.judul,
        komentar: komentar !== undefined ? komentar : existingReview.komentar
      },
      include: {
        pengguna: {
          select: {
            id: true,
            nama_lengkap: true,
            foto_profil: true
          }
        },
        produk: {
          select: {
            id: true,
            nama: true,
            primary_image_url: true
          }
        }
      }
    });

    return sendSuccess(res, { review }, SUCCESS_MESSAGES.REVIEW_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_REVIEW, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_REVIEW, 500, error);
  }
};

// DELETE /api/review/:id - Hapus review (hanya oleh pembuat review)
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pengguna_id } = req.body;

    if (!pengguna_id) {
      return sendError(res, 'pengguna_id wajib diisi', 400);
    }

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return sendError(res, ERROR_MESSAGES.REVIEW_NOT_FOUND, 404);
    }

    // Validasi hanya pembuat review yang bisa hapus
    if (existingReview.pengguna_id !== pengguna_id) {
      return sendError(res, 'Anda tidak berhak menghapus review ini', 403);
    }

    await prisma.review.delete({
      where: { id }
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.REVIEW_DELETED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.DELETE_REVIEW, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_DELETE_REVIEW, 500, error);
  }
};

// GET /api/review/produk/:produk_id/rating - Ambil rating produk
export const getProdukRating = async (req: Request, res: Response) => {
  try {
    const { produk_id } = req.params;

    const produk = await prisma.produk.findUnique({
      where: { id: produk_id }
    });

    if (!produk) {
      return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
    }

    const reviews = await prisma.review.findMany({
      where: {
        produk_id,
        status: 'approved'
      },
      select: {
        rating: true
      }
    });

    const rating_rata = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    const rating_jumlah = reviews.length;

    // Distribusi rating
    const rating_distribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    return sendSuccess(res, {
      produk_id,
      rating_rata: parseFloat(rating_rata.toFixed(2)),
      rating_jumlah,
      rating_distribution
    }, SUCCESS_MESSAGES.PRODUK_RATING_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PRODUK_RATING, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PRODUK_RATING, 500, error);
  }
};

// GET /api/review/can-review/:produk_id - Cek apakah user bisa review
export const canReview = async (req: Request, res: Response) => {
  try {
    const { produk_id } = req.params;
    const { pengguna_id } = req.query;

    if (!pengguna_id) {
      return sendError(res, 'pengguna_id wajib diisi', 400);
    }

    // Cek apakah sudah pernah review
    const existingReview = await prisma.review.findFirst({
      where: {
        pengguna_id: pengguna_id as string,
        produk_id
      }
    });

    if (existingReview) {
      return sendSuccess(res, { can_review: false, reason: 'Sudah pernah review' }, SUCCESS_MESSAGES.CAN_REVIEW_CHECKED);
    }

    // Cek apakah sudah membeli produk
    const pesanan = await prisma.pesanan.findFirst({
      where: {
        pembeli_id: pengguna_id as string,
        status: 'delivered',
        item_pesanan: {
          some: {
            varian: {
              produk_id: produk_id
            }
          }
        }
      }
    });

    const can_review = !!pesanan;

    return sendSuccess(res, { 
      can_review,
      reason: can_review ? 'Bisa review' : 'Belum membeli produk'
    }, SUCCESS_MESSAGES.CAN_REVIEW_CHECKED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CHECK_CAN_REVIEW, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CHECK_CAN_REVIEW, 500, error);
  }
};
