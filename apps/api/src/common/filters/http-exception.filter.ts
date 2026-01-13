import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiResponse, ApiError, ApiErrorCode } from '@bizflow/types';
import { ApiErrorCodes } from '@bizflow/types';
import { ZodValidationException } from 'nestjs-zod';

/**
 * Map HTTP status codes to API error codes
 */
function getErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case HttpStatus.UNAUTHORIZED:
      return ApiErrorCodes.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ApiErrorCodes.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ApiErrorCodes.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ApiErrorCodes.CONFLICT;
    case HttpStatus.BAD_REQUEST:
      return ApiErrorCodes.VALIDATION_ERROR;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ApiErrorCodes.INVALID_INPUT;
    default:
      return ApiErrorCodes.INTERNAL_ERROR;
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorMessage: string;
    let errorDetails: Record<string, string[]> | undefined;

    // Handle ZodValidationException (from nestjs-zod)
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as {
        issues?: Array<{ path: (string | number)[]; message: string }>;
      };
      errorMessage = 'Validation failed';
      errorDetails = {};

      if (zodError?.issues) {
        for (const issue of zodError.issues) {
          const field = issue.path.join('.') || 'root';
          if (!errorDetails[field]) {
            errorDetails[field] = [];
          }
          errorDetails[field].push(issue.message);
        }
      }
    } else if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, unknown>;
      errorMessage = (responseObj.message as string) || exception.message;

      // Handle class-validator style errors
      if (Array.isArray(responseObj.message)) {
        errorDetails = { validation: responseObj.message as string[] };
        errorMessage = 'Validation failed';
      }
    } else {
      errorMessage = exception.message;
    }

    const errorCode = getErrorCode(status);

    const error: ApiError = {
      code: errorCode,
      message: errorMessage,
    };

    if (errorDetails) {
      error.details = errorDetails;
    }

    // Log server errors
    if (status >= 500) {
      this.logger.error(`HTTP ${status} - ${errorMessage}`, exception.stack);
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error,
    };

    response.status(status).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const errorMessage = 'Internal server error';

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : String(exception),
    );

    const error: ApiError = {
      code: ApiErrorCodes.INTERNAL_ERROR,
      message: errorMessage,
    };

    // In development, include stack trace
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      error.stack = exception.stack;
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error,
    };

    response.status(status).json(errorResponse);
  }
}
