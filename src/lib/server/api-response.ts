import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status });
}
