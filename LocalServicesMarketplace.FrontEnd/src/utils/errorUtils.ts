import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  errors?: string[];
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    
    // Check for array of errors first (validation errors)
    if (data?.errors && data.errors.length > 0) {
      return data.errors[0];
    }
    
    // Check for single error message
    if (data?.error) {
      return data.error;
    }
    
    // Fall back to Axios error message
    return error.message || fallback;
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
}

/**
 * Type guard to check if error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}
