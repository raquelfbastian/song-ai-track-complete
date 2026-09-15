// App.tsx — Kape Ko Storefront
// Level 2: Product listing, roast filter, Lab 3 & Lab 4 pages
// Level 3: SearchBar (Lab 7) + ChatWidget (Lab 6) integrated

import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Product } from './types/Product'
import { getProducts } from './api/client'
import ProductDetail from './pages/ProductDetail'
import Lab3 from './pages/Lab3'
import Lab4 from './pages/Lab4'
import SearchBar from './components/SearchBar'
import ChatWidget from './components/ChatWidget'

type RoastFilter = 'All' | 'Light' | 'Medium' | 'Dark'

function ProductListing() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [filter, setFilter] = useState<RoastFilter>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getProducts()
      .then(data => { setProducts(data); setFiltered(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setFiltered(filter === 'All' ? products : products.filter(p => p.roast === filter))
  }, [filter, products])

  const roastColor = (roast: string) => {
    if (roast === 'Light') return { bg: '#FEF9F2', badge: '#FEF9C3', text: '#92400E' }
    if (roast === 'Dark') return { bg: '#292524', badge: '#E7E5E4', text: '#292524' }
    return { bg: '#FEF3C7', badge: '#FED7AA', text: '#9A3412' }
  }

  return (
    <div style={{ background: '#FAFAF9', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: '#1C1917', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>☕ Kape Ko</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Light', 'Medium', 'Dark'] as RoastFilter[]).map(r => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === r ? '#F59E0B' : 'transparent', color: filter === r ? '#fff' : '#78716C' }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/lab3" style={{ color: '#78716C', fontSize: 13, textDecoration: 'none' }}>Lab 3</Link>
          <Link to="/lab4" style={{ color: '#78716C', fontSize: 13, textDecoration: 'none' }}>Lab 4</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: '#1C1917', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#F59E0B', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Single Origin · Farm to Cup · Subscription</p>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 300, marginBottom: 12, lineHeight: 1.2 }}>Filipino Coffee,<br />Traced to the Farm</h1>
        <p style={{ color: '#78716C', fontSize: 14 }}>Every bag tells you exactly which farm it came from.</p>
      </div>

      {/* Search bar (Lab 7) */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E7E5E4', paddingTop: 16 }}>
        <SearchBar />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>☕</div>
          <p style={{ color: '#A8A29E', fontSize: 13 }}>Loading catalog from Spring Boot...</p>
          <code style={{ color: '#D1C5BC', fontSize: 11 }}>GET /api/products</code>
        </div>
      )}

      {error && (
        <div style={{ maxWidth: 480, margin: '48px auto', textAlign: 'center', padding: '0 24px' }}>
          <p style={{ color: '#DC2626', fontWeight: 600, marginBottom: 8 }}>Spring Boot not running</p>
          <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>{error}</p>
          <Link to="/lab3" style={{ background: '#F59E0B', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
            Go to Lab 3 → Generate catalog first
          </Link>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: 24 }}>
          <p style={{ color: '#A8A29E', fontSize: 13, marginBottom: 16 }}>
            {filtered.length} products · AI-generated via Spring Boot + LLM API
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {filtered.map(p => {
              const colors = roastColor(p.roast)
              return (
                <div key={p.id} onClick={() => navigate(`/products/${p.id}`)}
                  style={{ background: '#fff', border: '0.5px solid #E7E5E4', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#FCD34D')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#E7E5E4')}>
                  <div style={{ height: 72, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>☕</div>
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10, background: colors.badge, color: colors.text, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>{p.roast}</span>
                      <span style={{ fontSize: 10, color: '#A8A29E' }}>{p.id}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1C1917', marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: '#A8A29E', marginBottom: 8 }}>{p.origin}</p>
                    {p.marketing_hook && <p style={{ fontSize: 11, color: '#78716C', fontStyle: 'italic', marginBottom: 8 }}>"{p.marketing_hook}"</p>}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                      {p.flavor_notes?.slice(0, 3).map(f => (
                        <span key={f} style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20 }}>{f}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>₱{p.sub_price_php}</span><span style={{ fontSize: 11, color: '#A8A29E' }}>/mo</span></div>
                      <span style={{ fontSize: 11, color: '#A8A29E' }}>₱{p.price_php} one-time</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chat widget (Lab 6) */}
      <ChatWidget />

      {/* Architecture badge */}
      <div style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', background: 'rgba(28,25,23,.9)', backdropFilter: 'blur(8px)', color: '#A8A29E', fontSize: 12, padding: '8px 20px', borderRadius: 20, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        <span style={{ color: '#22C55E', fontWeight: 700 }}>● LIVE</span>  Spring Boot :8080 → React :5173 → LLM API
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductListing />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/lab3" element={<Lab3 />} />
      <Route path="/lab4" element={<Lab4 />} />
    </Routes>
  )
}
