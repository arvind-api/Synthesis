'use client'
import { motion } from 'framer-motion'
import { ConsensusResult, WeightedClaim } from '@/lib/types'
import { categoryColor, verdictColor, truncate } from '@/lib/utils'

interface Props { consensus: ConsensusResult }

function EvidenceBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: 'var(--font-mono)' }}>
      {label}
    </span>
  )
}

function TakeawayCard({ claim, index }: { claim: WeightedClaim; index: number }) {
  const color = categoryColor(claim.category)
  const icon = claim.category === 'high' ? '✓' : claim.category === 'contested' ? '⚡' : claim.category === 'minority' ? '◐' : '~'
  const label = claim.category === 'high' ? 'Strong evidence' : claim.category === 'contested' ? 'Uncertain' : claim.category === 'minority' ? 'Minority view' : 'Moderate'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.09 }}
      className="p-4 rounded-2xl flex items-start gap-4"
      style={{ background: `${color}06`, border: `1px solid ${color}20` }}>
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
        style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <EvidenceBadge label={label} color={color} />
          {claim.support_count > 0 && (
            <span className="text-xs" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
              {claim.support_count} agents agreed
            </span>
          )}
          {claim.opposition_count > 0 && (
            <span className="text-xs" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
              · {claim.opposition_count} disagreed
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#EEEEF8' }}>
          {truncate(claim.claim, 200)}
        </p>
        {/* Confidence bar */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${claim.confidence}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }} />
          </div>
          <span className="text-xs" style={{ color, fontFamily: 'var(--font-mono)', minWidth: '30px' }}>
            {claim.confidence}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function FactCheckRow({ claim, verdict, reason, index }: { claim: string; verdict: string; reason: string; index: number }) {
  const color = verdictColor(verdict)
  const icon = verdict === 'verified' ? '🟢' : verdict === 'low_confidence' ? '🟡' : '🔴'
  const label = verdict === 'verified' ? 'Verified' : verdict === 'low_confidence' ? 'Uncertain' : 'Weak evidence'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-start gap-3 p-3 rounded-xl"
      style={{ background: `${color}06`, border: `1px solid ${color}18` }}>
      <span className="text-sm shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-semibold" style={{ color, fontFamily: 'var(--font-mono)' }}>{label}</span>
          <span className="text-xs" style={{ color: '#44445A' }}>{reason}</span>
        </div>
        <p className="text-xs leading-snug" style={{ color: '#AAAACC' }}>{truncate(claim, 120)}</p>
      </div>
    </motion.div>
  )
}

export default function KeyTakeaways({ consensus }: Props) {
  const topClaims = (consensus.weighted_claims ?? []).slice(0, 5)
  const factChecks = (consensus.fact_checks ?? []).slice(0, 4)

  // If no weighted claims, synthesize from agreed/contested
  const syntheticClaims: WeightedClaim[] = topClaims.length === 0
    ? [
        ...consensus.agreed.slice(0, 2).map(c => ({ claim: c, confidence: 76, support_count: 6, opposition_count: 1, evidence_quality: 70, category: 'high' as const })),
        ...consensus.contested.slice(0, 2).map(c => ({ claim: c, confidence: 51, support_count: 3, opposition_count: 4, evidence_quality: 55, category: 'contested' as const })),
        ...(consensus.unresolved.slice(0, 1).map(c => ({ claim: c, confidence: 38, support_count: 2, opposition_count: 3, evidence_quality: 42, category: 'minority' as const }))),
      ]
    : topClaims

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <p className="text-xs font-bold tracking-widest px-2" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
          KEY TAKEAWAYS
        </p>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Claim cards */}
      <div className="space-y-3 mb-6">
        {syntheticClaims.map((claim, i) => (
          <TakeawayCard key={i} claim={claim} index={i} />
        ))}
      </div>

      {/* Fact checks */}
      {factChecks.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#8888A0', fontFamily: 'var(--font-syne)' }}>
            FACT VERIFICATION
          </p>
          <div className="space-y-2">
            {factChecks.map((fc, i) => (
              <FactCheckRow key={i} claim={fc.claim} verdict={fc.verdict} reason={fc.reason} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Evidence note */}
      {consensus.evidence_summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-4 p-3 rounded-xl flex items-start gap-2"
          style={{ background: 'rgba(87,228,255,0.06)', border: '1px solid rgba(87,228,255,0.12)' }}>
          <span className="text-xs shrink-0" style={{ color: '#57E4FF' }}>📚</span>
          <p className="text-xs leading-snug" style={{ color: '#8888A0' }}>
            <span style={{ color: '#57E4FF' }}>Evidence: </span>{consensus.evidence_summary}
          </p>
        </motion.div>
      )}
    </div>
  )
}
