<script setup lang="ts">
import { useDockerStore } from '../stores/docker'

const store = useDockerStore()

function getBadgeClass(state: string) {
  switch (state) {
    case 'running': return 'badge-running'
    case 'exited': return 'badge-stopped'
    default: return 'badge-created'
  }
}

function getContainerName(names: string[]) {
  if (!names || names.length === 0) return 'unnamed'
  let name = names[0]
  if (name.startsWith('/')) name = name.slice(1)
  return name
}

function formatPorts(ports: { public_port: number; private_port: number; type: string }[]) {
  if (!ports || ports.length === 0) return 'No ports'
  return ports
    .filter(p => p.public_port)
    .map(p => `${p.public_port}:${p.private_port}/${p.type}`)
    .join(', ') || 'No exposed ports'
}
</script>

<template>
  <div style="padding: 16px;">
    <h2 class="text-lg" style="margin-bottom: 16px;">Containers</h2>
    
    <div v-if="store.loading" class="text-muted">Loading...</div>
    
    <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));">
      <div v-for="c in store.containers" :key="c.id" class="card">
        <div class="flex justify-between items-center" style="margin-bottom: 8px;">
          <span class="text-lg">{{ getContainerName(c.names) }}</span>
          <span :class="['badge', getBadgeClass(c.state)]">{{ c.state }}</span>
        </div>
        
        <div class="text-sm text-muted" style="margin-bottom: 4px;">
          <strong>Image:</strong> {{ c.image }}
        </div>
        
        <div class="text-sm text-muted" style="margin-bottom: 4px;">
          <strong>Ports:</strong> {{ formatPorts(c.ports) }}
        </div>
        
        <div class="text-sm text-muted" style="margin-bottom: 12px;">
          <strong>Status:</strong> {{ c.status }}
        </div>
        
        <div class="flex gap-2">
          <button 
            v-if="c.state !== 'running'" 
            class="btn-start"
            @click="store.startContainer(c.id)"
          >
            Start
          </button>
          <button 
            v-else 
            class="btn-stop"
            @click="store.stopContainer(c.id)"
          >
            Stop
          </button>
          <button 
            class="btn-remove"
            @click="store.removeContainer(c.id, false)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
