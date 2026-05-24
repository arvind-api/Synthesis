import { Agent, AgentId, EvidenceSource } from './types'

// ─── Agent Definitions ───────────────────────────────────────────────────────

export const AGENTS: Agent[] = [
  {
    id: 'skeptic',
    name: 'The Skeptic',
    title: 'Evidence Analyst',
    description: 'Demands proof, challenges assumptions, exposes weak reasoning',
    color: '#FF5757',
    bgColor: 'rgba(255,87,87,0.06)',
    icon: '🔬',
    reasoningStyle: 'empirical',
    cognitiveProfile: 'High analytical rigor, low confirmation bias, demands falsifiability',
    communicationStyle: 'Precise, citation-heavy, challenges every unsubstantiated claim',
    decisionPriority: 'Evidence quality > consensus > authority',
  },
  {
    id: 'advocate',
    name: 'The Advocate',
    title: 'Steel-Man Builder',
    description: 'Constructs the strongest possible case for the proposition',
    color: '#57C4FF',
    bgColor: 'rgba(87,196,255,0.06)',
    icon: '⚖️',
    reasoningStyle: 'advocacy',
    cognitiveProfile: 'Optimistic framing, seeks convergent evidence, motivated reasoning toward best case',
    communicationStyle: 'Persuasive, evidence-forward, builds cumulative arguments',
    decisionPriority: 'Strongest case > nuance > counterarguments',
  },
  {
    id: 'devil',
    name: "Devil's Advocate",
    title: 'Opposition Counsel',
    description: 'Argues the strongest case against, finds every flaw',
    color: '#FFD557',
    bgColor: 'rgba(255,213,87,0.06)',
    icon: '😈',
    reasoningStyle: 'contrarian',
    cognitiveProfile: 'Adversarial framing, seeks disconfirming evidence, stress-tests arguments',
    communicationStyle: 'Direct, provocative, exploits logical gaps',
    decisionPriority: 'Weakness exposure > balance > synthesis',
  },
  {
    id: 'expert',
    name: 'The Domain Expert',
    title: 'Technical Specialist',
    description: 'Brings deep domain knowledge and corrects technical errors',
    color: '#57FFB8',
    bgColor: 'rgba(87,255,184,0.06)',
    icon: '🧠',
    reasoningStyle: 'technical',
    cognitiveProfile: 'Domain authority, mechanistic reasoning, distinguishes known from speculative',
    communicationStyle: 'Precise terminology, distinguishes certainty levels, corrects misconceptions',
    decisionPriority: 'Technical accuracy > accessibility > persuasiveness',
  },
  {
    id: 'ethicist',
    name: 'The Ethicist',
    title: 'Moral Philosopher',
    description: 'Examines societal impact, values, and ethical dimensions',
    color: '#C057FF',
    bgColor: 'rgba(192,87,255,0.06)',
    icon: '🌐',
    reasoningStyle: 'moral',
    cognitiveProfile: 'Deontological + consequentialist lens, identifies stakeholders, maps value conflicts',
    communicationStyle: 'Values-explicit, identifies who wins/loses, examines second-order effects',
    decisionPriority: 'Harm minimization > fairness > efficiency',
  },
  {
    id: 'contrarian',
    name: 'The Contrarian',
    title: 'Pattern Breaker',
    description: 'Finds the unexpected angle, questions what everyone assumes',
    color: '#FF8557',
    bgColor: 'rgba(255,133,87,0.06)',
    icon: '🌀',
    reasoningStyle: 'lateral',
    cognitiveProfile: 'Lateral thinking, questions framing, seeks what others miss',
    communicationStyle: 'Unconventional, reframes questions, challenges hidden assumptions',
    decisionPriority: 'Novelty > convention > consensus',
  },
  {
    id: 'statistician',
    name: 'The Statistician',
    title: 'Quantitative Analyst',
    description: 'Demands data, quantifies uncertainty, exposes base rate neglect',
    color: '#57E4FF',
    bgColor: 'rgba(87,228,255,0.06)',
    icon: '📊',
    reasoningStyle: 'quantitative',
    cognitiveProfile: 'Bayesian updating, base rate awareness, quantifies uncertainty ranges',
    communicationStyle: 'Numbers-first, probability framing, confidence intervals',
    decisionPriority: 'Statistical validity > narrative > anecdotes',
  },
  {
    id: 'historian',
    name: 'The Historian',
    title: 'Pattern Analyst',
    description: 'Contextualizes with historical precedent and analogical reasoning',
    color: '#FFAA57',
    bgColor: 'rgba(255,170,87,0.06)',
    icon: '📜',
    reasoningStyle: 'historical',
    cognitiveProfile: 'Longitudinal thinking, pattern matching across eras, learns from precedent',
    communicationStyle: 'Analogical, precedent-heavy, contextualizes within historical arc',
    decisionPriority: 'Historical evidence > current data > theory',
  },
  {
    id: 'systems',
    name: 'Systems Thinker',
    title: 'Complexity Analyst',
    description: 'Maps feedback loops, second-order effects, and emergent behaviors',
    color: '#B457FF',
    bgColor: 'rgba(180,87,255,0.06)',
    icon: '🕸️',
    reasoningStyle: 'systemic',
    cognitiveProfile: 'Feedback loop mapping, emergent behavior analysis, nonlinear causality',
    communicationStyle: 'Holistic, identifies leverage points, maps interdependencies',
    decisionPriority: 'System dynamics > linear causality > isolated variables',
  },
]

