import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiErrorDetails {
  code: string
  message: string
  details?: unknown
  statusCode: number
}

export class ApiError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(code: string, message: string, statusCode = 500, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.format(),
      },
      { status: 400 }
    )
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return NextResponse.json(
      {
        error: 'External service unavailable',
        code: 'SERVICE_UNAVAILABLE',
      },
      { status: 503 }
    )
  }

  // Generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  )
}

export function withErrorHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await fn(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// Common error types
export const CommonErrors = {
  NotFound: (resource: string) => new ApiError(
    'NOT_FOUND',
    `${resource} not found`,
    404
  ),
  
  Unauthorized: () => new ApiError(
    'UNAUTHORIZED',
    'Authentication required',
    401
  ),
  
  Forbidden: () => new ApiError(
    'FORBIDDEN',
    'Insufficient permissions',
    403
  ),
  
  TooManyRequests: (reset: number) => new ApiError(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests',
    429,
    { reset }
  ),
  
  ValidationError: (message: string) => new ApiError(
    'VALIDATION_ERROR',
    message,
    400
  ),
  
  ExternalServiceError: (service: string) => new ApiError(
    'EXTERNAL_SERVICE_ERROR',
    `${service} service unavailable`,
    503
  ),
}