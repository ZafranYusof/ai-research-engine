import { useState, useEffect, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

export default function KnowledgeGraph() {
  const graphRef = useRef()
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [selectedNode, setSelectedNode] = useState(null)

  // Demo data - replace with API call
  useEffect(() => {
    setGraphData({
      nodes: [
        { id: '1', label: 'Attention Is All You Need', group: 'seminal', year: 2017 },
        { id: '2', label: 'BERT', group: 'model', year: 2018 },
        { id: '3', label: 'GPT-2', group: 'model', year: 2019 },
        { id: '4', label: 'T5', group: 'model', year: 2019 },
        { id: '5', label: 'GPT-3', group: 'model', year: 2020 },
      ],
      links: [
        { source: '1', target: '2' },
        { source: '1', target: '3' },
        { source: '1', target: '4' },
        { source: '3', target: '5' },
        { source: '2', target: '4' },
      ],
    })
  }, [])

  const getNodeColor = (node) => {
    const colors = {
      seminal: '#10b981',
      model: '#3b82f6',
      method: '#f59e0b',
      dataset: '#ef4444',
    }
    return colors[node.group] || '#6b7280'
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Knowledge Graph</h1>
      <p className="text-gray-400 mb-6">Visual map of paper relationships and citation networks</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" style={{ height: '600px' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="label"
          nodeColor={getNodeColor}
          nodeRelSize={8}
          linkColor={() => '#374151'}
          linkDirectionalArrowLength={6}
          onNodeClick={(node) => setSelectedNode(node)}
          backgroundColor="#111827"
        />
      </div>

      {selectedNode && (
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-emerald-400">{selectedNode.label}</h3>
          <p className="text-sm text-gray-400">Year: {selectedNode.year}</p>
          <p className="text-sm text-gray-400">Type: {selectedNode.group}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Seminal</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> Model</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Method</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Dataset</span>
      </div>
    </div>
  )
}
