// ProductDetail.tsx — Lab 5 + Lab 8 Recommendations integrated

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Product } from '../types/Product'
import { getProduct } from '../api/client'
import Recommendations from '../components/Recommendations'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 64, color: '#A8A29E' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>☕</div>
      <code style={{ fontSize: 12 }}>GET /api/products/{id}</code>
    </div>
  )

  if (!product) return (
    <div style={{ textAlign: 'center', padding: 64 }}>
      <p style={{ color: '#DC2626', marginBottom: 12 }}>Product not found</p>
      <Link to="/" style={{ color: '#F59E0B' }}>← Back to store</Link>
    </div>
  )

  const roastBg = product.roast === 'Light' ? '#FEF9F2' : product.roast === 'Dark' ? '#292524' : '#FEF3C7'

  return (
    <div style={{ background: '#FAFAF9', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ background: '#1C1917', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>← Back</Link>
        <span style={{ color: '#fff', fontWeight: 700 }}>☕ Kape Ko</span>
        <span style={{ color: '#78716C', fontSize: 11 }}>{product.id}</span>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero image placeholder */}
        <div style={{ height: 200, background: roastBg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, marginBottom: 24 }}>☕</div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, background: '#FEF9C3', color: '#92400E', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{product.roast} Roast</span>
          <span style={{ fontSize: 11, background: '#F5F5F4', color: '#78716C', padding: '3px 10px', borderRadius: 20 }}>{product.category}</span>
        </div>

        {/* Name + hook */}
        <h1 style={{ fontSize: 30, fontWeight: 300, color: '#1C1917', marginBottom: 8, lineHeight: 1.2 }}>{product.name}</h1>
        {product.marketing_hook && (
          <p style={{ fontSize: 17, fontStyle: 'italic', color: '#B45309', marginBottom: 24 }}>"{product.marketing_hook}"</p>
        )}

        {/* Origin grid */}
        <div style={{ background: '#fff', border: '0.5px solid #E7E5E4', borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            ['Origin', product.origin],
            ['Farmer', product.farmer],
            ['Altitude', product.altitude],
            ['Variety', product.variety],
            ['Process', product.process],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: '#A8A29E', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1917' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Flavor chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {product.flavor_notes?.map(f => (
            <span key={f} style={{ background: '#FEF3C7', color: '#92400E', fontSize: 12, padding: '4px 12px', borderRadius: 20 }}>{f}</span>
          ))}
        </div>

        {/* Description */}
        {product.product_description && (
          <div style={{ fontSize: 13, color: '#57534E', lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-line' }}>
            {product.product_description}
          </div>
        )}

        {/* Feature bullets */}
        {product.feature_bullets && product.feature_bullets.length > 0 && (
          <ul style={{ marginBottom: 24, paddingLeft: 0, listStyle: 'none' }}>
            {product.feature_bullets.map((b, i) => (
              <li key={i} style={{ fontSize: 13, color: '#57534E', padding: '4px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>▸</span> {b}
              </li>
            ))}
          </ul>
        )}

        {/* Pricing box */}
        <div style={{ background: '#fff', border: '0.5px solid #E7E5E4', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: '#A8A29E', marginBottom: 4 }}>One-time</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>₱{product.price_php}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#A8A29E', marginBottom: 4 }}>Monthly subscription</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#D97706' }}>₱{product.sub_price_php}</div>
              <div style={{ fontSize: 11, color: '#16A34A' }}>Save ₱{product.price_php - product.sub_price_php}/mo</div>
            </div>
          </div>
          <button style={{ width: '100%', padding: 14, background: '#D97706', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Subscribe — ₱{product.sub_price_php}/mo via GCash
          </button>
        </div>

        {/* Pairing */}
        {product.pairing_suggestion && (
          <p style={{ textAlign: 'center', color: '#A8A29E', fontSize: 13, fontStyle: 'italic', marginBottom: 32 }}>
            ☕ {product.pairing_suggestion}
          </p>
        )}

        {/* Recommendations (Lab 8) */}
        <Recommendations productId={product.id} />

      </div>
    </div>
  )
}
