<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDockerStore } from '../stores/docker'

const store = useDockerStore()

const selectedProject = ref('')
const tunnelToken = ref('')
const creating = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const tunnelContainers = computed(() =>
  store.containers.filter(c => {
    const name = c.names?.[0] || ''
    return name.includes('cloudflared')
  })
)

async function handleCreateTunnel() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!selectedProject.value) {
    errorMsg.value = 'Select a project'
    return
  }
  if (!tunnelToken.value.trim()) {
    errorMsg.value = 'Cloudflare tunnel token is required'
    return
  }

  creating.value = true
  try {
    await store.createTunnel(selectedProject.value, tunnelToken.value.trim())
    successMsg.value = `Tunnel created for "${selectedProject.value}"!`
    tunnelToken.value = ''
    selectedProject.value = ''
    await store.fetchContainers()
  } catch (e) {
    errorMsg.value = (e as Error).message
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  store.fetchProjects()
  store.fetchContainers()
})
</script>

<template>
  <div class="view-enter">
    <div class="view-title">
      <h2>🌐 Tunnels</h2>
    </div>

    <!-- Create Tunnel -->
    <div class="card-static" style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 16px;">Create Cloudflare Tunnel</h3>

      <div v-if="errorMsg" class="error-banner">
        ⚠️ {{ errorMsg }}
        <button class="btn-ghost btn-sm" @click="errorMsg = ''">✕</button>
      </div>

      <div v-if="successMsg" style="margin-bottom: 16px; padding: 12px; background: var(--success-bg); border: 1px solid var(--success-border); border-radius: var(--radius-md); color: var(--success); font-size: 0.8125rem;">
        ✓ {{ successMsg }}
      </div>

      <div class="form-group">
        <label for="tunnel-project">Project</label>
        <select id="tunnel-project" v-model="selectedProject" :disabled="creating">
          <option value="">Select a project...</option>
          <option v-for="p in store.projects" :key="p.id" :value="p.name">
            {{ p.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="tunnel-token">Cloudflare Tunnel Token</label>
        <input
          id="tunnel-token"
          v-model="tunnelToken"
          type="password"
          placeholder="eyJh..."
          :disabled="creating"
        />
        <div class="text-sm text-muted" style="margin-top: 4px;">
          Get your token from the
          <a href="https://dash.cloudflare.com/" target="_blank" style="color: var(--text-accent);">Cloudflare Dashboard</a>
          → Zero Trust → Tunnels.
        </div>
      </div>

      <button
        class="btn-primary"
        :disabled="creating"
        @click="handleCreateTunnel"
      >
        <span v-if="creating" class="spinner spinner-sm"></span>
        {{ creating ? 'Creating...' : '🌐 Create Tunnel' }}
      </button>
    </div>

    <!-- Active Tunnels -->
    <div class="card-static">
      <h3 style="margin-bottom: 16px;">🔗 Active Tunnel Containers</h3>

      <div v-if="tunnelContainers.length === 0" class="empty-state">
        <div class="empty-state-icon">🌐</div>
        <div class="empty-state-title">No tunnels active</div>
        <div class="empty-state-desc">Create a Cloudflare tunnel for one of your projects to expose it to the internet.</div>
      </div>

      <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));">
        <div v-for="c in tunnelContainers" :key="c.id" class="card">
          <div class="flex justify-between items-center" style="margin-bottom: 8px;">
            <span style="font-weight: 600;">{{ c.names[0]?.replace('/', '') }}</span>
            <span :class="['badge', c.state === 'running' ? 'badge-running' : 'badge-stopped']">
              {{ c.state }}
            </span>
          </div>
          <div class="text-sm text-muted" style="margin-bottom: 4px;">
            <strong>Image:</strong> {{ c.image }}
          </div>
          <div class="text-sm text-muted">
            <strong>Status:</strong> {{ c.status }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
