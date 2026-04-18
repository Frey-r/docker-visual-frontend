<script setup lang="ts">
import { useDockerStore } from '../stores/docker'

const store = useDockerStore()
</script>

<template>
  <div style="padding: 16px;">
    <h2 class="text-lg" style="margin-bottom: 16px;">Networks</h2>
    
    <div v-if="store.loading" class="text-muted">Loading...</div>
    
    <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));">
      <div v-for="net in store.networks" :key="net.id" class="card">
        <div class="text-lg" style="margin-bottom: 8px;">{{ net.name }}</div>
        
        <div class="text-sm text-muted" style="margin-bottom: 4px;">
          <strong>Driver:</strong> {{ net.driver }}
        </div>
        
        <div class="text-sm text-muted" style="margin-bottom: 4px;">
          <strong>Scope:</strong> {{ net.scope }}
        </div>
        
        <div class="text-sm text-muted" style="margin-bottom: 8px;">
          <strong>ID:</strong> 
          <code style="font-size: 11px;">{{ net.id.substring(0, 19) }}</code>
        </div>
        
        <div v-if="net.containers && net.containers.length > 0">
          <div class="text-sm" style="margin-bottom: 4px;">
            <strong>Connected Containers:</strong>
          </div>
          <div v-for="ct in net.containers" :key="ct.id" class="text-sm text-muted" style="margin-left: 12px;">
            • {{ ct.name || ct.id.substring(0, 12) }} ({{ ct.ipv4_address }})
          </div>
        </div>
        <div v-else class="text-sm text-muted">
          No connected containers
        </div>
      </div>
    </div>
  </div>
</template>
