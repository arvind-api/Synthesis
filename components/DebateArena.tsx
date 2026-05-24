'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { AGENTS } from '@/lib/agents'
import AgentCard from './AgentCard'
import { DebateState } from '@/lib/types'

interface Props { state: DebateState }

const PHASES = [
  { key: 'retrieving', label: 'Evidence', sub: 'RAG retrieval' },
  { key: 'round1', label: 'Round 1', sub: 'Initial positions' },
  { key: 'round2', label: 'Round 2', sub: 'Challenge & fallacies' },
  { key: 'round3', label: 'Round 3', sub: 'Defend & revise' },
  { key: 'consensus', label: 'Synthesis', sub: 'Weighted consensus' },
]

function PhaseBar({ current }: { current: DebateState['phase'] }) {
  const phaseOrder = ['retrieving', 'round1', 'round2', 'round3', 'consensus', 'complete']
  const idx = phaseOrder.indexOf(current)
  const mappedIdx = Math.min(idx, PHASES.length - 1)

  return (
    <div className="flex items-start justify-center gap-0 mb-8 overflow-x-auto pb-2">
      {PHASES.map((p, i) => {
        const isActive = i === mappedIdx
        const isDone = i < mappedIdx || current === 'complete'
        return (
          <div key={p.key} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1 min-w-[64px]">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                style={{
                  background: isDone ? '#B4FF57' : isActive ? 'rgba(180,255,87,0.15)' : 'rgba(255,255,255,0.05)',
                  color: isDone ? '#030305' : isActive ? '#B4FF57' : '#44445A',
                  boxShadow: isActive ? '0 0 20px rgba(180,255,87,0.4)' : 'none',
                  border: isActive ? '1px solid rgba(180,255,87,0.5)' : '1px solid transparent',
                  fontFamily: 'var(--font-syne)',
                }}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold" style={{ color: isDone || isActive ? '#EEEEF8' : '#44445A', fontFamily: 'var(--font-syne)' }}>
                  {p.label}
                </p>
                <p className="text-xs" style={{ color: '#44445A' }}>{p.sub}</p>
              </div>
            </div>
            {i < PHASES.length - 1 && (
              <div
                className="w-12 h-px mx-2 mt-[-16px] transition-all duration-500"
                style={{ background: i < mappedIdx ? '#B4FF57' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function LoadingMessage({ phase }: { phase: DebateState['phase'] }) {
  const messages: Partial<Record<DebateState['phase'], string>> = {
    retrieving: '🔍 Retrieving evidence from Wikipedia & web sources…',
    round1: '⚡ 9 agents forming independent positions in parallel…',
    round2: '⚔️ Agents challenging assumptions and identifying fallacies…',
    round3: '🛡️ Agents defending strongest claims and revising confidence…',
    consensus: '🧬 Weighted consensus engine synthesizing all positions…',
  }
  const msg = messages[phase]
  if (!msg) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(180,255,87,0.06)', border: '1px solid rgba(180,255,87,0.15)' }}>
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ background: '#B4FF57', boxShadow: '0 0 8px rgba(180,255,87,0.6)' }}
        />
        <p className="text-xs" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>{msg}</p>
      </div>
    </motion.div>
  )
}

function EvidenceBanner({ evidence }: { evidence: DebateState['evidence'] }) {
  if (!evidence.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-4 rounded-2xl"
      style={{ background: 'rgba(87,228,255,0.04)', border: '1px solid rgba(87,228,255,0.15)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#57E4FF', boxShadow: '0 0 6px #57E4FF' }} />
        <p className="text-xs font-bold tracking-widest" style={{ color: '#57E4FF', fontFamily: 'var(--font-mono)' }}>
          EVIDENCE RETRIEVED ({evidence.length} sources)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {evidence.slice(0, 4).map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-start gap-2">
              <span className="text-xs" style={{ color: ev.type === 'opposing' ? '#FF8557' : '#57FFB8' }}>
                {ev.type === 'supporting' ? '📗' : ev.type === 'opposing' ? '📕' : '📘'}
              </span>
              <div className="flex-1 min-w-0">
                <a
                  href={ev.sourceURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#57E4FF' }}
                >
                  {ev.sourceTitle.slice(0, 35)}…
                </a>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: '#8888A0' }}>
                  {ev.claim.slice(0, 100)}…
                </p>
              </div>
              <span className="text-xs shrink-0" style={{ color: '#57FFB8', fontFamily: 'var(--font-mono)' }}>
                {ev.confidence}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function DebateArena({ state }: Props) {
  const { phase, round1Results, round2Results, round3Results, evidence } = state
  const isRunning = !['idle', 'complete', 'error'].includes(phase)
  const isComplete = phase === 'complete'

  const loadingPhase = phase === 'round1' ? 1 : phase === 'round2' ? 2 : 3

  return (
    <div>
      {/* Phase progress bar */}
      {(isRunning || isComplete) && <PhaseBar current={phase} />}

      {/* Loading message */}
      {isRunning && <LoadingMessage phase={phase} />}

      {/* Evidence panel */}
      {evidence.length > 0 && <EvidenceBanner evidence={evidence} />}

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {AGENTS.map((agent, i) => {
            const r1 = round1Results.find(r => r.agentId === agent.id)
            const r2 = round2Results.find(r => r.agentId === agent.id)
            const r3 = round3Results.find(r => r.agentId === agent.id)
            const isLoading = isRunning && !r1

            return (
              <AgentCard
                key={agent.id}
                agentId={agent.id}
                round1={r1}
                round2={r2}
                round3={r3}
                isLoading={isLoading}
                loadingPhase={loadingPhase}
                index={i}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
