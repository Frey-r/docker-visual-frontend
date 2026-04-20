<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDockerStore } from '../stores/docker'
import DeployProgress from './DeployProgress.vue'

const store = useDockerStore()

const projectName = ref('')
const sourceType = ref<'github' | 'image'>('github')
const gitUrl = ref('')
const creating = ref(false)
const createError = ref('')
const createSuccess = ref('')

let pollInterval: ReturnType<typeof setInterval> | null = null

async function handleCreate() {
  createError.value = ''
  createSuccess.value = ''

  if (!projectName.value.trim()) {
    createError.value = 'Project name is required'
    return
  }

  if (sourceType.value === 'github' && !gitUrl.value.trim()) {
    createError.value = 'GitHub URL is required'
    return
  }

  creating.value = true
  try {
    await store.createProject(
      projectName.value.trim(),
      sourceType.value === 'github' ? gitUrl.value.trim() : ''
    )
    createSuccess.value = `Project "${projectName.value}" created successfully!`
    projectName.value = ''
    gitUrl.value = ''
  } catch (e) {
    createError.value = (e as Error).message
  } finally {
    creating.value = false
  }
}

function startPolling() {
  pollInterval = setInterval(() => {
    store.fetchDeployJobs()
  }, 3000)
}

onMounted(() => {
  store.fetchProjects()
  store.fetchDeployJobs()
  startPolling()
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<template>
  <div class="view-enter">
    <div class="view-title">
      <h2>🚀 Projects</h2>
    </div>

    <!-- Create Project Form -->
    <div class="card-static" style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 16px;">Create New Project</h3>

      <div v-if="createError" class="error-banner">
        ⚠️ {{ createError }}
        <button class="btn-ghost btn-sm" @click="createError = ''">✕</button>
      </div>

      <div v-if="createSuccess" style="margin-bottom: 16px; padding: 12px; background: var(--success-bg); border: 1px solid var(--success-border); border-radius: var(--radius-md); color: var(--success); font-size: 0.8125rem;">
        ✓ {{ createSuccess }}
      </div>

      <div class="form-group">
        <label for="project-name">Project Name</label>
        <input
          id="project-name"
          v-model="projectName"
          type="text"
          placeholder="my-awesome-app"
          :disabled="creating"
        />
      </div>

      <div class="form-group">
        <label>Source Type</label>
        <div class="toggle-group">
          <button
            :class="['toggle-option', { active: sourceType === 'github' }]"
            @click="sourceType = 'github'"
          >
            🐙 GitHub Repository
          </button>
          <button
            :class="['toggle-option', { active: sourceType === 'image' }]"
            @click="sourceType = 'image'"
          >
            🐳 Docker Image
          </button>
        </div>
      </div>

      <div v-if="sourceType === 'github'" class="form-group">
        <label for="git-url">Repository URL</label>
        <input
          id="git-url"
          v-model="gitUrl"
          type="url"
          placeholder="https://github.com/user/repo.git"
          :disabled="creating"
        />
      </div>

      <div v-if="sourceType === 'image'" class="form-group">
        <label for="docker-image">Docker Image</label>
        <input
          id="docker-image"
          type="text"
          placeholder="nginx:latest (coming soon)"
          disabled
        />
        <div class="text-sm text-muted" style="margin-top: 4px;">
          Docker Image deployment requires a backend endpoint (not yet implemented).
        </div>
      </div>

      <button
        class="btn-primary"
        :disabled="creating"
        @click="handleCreate"
      >
        <span v-if="creating" class="spinner spinner-sm"></span>
        {{ creating ? 'Creating...' : '+ Create Project' }}
      </button>
    </div>

    <!-- Deploy Jobs -->
    <div v-if="store.deployJobs.length > 0" class="card-static" style="margin-bottom: 24px;">
      <h3 style="margin-bottom: 16px;">📋 Deploy Jobs</h3>
      <div class="grid" style="grid-template-columns: 1fr;">
        <div v-for="job in store.deployJobs" :key="job.project_name" class="card">
          <div class="flex justify-between items-center" style="margin-bottom: 12px;">
            <span class="text-lg">{{ job.project_name }}</span>
            <span :class="['badge', job.status === 'done' ? 'badge-running' : job.status === 'failed' ? 'badge-stopped' : 'badge-pending']">
              {{ job.status }}
            </span>
          </div>
          <div class="text-sm text-muted" style="margin-bottom: 8px;">
            {{ job.git_url }}
          </div>
          <DeployProgress :status="job.status" :error="job.error" />
        </div>
      </div>
    </div>

    <!-- Project List -->
    <div class="card-static">
      <h3 style="margin-bottom: 16px;">📁 Active Projects</h3>

      <div v-if="store.loadingProjects" class="flex items-center justify-center" style="padding: 40px;">
        <div class="spinner"></div>
      </div>

      <div v-else-if="store.projects.length === 0" class="empty-state">
        <div class="empty-state-icon">📂</div>
        <div class="empty-state-title">No projects yet</div>
        <div class="empty-state-desc">Create your first project above to get started.</div>
      </div>

      <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        <div v-for="project in store.projects" :key="project.id" class="card">
          <div class="flex justify-between items-center" style="margin-bottom: 8px;">
            <span class="text-lg">{{ project.name }}</span>
            <span class="badge badge-running">active</span>
          </div>
          <div class="text-sm text-muted" style="margin-bottom: 4px;">
            <strong>Network:</strong> <code class="text-mono">{{ project.network_id.substring(0, 12) }}</code>
          </div>
          <div class="text-sm text-muted">
            <strong>Containers:</strong> {{ project.containers }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
