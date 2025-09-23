import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';

const prisma = new PrismaClient();

// GET /api/produk - Ambil semua produk
export const getAllProduk = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, penjual_id, aktif, motif, bahan } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nama: { contains: search as string, mode: 'insensitive' } },
        { deskripsi: { contains: search as string, mode: 'insensitive' } },
        { asal_wilayah: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (penjual_id) {
      where.penjual_id = penjual_id;
    }

    if (aktif !== undefined) {
      where.aktif = aktif === 'true';
    }

    if (motif) {
      where.motif = {
        has: motif as string
      };
    }

    if (bahan) {
      where.bahan = {
        has: bahan as string
      };
    }

    const [produk, total] = await Promise.all([
      prisma.produk.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          penjual: {
            select: {
              id: true,
              nama_toko: true,
              pengguna: {
                select: {
                  nama_lengkap: true,
                  email: true
                }
              }
            }
          },
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
        }
      }),
      prisma.produk.count({ where })
    ]);

    return sendSuccess(res, {
      produk,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.PRODUK_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PRODUK, 500, error);
  }
};

// GET /api/produk/:id - Ambil produk by ID
export const getProdukById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const produk = await prisma.produk.findUnique({
      where: { id },
      include: {
        penjual: {
          select: {
            id: true,
            nama_toko: true,
            pengguna: {
              select: {
                nama_lengkap: true,
                email: true
              }
            }
          }
        },
        produk_kategori: {
          include: {
            kategori: true
          }
        },
        varian_produk: true,
        review: {
          include: {
            pengguna: {
              select: {
                nama_lengkap: true,
                foto_profil: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            review: true
          }
        }
      }
    });

    if (!produk) {
      return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
    }

    // Hitung rating produk dari review
    const reviews = await prisma.review.findMany({
      where: {
        produk_id: produk.id,
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

    // Tambahkan rating ke response
    const produkWithRating = {
      ...produk,
      rating_rata: parseFloat(rating_rata.toFixed(2)),
      rating_jumlah
    };

    return sendSuccess(res, { produk: produkWithRating }, SUCCESS_MESSAGES.PRODUK_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PRODUK_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PRODUK, 500, error);
  }
};

// POST /api/produk - Create produk baru 
export const createProduk = async (req: Request, res: Response) => {
  try {
    const {
      penjual_id,
      nama,
      deskripsi,
      cerita_budaya,
      panduan_perawatan,
      asal_wilayah,
      attributes,
      motif = [],
      bahan = [],
      primary_image_url,
      images,
      hs_code,
      made_in_country_code,
      seo_slug,
      aktif = true,
      kategori_ids = [],
      varian = []
    } = req.body;

    if (!penjual_id || !nama) {
      return sendError(res, 'penjual_id dan nama wajib diisi', 400);
    }

    const penjual = await prisma.penjual.findUnique({
      where: { id: penjual_id }
    });

    if (!penjual) {
      return sendError(res, ERROR_MESSAGES.PENJUAL_NOT_FOUND, 404);
    }

    if (req.body.kode_sku) {
      const existingSku = await prisma.produk.findFirst({
        where: { kode_sku: req.body.kode_sku }
      });
      if (existingSku) {
        return sendError(res, ERROR_MESSAGES.SKU_ALREADY_EXISTS, 409);
      }
    }

    if (seo_slug) {
      const existingSlug = await prisma.produk.findFirst({
        where: { seo_slug }
      });
      if (existingSlug) {
        return sendError(res, ERROR_MESSAGES.SLUG_ALREADY_EXISTS, 409);
      }
    }

    // Create produk with transaction
    const result = await prisma.$transaction(async (tx) => {
      const produk = await tx.produk.create({
        data: {
          penjual_id,
          kode_sku: req.body.kode_sku,
          nama,
          deskripsi,
          cerita_budaya,
          panduan_perawatan,
          asal_wilayah,
          attributes,
          motif,
          bahan,
          primary_image_url,
          images,
          hs_code,
          made_in_country_code,
          seo_slug,
          aktif
        }
      });

      // Create kategori relation
      if (kategori_ids.length > 0) {
        await tx.produkKategori.createMany({
          data: kategori_ids.map((kategori_id: string) => ({
            produk_id: produk.id,
            kategori_id
          }))
        });
      }

      // Create varian relation
      if (varian.length > 0) {
        await tx.varianProduk.createMany({
          data: varian.map((v: any) => ({
            produk_id: produk.id,
            nama_varian: v.nama_varian,
            harga: parseFloat(v.harga),
            stok: parseInt(v.stok),
            sku: v.sku,
            berat_gram: v.berat_gram ? parseInt(v.berat_gram) : null
          }))
        });
      }

      return produk;
    });

    return sendSuccess(res, { produk: result }, SUCCESS_MESSAGES.PRODUK_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_PRODUK, 500, error);
  }
};

// PUT /api/produk/:id - Update produk
export const updateProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingProduk = await prisma.produk.findUnique({
      where: { id }
    });

    if (!existingProduk) {
      return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
    }

    // Check if SKU already exists
    if (updateData.kode_sku && updateData.kode_sku !== existingProduk.kode_sku) {
      const existingSku = await prisma.produk.findFirst({
        where: { 
          kode_sku: updateData.kode_sku,
          id: { not: id }
        }
      });
      if (existingSku) {
        return sendError(res, ERROR_MESSAGES.SKU_ALREADY_EXISTS, 409);
      }
    }

    // Check if slug already exists
    if (updateData.seo_slug && updateData.seo_slug !== existingProduk.seo_slug) {
      const existingSlug = await prisma.produk.findFirst({
        where: { 
          seo_slug: updateData.seo_slug,
          id: { not: id }
        }
      });
      if (existingSlug) {
        return sendError(res, ERROR_MESSAGES.SLUG_ALREADY_EXISTS, 409);
      }
    }

    const produk = await prisma.produk.update({
      where: { id },
      data: updateData,
      include: {
        penjual: {
          select: {
            id: true,
            nama_toko: true
          }
        },
        produk_kategori: {
          include: {
            kategori: true
          }
        },
        varian_produk: true
      }
    });

    return sendSuccess(res, { produk }, SUCCESS_MESSAGES.PRODUK_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_PRODUK, 500, error);
  }
};

// DELETE /api/produk/:id - Delete produk
export const deleteProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    
    const produk = await prisma.produk.findUnique({
      where: { id }
    });

    if (!produk) {
      return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
    }

    await prisma.produk.delete({
      where: { id }
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.PRODUK_DELETED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.DELETE_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_DELETE_PRODUK, 500, error);
  }
};

