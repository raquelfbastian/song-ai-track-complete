// SearchBar.tsx — Lab 7: Commerce RAG
// Semantic search component for the Kape Ko storefront.
// Add this to App.tsx between the nav and the product grid.
//
// Usage: <SearchBar />

import { useState } from 'react'
import { Product } from '../types/Product'

interface SearchResult {
  query: string
  answer: string
  sources: string[]
  products: Product[]
}

async function semanticSearch(query: string): Promise<SearchResult> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await semanticSearch(query)
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setQuery('')
    setResult(null)
    setError(null)
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 20px' }}>
      {/* Search input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder='Try: "light floral coffee" or "coffee for a stressed Monday"'
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 10,
            border: '0.5px solid #E7E5E4', fontSize: 13,
            outline: 'none', fontFamily: 'inherit',
            background: '#fff',
          }}
        />
        <button onClick={handleSearch} disabled={loading || !query.trim()}
          style={{
            padding: '10px 20px', background: '#1C1917',
            color: '#fff', border: 'none', borderRadius: 10,
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
            opacity: loading || !query.trim() ? 0.5 : 1,
          }}>
          {loading ? '...' : 'Search'}
        </button>
        {result && (
          <button onClick={handleClear}
            style={{
              padding: '10px 16px', background: 'transparent',
              color: '#A8A29E', border: '0.5px solid #E7E5E4',
              borderRadius: 10, cursor: 'pointer', fontSize: 13,
            }}>
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#FFF5F5', border: '0.5px solid #FECACA',
          borderRadius: 10, padding: '12px 16px',
          color: '#DC2626', fontSize: 13, marginBottom: 12,
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          background: '#fff', border: '0.5px solid #E7E5E4',
          borderRadius: 12, padding: 16, marginBottom: 12,
        }}>
          {/* AI Answer */}
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 10, color: '#A8A29E', textTransform: 'uppercase',
              letterSpacing: '.5px', marginBottom: 6,
            }}>
              🤖 AI Answer (grounded in catalog)
            </div>
            <div style={{ fontSize: 14, color: '#1C1917', lineHeight: 1.6 }}>
              {result.answer}
            </div>
          </div>

          {/* Sources */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#A8A29E' }}>Sources:</span>
            {result.sources.map(s => (
              <span key={s} style={{
                fontSize: 11, background: '#FEF3C7', color: '#92400E',
                padding: '2px 8px', borderRadius: 20,
              }}>{s}</span>
            ))}
          </div>

          {/* Matched products */}
          {result.products.length > 0 && (
            <div style={{ marginTop: 12, borderTop: '0.5px solid #E7E5E4', paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: '#A8A29E', marginBottom: 8 }}>
                Top matches by semantic similarity:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.products.map((p, i) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#FAFAF9', borderRadius: 8, padding: '8px 12px',
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: i === 0 ? '#F59E0B' : '#E7E5E4',
                      color: i === 0 ? '#fff' : '#A8A29E',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#A8A29E' }}>{p.roast} · {p.best_for}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>
                      ₱{p.sub_price_php}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
