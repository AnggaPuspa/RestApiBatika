import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { generateUniqueKuponCode } from '../utils/autoGenerators';

const prisma = new PrismaClient();

export const getKupon = async (req: Request, res: Response) => {
  try {
    const kupons = await prisma.kupon.findMany({
      orderBy: { created_at: 'desc' }
    });
    return sendSuccess(res, kupons, SUCCESS_MESSAGES.RETRIEVED);
  } catch (error) {
    console.error('Error getting kupon:', error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_KUPON, 500);
  }
};

export const getKuponById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const kupon = await prisma.kupon.findUnique({
      where: { id }
    });
    
    if (!kupon) {
      return sendError(res, ERROR_MESSAGES.KUPON_NOT_FOUND, 404);
    }
    
    return sendSuccess(res, kupon, SUCCESS_MESSAGES.RETRIEVED);
  } catch (error) {
    console.error('Error getting kupon by ID:', error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_KUPON, 500);
  }
};

export const createKupon = async (req: Request, res: Response) => {
  try {
    const {
      nama,
      deskripsi,
      jenis,
      nilai,
      min_pembelian,
      max_diskon,
      batas_penggunaan,
      berlaku_dari,
      berlaku_sampai
    } = req.body;

    // Validasi input
    if (!nama || !jenis || !nilai || !berlaku_dari || !berlaku_sampai) {
      return sendError(res, ERROR_MESSAGES.KUPON_FIELDS_REQUIRED, 400);
    }

    // Auto-generate kode kupon untuk keamanan
    const generatedKode = await generateUniqueKuponCode('KUPON');

    const kupon = await prisma.kupon.create({
      data: {
        kode: generatedKode,
        nama,
        deskripsi: deskripsi || null,
        jenis,
        nilai: parseFloat(nilai),
        min_pembelian: min_pembelian ? parseFloat(min_pembelian) : null,
        max_diskon: max_diskon ? parseFloat(max_diskon) : null,
        batas_penggunaan: batas_penggunaan ? parseInt(batas_penggunaan) : null,
        berlaku_dari: new Date(berlaku_dari),
        berlaku_sampai: new Date(berlaku_sampai)
      }
    });

    return sendSuccess(res, kupon, SUCCESS_MESSAGES.CREATED, 201);
  } catch (error) {
    console.error('Error creating kupon:', error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_CREATE_KUPON, 500);
  }
};

export const updateKupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, aktif } = req.body;

    const existingKupon = await prisma.kupon.findUnique({
      where: { id }
    });

    if (!existingKupon) {
      return sendError(res, ERROR_MESSAGES.KUPON_NOT_FOUND, 404);
    }

    const updateData: any = {};
    
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (aktif !== undefined) updateData.aktif = aktif;

    const kupon = await prisma.kupon.update({
      where: { id },
      data: updateData
    });

    return sendSuccess(res, kupon, SUCCESS_MESSAGES.UPDATED);
  } catch (error) {
    console.error('Error updating kupon:', error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_UPDATE_KUPON, 500);
  }
};

export const deleteKupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingKupon = await prisma.kupon.findUnique({
      where: { id },
      include: {
        penggunaan: true
      }
    });

    if (!existingKupon) {
      return sendError(res, ERROR_MESSAGES.KUPON_NOT_FOUND, 404);
    }

    // Cek apakah kupon sudah pernah digunakan
    if (existingKupon.penggunaan.length > 0) {
      return sendError(res, ERROR_MESSAGES.KUPON_ALREADY_USED, 400);
    }

    await prisma.kupon.delete({
      where: { id }
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.DELETED);
  } catch (error) {
    console.error('Error deleting kupon:', error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_DELETE_KUPON, 500);
  }
};