// GET /api/produk/search - Search produk
export const searchProduk = async (req: Request, res: Response) => {
  try {
    const {
      q,
      page = '1',
      limit = '10',
      kategori_id,
      min_harga,
      max_harga,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    if (!q) {
      return sendError(res, ERROR_MESSAGES.QUERY_REQUIRED, 400);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    
    const searchQuery = {
      OR: [
        { nama: { contains: q as string, mode: 'insensitive' } },
        { deskripsi: { contains: q as string, mode: 'insensitive' } },
        { kode_sku: { contains: q as string, mode: 'insensitive' } }
      ],
      AND: []
    } as any;


    if (kategori_id) {
      searchQuery.AND.push({
        produk_kategori: {
          some: {
            kategori_id: kategori_id as string
          }
        }
      });
    }

    const orderBy: any = {};
    orderBy[sort_by as string] = sort_order as string;

    const [produk, total] = await Promise.all([
      prisma.produk.findMany({
        where: searchQuery,
        include: {
          penjual: {
            select: {
              id: true,
              nama_toko: true,
              pengguna: {
                select: {
                  nama_lengkap: true
                }
              }
            }
          },
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
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.produk.count({ where: searchQuery })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, {
      produk,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNum,
        has_next_page: pageNum < totalPages,
        has_prev_page: pageNum > 1
      },
      search_query: q
    }, SUCCESS_MESSAGES.PRODUK_SEARCHED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.SEARCH_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_SEARCH_PRODUK, 500, error);
  }
};

// GET /api/produk/featured - Get featured produk
export const getFeaturedProduk = async (req: Request, res: Response) => {
  try {
    const { limit = '8' } = req.query;
    const limitNum = parseInt(limit as string);

    const produk = await prisma.produk.findMany({
      where: {
        aktif: true
      },
      include: {
        penjual: {
          select: {
            id: true,
            nama_toko: true,
            pengguna: {
              select: {
                nama_lengkap: true
              }
            }
          }
        },
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
      take: limitNum
    });

    return sendSuccess(res, { produk }, SUCCESS_MESSAGES.FEATURED_PRODUK_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_FEATURED_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_FEATURED_PRODUK, 500, error);
  }
};

// GET /api/produk/categories - Get produk categories
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

// GET /api/produk/:id/can-review - Cek apakah user bisa review produk
export const canReviewProduk = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pengguna_id } = req.query;

    if (!pengguna_id) {
      return sendError(res, 'pengguna_id wajib diisi', 400);
    }

    const produk = await prisma.produk.findUnique({
      where: { id }
    });

    if (!produk) {
      return sendError(res, ERROR_MESSAGES.PRODUK_NOT_FOUND, 404);
    }

    // Cek apakah sudah pernah review
    const existingReview = await prisma.review.findFirst({
      where: {
        pengguna_id: pengguna_id as string,
        produk_id: id
      }
    });

    if (existingReview) {
      return sendSuccess(res, { 
        can_review: false, 
        reason: 'Sudah pernah review',
        existing_review: {
          id: existingReview.id,
          rating: existingReview.rating,
          created_at: existingReview.created_at
        }
      }, SUCCESS_MESSAGES.CAN_REVIEW_CHECKED);
    }

    // Cek apakah sudah membeli produk
    const pesanan = await prisma.pesanan.findFirst({
      where: {
        pembeli_id: pengguna_id as string,
        status: 'delivered',
        item_pesanan: {
          some: {
            varian: {
              produk_id: id
            }
          }
        }
      }
    });

    const can_review = !!pesanan;

    return sendSuccess(res, { 
      can_review,
      reason: can_review ? 'Bisa review' : 'Belum membeli produk',
      produk_id: id
    }, SUCCESS_MESSAGES.CAN_REVIEW_CHECKED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CHECK_CAN_REVIEW_PRODUK, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CHECK_CAN_REVIEW_PRODUK, 500, error);
  }
};