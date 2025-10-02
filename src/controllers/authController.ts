import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';
import supabase, { supabaseAdmin } from '../config/supabase';

const prisma = new PrismaClient();

// POST /api/auth/register - Register user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nama_lengkap, telepon, adalah_penjual = false } = req.body;

    if (!email || !password) {
      return sendError(res, ERROR_MESSAGES.EMAIL_REQUIRED, 400);
    }

    if (!password || password.length < 6) {
      return sendError(res, ERROR_MESSAGES.PASSWORD_MIN_LENGTH, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, ERROR_MESSAGES.EMAIL_INVALID_FORMAT, 400);
    }

    const existingUser = await prisma.pengguna.findUnique({
      where: { email }
    });

    if (existingUser) {
      return sendError(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: nama_lengkap,
        phone: telepon
      },
      email_confirm: true 
    });

    if (authError) {
      console.error('Supabase Admin Auth Error:', authError);
      return sendError(res, `Registrasi gagal: ${authError.message}`, 400, authError);
    }

    if (!authData.user) {
      return sendError(res, ERROR_MESSAGES.REGISTER_FAILED, 400);
    }

    const dbUser = await prisma.pengguna.create({
      data: {
        supabase_id: authData.user.id,
        email: authData.user.email!,
        nama_lengkap,
        telepon,
        adalah_penjual,
        is_verified: true 
      }
    });

    return sendSuccess(res, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        nama_lengkap: dbUser.nama_lengkap,
        adalah_penjual: dbUser.adalah_penjual,
        is_verified: dbUser.is_verified
      },
      message: 'Akun berhasil dibuat dan sudah terverifikasi.'
    }, SUCCESS_MESSAGES.REGISTER_SUCCESS, 201);

  } catch (error) {
    console.error(CONSOLE_ERRORS.REGISTER, error);
    return sendError(res, ERROR_MESSAGES.REGISTER_FAILED, 500, error);
  }
};

// POST /api/auth/register-penjual - Register user sebagai penjual dengan dokumen
export const registerPenjual = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      nama_lengkap, 
      telepon,
      nama_toko,
      slug_toko,
      origin_region,
      verification_docs 
    } = req.body;

    if (!email || !password) {
      return sendError(res, ERROR_MESSAGES.EMAIL_REQUIRED, 400);
    }

    if (!password || password.length < 6) {
      return sendError(res, ERROR_MESSAGES.PASSWORD_MIN_LENGTH, 400);
    }

    if (!nama_toko || !slug_toko || !origin_region) {
      return sendError(res, 'nama_toko, slug_toko, dan origin_region wajib diisi', 400);
    }

    if (!verification_docs || !verification_docs.ktp || !verification_docs.npwp) {
      return sendError(res, 'Dokumen KTP dan NPWP wajib diupload', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, ERROR_MESSAGES.EMAIL_INVALID_FORMAT, 400);
    }

    const existingUser = await prisma.pengguna.findUnique({
      where: { email }
    });

    if (existingUser) {
      return sendError(res, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }

    // Cek apakah slug_toko sudah ada
    const existingSlug = await prisma.penjual.findUnique({
      where: { slug_toko }
    });

    if (existingSlug) {
      return sendError(res, 'Slug toko sudah digunakan', 409);
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: nama_lengkap,
        phone: telepon
      },
      email_confirm: true 
    });

    if (authError) {
      console.error('Supabase Admin Auth Error:', authError);
      return sendError(res, `Registrasi gagal: ${authError.message}`, 400, authError);
    }

    if (!authData.user) {
      return sendError(res, ERROR_MESSAGES.REGISTER_FAILED, 400);
    }

    // Buat user dan penjual dalam transaction
    const result = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.pengguna.create({
        data: {
          supabase_id: authData.user.id,
          email: authData.user.email!,
          nama_lengkap,
          telepon,
          adalah_penjual: true, 
          is_verified: true 
        }
      });

      // Create penjual dengan verification level bronze dan dokumen
      const penjual = await tx.penjual.create({
        data: {
          pengguna_id: dbUser.id,
          nama_toko,
          slug_toko,
          origin_region,
          badges: ["verified"],
          verification_level: "bronze",
          verification_docs,
          verified_at: new Date(), 
          default_currency: "IDR"
        },
        include: {
          pengguna: {
            select: {
              id: true,
              nama_lengkap: true,
              email: true,
              telepon: true,
              adalah_penjual: true
            }
          }
        }
      });

      return { user: dbUser, penjual };
    });

    return sendSuccess(res, {
      user: {
        id: result.user.id,
        email: result.user.email,
        nama_lengkap: result.user.nama_lengkap,
        adalah_penjual: result.user.adalah_penjual,
        is_verified: result.user.is_verified
      },
      penjual: {
        id: result.penjual.id,
        nama_toko: result.penjual.nama_toko,
        verification_level: result.penjual.verification_level,
        verified_at: result.penjual.verified_at
      },
      message: 'Akun penjual berhasil dibuat dan sudah terverifikasi.'
    }, 'Registrasi penjual berhasil', 201);

  } catch (error) {
    console.error('Register Penjual Error:', error);
    return sendError(res, 'Gagal registrasi penjual', 500, error);
  }
};

