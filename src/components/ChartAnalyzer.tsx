import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useReducedMotion } from 'framer-motion'

const STEPS = [
  {
    title: 'Structure scan',
    body: 'Detect swing highs and lows, trend bias, and compression zones on the active contract.',
  },
  {
    title: 'Momentum read',
    body: 'Measure impulse vs pullback strength so entries only fire when the move still has fuel.',
  },
  {
    title: 'Liquidity map',
    body: 'Mark equal highs/lows and stop clusters — where liquidity is likely to be swept before continuation.',
  },
  {
    title: 'Bracket propose',
    body: 'Output entry, take-profit, and stop-loss candidates you can arm before engaging autopilot.',
  },
]

type Candle = { id: number; o: number; c: number; h: number; l: number; v: number }

const UP = '#26a69a'
const DOWN = '#ef5350'
const EMA = '#f5d76e'
const SMA = '#5b9bff'

function buildSeed(count = 42): Candle[] {
  const out: Candle[] = []
  let price = 4820
  for (let i = 0; i < count; i++) {
    const open = price
    const drift = (Math.random() - 0.42) * 28
    const close = Math.max(4680, Math.min(5120, open + drift))
    const high = Math.max(open, close) + Math.random() * 14 + 2
    const low = Math.min(open, close) - Math.random() * 14 - 2
    const v = 40 + Math.random() * 120
    out.push({ id: i, o: open, c: close, h: high, l: low, v })
    price = close
  }
  return out
}

function ema(values: number[], period: number) {
  const k = 2 / (period + 1)
  const out: number[] = []
  let prev = values[0]
  values.forEach((v, i) => {
    prev = i === 0 ? v : v * k + prev * (1 - k)
    out.push(prev)
  })
  return out
}

function sma(values: number[], period: number) {
  return values.map((_, i) => {
    if (i + 1 < period) return values[i]
    const slice = values.slice(i + 1 - period, i + 1)
    return slice.reduce((a, b) => a + b, 0) / period
  })
}

const PILOT_PHASES = [
  'LOCKING MARKET STRUCTURE…',
  'MAPPING SWING HIGHS / LOWS…',
  'READING MOMENTUM IMPULSE…',
  'SCANNING LIQUIDITY POOLS…',
  'DRAFTING BRACKET · TP / SL…',
  'AUTOPILOT ROUTE ARMED…',
] as const

