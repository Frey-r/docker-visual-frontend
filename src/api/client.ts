/**
 * Centralized API client with authentication and error handling.
 */

const BASE = '/api'
const TOKEN_KEY = 'docker_visual_token'

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  skipAuth?: boolean
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

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { body, headers: extraHeaders, skipAuth, ...rest } = options

  const headers: Record<string, string> = {
    ...(extraHeaders as Record<string, string>),
  }

  // Add JWT token if available and not skipping auth
  const token = getToken()
  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
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
