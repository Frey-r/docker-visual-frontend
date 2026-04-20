<script setup lang="ts">
import { onMounted } from 'vue'
import { useDockerStore } from '../stores/docker'

const store = useDockerStore()

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

function formatTags(tags: string[] | null | undefined): string {
  if (!tags || tags.length === 0) return 'untagged'
  return tags.filter(t => t !== '<none>:<none>').join(', ') || 'untagged'
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(() => {
  if (store.images.length === 0) {
    store.fetchImages()
  }
})
</script>

<template>
  <div class="view-enter">
    <div class="view-title">
      <h2>💿 Images</h2>
      <div class="flex gap-2 items-center">
        <span class="text-sm text-muted">{{ store.imageCount }} total</span>
        <button class="btn-secondary btn-sm" @click="store.fetchImages()">
          ↻ Refresh
        </button>
      </div>
    </div>

    <div v-if="store.loadingImages" class="flex items-center justify-center" style="padding: 60px;">
      <div class="spinner"></div>
    </div>

    <div v-else-if="store.images.length === 0" class="empty-state">
      <div class="empty-state-icon">💿</div>
      <div class="empty-state-title">No images found</div>
      <div class="empty-state-desc">Pull a Docker image or create a project to build one.</div>
    </div>

    <div v-else>
      <div class="card-static" style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tags</th>
              <th>Image ID</th>
              <th>Size</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="img in store.images" :key="img.id">
              <td>
                <div style="max-width: 400px;">
                  <span class="text-sm" style="font-weight: 500;">{{ formatTags(img.repo_tags) }}</span>
                </div>
              </td>
              <td>
                <code class="text-mono text-muted">{{ img.id.substring(7, 19) }}</code>
              </td>
              <td>
                <span class="text-sm">{{ formatSize(img.size) }}</span>
              </td>
              <td>
                <span class="text-sm text-muted">{{ formatDate(img.created) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
