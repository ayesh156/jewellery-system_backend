/**
 * Application-wide constants and configurations.
 */

// ==========================================
// JWT Configuration
// ==========================================

export const JWT_SECRET =
  process.env.JWT_SECRET || 'onelka-jewellery-secret-key-change-in-production';
export const JWT_EXPIRES_IN = '7d';
export const BCRYPT_SALT_ROUNDS = 12;

// ==========================================
// Pagination defaults
// ==========================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ==========================================
// Counter entity types & default prefixes
// ==========================================

export const DEFAULT_PREFIXES: Record<string, string> = {
  invoice: 'INV',
  clearance: 'CLR',
  product: 'PROD',
  category: 'CAT',
  customer: 'CUS',
};

export const ENTITY_TYPES = Object.keys(DEFAULT_PREFIXES);

// ==========================================
// Entity ID prefixes
// ==========================================

export const ID_PREFIXES = {
  USER: 'USR',
  COUNTER: 'counter',
} as const;

// ==========================================
// Pawning bill formats
// ==========================================

export const PAWN_BILL_FORMATS = ['A4', '80mm'] as const;

// ==========================================
// Response helpers
// ==========================================

export const RESPONSE = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;