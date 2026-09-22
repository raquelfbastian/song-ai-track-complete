import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getRecommendations, processOrder, reindexCatalog, runCatalogPipeline, searchCatalog } from '../api/client'
import { Product } from '../types/Product'
import SearchBar from '../components/SearchBar'

type LabNumber = 5 | 6 | 7 | 8 | 9 | 10

const titles: Record<LabNumber, string> = {
  5: 'Storefront', 6: 'Shopping Copilot', 7: 'Commerce RAG',
  8: 'Recommendation Engine', 9: 'Order Agent', 10: 'Multi-Agent Catalog Pipeline',
}

export default function LabWorkspace({ lab }: { lab: LabNumber }) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (lab === 5 || lab === 8) getProducts().then(data => {
      setProducts(data)
      if (data[0]) setSelectedId(data[0].id)
    }).catch(e => setError(e.message))
  }, [lab])

  async function run(action: () => Promise<unknown>) {
    setLoading(true); setError(''); setResult(null)
    try { setResult(await action()) } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <nav className="border-b border-stone-800 px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-stone-500 text-sm hover:text-stone-300">← Storefront</Link>
        <span className="text-amber-500 text-sm font-semibold">Lab {lab}: {titles[lab]}</span>
        <div className="flex gap-3 text-xs text-stone-500">
          {([3, 4, 5, 6, 7, 8, 9, 10] as const).map(number => <Link key={number} to={`/lab${number}`} className="hover:text-amber-400">L{number}</Link>)}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-xs font-semibold text-amber-500 tracking-widest uppercase mb-2">Lab {lab}</p>
        <h1 className="text-2xl font-light text-white mb-3">{titles[lab]}</h1>
        <p className="text-stone-400 text-sm mb-8">Interactive frontend for the Track C backend endpoint.</p>

        {lab === 5 && <ProductGrid products={products} />}
        {lab === 6 && <ChatPanel message={message} setMessage={setMessage} loading={loading} run={run} />}
        {lab === 7 && <section className="space-y-4"><SearchBar /><button onClick={() => run(reindexCatalog)} className="text-xs text-amber-400 hover:text-amber-300">Re-index catalog</button></section>}
        {lab === 8 && <ProductSelect products={products} selectedId={selectedId} setSelectedId={setSelectedId} loading={loading} run={run} />}
        {lab === 9 && <ChatPanel message={message} setMessage={setMessage} loading={loading} run={run} label="Send order request" />}
        {lab === 10 && <button onClick={() => run(runCatalogPipeline)} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl">{loading ? 'Running pipeline...' : 'Run multi-agent pipeline'}</button>}

        {error && <p className="mt-6 rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">{error}</p>}
        {result !== null && <pre className="mt-6 overflow-auto rounded-xl border border-stone-800 bg-stone-900 p-5 text-xs text-green-300">{JSON.stringify(result, null, 2)}</pre>}
      </main>
    </div>
  )
}

function ProductGrid({ products }: { products: Product[] }) {
  return <div className="grid grid-cols-2 gap-4">{products.map(product => <div key={product.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4"><p className="text-xs text-stone-500">{product.id}</p><p className="mt-2 text-sm font-medium text-white">{product.name}</p><p className="mt-1 text-xs text-stone-500">{product.origin}</p><p className="mt-3 text-amber-400">₱{product.price_php}</p></div>)}</div>
}

function ProductSelect({ products, selectedId, setSelectedId, loading, run }: { products: Product[]; selectedId: string; setSelectedId: (id: string) => void; loading: boolean; run: (action: () => Promise<unknown>) => void }) {
  return <div className="space-y-4"><select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full rounded-lg bg-stone-900 border border-stone-700 p-3 text-sm text-white">{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select><button disabled={!selectedId || loading} onClick={() => run(() => getRecommendations(selectedId))} className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Finding recommendations...' : 'Get recommendations'}</button></div>
}

function ChatPanel({ message, setMessage, loading, run, label = 'Send message' }: { message: string; setMessage: (value: string) => void; loading: boolean; run: (action: () => Promise<unknown>) => void; label?: string }) {
  return <div className="space-y-4"><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a customer request..." className="min-h-32 w-full rounded-xl border border-stone-800 bg-stone-900 p-4 text-sm text-white outline-none" /><button disabled={!message.trim() || loading} onClick={() => run(() => label === 'Send order request' ? processOrder(message) : fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'lab6-demo', message }) }).then(response => response.json()))} className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Processing...' : label}</button></div>
}
