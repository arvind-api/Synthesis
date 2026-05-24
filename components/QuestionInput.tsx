'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const JUDGE_PROMPTS = [
  { icon: '🤖', label: 'AI Regulation', q: 'Should governments regulate artificial intelligence?' },
  { icon: '📱', label: 'Social Media', q: 'Is social media causing a mental health crisis in young people?' },
  { icon: '🎓', label: 'AI & Education', q: 'Can artificial intelligence replace human teachers?' },
  { icon: '🤖⚔️', label: 'Autonomous Weapons', q: 'Should autonomous weapons systems be banned internationally?' },
  { icon: '💰', label: 'UBI', q: 'Is universal basic income economically viable and socially desirable?' },
]

interface Props {
  onSubmit: (question: string, useMock: boolean) => void
  loading: boolean
}

export default function QuestionInput({ onSubmit, loading }: Props) {
  const [question, setQuestion] = useState('')
  const [useMock, setUseMock] = useState(false)
  const [judgeOpen, setJudgeOpen] = useState(false)
  const charCount = question.length

  const handleSubmit = () => {
    if (question.trim().length < 10 || loading) return
    onSubmit(question.trim(), useMock)
  }

  const pickJudge = (q: string) => {
    setQuestion(q)
    setUseMock(false)
    setJudgeOpen(false)
  }

  const isReady = question.trim().length >= 10

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs font-medium tracking-widest uppercase" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
          QUESTION UNDER DEBATE
        </p>
        <div className="flex items-center gap-2">
          {/* Judge Mode button */}
          <button
            onClick={() => setJudgeOpen(v => !v)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5"
            style={{
              border: '1px solid rgba(180,255,87,0.25)',
              background: judgeOpen ? 'rgba(180,255,87,0.1)' : 'transparent',
              color: judgeOpen ? '#B4FF57' : '#8888A0',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⚡ JUDGE MODE
          </button>
          <button
            onClick={() => { setQuestion(''); setUseMock(true); onSubmit('Should governments regulate artificial intelligence?', true) }}
            className="text-xs px-3 py-1 rounded-md transition-all duration-200 hover:text-[#B4FF57]"
            style={{ color: '#8888A0', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Quick Demo
          </button>
        </div>
      </div>

      {/* Judge Mode Panel */}
      <AnimatePresence>
        {judgeOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-3 overflow-hidden"
          >
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(180,255,87,0.04)', border: '1px solid rgba(180,255,87,0.15)' }}>
              <p className="text-xs mb-2 font-semibold" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
                ⚡ JUDGE MODE — One-click demo questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {JUDGE_PROMPTS.map(({ icon, label, q }) => (
                  <button
                    key={label}
                    onClick={() => pickJudge(q)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-all duration-150 hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#EEEEF8', fontFamily: 'var(--font-syne)' }}>{label}</p>
                      <p className="text-xs leading-snug" style={{ color: '#8888A0' }}>{q.slice(0, 45)}…</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          border: `1px solid ${isReady ? 'rgba(180,255,87,0.35)' : 'rgba(255,255,255,0.08)'}`,
          background: 'rgba(255,255,255,0.02)',
          boxShadow: isReady ? '0 0 30px rgba(180,255,87,0.06)' : 'none',
        }}
      >
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          placeholder="Ask any complex question — political, scientific, ethical, philosophical, strategic..."
          rows={3}
          maxLength={500}
          className="w-full bg-transparent px-5 py-4 text-base resize-none outline-none placeholder:text-[#44445A]"
          style={{ color: '#EEEEF8', fontFamily: 'var(--font-outfit)', lineHeight: '1.6' }}
          disabled={loading}
        />
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-xs" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
            {charCount}/500 · Ctrl+Enter to run
          </span>
          <div className="flex items-center gap-3">
            {/* Mock toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setUseMock(v => !v)}
                className="w-8 h-4 rounded-full relative transition-all duration-200 cursor-pointer"
                style={{ background: useMock ? 'rgba(180,255,87,0.3)' : 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                  style={{ background: useMock ? '#B4FF57' : '#44445A', left: useMock ? '18px' : '2px' }}
                />
              </div>
              <span className="text-xs" style={{ color: '#8888A0' }}>Demo mode</span>
            </label>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!isReady || loading}
              className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              style={{
                background: isReady && !loading ? '#B4FF57' : 'rgba(180,255,87,0.15)',
                color: isReady && !loading ? '#030305' : '#B4FF57',
                fontFamily: 'var(--font-syne)',
                boxShadow: isReady && !loading ? '0 0 20px rgba(180,255,87,0.25)' : 'none',
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >⟳</motion.span>
                  Synthesizing…
                </span>
              ) : 'Synthesize →'}
            </button>
          </div>
        </div>
      </div>

      {!isReady && question.length > 0 && (
        <p className="mt-2 text-xs" style={{ color: '#FF8557' }}>Enter at least 10 characters to start</p>
      )}
    </div>
  )
}
