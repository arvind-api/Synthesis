'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { GraphData, GraphNode, GraphEdge } from '@/lib/types'

interface Props { data: GraphData; width?: number; height?: number }

type FilterMode = 'all' | 'claims' | 'agents' | 'consensus' | 'evidence'

const FILTER_LABELS: Record<FilterMode, string> = {
  all: 'All nodes',
  claims: 'Claims only',
  agents: 'Agent interactions',
  consensus: 'Consensus only',
  evidence: 'Evidence only',
}

export default function ArgumentGraph({ data, width = 500, height = 440 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [focusNode, setFocusNode] = useState<string | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const resetZoom = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)
    }
  }, [])

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Filter nodes based on mode
    const filteredNodeIds = new Set(
      data.nodes.filter(n => {
        if (filter === 'all') return true
        if (filter === 'claims') return n.type === 'claim' || n.type === 'question'
        if (filter === 'agents') return n.type === 'agent' || n.type === 'question'
        if (filter === 'consensus') return n.type === 'consensus' || n.type === 'question' || n.type === 'agent'
        if (filter === 'evidence') return n.type === 'evidence' || n.type === 'question'
        return true
      }).map(n => n.id)
    )

    // Focus mode: only show connected nodes
    const activeIds = focusNode
      ? new Set([
          focusNode,
          ...data.edges
            .filter(e => {
              const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
              const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
              return s === focusNode || t === focusNode
            })
            .flatMap(e => [
              typeof e.source === 'string' ? e.source : (e.source as GraphNode).id,
              typeof e.target === 'string' ? e.target : (e.target as GraphNode).id,
            ]),
          'q0',
        ])
      : filteredNodeIds

    const visibleIds = focusNode ? activeIds : filteredNodeIds

    const nodes: (GraphNode & d3.SimulationNodeDatum)[] = data.nodes
      .filter(n => visibleIds.has(n.id))
      .map(n => ({ ...n }))
    const nodeById = new Map(nodes.map(n => [n.id, n]))

    const links = data.edges
      .filter(e => {
        const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
        const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
        return visibleIds.has(s) && visibleIds.has(t)
      })
      .map(e => ({
        ...e,
        source: nodeById.get(typeof e.source === 'string' ? e.source : (e.source as GraphNode).id) ?? e.source,
        target: nodeById.get(typeof e.target === 'string' ? e.target : (e.target as GraphNode).id) ?? e.target,
      }))
      .filter(e => e.source && e.target)

    const defs = svg.append('defs')
    const gf = defs.append('filter').attr('id', 'glow2')
    gf.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur')
    const gm = gf.append('feMerge')
    gm.append('feMergeNode').attr('in', 'blur')
    gm.append('feMergeNode').attr('in', 'SourceGraphic')

    const mkArrow = (id: string, col: string) => {
      defs.append('marker').attr('id', id).attr('viewBox', '0 -4 8 8')
        .attr('refX', 16).attr('refY', 0).attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', col)
    }
    mkArrow('arr-sup', 'rgba(87,255,184,0.5)')
    mkArrow('arr-con', 'rgba(255,87,87,0.6)')
    mkArrow('arr-ref', 'rgba(255,213,87,0.4)')
    mkArrow('arr-mem', 'rgba(255,255,255,0.12)')
    mkArrow('arr-cit', 'rgba(87,228,255,0.4)')

    const sim = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: d3.SimulationNodeDatum) => (d as GraphNode).id).distance(d => {
        const edge = d as GraphEdge
        return edge.type === 'member' ? 90 : edge.type === 'consensus' ? 70 : 80
      }).strength(0.45))
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.07))
      .force('collision', d3.forceCollide().radius((d: d3.SimulationNodeDatum) => ((d as GraphNode).size ?? 10) + 14))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03))

    const container = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', e => container.attr('transform', e.transform))
    svg.call(zoom)
    zoomRef.current = zoom

    // Links
    const link = container.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', d => {
        const e = d as GraphEdge
        if (e.type === 'supports') return 'rgba(87,255,184,0.35)'
        if (e.type === 'contradicts') return 'rgba(255,87,87,0.4)'
        if (e.type === 'refines') return 'rgba(255,213,87,0.3)'
        if (e.type === 'cites') return 'rgba(87,228,255,0.3)'
        return 'rgba(255,255,255,0.07)'
      })
      .attr('stroke-width', d => (d as GraphEdge).weight ?? 1)
      .attr('stroke-dasharray', d => {
        const e = d as GraphEdge
        return e.type === 'contradicts' ? '4,3' : e.type === 'refines' ? '2,2' : 'none'
      })
      .attr('marker-end', d => {
        const e = d as GraphEdge
        if (e.type === 'member') return 'url(#arr-mem)'
        if (e.type === 'contradicts') return 'url(#arr-con)'
        if (e.type === 'cites') return 'url(#arr-cit)'
        if (e.type === 'refines') return 'url(#arr-ref)'
        return 'url(#arr-sup)'
      })

    // Nodes
    const node = container.append('g').selectAll('g').data(nodes).enter().append('g')
      .style('cursor', 'pointer')
      .on('click', (_, d) => setFocusNode(prev => prev === d.id ? null : d.id))
      .call(
        d3.drag<SVGGElement, GraphNode & d3.SimulationNodeDatum>()
          .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y })
          .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )

    // Outer glow ring for important nodes
    node.filter(d => d.type === 'question' || d.type === 'consensus')
      .append('circle')
      .attr('r', d => (d.size ?? 10) + 9)
      .attr('fill', 'none')
      .attr('stroke', d => d.color ?? '#EEEEF8')
      .attr('stroke-width', 1)
      .attr('opacity', 0.12)

    // Main circle
    node.append('circle')
      .attr('r', d => d.size ?? 10)
      .attr('fill', d => {
        const isFocused = !focusNode || focusNode === d.id || data.edges.some(e => {
          const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id
          const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id
          return (s === focusNode && t === d.id) || (t === focusNode && s === d.id)
        })
        if (!isFocused) return 'rgba(255,255,255,0.02)'
        if (d.type === 'question') return 'rgba(238,238,248,0.08)'
        if (d.type === 'consensus') return 'rgba(180,255,87,0.1)'
        if (d.type === 'evidence') return 'rgba(87,228,255,0.08)'
        return `${d.color}18`
      })
      .attr('stroke', d => {
        if (d.id === focusNode) return '#B4FF57'
        return d.color ?? 'rgba(255,255,255,0.15)'
      })
      .attr('stroke-width', d => {
        if (d.id === focusNode) return 2.5
        if (d.type === 'question') return 2
        return 1
      })
      .attr('filter', d => ['question', 'consensus'].includes(d.type) ? 'url(#glow2)' : null)

    // Labels
    node.append('text')
      .text(d => d.label?.slice(0, 26) ?? '')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (d.size ?? 10) + 13)
      .attr('fill', d => d.type === 'question' ? '#EEEEF8' : d.type === 'consensus' ? '#B4FF57' : d.color ?? '#8888A0')
      .attr('font-size', d => d.type === 'question' ? 9 : d.type === 'agent' ? 8.5 : 7.5)
      .attr('font-family', 'var(--font-outfit)')
      .attr('opacity', d => (!focusNode || d.id === focusNode) ? 0.85 : 0.3)

    // Confidence indicator on agent nodes
    node.filter(d => d.type === 'agent' && !!d.confidence)
      .append('text')
      .text(d => `${d.confidence}%`)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', d => d.color ?? '#EEEEF8')
      .attr('font-size', 7)
      .attr('font-family', 'var(--font-mono)')
      .attr('opacity', 0.7)

    // Animate entrance
    node.attr('opacity', 0)
      .transition().duration(400).delay((_, i) => i * 30).attr('opacity', 1)
    link.attr('opacity', 0)
      .transition().duration(350).delay(250).attr('opacity', 1)

    sim.on('tick', () => {
      link
        .attr('x1', d => Math.max(12, Math.min(width - 12, (d.source as GraphNode & d3.SimulationNodeDatum).x ?? width / 2)))
        .attr('y1', d => Math.max(12, Math.min(height - 12, (d.source as GraphNode & d3.SimulationNodeDatum).y ?? height / 2)))
        .attr('x2', d => Math.max(12, Math.min(width - 12, (d.target as GraphNode & d3.SimulationNodeDatum).x ?? width / 2)))
        .attr('y2', d => Math.max(12, Math.min(height - 12, (d.target as GraphNode & d3.SimulationNodeDatum).y ?? height / 2)))
      node.attr('transform', d =>
        `translate(${Math.max(22, Math.min(width - 22, d.x ?? width / 2))},${Math.max(22, Math.min(height - 22, d.y ?? height / 2))})`)
    })

    return () => { sim.stop() }
  }, [data, filter, focusNode, width, height])

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex gap-1 flex-wrap flex-1">
          {(Object.keys(FILTER_LABELS) as FilterMode[]).map(f => (
            <button key={f} onClick={() => { setFilter(f); setFocusNode(null) }}
              className="px-2.5 py-1 rounded-lg text-xs transition-all duration-200"
              style={{
                background: filter === f ? 'rgba(180,255,87,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === f ? 'rgba(180,255,87,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === f ? '#B4FF57' : '#8888A0',
                fontFamily: 'var(--font-mono)',
              }}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {focusNode && (
            <button onClick={() => setFocusNode(null)}
              className="px-2.5 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(255,133,87,0.1)', border: '1px solid rgba(255,133,87,0.3)', color: '#FF8557', fontFamily: 'var(--font-mono)' }}>
              Exit focus
            </button>
          )}
          <button onClick={resetZoom}
            className="px-2.5 py-1 rounded-lg text-xs transition-all hover:text-[#EEEEF8]"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8888A0', fontFamily: 'var(--font-mono)' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex items-center gap-4 flex-wrap"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {[
          { color: 'rgba(87,255,184,0.6)', label: 'Supports', dash: false },
          { color: 'rgba(255,87,87,0.6)', label: 'Contradicts', dash: true },
          { color: '#B4FF57', label: 'Consensus', dash: false },
          { color: 'rgba(87,228,255,0.6)', label: 'Evidence', dash: false },
        ].map(({ color, label, dash }) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width="14" height="5"><line x1="0" y1="2.5" x2="14" y2="2.5" stroke={color}
              strokeWidth="1.5" strokeDasharray={dash ? '3,2' : 'none'} /></svg>
            <span style={{ color: '#44445A', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{label}</span>
          </div>
        ))}
        <span style={{ color: '#44445A', fontSize: '9px', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
          Click node to focus · Drag to move · Scroll to zoom
        </span>
      </div>

      {!data.nodes.length && (
        <div className="flex items-center justify-center" style={{ width, height }}>
          <p style={{ color: '#44445A', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            Graph renders after synthesis
          </p>
        </div>
      )}

      <svg ref={svgRef} width={width} height={height}
        style={{ display: data.nodes.length ? 'block' : 'none', cursor: 'grab' }} />
    </div>
  )
}
