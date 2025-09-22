// Standardized success messages for consistency
export const SUCCESS_MESSAGES = {
  // General Messages
  SUCCESS: 'Berhasil',
  CREATED: 'Berhasil dibuat',
  UPDATED: 'Berhasil diperbarui',
  DELETED: 'Berhasil dihapus',
  RETRIEVED: 'Data berhasil diambil',
  
  // Auth Messages
  REGISTER_SUCCESS: 'Registrasi berhasil',
  LOGIN_SUCCESS: 'Login berhasil',
  LOGOUT_SUCCESS: 'Logout berhasil',
  TOKEN_REFRESHED: 'Token berhasil diperbarui',
  USER_PROFILE_RETRIEVED: 'Data user berhasil diambil',
  
  // Pengguna Messages
  PENGUNA_CREATED: 'Pengguna berhasil dibuat',
  PENGUNA_UPDATED: 'Pengguna berhasil diperbarui',
  PENGUNA_DELETED: 'Pengguna berhasil dihapus',
  PENGUNA_RETRIEVED: 'Data pengguna berhasil diambil',
  PENGUNA_SEARCHED: 'Pencarian pengguna berhasil',
  
  // Penjual Messages
  PENJUAL_CREATED: 'Penjual berhasil dibuat',
  PENJUAL_UPDATED: 'Penjual berhasil diperbarui',
  PENJUAL_DELETED: 'Penjual berhasil dihapus',
  PENJUAL_RETRIEVED: 'Data penjual berhasil diambil',
  PENJUAL_SEARCHED: 'Pencarian penjual berhasil',
  
  // Produk Messages
  PRODUK_CREATED: 'Produk berhasil dibuat',
  PRODUK_UPDATED: 'Produk berhasil diperbarui',
  PRODUK_DELETED: 'Produk berhasil dihapus',
  PRODUK_RETRIEVED: 'Data produk berhasil diambil',
  PRODUK_SEARCHED: 'Pencarian produk berhasil',
  FEATURED_PRODUK_RETRIEVED: 'Produk unggulan berhasil diambil',
  PRODUK_CATEGORIES_RETRIEVED: 'Kategori produk berhasil diambil',
  
  // Connection Messages
  SUPABASE_CONNECTED: 'Berhasil terhubung ke Supabase',
  API_RUNNING: 'API berjalan dengan baik'
} as const;
