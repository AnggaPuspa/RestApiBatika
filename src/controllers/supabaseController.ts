import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { sendSuccess, sendError } from '../utils/responseHelper';
import { ERROR_MESSAGES, CONSOLE_ERRORS } from '../constants/errorMessages';
import { SUCCESS_MESSAGES } from '../constants/successMessages';

export const testSupabaseConnection = async (req: Request, res: Response) => {
  try {
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing'
    };
    
    console.log('Environment Check:', envCheck);
    
    // Test koneksi Kang
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('Supabase Auth Error:', authError);
      return sendError(res, `Supabase Auth Error: ${authError.message}`, 500, authError);
    }

    const { data: dbData, error: dbError } = await supabase
      .from('_supabase_tables')
      .select('*')
      .limit(1);

    let dbStatus = 'Database accessible';
    if (dbError) {
      dbStatus = 'Database connection OK (but may be empty)';
    }

    return sendSuccess(res, {
      environment: envCheck,
      auth: 'Connected',
      database: dbStatus,
      timestamp: new Date().toISOString()
    }, SUCCESS_MESSAGES.SUPABASE_CONNECTED);
  } catch (err) {
    console.error(CONSOLE_ERRORS.SUPABASE_CONNECTION, err);
    return sendError(res, ERROR_MESSAGES.UNKNOWN_ERROR, 500, err);
  }
};