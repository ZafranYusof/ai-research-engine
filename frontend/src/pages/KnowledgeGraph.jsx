import { useState, useEffect, useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import axios from 'axios'

export default function KnowledgeGraph() {
  const graphRef = useRef()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, papers, themes, authors

  useEffect(() => {
    loadGraph()
  }, [])

  const loadGraph = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/graph/full')
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
      paper: '#10b981',
      theme: '#f59e0b',
      author: '#3b82f6',
      unknown: '#6b7280',
    }
    return colors[node.type] || colors.unknown
  }

  const getNodeSize = (node) => {
    if (node.type === 'theme') return 12
    if (node.type === 'paper') return 6 + Math.min((node.citation_count || 0) / 10, 10)
    return 4
  }

  const getLinkColor = (link) => {
    const colors = {
      cites: '#ef4444',
      authored: '#3b82f6',
      relates_to: '#f59e0b',
    }
    return colors[link.relation] || '#374151'
  }

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
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading knowledge graph...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Graph</h1>
          <p className="text-gray-400 mt-1">Visual map of paper relationships and citation networks</p>
        </div>
        <button
          onClick={loadGraph}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="flex gap-4 mb-4 text-sm">
          <span className="bg-gray-900 px-3 py-1 rounded-lg">
            📊 {stats.total_nodes} nodes
          </span>
          <span className="bg-gray-900 px-3 py-1 rounded-lg">
            🔗 {stats.total_edges} edges
          </span>
          {stats.node_types && Object.entries(stats.node_types).map(([type, count]) => (
            <span key={type} className="bg-gray-900 px-3 py-1 rounded-lg">
              {type}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {['all', 'papers', 'themes', 'authors'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              filter === f
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height: '550px' }}>
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={filteredData()}
            nodeLabel={(node) => `${node.label} (${node.type})`}
            nodeColor={getNodeColor}
            nodeRelSize={1}
            nodeVal={getNodeSize}
            linkColor={getLinkColor}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={0.8}
            onNodeClick={(node) => setSelectedNode(node)}
            backgroundColor="#111827"
            linkWidth={1.5}
            cooldownTicks={100}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">No data in knowledge graph yet</p>
              <p className="text-sm">Run a research pipeline to populate the graph</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedNode.type === 'paper' ? 'bg-emerald-500/20 text-emerald-400' :
                selectedNode.type === 'theme' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {selectedNode.type}
              </span>
              <h3 className="font-semibold text-lg mt-2">{selectedNode.label}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          {selectedNode.year && <p className="text-sm text-gray-400 mt-1">Year: {selectedNode.year}</p>}
          {selectedNode.citation_count > 0 && (
            <p className="text-sm text-gray-400">Citations: {selectedNode.citation_count}</p>
          )}
          {selectedNode.description && (
            <p className="text-sm text-gray-300 mt-2">{selectedNode.description}</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm text-gray-400">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Papers
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500" /> Themes
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Authors
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-red-500" /> Cites
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-0.5 bg-yellow-500" /> Relates to
        </span>
      </div>
    </div>
  )
}
