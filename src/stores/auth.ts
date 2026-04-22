import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../api/client'
import type { User, LoginRequest, RegisterRequest, AuthResponse, SetupStatus } from '../types'

const TOKEN_KEY = 'docker_visual_token'
const USER_KEY = 'docker_visual_user'
const EXPIRES_KEY = 'docker_visual_expires'

export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const expiresAt = ref<number>(parseInt(localStorage.getItem(EXPIRES_KEY) || '0', 10))
  const requiresSetup = ref<boolean>(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- Getters ---
  const isAuthenticated = computed(() => {
    if (!token.value) return false
    if (expiresAt.value && Date.now() / 1000 > expiresAt.value) {
      logout()
      return false
    }
    return true
  })

  const currentUser = computed(() => user.value)

  // --- Actions ---
  function setAuth(response: AuthResponse) {
    token.value = response.token
    user.value = response.user
    expiresAt.value = response.expires_at

    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    localStorage.setItem(EXPIRES_KEY, response.expires_at.toString())
  }

  function logout() {
    token.value = null
    user.value = null
    expiresAt.value = 0

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(EXPIRES_KEY)
  }

  async function checkSetup(): Promise<boolean> {
    try {
      const response = await apiFetch<SetupStatus>('/auth/setup')
      requiresSetup.value = response.requires_setup
      return response.requires_setup
    } catch (e) {
      error.value = (e as Error).message
      return false
    }
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      })
      setAuth(response)
      return true
    } catch (e) {
      error.value = (e as Error).message
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(credentials: RegisterRequest): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: credentials,
      })
      setAuth(response)
      requiresSetup.value = false
      return true
    } catch (e) {
      error.value = (e as Error).message
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) return

    try {
      const response = await apiFetch<User>('/auth/me')
      user.value = response
      localStorage.setItem(USER_KEY, JSON.stringify(response))
    } catch (e) {
      logout()
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    token,
    user,
    requiresSetup,
    loading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    checkSetup,
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  }
})
