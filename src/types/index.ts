export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Interface untuk item pesanan (price fields removed - will be calculated by backend)
export interface OrderItem {
  varian_id: string;
  qty: number;
}

// Interface untuk request body create pesanan (price fields removed - will be calculated by backend)
export interface CreatePesananRequest {
  pembeli_id: string;
  penjual_id: string;
  mata_uang?: string;
  ongkir?: number;
  ship_nama_penerima: string;
  ship_telepon: string;
  ship_alamat1: string;
  ship_alamat2?: string;
  ship_kota: string;
  ship_wilayah: string;
  ship_kode_pos: string;
  ship_country_code?: string;
  items: OrderItem[];
}