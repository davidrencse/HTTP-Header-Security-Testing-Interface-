import type { ApiErrorBody } from '../types';

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody | unknown;

  constructor(status: number, message: string, body: ApiErrorBody | unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export const getApiBaseUrl = () => {
  const value = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (value && value.trim().replace(/\/$/, '')) || DEFAULT_API_BASE_URL;
};

const buildUrl = (path: string, query?: Record<string, string | number | boolean | undefined | null>) => {
  const url = new URL(`/api${path}`, getApiBaseUrl());
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit & { query?: Record<string, string | number | boolean | undefined | null> } = {}): Promise<T> {
  const { query, headers, body, ...rest } = options;
  const response = await fetch(buildUrl(path, query), {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body,
    ...rest
  });
  const parsed = await parseResponse(response);
  if (!response.ok) {
    const maybe = parsed as ApiErrorBody;
    throw new ApiError(response.status, maybe?.message || maybe?.error || `Request failed with ${response.status}`, parsed);
  }
  return parsed as T;
}

export const jsonBody = (value: unknown) => JSON.stringify(value);
