import { NextResponse } from "next/server";

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export function errorResponse(
  message: string,
  status: number = 400,
  error?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
    },
    { status }
  );
}

export function badRequestResponse(
  message: string = "Bad request"
): NextResponse<ApiResponse> {
  return errorResponse(message, 400);
}

export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(
  message: string = "Forbidden"
): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function notFoundResponse(
  message: string = "Not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function conflictResponse(
  message: string = "Conflict"
): NextResponse<ApiResponse> {
  return errorResponse(message, 409);
}

export function serverErrorResponse(
  message: string = "Internal server error"
): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}

// ============================================================================
// VALIDATION ERROR RESPONSE
// ============================================================================

export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message: "Validation failed",
      error: "Validation error",
      errors,
    },
    { status: 422 }
  );
}

// ============================================================================
// PAGINATION RESPONSE
// ============================================================================

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error("API Error:", error);

  if (error instanceof Error) {
    return serverErrorResponse(error.message);
  }

  return serverErrorResponse();
}
