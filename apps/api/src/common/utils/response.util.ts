import type {
  ApiResponse,
  ApiMeta,
  ApiError,
  ApiErrorCode,
} from '@bizflow/types';

/**
 * Create a success response
 */
export function successResponse<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * Create a paginated response with optional summary
 */
export function paginatedResponse<
  T,
  S extends Record<string, unknown> = Record<string, unknown>,
>(data: T[], meta: ApiMeta, summary?: S): ApiResponse<T[]> & { summary?: S } {
  const response: ApiResponse<T[]> & { summary?: S } = {
    success: true,
    data,
    meta,
  };

  if (summary) {
    response.summary = summary;
  }

  return response;
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, string[]>,
): ApiResponse<never> {
  const error: ApiError = {
    code,
    message,
  };

  if (details) {
    error.details = details;
  }

  return {
    success: false,
    error,
  };
}
