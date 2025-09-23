import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import prisma from '../prismaClient';

// GET /api/payment - Ambil semua payment
export const getAllPayment = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, pesanan_id } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (pesanan_id) {
      where.pesanan_id = pesanan_id;
    }

    const [payments, total] = await Promise.all([
      prisma.pembayaran.findMany({
        where,
        include: {
          pesanan: {
            select: {
              id: true,
              status: true,
              total: true,
              pembeli: {
                select: {
                  id: true,
                  nama_lengkap: true,
                  email: true
                }
              }
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.pembayaran.count({ where })
    ]);

    return sendSuccess(res, {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, SUCCESS_MESSAGES.PAYMENT_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PAYMENT, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PAYMENT, 500, error);
  }
};

// GET /api/payment/:id - Ambil payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pesanan: {
          select: {
            id: true,
            status: true,
            total: true,
            pembeli: {
              select: {
                id: true,
                nama_lengkap: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return sendError(res, ERROR_MESSAGES.PAYMENT_NOT_FOUND, 404);
    }

    return sendSuccess(res, { payment }, SUCCESS_MESSAGES.PAYMENT_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PAYMENT_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PAYMENT, 500, error);
  }
};

// POST /api/payment - Buat payment baru
export const createPayment = async (req: Request, res: Response) => {
  try {
    const {
      pesanan_id,
      metode_pembayaran,
      provider,
      external_id,
      amount,
      payment_url,
      expired_at
    } = req.body;

    if (!pesanan_id || !metode_pembayaran || !amount) {
      return sendError(res, 'pesanan_id, metode_pembayaran, dan amount wajib diisi', 400);
    }

    // Validasi pesanan
    const pesanan = await prisma.pesanan.findUnique({
      where: { id: pesanan_id }
    });

    if (!pesanan) {
      return sendError(res, ERROR_MESSAGES.PESANAN_NOT_FOUND, 404);
    }

    // Cek apakah sudah ada payment untuk pesanan ini
    const existingPayment = await prisma.pembayaran.findFirst({
      where: { pesanan_id }
    });

    if (existingPayment) {
      return sendError(res, 'Pesanan ini sudah memiliki payment', 409);
    }

    const payment = await prisma.pembayaran.create({
      data: {
        pesanan_id,
        metode_pembayaran,
        provider: provider || null,
        external_id: external_id || null,
        amount: parseFloat(amount),
        payment_url: payment_url || null,
        expired_at: expired_at ? new Date(expired_at) : null
      },
      include: {
        pesanan: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      }
    });

    return sendSuccess(res, { payment }, SUCCESS_MESSAGES.PAYMENT_CREATED, 201);
  } catch (error) {
    console.error(CONSOLE_ERRORS.CREATE_PAYMENT, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_PAYMENT, 500, error);
  }
};

// PUT /api/payment/:id/status - Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, external_id, paid_at } = req.body;

    if (!status) {
      return sendError(res, 'status wajib diisi', 400);
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded', 'expired'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'status tidak valid', 400);
    }

    const existingPayment = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pesanan: true
      }
    });

    if (!existingPayment) {
      return sendError(res, ERROR_MESSAGES.PAYMENT_NOT_FOUND, 404);
    }

    // Update payment status
    const payment = await prisma.pembayaran.update({
      where: { id },
      data: {
        status: status as any,
        external_id: external_id || existingPayment.external_id,
        paid_at: status === 'paid' ? (paid_at ? new Date(paid_at) : new Date()) : existingPayment.paid_at
      },
      include: {
        pesanan: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      }
    });

    // Sinkronisasi status pesanan berdasarkan payment status
    let orderStatus = existingPayment.pesanan.status;
    
    if (status === 'paid') {
      orderStatus = 'paid';
    } else if (status === 'failed' || status === 'expired') {
      orderStatus = 'pending';
    } else if (status === 'refunded') {
      orderStatus = 'cancelled';
    }

    // Update pesanan status jika berubah
    if (orderStatus !== existingPayment.pesanan.status) {
      await prisma.pesanan.update({
        where: { id: existingPayment.pesanan_id },
        data: { status: orderStatus as any }
      });
    }

    return sendSuccess(res, { 
      payment,
      order_status_updated: orderStatus !== existingPayment.pesanan.status,
      new_order_status: orderStatus
    }, SUCCESS_MESSAGES.PAYMENT_STATUS_UPDATED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.UPDATE_PAYMENT_STATUS, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_PAYMENT_STATUS, 500, error);
  }
};

