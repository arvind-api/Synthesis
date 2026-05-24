import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SYNTHESIS v2 — Adversarial Multi-Agent Epistemic Consensus Engine',
  description:
    '9 adversarial AI agents with RAG evidence retrieval debate any question across 3 rounds, producing a weighted consensus with fact-checking. Not what AI thinks — what AI agrees on after fighting itself.',
  keywords: ['AI', 'multi-agent', 'debate', 'consensus', 'epistemic', 'synthesis', 'RAG', 'fact-check'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-outfit antialiased">{children}</body>
    </html>
  )
}
