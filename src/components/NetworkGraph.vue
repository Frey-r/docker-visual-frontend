<script setup lang="ts">
import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue'
import { useDockerStore } from '../stores/docker'
import * as d3 from 'd3'

const store = useDockerStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let simulation: d3.Simulation<any, any> | null = null
let animFrame: number | null = null

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  type: 'container' | 'network'
  label: string
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: string
}

let nodes: SimNode[] = []
let links: SimLink[] = []

function getNodeColor(type: string) {
  return type === 'network' ? '#6366f1' : '#10b981'
}

function getNodeRadius(type: string) {
  return type === 'network' ? 20 : 14
}

function buildGraph() {
  const data = store.graphData
  if (!data || data.nodes.length === 0) return
  
  nodes = data.nodes.map(n => ({ ...n }))
  links = data.links.map(l => ({
    source: l.source,
    target: l.target,
    type: l.type,
  }))

  if (simulation) simulation.stop()

  const canvas = canvasRef.value
  if (!canvas) return

  const width = canvas.parentElement?.clientWidth || 800
  const height = canvas.parentElement?.clientHeight || 500
  canvas.width = width * 2
  canvas.height = height * 2
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width, height))
    .force('collision', d3.forceCollide().radius(30))
    .on('tick', draw)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.save()
  ctx.scale(2, 2)

  // Clear
  ctx.fillStyle = '#0a0e17'
  ctx.fillRect(0, 0, w, h)

  // Draw links
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)'
  ctx.lineWidth = 1.5
  for (const link of links) {
    const source = link.source as SimNode
    const target = link.target as SimNode
    if (source.x == null || target.x == null) continue
    ctx.beginPath()
    ctx.moveTo(source.x, source.y!)
    ctx.lineTo(target.x, target.y!)
    ctx.stroke()
  }

  // Draw nodes
  for (const node of nodes) {
    if (node.x == null) continue
    const r = getNodeRadius(node.type)
    const color = getNodeColor(node.type)

    // Glow
    ctx.shadowColor = color
    ctx.shadowBlur = 12

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x, node.y!, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'

    // Icon
    ctx.fillStyle = '#fff'
    ctx.font = `${r * 0.8}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.type === 'network' ? '🕸' : '📦', node.x, node.y!)

    // Label
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(node.label, node.x, node.y! + r + 6)
  }

  ctx.restore()
}

watch(() => store.graphData, () => {
  nextTick(() => buildGraph())
}, { deep: true })

onMounted(() => {
  nextTick(() => buildGraph())
})

onUnmounted(() => {
  if (simulation) simulation.stop()
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div class="graph-container" style="position: relative;">
    <canvas ref="canvasRef" style="display: block; width: 100%; height: 100%;"></canvas>
    <div v-if="nodes.length === 0" class="empty-state" style="position: absolute; inset: 0;">
      <div class="empty-state-icon">🕸️</div>
      <div class="empty-state-title">No topology data</div>
      <div class="empty-state-desc">Start some containers to see the network graph.</div>
    </div>
  </div>
</template>
