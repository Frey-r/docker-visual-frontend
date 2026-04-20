import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '../api/client'
import type {
  Container,
  Network,
  Image,
  Volume,
  GraphData,
  ViewMode,
  Project,
  DeployJob,
  ContainerInspect,
} from '../types'

export const useDockerStore = defineStore('docker', () => {
  // --- State ---
  const containers = ref<Container[]>([])
  const networks = ref<Network[]>([])
  const images = ref<Image[]>([])
  const volumes = ref<Volume[]>([])
  const projects = ref<Project[]>([])
  const deployJobs = ref<DeployJob[]>([])
  const graphData = ref<GraphData>({ nodes: [], links: [] })
  const inspectedContainer = ref<ContainerInspect | null>(null)

  // Per-section loading flags (fixes the race condition)
  const loadingContainers = ref(false)
  const loadingNetworks = ref(false)
  const loadingImages = ref(false)
  const loadingVolumes = ref(false)
  const loadingGraph = ref(false)
  const loadingProjects = ref(false)
  const loadingDeploy = ref(false)
  const loadingInspect = ref(false)

  const error = ref<string | null>(null)
  const viewMode = ref<ViewMode>('dashboard')

  // --- Computed ---
  const loading = computed(
    () =>
      loadingContainers.value ||
      loadingNetworks.value ||
      loadingImages.value ||
      loadingVolumes.value ||
      loadingGraph.value ||
      loadingProjects.value ||
      loadingDeploy.value
  )
  const containerCount = computed(() => containers.value.length)
  const runningCount = computed(
    () => containers.value.filter((c) => c.state === 'running').length
  )
  const stoppedCount = computed(
    () => containers.value.filter((c) => c.state === 'exited').length
  )
  const networkCount = computed(() => networks.value.length)
  const imageCount = computed(() => images.value.length)
  const projectCount = computed(() => projects.value.length)

  // --- Fetchers ---

  async function fetchContainers() {
    loadingContainers.value = true
    try {
      containers.value = await apiFetch<Container[]>('/containers')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingContainers.value = false
    }
  }

  async function fetchNetworks() {
    loadingNetworks.value = true
    try {
      networks.value = await apiFetch<Network[]>('/networks')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingNetworks.value = false
    }
  }

  async function fetchImages() {
    loadingImages.value = true
    try {
      images.value = await apiFetch<Image[]>('/images')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingImages.value = false
    }
  }

  async function fetchVolumes() {
    loadingVolumes.value = true
    try {
      volumes.value = await apiFetch<Volume[]>('/volumes')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingVolumes.value = false
    }
  }

  async function fetchGraph() {
    loadingGraph.value = true
    try {
      graphData.value = await apiFetch<GraphData>('/graph')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingGraph.value = false
    }
  }

  async function fetchProjects() {
    loadingProjects.value = true
    try {
      projects.value = await apiFetch<Project[]>('/projects')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingProjects.value = false
    }
  }

  async function fetchDeployJobs() {
    loadingDeploy.value = true
    try {
      deployJobs.value = await apiFetch<DeployJob[]>('/deploy/jobs')
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loadingDeploy.value = false
    }
  }

  async function fetchDeployStatus(name: string): Promise<DeployJob | null> {
    try {
      return await apiFetch<DeployJob>(`/deploy/status/${encodeURIComponent(name)}`)
    } catch {
      return null
    }
  }

  async function inspectContainer(id: string) {
    loadingInspect.value = true
    try {
      inspectedContainer.value = await apiFetch<ContainerInspect>(
        `/containers/${encodeURIComponent(id)}`
      )
    } catch (e) {
      error.value = (e as Error).message
      inspectedContainer.value = null
    } finally {
      loadingInspect.value = false
    }
  }

  // --- Actions ---

  async function startContainer(id: string) {
    try {
      await apiFetch(`/containers/${encodeURIComponent(id)}/start`, { method: 'POST' })
      await fetchContainers()
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function stopContainer(id: string) {
    try {
      await apiFetch(`/containers/${encodeURIComponent(id)}/stop`, { method: 'POST' })
      await fetchContainers()
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function removeContainer(id: string, force = false) {
    try {
      await apiFetch(`/containers/${encodeURIComponent(id)}?force=${force}`, {
        method: 'DELETE',
      })
      await fetchContainers()
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function createProject(name: string, gitUrl: string) {
    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: { name, gitUrl },
      })
      await fetchProjects()
      await fetchDeployJobs()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  async function createTunnel(projectName: string, token: string) {
    try {
      await apiFetch(`/projects/${encodeURIComponent(projectName)}/tunnel`, {
        method: 'POST',
        body: { token },
      })
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  async function fetchAll() {
    error.value = null
    await Promise.all([fetchContainers(), fetchNetworks(), fetchGraph()])
  }

  function setViewMode(mode: ViewMode) {
    viewMode.value = mode
  }

  function clearError() {
    error.value = null
  }

  function clearInspect() {
    inspectedContainer.value = null
  }

  return {
    // State
    containers,
    networks,
    images,
    volumes,
    projects,
    deployJobs,
    graphData,
    inspectedContainer,
    loading,
    loadingContainers,
    loadingNetworks,
    loadingImages,
    loadingVolumes,
    loadingGraph,
    loadingProjects,
    loadingDeploy,
    loadingInspect,
    error,
    viewMode,
    // Computed
    containerCount,
    runningCount,
    stoppedCount,
    networkCount,
    imageCount,
    projectCount,
    // Fetchers
    fetchContainers,
    fetchNetworks,
    fetchImages,
    fetchVolumes,
    fetchGraph,
    fetchProjects,
    fetchDeployJobs,
    fetchDeployStatus,
    inspectContainer,
    fetchAll,
    // Actions
    startContainer,
    stopContainer,
    removeContainer,
    createProject,
    createTunnel,
    setViewMode,
    clearError,
    clearInspect,
  }
})