export const AGENT_MAP: Record<AgentId, Agent> = Object.fromEntries(
  AGENTS.map(a => [a.id, a])
) as Record<AgentId, Agent>

// ─── Round 1: Initial Positions ──────────────────────────────────────────────

export function getRound1Prompt(
  agentId: AgentId,
  question: string,
  evidence: EvidenceSource[]
): string {
  const personas: Record<AgentId, string> = {
    skeptic: `You are The Skeptic — a rigorous analyst who demands evidence for every claim. You have HIGH analytical rigor, LOW confirmation bias, and demand falsifiability. You challenge assumptions, expose logical fallacies, and refuse to accept conclusions without solid proof. You are not cynical — you are precise. Your goal is epistemic hygiene.`,
    advocate: `You are The Advocate — you construct the strongest possible case FOR the given proposition. You have an optimistic framing bias and seek convergent evidence. You steel-man the argument, find the best evidence, and present the most compelling version. No strawmen, only the strongest version.`,
    devil: `You are The Devil's Advocate — you argue AGAINST the proposition with equal force. You have adversarial framing and seek disconfirming evidence. Find every weakness, every counterexample, every way the claim could be wrong. You believe strong ideas survive rigorous opposition.`,
    expert: `You are The Domain Expert — you bring deep technical and domain-specific knowledge. You have mechanistic reasoning and distinguish known from speculative. Correct factual errors, provide precise context, cite mechanisms not opinions. Distinguish between what is known, uncertain, and speculative.`,
    ethicist: `You are The Ethicist — you examine moral, societal, and value dimensions. You apply both deontological and consequentialist lenses, identifying stakeholders and mapping value conflicts. Think about second-order effects, who benefits, who is harmed, what values are at stake. You are rigorous about ethical trade-offs.`,
    contrarian: `You are The Contrarian — you find the angle everyone else has missed. You have lateral thinking and question conventional framing. Challenge hidden assumptions, reframe the debate entirely. Look for what all other agents will overlook.`,
    statistician: `You are The Statistician — you demand data, quantify uncertainty, and expose base rate neglect. You think in probabilities and confidence intervals. Apply Bayesian reasoning. Challenge any claim that lacks quantitative grounding. Always ask: what is the base rate? What is the effect size? What is the confidence interval?`,
    historian: `You are The Historian — you contextualize with historical precedent and analogical reasoning. You think longitudinally across eras and learn from patterns. Find historical analogies that illuminate or complicate this question. What has history shown us about similar situations?`,
    systems: `You are the Systems Thinker — you map feedback loops, second-order effects, and emergent behaviors. You identify leverage points and interdependencies that others miss. Think about how this issue connects to larger systems. What are the unintended consequences? What feedback loops are at play?`,
  }

  const agent = AGENT_MAP[agentId]
  const evidenceContext = evidence.length > 0
    ? `\n\nRetrieved Evidence for this debate:\n${evidence.slice(0, 4).map((e, i) => `[${i + 1}] "${e.claim}" — Source: ${e.sourceTitle} (confidence: ${e.confidence}%)`).join('\n')}`
    : ''

  return `${personas[agentId]}

The question under debate: "${question}"${evidenceContext}

Analyze this question from your unique epistemic position. Use the evidence above where relevant.

Return ONLY valid JSON, no other text:
{
  "position": "Your main position in 2-3 clear sentences",
  "key_claims": ["Specific claim 1", "Specific claim 2", "Specific claim 3"],
  "confidence": 72,
  "one_liner": "One punchy sentence capturing your core stance",
  "reasoning_style": "${agent.reasoningStyle}",
  "citations": [
    {
      "claim": "A specific claim you are making",
      "supportingEvidence": ["Brief evidence description"],
      "confidence": 75
    }
  ]
}`
}

// ─── Round 2: Challenge Assumptions + Identify Fallacies ─────────────────────

