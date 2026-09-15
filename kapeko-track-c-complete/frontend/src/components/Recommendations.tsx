// Recommendations.tsx — Lab 8: Recommendation Engine
// "You might also like" section for the product detail page.
// Add this to ProductDetail.tsx, below the pricing box.
//
// Usage: <Recommendations productId={product.id} />

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../types/Product'

interface Props {
  productId: string
}

async function getRecommendations(productId: string): Promise<Product[]> {
  const res = await fetch(`/api/products/${productId}/recommendations?topN=3`)
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.recommendations || []
}

export default function Recommendations({ productId }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getRecommendations(productId)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [productId])

  if (loading || products.length === 0) return null

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#A8A29E',
        textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 12,
      }}>
        You might also like
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => (
          <Link key={p.id} to={`/products/${p.id}`}
            style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', border: '0.5px solid #E7E5E4',
              borderRadius: 10, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'border-color .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#FCD34D')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E7E5E4')}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: p.roast === 'Light' ? '#FEF9F2' : p.roast === 'Dark' ? '#292524' : '#FEF3C7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                ☕
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1917', marginBottom: 2 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: '#A8A29E' }}>
                  {p.roast} · {p.flavor_notes.slice(0, 2).join(', ')}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B', flexShrink: 0 }}>
                ₱{p.sub_price_php}/mo
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        marginTop: 10, fontSize: 11, color: '#D1C5BC', textAlign: 'center',
        fontStyle: 'italic',
      }}>
        Powered by vector similarity search
      </div>
    </div>
  )
}
