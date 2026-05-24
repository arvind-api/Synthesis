'use client'
import { motion } from 'framer-motion'
import { ConsensusResult } from '@/lib/types'
import { confidenceColor, confidenceLabel, categoryColor, verdictColor } from '@/lib/utils'

interface Props { consensus: ConsensusResult; duration_ms?: number }

function ClaimList({ items, color, icon }: { items: string[]; color: string; icon: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="flex items-start gap-2.5 p-3 rounded-xl"
          style={{ background: `${color}08`, border: `1px solid ${color}18` }}
        >
          <span className="text-sm shrink-0 mt-0.5">{icon}</span>
          <p className="text-xs leading-relaxed" style={{ color: '#CCCCDD' }}>{item}</p>
        </motion.div>
      ))}
    </div>
  )
}

function WeightedClaimsPanel({ claims }: { claims: ConsensusResult['weighted_claims'] }) {
  if (!claims?.length) return null
  return (
    <div className="mt-6">
      <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#B4FF57', fontFamily: 'var(--font-syne)' }}>
        WEIGHTED CONSENSUS CLAIMS
      </p>
      <div className="space-y-2">
        {claims.slice(0, 6).map((c, i) => {
          const color = categoryColor(c.category)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-3 rounded-xl"
              style={{ background: `${color}08`, border: `1px solid ${color}18` }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-xs leading-snug flex-1" style={{ color: '#CCCCDD' }}>{c.claim}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold"
                  style={{ background: `${color}20`, color, fontFamily: 'var(--font-mono)', fontSize: '9px' }}
                >
                  {c.category.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Confidence bar */}
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${c.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    style={{ background: color }}
                  />
                </div>
                <span className="text-xs tabular-nums" style={{ color, fontFamily: 'var(--font-mono)' }}>{c.confidence}%</span>
                <span className="text-xs" style={{ color: '#57FFB8', fontFamily: 'var(--font-mono)' }}>
                  {c.support_count}✓
                </span>
                <span className="text-xs" style={{ color: '#FF5757', fontFamily: 'var(--font-mono)' }}>
                  {c.opposition_count}✗
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function FactCheckPanel({ checks }: { checks: ConsensusResult['fact_checks'] }) {
  if (!checks?.length) return null
  const iconMap: Record<string, string> = {
    verified: '✅',
    low_confidence: '⚠️',
    possible_hallucination: '🚨',
    insufficient_evidence: '❓',
  }
  return (
    <div className="mt-6">
      <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#FFD557', fontFamily: 'var(--font-syne)' }}>
        ⚡ FACT-CHECK LAYER
      </p>
      <div className="space-y-2">
        {checks.map((fc, i) => {
          const color = verdictColor(fc.verdict)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl flex items-start gap-3"
              style={{ background: `${color}08`, border: `1px solid ${color}22` }}
            >
              <span className="text-base shrink-0">{iconMap[fc.verdict]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1" style={{ color: '#CCCCDD' }}>{fc.claim}</p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ background: `${color}20`, color, fontFamily: 'var(--font-mono)', fontSize: '9px' }}
                  >
                    {fc.verdict.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <p className="text-xs" style={{ color: '#8888A0' }}>{fc.reason}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function ConsensusPanel({ consensus, duration_ms }: Props) {
  const confColor = confidenceColor(consensus.confidence)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(180,255,87,0.2)', background: 'rgba(180,255,87,0.03)' }}
    >
      {/* Top bar */}
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, #B4FF57, #57FFB8, #57E4FF, transparent)' }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                className="w-2 h-2 rounded-full"
                animate={{ boxShadow: ['0 0 4px rgba(180,255,87,0.4)', '0 0 16px rgba(180,255,87,0.8)', '0 0 4px rgba(180,255,87,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: '#B4FF57' }}
              />
              <p className="text-xs font-bold tracking-widest" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
                SYNTHESIS ENGINE v2 — COMPLETE
              </p>
            </div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
              Epistemic Consensus Report
            </h2>
            <p className="text-xs mt-1" style={{ color: '#8888A0' }}>
              9 agents · 3 rounds · Evidence-weighted
            </p>
          </div>
          <div className="flex items-center gap-4">
            {duration_ms && (
              <p className="text-xs" style={{ color: '#8888A0', fontFamily: 'var(--font-mono)' }}>
                {(duration_ms / 1000).toFixed(1)}s analysis
              </p>
            )}
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{ color: confColor, fontFamily: 'var(--font-mono)', lineHeight: 1 }}
              >
                {consensus.confidence}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#8888A0' }}>
                {confidenceLabel(consensus.confidence)} confidence
              </div>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mb-6">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${consensus.confidence}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              style={{ background: `linear-gradient(90deg, ${confColor}, ${confColor}88)` }}
            />
          </div>
        </div>

        {/* Synthesis paragraph */}
        <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#B4FF57', fontFamily: 'var(--font-syne)' }}>
            What the debate revealed
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#CCCCDD' }}>
            {consensus.synthesis}
          </p>
        </div>

        {/* Evidence note */}
        {consensus.evidence_summary && (
          <div className="p-3 rounded-xl mb-6" style={{ background: 'rgba(87,228,255,0.04)', border: '1px solid rgba(87,228,255,0.15)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#57E4FF', fontFamily: 'var(--font-mono)' }}>📚 EVIDENCE INTEGRATION</p>
            <p className="text-xs leading-relaxed" style={{ color: '#8888A0' }}>{consensus.evidence_summary}</p>
          </div>
        )}

        {/* Three-column claims grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs font-bold tracking-wider mb-3" style={{ color: '#57FFB8', fontFamily: 'var(--font-syne)' }}>
              ✓ AGREED ({consensus.agreed.length})
            </p>
            <ClaimList items={consensus.agreed} color="#57FFB8" icon="✓" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider mb-3" style={{ color: '#FFD557', fontFamily: 'var(--font-syne)' }}>
              ⚡ CONTESTED ({consensus.contested.length})
            </p>
            <ClaimList items={consensus.contested} color="#FFD557" icon="⚡" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wider mb-3" style={{ color: '#FF5757', fontFamily: 'var(--font-syne)' }}>
              ? UNRESOLVED ({consensus.unresolved.length})
            </p>
            <ClaimList items={consensus.unresolved} color="#FF5757" icon="?" />
          </div>
        </div>

        {/* Weighted Claims */}
        <WeightedClaimsPanel claims={consensus.weighted_claims} />

        {/* Fact Checks */}
        <FactCheckPanel checks={consensus.fact_checks} />

        {/* Recommendation */}
        <div className="p-4 rounded-xl mt-6 mb-4" style={{ background: 'rgba(180,255,87,0.06)', border: '1px solid rgba(180,255,87,0.15)' }}>
          <p className="text-xs font-bold tracking-wider mb-2" style={{ color: '#B4FF57', fontFamily: 'var(--font-syne)' }}>
            SYNTHESIS RECOMMENDATION
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#EEEEF8' }}>
            {consensus.recommendation}
          </p>
        </div>

        {/* Strongest argument + blind spot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl" style={{ background: 'rgba(87,196,255,0.06)', border: '1px solid rgba(87,196,255,0.15)' }}>
            <p className="text-xs font-bold tracking-wider mb-2" style={{ color: '#57C4FF', fontFamily: 'var(--font-syne)' }}>
              🏆 STRONGEST ARGUMENT
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#AAAACC' }}>
              {consensus.strongest_argument}
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,133,87,0.06)', border: '1px solid rgba(255,133,87,0.15)' }}>
            <p className="text-xs font-bold tracking-wider mb-2" style={{ color: '#FF8557', fontFamily: 'var(--font-syne)' }}>
              🕳️ BIGGEST BLIND SPOT
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#AAAACC' }}>
              {consensus.biggest_blind_spot}
            </p>
          </div>
        </div>

        {/* Uncertainty note */}
        {consensus.uncertainty_note && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#8888A0', fontFamily: 'var(--font-mono)' }}>
              ⚠ WHAT WOULD CHANGE THIS
            </p>
            <p className="text-xs leading-relaxed" style={{ color: '#666688' }}>
              {consensus.uncertainty_note}
            </p>
          </div>
        )}

        {/* Epistemic disclaimer */}
        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
            This report presents what evidence currently supports — not absolute truth.
            Claims reflect the debate, not verified fact.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
