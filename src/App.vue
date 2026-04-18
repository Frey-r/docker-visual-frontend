<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDockerStore } from './stores/docker'
import NetworkGraph from './components/NetworkGraph.vue'
import ContainerList from './components/ContainerList.vue'
import NetworkList from './components/NetworkList.vue'
import StatsBar from './components/StatsBar.vue'
import type { ViewMode } from './types'

const store = useDockerStore()

const viewMode = computed(() => store.viewMode)

const tabs: { label: string; mode: ViewMode }[] = [
  { label: 'Graph', mode: 'graph' },
  { label: 'Containers', mode: 'containers' },
  { label: 'Networks', mode: 'networks' },
  { label: 'Images', mode: 'images' },
  { label: 'Volumes', mode: 'volumes' }
]

function setMode(mode: ViewMode) {
  store.setViewMode(mode)
  if (mode === 'images') store.fetchImages()
  else if (mode === 'volumes') store.fetchVolumes()
}

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <StatsBar />
  
  <nav class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <span class="text-xl">🐳 Docker Visual</span>
      <div class="flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.mode"
          :class="{ active: viewMode === tab.mode }"
          @click="setMode(tab.mode)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
    <button @click="store.fetchAll()" class="btn-primary">Refresh</button>
  </nav>

  <main>
    <div v-if="store.error" class="card" style="color: #f85149; margin: 16px;">
      Error: {{ store.error }}
    </div>

    <NetworkGraph v-if="viewMode === 'graph'" />
    <ContainerList v-else-if="viewMode === 'containers'" />
    <NetworkList v-else-if="viewMode === 'networks'" />
    <div v-else-if="viewMode === 'images'" class="card">
      <h2 class="text-lg" style="margin-bottom: 16px;">Images ({{ store.imageCount }})</h2>
      <div v-if="store.loading">Loading...</div>
      <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        <div v-for="img in store.images" :key="img.id" class="card">
          <div class="text-sm" style="font-family: monospace;">{{ img.id.substring(0, 19) }}</div>
          <div class="text-sm text-muted">{{ (img.size / 1024 / 1024).toFixed(2) }} MB</div>
          <div class="text-sm text-muted" style="margin-top: 8px;">
            {{ img.repo_tags?.filter(t => t !== '<none>:<none>').join(', ') || 'None' }}
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="viewMode === 'volumes'" class="card">
      <h2 class="text-lg" style="margin-bottom: 16px;">Volumes ({{ store.volumes.length }})</h2>
      <div v-if="store.loading">Loading...</div>
      <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        <div v-for="vol in store.volumes" :key="vol.name" class="card">
          <div class="text-sm">{{ vol.name }}</div>
          <div class="text-sm text-muted">Driver: {{ vol.driver }}</div>
        </div>
      </div>
    </div>
  </main>
</template>
