import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import helmetLogo from '../assets/helmet.png'

type Msg = { id: number; from: 'agent' | 'you'; text: string }

const STARTERS = [
  'How do brackets work?',
  'Explain chart analyzer',
  'What is Chart Pilot AI?',
]

const REPLIES: Record<string, string> = {
  'How do brackets work?':
    'You lock take-profit and stop-loss first. When you engage, both stay linked as an OCO route until one fills or you flatten.',
  'Explain chart analyzer':
    'I scan structure, momentum, and liquidity zones on the chart — then highlight entry, TP, and SL candidates before you arm the autopilot.',
  'What is Chart Pilot AI?':
    'I am your futures trading agent. Rules first, then I fly the deck — markets, depth, risk, and working orders in one cockpit.',
}

const DEFAULT_REPLY =
  'Got it. Connect your wallet when you are ready — I will keep the bracket rules locked before we engage.'

let msgId = 1

export function AgentChat() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { id: msgId++, from: 'agent', text: 'Hi — I am your agent. Ask me about brackets, charts, or the deck.' },
  ])
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, typing, open])

  const pushAgent = (text: string) => {
    setTyping(true)
    window.setTimeout(
      () => {
        setMessages((m) => [...m, { id: msgId++, from: 'agent', text }])
        setTyping(false)
      },
      reduce ? 0 : 700,
    )
  }

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    setMessages((m) => [...m, { id: msgId++, from: 'you', text: trimmed }])
    setInput('')
    pushAgent(REPLIES[trimmed] ?? DEFAULT_REPLY)
  }

  return (
    <div className="agent-dock">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="agent-chat"
            key="chat"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Chart Pilot AI agent chat"
          >
            <header className="agent-chat__head">
              <img src={helmetLogo} alt="" width={36} height={36} />
              <div>
                <strong className="home__grad-title">Chart Pilot AI</strong>
                <span>Online · your agent</span>
              </div>
              <button
                type="button"
                className="agent-chat__close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </header>

            <div className="agent-chat__body" ref={bodyRef}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`agent-chat__bubble agent-chat__bubble--${m.from}`}
                >
                  {m.text}
                </div>
              ))}
              {typing ? (
                <div className="agent-chat__bubble agent-chat__bubble--agent agent-chat__typing">
                  <i />
                  <i />
                  <i />
                </div>
              ) : null}
            </div>

            <div className="agent-chat__starters">
              {STARTERS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} disabled={typing}>
                  {s}
                </button>
              ))}
            </div>

            <form
              className="agent-chat__form"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your agent…"
                aria-label="Message"
              />
              <button type="submit" disabled={typing || !input.trim()}>
                Send
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        className={`agent-fab${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close agent chat' : 'Open agent chat'}
        aria-expanded={open}
      >
        <span className="agent-fab__blobs" aria-hidden="true">
          <i />
          <i />
        </span>
        <img src={helmetLogo} alt="" width={56} height={70} />
        {!open ? <span className="agent-fab__ping" aria-hidden="true" /> : null}
      </button>
    </div>
  )
}