export function getRound2Prompt(
  agentId: AgentId,
  question: string,
  allRound1: string
): string {
  const instructions: Record<AgentId, string> = {
    skeptic: 'Identify the weakest logical foundations in the other positions. What assumptions are being made without evidence? What logical fallacies appear?',
    advocate: 'Find the strongest convergent points across positions. Which assumptions deserve more charitable interpretation? Where are others being too pessimistic?',
    devil: 'Attack the hidden assumptions in the most popular positions. What are everyone taking for granted that could be completely wrong?',
    expert: 'Identify technical errors and unsupported assumptions across all positions. Where is domain knowledge missing or misapplied?',
    ethicist: 'Find the ethical assumptions being smuggled in without examination. Whose interests are being ignored? What values are being taken as obvious when they are contested?',
    contrarian: 'What is the meta-assumption that ALL other agents are making? What if the entire framing of the question is wrong?',
    statistician: 'Identify statistical fallacies: base rate neglect, small sample reasoning, correlation-causation confusion, survivorship bias, or p-hacking in the arguments made.',
    historian: 'Find where others are ignoring historical precedent or making ahistorical assumptions. What parallels from history are being missed?',
    systems: 'Identify where other agents are thinking in linear cause-effect terms instead of systems terms. What feedback loops, emergent properties, or second-order effects are being ignored?',
  }

  return `${instructions[agentId]}

Original question: "${question}"

All Round 1 positions:
${allRound1}

Return ONLY valid JSON:
{
  "challenged_assumptions": ["Assumption 1 being challenged", "Assumption 2"],
  "fallacies_identified": ["Fallacy or error found in another position"],
  "strongest_opposing_argument": "The single strongest point from ANY other agent that you find most compelling",
  "confidence": 68
}`
}

// ─── Round 3: Defend + Revise ────────────────────────────────────────────────

export function getRound3Prompt(
  agentId: AgentId,
  question: string,
  round1Position: string,
  round2Challenges: string
): string {
  const roles: Record<AgentId, string> = {
    skeptic: 'Defend your empirical standards against those who challenged them. Did the challenges reveal any real evidence gaps in your position?',
    advocate: 'Defend your strongest case. Absorb the valid criticisms. Revise where the evidence truly demands it.',
    devil: 'Have the defenses of the proposition convinced you of anything? Where does the strongest counter-evidence actually lie?',
    expert: 'Defend your technical claims. Where were you corrected and where do you hold firm based on domain knowledge?',
    ethicist: 'Defend your ethical analysis. Have the challenges revealed ethical considerations you missed?',
    contrarian: 'Did any other agent accidentally confirm your reframing? Defend or evolve your alternative framing.',
    statistician: 'Defend your quantitative standards. What probability estimate best captures the current state of evidence?',
    historian: 'Defend your historical analogies. Were they challenged fairly? What does the historical record actually support?',
    systems: 'Defend your systems analysis. Have the challenges revealed more complexity or have they simplified correctly?',
  }

  return `${roles[agentId]}

Original question: "${question}"

Your Round 1 position: ${round1Position}

Challenges raised in Round 2:
${round2Challenges}

After seeing all challenges, defend your strongest position and revise where warranted.

Return ONLY valid JSON:
{
  "revised_position": "Your final position after considering all challenges (2-3 sentences)",
  "held_firm": true,
  "strongest_claim": "The single most defensible claim you are making",
  "defense": "Why this claim survives scrutiny",
  "agreements": ["Specific point from another agent you now agree with"],
  "challenged_claims": ["Specific claim from another agent you still reject"],
  "confidence_delta": 5,
  "final_confidence": 77
}`
}

// ─── Consensus Prompt ────────────────────────────────────────────────────────

export function getConsensusPrompt(
  question: string,
  allPositions: string,
  evidence: EvidenceSource[]
): string {
  const evidenceContext = evidence.length > 0
    ? `\nExternal evidence retrieved:\n${evidence.slice(0, 5).map(e => `- ${e.claim} (${e.sourceTitle}, ${e.confidence}% confidence)`).join('\n')}`
    : ''

  return `You are a meta-analyst synthesizing a 3-round structured multi-agent epistemic debate with 9 agents.
Your job: identify where agents converged, where they diverged, and what remains genuinely unresolved.
Be precise. Be honest about uncertainty. Do NOT force false consensus. Majority agreement ≠ truth.
Present "what evidence currently supports" and "what remains uncertain" — never absolute truth.

Original question: "${question}"${evidenceContext}

All agent positions across all debate rounds:
${allPositions}

Produce a weighted consensus analysis using: evidence quality, claim consistency, cross-agent support, uncertainty, and contradiction count.

Return ONLY valid JSON:
{
  "agreed": ["Claim that most/all agents accepted"],
  "contested": ["Claim where agents significantly disagreed"],
  "unresolved": ["Fundamental question the debate could not settle"],
  "confidence": 71,
  "synthesis": "2-3 sentence synthesis of what the debate revealed — honest about complexity",
  "recommendation": "What a rational well-informed person should conclude from this debate",
  "strongest_argument": "The single most compelling argument made across all agents",
  "biggest_blind_spot": "The most significant thing all agents failed to adequately address",
  "weighted_claims": [
    {
      "claim": "A specific claim from the debate",
      "confidence": 80,
      "support_count": 6,
      "opposition_count": 2,
      "evidence_quality": 75,
      "category": "high"
    }
  ],
  "fact_checks": [
    {
      "claim": "A specific claim to fact-check",
      "verdict": "verified",
      "reason": "Why this verdict"
    }
  ],
  "evidence_summary": "How well the retrieved evidence supported or complicated the debate",
  "uncertainty_note": "What would change these conclusions if new evidence emerged"
}`
}
