'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AGENT_MAP } from '@/lib/agents'
import { AgentRound1, AgentRound2, AgentRound3, AgentId } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  agentId: AgentId
  round1?: AgentRound1
  round2?: AgentRound2
  round3?: AgentRound3
  isLoading?: boolean
  loadingPhase?: 1 | 2 | 3
  index: number
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.3)' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function ConfidenceBar({ value, color, label }: { value: number; color: string; label?: string }) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs" style={{ color: '#8888A0' }}>{label}</p>}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <span className="text-xs tabular-nums" style={{ color, fontFamily: 'var(--font-mono)', minWidth: '32px' }}>
          {value}%
        </span>
      </div>
    </div>
  )
}

function CitationBadge({ claim, sources, color }: { claim: string; sources: string[]; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-1.5">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-start gap-2 text-left w-full group"
      >
        <div className="w-1 h-1 rounded-full mt-1.5 shrink-0 transition-all" style={{ background: color }} />
        <p className="text-xs leading-snug flex-1" style={{ color: '#8888A0' }}>{claim}</p>
        {sources.length > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ background: `${color}18`, color, fontFamily: 'var(--font-mono)', fontSize: '9px' }}
          >
            [{sources.length}]
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-3 mt-1 overflow-hidden"
          >
            {sources.map((src, i) => (
              <p key={i} className="text-xs py-0.5 pl-2" style={{ color: '#57E4FF', borderLeft: '2px solid rgba(87,228,255,0.3)' }}>
                📎 {src}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AgentCard({ agentId, round1, round2, round3, isLoading, loadingPhase, index }: Props) {
  const agent = AGENT_MAP[agentId]
  const [showR2, setShowR2] = useState(false)
  const hasR1 = !!round1
  const hasR2 = !!round2
  const hasR3 = !!round3

  // Pulse animation when actively processing
  const isPulsing = isLoading && !hasR1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden relative group"
      style={{
        background: agent.bgColor,
        border: `1px solid ${agent.color}${hasR3 ? '55' : hasR1 ? '33' : '18'}`,
        transition: 'border-color 0.4s, box-shadow 0.4s',
        boxShadow: hasR3 ? `0 0 20px ${agent.color}12` : 'none',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${agent.color}, ${agent.color}44, transparent)` }}
      />

      {/* Pulse overlay when loading */}
      {isPulsing && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          animate={{ opacity: [0, 0.08, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: agent.color }}
        />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg relative"
              style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}33` }}
            >
              {agent.icon}
              {isPulsing && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ background: agent.color }}
                />
              )}
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: agent.color, fontFamily: 'var(--font-syne)' }}>
                {agent.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#8888A0' }}>{agent.title}</p>
            </div>
          </div>

          {/* Round badges */}
          <div className="flex flex-col items-end gap-1">
            {hasR3 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(180,255,87,0.12)', color: '#B4FF57', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>
                ✓ ROUND 3
              </span>
            )}
            {hasR2 && !hasR3 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${agent.color}18`, color: agent.color, fontFamily: 'var(--font-mono)', fontSize: '9px' }}>
                ✓ ROUND 2
              </span>
            )}
            {hasR1 && !hasR2 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${agent.color}12`, color: agent.color, fontFamily: 'var(--font-mono)', fontSize: '9px' }}>
                ✓ ROUND 1
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && !hasR1 && (
          <div>
            <p className="text-xs mb-2" style={{ color: '#8888A0' }}>
              {loadingPhase === 1 ? 'Forming initial position…' : loadingPhase === 2 ? 'Challenging assumptions…' : 'Revising position…'}
            </p>
            <TypingDots />
          </div>
        )}

        {/* Round 1 content */}
        {hasR1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* One-liner */}
            <p className="text-xs font-semibold mb-2 italic leading-snug" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>
              &ldquo;{round1.one_liner}&rdquo;
            </p>

            {/* Position */}
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#CCCCDD' }}>
              {round1.position}
            </p>

            {/* Claims with citations */}
            <div className="mb-3">
              {round1.key_claims.map((claim, i) => {
                const citation = round1.citations?.find(c => c.claim === claim) ?? round1.citations?.[i]
                return (
                  <CitationBadge
                    key={i}
                    claim={claim}
                    sources={citation?.supportingEvidence ?? []}
                    color={agent.color}
                  />
                )
              })}
            </div>

            {/* Confidence bar */}
            <ConfidenceBar value={round1.confidence} color={agent.color} />
          </motion.div>
        )}

        {/* Round 2 toggle button */}
        {hasR2 && (
          <button
            onClick={() => setShowR2(v => !v)}
            className="mt-3 text-xs flex items-center gap-1 transition-opacity hover:opacity-100 opacity-60"
            style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}
          >
            {showR2 ? '▲' : '▼'} Round 2: {showR2 ? 'Hide' : 'Show'} challenges
          </button>
        )}

        {/* Round 2 content (collapsible) */}
        <AnimatePresence>
          {hasR2 && showR2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 overflow-hidden"
            >
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agent.color}18` }}>
                <p className="text-xs font-bold mb-1.5" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>ASSUMPTIONS CHALLENGED</p>
                {round2.challenged_assumptions.slice(0, 2).map((a, i) => (
                  <p key={i} className="text-xs mb-1" style={{ color: '#8888A0' }}>⚡ {a}</p>
                ))}
                {round2.fallacies_identified[0] && (
                  <>
                    <p className="text-xs font-bold mt-2 mb-1" style={{ color: '#FFD557', fontFamily: 'var(--font-mono)' }}>FALLACY DETECTED</p>
                    <p className="text-xs" style={{ color: '#8888A0' }}>⚠ {round2.fallacies_identified[0]}</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Round 3 revision */}
        {hasR3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="mt-3 pt-3"
            style={{ borderTop: `1px solid ${agent.color}18` }}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>
                FINAL POSITION
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: round3.held_firm ? 'rgba(87,255,184,0.12)' : 'rgba(255,213,87,0.12)',
                  color: round3.held_firm ? '#57FFB8' : '#FFD557',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {round3.held_firm ? '⚓ HELD FIRM' : '🔄 REVISED'}
              </span>
              {round3.confidence_delta !== 0 && (
                <span
                  className="text-xs"
                  style={{
                    color: round3.confidence_delta > 0 ? '#57FFB8' : '#FF8557',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                  }}
                >
                  {round3.confidence_delta > 0 ? '+' : ''}{round3.confidence_delta}%
                </span>
              )}
            </div>

            <p className="text-xs leading-relaxed mb-2" style={{ color: '#AAAACC' }}>
              {round3.revised_position}
            </p>

            {round3.strongest_claim && (
              <div className="p-2 rounded-lg mb-2" style={{ background: `${agent.color}08`, border: `1px solid ${agent.color}20` }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color: agent.color, fontFamily: 'var(--font-mono)', fontSize: '9px' }}>STRONGEST CLAIM</p>
                <p className="text-xs" style={{ color: '#CCCCDD' }}>{round3.strongest_claim}</p>
              </div>
            )}

            {round3.agreements.length > 0 && (
              <p className="text-xs" style={{ color: '#57FFB8' }}>
                ✓ Agreed: {round3.agreements[0]}
              </p>
            )}

            <div className="mt-2">
              <ConfidenceBar value={round3.final_confidence} color={agent.color} label="Final confidence" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
