export interface Container {
  id: string
  names: string[]
  image: string
  state: string
  status: string
  created: number
  ports: Port[]
}

export interface Port {
  ip: string
  private_port: number
  public_port: number
  type: string
}

export interface Network {
  id: string
  name: string
  driver: string
  scope: string
  containers: NetworkEndpoint[]
}

export interface NetworkEndpoint {
  id: string
  name: string
  ipv4_address: string
  ipv6_address: string
  mac_address: string
  container_id: string
}

export interface Image {
  id: string
  size: number
  created: number
  repo_tags: string[]
}

export interface Volume {
  name: string
  driver: string
  mountpoint: string
  labels: Record<string, string>
  created_at: string
}

export interface GraphNode {
  id: string
  type: 'container' | 'network'
  label: string
  data: Container | Network
}

export interface GraphLink {
  source: string
  target: string
  type: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

// --- Project & Deploy types ---

export interface Project {
  id: string
  name: string
  network_id: string
  containers: number
}

export interface CreateProjectRequest {
  name: string
  gitUrl?: string
  dockerImage?: string
}

export interface DeployJob {
  project_name: string
  git_url: string
  network_id: string
  status: DeployStatus
  error?: string
  started_at: number
  finished_at?: number
}

export type DeployStatus =
  | 'pending'
  | 'cloning'
  | 'building'
  | 'starting'
  | 'done'
  | 'failed'

export interface TunnelRequest {
  token: string
}

// --- Container Inspect types (subset of Docker ContainerJSON) ---

export interface ContainerInspect {
  Id: string
  Name: string
  State: ContainerState
  Config: ContainerConfig
  NetworkSettings: ContainerNetworkSettings
  Mounts: ContainerMount[]
}

export interface ContainerState {
  Status: string
  Running: boolean
  Pid: number
  StartedAt: string
  FinishedAt: string
}

export interface ContainerConfig {
  Image: string
  Env: string[]
  Cmd: string[] | null
  ExposedPorts: Record<string, object> | null
  Labels: Record<string, string>
}

export interface ContainerNetworkSettings {
  Networks: Record<string, ContainerNetwork>
}

export interface ContainerNetwork {
  NetworkID: string
  IPAddress: string
  Gateway: string
}

export interface ContainerMount {
  Type: string
  Source: string
  Destination: string
  Mode: string
  RW: boolean
}

export type ViewMode =
  | 'dashboard'
  | 'projects'
  | 'containers'
  | 'images'
  | 'tunnels'
