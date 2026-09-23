import { useState } from 'react'
import { Link } from 'react-router-dom'
import LabNav from '../components/LabNav'
import { generateCatalog } from '../api/client'
import { Product } from '../types/Product'

export default function Lab3() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState(false)

  async function runGenerate() {
    setLoading(true)
    setLog([])
    setDone(false)

    setLog(l => [...l, '▶  POST /api/catalog/generate'])
    setLog(l => [...l, '   Spring Boot → building catalog prompt...'])

    try {
      setLog(l => [...l, '   Calling LLM API (this takes ~10-15s)...'])
      const result = await generateCatalog()
      setLog(l => [...l, `✓  LLM responded with ${result.count} products`])
      setLog(l => [...l, '✓  Parsing JSON into Java Product objects...'])
      setLog(l => [...l, '✓  Saved to data/catalog.json'])
      setLog(l => [...l, `✓  GET /api/catalog → ready`])
      setProducts(result.products || [])
      setDone(true)
    } catch (e: any) {
      setLog(l => [...l, `✗  Error: ${e.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <LabNav />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold text-amber-500 tracking-widest uppercase mb-2">Lab 3</p>
          <h1 className="text-2xl font-light text-white mb-2">Product Catalog Builder</h1>
          <p className="text-stone-400 text-sm leading-relaxed">
            Spring Boot <code className="text-amber-400">CatalogService</code> calls the LLM API with the Kape Ko brief
            → generates structured JSON → exposes via <code className="text-green-400">GET /api/catalog</code>
          </p>
        </div>

        {/* Code preview */}
        <div className="bg-stone-900 rounded-xl p-5 mb-6 font-mono text-sm border border-stone-800">
          <p className="text-stone-500 text-xs mb-3">// CatalogService.java</p>
          <p><span className="text-purple-400">@PostMapping</span><span className="text-stone-300">("/api/catalog/generate")</span></p>
          <p><span className="text-blue-400">public</span> <span className="text-green-400">List&lt;Product&gt;</span> <span className="text-yellow-300">generateCatalog</span>() {'{'}</p>
          <p className="pl-4 text-stone-400">// 1. Build prompt from Kape Ko brief</p>
          <p className="pl-4"><span className="text-green-400">String</span> prompt = <span className="text-yellow-300">buildCatalogPrompt</span>();</p>
          <p className="pl-4 text-stone-400">// 2. Call LLM API (provider-agnostic)</p>
          <p className="pl-4"><span className="text-green-400">String</span> json = llmService.<span className="text-yellow-300">complete</span>(systemPrompt, prompt);</p>
          <p className="pl-4 text-stone-400">// 3. Parse JSON → Java objects → save</p>
          <p className="pl-4"><span className="text-blue-400">return</span> <span className="text-yellow-300">parseAndSave</span>(json);</p>
          <p>{'}'}</p>
        </div>

        {/* Run button */}
        {!loading && !done && (
          <button onClick={runGenerate}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold
              py-3.5 rounded-xl transition-colors mb-6">
            ▶  Run CatalogService.generateCatalog()
          </button>
        )}

        {/* Terminal log */}
        {log.length > 0 && (
          <div className="bg-stone-900 rounded-xl p-5 mb-6 font-mono text-sm border border-stone-800">
            {log.map((l, i) => (
              <p key={i} className={l.startsWith('✓') ? 'text-green-400' : l.startsWith('✗') ? 'text-red-400' : 'text-stone-400'}>
                {l}
              </p>
            ))}
            {loading && <p className="text-stone-500 animate-pulse">   ...</p>}
          </div>
        )}

        {/* Results */}
        {done && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {products.map(p => (
                <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-stone-500">{p.id}</span>
                    <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">
                      {p.roast}
                    </span>
                  </div>
                  <p className="font-medium text-white text-sm mb-1">{p.name}</p>
                  <p className="text-xs text-stone-500 mb-2">{p.origin} · {p.farmer}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.flavor_notes.map(f => (
                      <span key={f} className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-white">₱{p.price_php}</span>
                    <span className="text-amber-400">₱{p.sub_price_php}/mo</span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/lab4"
              className="block w-full text-center bg-stone-800 hover:bg-stone-700 text-white
                font-semibold py-3.5 rounded-xl transition-colors">
              Lab 4: Enrich content with AI →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
