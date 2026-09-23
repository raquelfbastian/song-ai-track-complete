import { useEffect, useState } from 'react'
import LabNav from '../components/LabNav'
import { getProducts, getRecommendations, processOrder, reindexCatalog, runCatalogPipeline } from '../api/client'
import { Product } from '../types/Product'

 type LabNumber = 5 | 6 | 7 | 8 | 9 | 10
const titles: Record<LabNumber, string> = { 5: 'Storefront', 6: 'Shopping Copilot', 7: 'Commerce RAG', 8: 'Recommendation Engine', 9: 'Order Agent', 10: 'Multi-Agent Catalog Pipeline' }

export default function LabWorkspace({ lab }: { lab: LabNumber }) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (lab === 5 || lab === 8) getProducts().then(data => { setProducts(data); if (data[0]) setSelectedId(data[0].id) }).catch(e => setError(e.message))
  }, [lab])

  async function run(action: () => Promise<unknown>) {
    setLoading(true); setError(''); setResult(null)
    try { setResult(await action()) } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return <div className="min-h-screen bg-stone-950 text-stone-100">
    <LabNav />
    <main className="max-w-3xl mx-auto px-6 py-10">
      <p className="text-xs font-semibold text-amber-500 tracking-widest uppercase mb-2">Lab {lab}</p>
      <h1 className="text-2xl font-light text-white mb-3">{titles[lab]}</h1>
      <p className="text-stone-400 text-sm mb-8">Interactive frontend for the Track A Node.js API.</p>
      {lab === 5 && <ProductGrid products={products} />}
      {lab === 6 && <ChatPanel message={message} setMessage={setMessage} loading={loading} run={run} />}
      {lab === 7 && <RagPanel loading={loading} run={run} />}
      {lab === 8 && <ProductSelect products={products} selectedId={selectedId} setSelectedId={setSelectedId} loading={loading} run={run} />}
      {lab === 9 && <ChatPanel message={message} setMessage={setMessage} loading={loading} run={run} label="Send order request" />}
      {lab === 10 && <button onClick={() => run(runCatalogPipeline)} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">{loading ? 'Running pipeline...' : 'Run multi-agent pipeline'}</button>}
      {error && <p className="mt-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">{error}</p>}
      {result !== null && <ResultView result={result} />}
    </main>
  </div>
}

function ProductGrid({ products }: { products: Product[] }) { return <div className="grid grid-cols-2 gap-4">{products.map(product => <div key={product.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4"><p className="text-xs text-stone-500">{product.id}</p><p className="mt-2 text-sm font-medium text-white">{product.name}</p><p className="mt-1 text-xs text-stone-500">{product.origin}</p><p className="mt-3 text-amber-400">₱{product.price_php}</p></div>)}</div> }
function ProductSelect({ products, selectedId, setSelectedId, loading, run }: { products: Product[]; selectedId: string; setSelectedId: (id: string) => void; loading: boolean; run: (action: () => Promise<unknown>) => void }) { return <div className="space-y-4"><select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full rounded-lg bg-stone-900 border border-stone-700 p-3 text-sm text-white">{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select><button disabled={!selectedId || loading} onClick={() => run(async () => ({ productId: selectedId, recommendations: await getRecommendations(selectedId) }))} className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Finding recommendations...' : 'Get recommendations'}</button></div> }
function ChatPanel({ message, setMessage, loading, run, label = 'Send message' }: { message: string; setMessage: (value: string) => void; loading: boolean; run: (action: () => Promise<unknown>) => void; label?: string }) { return <div className="space-y-4"><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a customer request..." className="min-h-32 w-full rounded-xl border border-stone-800 bg-stone-900 p-4 text-sm text-white outline-none" /><button disabled={!message.trim() || loading} onClick={() => run(() => label === 'Send order request' ? processOrder(message) : fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'lab6-demo', message }) }).then(response => response.json()))} className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Processing...' : label}</button></div> }
function RagPanel({ loading, run }: { loading: boolean; run: (action: () => Promise<unknown>) => void }) { const [query, setQuery] = useState(''); return <div className="space-y-4"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try: light floral coffee" className="w-full rounded-xl border border-stone-800 bg-stone-900 p-4 text-sm text-white" /><button disabled={!query.trim() || loading} onClick={() => run(() => fetch(`/api/search?q=${encodeURIComponent(query)}`).then(async response => { if (!response.ok) throw new Error(await response.text()); return response.json() }))} className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50">Search catalog</button><button onClick={() => run(reindexCatalog)} className="w-full rounded-xl border border-stone-700 py-3 text-sm text-stone-300">Re-index catalog</button></div> }

type TextResponse = { response: string; tool?: string; toolCalled?: boolean; type?: string }
type SearchResponse = { query: string; answer: string; products: Product[] }
type RecommendationResponse = { productId: string; recommendations: Product[] }
type PipelineItem = {
  productId: string
  productName: string
  catalogAgent?: { status?: string; notes?: string }
  merged: { product_description: string; marketing_hook: string; seo_title: string; meta_description: string }
}
type PipelineResponse = { status: string; productsProcessed: number; elapsedMs: number; agentsUsed: string[]; results: PipelineItem[] }

const has = (value: unknown, key: string) => typeof value === 'object' && value !== null && key in value

function ResultView({ result }: { result: unknown }) {
  let view: JSX.Element
  if (has(result, 'answer') && has(result, 'products')) view = <SearchResult result={result as SearchResponse} />
  else if (has(result, 'recommendations')) view = <RecommendationResult result={result as RecommendationResponse} />
  else if (has(result, 'results') && has(result, 'agentsUsed')) view = <PipelineResult result={result as PipelineResponse} />
  else if (has(result, 'response')) view = <ResponseCard result={result as TextResponse} />
  else if (has(result, 'message')) view = <p className="mt-6 rounded-xl border border-green-900 bg-green-950/30 p-4 text-sm text-green-300">✓ {(result as { message: string }).message}</p>
  else return <pre className="mt-6 overflow-auto rounded-xl border border-stone-800 bg-stone-900 p-5 text-xs text-green-300">{JSON.stringify(result, null, 2)}</pre>
  return <>
    {view}
    <details className="mt-4 text-xs text-stone-500">
      <summary className="cursor-pointer hover:text-stone-300">View raw JSON</summary>
      <pre className="mt-2 overflow-auto rounded-xl border border-stone-800 bg-stone-900 p-5 text-green-300">{JSON.stringify(result, null, 2)}</pre>
    </details>
  </>
}

// Renders **bold** segments from LLM output
function RichText({ text }: { text: string }) {
  const parts = text.trim().split(/(\*\*[^*]+\*\*)/g)
  return <>{parts.map((part, i) => part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="text-amber-400">{part.slice(2, -2)}</strong> : part)}</>
}

function ResponseCard({ result }: { result: TextResponse }) {
  const label = result.type === 'error' ? 'Error' : result.toolCalled ? 'Tool result' : 'Assistant response'
  return <div className={`mt-6 rounded-xl border border-stone-800 border-l-4 bg-stone-900 p-5 ${result.type === 'error' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
    <p className="mb-2 text-[11px] uppercase tracking-widest text-stone-500">{label}</p>
    <p className="whitespace-pre-line text-sm leading-relaxed text-stone-100"><RichText text={result.response} /></p>
    {result.tool && <p className="mt-3 text-xs font-semibold text-amber-500">Tool called: {result.tool}</p>}
  </div>
}

function ProductCard({ product }: { product: Product }) {
  return <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-medium text-white">{product.name}</p>
      <span className="shrink-0 rounded-full bg-stone-800 px-2 py-0.5 text-[10px] text-stone-400">{product.roast}</span>
    </div>
    <p className="mt-1 text-xs text-stone-500">{product.origin}</p>
    {product.flavor_notes?.length > 0 && <p className="mt-2 text-xs text-stone-400">{product.flavor_notes.join(' · ')}</p>}
    <p className="mt-3 text-sm text-amber-400">₱{product.price_php} <span className="text-xs text-stone-500">· ₱{product.sub_price_php}/mo</span></p>
  </div>
}

function SearchResult({ result }: { result: SearchResponse }) {
  return <div className="mt-6 space-y-4">
    <div className="rounded-xl border border-stone-800 border-l-4 border-l-amber-500 bg-stone-900 p-5">
      <p className="mb-2 text-[11px] uppercase tracking-widest text-stone-500">AI answer</p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-stone-100"><RichText text={result.answer} /></p>
    </div>
    <p className="text-[11px] uppercase tracking-widest text-stone-500">Retrieved products ({result.products.length})</p>
    <div className="grid gap-3 sm:grid-cols-3">{result.products.map(p => <ProductCard key={p.id} product={p} />)}</div>
  </div>
}

function RecommendationResult({ result }: { result: RecommendationResponse }) {
  return <div className="mt-6 space-y-4">
    <p className="text-[11px] uppercase tracking-widest text-stone-500">You might also like ({result.recommendations.length})</p>
    {result.recommendations.length === 0
      ? <p className="text-sm text-stone-400">No similar products found.</p>
      : <div className="grid gap-3 sm:grid-cols-3">{result.recommendations.map(p => <ProductCard key={p.id} product={p} />)}</div>}
  </div>
}

function PipelineResult({ result }: { result: PipelineResponse }) {
  return <div className="mt-6 space-y-4">
    <p className="rounded-xl border border-green-900 bg-green-950/30 p-4 text-sm text-green-300">
      ✓ {result.productsProcessed} products processed in {(result.elapsedMs / 1000).toFixed(1)}s by {result.agentsUsed.join(', ')}
    </p>
    {result.results.map(item => <div key={item.productId} className="rounded-xl border border-stone-800 bg-stone-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-white">{item.productName}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${item.catalogAgent?.status === 'validated' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>{item.catalogAgent?.status || 'unknown'}</span>
      </div>
      {item.merged.marketing_hook && <p className="mt-2 text-sm italic text-amber-400">“{item.merged.marketing_hook}”</p>}
      {item.merged.seo_title && <div className="mt-4 rounded-lg bg-stone-950 p-3">
        <p className="text-sm text-blue-300">{item.merged.seo_title}</p>
        <p className="mt-1 text-xs text-stone-400">{item.merged.meta_description}</p>
      </div>}
      {item.merged.product_description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-stone-300">{item.merged.product_description}</p>}
      {item.catalogAgent?.notes && <p className="mt-4 text-xs text-stone-500">Catalog Agent: {item.catalogAgent.notes}</p>}
    </div>)}
  </div>
}
