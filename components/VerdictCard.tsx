'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConsensusResult } from '@/lib/types'
import { computeWeightedScore, confidenceColor, hallucRisk, hallucColor, truncate } from '@/lib/utils'

interface Props {
  consensus: ConsensusResult
  question: string
  duration_ms?: number
}

function ConfidenceRing({ score, color }: { score: number; color: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200)
    return () => clearTimeout(t)
  }, [score])
  const offset = circ - (animated / 100) * circ

  return (
    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black" style={{ color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
          {animated}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>confidence</div>
      </div>
    </div>
  )
}

export default function VerdictCard({ consensus, question, duration_ms }: Props) {
  const weighted = computeWeightedScore(consensus)
  const color = confidenceColor(weighted)
  const risk = hallucRisk(consensus.weighted_claims)
  const rColor = hallucColor(risk)
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${color}30`, background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${color}06 100%)`, backdropFilter: 'blur(20px)' }}
    >
      {/* Accent line */}
      <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="text-xs font-bold tracking-widest" style={{ color, fontFamily: 'var(--font-mono)' }}>
                VERDICT
              </span>
              {duration_ms && (
                <span className="text-xs ml-2" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
                  {(duration_ms / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#8888A0' }}>
              <span style={{ color: '#EEEEF8' }}>Question: </span>{truncate(question, 120)}
            </p>
            <p className="text-sm leading-relaxed font-medium" style={{ color: '#EEEEF8', lineHeight: 1.6 }}>
              Current evidence {consensus.synthesis.toLowerCase().startsWith('the') ? 'suggests' : 'suggests that'}{' '}
              {consensus.synthesis}
            </p>
          </div>
          <ConfidenceRing score={weighted} color={color} />
        </div>

        {/* Scoring breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Evidence quality', val: '35%', color: '#57C4FF' },
            { label: 'Agent agreement', val: '20%', color: '#C057FF' },
            { label: 'Source reliability', val: '25%', color: '#57FFB8' },
          ].map(({ label, val, color: c }) => (
            <div key={label} className="p-2 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-bold" style={{ color: c, fontFamily: 'var(--font-mono)' }}>{val}</div>
              <div className="text-xs mt-0.5" style={{ color: '#44445A' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Hallucination risk */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
          style={{ background: `${rColor}08`, border: `1px solid ${rColor}20` }}>
          <span className="text-xs font-bold" style={{ color: rColor, fontFamily: 'var(--font-mono)' }}>
            HALLUCINATION RISK: {risk.toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: '#8888A0' }}>
            {risk === 'Low' ? 'Claims well-supported by agent consensus' : risk === 'Medium' ? 'Some claims require verification' : 'Review flagged claims before deciding'}
          </span>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between py-1 transition-all"
          style={{ color: '#8888A0' }}>
          <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-syne)' }}>
            {open ? 'Hide details' : 'Show findings'}
          </span>
          <span className="text-xs" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden">
              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* High confidence */}
                <div>
                  <p className="text-xs font-bold tracking-wider mb-2" style={{ color: '#57FFB8', fontFamily: 'var(--font-syne)' }}>
                    HIGH CONFIDENCE
                  </p>
                  <div className="space-y-1.5">
                    {consensus.agreed.slice(0, 3).map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs shrink-0 mt-0.5" style={{ color: '#57FFB8' }}>✓</span>
                        <p className="text-xs leading-snug" style={{ color: '#AAAACC' }}>{truncate(a, 80)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contested */}
                <div>
                  <p className="text-xs font-bold tracking-wider mb-2" style={{ color: '#FFD557', fontFamily: 'var(--font-syne)' }}>
                    CONTESTED
                  </p>
                  <div className="space-y-1.5">
                    {consensus.contested.slice(0, 3).map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs shrink-0 mt-0.5" style={{ color: '#FFD557' }}>⚠</span>
                        <p className="text-xs leading-snug" style={{ color: '#AAAACC' }}>{truncate(c, 80)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minority + recommendation */}
                <div>
                  <p className="text-xs font-bold tracking-wider mb-2" style={{ color: '#FF8557', fontFamily: 'var(--font-syne)' }}>
                    MINORITY POSITION
                  </p>
                  <p className="text-xs leading-snug mb-3" style={{ color: '#AAAACC' }}>
                    ⚠ {truncate(consensus.biggest_blind_spot, 120)}
                  </p>
                  <div className="p-2.5 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                    <p className="text-xs font-semibold mb-1" style={{ color }}>Recommended action</p>
                    <p className="text-xs leading-snug" style={{ color: '#8888A0' }}>
                      {truncate(consensus.recommendation, 140)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
