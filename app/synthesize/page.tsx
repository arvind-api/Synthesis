'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import QuestionInput from '@/components/QuestionInput'
import VerdictCard from '@/components/VerdictCard'
import KeyTakeaways from '@/components/KeyTakeaways'
import DebateTimeline from '@/components/DebateTimeline'
import ArgumentGraph from '@/components/ArgumentGraph'
import { DebateState, SynthesisResult, GraphData } from '@/lib/types'
import { MOCK_RESULT } from '@/lib/mock-data'
import { sleep } from '@/lib/utils'

const EMPTY_GRAPH: GraphData = { nodes: [], edges: [] }

const DEFAULT_STATE: DebateState = {
  phase: 'idle', question: '', evidence: [],
  round1Results: [], round2Results: [], round3Results: [],
  phase1Results: [], phase2Results: [],
  consensus: null, graph: EMPTY_GRAPH, error: null, startTime: null,
}

/* Phase step labels shown during loading */
const PHASE_MESSAGES: Record<string, string> = {
  retrieving: 'Retrieving evidence sources…',
  round1:     'Round 1 — Agents forming initial positions…',
  round2:     'Round 2 — Cross-examination in progress…',
  round3:     'Round 3 — Defense & revision…',
  consensus:  'Synthesizing weighted consensus…',
}

