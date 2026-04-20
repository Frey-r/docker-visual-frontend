<script setup lang="ts">
import { useDockerStore } from '../stores/docker'
import ContainerDetail from './ContainerDetail.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { ref } from 'vue'

const store = useDockerStore()

const showDetail = ref(false)
const confirmAction = ref<{ id: string; name: string } | null>(null)

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

function openDetail(id: string) {
  store.inspectContainer(id)
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  store.clearInspect()
}

function requestRemove(id: string, name: string) {
  confirmAction.value = { id, name }
}

async function confirmRemove() {
  if (confirmAction.value) {
    await store.removeContainer(confirmAction.value.id, false)
    confirmAction.value = null
  }
}
</script>

<template>
  <div class="view-enter">
    <div class="view-title">
      <h2>📦 Containers</h2>
      <span class="text-sm text-muted">{{ store.containerCount }} total</span>
    </div>

    <div v-if="store.loadingContainers" class="flex items-center justify-center" style="padding: 60px;">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.containers.length === 0" class="empty-state">
      <div class="empty-state-icon">📦</div>
      <div class="empty-state-title">No containers found</div>
      <div class="empty-state-desc">Create a project to deploy your first container.</div>
    </div>

    <div v-else class="grid" style="grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));">
      <div
        v-for="c in store.containers"
        :key="c.id"
        class="card"
        style="cursor: pointer;"
        @click="openDetail(c.id)"
      >
        <div class="flex justify-between items-center" style="margin-bottom: 10px;">
          <span style="font-weight: 600; font-size: 1rem;">{{ getContainerName(c.names) }}</span>
          <span :class="['badge', getBadgeClass(c.state)]">{{ c.state }}</span>
        </div>

        <div class="text-sm text-muted" style="margin-bottom: 4px;">
          <strong>Image:</strong> {{ c.image }}
        </div>

        <div class="text-sm text-muted" style="margin-bottom: 4px;">
          <strong>Ports:</strong> {{ formatPorts(c.ports) }}
        </div>

        <div class="text-sm text-muted" style="margin-bottom: 14px;">
          <strong>Status:</strong> {{ c.status }}
        </div>

        <div class="flex gap-2" @click.stop>
          <button
            v-if="c.state !== 'running'"
            class="btn-success btn-sm"
            @click="store.startContainer(c.id)"
          >
            ▶ Start
          </button>
          <button
            v-else
            class="btn-warning btn-sm"
            @click="store.stopContainer(c.id)"
          >
            ⏹ Stop
          </button>
          <button
            class="btn-danger btn-sm"
            @click="requestRemove(c.id, getContainerName(c.names))"
          >
            🗑 Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Container Detail Modal -->
    <ContainerDetail
      v-if="showDetail"
      @close="closeDetail"
    />

    <!-- Confirm Remove Dialog -->
    <ConfirmDialog
      v-if="confirmAction"
      title="Remove Container"
      :message="`Are you sure you want to remove container '${confirmAction.name}'? This action cannot be undone.`"
      confirm-label="Remove"
      @confirm="confirmRemove"
      @cancel="confirmAction = null"
    />
  </div>
</template>
