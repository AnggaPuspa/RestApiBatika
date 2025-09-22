import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePenggunaData {
  email: string;
  telepon?: string;
  nama_lengkap?: string;
  adalah_penjual?: boolean;
}

export interface UpdatePenggunaData {
  email?: string;
  telepon?: string;
  nama_lengkap?: string;
  adalah_penjual?: boolean;
}

export interface SearchPenggunaParams {
  query: string;
  page?: number;
  limit?: number;
}

export class PenggunaService {
  // Ambil semua pengguna
  static async getAllPengguna() {
    return await prisma.pengguna.findMany({
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
  }

  // Ambil pengguna by ID
  static async getPenggunaById(id: string) {
    return await prisma.pengguna.findUnique({
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
  }

  // Buat pengguna baru
  static async createPengguna(data: CreatePenggunaData) {
    const existingPengguna = await prisma.pengguna.findUnique({
      where: { email: data.email }
    });

    if (existingPengguna) {
      throw new Error('Email already exists');
    }

    return await prisma.pengguna.create({
      data: {
        email: data.email,
        telepon: data.telepon,
        nama_lengkap: data.nama_lengkap,
        adalah_penjual: data.adalah_penjual || false
      }
    });
  }

  // Update pengguna
  static async updatePengguna(id: string, data: UpdatePenggunaData) {
    const existingPengguna = await prisma.pengguna.findUnique({
      where: { id }
    });

    if (!existingPengguna) {
      throw new Error('Pengguna not found');
    }

    if (data.email && data.email !== existingPengguna.email) {
      const emailExists = await prisma.pengguna.findUnique({
        where: { email: data.email }
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    return await prisma.pengguna.update({
      where: { id },
      data: {
        email: data.email || existingPengguna.email,
        telepon: data.telepon !== undefined ? data.telepon : existingPengguna.telepon,
        nama_lengkap: data.nama_lengkap !== undefined ? data.nama_lengkap : existingPengguna.nama_lengkap,
        adalah_penjual: data.adalah_penjual !== undefined ? data.adalah_penjual : existingPengguna.adalah_penjual
      }
    });
  }

  // Hapus pengguna
  static async deletePengguna(id: string) {
    const existingPengguna = await prisma.pengguna.findUnique({
      where: { id }
    });

    if (!existingPengguna) {
      throw new Error('Pengguna not found');
    }

    return await prisma.pengguna.delete({
      where: { id }
    });
  }

  // Cari pengguna
  static async searchPengguna(params: SearchPenggunaParams) {
    const { query, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [pengguna, total] = await Promise.all([
      prisma.pengguna.findMany({
        where: {
          OR: [
            { nama_lengkap: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { telepon: { contains: query } }
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
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.pengguna.count({
        where: {
          OR: [
            { nama_lengkap: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { telepon: { contains: query } }
          ]
        }
      })
    ]);

    return {
      data: pengguna,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Statistik pengguna
  static async getPenggunaStats() {
    const [total, penjual, pembeli] = await Promise.all([
      prisma.pengguna.count(),
      prisma.pengguna.count({ where: { adalah_penjual: true } }),
      prisma.pengguna.count({ where: { adalah_penjual: false } })
    ]);

    return {
      total,
      penjual,
      pembeli
    };
  }
}