function AnalyzerChart() {
  const reduce = useReducedMotion()
  const nextId = useRef(100)
  const phase = useRef(0)
  const [candles, setCandles] = useState<Candle[]>(() => buildSeed())
  const [tick, setTick] = useState(0)
  const [hover, setHover] = useState<{ x: number; y: number; i: number } | null>(null)
  const [intervalLabel, setIntervalLabel] = useState('5')
  const [pilotPhase, setPilotPhase] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setPilotPhase((p) => (p + 1) % PILOT_PHASES.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setTick((t) => t + 1)
      phase.current += 1
      setCandles((prev) => {
        const last = prev[prev.length - 1]
        // grow forming candle, then roll a new bar
        if (phase.current % 3 !== 0) {
          const close = Math.max(
            4680,
            Math.min(5120, last.c + (Math.random() - 0.45) * 10),
          )
          const updated: Candle = {
            ...last,
            c: close,
            h: Math.max(last.h, close, last.o) + Math.random() * 2,
            l: Math.min(last.l, close, last.o) - Math.random() * 2,
            v: last.v + Math.random() * 8,
          }
          return [...prev.slice(0, -1), updated]
        }
        const open = last.c
        const close = Math.max(4680, Math.min(5120, open + (Math.random() - 0.4) * 22))
        const fresh: Candle = {
          id: nextId.current++,
          o: open,
          c: close,
          h: Math.max(open, close) + Math.random() * 12 + 2,
          l: Math.min(open, close) - Math.random() * 12 - 2,
          v: 50 + Math.random() * 100,
        }
        return [...prev.slice(1), fresh]
      })
    }, 900)
    return () => window.clearInterval(id)
  }, [reduce])

  const closes = useMemo(() => candles.map((c) => c.c), [candles])
  const ema9 = useMemo(() => ema(closes, 9), [closes])
  const sma21 = useMemo(() => sma(closes, 21), [closes])

  const w = 720
  const h = 420
  const padL = 12
  const padR = 58
  const padT = 18
  const volH = 64
  const padB = 28
  const chartBottom = h - padB - volH
  const chartH = chartBottom - padT

  const priceMin = Math.min(...candles.map((c) => c.l)) - 8
  const priceMax = Math.max(...candles.map((c) => c.h)) + 8
  const priceSpan = Math.max(1, priceMax - priceMin)
  const volMax = Math.max(...candles.map((c) => c.v), 1)

  const scaleY = (v: number) => padT + ((priceMax - v) / priceSpan) * chartH
  const gap = (w - padL - padR) / candles.length
  const bodyW = Math.max(3.5, gap * 0.62)

  const last = candles[candles.length - 1]
  const up = last.c >= last.o
  const change = last.c - candles[0].o
  const changePct = (change / candles[0].o) * 100
  const entry = last.c
  const tp = entry + priceSpan * 0.12
  const sl = entry - priceSpan * 0.14

  const emaPath = ema9
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${padL + gap * i + gap * 0.5} ${scaleY(v)}`)
    .join(' ')
  const smaPath = sma21
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${padL + gap * i + gap * 0.5} ${scaleY(v)}`)
    .join(' ')

  const priceTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => priceMax - priceSpan * t)
  const hoverCandle = hover ? candles[hover.i] : null

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * w
    const y = ((e.clientY - rect.top) / rect.height) * h
    const i = Math.min(
      candles.length - 1,
      Math.max(0, Math.floor((x - padL) / gap)),
    )
    setHover({ x, y, i })
  }

  return (
    <div className="analyzer__stage">
      <div className="tv-chart tv-chart--nextgen">
        <header className="tv-chart__toolbar">
          <div className="tv-chart__symbol">
            <strong>ES1!</strong>
            <span>CME · Chart Pilot AI link</span>
          </div>
          <div className="tv-chart__intervals" role="tablist" aria-label="Chart interval">
            {['1', '5', '15', '1H', '4H', 'D'].map((iv) => (
              <button
                key={iv}
                type="button"
                className={intervalLabel === iv ? 'is-active' : undefined}
                onClick={() => setIntervalLabel(iv)}
              >
                {iv}
              </button>
            ))}
          </div>
          <div className="tv-chart__meta">
            <span className={up ? 'is-up' : 'is-down'}>
              O {last.o.toFixed(1)} H {last.h.toFixed(1)} L {last.l.toFixed(1)} C{' '}
              {last.c.toFixed(1)}
            </span>
            <em className={change >= 0 ? 'is-up' : 'is-down'}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)} ({changePct >= 0 ? '+' : ''}
              {changePct.toFixed(2)}%)
            </em>
          </div>
          <div className="tv-chart__live">
            <i /> PILOT · {tick}
          </div>
        </header>

        <div className="tv-chart__indicators">
          <span>
            <i style={{ background: EMA }} /> EMA 9
          </span>
          <span>
            <i style={{ background: SMA }} /> SMA 21
          </span>
          <span>
            <i style={{ background: '#2962ff' }} /> Vol
          </span>
          <span className="is-tp">TP {tp.toFixed(1)}</span>
          <span className="is-entry">Entry {entry.toFixed(1)}</span>
          <span className="is-sl">SL {sl.toFixed(1)}</span>
        </div>

        <div className="tv-chart__canvas">
        <svg
          className="tv-chart__svg"
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label="Chart Pilot AI analyzing ES futures chart"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {/* grid */}
          {priceTicks.map((p) => (
            <g key={p}>
              <line
                x1={padL}
                x2={w - padR}
                y1={scaleY(p)}
                y2={scaleY(p)}
                className="tv-chart__grid"
              />
              <text x={w - padR + 8} y={scaleY(p) + 3} className="tv-chart__axis">
                {p.toFixed(1)}
              </text>
            </g>
          ))}

          {/* volume */}
          {candles.map((c, i) => {
            const x = padL + gap * i + gap * 0.5
            const vh = (c.v / volMax) * (volH - 10)
            const y = h - padB - vh
            return (
              <rect
                key={`v-${c.id}`}
                x={x - bodyW / 2}
                y={y}
                width={bodyW}
                height={Math.max(1, vh)}
                fill={c.c >= c.o ? UP : DOWN}
                opacity={0.35}
              />
            )
          })}

          {/* MA lines */}
          <path d={smaPath} fill="none" stroke={SMA} strokeWidth="1.4" opacity="0.9" />
          <path d={emaPath} fill="none" stroke={EMA} strokeWidth="1.4" opacity="0.95" />

          {/* TP / Entry / SL */}
          <line
            x1={padL}
            x2={w - padR}
            y1={scaleY(tp)}
            y2={scaleY(tp)}
            stroke="#26a69a"
            strokeDasharray="4 3"
            opacity="0.85"
          />
          <line
            x1={padL}
            x2={w - padR}
            y1={scaleY(entry)}
            y2={scaleY(entry)}
            stroke="#2962ff"
            strokeDasharray="4 3"
            opacity="0.9"
          />
          <line
            x1={padL}
            x2={w - padR}
            y1={scaleY(sl)}
            y2={scaleY(sl)}
            stroke="#ef5350"
            strokeDasharray="4 3"
            opacity="0.85"
          />

          {/* candles */}
          {candles.map((c, i) => {
            const x = padL + gap * i + gap * 0.5
            const bull = c.c >= c.o
            const color = bull ? UP : DOWN
            const yHigh = scaleY(c.h)
            const yLow = scaleY(c.l)
            const yTop = scaleY(Math.max(c.o, c.c))
            const yBot = scaleY(Math.min(c.o, c.c))
            const bodyH = Math.max(1.5, yBot - yTop)
            return (
              <g key={c.id} className="tv-chart__candle">
                <line
                  x1={x}
                  x2={x}
                  y1={yHigh}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.15"
                />
                <rect
                  x={x - bodyW / 2}
                  y={yTop}
                  width={bodyW}
                  height={bodyH}
                  fill={color}
                  stroke={color}
                />
              </g>
            )
          })}

          {/* live price tag */}
          <rect
            x={w - padR + 2}
            y={scaleY(last.c) - 9}
            width={52}
            height={18}
            rx="2"
            fill={up ? UP : DOWN}
          />
          <text
            x={w - padR + 28}
            y={scaleY(last.c) + 3.5}
            className="tv-chart__price-tag"
          >
            {last.c.toFixed(1)}
          </text>
          <line
            x1={padL}
            x2={w - padR}
            y1={scaleY(last.c)}
            y2={scaleY(last.c)}
            stroke={up ? UP : DOWN}
            strokeWidth="1"
            opacity="0.45"
            strokeDasharray="2 3"
          />

          {/* order tags */}
          <g className="tv-chart__tags">
            <rect x={w - padR - 44} y={scaleY(tp) - 8} width={40} height={14} rx="2" fill="#26a69a" />
            <text x={w - padR - 24} y={scaleY(tp) + 2} className="tv-chart__tag-txt">
              TP
            </text>
            <rect
              x={w - padR - 52}
              y={scaleY(entry) - 8}
              width={48}
              height={14}
              rx="2"
              fill="#2962ff"
            />
            <text x={w - padR - 28} y={scaleY(entry) + 2} className="tv-chart__tag-txt">
              ENTRY
            </text>
            <rect x={w - padR - 44} y={scaleY(sl) - 8} width={40} height={14} rx="2" fill="#ef5350" />
            <text x={w - padR - 24} y={scaleY(sl) + 2} className="tv-chart__tag-txt">
              SL
            </text>
          </g>

          {/* time axis */}
          {[0, 10, 20, 30, 41].map((i) => {
            if (i >= candles.length) return null
            const x = padL + gap * i + gap * 0.5
            return (
              <text key={i} x={x} y={h - 8} className="tv-chart__time">
                {String((9 + Math.floor(i / 6)) % 24).padStart(2, '0')}:
                {String((i * 5) % 60).padStart(2, '0')}
              </text>
            )
          })}

          {/* crosshair */}
          {hover && hoverCandle ? (
            <g className="tv-chart__crosshair" pointerEvents="none">
              <line
                x1={hover.x}
                x2={hover.x}
                y1={padT}
                y2={h - padB}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="3 3"
              />
              <line
                x1={padL}
                x2={w - padR}
                y1={hover.y}
                y2={hover.y}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="3 3"
              />
              <rect
                x={Math.min(hover.x + 10, w - padR - 120)}
                y={Math.max(padT, hover.y - 52)}
                width={112}
                height={48}
                rx="4"
                fill="rgba(19,23,34,0.92)"
                stroke="rgba(255,255,255,0.12)"
              />
              <text
                x={Math.min(hover.x + 18, w - padR - 112)}
                y={Math.max(padT, hover.y - 52) + 16}
                className="tv-chart__tooltip"
              >
                {`O ${hoverCandle.o.toFixed(1)}  H ${hoverCandle.h.toFixed(1)}`}
              </text>
              <text
                x={Math.min(hover.x + 18, w - padR - 112)}
                y={Math.max(padT, hover.y - 52) + 32}
                className="tv-chart__tooltip"
              >
                {`L ${hoverCandle.l.toFixed(1)}  C ${hoverCandle.c.toFixed(1)}`}
              </text>
            </g>
          ) : null}
        </svg>

        {!reduce ? (
          <div className="pilot-scan" aria-hidden="true">
            <div className="pilot-scan__grid" />
            <div className="pilot-scan__beam" />
            <div className="pilot-scan__beam pilot-scan__beam--h" />
            <div className="pilot-scan__reticle" />
            <div className="pilot-scan__logo-wrap">
              <div className="pilot-scan__ring" />
              <div className="pilot-scan__ring pilot-scan__ring--2" />
              <div className="pilot-scan__ring pilot-scan__ring--3" />
              <img
                className="pilot-scan__logo"
                src="/logo.png"
                alt=""
                width={72}
                height={72}
              />
            </div>
            <div className="pilot-scan__hud">
              <p className="pilot-scan__badge">CHART PILOT AI · LINK</p>
              <p className="pilot-scan__status">{PILOT_PHASES[pilotPhase]}</p>
              <ul className="pilot-scan__telemetry">
                <li>
                  <em>CONF</em>
                  <strong>{(72 + (pilotPhase % 4) * 6).toFixed(0)}%</strong>
                </li>
                <li>
                  <em>BIAS</em>
                  <strong>{up ? 'LONG' : 'SHORT'}</strong>
                </li>
                <li>
                  <em>RISK</em>
                  <strong>BRACKET</strong>
                </li>
              </ul>
            </div>
            <div className="pilot-scan__corners" />
          </div>
        ) : null}
        </div>

        <footer className="tv-chart__footer">
          <span>Volume · session</span>
          <span>Chart Pilot AI neural scan · ES continuous</span>
          <span>{intervalLabel}m candle tape</span>
        </footer>
      </div>
    </div>
  )
}

