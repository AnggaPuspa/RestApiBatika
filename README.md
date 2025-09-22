# API Documentation - Batika E-commerce Backend

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
All API responses follow this format:
```json
{
  "status": "success" | "error",
  "message": "string",
  "data": object | null,
  "error": object | null
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nama_lengkap": "John Doe",
  "telepon": "08123456789",
  "adalah_penjual": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Akun berhasil dibuat dan sudah terverifikasi.",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "nama_lengkap": "John Doe",
      "adalah_penjual": false,
      "is_verified": true
    }
  }
}
```

### POST /api/auth/login
Login user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "nama_lengkap": "John Doe",
      "adalah_penjual": false,
      "is_verified": true
    },
    "access_token": "api_user_id_timestamp",
    "refresh_token": "refresh_user_id_timestamp",
    "expires_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/logout
Logout user and invalidate tokens.

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logout berhasil",
  "data": null
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Token berhasil diperbarui",
  "data": {
    "access_token": "new_access_token",
    "refresh_token": "new_refresh_token",
    "expires_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/auth/me
Get current user profile. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profil pengguna berhasil diambil",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "nama_lengkap": "John Doe",
      "adalah_penjual": false,
      "is_verified": true
    }
  }
}
```

---

## 👥 User Management Endpoints

### GET /api/pengguna
Get all users (public endpoint).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "message": "Data pengguna berhasil diambil",
  "data": {
    "pengguna": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "nama_lengkap": "John Doe",
        "telepon": "08123456789",
        "adalah_penjual": false,
        "is_verified": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "penjual": null,
        "_count": {
          "pesanan": 5,
          "pesan": 3
        }
      }
    ],
    "count": 1
  }
}
```

### GET /api/pengguna/:id
Get user by ID (public endpoint).

**Response (200):**
```json
{
  "status": "success",
  "message": "Data pengguna berhasil diambil",
  "data": {
    "pengguna": {
      "id": "user_id",
      "email": "user@example.com",
      "nama_lengkap": "John Doe",
      "telepon": "08123456789",
      "adalah_penjual": false,
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "penjual": null,
      "pesanan": [...],
      "pesan": [...]
    }
  }
}
```

### POST /api/pengguna
Create new user. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "telepon": "08123456789",
  "nama_lengkap": "Jane Doe",
  "adalah_penjual": false
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Pengguna berhasil dibuat",
  "data": {
    "pengguna": {
      "id": "new_user_id",
      "email": "newuser@example.com",
      "nama_lengkap": "Jane Doe",
      "telepon": "08123456789",
      "adalah_penjual": false
    }
  }
}
```

### PUT /api/pengguna/:id
Update user. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "updated@example.com",
  "telepon": "08123456789",
  "nama_lengkap": "Updated Name",
  "adalah_penjual": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Pengguna berhasil diperbarui",
  "data": {
    "pengguna": {
      "id": "user_id",
      "email": "updated@example.com",
      "nama_lengkap": "Updated Name",
      "telepon": "08123456789",
      "adalah_penjual": true
    }
  }
}
```