// POST /api/auth/login - Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, ERROR_MESSAGES.EMAIL_REQUIRED, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, ERROR_MESSAGES.EMAIL_INVALID_FORMAT, 400);
    }

    const existingUser = await prisma.pengguna.findUnique({
      where: { email }
    });

    if (!existingUser) {
      console.log('User not found in database for email:', email);
      return sendError(res, ERROR_MESSAGES.LOGIN_FAILED, 401);
    }

    console.log('User found in database:', existingUser.id, 'Supabase ID:', existingUser.supabase_id);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Supabase Admin sign in error:', error.message);
      return sendError(res, "Email atau password salah", 401);
    }

    if (!data.session) {
      console.log('No session returned from Supabase Admin');
      return sendError(res, "Email atau password salah", 401);
    }

    console.log('Login successful! Token created.');

    await prisma.pengguna.update({
      where: { id: existingUser.id },
      data: { last_login: new Date() }
    });

    return sendSuccess(res, {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        nama_lengkap: existingUser.nama_lengkap,
        adalah_penjual: existingUser.adalah_penjual,
        is_verified: existingUser.is_verified
      },
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    }, SUCCESS_MESSAGES.LOGIN_SUCCESS);

  } catch (error) {
    console.error(CONSOLE_ERRORS.LOGIN, error);
    return sendError(res, ERROR_MESSAGES.LOGIN_FAILED, 500, error);
  }
};


// POST /api/auth/logout - Logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
            
    if (refresh_token) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase Logout Error:', error);
        return sendError(res, ERROR_MESSAGES.LOGOUT_FAILED, 400);
      }
    }

    return sendSuccess(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);

  } catch (error) {
    console.error(CONSOLE_ERRORS.LOGOUT, error);
    return sendError(res, ERROR_MESSAGES.LOGOUT_FAILED, 500, error);
  }
};

// GET /api/auth/me - Get user
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return sendSuccess(res, {
      user: req.user
    }, SUCCESS_MESSAGES.USER_PROFILE_RETRIEVED);

  } catch (error) {
    console.error(CONSOLE_ERRORS.GET_ME, error);
    return sendError(res, ERROR_MESSAGES.FAILED_TO_GET_PENGUNA, 500, error);
  }
};

// POST /api/auth/refresh - Refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return sendError(res, ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (authError) {
      console.error('Supabase Refresh Error:', authError);
      return sendError(res, ERROR_MESSAGES.REFRESH_TOKEN_INVALID, 401);
    }

    if (!authData.session) {
      return sendError(res, ERROR_MESSAGES.REFRESH_TOKEN_INVALID, 401);
    }

    return sendSuccess(res, {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at
    }, SUCCESS_MESSAGES.TOKEN_REFRESHED);

  } catch (error) {
    console.error(CONSOLE_ERRORS.REFRESH_TOKEN, error);
    return sendError(res, ERROR_MESSAGES.REFRESH_TOKEN_INVALID, 500, error);
  }
};