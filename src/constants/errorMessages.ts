// Standardized error messages for consistency
export const ERROR_MESSAGES = {
  // Not Found Messages
  PENGUNA_NOT_FOUND: 'Pengguna tidak ditemukan',
  PENJUAL_NOT_FOUND: 'Penjual tidak ditemukan',
  PRODUK_NOT_FOUND: 'Produk tidak ditemukan',
  
  // Validation Messages
  EMAIL_REQUIRED: 'Email dan password wajib diisi',
  PASSWORD_REQUIRED: 'Password wajib diisi',
  PASSWORD_MIN_LENGTH: 'Password minimal 6 karakter',
  EMAIL_INVALID_FORMAT: 'Format email tidak valid',
  PENGUNA_ID_REQUIRED: 'ID pengguna wajib diisi',
  PENJUAL_ID_REQUIRED: 'ID penjual wajib diisi',
  PRODUK_ID_REQUIRED: 'ID produk wajib diisi',
  NAMA_REQUIRED: 'Nama wajib diisi',
  QUERY_REQUIRED: 'Query pencarian wajib diisi',
  
  // Duplicate Messages
  EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  SKU_ALREADY_EXISTS: 'Kode SKU sudah digunakan',
  SLUG_ALREADY_EXISTS: 'Slug sudah digunakan',
  PENJUAL_ALREADY_EXISTS: 'Pengguna sudah memiliki data penjual',
  
  // Auth Messages
  TOKEN_NOT_FOUND: 'Token tidak ditemukan',
  TOKEN_INVALID: 'Token tidak valid',
  LOGIN_FAILED: 'Email atau password salah',
  REGISTER_FAILED: 'Gagal membuat akun',
  LOGOUT_FAILED: 'Gagal logout',
  REFRESH_TOKEN_REQUIRED: 'Refresh token diperlukan',
  REFRESH_TOKEN_INVALID: 'Refresh token tidak valid',
  ACCESS_DENIED_PENJUAL: 'Akses ditolak. Hanya penjual yang dapat mengakses fitur ini',
  ACCESS_DENIED_PEMBELI: 'Akses ditolak. Fitur ini hanya untuk pembeli',
  USER_NOT_FOUND: 'User tidak ditemukan',
  AUTH_ERROR: 'Error dalam autentikasi',
  
  // Operation Messages
  FAILED_TO_GET_PENGUNA: 'Gagal mengambil data pengguna',
  FAILED_TO_CREATE_PENGUNA: 'Gagal membuat pengguna',
  FAILED_TO_UPDATE_PENGUNA: 'Gagal memperbarui pengguna',
  FAILED_TO_DELETE_PENGUNA: 'Gagal menghapus pengguna',
  FAILED_TO_SEARCH_PENGUNA: 'Gagal mencari pengguna',
  
  FAILED_TO_GET_PENJUAL: 'Gagal mengambil data penjual',
  FAILED_TO_CREATE_PENJUAL: 'Gagal membuat penjual',
  FAILED_TO_UPDATE_PENJUAL: 'Gagal memperbarui penjual',
  FAILED_TO_DELETE_PENJUAL: 'Gagal menghapus penjual',
  FAILED_TO_SEARCH_PENJUAL: 'Gagal mencari penjual',
  
  FAILED_TO_GET_PRODUK: 'Gagal mengambil data produk',
  FAILED_TO_CREATE_PRODUK: 'Gagal membuat produk',
  FAILED_TO_UPDATE_PRODUK: 'Gagal memperbarui produk',
  FAILED_TO_DELETE_PRODUK: 'Gagal menghapus produk',
  FAILED_TO_SEARCH_PRODUK: 'Gagal mencari produk',
  FAILED_TO_GET_FEATURED_PRODUK: 'Gagal mengambil produk unggulan',
  FAILED_TO_GET_PRODUK_CATEGORIES: 'Gagal mengambil kategori produk',
  
  // Database Messages
  DATABASE_CONNECTION_ERROR: 'Gagal terhubung ke database',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
  
  // Slug Messages
  SLUG_TOKO_ALREADY_EXISTS: 'Slug toko sudah digunakan'
} as const;

// Console error messages for logging
export const CONSOLE_ERRORS = {
  // Auth Errors
  REGISTER: 'Error registering user:',
  LOGIN: 'Error logging in user:',
  LOGOUT: 'Error logging out user:',
  GET_ME: 'Error getting current user:',
  REFRESH_TOKEN: 'Error refreshing token:',
  AUTH_MIDDLEWARE: 'Auth middleware error:',
  
  GET_PENGUNA: 'Error getting pengguna:',
  GET_PENGUNA_BY_ID: 'Error getting pengguna by ID:',
  CREATE_PENGUNA: 'Error creating pengguna:',
  UPDATE_PENGUNA: 'Error updating pengguna:',
  DELETE_PENGUNA: 'Error deleting pengguna:',
  SEARCH_PENGUNA: 'Error searching pengguna:',
  
  GET_PENJUAL: 'Error getting penjual:',
  GET_PENJUAL_BY_ID: 'Error getting penjual by ID:',
  CREATE_PENJUAL: 'Error creating penjual:',
  UPDATE_PENJUAL: 'Error updating penjual:',
  DELETE_PENJUAL: 'Error deleting penjual:',
  SEARCH_PENJUAL: 'Error searching penjual:',
  
  GET_PRODUK: 'Error getting produk:',
  GET_PRODUK_BY_ID: 'Error getting produk by ID:',
  CREATE_PRODUK: 'Error creating produk:',
  UPDATE_PRODUK: 'Error updating produk:',
  DELETE_PRODUK: 'Error deleting produk:',
  SEARCH_PRODUK: 'Error searching produk:',
  GET_FEATURED_PRODUK: 'Error getting featured produk:',
  GET_PRODUK_CATEGORIES: 'Error getting produk categories:',
  
  SUPABASE_CONNECTION: 'Error connecting to Supabase:'
} as const;