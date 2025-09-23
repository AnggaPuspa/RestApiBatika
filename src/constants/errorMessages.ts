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
  FAILED_TO_CHECK_CAN_REVIEW_PRODUK: 'Gagal mengecek status review produk',
  
  // Pesanan Messages
  PESANAN_NOT_FOUND: 'Pesanan tidak ditemukan',
  FAILED_TO_GET_PESANAN: 'Gagal mengambil data pesanan',
  FAILED_TO_CREATE_PESANAN: 'Gagal membuat pesanan',
  FAILED_TO_UPDATE_PESANAN: 'Gagal memperbarui pesanan',
  FAILED_TO_DELETE_PESANAN: 'Gagal menghapus pesanan',
  FAILED_TO_GET_PESANAN_TRACKING: 'Gagal mengambil tracking pesanan',
  FAILED_TO_CANCEL_PESANAN: 'Gagal membatalkan pesanan',
  
  // Chat Messages
  CONVERSATION_NOT_FOUND: 'Conversation tidak ditemukan',
  MESSAGE_NOT_FOUND: 'Message tidak ditemukan',
  FAILED_TO_GET_CONVERSATIONS: 'Gagal mengambil data conversations',
  FAILED_TO_GET_CONVERSATION: 'Gagal mengambil data conversation',
  FAILED_TO_CREATE_CONVERSATION: 'Gagal membuat conversation',
  FAILED_TO_GET_MESSAGES: 'Gagal mengambil data messages',
  FAILED_TO_SEND_MESSAGE: 'Gagal mengirim message',
  FAILED_TO_MARK_MESSAGE_AS_READ: 'Gagal menandai message sebagai dibaca',
  FAILED_TO_GET_UNREAD_COUNT: 'Gagal mengambil jumlah unread messages',
  
  // Review Messages
  REVIEW_NOT_FOUND: 'Review tidak ditemukan',
  FAILED_TO_GET_REVIEW: 'Gagal mengambil data review',
  FAILED_TO_CREATE_REVIEW: 'Gagal membuat review',
  FAILED_TO_UPDATE_REVIEW: 'Gagal memperbarui review',
  FAILED_TO_DELETE_REVIEW: 'Gagal menghapus review',
  FAILED_TO_GET_PRODUK_RATING: 'Gagal mengambil rating produk',
  FAILED_TO_CHECK_CAN_REVIEW: 'Gagal mengecek status review',
  
  // Payment Messages
  PAYMENT_NOT_FOUND: 'Payment tidak ditemukan',
  FAILED_TO_GET_PAYMENT: 'Gagal mengambil data payment',
  FAILED_TO_CREATE_PAYMENT: 'Gagal membuat payment',
  FAILED_TO_UPDATE_PAYMENT_STATUS: 'Gagal memperbarui status payment',
  FAILED_TO_PROCESS_REFUND: 'Gagal memproses refund',
  FAILED_TO_GET_PAYMENT_STATISTICS: 'Gagal mengambil statistik payment',
  
  // Verification Messages
  FAILED_TO_UPDATE_PENJUAL_VERIFICATION: 'Gagal memperbarui verifikasi penjual',
  FAILED_TO_GET_PENJUAL_VERIFICATION_STATUS: 'Gagal mengambil status verifikasi penjual',
  
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
  CHECK_CAN_REVIEW_PRODUK: 'Error checking can review produk:',
  
  // Pesanan Errors
  GET_PESANAN: 'Error getting pesanan:',
  GET_PESANAN_BY_ID: 'Error getting pesanan by ID:',
  CREATE_PESANAN: 'Error creating pesanan:',
  UPDATE_PESANAN: 'Error updating pesanan:',
  DELETE_PESANAN: 'Error deleting pesanan:',
  GET_PESANAN_TRACKING: 'Error getting pesanan tracking:',
  CANCEL_PESANAN: 'Error cancelling pesanan:',
  
  // Chat Errors
  GET_CONVERSATIONS: 'Error getting conversations:',
  GET_CONVERSATION_BY_ID: 'Error getting conversation by ID:',
  CREATE_CONVERSATION: 'Error creating conversation:',
  GET_MESSAGES: 'Error getting messages:',
  SEND_MESSAGE: 'Error sending message:',
  MARK_MESSAGE_AS_READ: 'Error marking message as read:',
  GET_UNREAD_COUNT: 'Error getting unread count:',
  
  // Review Errors
  GET_REVIEW: 'Error getting review:',
  GET_REVIEW_BY_ID: 'Error getting review by ID:',
  CREATE_REVIEW: 'Error creating review:',
  UPDATE_REVIEW: 'Error updating review:',
  DELETE_REVIEW: 'Error deleting review:',
  GET_PRODUK_RATING: 'Error getting produk rating:',
  CHECK_CAN_REVIEW: 'Error checking can review:',
  
  // Payment Errors
  GET_PAYMENT: 'Error getting payment:',
  GET_PAYMENT_BY_ID: 'Error getting payment by ID:',
  CREATE_PAYMENT: 'Error creating payment:',
  UPDATE_PAYMENT_STATUS: 'Error updating payment status:',
  PROCESS_REFUND: 'Error processing refund:',
  GET_PAYMENT_STATISTICS: 'Error getting payment statistics:',
  
  // Verification Errors
  UPDATE_PENJUAL_VERIFICATION: 'Error updating penjual verification:',
  GET_PENJUAL_VERIFICATION_STATUS: 'Error getting penjual verification status:',
  
  SUPABASE_CONNECTION: 'Error connecting to Supabase:'
} as const;