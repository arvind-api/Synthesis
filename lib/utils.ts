import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ConsensusResult, WeightedClaim } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseJSON<T>(raw: string): T | null {
  try {
    const clean = raw
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    return JSON.parse(clean.slice(start, end + 1)) as T
  } catch { return null }
}

export function confidenceColor(score: number): string {
  if (score >= 75) return '#57FFB8'
  if (score >= 55) return '#FFD557'
  return '#FF5757'
}

export function confidenceLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 65) return 'Moderate'
  if (score >= 45) return 'Low'
  return 'Very Low'
}

export function categoryColor(category: string): string {
  switch (category) {
    case 'high': return '#57FFB8'
    case 'moderate': return '#B4FF57'
    case 'contested': return '#FFD557'
    case 'minority': return '#FF8557'
    default: return '#8888A0'
  }
}

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case 'verified': return '#57FFB8'
    case 'low_confidence': return '#FFD557'
    case 'possible_hallucination': return '#FF5757'
    default: return '#FF8557'
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

/**
 * Weighted consensus scoring formula:
 * Final = 0.35 × evidence_quality + 0.25 × source_reliability
 *       + 0.20 × cross_agent_agreement + 0.20 × raw_confidence
 */
export function computeWeightedScore(consensus: ConsensusResult): number {
  const raw = consensus.confidence ?? 60
  const agentAgreement = consensus.agreed.length > 0
    ? Math.min(100, (consensus.agreed.length / (consensus.agreed.length + consensus.contested.length + 1)) * 100)
    : 50
  const evidenceQuality = consensus.weighted_claims?.length > 0
    ? consensus.weighted_claims.reduce((a, c) => a + (c.evidence_quality ?? 60), 0) / consensus.weighted_claims.length
    : 60
  const sourceReliability = 72 // baseline from Wikipedia/Groq

  return Math.round(
    0.35 * evidenceQuality +
    0.25 * sourceReliability +
    0.20 * agentAgreement +
    0.20 * raw
  )
}

export function hallucRisk(claims: WeightedClaim[]): 'Low' | 'Medium' | 'High' {
  if (!claims?.length) return 'Medium'
  const avgConf = claims.reduce((a, c) => a + c.confidence, 0) / claims.length
  if (avgConf >= 72) return 'Low'
  if (avgConf >= 50) return 'Medium'
  return 'High'
}

export function hallucColor(risk: 'Low' | 'Medium' | 'High'): string {
  return risk === 'Low' ? '#57FFB8' : risk === 'Medium' ? '#FFD557' : '#FF5757'
}
