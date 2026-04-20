<script setup lang="ts">
import type { DeployStatus } from '../types'

const props = defineProps<{
  status: DeployStatus
  error?: string
}>()

const steps: { key: DeployStatus; label: string; icon: string }[] = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'cloning', label: 'Cloning', icon: '📥' },
  { key: 'building', label: 'Building', icon: '🔨' },
  { key: 'starting', label: 'Starting', icon: '▶️' },
  { key: 'done', label: 'Done', icon: '✅' },
]

const statusOrder: DeployStatus[] = ['pending', 'cloning', 'building', 'starting', 'done']

function getStepState(stepKey: DeployStatus): 'done' | 'active' | 'failed' | 'pending' {
  if (props.status === 'failed') {
    const currentIdx = statusOrder.indexOf(stepKey)
    const failedAtIdx = statusOrder.length - 1 // we don't know exact fail point
    // Mark completed steps as done and last active as failed
    if (currentIdx < failedAtIdx) return 'done'
    return 'failed'
  }

  const currentIdx = statusOrder.indexOf(props.status)
  const stepIdx = statusOrder.indexOf(stepKey)

  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return props.status === 'done' ? 'done' : 'active'
  return 'pending'
}
</script>

<template>
  <div>
    <div class="deploy-steps">
      <template v-for="(step, idx) in steps" :key="step.key">
        <div :class="['deploy-step', getStepState(step.key)]">
          <span class="step-icon">
            {{ getStepState(step.key) === 'done' ? '✓' : (idx + 1) }}
          </span>
          <span>{{ step.label }}</span>
        </div>
        <div
          v-if="idx < steps.length - 1"
          :class="['deploy-step-connector', { done: getStepState(steps[idx + 1].key) === 'done' || getStepState(step.key) === 'done' }]"
        ></div>
      </template>
    </div>
    <div v-if="error" class="text-sm" style="color: var(--danger); margin-top: 8px;">
      ❌ {{ error }}
    </div>
  </div>
</template>
