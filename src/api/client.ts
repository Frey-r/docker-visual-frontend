/**
 * Centralized API client with authentication and error handling.
 */

const BASE = '/api'
const API_KEY = import.meta.env.VITE_API_KEY || ''

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  }

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status}`
    let errorCode = 'UNKNOWN'
    try {
      const errBody = await res.json()
      errorMsg = errBody.error || errorMsg
      errorCode = errBody.code || errorCode
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, errorCode, errorMsg)
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}
