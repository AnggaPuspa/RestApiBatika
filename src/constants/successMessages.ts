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
  PENJUAL_VERIFICATION_UPDATED: 'Status verifikasi penjual berhasil diperbarui',
  PENJUAL_VERIFICATION_STATUS_RETRIEVED: 'Status verifikasi penjual berhasil diambil',
  
  // Produk Messages
  PRODUK_CREATED: 'Produk berhasil dibuat',
  PRODUK_UPDATED: 'Produk berhasil diperbarui',
  PRODUK_DELETED: 'Produk berhasil dihapus',
  PRODUK_RETRIEVED: 'Data produk berhasil diambil',
  PRODUK_SEARCHED: 'Pencarian produk berhasil',
  FEATURED_PRODUK_RETRIEVED: 'Produk unggulan berhasil diambil',
  PRODUK_CATEGORIES_RETRIEVED: 'Kategori produk berhasil diambil',
  CAN_REVIEW_CHECKED: 'Status review berhasil dicek',
  
  // Pesanan Messages
  PESANAN_CREATED: 'Pesanan berhasil dibuat',
  PESANAN_UPDATED: 'Pesanan berhasil diperbarui',
  PESANAN_DELETED: 'Pesanan berhasil dihapus',
  PESANAN_RETRIEVED: 'Data pesanan berhasil diambil',
  PESANAN_CANCELLED: 'Pesanan berhasil dibatalkan',
  PESANAN_TRACKING_RETRIEVED: 'Tracking pesanan berhasil diambil',
  
  // Chat Messages
  CONVERSATIONS_RETRIEVED: 'Data conversation berhasil diambil',
  CONVERSATION_RETRIEVED: 'Data conversation berhasil diambil',
  CONVERSATION_CREATED: 'Conversation berhasil dibuat',
  MESSAGES_RETRIEVED: 'Data messages berhasil diambil',
  MESSAGE_SENT: 'Message berhasil dikirim',
  MESSAGE_MARKED_AS_READ: 'Message berhasil ditandai sebagai dibaca',
  UNREAD_COUNT_RETRIEVED: 'Jumlah unread messages berhasil diambil',
  
  // Review Messages
  REVIEW_CREATED: 'Review berhasil dibuat',
  REVIEW_UPDATED: 'Review berhasil diperbarui',
  REVIEW_DELETED: 'Review berhasil dihapus',
  REVIEW_RETRIEVED: 'Data review berhasil diambil',
  PRODUK_RATING_RETRIEVED: 'Rating produk berhasil diambil',
  
  // Payment Messages
  PAYMENT_CREATED: 'Payment berhasil dibuat',
  PAYMENT_UPDATED: 'Payment berhasil diperbarui',
  PAYMENT_RETRIEVED: 'Data payment berhasil diambil',
  PAYMENT_STATUS_UPDATED: 'Status payment berhasil diperbarui',
  PAYMENT_REFUNDED: 'Payment berhasil di-refund',
  PAYMENT_STATISTICS_RETRIEVED: 'Statistik payment berhasil diambil',
  
  // Connection Messages
  SUPABASE_CONNECTED: 'Berhasil terhubung ke Supabase',
  API_RUNNING: 'API berjalan dengan baik'
} as const;
