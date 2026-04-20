<script setup lang="ts">
import { onMounted } from 'vue'
import { useDockerStore } from '../stores/docker'
import NetworkGraph from './NetworkGraph.vue'

const store = useDockerStore()

onMounted(() => {
  if (store.containers.length === 0) {
    store.fetchAll()
  }
})
</script>

<template>
  <div class="view-enter">
    <!-- Summary Cards -->
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); margin-bottom: 24px;">
      <div class="card">
        <div class="text-sm text-muted" style="margin-bottom: 6px;">Total Containers</div>
        <div class="text-xl">{{ store.containerCount }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted" style="margin-bottom: 6px;">Running</div>
        <div class="text-xl" style="color: var(--success);">{{ store.runningCount }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted" style="margin-bottom: 6px;">Stopped</div>
        <div class="text-xl" style="color: var(--danger);">{{ store.stoppedCount }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted" style="margin-bottom: 6px;">Networks</div>
        <div class="text-xl">{{ store.networkCount }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-muted" style="margin-bottom: 6px;">Images</div>
        <div class="text-xl">{{ store.imageCount }}</div>
      </div>
    </div>

    <!-- Network Topology -->
    <div class="card-static">
      <h3 style="margin-bottom: 12px;">🕸️ Network Topology</h3>
      <div v-if="store.loadingGraph" class="flex items-center justify-center" style="height: 300px;">
        <div class="spinner"></div>
      </div>
      <NetworkGraph v-else />
    </div>
  </div>
</template>
