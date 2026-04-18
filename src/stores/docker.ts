import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Container, Network, Image, Volume, GraphData, ViewMode } from '../types'

const API = '/api'

export const useDockerStore = defineStore('docker', () => {
  const containers = ref<Container[]>([])
  const networks = ref<Network[]>([])
  const images = ref<Image[]>([])
  const volumes = ref<Volume[]>([])
  const graphData = ref<GraphData>({ nodes: [], links: [] })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const viewMode = ref<ViewMode>('graph')

  const containerCount = computed(() => containers.value.length)
  const runningCount = computed(() => containers.value.filter(c => c.state === 'running').length)
  const networkCount = computed(() => networks.value.length)
  const imageCount = computed(() => images.value.length)

  async function fetchContainers() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/containers`)
      if (!res.ok) throw new Error('Failed to fetch containers')
      containers.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchNetworks() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/networks`)
      if (!res.ok) throw new Error('Failed to fetch networks')
      networks.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchImages() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/images`)
      if (!res.ok) throw new Error('Failed to fetch images')
      images.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchVolumes() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/volumes`)
      if (!res.ok) throw new Error('Failed to fetch volumes')
      volumes.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchGraph() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/graph`)
      if (!res.ok) throw new Error('Failed to fetch graph data')
      graphData.value = await res.json()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function startContainer(id: string) {
    try {
      const res = await fetch(`${API}/containers/${id}/start`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to start container')
      await fetchContainers()
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function stopContainer(id: string) {
    try {
      const res = await fetch(`${API}/containers/${id}/stop`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to stop container')
      await fetchContainers()
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function removeContainer(id: string, force = false) {
    try {
      const res = await fetch(`${API}/containers/${id}?force=${force}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove container')
      await fetchContainers()
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function fetchAll() {
    await Promise.all([fetchContainers(), fetchNetworks(), fetchGraph()])
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  return {
    containers,
    networks,
    images,
    volumes,
    graphData,
    loading,
    error,
    viewMode,
    containerCount,
    runningCount,
    networkCount,
    imageCount,
    fetchContainers,
    fetchNetworks,
    fetchImages,
    fetchVolumes,
    fetchGraph,
    fetchAll,
    startContainer,
    stopContainer,
    removeContainer,
    setViewMode
  }
})
