<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const isSetupMode = ref(false)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

onMounted(async () => {
  isSetupMode.value = await authStore.checkSetup()
})

async function handleSubmit() {
  authStore.clearError()

  if (isSetupMode.value) {
    if (password.value !== confirmPassword.value) {
      authStore.error = 'Passwords do not match'
      return
    }
    if (password.value.length < 6) {
      authStore.error = 'Password must be at least 6 characters'
      return
    }
    await authStore.register({ username: username.value, password: password.value })
  } else {
    await authStore.login({ username: username.value, password: password.value })
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">🐳</div>
        <h1>Docker Visual</h1>
        <p v-if="isSetupMode" class="subtitle">Create your admin account</p>
        <p v-else class="subtitle">Sign in to continue</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter username"
            required
            autocomplete="username"
            class="input-field"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter password"
            required
            autocomplete="current-password"
            class="input-field"
          />
        </div>

        <div v-if="isSetupMode" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            class="input-field"
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button 
          type="submit" 
          class="btn-primary btn-full"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">
            {{ isSetupMode ? 'Creating Account...' : 'Signing In...' }}
          </span>
          <span v-else>
            {{ isSetupMode ? 'Create Account' : 'Sign In' }}
          </span>
        </button>
      </form>

      <div v-if="isSetupMode" class="setup-notice">
        <p>This is the initial setup. Create your admin account to get started.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
}

.login-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 4rem;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input-field {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: var(--text-muted);
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.setup-notice {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.setup-notice p {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}
</style>
