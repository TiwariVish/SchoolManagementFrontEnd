import { isAxiosError } from 'axios';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/** RFC 7807 body returned by the iSkool API for every error. */
export interface Problem {
  status: number;
  code: string;
  title?: string;
  detail?: string;
  errors?: Record<string, unknown>;
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;
  readonly data: Record<string, unknown>;

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title ?? 'Something went wrong');
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.data = problem.errors ?? {};
    this.fieldErrors = Object.fromEntries(
      Object.entries(problem.errors ?? {})
        .filter(([, value]) => Array.isArray(value) && typeof value[0] === 'string')
        .map(([field, value]) => [field, (value as string[])[0]]),
    );
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const body = error.response?.data as Partial<Problem> | undefined;
    if (body && typeof body === 'object' && 'code' in body) {
      return new ApiError({ status: error.response?.status ?? 0, code: String(body.code), ...body } as Problem);
    }
    if (!error.response) {
      return new ApiError({ status: 0, code: 'NETWORK', detail: 'Cannot reach the server. Check your connection.' });
    }
    return new ApiError({ status: error.response.status, code: 'HTTP_ERROR', detail: error.message });
  }
  return new ApiError({ status: 0, code: 'UNKNOWN', detail: error instanceof Error ? error.message : String(error) });
}

export const errorMessage = (error: unknown): string => toApiError(error).message;

/**
 * Copies server-side field errors onto a react-hook-form. Returns true when at least one field matched,
 * so the caller can skip a generic toast.
 */
export function applyFieldErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  const apiError = toApiError(error);
  const entries = Object.entries(apiError.fieldErrors);
  for (const [field, message] of entries) setError(field as Path<T>, { type: 'server', message });
  return entries.length > 0;
}
