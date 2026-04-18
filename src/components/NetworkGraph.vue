<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { VueForceGraph2D } from 'vue-force-graph'
import { useDockerStore } from '../stores/docker'

const store = useDockerStore()
const graphRef = ref<any>(null)

function getNodeColor(node: any) {
  return node.type === 'network' ? '#388bfd' : '#8b949e'
}

function getNodeSize(node: any) {
  return node.type === 'network' ? 6 : 10
}

function getLinkColor() {
  return 'rgba(56, 139, 253, 0.4)'
}

function nodeLabel(node: any) {
  return node.label
}

onMounted(() => {
  if (graphRef.value) {
    const graph = graphRef.value.graphRef
    if (graph) {
      graph.backgroundColor('#0d1117')
      graph.nodeColor(getNodeColor)
      graph.nodeVal(getNodeSize)
      graph.linkColor(getLinkColor)
      graph.linkWidth(2)
      graph.nodeLabel(nodeLabel)
      graph.nodeCanvasObjectMode(() => 'after')
      graph.nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const label = node.label
        const fontSize = 12 / globalScale
        ctx.font = `${fontSize}px Inter, sans-serif`
        ctx.fillStyle = '#8b949e'
        ctx.textAlign = 'center'
        ctx.fillText(label, node.x!, node.y! + fontSize + 4)
      })
    }
  }
})

watch(() => store.graphData, (data) => {
  if (graphRef.value && data.nodes.length > 0) {
    graphRef.value.graphData(data)
  }
}, { deep: true })
</script>

<template>
  <VueForceGraph2D
    ref="graphRef"
    :graph-data="store.graphData"
    class="graph-container"
  />
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: calc(100vh - 120px);
}
</style>
