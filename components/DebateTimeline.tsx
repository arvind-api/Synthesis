'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DebateState } from '@/lib/types'
import { AGENT_MAP } from '@/lib/agents'
import { truncate } from '@/lib/utils'

interface Props { state: DebateState }

const ROUNDS = [
  { key: 'round1', label: 'Round 1', sub: 'Initial Positions', icon: '⚡' },
  { key: 'round2', label: 'Round 2', sub: 'Cross-Examination', icon: '⚔️' },
  { key: 'round3', label: 'Round 3', sub: 'Defense & Revision', icon: '🔄' },
]

const PHASE_ORDER = ['retrieving', 'round1', 'round2', 'round3', 'consensus', 'complete']

function roundIndex(phase: string) {
  return PHASE_ORDER.indexOf(phase)
}

export default function DebateTimeline({ state }: Props) {
  const [openRound, setOpenRound] = useState<string | null>('round3')
  const currentIdx = roundIndex(state.phase)

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <p className="text-xs font-bold tracking-widest px-2" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
          DEBATE TRANSCRIPT
        </p>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Horizontal round selector */}
      <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-1">
        {ROUNDS.map((r, i) => {
          const rIdx = roundIndex(r.key)
          const isDone = currentIdx > rIdx
          const isActive = state.phase === r.key
          const isReachable = isDone || isActive
          const isOpen = openRound === r.key

          return (
            <div key={r.key} className="flex items-center shrink-0">
              <button
                onClick={() => isReachable && setOpenRound(isOpen ? null : r.key)}
                disabled={!isReachable}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: isOpen ? `rgba(180,255,87,0.08)` : isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: isOpen ? '1px solid rgba(180,255,87,0.25)' : '1px solid transparent',
                  opacity: isReachable ? 1 : 0.35,
                  cursor: isReachable ? 'pointer' : 'not-allowed',
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: isDone ? '#B4FF57' : isActive ? 'rgba(180,255,87,0.2)' : 'rgba(255,255,255,0.06)',
                      color: isDone ? '#030305' : isActive ? '#B4FF57' : '#44445A',
                      fontFamily: 'var(--font-syne)',
                    }}>
                    {isDone ? '✓' : r.icon}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: isOpen ? '#B4FF57' : isReachable ? '#EEEEF8' : '#44445A', fontFamily: 'var(--font-syne)' }}>
                    {r.label}
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#44445A' }}>{r.sub}</span>
              </button>
              {i < ROUNDS.length - 1 && (
                <div className="w-8 h-px mx-1" style={{ background: isDone ? 'rgba(180,255,87,0.3)' : 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          )
        })}

        {/* Consensus */}
        {(() => {
          const isConsensus = state.phase === 'consensus' || state.phase === 'complete'
          const isOpen = openRound === 'consensus'
          return (
            <>
              <div className="w-8 h-px mx-1" style={{ background: isConsensus ? 'rgba(180,255,87,0.3)' : 'rgba(255,255,255,0.06)' }} />
              <button
                onClick={() => isConsensus && setOpenRound(isOpen ? null : 'consensus')}
                disabled={!isConsensus}
                className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-200 shrink-0"
                style={{
                  background: isOpen ? 'rgba(180,255,87,0.08)' : 'transparent',
                  border: isOpen ? '1px solid rgba(180,255,87,0.25)' : '1px solid transparent',
                  opacity: isConsensus ? 1 : 0.35,
                  cursor: isConsensus ? 'pointer' : 'not-allowed',
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: state.phase === 'complete' ? '#B4FF57' : 'rgba(180,255,87,0.2)', color: state.phase === 'complete' ? '#030305' : '#B4FF57' }}>
                    {state.phase === 'complete' ? '✓' : '🧬'}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: isOpen ? '#B4FF57' : isConsensus ? '#EEEEF8' : '#44445A', fontFamily: 'var(--font-syne)' }}>
                    Synthesis
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#44445A' }}>Consensus</span>
              </button>
            </>
          )
        })()}
      </div>

      {/* Round content panels */}
      <AnimatePresence mode="wait">
        {openRound === 'round1' && state.round1Results.length > 0 && (
          <motion.div key="r1" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {state.round1Results.map((r, i) => {
                const agent = AGENT_MAP[r.agentId]
                return (
                  <motion.div key={r.agentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: agent.bgColor, border: `1px solid ${agent.color}22` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{agent.icon}</span>
                      <span className="text-xs font-bold" style={{ color: agent.color, fontFamily: 'var(--font-syne)' }}>{agent.name}</span>
                      <span className="ml-auto text-xs font-bold" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>{r.confidence}%</span>
                    </div>
                    <p className="text-xs italic mb-2" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>"{truncate(r.one_liner, 80)}"</p>
                    <p className="text-xs leading-snug" style={{ color: '#AAAACC' }}>{truncate(r.position, 160)}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {openRound === 'round2' && state.round2Results.length > 0 && (
          <motion.div key="r2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {state.round2Results.map((r, i) => {
                const agent = AGENT_MAP[r.agentId]
                return (
                  <motion.div key={r.agentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: agent.bgColor, border: `1px solid ${agent.color}22` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{agent.icon}</span>
                      <span className="text-xs font-bold" style={{ color: agent.color, fontFamily: 'var(--font-syne)' }}>{agent.name}</span>
                    </div>
                    {r.challenged_assumptions.slice(0, 2).map((a, j) => (
                      <p key={j} className="text-xs leading-snug mb-1" style={{ color: '#AAAACC' }}>⚡ {truncate(a, 100)}</p>
                    ))}
                    {r.strongest_opposing_argument && (
                      <p className="text-xs mt-2 leading-snug" style={{ color: '#FFD557' }}>
                        ★ {truncate(r.strongest_opposing_argument, 100)}
                      </p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {openRound === 'round3' && state.round3Results.length > 0 && (
          <motion.div key="r3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {state.round3Results.map((r, i) => {
                const agent = AGENT_MAP[r.agentId]
                return (
                  <motion.div key={r.agentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ background: agent.bgColor, border: `1px solid ${agent.color}22` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{agent.icon}</span>
                      <span className="text-xs font-bold" style={{ color: agent.color, fontFamily: 'var(--font-syne)' }}>{agent.name}</span>
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: r.held_firm ? 'rgba(87,255,184,0.12)' : 'rgba(255,213,87,0.12)', color: r.held_firm ? '#57FFB8' : '#FFD557', fontSize: '10px' }}>
                        {r.held_firm ? 'HELD' : 'REVISED'}
                      </span>
                    </div>
                    <p className="text-xs leading-snug mb-1.5" style={{ color: '#AAAACC' }}>{truncate(r.revised_position, 150)}</p>
                    {r.final_confidence && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${r.final_confidence}%`, background: agent.color }} />
                        </div>
                        <span className="text-xs" style={{ color: agent.color, fontFamily: 'var(--font-mono)' }}>{r.final_confidence}%</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {openRound === 'consensus' && state.consensus && (
          <motion.div key="cons" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}>
            <div className="p-4 rounded-xl mb-4"
              style={{ background: 'rgba(180,255,87,0.05)', border: '1px solid rgba(180,255,87,0.15)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#B4FF57', fontFamily: 'var(--font-syne)' }}>
                STRONGEST ARGUMENT
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#AAAACC' }}>{state.consensus.strongest_argument}</p>
            </div>
            <div className="p-4 rounded-xl"
              style={{ background: 'rgba(255,133,87,0.05)', border: '1px solid rgba(255,133,87,0.15)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#FF8557', fontFamily: 'var(--font-syne)' }}>
                BIGGEST BLIND SPOT
              </p>
              <p className="text-xs leading-relaxed" style={{ color: '#AAAACC' }}>{state.consensus.biggest_blind_spot}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