export default function SynthesizePage() {
  const [state, setState] = useState<DebateState>(DEFAULT_STATE)
  const [result, setResult] = useState<SynthesisResult | null>(null)
  const [showGraph, setShowGraph] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const scrollToResult = () => {
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }

  const handleSubmit = useCallback(async (question: string, useMock: boolean) => {
    setResult(null)
    setShowGraph(false)
    setState({ ...DEFAULT_STATE, phase: 'retrieving', question, startTime: Date.now() })
    scrollToResult()

    try {
      if (useMock) {
        await sleep(500)
        setState(s => ({ ...s, evidence: MOCK_RESULT.evidence }))
        await sleep(700)
        setState(s => ({ ...s, phase: 'round1' }))
        for (const r1 of MOCK_RESULT.round1) {
          await sleep(240)
          setState(s => ({ ...s, round1Results: [...s.round1Results, r1], phase1Results: [...s.phase1Results, r1] }))
        }
        await sleep(400)
        setState(s => ({ ...s, phase: 'round2' }))
        for (const r2 of MOCK_RESULT.round2) {
          await sleep(200)
          setState(s => ({ ...s, round2Results: [...s.round2Results, r2] }))
        }
        await sleep(400)
        setState(s => ({ ...s, phase: 'round3' }))
        for (const r3 of MOCK_RESULT.round3) {
          await sleep(220)
          setState(s => ({ ...s, round3Results: [...s.round3Results, r3], phase2Results: [...s.phase2Results, r3] }))
        }
        await sleep(600)
        setState(s => ({ ...s, phase: 'consensus' }))
        await sleep(1000)
        const fin = { ...MOCK_RESULT, question }
        setResult(fin)
        setState(s => ({ ...s, phase: 'complete', consensus: fin.consensus, graph: fin.graph }))
        return
      }

      // Real API call
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, useMock: false }),
      })
      const data: SynthesisResult = res.ok
        ? await res.json()
        : { ...MOCK_RESULT, question }

      setState(s => ({ ...s, phase: 'retrieving', evidence: data.evidence ?? [] }))
      await sleep(300)
      setState(s => ({ ...s, phase: 'round1' }))
      for (const r1 of data.round1 ?? data.phase1 ?? []) {
        await sleep(90)
        setState(s => ({ ...s, round1Results: [...s.round1Results, r1], phase1Results: [...s.phase1Results, r1] }))
      }
      setState(s => ({ ...s, phase: 'round2' }))
      for (const r2 of data.round2 ?? []) {
        await sleep(80)
        setState(s => ({ ...s, round2Results: [...s.round2Results, r2] }))
      }
      setState(s => ({ ...s, phase: 'round3' }))
      for (const r3 of data.round3 ?? data.phase2 ?? []) {
        await sleep(90)
        setState(s => ({ ...s, round3Results: [...s.round3Results, r3], phase2Results: [...s.phase2Results, r3] }))
      }
      setState(s => ({ ...s, phase: 'consensus' }))
      await sleep(400)
      setResult(data)
      setState(s => ({ ...s, phase: 'complete', consensus: data.consensus, graph: data.graph }))

    } catch (err) {
      console.error(err)
      setState(s => ({ ...s, phase: 'error', error: 'Synthesis failed. Try demo mode.' }))
    }
  }, [])

  const handleReset = () => {
    setState(DEFAULT_STATE)
    setResult(null)
    setShowGraph(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isComplete  = state.phase === 'complete'
  const isRunning   = !['idle', 'complete', 'error'].includes(state.phase)
  const isActive    = state.phase !== 'idle'

  return (
    <main className="min-h-screen pb-40" style={{ background: '#030305' }}>
      <Navbar />

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="pt-28 pb-8 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs tracking-widest mb-2" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
            SYNTHESIS ENGINE v2 · 9 AGENTS · 3 ROUNDS · RAG EVIDENCE
          </p>
          <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ fontFamily: 'var(--font-syne)' }}>
            Enter a question. Watch nine minds fight.
          </h1>
          <p className="text-sm" style={{ color: '#8888A0' }}>
            Evidence-backed · Multi-round debate · Weighted consensus · Fact-checked
          </p>
        </motion.div>
      </div>

      {/* ── INPUT ───────────────────────────────────────────────────────── */}
      <div className="px-6 mb-10 max-w-3xl mx-auto">
        <QuestionInput onSubmit={handleSubmit} loading={isRunning} />
      </div>

      {/* ── RESULTS AREA ────────────────────────────────────────────────── */}
      <div ref={resultRef} className="px-4 md:px-6 max-w-5xl mx-auto">

        {/* Error */}
        <AnimatePresence>
          {state.phase === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-sm mb-4" style={{ color: '#FF5757' }}>{state.error}</p>
              <button onClick={handleReset} className="text-xs px-4 py-2 rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#8888A0' }}>
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isActive && state.phase !== 'error' && (
          <div className="space-y-6">

            {/* ── 1. QUESTION BANNER ──────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between gap-4 p-4 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start gap-3 min-w-0">
                <motion.div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  animate={isRunning ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ background: isRunning ? '#FFD557' : '#B4FF57', boxShadow: `0 0 8px ${isRunning ? '#FFD557' : '#B4FF57'}` }} />
                <div className="min-w-0">
                  <p className="text-xs mb-1" style={{ color: '#8888A0', fontFamily: 'var(--font-mono)' }}>QUESTION</p>
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: '#EEEEF8' }}>{state.question}</p>
                </div>
              </div>
              {isComplete && (
                <button onClick={handleReset} className="text-xs px-3 py-1.5 rounded-lg shrink-0 transition-all hover:text-[#EEEEF8]"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8888A0', fontFamily: 'var(--font-mono)' }}>
                  New Question
                </button>
              )}
            </motion.div>

            {/* ── LOADING PHASE INDICATOR ─────────────────────────────────── */}
            {isRunning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 py-6">
                <motion.div className="w-2.5 h-2.5 rounded-full"
                  animate={{ opacity: [1, 0.2, 1], scale: [1, 0.6, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  style={{ background: '#B4FF57', boxShadow: '0 0 10px rgba(180,255,87,0.6)' }} />
                <p className="text-sm" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
                  {PHASE_MESSAGES[state.phase] ?? 'Processing…'}
                </p>
              </motion.div>
            )}

            {/* ── 2. VERDICT CARD — always first, most prominent ─────────── */}
            <AnimatePresence>
              {isComplete && state.consensus && (
                <VerdictCard
                  consensus={state.consensus}
                  question={state.question}
                  duration_ms={result?.duration_ms}
                />
              )}
            </AnimatePresence>

            {/* ── 3. KEY TAKEAWAYS ────────────────────────────────────────── */}
            <AnimatePresence>
              {isComplete && state.consensus && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}>
                  <KeyTakeaways consensus={state.consensus} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 4. DEBATE TIMELINE — collapsible ────────────────────────── */}
            {(state.round1Results.length > 0 || isComplete) && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <DebateTimeline state={state} />
              </motion.div>
            )}

            {/* ── 5. ARGUMENT GRAPH — expandable ──────────────────────────── */}
            <AnimatePresence>
              {isComplete && result && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  {/* Graph header + toggle */}
                  <button
                    onClick={() => setShowGraph(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-white/[0.02]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-bold tracking-widest" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
                        ARGUMENT PROVENANCE GRAPH
                      </p>
                      <div className="flex gap-1.5">
                        {[
                          { v: result.graph.nodes.length, l: 'nodes', c: '#57C4FF' },
                          { v: result.graph.edges.length, l: 'edges', c: '#C057FF' },
                          { v: state.consensus?.agreed.length ?? 0, l: 'agreed', c: '#57FFB8' },
                        ].map(({ v, l, c }) => (
                          <span key={l} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${c}10`, color: c, fontFamily: 'var(--font-mono)', border: `1px solid ${c}20` }}>
                            {v} {l}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs transition-transform duration-300"
                      style={{ color: '#8888A0', transform: showGraph ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>
                      ▼
                    </span>
                  </button>

                  <AnimatePresence>
                    {showGraph && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}>
                        <ArgumentGraph data={result.graph} width={900} height={480} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Uncertainty note */}
            {isComplete && state.consensus?.uncertainty_note && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-xs text-center pb-2" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
                ⚠ {state.consensus.uncertainty_note}
              </motion.p>
            )}
          </div>
        )}

        {/* Idle state */}
        {!isActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {['🔬','⚖️','😈','🧠','🌐','🌀','📊','📜','🕸️'].map((icon, i) => (
                  <motion.span key={i} className="text-2xl" style={{ opacity: 0.35 }}
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.28 }}>
                    {icon}
                  </motion.span>
                ))}
              </div>
              <p className="text-sm" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
                9 agents standing by. Enter a question above.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
