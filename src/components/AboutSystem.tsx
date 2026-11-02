import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const SYSTEM_PILLARS = [
  {
    title: 'Intent layer',
    body: 'You type what you want in plain language — “I want a BTC trade”, “long ES with tight stop”, “flatten NQ”. The agent parses symbol, side, and risk intent.',
  },
  {
    title: 'Chart analyzer',
    body: 'The agent scans structure, momentum, and liquidity on the chart, then drafts entry, take-profit, and stop-loss candidates before anything is armed.',
  },
  {
    title: 'Bracket lock',
    body: 'TP and SL must be set first. Rules are locked into an OCO bracket so the route cannot engage naked.',
  },
  {
    title: 'Glass cockpit deck',
    body: 'Markets, depth, risk, and working orders live on one deck. Engage when ready — flatten or cancel-all stays one tap away.',
  },
  {
    title: 'Wallet gate',
    body: 'A real browser wallet connects you to the session. Chart Pilot AI only reads the address; keys stay in your wallet.',
  },
  {
    title: 'Autopilot loop',
    body: 'Once engaged, the agent watches fills and linked exits until the route completes or you take back control.',
  },
]

type LogLine = { id: number; kind: 'user' | 'agent' | 'sys'; text: string }

let logId = 1

function detectIntent(raw: string) {
  const t = raw.toLowerCase()
  const symbol =
    /\bbtc\b|\bbitcoin\b/.test(t)
      ? 'BTC'
      : /\beth\b|\bethereum\b/.test(t)
        ? 'ETH'
        : /\bes\b|\bs&p\b|\bspx\b/.test(t)
          ? 'ES'
          : /\bnq\b|\bnasdaq\b/.test(t)
            ? 'NQ'
            : /\bcl\b|\boil\b|\bcrude\b/.test(t)
              ? 'CL'
              : /\bgc\b|\bgold\b/.test(t)
                ? 'GC'
                : 'BTC'

  const side = /\bshort\b|\bsell\b/.test(t)
    ? 'SHORT'
    : /\blong\b|\bbuy\b/.test(t)
      ? 'LONG'
      : 'LONG'

  return { symbol, side }
}

function buildScript(raw: string) {
  const { symbol, side } = detectIntent(raw)
  return [
    { kind: 'sys' as const, text: 'Intent received · routing to Chart Pilot AI agent…', delay: 350 },
    { kind: 'agent' as const, text: `Preparing ${side} ${symbol} route…`, delay: 900 },
    { kind: 'agent' as const, text: `Scanning ${symbol} chart — structure, momentum, liquidity…`, delay: 1600 },
    { kind: 'agent' as const, text: 'Drafting bracket · take-profit and stop-loss candidates…', delay: 2400 },
    {
      kind: 'agent' as const,
      text: `${symbol} ${side} ready · connect wallet and arm the bracket to engage.`,
      delay: 3200,
    },
  ]
}

export function AboutSystem() {
  const reduce = useReducedMotion()
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<LogLine[]>([
    {
      id: logId++,
      kind: 'agent',
      text: 'Hi — I am your agent. Type anything, like “I want a BTC trade”.',
    },
  ])
  const logRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const el = logRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [log, busy])

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  const run = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return

    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []

    setBusy(true)
    setPrompt('')
    setLog((prev) => [...prev, { id: logId++, kind: 'user', text: trimmed }])

    const script = buildScript(trimmed)
    script.forEach((line) => {
      const id = window.setTimeout(() => {
        setLog((prev) => [...prev, { id: logId++, kind: line.kind, text: line.text }])
        if (line === script[script.length - 1]) setBusy(false)
      }, reduce ? 0 : line.delay)
      timers.current.push(id)
    })
  }

  return (
    <div className="about-sys">
      <div className="about-sys__intro">
        <p className="home__section-kicker">About</p>
        <h2 className="home__grad-title">The full Chart Pilot AI system</h2>
        <p>
          Chart Pilot AI is an agent-driven futures autopilot. You describe the trade,
          the agent analyzes the chart, locks take-profit and stop-loss into a
          bracket, then flies the route from a single glass cockpit — wallet-connected,
          rules first, always.
        </p>
      </div>

      <div className="about-sys__grid">
        <div className="about-sys__pillars">
          {SYSTEM_PILLARS.map((p, i) => (
            <article key={p.title}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3
                  className="home__grad-title about-sys__pillar-title"
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  {p.title}
                </h3>
                <p>{p.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="about-sys__console">
          <header className="about-sys__console-head">
            <strong className="home__grad-title">Ask the agent</strong>
            <span className={busy ? 'is-busy' : 'is-idle'}>
              {busy ? 'Preparing…' : 'Ready'}
            </span>
          </header>

          <div className="about-sys__log" ref={logRef} aria-live="polite">
            {log.map((line) => (
              <div key={line.id} className={`about-sys__line about-sys__line--${line.kind}`}>
                <em>
                  {line.kind === 'user' ? 'You' : line.kind === 'sys' ? 'System' : 'Agent'}
                </em>
                <p>{line.text}</p>
              </div>
            ))}
            {busy ? (
              <div className="about-sys__line about-sys__line--agent about-sys__pulse">
                <em>Agent</em>
                <p>
                  Working
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </p>
              </div>
            ) : null}
          </div>

          <div className="about-sys__chips">
            {['I want a BTC trade', 'Long ES with tight stop', 'Short NQ'].map((chip) => (
              <button key={chip} type="button" disabled={busy} onClick={() => run(chip)}>
                {chip}
              </button>
            ))}
          </div>

          <form
            className="about-sys__form"
            onSubmit={(e) => {
              e.preventDefault()
              run(prompt)
            }}
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type anything — e.g. I want a BTC trade"
              aria-label="Tell the agent what you want"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !prompt.trim()}>
              {busy ? '…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
