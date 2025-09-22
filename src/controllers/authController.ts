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
      return sendError(res, ERROR_MESSAGES.LOGIN_FAILED, 401);
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'http://localhost:3001/auth/callback'
      }
    });

    if (authError) {
      return sendError(res, ERROR_MESSAGES.LOGIN_FAILED, 401);
    }

    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    });

    if (sessionError) {
      return sendError(res, ERROR_MESSAGES.LOGIN_FAILED, 401);
    }

    await prisma.pengguna.update({
      where: { id: existingUser.id },
      data: { last_login: new Date() }
    });

    const accessToken = `api_${existingUser.id}_${Date.now()}`;
    const refreshToken = `refresh_${existingUser.id}_${Date.now()}`;

    return sendSuccess(res, {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        nama_lengkap: existingUser.nama_lengkap,
        adalah_penjual: existingUser.adalah_penjual,
        is_verified: existingUser.is_verified
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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