// ─── Agent Identity ──────────────────────────────────────────────────────────

export type AgentId =
  | 'skeptic'
  | 'advocate'
  | 'devil'
  | 'expert'
  | 'ethicist'
  | 'contrarian'
  | 'statistician'
  | 'historian'
  | 'systems'

export interface Agent {
  id: AgentId
  name: string
  title: string
  description: string
  color: string
  bgColor: string
  icon: string
  reasoningStyle: string
  cognitiveProfile: string
  communicationStyle: string
  decisionPriority: string
}

// ─── Evidence & RAG ──────────────────────────────────────────────────────────

export interface EvidenceSource {
  sourceTitle: string
  sourceURL: string
  claim: string
  confidence: number
  type: 'supporting' | 'opposing' | 'neutral'
}

export interface EvidenceCitation {
  claim: string
  supportingEvidence: string[]
  source?: string
  confidence: number
}

// ─── Debate Rounds ───────────────────────────────────────────────────────────

export interface AgentRound1 {
  agentId: AgentId
  position: string
  key_claims: string[]
  confidence: number
  one_liner: string
  reasoning_style: string
  citations: EvidenceCitation[]
}

export interface AgentRound2 {
  agentId: AgentId
  challenged_assumptions: string[]
  fallacies_identified: string[]
  strongest_opposing_argument: string
  confidence: number
}

export interface AgentRound3 {
  agentId: AgentId
  revised_position: string
  held_firm: boolean
  strongest_claim: string
  defense: string
  agreements: string[]
  challenged_claims: string[]
  confidence_delta: number
  final_confidence: number
}

// ─── Consensus & Fact-Check ──────────────────────────────────────────────────

export interface WeightedClaim {
  claim: string
  confidence: number
  support_count: number
  opposition_count: number
  evidence_quality: number
  category: 'high' | 'moderate' | 'contested' | 'minority' | 'unknown'
}

export interface FactCheck {
  claim: string
  verdict: 'verified' | 'low_confidence' | 'possible_hallucination' | 'insufficient_evidence'
  reason: string
}

export interface ConsensusResult {
  agreed: string[]
  contested: string[]
  unresolved: string[]
  confidence: number
  synthesis: string
  recommendation: string
  strongest_argument: string
  biggest_blind_spot: string
  weighted_claims: WeightedClaim[]
  fact_checks: FactCheck[]
  evidence_summary: string
  uncertainty_note: string
}

// ─── Graph ───────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string
  label: string
  type: 'question' | 'agent' | 'claim' | 'consensus' | 'evidence'
  agentId?: AgentId
  confidence?: number
  color?: string
  size?: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  id: string
  source: string | GraphNode
  target: string | GraphNode
  type: 'supports' | 'contradicts' | 'refines' | 'questions' | 'member' | 'cites'
  weight: number
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ─── Final Result ─────────────────────────────────────────────────────────────

export interface SynthesisResult {
  question: string
  evidence: EvidenceSource[]
  round1: AgentRound1[]
  round2: AgentRound2[]
  round3: AgentRound3[]
  // Legacy compat for components that use phase1/phase2
  phase1: AgentRound1[]
  phase2: AgentRound3[]
  consensus: ConsensusResult
  graph: GraphData
  duration_ms: number
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type DebatePhase =
  | 'idle'
  | 'retrieving'
  | 'round1'
  | 'round2'
  | 'round3'
  | 'consensus'
  | 'complete'
  | 'error'

export interface DebateState {
  phase: DebatePhase
  question: string
  evidence: EvidenceSource[]
  round1Results: AgentRound1[]
  round2Results: AgentRound2[]
  round3Results: AgentRound3[]
  phase1Results: AgentRound1[]
  phase2Results: AgentRound3[]
  consensus: ConsensusResult | null
  graph: GraphData
  error: string | null
  startTime: number | null
}
