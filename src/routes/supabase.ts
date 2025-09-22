import { Router } from 'express';
import { testSupabaseConnection } from '../controllers/supabaseController';

const router = Router();

router.get('/test-connection', testSupabaseConnection);

export default router;