import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate unique slug from name
 * @param name - Base name to convert to slug
 * @param checkTable - Table name to check for uniqueness (produk, penjual, kategori)
 * @param fieldName - Field name in the table (seo_slug, slug_toko, slug)
 * @param excludeId - ID to exclude from uniqueness check (for updates)
 * @returns Promise<string> - Unique slug
 */
export const generateUniqueSlug = async (
  name: string,
  checkTable: 'produk' | 'penjual' | 'kategori',
  fieldName: string = 'slug',
  excludeId?: string
): Promise<string> => {
  // Convert name to slug format
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists and increment counter if needed
  while (true) {
    const whereClause: any = { [fieldName]: slug };
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    let existing;
    switch (checkTable) {
      case 'produk':
        existing = await prisma.produk.findFirst({ where: whereClause });
        break;
      case 'penjual':
        existing = await prisma.penjual.findFirst({ where: whereClause });
        break;
      case 'kategori':
        existing = await prisma.kategori.findFirst({ where: whereClause });
        break;
    }

    if (!existing) {
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

/**
 * Generate unique SKU for products
 * @param prefix - Prefix for SKU (default: 'BATIK')
 * @returns Promise<string> - Unique product SKU
 */
export const generateUniqueProdukSku = async (prefix: string = 'BATIK'): Promise<string> => {
  let sku: string;
  let counter = 1;

  while (true) {
    // Format: BATIK-001, BATIK-002, etc.
    sku = `${prefix}-${counter.toString().padStart(3, '0')}`;
    
    const existing = await prisma.produk.findFirst({
      where: { kode_sku: sku }
    });

    if (!existing) {
      break;
    }
    counter++;
  }

  return sku;
};

/**
 * Generate unique SKU for product variants
 * @param produkSku - Parent product SKU
 * @param varianName - Variant name
 * @returns Promise<string> - Unique variant SKU
 */
export const generateUniqueVarianSku = async (
  produkSku: string,
  varianName: string
): Promise<string> => {
  // Create variant suffix from variant name
  const varianSuffix = varianName
    .toUpperCase()
    .replace(/[^\w]/g, '')
    .substring(0, 3); // Take first 3 characters

  let sku: string;
  let counter = 1;

  while (true) {
    // Format: BATIK-001-L, BATIK-001-XL, etc.
    sku = counter === 1 
      ? `${produkSku}-${varianSuffix}`
      : `${produkSku}-${varianSuffix}-${counter}`;
    
    const existing = await prisma.varianProduk.findFirst({
      where: { sku: sku }
    });

    if (!existing) {
      break;
    }
    counter++;
  }

  return sku;
};

/**
 * Generate unique coupon code
 * @param prefix - Prefix for coupon code (default: 'KUPON')
 * @returns Promise<string> - Unique coupon code
 */
export const generateUniqueKuponCode = async (prefix: string = 'KUPON'): Promise<string> => {
  let code: string;
  
  while (true) {
    // Generate random string: KUPON-ABC123
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    code = `${prefix}-${randomSuffix}`;
    
    const existing = await prisma.kupon.findFirst({
      where: { kode: code }
    });

    if (!existing) {
      break;
    }
  }

  return code;
};

/**
 * Generate unique external ID for payments
 * @param prefix - Prefix for external ID (default: 'PAY')
 * @returns string - Unique external ID (timestamp-based)
 */
export const generateUniqueExternalId = (prefix: string = 'PAY'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate unique invoice number
 * @param prefix - Prefix for invoice (default: 'INV')
 * @returns string - Unique invoice number
 */
export const generateUniqueInvoiceNumber = (prefix: string = 'INV'): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  
  return `${prefix}-${year}${month}${day}-${timestamp}`;
};

/**
 * Validate and sanitize slug input
 * @param input - Raw input string
 * @returns string - Sanitized slug
 */
export const sanitizeSlugInput = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if SKU format is valid
 * @param sku - SKU to validate
 * @param pattern - Regex pattern (optional)
 * @returns boolean - Is valid SKU
 */
export const isValidSkuFormat = (sku: string, pattern?: RegExp): boolean => {
  const defaultPattern = /^[A-Z0-9-]{3,20}$/; // Allow A-Z, 0-9, and hyphens, 3-20 chars
  const regex = pattern || defaultPattern;
  return regex.test(sku);
};