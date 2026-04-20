<script setup lang="ts">
import { useDockerStore } from '../stores/docker'
import type { ViewMode } from '../types'

const store = useDockerStore()

const tabs: { icon: string; label: string; mode: ViewMode }[] = [
  { icon: '📊', label: 'Dashboard', mode: 'dashboard' },
  { icon: '🚀', label: 'Projects', mode: 'projects' },
  { icon: '📦', label: 'Containers', mode: 'containers' },
  { icon: '💿', label: 'Images', mode: 'images' },
  { icon: '🌐', label: 'Tunnels', mode: 'tunnels' },
]

function setMode(mode: ViewMode) {
  store.setViewMode(mode)
  if (mode === 'images') store.fetchImages()
  if (mode === 'projects') {
    store.fetchProjects()
    store.fetchDeployJobs()
  }
}
</script>

<template>
  <header class="app-header">
    <div class="header-top">
      <div class="header-brand">
        <span class="header-brand-icon">🐳</span>
        <span>Docker Visual</span>
      </div>

      <div class="header-stats">
        <div class="stat-pill">
          <span class="stat-value">{{ store.containerCount }}</span>
          <span class="stat-label">Containers</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value" style="color: var(--success)">{{ store.runningCount }}</span>
          <span class="stat-label">Running</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value">{{ store.networkCount }}</span>
          <span class="stat-label">Networks</span>
        </div>
        <div class="stat-pill">
          <span class="stat-value">{{ store.projectCount }}</span>
          <span class="stat-label">Projects</span>
        </div>
      </div>

      <div class="flex gap-2 items-center">
        <div v-if="store.loading" class="spinner spinner-sm"></div>
        <button class="btn-secondary btn-sm" @click="store.fetchAll()">
          ↻ Refresh
        </button>
      </div>
    </div>

    <nav class="header-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.mode"
        :class="['tab-btn', { active: store.viewMode === tab.mode }]"
        @click="setMode(tab.mode)"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </nav>
  </header>
</template>
