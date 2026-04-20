<script setup lang="ts">
import { useDockerStore } from '../stores/docker'
import { computed } from 'vue'

const store = useDockerStore()
const emit = defineEmits<{ close: [] }>()

const container = computed(() => store.inspectedContainer)

function parseName(raw: string) {
  return raw.startsWith('/') ? raw.slice(1) : raw
}

function parseEnvVar(env: string): { key: string; value: string } {
  const idx = env.indexOf('=')
  if (idx === -1) return { key: env, value: '' }
  return { key: env.substring(0, idx), value: env.substring(idx + 1) }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content modal-content-lg">
      <div class="modal-header">
        <h3 v-if="container">🔍 {{ parseName(container.Name) }}</h3>
        <h3 v-else>Loading...</h3>
        <button class="modal-close" @click="emit('close')">✕</button>
      </div>

      <div v-if="store.loadingInspect" class="flex items-center justify-center" style="padding: 40px;">
        <div class="spinner"></div>
      </div>

      <div v-else-if="container">
        <!-- Status -->
        <div class="card" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 10px; font-size: 0.875rem; color: var(--text-muted);">STATUS</h4>
          <div class="flex gap-4 flex-wrap">
            <div>
              <span class="text-sm text-muted">State: </span>
              <span :class="['badge', container.State.Running ? 'badge-running' : 'badge-stopped']">
                {{ container.State.Status }}
              </span>
            </div>
            <div>
              <span class="text-sm text-muted">PID: </span>
              <span class="text-sm text-mono">{{ container.State.Pid }}</span>
            </div>
            <div>
              <span class="text-sm text-muted">Started: </span>
              <span class="text-sm">{{ new Date(container.State.StartedAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Config -->
        <div class="card" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 10px; font-size: 0.875rem; color: var(--text-muted);">CONFIG</h4>
          <div class="text-sm" style="margin-bottom: 6px;">
            <strong>Image:</strong> {{ container.Config.Image }}
          </div>
          <div v-if="container.Config.Cmd" class="text-sm" style="margin-bottom: 6px;">
            <strong>CMD:</strong>
            <code class="text-mono" style="margin-left: 4px;">{{ container.Config.Cmd.join(' ') }}</code>
          </div>
        </div>

        <!-- Environment Variables -->
        <div class="card" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 10px; font-size: 0.875rem; color: var(--text-muted);">
            🔑 ENVIRONMENT VARIABLES ({{ container.Config.Env?.length || 0 }})
          </h4>

          <div v-if="container.Config.Env && container.Config.Env.length > 0" style="border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden;">
            <div
              v-for="(env, idx) in container.Config.Env"
              :key="idx"
              class="env-row"
            >
              <div class="env-key">{{ parseEnvVar(env).key }}</div>
              <div class="env-value">{{ parseEnvVar(env).value }}</div>
            </div>
          </div>
          <div v-else class="text-sm text-muted">No environment variables defined.</div>
        </div>

        <!-- Networks -->
        <div class="card" style="margin-bottom: 16px;">
          <h4 style="margin-bottom: 10px; font-size: 0.875rem; color: var(--text-muted);">NETWORKS</h4>
          <div v-for="(net, name) in container.NetworkSettings.Networks" :key="name" class="text-sm" style="margin-bottom: 6px;">
            <strong>{{ name }}:</strong>
            <span class="text-muted" style="margin-left: 6px;">
              IP {{ net.IPAddress }} · Gateway {{ net.Gateway }}
            </span>
          </div>
        </div>

        <!-- Mounts -->
        <div v-if="container.Mounts && container.Mounts.length > 0" class="card">
          <h4 style="margin-bottom: 10px; font-size: 0.875rem; color: var(--text-muted);">MOUNTS</h4>
          <div v-for="(mount, idx) in container.Mounts" :key="idx" class="text-sm" style="margin-bottom: 8px;">
            <div>
              <span class="badge badge-created" style="margin-right: 6px;">{{ mount.Type }}</span>
              <span :class="mount.RW ? '' : 'text-muted'">[{{ mount.RW ? 'RW' : 'RO' }}]</span>
            </div>
            <div class="text-mono text-muted" style="margin-top: 2px;">
              {{ mount.Source }} → {{ mount.Destination }}
            </div>
          </div>
        </div>

        <!-- Labels -->
        <div v-if="container.Config.Labels && Object.keys(container.Config.Labels).length > 0" class="card" style="margin-top: 16px;">
          <h4 style="margin-bottom: 10px; font-size: 0.875rem; color: var(--text-muted);">LABELS</h4>
          <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); overflow: hidden;">
            <div
              v-for="(val, key) in container.Config.Labels"
              :key="key"
              class="env-row"
            >
              <div class="env-key">{{ key }}</div>
              <div class="env-value">{{ val }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
