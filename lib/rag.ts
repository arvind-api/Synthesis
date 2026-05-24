import { EvidenceSource } from './types'

// ─── Topic Extraction ─────────────────────────────────────────────────────────

function extractTopics(question: string): string[] {
  // Remove common question words and extract key noun phrases
  const stopwords = new Set([
    'should', 'could', 'would', 'will', 'can', 'does', 'do', 'is', 'are', 'was', 'were',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'be', 'been', 'being', 'have', 'has', 'had', 'this', 'that',
    'these', 'those', 'it', 'its', 'we', 'they', 'their', 'our', 'your', 'my',
    'governments', 'government', 'people', 'society', 'world', 'why', 'how', 'what',
    'when', 'where', 'who', 'which', 'whether'
  ])

  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))

  // Return top 3 most meaningful terms
  return [...new Set(words)].slice(0, 3)
}

// ─── Wikipedia Search ─────────────────────────────────────────────────────────

async function searchWikipedia(query: string): Promise<string[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=2&origin=*`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []
    const data = await res.json()
    return (data.query?.search ?? []).map((r: { title: string }) => r.title)
  } catch {
    return []
  }
}

// ─── Wikipedia Summary ────────────────────────────────────────────────────────

async function getWikiSummary(title: string): Promise<{ extract: string; url: string } | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = await res.json()
    return {
      extract: data.extract ?? '',
      url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    }
  } catch {
    return null
  }
}

// ─── Tavily Search (optional, free tier) ──────────────────────────────────────

async function searchTavily(
  query: string,
  apiKey: string
): Promise<EvidenceSource[]> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        include_answer: true,
        max_results: 3,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results ?? []).map((r: { title: string; url: string; content: string; score?: number }) => ({
      sourceTitle: r.title,
      sourceURL: r.url,
      claim: r.content.slice(0, 200),
      confidence: Math.round((r.score ?? 0.7) * 100),
      type: 'neutral' as const,
    }))
  } catch {
    return []
  }
}

// ─── Main Retrieval Function ──────────────────────────────────────────────────

export async function retrieveEvidence(
  question: string,
  tavilyKey?: string
): Promise<EvidenceSource[]> {
  const sources: EvidenceSource[] = []

  // 1. Try Tavily first if API key provided (richer results)
  if (tavilyKey) {
    const tavilyResults = await searchTavily(question, tavilyKey)
    sources.push(...tavilyResults)
  }

  // 2. Wikipedia fallback / supplement
  const topics = extractTopics(question)
  // Add the whole question as a search too
  const queries = [question.slice(0, 80), ...topics].slice(0, 3)

  const wikiResults = await Promise.allSettled(
    queries.map(async (q) => {
      const titles = await searchWikipedia(q)
      const summaries = await Promise.allSettled(titles.map(t => getWikiSummary(t)))
      return titles.flatMap((title, i) => {
        const result = summaries[i]
        if (result.status !== 'fulfilled' || !result.value) return []
        const { extract, url } = result.value
        if (!extract || extract.length < 80) return []

        // Heuristic: classify as supporting/opposing based on sentiment indicators
        const lower = extract.toLowerCase()
        const opposingSignals = ['however', 'despite', 'critics', 'concern', 'risk', 'danger', 'fail', 'problem']
        const hasOpposing = opposingSignals.some(s => lower.includes(s))

        return [{
          sourceTitle: `Wikipedia: ${title}`,
          sourceURL: url,
          claim: extract.slice(0, 250).replace(/\n/g, ' ').trim(),
          confidence: 72,
          type: hasOpposing ? 'opposing' : 'supporting',
        } as EvidenceSource]
      })
    })
  )

  for (const r of wikiResults) {
    if (r.status === 'fulfilled') sources.push(...r.value)
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  const unique = sources.filter(s => {
    if (seen.has(s.sourceURL)) return false
    seen.add(s.sourceURL)
    return true
  })

  // Return up to 6 sources
  return unique.slice(0, 6)
}
