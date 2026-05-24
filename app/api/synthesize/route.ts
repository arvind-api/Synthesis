import { NextRequest, NextResponse } from 'next/server'
import { AGENTS, getRound1Prompt, getRound2Prompt, getRound3Prompt, getConsensusPrompt } from '@/lib/agents'
import { retrieveEvidence } from '@/lib/rag'
import { parseJSON, computeWeightedScore } from '@/lib/utils'
import { runLLM } from '@/services/llm'
import { MOCK_RESULT } from '@/lib/mock-data'
import {
  AgentRound1, AgentRound2, AgentRound3, ConsensusResult,
  GraphData, GraphNode, GraphEdge, AgentId, EvidenceSource, WeightedClaim,
} from '@/lib/types'

// ─── Fallbacks ────────────────────────────────────────────────────────────────
function fallbackR1(agentId: AgentId): AgentRound1 {
  const agent = AGENTS.find(a => a.id === agentId)!
  return { agentId, position: `As ${agent.name}, I bring my ${agent.reasoningStyle} perspective.`, key_claims: ['Multi-dimensional analysis required', 'Context shapes the answer significantly', 'Evidence quality determines claim weight'], confidence: 62, one_liner: `This demands ${agent.reasoningStyle} scrutiny.`, reasoning_style: agent.reasoningStyle, citations: [] }
}
function fallbackR2(agentId: AgentId): AgentRound2 {
  return { agentId, challenged_assumptions: ['Hidden assumptions in the question framing'], fallacies_identified: ['Some positions conflate correlation with causation'], strongest_opposing_argument: 'The most rigorous opposing position deserves serious consideration', confidence: 58 }
}
function fallbackR3(agentId: AgentId, r1: AgentRound1): AgentRound3 {
  return { agentId, revised_position: r1.position, held_firm: true, strongest_claim: r1.key_claims[0] ?? 'Evidence determines the right answer', defense: 'Initial analysis holds under scrutiny', agreements: [], challenged_claims: [], confidence_delta: 0, final_confidence: r1.confidence }
}

// ─── Graph Builder ─────────────────────────────────────────────────────────────
function buildGraph(question: string, evidence: EvidenceSource[], round1: AgentRound1[], round3: AgentRound3[], consensus: ConsensusResult): GraphData {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  nodes.push({ id: 'q0', label: question.length > 55 ? question.slice(0, 52) + '…' : question, type: 'question', size: 28, color: '#EEEEF8' })

  evidence.slice(0, 3).forEach((ev, i) => {
    const id = `ev-${i}`
    nodes.push({ id, label: ev.sourceTitle.replace('Wikipedia: ', '').slice(0, 28), type: 'evidence', size: 10, color: '#57E4FF' })
    edges.push({ id: `ev-q-${i}`, source: id, target: 'q0', type: 'cites', weight: 1.5 })
  })

  const agentColors: Record<AgentId, string> = { skeptic: '#FF5757', advocate: '#57C4FF', devil: '#FFD557', expert: '#57FFB8', ethicist: '#C057FF', contrarian: '#FF8557', statistician: '#57E4FF', historian: '#FFAA57', systems: '#B457FF' }

  round1.forEach((r1, i) => {
    const aId = `a-${r1.agentId}`
    const agent = AGENTS.find(a => a.id === r1.agentId)
    const r3 = round3.find(r => r.agentId === r1.agentId)
    const finalConf = r3?.final_confidence ?? r1.confidence
    nodes.push({ id: aId, label: agent?.name ?? r1.agentId, type: 'agent', agentId: r1.agentId, color: agentColors[r1.agentId], size: 16 + (finalConf / 25), confidence: finalConf })
    edges.push({ id: `eq-${i}`, source: 'q0', target: aId, type: 'member', weight: 1 })
    r1.key_claims.slice(0, 2).forEach((claim, j) => {
      const cId = `c-${r1.agentId}-${j}`
      nodes.push({ id: cId, label: claim.length > 42 ? claim.slice(0, 39) + '…' : claim, type: 'claim', agentId: r1.agentId, color: agentColors[r1.agentId], size: 7 + (finalConf / 18), confidence: finalConf })
      edges.push({ id: `ec-${r1.agentId}-${j}`, source: aId, target: cId, type: 'supports', weight: 2 })
    })
  })

  round3.forEach(r3 => {
    r3.challenged_claims.slice(0, 1).forEach((_, j) => {
      const targets = nodes.filter(n => n.type === 'claim' && n.agentId !== r3.agentId)
      if (targets.length) edges.push({ id: `ch-${r3.agentId}-${j}`, source: `a-${r3.agentId}`, target: targets[j % targets.length].id, type: 'contradicts', weight: 1.5 })
    })
    r3.agreements.slice(0, 1).forEach((_, j) => {
      const targets = nodes.filter(n => n.type === 'claim' && n.agentId !== r3.agentId)
      if (targets.length > 1) edges.push({ id: `ag-${r3.agentId}-${j}`, source: `a-${r3.agentId}`, target: targets[(j + 1) % targets.length].id, type: 'supports', weight: 1 })
    })
  })

  consensus.agreed.slice(0, 3).forEach((claim, i) => {
    const cId = `con-${i}`
    nodes.push({ id: cId, label: claim.length > 38 ? claim.slice(0, 35) + '…' : claim, type: 'consensus', color: '#B4FF57', size: 14, confidence: consensus.confidence })
    const pick = round1[i % round1.length]
    edges.push({ id: `ece-${i}`, source: `a-${pick.agentId}`, target: cId, type: 'supports', weight: 2.5 })
  })

  return { nodes, edges }
}

