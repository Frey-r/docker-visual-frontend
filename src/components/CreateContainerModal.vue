<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDockerStore } from '../stores/docker'
import type { CreateContainerRequest, PortMapping, VolumeMapping } from '../types'

const props = defineProps<{
  show: boolean
  imageName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const store = useDockerStore()

const containerName = ref('')
const restartPolicy = ref('no')
const creating = ref(false)
const errorMsg = ref('')

// Environment variables
const envVars = ref<{ key: string; value: string }[]>([])

// Port mappings
const ports = ref<{ hostPort: string; containerPort: string; protocol: string }[]>([])

// Volume mappings
const volumes = ref<{ hostPath: string; containerPath: string; readOnly: boolean }[]>([])

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    containerName.value = ''
    restartPolicy.value = 'no'
    envVars.value = []
    ports.value = []
    volumes.value = []
    errorMsg.value = ''
    creating.value = false
  }
})

function addEnvVar() {
  envVars.value.push({ key: '', value: '' })
}

function removeEnvVar(index: number) {
  envVars.value.splice(index, 1)
}

function addPort() {
  ports.value.push({ hostPort: '', containerPort: '', protocol: 'tcp' })
}

function removePort(index: number) {
  ports.value.splice(index, 1)
}

function addVolume() {
  volumes.value.push({ hostPath: '', containerPath: '', readOnly: false })
}

function removeVolume(index: number) {
  volumes.value.splice(index, 1)
}

const canSubmit = computed(() => {
  return props.imageName && !creating.value
})

async function handleCreate() {
  if (!canSubmit.value) return
  
  creating.value = true
  errorMsg.value = ''

  try {
    // Build environment map
    const envMap: Record<string, string> = {}
    for (const env of envVars.value) {
      if (env.key.trim()) {
        envMap[env.key.trim()] = env.value
      }
    }

    // Build port mappings
    const portMappings: PortMapping[] = []
    for (const p of ports.value) {
      if (p.hostPort && p.containerPort) {
        portMappings.push({
          host_port: parseInt(p.hostPort, 10),
          container_port: parseInt(p.containerPort, 10),
          protocol: p.protocol || 'tcp',
        })
      }
    }

    // Build volume mappings
    const volumeMappings: VolumeMapping[] = []
    for (const v of volumes.value) {
      if (v.hostPath && v.containerPath) {
        volumeMappings.push({
          host_path: v.hostPath,
          container_path: v.containerPath,
          read_only: v.readOnly,
        })
      }
    }

    const req: CreateContainerRequest = {
      image: props.imageName,
      name: containerName.value.trim() || undefined,
      env: Object.keys(envMap).length > 0 ? envMap : undefined,
      ports: portMappings.length > 0 ? portMappings : undefined,
      volumes: volumeMappings.length > 0 ? volumeMappings : undefined,
      restart_policy: restartPolicy.value,
    }

    await store.createContainer(req)
    emit('created')
    emit('close')
  } catch (e) {
    errorMsg.value = (e as Error).message
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Create Container</h3>
        <button class="btn-icon" @click="emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Image -->
        <div class="form-group">
          <label>Image</label>
          <input type="text" :value="imageName" disabled class="input-disabled" />
        </div>

        <!-- Container Name -->
        <div class="form-group">
          <label>Container Name (optional)</label>
          <input 
            v-model="containerName" 
            type="text" 
            placeholder="my-container"
            class="input-field"
          />
        </div>

        <!-- Restart Policy -->
        <div class="form-group">
          <label>Restart Policy</label>
          <select v-model="restartPolicy" class="input-field">
            <option value="no">No</option>
            <option value="always">Always</option>
            <option value="unless-stopped">Unless Stopped</option>
            <option value="on-failure">On Failure</option>
          </select>
        </div>

        <!-- Environment Variables -->
        <div class="form-section">
          <div class="section-header">
            <label>Environment Variables</label>
            <button class="btn-sm btn-secondary" @click="addEnvVar">+ Add</button>
          </div>
          <div v-for="(env, idx) in envVars" :key="idx" class="env-row">
            <input 
              v-model="env.key" 
              type="text" 
              placeholder="KEY"
              class="input-field input-sm"
            />
            <span class="env-separator">=</span>
            <input 
              v-model="env.value" 
              type="text" 
              placeholder="value"
              class="input-field input-sm flex-1"
            />
            <button class="btn-icon btn-danger" @click="removeEnvVar(idx)">&times;</button>
          </div>
        </div>

        <!-- Port Mappings -->
        <div class="form-section">
          <div class="section-header">
            <label>Port Mappings</label>
            <button class="btn-sm btn-secondary" @click="addPort">+ Add</button>
          </div>
          <div v-for="(port, idx) in ports" :key="idx" class="port-row">
            <input 
              v-model="port.hostPort" 
              type="number" 
              placeholder="Host"
              class="input-field input-sm"
            />
            <span class="port-separator">:</span>
            <input 
              v-model="port.containerPort" 
              type="number" 
              placeholder="Container"
              class="input-field input-sm"
            />
            <select v-model="port.protocol" class="input-field input-sm">
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
            </select>
            <button class="btn-icon btn-danger" @click="removePort(idx)">&times;</button>
          </div>
        </div>

        <!-- Volume Mappings -->
        <div class="form-section">
          <div class="section-header">
            <label>Volume Mappings</label>
            <button class="btn-sm btn-secondary" @click="addVolume">+ Add</button>
          </div>
          <div v-for="(vol, idx) in volumes" :key="idx" class="volume-row">
            <input 
              v-model="vol.hostPath" 
              type="text" 
              placeholder="Host path"
              class="input-field input-sm"
            />
            <span class="port-separator">:</span>
            <input 
              v-model="vol.containerPath" 
              type="text" 
              placeholder="Container path"
              class="input-field input-sm"
            />
            <label class="checkbox-label">
              <input type="checkbox" v-model="vol.readOnly" />
              RO
            </label>
            <button class="btn-icon btn-danger" @click="removeVolume(idx)">&times;</button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMsg" class="error-message">
          {{ errorMsg }}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="emit('close')">Cancel</button>
        <button 
          class="btn-primary" 
          :disabled="!canSubmit"
          @click="handleCreate"
        >
          <span v-if="creating">Creating...</span>
          <span v-else>Create & Start</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.form-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header label {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.input-field:focus {
  outline: none;
  border-color: var(--accent-color);
}

.input-disabled {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  font-size: 0.95rem;
}

.input-sm {
  padding: 8px 10px;
  font-size: 0.85rem;
}

.env-row, .port-row, .volume-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.env-separator, .port-separator {
  color: var(--text-muted);
  font-weight: bold;
}

.flex-1 {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px 8px;
  line-height: 1;
}

.btn-icon:hover {
  color: var(--text-primary);
}

.btn-danger {
  color: var(--danger-color, #ef4444);
}

.btn-danger:hover {
  color: #dc2626;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 0.9rem;
}
</style>
