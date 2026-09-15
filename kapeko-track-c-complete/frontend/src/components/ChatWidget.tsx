// ChatWidget.tsx — Lab 6: Shopping Copilot
// Embedded chat widget for the Kape Ko storefront.
// Add this component to App.tsx to display it on the listing page.
//
// Usage: <ChatWidget />
// Place at the bottom of App.tsx return, after the product grid.

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SESSION_ID = `kape-ko-${Date.now()}`

async function sendMessage(message: string, sessionId: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data.response
}

async function clearChat(sessionId: string): Promise<void> {
  await fetch(`/api/chat/${sessionId}`, { method: 'DELETE' })
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Kamusta! ☕ How are you feeling today? I\'ll help you find the right Kape Ko coffee.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const response = await sendMessage(userMessage, SESSION_ID)
      setMessages(m => [...m, { role: 'assistant', content: response }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    await clearChat(SESSION_ID)
    setMessages([{ role: 'assistant', content: 'Kamusta! ☕ How are you feeling today? I\'ll help you find the right Kape Ko coffee.' }])
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: '#1C1917', border: '2px solid #F59E0B',
          cursor: 'pointer', fontSize: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Open Shopping Copilot"
      >
        {open ? '✕' : '☕'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24,
          width: 340, height: 480,
          background: '#fff', borderRadius: 16,
          border: '0.5px solid #E7E5E4',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          zIndex: 999,
        }}>
          {/* Header */}
          <div style={{
            background: '#1C1917', borderRadius: '16px 16px 0 0',
            padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>☕ Shopping Copilot</div>
              <div style={{ color: '#78716C', fontSize: 11 }}>Powered by Kape Ko AI</div>
            </div>
            <button onClick={handleReset}
              style={{ background: 'none', border: 'none', color: '#78716C', cursor: 'pointer', fontSize: 11 }}>
              Reset
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px', borderRadius: 12,
                  fontSize: 13, lineHeight: 1.5,
                  background: m.role === 'user' ? '#F59E0B' : '#F5F5F4',
                  color: m.role === 'user' ? '#fff' : '#1C1917',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: m.role === 'assistant' ? 4 : 12,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#F5F5F4', padding: '8px 14px', borderRadius: 12, fontSize: 18, color: '#A8A29E' }}>
                  •••
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '0.5px solid #E7E5E4',
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="How are you feeling?"
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                border: '0.5px solid #E7E5E4', fontSize: 13,
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px', background: '#F59E0B',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
