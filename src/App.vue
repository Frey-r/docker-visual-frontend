<script setup lang="ts">
import { onMounted } from 'vue'
import { useDockerStore } from './stores/docker'
import AppHeader from './components/AppHeader.vue'
import DashboardView from './components/DashboardView.vue'
import ProjectsView from './components/ProjectsView.vue'
import ContainerList from './components/ContainerList.vue'
import ImagesView from './components/ImagesView.vue'
import TunnelsView from './components/TunnelsView.vue'

const store = useDockerStore()

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <AppHeader />

  <div v-if="store.error" class="main-content" style="padding-bottom: 0;">
    <div class="error-banner">
      ⚠️ {{ store.error }}
      <button class="btn-ghost btn-sm" @click="store.clearError()">✕ Dismiss</button>
    </div>
  </div>

  <main class="main-content">
    <DashboardView v-if="store.viewMode === 'dashboard'" />
    <ProjectsView v-else-if="store.viewMode === 'projects'" />
    <ContainerList v-else-if="store.viewMode === 'containers'" />
    <ImagesView v-else-if="store.viewMode === 'images'" />
    <TunnelsView v-else-if="store.viewMode === 'tunnels'" />
  </main>
</template>