### DELETE /api/pengguna/:id
Delete user. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Pengguna berhasil dihapus",
  "data": null
}
```

### GET /api/pengguna/search
Search users.

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "message": "Pencarian pengguna berhasil",
  "data": {
    "pengguna": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

## 🏪 Seller Management Endpoints

### GET /api/penjual
Get all sellers.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by store name or region
- `verification_level` (optional): Filter by verification level

**Response (200):**
```json
{
  "status": "success",
  "message": "Data penjual berhasil diambil",
  "data": {
    "penjual": [
      {
        "id": "seller_id",
        "pengguna_id": "user_id",
        "nama_toko": "Toko Batik Nusantara",
        "slug_toko": "toko-batik-nusantara",
        "origin_region": "Yogyakarta",
        "badges": ["verified", "premium"],
        "verification_level": "verified",
        "rating_rata": 4.5,
        "rating_jumlah": 100,
        "created_at": "2024-01-01T00:00:00.000Z",
        "pengguna": {
          "id": "user_id",
          "nama_lengkap": "John Doe",
          "email": "john@example.com",
          "telepon": "08123456789"
        },
        "_count": {
          "produk": 25
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### GET /api/penjual/:id
Get seller by ID.

**Response (200):**
```json
{
  "status": "success",
  "message": "Data penjual berhasil diambil",
  "data": {
    "penjual": {
      "id": "seller_id",
      "pengguna_id": "user_id",
      "nama_toko": "Toko Batik Nusantara",
      "slug_toko": "toko-batik-nusantara",
      "origin_region": "Yogyakarta",
      "badges": ["verified", "premium"],
      "verification_level": "verified",
      "rating_rata": 4.5,
      "rating_jumlah": 100,
      "created_at": "2024-01-01T00:00:00.000Z",
      "pengguna": {
        "id": "user_id",
        "nama_lengkap": "John Doe",
        "email": "john@example.com",
        "telepon": "08123456789",
        "foto_profil": "profile.jpg"
      },
      "produk": [...],
      "_count": {
        "produk": 25
      }
    }
  }
}
```

### POST /api/penjual
Create new seller. **Requires Authentication**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "pengguna_id": "user_id",
  "nama_toko": "Toko Batik Nusantara",
  "slug_toko": "toko-batik-nusantara",
  "origin_region": "Yogyakarta",
  "badges": ["verified"],
  "verification_level": "basic",
  "verification_docs": "documents.pdf",
  "default_currency": "IDR",
  "rating_rata": 0,
  "rating_jumlah": 0
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Penjual berhasil dibuat",
  "data": {
    "penjual": {
      "id": "new_seller_id",
      "pengguna_id": "user_id",
      "nama_toko": "Toko Batik Nusantara",
      "slug_toko": "toko-batik-nusantara",
      "origin_region": "Yogyakarta",
      "badges": ["verified"],
      "verification_level": "basic",
      "pengguna": {
        "id": "user_id",
        "nama_lengkap": "John Doe",
        "email": "john@example.com",
        "telepon": "08123456789"
      }
    }
  }
}
```

---

## 🛍️ Product Management Endpoints

### GET /api/produk
Get all products.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, description, or region
- `penjual_id` (optional): Filter by seller ID
- `aktif` (optional): Filter by active status (true/false)
- `motif` (optional): Filter by motif
- `bahan` (optional): Filter by material

**Response (200):**
```json
{
  "status": "success",
  "message": "Data produk berhasil diambil",
  "data": {
    "produk": [
      {
        "id": "product_id",
        "penjual_id": "seller_id",
        "kode_sku": "BATIK001",
        "nama": "Batik Parang Klasik",
        "deskripsi": "Batik tradisional dengan motif parang",
        "cerita_budaya": "Motif parang melambangkan...",
        "panduan_perawatan": "Cuci dengan air dingin...",
        "asal_wilayah": "Yogyakarta",
        "attributes": {"warna": "biru", "ukuran": "L"},
        "motif": ["parang", "klasik"],
        "bahan": ["katun", "sutra"],
        "primary_image_url": "image1.jpg",
        "images": ["image1.jpg", "image2.jpg"],
        "hs_code": "6204.42.00",
        "made_in_country_code": "ID",
        "seo_slug": "batik-parang-klasik",
        "aktif": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "penjual": {
          "id": "seller_id",
          "nama_toko": "Toko Batik Nusantara",
          "pengguna": {
            "nama_lengkap": "John Doe",
            "email": "john@example.com"
          }
        },
        "produk_kategori": [
          {
            "kategori": {
              "id": "category_id",
              "nama": "Batik Tradisional"
            }
          }
        ],
        "varian_produk": [
          {
            "id": "variant_id",
            "nama_varian": "Ukuran L",
            "harga": 250000,
            "stok": 10,
            "sku": "BATIK001-L",
            "berat_gram": 200
          }
        ],
        "_count": {
          "review": 15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /api/produk/:id
Get product by ID.

**Response (200):**
```json
{
  "status": "success",
  "message": "Data produk berhasil diambil",
  "data": {
    "produk": {
      "id": "product_id",
      "penjual_id": "seller_id",
      "kode_sku": "BATIK001",
      "nama": "Batik Parang Klasik",
      "deskripsi": "Batik tradisional dengan motif parang",
      "cerita_budaya": "Motif parang melambangkan...",
      "panduan_perawatan": "Cuci dengan air dingin...",
      "asal_wilayah": "Yogyakarta",
      "attributes": {"warna": "biru", "ukuran": "L"},
      "motif": ["parang", "klasik"],
      "bahan": ["katun", "sutra"],
      "primary_image_url": "image1.jpg",
      "images": ["image1.jpg", "image2.jpg"],
      "hs_code": "6204.42.00",
      "made_in_country_code": "ID",
      "seo_slug": "batik-parang-klasik",
      "aktif": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "penjual": {
        "id": "seller_id",
        "nama_toko": "Toko Batik Nusantara",
        "pengguna": {
          "nama_lengkap": "John Doe",
          "email": "john@example.com"
        }
      },
      "produk_kategori": [...],
      "varian_produk": [...],
      "review": [
        {
          "id": "review_id",
          "rating": 5,
          "komentar": "Produk bagus!",
          "created_at": "2024-01-01T00:00:00.000Z",
          "pengguna": {
            "nama_lengkap": "Buyer Name",
            "foto_profil": "profile.jpg"
          }
        }
      ],
      "_count": {
        "review": 15
      }
    }
  }
}
```

### POST /api/produk
Create new product. **Requires Authentication & Seller Role**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "penjual_id": "seller_id",
  "kode_sku": "BATIK001",
  "nama": "Batik Parang Klasik",
  "deskripsi": "Batik tradisional dengan motif parang",
  "cerita_budaya": "Motif parang melambangkan...",
  "panduan_perawatan": "Cuci dengan air dingin...",
  "asal_wilayah": "Yogyakarta",
  "attributes": {"warna": "biru", "ukuran": "L"},
  "motif": ["parang", "klasik"],
  "bahan": ["katun", "sutra"],
  "primary_image_url": "image1.jpg",
  "images": ["image1.jpg", "image2.jpg"],
  "hs_code": "6204.42.00",
  "made_in_country_code": "ID",
  "seo_slug": "batik-parang-klasik",
  "aktif": true,
  "kategori_ids": ["category_id1", "category_id2"],
  "varian": [
    {
      "nama_varian": "Ukuran L",
      "harga": 250000,
      "stok": 10,
      "sku": "BATIK001-L",
      "berat_gram": 200
    }
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Produk berhasil dibuat",
  "data": {
    "produk": {
      "id": "new_product_id",
      "penjual_id": "seller_id",
      "kode_sku": "BATIK001",
      "nama": "Batik Parang Klasik",
      "aktif": true
    }
  }
}
```

### PUT /api/produk/:id
Update product. **Requires Authentication & Seller Role**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "nama": "Updated Product Name",
  "deskripsi": "Updated description",
  "harga": 300000,
  "stok": 15
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Produk berhasil diperbarui",
  "data": {
    "produk": {
      "id": "product_id",
      "nama": "Updated Product Name",
      "deskripsi": "Updated description"
    }
  }
}
```

### DELETE /api/produk/:id
Delete product. **Requires Authentication & Seller Role**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Produk berhasil dihapus",
  "data": null
}
```

### GET /api/produk/search
Search products with filters.

**Query Parameters:**
- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `kategori_id` (optional): Filter by category ID
- `min_harga` (optional): Minimum price filter
- `max_harga` (optional): Maximum price filter
- `sort_by` (optional): Sort field (default: created_at)
- `sort_order` (optional): Sort order (default: desc)

**Response (200):**
```json
{
  "status": "success",
  "message": "Pencarian produk berhasil",
  "data": {
    "produk": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10,
      "has_next_page": true,
      "has_prev_page": false
    },
    "search_query": "batik parang"
  }
}
```

### GET /api/produk/featured
Get featured products.

**Query Parameters:**
- `limit` (optional): Number of products (default: 8)

**Response (200):**
```json
{
  "status": "success",
  "message": "Produk unggulan berhasil diambil",
  "data": {
    "produk": [...]
  }
}
```

### GET /api/produk/categories
Get all product categories.

**Response (200):**
```json
{
  "status": "success",
  "message": "Kategori produk berhasil diambil",
  "data": {
    "categories": [
      {
        "id": "category_id",
        "nama": "Batik Tradisional",
        "deskripsi": "Batik dengan motif tradisional",
        "created_at": "2024-01-01T00:00:00.000Z",
        "_count": {
          "produk": 25
        }
      }
    ]
  }
}
```

---

## 🔧 Utility Endpoints

### GET /api/supabase/test-connection
Test Supabase connection.

**Response (200):**
```json
{
  "status": "success",
  "message": "Koneksi Supabase berhasil",
  "data": {
    "connected": true,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 📝 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

## 🔒 Authentication Notes

- All protected endpoints require the `Authorization: Bearer <token>` header
- Tokens expire after 24 hours
- Use the refresh token endpoint to get new access tokens
- Seller-specific endpoints require the user to have `adalah_penjual: true`

## 📊 Pagination

Most list endpoints support pagination with these parameters:
- `page`: Page number (starts from 1)
- `limit`: Items per page (default: 10)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