const API_PLATFORMS = [
  { name: 'Hyperliquid', logo: '/platforms/hyperliquid.png', href: 'https://hyperliquid.xyz' },
  { name: 'Drift', logo: '/platforms/drift.png', href: 'https://www.drift.trade' },
  { name: 'Binance', logo: '/platforms/binance.svg', href: 'https://www.binance.com' },
  { name: 'AsterDEX', logo: '/platforms/aster.svg', href: 'https://www.asterdex.com' },
  { name: 'Bluefin', logo: '/platforms/bluefin.png', href: 'https://bluefin.io' },
  { name: 'Perpetual', logo: '/platforms/perpetual.png', href: 'https://perp.com' },
  { name: 'Apex Omni', logo: '/platforms/apex.png', href: 'https://omni.apex.exchange' },
]

function PlatformsBanner() {
  const reduce = useReducedMotion()
  const loop = [...API_PLATFORMS, ...API_PLATFORMS]

  return (
    <div className="analyzer__platforms">
      <p className="analyzer__pnl-kicker">Supported API Platforms</p>
      <div className="analyzer__platforms-banner" aria-label="Supported futures DEX API platforms">
        <div
          className={`analyzer__platforms-track${reduce ? ' is-static' : ''}`}
          style={{ animationDuration: reduce ? undefined : `${API_PLATFORMS.length * 3.2}s` }}
        >
          {loop.map((p, i) => (
            <a
              key={`${p.name}-${i}`}
              className="analyzer__platforms-item"
              href={p.href}
              target="_blank"
              rel="noreferrer noopener"
              title={p.name}
            >
              <img src={p.logo} alt="" width={36} height={36} loading="lazy" decoding="async" />
              <span>{p.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartAnalyzer() {
  return (
    <div className="analyzer">
      <div className="home__section-head">
        <p className="home__section-kicker">Chart analyzer</p>
        <h2>How the agent reads the chart</h2>
        <p>
          Before autopilot engages, Chart Pilot AI analyzes structure, momentum, and
          liquidity — then proposes a bracket you can arm.
        </p>
      </div>

      <div className="analyzer__layout">
        <div className="analyzer__visual">
          <AnalyzerChart />
        </div>

        <ol className="analyzer__steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className={`analyzer__step analyzer__step--${i + 1}`}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <PlatformsBanner />
    </div>
  )
}
