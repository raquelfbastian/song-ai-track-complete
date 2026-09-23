import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LabNav from '../components/LabNav'
import { getCatalog, enrichProduct } from '../api/client'
import { Product } from '../types/Product'

export default function Lab4() {
  const [products, setProducts] = useState<Product[]>([])
  const [enriched, setEnriched] = useState<Record<string, Product>>({})
  const [enriching, setEnriching] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCatalog()
      .then(r => setProducts(r.products || []))
      .finally(() => setLoading(false))
  }, [])

  async function enrich(product: Product) {
    setEnriching(product.id)
    try {
      const result = await enrichProduct(product.id)
      setEnriched(e => ({ ...e, [product.id]: result }))
    } finally {
      setEnriching(null)
    }
  }

  const selected = enriched[Object.keys(enriched)[Object.keys(enriched).length - 1]]
  const allDone = products.length > 0 && Object.keys(enriched).length === products.length

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <LabNav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold text-amber-500 tracking-widest uppercase mb-2">Lab 4</p>
          <h1 className="text-2xl font-light text-white mb-2">Product Content Studio</h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            <code className="text-amber-400">ContentService</code> reads each product from catalog.json,
            sends it to the LLM with Kape Ko brand voice instructions,
            enriches with SEO title, description, marketing hook, and feature bullets.
          </p>
        </div>

        {loading && (
          <p className="text-stone-500 text-sm">Loading catalog from Spring Boot...</p>
        )}

        {!loading && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {products.map(p => {
              const isEnriched = !!enriched[p.id]
              const isLoading = enriching === p.id
              return (
                <button key={p.id} onClick={() => !isLoading && enrich(p)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isEnriched
                      ? 'border-green-600/40 bg-green-950/30'
                      : isLoading
                      ? 'border-amber-500/40 bg-amber-950/20'
                      : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                  }`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-stone-500">{p.id}</span>
                    {isEnriched && <span className="text-green-400 text-xs">✓ enriched</span>}
                    {isLoading && <span className="text-amber-400 text-xs animate-pulse">generating...</span>}
                  </div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{p.roast} · {p.origin.split(',')[0]}</p>
                </button>
              )
            })}
          </div>
        )}

        {/* Content preview */}
        {selected && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-6">
            <p className="text-xs text-stone-500 mb-4 font-mono">
              POST /api/products/{selected.id}/enrich → 200 OK
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-stone-500 mb-1">SEO Title</p>
                <p className="text-sm font-medium text-white">{selected.seo_title}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Marketing Hook</p>
                <p className="text-base italic text-amber-400">"{selected.marketing_hook}"</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Product Description</p>
                <p className="text-sm text-stone-300 leading-relaxed line-clamp-4">
                  {selected.product_description}
                </p>
              </div>
              {selected.feature_bullets && (
                <div>
                  <p className="text-xs text-stone-500 mb-2">Feature Bullets</p>
                  <ul className="space-y-1">
                    {selected.feature_bullets.map((b, i) => (
                      <li key={i} className="text-xs text-stone-400 flex gap-2">
                        <span className="text-amber-500">▸</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {allDone && (
          <Link to="/"
            className="block w-full text-center bg-amber-500 hover:bg-amber-600 text-white
              font-semibold py-3.5 rounded-xl transition-colors">
            Lab 5: View the Storefront →
          </Link>
        )}
        {!allDone && products.length > 0 && (
          <p className="text-center text-stone-500 text-sm">
            Click each product to enrich it ({Object.keys(enriched).length}/{products.length} done)
          </p>
        )}
      </div>
    </div>
  )
}