// ─── Weighted Consensus Scoring ───────────────────────────────────────────────
function applyWeightedScoring(consensus: ConsensusResult, evidence: EvidenceSource[]): ConsensusResult {
  // evidence_quality: avg confidence of retrieved sources
  const evidenceQuality = evidence.length
    ? evidence.reduce((a, e) => a + e.confidence, 0) / evidence.length
    : 60
  // source_reliability: Wikipedia/Tavily baseline
  const sourceReliability = evidence.length > 0 ? 74 : 58
  // cross_agent_agreement: ratio of agreed to total claims
  const total = consensus.agreed.length + consensus.contested.length + consensus.unresolved.length
  const agentAgreement = total > 0 ? Math.min(100, (consensus.agreed.length / total) * 100) : 50
  // weighted formula
  const weighted = Math.round(
    0.35 * evidenceQuality + 0.25 * sourceReliability +
    0.20 * agentAgreement + 0.20 * consensus.confidence
  )
  return { ...consensus, confidence: Math.min(95, Math.max(20, weighted)) }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  try {
    const body = await req.json()
    const { question, useMock } = body as { question: string; useMock?: boolean }

    if (!question || question.trim().length < 10)
      return NextResponse.json({ error: 'Question too short' }, { status: 400 })

    if (useMock || (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY && !process.env.MISTRAL_API_KEY)) {
      await new Promise(r => setTimeout(r, 1600))
      return NextResponse.json({ ...MOCK_RESULT, question })
    }

    // ── Evidence retrieval ─────────────────────────────────────────────────
    let evidence: EvidenceSource[] = []
    try { evidence = await retrieveEvidence(question, process.env.TAVILY_API_KEY) }
    catch (e) { console.warn('[RAG] failed:', e) }

    // ── Round 1: all agents parallel ───────────────────────────────────────
    const round1Results = await Promise.all(
      AGENTS.map(async agent => {
        const { text } = await runLLM(getRound1Prompt(agent.id, question, evidence), 520)
        const parsed = parseJSON<Omit<AgentRound1, 'agentId'>>(text)
        return parsed ? { ...parsed, agentId: agent.id, citations: parsed.citations ?? [] } as AgentRound1 : fallbackR1(agent.id)
      })
    )

    // ── Round 2: challenge assumptions (parallel) ──────────────────────────
    const allR1Text = round1Results.map(r => `[${AGENTS.find(a => a.id === r.agentId)?.name}]: ${r.position}`).join('\n\n')
    const round2Results = await Promise.all(
      AGENTS.map(async agent => {
        const { text } = await runLLM(getRound2Prompt(agent.id, question, allR1Text), 380)
        const parsed = parseJSON<Omit<AgentRound2, 'agentId'>>(text)
        return parsed ? { ...parsed, agentId: agent.id } as AgentRound2 : fallbackR2(agent.id)
      })
    )

    // ── Round 3: defend + revise (parallel) ───────────────────────────────
    const allR2Text = round2Results.map(r => `[${AGENTS.find(a => a.id === r.agentId)?.name} challenges]: ${r.challenged_assumptions.join('; ')}`).join('\n')
    const round3Results = await Promise.all(
      AGENTS.map(async agent => {
        const r1 = round1Results.find(r => r.agentId === agent.id)!
        const { text } = await runLLM(getRound3Prompt(agent.id, question, r1.position, allR2Text), 460)
        const parsed = parseJSON<Omit<AgentRound3, 'agentId'>>(text)
        return parsed ? { ...parsed, agentId: agent.id } as AgentRound3 : fallbackR3(agent.id, r1)
      })
    )

    // ── Consensus ─────────────────────────────────────────────────────────
    const allPositionsText = round1Results.map(r1 => {
      const r3 = round3Results.find(r => r.agentId === r1.agentId)
      const name = AGENTS.find(a => a.id === r1.agentId)?.name ?? r1.agentId
      return `[${name}]\nR1: ${r1.position}\nR3: ${r3?.revised_position ?? r1.position}\nHeld: ${r3?.held_firm ?? true} | Confidence: ${r3?.final_confidence ?? r1.confidence}%`
    }).join('\n\n---\n\n')

    const { text: consensusRaw } = await runLLM(getConsensusPrompt(question, allPositionsText, evidence), 900)
    let consensus = parseJSON<ConsensusResult>(consensusRaw) ?? {
      agreed: ['Multiple perspectives converge on core structural issues', 'Context and implementation matter significantly', 'Evidence quality varies across positions'],
      contested: ['The optimal implementation mechanism', 'The balance between competing priorities'],
      unresolved: ['How to weigh long-term uncertainties', 'What evidence would definitively resolve the debate'],
      confidence: 62, synthesis: 'The debate revealed genuine complexity with convergence on structural issues and divergence on implementation.',
      recommendation: 'Consider multiple perspectives before deciding. The strongest arguments emerged from evidence-backed positions.',
      strongest_argument: 'The evidence-backed position accounting for historical precedent holds best under scrutiny.',
      biggest_blind_spot: 'All agents could better address those most directly affected.',
      weighted_claims: [], fact_checks: [],
      evidence_summary: evidence.length > 0 ? `${evidence.length} sources integrated.` : 'No external evidence retrieved.',
      uncertainty_note: 'New empirical evidence could shift these conclusions.',
    }

    // Apply weighted scoring formula
    consensus = applyWeightedScoring(consensus, evidence)
    if (!Array.isArray(consensus.weighted_claims)) consensus.weighted_claims = []
    if (!Array.isArray(consensus.fact_checks)) consensus.fact_checks = []

    const graph = buildGraph(question, evidence, round1Results, round3Results, consensus)

    return NextResponse.json({
      question, evidence,
      round1: round1Results, round2: round2Results, round3: round3Results,
      phase1: round1Results, phase2: round3Results,
      consensus, graph, duration_ms: Date.now() - startTime,
    })
  } catch (err) {
    console.error('[API] synthesis error:', err)
    return NextResponse.json({ error: 'Synthesis failed. Using demo data.' }, { status: 500 })
  }
}