// GET /api/payment/pesanan/:pesanan_id - Ambil payment by pesanan ID
export const getPaymentByPesananId = async (req: Request, res: Response) => {
  try {
    const { pesanan_id } = req.params;

    const payment = await prisma.pembayaran.findFirst({
      where: { pesanan_id },
      include: {
        pesanan: {
          select: {
            id: true,
            status: true,
            total: true,
            pembeli: {
              select: {
                id: true,
                nama_lengkap: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return sendError(res, ERROR_MESSAGES.PAYMENT_NOT_FOUND, 404);
    }

    return sendSuccess(res, { payment }, SUCCESS_MESSAGES.PAYMENT_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PAYMENT_BY_ID, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PAYMENT, 500, error);
  }
};

// POST /api/payment/:id/refund - Proses refund
export const processRefund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { refund_amount, reason } = req.body;

    const existingPayment = await prisma.pembayaran.findUnique({
      where: { id },
      include: {
        pesanan: true
      }
    });

    if (!existingPayment) {
      return sendError(res, ERROR_MESSAGES.PAYMENT_NOT_FOUND, 404);
    }

    if (existingPayment.status !== 'paid') {
      return sendError(res, 'Hanya payment yang sudah paid yang bisa di-refund', 400);
    }

    // Update payment status ke refunded
    const payment = await prisma.pembayaran.update({
      where: { id },
      data: {
        status: 'refunded'
      },
      include: {
        pesanan: {
          select: {
            id: true,
            status: true,
            total: true
          }
        }
      }
    });

    // Update pesanan status ke cancelled
    await prisma.pesanan.update({
      where: { id: existingPayment.pesanan_id },
      data: { status: 'cancelled' }
    });

    return sendSuccess(res, { 
      payment,
      refund_amount: refund_amount || existingPayment.amount,
      reason: reason || 'Refund processed'
    }, SUCCESS_MESSAGES.PAYMENT_REFUNDED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.PROCESS_REFUND, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_PROCESS_REFUND, 500, error);
  }
};

// GET /api/payment/statistics - Ambil statistik payment
export const getPaymentStatistics = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const where: any = {};
    
    if (start_date && end_date) {
      where.created_at = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string)
      };
    }

    const [
      total_payments,
      paid_payments,
      failed_payments,
      pending_payments,
      refunded_payments,
      total_amount,
      paid_amount
    ] = await Promise.all([
      prisma.pembayaran.count({ where }),
      prisma.pembayaran.count({ where: { ...where, status: 'paid' } }),
      prisma.pembayaran.count({ where: { ...where, status: 'failed' } }),
      prisma.pembayaran.count({ where: { ...where, status: 'pending' } }),
      prisma.pembayaran.count({ where: { ...where, status: 'refunded' } }),
      prisma.pembayaran.aggregate({
        where,
        _sum: { amount: true }
      }),
      prisma.pembayaran.aggregate({
        where: { ...where, status: 'paid' },
        _sum: { amount: true }
      })
    ]);

    const statistics = {
      total_payments,
      paid_payments,
      failed_payments,
      pending_payments,
      refunded_payments,
      total_amount: total_amount._sum.amount || 0,
      paid_amount: paid_amount._sum.amount || 0,
      success_rate: total_payments > 0 ? (paid_payments / total_payments) * 100 : 0
    };

    return sendSuccess(res, { statistics }, SUCCESS_MESSAGES.PAYMENT_STATISTICS_RETRIEVED);
  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_PAYMENT_STATISTICS, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PAYMENT_STATISTICS, 500, error);
  }
};
