import { APP_ERROR_TYPES, AppErrorType, isAppErrorType } from './errors';

interface ErrorResponse {
  ok: false;
  errorType: AppErrorType;
}

interface ApiErrorRosponseBody {
  message: string;
  status: number;
  type: string;
}

interface SuccessResponse<T> {
  ok: true;
  data: T;
  headers: Headers;
}

export async function publicRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<SuccessResponse<T> | ErrorResponse> {
  const response = await fetch(`${process.env.API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json()) as ApiErrorRosponseBody;
    return {
      ok: false,
      errorType: isAppErrorType(body.type) ? body.type : APP_ERROR_TYPES.UNKNOWN,
    };
  }

  return {
    ok: true,
    data: (await response.json()) as T,
    headers: response.headers,
  };
}
