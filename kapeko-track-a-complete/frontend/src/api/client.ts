import { Product, CatalogResponse } from '../types/Product'

const BASE = '/api'  // proxied to Spring Boot :8080 via vite.config.ts

// ── Lab 3 endpoints ───────────────────────────────────────────────────

/** POST /api/catalog/generate — calls LLM, returns generated products */
export async function generateCatalog(): Promise<CatalogResponse> {
  const res = await fetch(`${BASE}/catalog/generate`, { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** GET /api/catalog — returns existing catalog */
export async function getCatalog(): Promise<CatalogResponse> {
  const res = await fetch(`${BASE}/catalog`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ── Lab 4 endpoints ───────────────────────────────────────────────────

/** POST /api/products/{id}/enrich — AI-enriches one product */
export async function enrichProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}/enrich`, { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** POST /api/catalog/enrich-all — batch enriches all products */
export async function enrichAll(): Promise<CatalogResponse> {
  const res = await fetch(`${BASE}/catalog/enrich-all`, { method: 'POST' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ── Lab 5 endpoints ───────────────────────────────────────────────────

/** GET /api/products — all products for listing page */
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/** GET /api/products/{id} — single product for detail page */
export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
