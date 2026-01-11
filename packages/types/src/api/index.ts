/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string;
}

/**
 * Pagination metadata
 */
export interface ApiMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta;
}

/**
 * Pagination query params
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search/filter params
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, string | number | boolean | string[]>;
}

/**
 * Date range filter
 */
export interface DateRangeParams {
  startDate?: Date | string;
  endDate?: Date | string;
}

/**
 * Common list query params
 */
export interface ListQueryParams extends SearchParams, DateRangeParams {
  isActive?: boolean;
  includeDeleted?: boolean;
}

// ========================================
// Auth Types
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginWithPinRequest {
  userId: string;
  pin: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    outlets: string[];
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
  permissions: string[];
  outlets: string[];
  iat: number;
  exp: number;
}

// ========================================
// Error Codes
// ========================================

export const ApiErrorCodes = {
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  CREDIT_LIMIT_EXCEEDED: 'CREDIT_LIMIT_EXCEEDED',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  CANNOT_MODIFY_COMPLETED: 'CANNOT_MODIFY_COMPLETED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes];
