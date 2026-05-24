# SYNTHESIS v2
### Adversarial Multi-Agent Epistemic Consensus Engine

> 9 AI agents. 3 debate rounds. Real-time evidence retrieval. Weighted consensus. Fact-checking.  
> *Not what AI thinks — what AI agrees on after fighting itself.*

---

## What's New in v2

| Feature | v1 | v2 |
|---|---|---|
| Agents | 6 | **9** |
| Debate rounds | 2 | **3** |
| Evidence retrieval | ❌ | **✅ Wikipedia + Tavily RAG** |
| Citations in claims | ❌ | **✅** |
| Weighted consensus | ❌ | **✅ multi-factor scoring** |
| Fact-check layer | ❌ | **✅ 4 verdict types** |
| Fallacy detection | ❌ | **✅ Round 2** |
| Assumption challenging | ❌ | **✅ Round 2** |
| Judge Mode | ❌ | **✅ 5 preloaded prompts** |
| Node types in graph | 4 | **5 (+ evidence nodes)** |
| Edge types in graph | 5 | **6 (+ cites)** |

---

## Architecture

```
Question
  └─ RAG Evidence Retrieval (Wikipedia API + optional Tavily)
       └─ Round 1: 9 agents form independent positions (parallel)
            └─ Round 2: Challenge assumptions + identify fallacies (parallel)
                 └─ Round 3: Defend strongest claims + revise confidence (parallel)
                      └─ Weighted Consensus Engine
                           └─ Fact-Check Layer
                                └─ Argument Provenance Graph
```

### The 9 Agents

| Agent | Role | Cognitive Profile |
|---|---|---|
| 🔬 The Skeptic | Evidence Analyst | Empirical, falsifiability-focused |
| ⚖️ The Advocate | Steel-Man Builder | Best-case, advocacy |
| 😈 Devil's Advocate | Opposition Counsel | Adversarial, stress-tests |
| 🧠 Domain Expert | Technical Specialist | Mechanistic, corrects errors |
| 🌐 The Ethicist | Moral Philosopher | Deontological + consequentialist |
| 🌀 The Contrarian | Pattern Breaker | Lateral, reframes questions |
| 📊 The Statistician | Quantitative Analyst | Bayesian, base rates |
| 📜 The Historian | Pattern Analyst | Longitudinal, precedent |
| 🕸️ Systems Thinker | Complexity Analyst | Feedback loops, emergence |

### The 3 Debate Rounds

- **Round 1** — Independent position generation with evidence citations
- **Round 2** — Challenge assumptions + identify logical fallacies across all positions
- **Round 3** — Defend strongest claims + revise confidence scores based on challenges

### Consensus Engine

Weighted by:
- Evidence quality & source reliability
- Claim consistency across agents
- Cross-agent support count
- Contradiction count
- Agent confidence levels

Outputs:
- High / Moderate / Contested / Minority / Unknown claims
- Fact-check verdicts: `verified` / `low_confidence` / `possible_hallucination` / `insufficient_evidence`
- "What evidence supports" vs "What remains uncertain"

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A free [Groq API key](https://console.groq.com) (required)
- Optional: [Tavily API key](https://tavily.com) for richer evidence (1000 free/month)

### 2. Install

```bash
cd synthesisv2
npm install
```

### 3. Configure

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
GROQ_API_KEY=your_key_here
TAVILY_API_KEY=optional_key_here   # remove this line if you don't have one
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Demo (no API key needed)

In the UI, toggle **"Demo mode"** or click **"⚡ JUDGE MODE"** for preloaded questions.

---

## Deployment

### Vercel (recommended, free)

```bash
npm install -g vercel
vercel
# Add environment variables in Vercel dashboard
```

### Docker

```bash
docker build -t synthesisv2 .
docker run -p 3000:3000 -e GROQ_API_KEY=... synthesisv2
```

---

## Performance Targets

| Step | Target |
|---|---|
| Evidence retrieval | < 3s |
| Round 1 (9 agents parallel) | < 8s |
| Round 2 (9 agents parallel) | < 8s |
| Round 3 (9 agents parallel) | < 8s |
| Consensus synthesis | < 5s |
| **Total** | **< 30s** |

Using demo mode: instant.

---

## Stack

- **Next.js 14** — App Router, API routes
- **Groq** — LLaMA 3.3 70B (free tier: 14,400 req/day)
- **D3.js** — Force-directed argument graph
- **Framer Motion** — Animations
- **Wikipedia API** — Free evidence retrieval (no key needed)
- **Tavily API** — Optional richer web search (1000 free/month)
- **Tailwind CSS** — Styling

---

## File Structure

```
synthesisv2/
├── app/
│   ├── api/synthesize/route.ts   # Main API: RAG + 3 rounds + consensus
│   ├── synthesize/page.tsx       # Debate UI page
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── AgentCard.tsx             # Per-agent card with 3-round data + citations
│   ├── ArgumentGraph.tsx         # D3 force graph (5 node types, 6 edge types)
│   ├── ConsensusPanel.tsx        # Weighted claims + fact-checks + synthesis
│   ├── DebateArena.tsx           # Phase bar + evidence banner + agent grid
│   ├── Navbar.tsx
│   └── QuestionInput.tsx         # Input + Judge Mode panel
├── lib/
│   ├── agents.ts                 # 9 agents + 3-round prompts
│   ├── rag.ts                    # Evidence retrieval (Wikipedia + Tavily)
│   ├── types.ts                  # Full TypeScript types
│   ├── utils.ts                  # Helpers
│   └── mock-data.ts              # Rich demo data (9 agents, 3 rounds)
├── .env.example
└── package.json
```
