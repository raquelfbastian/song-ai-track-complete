// Matches com.song.kapeko.model.Product (Java backend)
export interface Product {
  id: string
  name: string
  category: string
  roast: 'Light' | 'Medium' | 'Dark'
  origin: string
  farmer: string
  altitude: string
  variety: string
  process: string
  price_php: number
  sub_price_php: number
  flavor_notes: string[]
  best_for: string
  in_stock: boolean
  subscription_available: boolean

  // Lab 4 enriched fields (may be undefined before enrichment)
  seo_title?: string
  meta_description?: string
  product_description?: string
  marketing_hook?: string
  feature_bullets?: string[]
  pairing_suggestion?: string
}

export interface CatalogResponse {
  products: Product[]
  count?: number
  message?: string
}
