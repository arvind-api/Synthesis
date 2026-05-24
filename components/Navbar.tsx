'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', background: 'rgba(3,3,5,0.85)' }}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black"
          style={{ background: 'rgba(180,255,87,0.12)', border: '1px solid rgba(180,255,87,0.3)', color: '#B4FF57', fontFamily: 'var(--font-syne)', boxShadow: '0 0 16px rgba(180,255,87,0.15)' }}
        >
          S
        </div>
        <span className="text-sm font-black tracking-tight" style={{ fontFamily: 'var(--font-syne)', color: '#EEEEF8' }}>
          SYNTHESIS
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(180,255,87,0.1)', color: '#B4FF57', fontFamily: 'var(--font-mono)', fontSize: '9px' }}
        >
          v2
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-xs font-medium transition-colors"
          style={{ color: pathname === '/' ? '#EEEEF8' : '#8888A0', fontFamily: 'var(--font-syne)' }}
        >
          Home
        </Link>
        <Link
          href="/synthesize"
          className="text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
          style={{
            background: pathname === '/synthesize' ? '#B4FF57' : 'rgba(180,255,87,0.1)',
            color: pathname === '/synthesize' ? '#030305' : '#B4FF57',
            fontFamily: 'var(--font-syne)',
            boxShadow: pathname === '/synthesize' ? '0 0 20px rgba(180,255,87,0.25)' : 'none',
          }}
        >
          Synthesize →
        </Link>
      </div>
    </motion.nav>
  )
}
