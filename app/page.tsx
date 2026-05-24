'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '@/components/Navbar'
import { AGENTS } from '@/lib/agents'

function Counter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(ease * target))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return <span ref={ref}>{count.toLocaleString()}</span>
}

const ORBIT_AGENTS = AGENTS.map((a, i) => ({
  ...a,
  angle: (i / AGENTS.length) * 360,
  radius: i % 2 === 0 ? 140 : 110,
  speed: 18 + i * 3,
  reverse: i % 3 === 0,
}))

function OrbitalSystem() {
  return (
    <div className="relative mx-auto" style={{ width: 320, height: 320 }}>
      {[140, 110].map(r => (
        <div key={r} className="absolute rounded-full"
          style={{
            width: r * 2, height: r * 2,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(255,255,255,0.05)',
          }} />
      ))}
      <div className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 56, height: 56, top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(180,255,87,0.1)',
          border: '1px solid rgba(180,255,87,0.35)',
          boxShadow: '0 0 30px rgba(180,255,87,0.2)',
          fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18,
          color: '#B4FF57',
        }}>S</div>

      {ORBIT_AGENTS.map((a) => (
        <motion.div key={a.id}
          className="absolute flex items-center justify-center rounded-full text-base"
          style={{
            width: 36, height: 36,
            top: '50%', left: '50%',
            marginTop: -18, marginLeft: -18,
            background: `${a.color}18`,
            border: `1px solid ${a.color}40`,
            boxShadow: `0 0 12px ${a.color}20`,
          }}
          animate={{ rotate: a.reverse ? -360 : 360 }}
          transition={{ duration: a.speed, repeat: Infinity, ease: 'linear' }}
          initial={{ rotate: a.angle }}
        >
          <motion.div
            style={{ translateX: a.radius }}
            animate={{ rotate: a.reverse ? 360 : -360 }}
            transition={{ duration: a.speed, repeat: Infinity, ease: 'linear' }}
            className="absolute flex items-center justify-center rounded-full text-base"
            title={a.name}
          >
            <span>{a.icon}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  return (
    <main className="min-h-screen" style={{ background: '#030305' }}>
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden grid-bg">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(180,255,87,0.06) 0%, transparent 70%)' }} />

        <motion.div style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ border: '1px solid rgba(180,255,87,0.25)', background: 'rgba(180,255,87,0.07)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#B4FF57', boxShadow: '0 0 6px #B4FF57' }} />
            <span className="text-xs font-semibold tracking-widest" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>
              ADVERSARIAL MULTI-AGENT EPISTEMIC ENGINE v2
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-syne)' }}>
            Not what AI thinks.
            <br />
            <span style={{ color: '#B4FF57' }}>What AI agrees on</span>
            <br />
            after fighting itself.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg max-w-xl mb-10 leading-relaxed" style={{ color: '#8888A0' }}>
            SYNTHESIS v2 deploys 9 adversarial AI agents with conflicting epistemic priors,
            backed by real-time evidence retrieval. They debate across 3 rounds. Truth emerges from friction.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex items-center gap-4 flex-wrap justify-center mb-16">
            <Link href="/synthesize"
              className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
              style={{ background: '#B4FF57', color: '#030305', fontFamily: 'var(--font-syne)', boxShadow: '0 0 30px rgba(180,255,87,0.3)' }}>
              Start Synthesis →
            </Link>
            <a href="#how-it-works"
              className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#8888A0', fontFamily: 'var(--font-syne)' }}>
              How it works
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}>
            <OrbitalSystem />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 9, suffix: '', label: 'Adversarial agents', color: '#B4FF57' },
            { value: 3, suffix: '', label: 'Debate rounds', color: '#57C4FF' },
            { value: 1000, suffix: '+', label: 'Questions synthesized', color: '#C057FF' },
            { value: 94, suffix: '%', label: 'Nuance vs single AI', color: '#57FFB8' },
          ].map(({ value, suffix, label, color }) => (
            <div key={label}>
              <div className="text-4xl font-black mb-1" style={{ color, fontFamily: 'var(--font-mono)' }}>
                <Counter target={value} />{suffix}
              </div>
              <p className="text-xs" style={{ color: '#8888A0' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="text-center mb-16">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>THE PROBLEM</p>
          <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-syne)' }}>
            Every AI gives you one answer.<br />
            <span style={{ color: '#FF5757' }}>That&apos;s the problem.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🎭', title: 'Single perspective', desc: 'One model. One training bias. One worldview. Complex questions need more.', color: '#FF5757' },
            { icon: '🪞', title: 'No adversarial check', desc: "No one challenges the AI's reasoning. Errors compound unchallenged.", color: '#FFD557' },
            { icon: '🌫️', title: 'Hidden uncertainty', desc: "AI sounds confident even when genuinely uncertain. You cannot tell.", color: '#FF8557' },
          ].map(({ icon, title, desc, color }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-2xl"
              style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-bold mb-2 text-sm" style={{ color, fontFamily: 'var(--font-syne)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8888A0' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6"
        style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs tracking-widest mb-3" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>THE PROCESS</p>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-syne)' }}>Five steps. One truth.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Evidence', desc: 'Wikipedia and web sources retrieved before debate. Agents reason from evidence, not memory.', icon: '🔍', color: '#57E4FF' },
              { step: '02', title: 'Round 1', desc: '9 agents form independent positions simultaneously with no groupthink.', icon: '⚡', color: '#57C4FF' },
              { step: '03', title: 'Round 2', desc: 'Agents challenge each other\'s assumptions and identify logical fallacies.', icon: '⚔️', color: '#FFD557' },
              { step: '04', title: 'Round 3', desc: 'Each agent defends their strongest claim and revises confidence scores.', icon: '🛡️', color: '#FF8557' },
              { step: '05', title: 'Synthesis', desc: 'Weighted consensus engine plus fact-check layer produces a scored epistemic report.', icon: '🧬', color: '#B4FF57' },
            ].map(({ step, title, desc, icon, color }, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative p-5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="absolute top-3 right-3 text-4xl font-black opacity-10"
                  style={{ color, fontFamily: 'var(--font-syne)' }}>{step}</div>
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold mb-2 text-sm" style={{ color, fontFamily: 'var(--font-syne)' }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#8888A0' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-16">
          <p className="text-xs tracking-widest mb-3" style={{ color: '#B4FF57', fontFamily: 'var(--font-mono)' }}>THE AGENTS</p>
          <h2 className="text-4xl font-black" style={{ fontFamily: 'var(--font-syne)' }}>Nine minds. Zero consensus bias.</h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {AGENTS.map((agent, i) => (
            <motion.div key={agent.id}
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="p-5 rounded-2xl"
              style={{ background: agent.bgColor, border: `1px solid ${agent.color}22` }}>
              <div className="text-2xl mb-3">{agent.icon}</div>
              <h3 className="font-bold text-sm mb-1" style={{ color: agent.color, fontFamily: 'var(--font-syne)' }}>
                {agent.name}
              </h3>
              <p className="text-xs mb-2" style={{ color: '#8888A0' }}>{agent.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#666688' }}>{agent.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(180,255,87,0.07) 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'var(--font-syne)' }}>
            Stop asking AI what to think.
            <br />
            <span style={{ color: '#B4FF57' }}>Start watching AI fight over it.</span>
          </h2>
          <p className="text-sm mb-10" style={{ color: '#8888A0' }}>
            One question. Nine perspectives. Evidence-backed. The truth that survives the debate.
          </p>
          <Link href="/synthesize"
            className="inline-block px-10 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105"
            style={{ background: '#B4FF57', color: '#030305', fontFamily: 'var(--font-syne)', boxShadow: '0 0 40px rgba(180,255,87,0.35)' }}>
            Synthesize Your Question →
          </Link>
        </motion.div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs" style={{ color: '#44445A', fontFamily: 'var(--font-mono)' }}>
          SYNTHESIS v2 — Adversarial Multi-Agent Epistemic Consensus Engine · 9 Agents · RAG · Groq + Next.js
        </p>
      </footer>
    </main>
  )
}
