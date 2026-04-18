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
  tags: string[]
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

export type ViewMode = 'graph' | 'containers' | 'networks' | 'images' | 'volumes'
