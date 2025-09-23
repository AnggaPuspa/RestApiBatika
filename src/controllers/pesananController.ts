import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import prisma from '../prismaClient';

// GET /api/pesanan - Ambil semua pesanan
export const getAllPesanan = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, pembeli_id, penjual_id } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (pembeli_id) {
      where.pembeli_id = pembeli_id;
    }

    if (penjual_id) {
      where.penjual_id = penjual_id;
    }

    const [pesanan, total] = await Promise.all([
      prisma.pesanan.findMany({
        where,
        include: {
          pembeli: {
            select: {
              id: true,
              nama_lengkap: true,
              email: true,
              telepon: true
            }
          },
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
          item_pesanan: {
            include: {
              varian: {
                select: {
                  nama_varian: true,
                  harga: true
                }
              }
            }
          },
          pembayaran: true,
          pengiriman: true
        },
        skip,
        take: Number(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.pesanan.count({ where })
    ]);

    return sendSuccess(res, {
      pesanan,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.PESANAN_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PESANAN, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PESANAN, 500, error);
  }
};

// GET /api/pesanan/:id - Ambil pesanan by ID
export const getPesananById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pesanan = await prisma.pesanan.findUnique({
      where: { id },
      include: {
        pembeli: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            telepon: true
          }
        },
        penjual: {
          select: {
            id: true,
            nama_toko: true,
            pengguna: {
              select: {
                nama_lengkap: true,
                email: true,
                telepon: true
              }
            }
          }
        },
        item_pesanan: {
          include: {
            varian: {
              select: {
                nama_varian: true,
                harga: true
              }
            }
          }
        },
        pembayaran: true,
        pengiriman: true
      }
    });

    if (!pesanan) {
      return sendError(res, ERROR_MESSAGES.PESANAN_NOT_FOUND, 404);
    }

    return sendSuccess(res, { pesanan }, SUCCESS_MESSAGES.PESANAN_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PESANAN_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PESANAN, 500, error);
  }
};

// POST /api/pesanan - Buat pesanan baru
export const createPesanan = async (req: Request, res: Response) => {
  try {
    const {
      pembeli_id,
      penjual_id,
      mata_uang = 'IDR',
      subtotal,
      ongkir,
      total,
      ship_nama_penerima,
      ship_telepon,
      ship_alamat1,
      ship_alamat2,
      ship_kota,
      ship_wilayah,
      ship_kode_pos,
      ship_country_code = 'ID',
      items = []
    } = req.body;

    if (!pembeli_id || !penjual_id || !items.length) {
      return sendError(res, 'pembeli_id, penjual_id, dan items wajib diisi', 400);
    }

    // Validasi pembeli dan penjual
    const [pembeli, penjual] = await Promise.all([
      prisma.pengguna.findUnique({ where: { id: pembeli_id } }),
      prisma.penjual.findUnique({ where: { id: penjual_id } })
    ]);

    if (!pembeli) {
      return sendError(res, ERROR_MESSAGES.PENGUNA_NOT_FOUND, 404);
    }

    if (!penjual) {
      return sendError(res, ERROR_MESSAGES.PENJUAL_NOT_FOUND, 404);
    }

    // Buat pesanan dengan transaction
    const result = await prisma.$transaction(async (tx) => {
      const pesanan = await tx.pesanan.create({
        data: {
          pembeli_id,
          penjual_id,
          mata_uang,
          subtotal: parseFloat(subtotal),
          ongkir: parseFloat(ongkir),
          total: parseFloat(total),
          ship_nama_penerima,
          ship_telepon,
          ship_alamat1,
          ship_alamat2,
          ship_kota,
          ship_wilayah,
          ship_kode_pos,
          ship_country_code
        }
      });

      // Buat item pesanan
      for (const item of items) {
        await tx.itemPesanan.create({
          data: {
            pesanan_id: pesanan.id,
            varian_id: item.varian_id,
            nama_produk_snapshot: item.nama_produk,
            nama_varian_snapshot: item.nama_varian,
            qty: parseInt(item.qty),
            harga_satuan: parseFloat(item.harga_satuan),
            subtotal: parseFloat(item.subtotal)
          }
        });
      }

      return pesanan;
    });

    return sendSuccess(res, { pesanan: result }, SUCCESS_MESSAGES.PESANAN_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_PESANAN, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_PESANAN, 500, error);
  }
};

// PUT /api/pesanan/:id - Update status pesanan
export const updatePesananStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, 'status wajib diisi', 400);
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'status tidak valid', 400);
    }

    const existingPesanan = await prisma.pesanan.findUnique({
      where: { id }
    });

    if (!existingPesanan) {
      return sendError(res, ERROR_MESSAGES.PESANAN_NOT_FOUND, 404);
    }

    const pesanan = await prisma.pesanan.update({
      where: { id },
      data: { status },
      include: {
        pembeli: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true
          }
        },
        penjual: {
          select: {
            id: true,
            nama_toko: true
          }
        }
      }
    });

    return sendSuccess(res, { pesanan }, SUCCESS_MESSAGES.PESANAN_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_PESANAN, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_PESANAN, 500, error);
  }
};

// GET /api/pesanan/:id/tracking - Tracking pesanan
export const getPesananTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pesanan = await prisma.pesanan.findUnique({
      where: { id },
      include: {
        pengiriman: {
          orderBy: {
            created_at: 'desc'
          }
        },
        pembayaran: {
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!pesanan) {
      return sendError(res, ERROR_MESSAGES.PESANAN_NOT_FOUND, 404);
    }

    // Buat timeline tracking
    const tracking = {
      pesanan_id: pesanan.id,
      status: pesanan.status,
      created_at: pesanan.created_at,
      timeline: [
        {
          status: 'pending',
          description: 'Pesanan dibuat',
          timestamp: pesanan.created_at,
          completed: true
        },
        {
          status: 'paid',
          description: 'Pembayaran berhasil',
          timestamp: pesanan.pembayaran?.[0]?.paid_at || null,
          completed: pesanan.status !== 'pending'
        },
        {
          status: 'shipped',
          description: 'Pesanan dikirim',
          timestamp: pesanan.pengiriman?.[0]?.shipped_at || null,
          completed: ['shipped', 'delivered'].includes(pesanan.status)
        },
        {
          status: 'delivered',
          description: 'Pesanan diterima',
          timestamp: pesanan.pengiriman?.[0]?.delivered_at || null,
          completed: pesanan.status === 'delivered'
        }
      ]
    };

    return sendSuccess(res, { tracking }, SUCCESS_MESSAGES.PESANAN_TRACKING_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PESANAN_TRACKING, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PESANAN_TRACKING, 500, error);
  }
};

// DELETE /api/pesanan/:id - Hapus pesanan (cancel)
export const cancelPesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingPesanan = await prisma.pesanan.findUnique({
      where: { id }
    });

    if (!existingPesanan) {
      return sendError(res, ERROR_MESSAGES.PESANAN_NOT_FOUND, 404);
    }

    // Hanya bisa cancel jika status masih pending
    if (existingPesanan.status !== 'pending') {
      return sendError(res, 'Pesanan tidak bisa dibatalkan', 400);
    }

    const pesanan = await prisma.pesanan.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    return sendSuccess(res, { pesanan }, SUCCESS_MESSAGES.PESANAN_CANCELLED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CANCEL_PESANAN, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CANCEL_PESANAN, 500, error);
  }
};
