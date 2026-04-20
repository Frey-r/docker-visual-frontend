<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-content" style="max-width: 440px;">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="emit('cancel')">✕</button>
      </div>

      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">
        {{ message }}
      </p>

      <div class="flex gap-2 justify-between" style="flex-direction: row-reverse;">
        <button class="btn-danger" @click="emit('confirm')">
          {{ confirmLabel || 'Confirm' }}
        </button>
        <button class="btn-secondary" @click="emit('cancel')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
