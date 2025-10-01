import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import { OrderItem, CreatePesananRequest } from '../types';
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

// POST /api/pesanan - Buat pesanan baru dengan verifikasi harga dan manajemen stok
export const createPesanan = async (req: Request, res: Response) => {
  try {
    const {
      pembeli_id,
      penjual_id,
      mata_uang = 'IDR',
      ongkir = 0,
      ship_nama_penerima,
      ship_telepon,
      ship_alamat1,
      ship_alamat2,
      ship_kota,
      ship_wilayah,
      ship_kode_pos,
      ship_country_code = 'ID',
      items = []
    }: CreatePesananRequest = req.body;

    // Validasi input wajib
    if (!pembeli_id || !penjual_id || !items.length) {
      return sendError(res, ERROR_MESSAGES.PESANAN_FIELDS_REQUIRED, 400);
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

    // Ambil data varian produk untuk verifikasi harga dan stok
    const varianIds = items.map((item: OrderItem) => item.varian_id);
    const varians = await prisma.varianProduk.findMany({
      where: { id: { in: varianIds } },
      include: { 
        produk: {
          select: {
            id: true,
            nama: true,
            penjual_id: true
          }
        }
      }
    });

    // Validasi semua varian ditemukan
    if (varians.length !== varianIds.length) {
      return sendError(res, ERROR_MESSAGES.VARIAN_MISMATCH, 404);
    }

    // Validasi kepemilikan varian oleh penjual
    for (const varian of varians) {
      if (varian.produk.penjual_id !== penjual_id) {
        return sendError(res, `${ERROR_MESSAGES.VARIAN_WRONG_SELLER}: ${varian.nama_varian}`, 400);
      }
    }

    // Validasi ketersediaan stok dan hitung total
    let subtotal = 0;
    const itemsWithPrice: {
      varian_id: string;
      qty: number;
      harga_satuan: number;
      subtotal: number;
      nama_produk_snapshot: string;
      nama_varian_snapshot: string;
    }[] = [];
    
    for (const item of items) {
      const varian = varians.find(v => v.id === item.varian_id);
      if (!varian) {
        return sendError(res, ERROR_MESSAGES.VARIAN_NOT_FOUND, 404);
      }

      // Cek ketersediaan stok
      if (varian.stok < item.qty) {
        return sendError(res, `${ERROR_MESSAGES.INSUFFICIENT_STOCK} untuk ${varian.nama_varian}. Stok tersedia: ${varian.stok}`, 400);
      }

      // Hitung harga berdasarkan data asli dari database
      const itemSubtotal = Number(varian.harga) * item.qty;
      subtotal += itemSubtotal;

      itemsWithPrice.push({
        varian_id: item.varian_id,
        qty: item.qty,
        harga_satuan: Number(varian.harga),
        subtotal: itemSubtotal,
        nama_produk_snapshot: varian.produk.nama,
        nama_varian_snapshot: varian.nama_varian || 'Default'
      });
    }

    // Hitung total dengan ongkir
    const total = subtotal + ongkir;

    // Buat pesanan dan kurangi stok dalam transaksi
    const result = await prisma.$transaction(async (tx) => {
      // Buat pesanan
      const pesanan = await tx.pesanan.create({
        data: {
          pembeli_id,
          penjual_id,
          mata_uang,
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
          ship_country_code
        }
      });

      // Buat item pesanan dan kurangi stok
      for (const item of itemsWithPrice) {
        // Buat item pesanan
        await tx.itemPesanan.create({
          data: {
            pesanan_id: pesanan.id,
            varian_id: item.varian_id,
            nama_produk_snapshot: item.nama_produk_snapshot,
            nama_varian_snapshot: item.nama_varian_snapshot,
            qty: item.qty,
            harga_satuan: item.harga_satuan,
            subtotal: item.subtotal
          }
        });

        // Kurangi stok
        await tx.varianProduk.update({
          where: { id: item.varian_id },
          data: {
            stok: {
              decrement: item.qty
            }
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
      return sendError(res, ERROR_MESSAGES.PESANAN_STATUS_REQUIRED, 400);
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, ERROR_MESSAGES.INVALID_PESANAN_STATUS, 400);
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

// DELETE /api/pesanan/:id - Hapus pesanan (cancel) dengan pengembalian stok
export const cancelPesanan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingPesanan = await prisma.pesanan.findUnique({
      where: { id },
      include: {
        item_pesanan: {
          select: {
            varian_id: true,
            qty: true
          }
        }
      }
    });

    if (!existingPesanan) {
      return sendError(res, ERROR_MESSAGES.PESANAN_NOT_FOUND, 404);
    }

    if (existingPesanan.status !== 'pending') {
      return sendError(res, ERROR_MESSAGES.PESANAN_CANNOT_BE_CANCELLED, 400);
    }

    // Batalkan pesanan dan kembalikan stok dalam transaksi
    const pesanan = await prisma.$transaction(async (tx) => {
      // Update status pesanan menjadi cancelled
      const updatedPesanan = await tx.pesanan.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      // Kembalikan stok untuk setiap item
      for (const item of existingPesanan.item_pesanan) {
        if (item.varian_id) {
          await tx.varianProduk.update({
            where: { id: item.varian_id },
            data: {
              stok: {
                increment: item.qty
              }
            }
          });
        }
      }

      return updatedPesanan;
    });

    return sendSuccess(res, { pesanan }, SUCCESS_MESSAGES.PESANAN_CANCELLED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CANCEL_PESANAN, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CANCEL_PESANAN, 500, error);
  }
};
