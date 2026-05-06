import { useState, useEffect, useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import api from '../utils/api'
import { motion } from 'framer-motion'
import { RefreshCw, X, Maximize2 } from 'lucide-react'
import { SkeletonText } from '../components/Skeleton'

export default function KnowledgeGraph() {
  const graphRef = useRef()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    loadGraph()
  }, [])

  const loadGraph = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/graph/full')
      setGraphData(res.data.graph)
      setStats(res.data.stats)
    } catch (err) {
      console.error('Failed to load graph:', err)
    } finally {
      setLoading(false)
    }
  }

  const getNodeColor = (node) => {
    const colors = {
      paper: '#2563eb',
      theme: '#d97706',
      author: '#7c3aed',
      unknown: '#999',
    }
    return colors[node.type] || colors.unknown
  }

  const getNodeSize = (node) => {
    if (node.type === 'theme') return 14
    if (node.type === 'paper') return 6 + Math.min((node.citation_count || 0) / 10, 10)
    return 4
  }

  const getLinkColor = () => '#e5e5e5'

  const filteredData = useCallback(() => {
    if (filter === 'all') return graphData

    const filteredNodes = graphData.nodes.filter(n => {
      if (filter === 'papers') return n.type === 'paper' || n.type === 'theme'
      if (filter === 'themes') return n.type === 'theme'
      if (filter === 'authors') return n.type === 'author' || n.type === 'paper'
      return true
    })

    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = graphData.links.filter(
      l => nodeIds.has(l.source?.id || l.source) && nodeIds.has(l.target?.id || l.target)
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }, [graphData, filter])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <SkeletonText width="200px" height="24px" />
          <div className="mt-2">
            <SkeletonText width="320px" height="12px" />
          </div>
        </div>
        <div className="relative overflow-hidden bg-white border border-[#eee] rounded-2xl h-96">
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 bg-[#e5e5e5]/30" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Knowledge Graph</h1>
            <p className="text-[#888] text-sm mt-1">Visual map of paper relationships and citation networks</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="flex items-center gap-1.5 bg-white border border-[#eee] text-[#555] px-3 py-2 rounded-xl text-xs font-medium hover:border-[#ddd] transition-all"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={loadGraph}
              className="flex items-center gap-1.5 bg-white border border-[#eee] text-[#555] px-3 py-2 rounded-xl text-xs font-medium hover:border-[#ddd] transition-all"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="flex gap-3 mb-4 flex-wrap">
            <span className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#555] font-medium">
              {stats.total_nodes} nodes
            </span>
            <span className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#555] font-medium">
              {stats.total_edges} edges
            </span>
            {stats.node_types && Object.entries(stats.node_types).map(([type, count]) => (
              <span key={type} className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#888]">
                {type}: {count}
              </span>
            ))}
            {stats.density > 0 && (
              <span className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#888] font-mono">
                density: {stats.density}
              </span>
            )}
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex gap-1.5 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'papers', label: 'Papers & Themes' },
            { id: 'themes', label: 'Themes Only' },
            { id: 'authors', label: 'Authors' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.id
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#eee] text-[#888] hover:text-[#555] hover:border-[#ddd]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Graph */}
        <div
          className={`bg-white border border-[#eee] rounded-2xl overflow-hidden transition-all ${
            fullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
          }`}
          style={{ height: fullscreen ? 'auto' : '550px' }}
        >
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-white border border-[#eee] rounded-xl p-2 shadow-sm hover:shadow-md transition-all"
            >
              <X size={16} className="text-[#555]" />
            </button>
          )}

          {graphData.nodes.length > 0 ? (
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredData()}
              nodeLabel={(node) => `${node.label} (${node.type})`}
              nodeColor={getNodeColor}
              nodeRelSize={1}
              nodeVal={getNodeSize}
              linkColor={getLinkColor}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={0.8}
              onNodeClick={(node) => setSelectedNode(node)}
              backgroundColor="#ffffff"
              linkWidth={1}
              linkOpacity={0.4}
              cooldownTicks={100}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const size = getNodeSize(node)
                const color = getNodeColor(node)

                // Draw node
                ctx.beginPath()
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
                ctx.fillStyle = color
                ctx.fill()

                // Draw label for themes and high-citation papers
                if (node.type === 'theme' || (node.type === 'paper' && (node.citation_count || 0) > 50)) {
                  const label = node.label?.slice(0, 25) || ''
                  const fontSize = node.type === 'theme' ? 11 / globalScale : 9 / globalScale
                  ctx.font = `${fontSize}px Inter, sans-serif`
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'top'
                  ctx.fillStyle = '#555'
                  ctx.fillText(label, node.x, node.y + size + 2)
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-14 h-14 bg-[#2563eb]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🕸️</span>
                </div>
                <p className="text-sm font-medium text-[#555] mb-1">No data in knowledge graph yet</p>
                <p className="text-xs text-[#aaa]">Run a research pipeline to populate the graph</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected node detail */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white border border-[#eee] rounded-xl p-5"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  selectedNode.type === 'paper' ? 'bg-[#2563eb]/10 text-[#2563eb]' :
                  selectedNode.type === 'theme' ? 'bg-[#d97706]/10 text-[#d97706]' :
                  'bg-[#7c3aed]/10 text-[#7c3aed]'
                }`}>
                  {selectedNode.type}
                </span>
                <h3 className="font-medium text-sm mt-2">{selectedNode.label}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#ccc] hover:text-[#888] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-[#888]">
              {selectedNode.year && <span>📅 {selectedNode.year}</span>}
              {selectedNode.citation_count > 0 && <span>📊 {selectedNode.citation_count} citations</span>}
            </div>
            {selectedNode.description && (
              <p className="text-xs text-[#666] mt-2 leading-relaxed">{selectedNode.description}</p>
            )}
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex gap-5 mt-4 text-xs text-[#888]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" /> Papers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" /> Themes
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" /> Authors
          </span>
        </div>
      </motion.div>
    </div>
  )
}
