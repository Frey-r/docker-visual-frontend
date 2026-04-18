<script setup lang="ts">
import { useDockerStore } from '../stores/docker'

const store = useDockerStore()
</script>

<template>
  <div class="stats-bar flex items-center justify-between" style="background: #161b22; padding: 12px 24px; border-bottom: 1px solid #30363d;">
    <div class="flex gap-4">
      <div class="stat">
        <span class="text-xl">{{ store.containerCount }}</span>
        <span class="text-sm text-muted" style="margin-left: 6px;">Containers</span>
      </div>
      <div class="stat">
        <span class="text-xl" style="color: #3fb950;">{{ store.runningCount }}</span>
        <span class="text-sm text-muted" style="margin-left: 6px;">Running</span>
      </div>
      <div class="stat">
        <span class="text-xl">{{ store.networkCount }}</span>
        <span class="text-sm text-muted" style="margin-left: 6px;">Networks</span>
      </div>
    </div>
    <div v-if="store.loading" class="text-sm text-muted">Updating...</div>
  </div>
</template>

<style scoped>
.stat {
  display: inline-flex;
  align-items: baseline;
}
</style>
