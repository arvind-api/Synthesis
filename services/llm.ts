/**
 * Multi-model LLM service with automatic fallback.
 * Priority: Groq → Gemini → Mistral → mock
 */

export type ModelProvider = 'groq' | 'gemini' | 'mistral'

interface LLMResponse { text: string; provider: ModelProvider }

async function callGroq(prompt: string, maxTokens: number): Promise<string> {
  const { default: Groq } = await import('groq-sdk')
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: maxTokens,
    temperature: 0.72,
    messages: [{ role: 'user', content: prompt }],
  })
  return res.choices[0]?.message?.content ?? ''
}

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No Gemini key')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(20000),
    }
  )
  if (!res.ok) throw new Error('Gemini failed')
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callMistral(prompt: string): Promise<string> {
  const key = process.env.MISTRAL_API_KEY
  if (!key) throw new Error('No Mistral key')
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error('Mistral failed')
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function runLLM(
  prompt: string,
  maxTokens = 520
): Promise<LLMResponse> {
  // Try Groq first
  if (process.env.GROQ_API_KEY) {
    try {
      const text = await callGroq(prompt, maxTokens)
      if (text) return { text, provider: 'groq' }
    } catch (e) {
      console.warn('[LLM] Groq failed, trying Gemini:', e)
    }
  }
  // Fallback: Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await callGemini(prompt)
      if (text) return { text, provider: 'gemini' }
    } catch (e) {
      console.warn('[LLM] Gemini failed, trying Mistral:', e)
    }
  }
  // Fallback: Mistral
  if (process.env.MISTRAL_API_KEY) {
    try {
      const text = await callMistral(prompt)
      if (text) return { text, provider: 'mistral' }
    } catch (e) {
      console.warn('[LLM] Mistral failed:', e)
    }
  }
  return { text: '', provider: 'groq' }
}
