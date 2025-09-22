import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { sendError } from '../utils/responseHelper';
import supabase from '../config/supabase';
const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        supabase_id: string;
        email: string;
        nama_lengkap?: string;
        adalah_penjual: boolean;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, ERROR_MESSAGES.TOKEN_NOT_FOUND, 401);
    }

    const token = authHeader.substring(7);
    if (token.startsWith('api_')) {
      const userId = token.split('_')[1];
      
      if (!userId) {
        return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
      }
      const dbUser = await prisma.pengguna.findUnique({
        where: { id: userId }
      });

      if (!dbUser) {
        return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
      }

      req.user = {
        id: dbUser.id,
        supabase_id: dbUser.supabase_id!,
        email: dbUser.email,
        nama_lengkap: dbUser.nama_lengkap || undefined,
        adalah_penjual: dbUser.adalah_penjual
      };

      return next();
    }

    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    if (error) {
      return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
    }
    
    if (!supabaseUser) {
      return sendError(res, ERROR_MESSAGES.TOKEN_INVALID, 401);
    }

    let dbUser = await prisma.pengguna.findUnique({
      where: { supabase_id: supabaseUser.id }
    });

    if (!dbUser) {
      dbUser = await prisma.pengguna.create({
        data: {
          supabase_id: supabaseUser.id,
          email: supabaseUser.email!,
          nama_lengkap: supabaseUser.user_metadata?.full_name || null,
          foto_profil: supabaseUser.user_metadata?.avatar_url || null,
          is_verified: supabaseUser.email_confirmed_at ? true : false,
          last_login: new Date()
        }
      });
    } else {
      await prisma.pengguna.update({
        where: { id: dbUser.id },
        data: { last_login: new Date() }
      });
    }

    req.user = {
      id: dbUser.id,
      supabase_id: dbUser.supabase_id!,
      email: dbUser.email,
      nama_lengkap: dbUser.nama_lengkap || undefined,
      adalah_penjual: dbUser.adalah_penjual
    };

    next();
  } catch (error) {
    console.error(CONSOLE_ERRORS.AUTH_MIDDLEWARE, error);
    return sendError(res, ERROR_MESSAGES.AUTH_ERROR, 500, error);
  }
};

export const requirePenjual = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.adalah_penjual) {
    return sendError(res, ERROR_MESSAGES.ACCESS_DENIED_PENJUAL, 403);
  }
  next();
};

export const requirePembeli = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.adalah_penjual) {
    return sendError(res, ERROR_MESSAGES.ACCESS_DENIED_PEMBELI, 403);
  }
  next();
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.includes('penjual') && !req.user?.adalah_penjual) {
      return sendError(res, ERROR_MESSAGES.ACCESS_DENIED_PENJUAL, 403);
    }
    next();
  };
};