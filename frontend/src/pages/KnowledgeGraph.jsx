import { useState, useEffect, useRef, useCallback } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import api from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, Maximize2, Crown, ToggleLeft, ToggleRight } from 'lucide-react'
import { SkeletonText } from '../components/Skeleton'

export default function KnowledgeGraph() {
  const graphRef = useRef()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [fullscreen, setFullscreen] = useState(false)

  // PageRank state
  const [influentialPapers, setInfluentialPapers] = useState([])
  const [pagerankData, setPagerankData] = useState([])
  const [showPageRank, setShowPageRank] = useState(false)
  const [loadingPageRank, setLoadingPageRank] = useState(false)

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

  const loadPageRank = async () => {
    setLoadingPageRank(true)
    try {
      const [prRes, infRes] = await Promise.all([
        api.get('/api/graph/pagerank'),
        api.get('/api/graph/influential'),
      ])
      setPagerankData(prRes.data.papers || [])
      setInfluentialPapers(infRes.data.papers || [])
    } catch (err) {
      console.error('Failed to load PageRank:', err)
    } finally {
      setLoadingPageRank(false)
    }
  }

  // Load PageRank data when section is first shown
  useEffect(() => {
    if (influentialPapers.length === 0 && !loadingPageRank && graphData.nodes.length > 0) {
      loadPageRank()
    }
  }, [graphData.nodes.length])

  const getNodeColor = (node) => {
    // Highlight influential papers when PageRank toggle is on
    if (showPageRank && node.type === 'paper') {
      const prEntry = pagerankData.find(p => p.id === node.id)
      if (prEntry) {
        const rank = pagerankData.indexOf(prEntry)
        if (rank < 3) return '#f59e0b' // Gold for top 3
        if (rank < 10) return '#8b5cf6' // Purple for top 10
        return '#3b82f6' // Blue for rest of top 20
      }
    }

    const colors = {
      paper: '#2563eb',
      theme: '#d97706',
      author: '#7c3aed',
      unknown: '#999',
    }
    return colors[node.type] || colors.unknown
  }

  const getNodeSize = (node) => {
    // Resize by PageRank when toggle is on
    if (showPageRank && node.type === 'paper') {
      const prEntry = pagerankData.find(p => p.id === node.id)
      if (prEntry) {
        const maxScore = pagerankData[0]?.score || 1
        const normalized = prEntry.score / maxScore
        return 6 + normalized * 20 // Scale between 6 and 26
      }
    }

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
        <div className="relative overflow-hidden bg-white border border-[#eee] rounded-2xl h-96 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
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
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">Knowledge Graph</h1>
            <p className="text-[#888] text-sm mt-1">Visual map of paper relationships and citation networks</p>
          </div>
          <div className="flex gap-2">
            {/* PageRank Toggle */}
            <button
              onClick={() => setShowPageRank(!showPageRank)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                showPageRank
                  ? 'bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#d97706]'
                  : 'bg-white border border-[#eee] text-[#555] dark:text-[#ccc] hover:border-[#ddd] dark:bg-[#1a1a1a] dark:border-[#2a2a2a]'
              }`}
            >
              {showPageRank ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              PageRank
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="flex items-center gap-1.5 bg-white border border-[#eee] text-[#555] dark:text-[#ccc] px-3 py-2 rounded-xl text-xs font-medium hover:border-[#ddd] transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={loadGraph}
              className="flex items-center gap-1.5 bg-white border border-[#eee] text-[#555] dark:text-[#ccc] px-3 py-2 rounded-xl text-xs font-medium hover:border-[#ddd] transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="flex gap-3 mb-4 flex-wrap">
            <span className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#555] dark:text-[#ccc] font-medium dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              {stats.total_nodes} nodes
            </span>
            <span className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#555] dark:text-[#ccc] font-medium dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              {stats.total_edges} edges
            </span>
            {stats.node_types && Object.entries(stats.node_types).map(([type, count]) => (
              <span key={type} className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#888] dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                {type}: {count}
              </span>
            ))}
            {stats.density > 0 && (
              <span className="text-[11px] bg-white border border-[#eee] px-3 py-1.5 rounded-full text-[#888] font-mono dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
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
                  ? 'bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]'
                  : 'bg-white border border-[#eee] text-[#888] hover:text-[#555] dark:text-[#ccc] hover:border-[#ddd] dark:bg-[#1a1a1a] dark:border-[#2a2a2a]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Graph */}
        <div
          className={`bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl overflow-hidden transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a] ${
            fullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
          }`}
          style={{ height: fullscreen ? 'auto' : '550px' }}
        >
          {fullscreen && (
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 z-10 bg-white border border-[#eee] rounded-xl p-2 shadow-sm hover:shadow-md transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
            >
              <X size={16} className="text-[#555] dark:text-[#ccc]" />
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
              backgroundColor={document.documentElement.classList.contains("dark") ? "#1a1a1a" : "#ffffff"}
              linkWidth={1}
              linkOpacity={0.4}
              cooldownTicks={100}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const size = getNodeSize(node)
                const color = getNodeColor(node)

                // Glow effect for influential papers when PageRank is on
                if (showPageRank && node.type === 'paper') {
                  const prEntry = pagerankData.find(p => p.id === node.id)
                  if (prEntry && pagerankData.indexOf(prEntry) < 5) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI)
                    ctx.fillStyle = color + '30'
                    ctx.fill()
                  }
                }

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
                <p className="text-sm font-medium text-[#555] dark:text-[#ccc] mb-1">No data in knowledge graph yet</p>
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
            className="mt-4 bg-white border border-[#eee] rounded-xl p-5 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
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
              <p className="text-xs text-[#666] dark:text-[#bbb] mt-2 leading-relaxed">{selectedNode.description}</p>
            )}
          </motion.div>
        )}

        {/* Influential Papers Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crown size={16} className="text-[#f59e0b]" />
            <h2 className="text-sm font-semibold">Influential Papers</h2>
            {loadingPageRank && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-3 h-3 border border-[#ccc] border-t-[#2563eb] rounded-full"
              />
            )}
          </div>

          {influentialPapers.length > 0 ? (
            <div className="space-y-2">
              {influentialPapers.map((paper, i) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="bg-white border border-[#eee] rounded-xl p-4 hover:border-[#ddd] hover:shadow-sm transition-all dark:bg-[#1a1a1a] dark:border-[#2a2a2a]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded">
                          #{i + 1}
                        </span>
                        <h3 className="font-medium text-sm truncate">{paper.title}</h3>
                      </div>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-[#888]">
                        {paper.year && <span>📅 {paper.year}</span>}
                        <span>📊 {paper.citation_count} citations</span>
                      </div>
                      <p className="text-[10px] text-[#666] dark:text-[#bbb] mt-1.5 italic">{paper.reason}</p>
                    </div>
                    {/* Score bar */}
                    <div className="w-24 shrink-0">
                      <div className="flex justify-between text-[9px] text-[#888] mb-1">
                        <span>Score</span>
                        <span className="font-mono">{(paper.combined_score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden dark:bg-[#222]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${paper.combined_score * 100}%` }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                          className="h-2 rounded-full"
                          style={{
                            background: i < 3
                              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                              : 'linear-gradient(90deg, #8b5cf6, #6d28d9)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !loadingPageRank ? (
            <div className="bg-white border border-[#eee] rounded-xl p-8 text-center dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <p className="text-sm text-[#888]">No papers in graph yet</p>
              <p className="text-xs text-[#aaa] mt-1">Run a research pipeline to analyze paper influence</p>
            </div>
          ) : null}
        </motion.div>

        {/* PageRank Rankings */}
        {pagerankData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <h2 className="text-sm font-semibold mb-3">PageRank Rankings (Top 20)</h2>
            <div className="bg-white border border-[#eee] rounded-xl overflow-hidden dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
              <div className="divide-y divide-[#eee] dark:divide-[#2a2a2a]">
                {pagerankData.map((paper, i) => (
                  <div key={paper.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafaf9] transition-colors dark:hover:bg-[#222]">
                    <span className={`text-[10px] font-bold w-5 text-center ${
                      i < 3 ? 'text-[#f59e0b]' : 'text-[#888]'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{paper.title}</p>
                      <div className="flex gap-2 mt-0.5 text-[9px] text-[#aaa]">
                        {paper.year && <span>{paper.year}</span>}
                        <span>{paper.citation_count} cites</span>
                        {paper.connected_themes?.length > 0 && (
                          <span>· {paper.connected_themes.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-16 shrink-0">
                      <div className="w-full bg-[#f0f0f0] rounded-full h-1.5 dark:bg-[#222]">
                        <div
                          className="h-1.5 rounded-full bg-[#2563eb]"
                          style={{ width: `${(paper.score / (pagerankData[0]?.score || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#888] w-12 text-right">
                      {(paper.score * 1000).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
          {showPageRank && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Top 3 PageRank
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" /> Top 10 PageRank
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
