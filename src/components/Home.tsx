import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useWallet } from '../hooks/useWallet'
import { ScrollReveal } from './ScrollReveal'
import { AgentChat } from './AgentChat'
import { AboutSystem } from './AboutSystem'
import { ChartAnalyzer } from './ChartAnalyzer'
import { HowItWorks } from './HowItWorks'

/** Replace with the live CPAI mint when ready. */
const CPAI_CA = 'SOON1111111111111111111111111111111111111111'
const CPAI_BUY_URL = `https://pump.fun/coin/${CPAI_CA}`

const FEATURES = [
  {
    title: 'Bracket autopilot',
    body: 'Lock take-profit and stop-loss before you engage a futures route.',
  },
  {
    title: 'Live market deck',
    body: 'CME-style quotes, spark trends, and session volume on one glass panel.',
  },
  {
    title: 'Depth ladder',
    body: 'Bid and ask levels with spread readout so you see liquidity before entry.',
  },
  {
    title: 'Risk EICAS',
    body: 'Margin, buying power, heat, and drawdown visible at a glance.',
  },
  {
    title: 'Working orders',
    body: 'Track open positions plus TP and SL working orders in one MFD.',
  },
  {
    title: 'Wallet connect',
    body: 'Connect a real browser wallet — MetaMask and others via EIP-1193.',
  },
  {
    title: 'OCO linkage',
    body: 'Bracket rules stay linked so one fill cancels the opposing order.',
  },
  {
    title: 'Session clock',
    body: 'UTC session time and live last/change readouts on the glareshield.',
  },
  {
    title: 'Flatten controls',
    body: 'Pedestal actions for flatten, cancel-all, and re-engage autopilot.',
  },
]


const TOKENOMICS = [
  { label: 'Name', value: 'Chart Pilot AI' },
  { label: 'Symbol', value: 'CPAI' },
  { label: 'Total supply', value: '1,000,000,000' },
  { label: 'Launch platform', value: 'pump.fun' },
]

const PROGRESS_SECTIONS = [
  { label: 'Home' },
  { label: 'About' },
  { label: 'Analyzer' },
  { label: 'How it works' },
  { label: 'Features' },
  { label: 'Tokenomics' },
]

function SectionBg({
  tone,
  variant,
}: {
  tone: 'blue' | 'green' | 'orange'
  variant: 'about' | 'analyzer' | 'how' | 'features' | 'tokenomics'
}) {
  return (
    <div
      className={`home__section-bg home__section-bg--${variant} home__section-bg--static`}
      aria-hidden="true"
    >
      <div className={`home__field home__field--${tone} home__field--static`}>
        <div className="home__blob home__blob--a" />
        <div className="home__blob home__blob--b" />
      </div>
    </div>
  )
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function shortenCa(addr: string) {
  if (addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`
}

export function Home() {
  const reduce = useReducedMotion()
  const { address, connecting, isConnected, connect, disconnect } = useWallet()
  const [caCopied, setCaCopied] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const homeRef = useRef<HTMLDivElement>(null)
  const snapLock = useRef(false)
  const wheelAcc = useRef(0)
  const lastWheelAt = useRef(0)
  const eatInertia = useRef(false)
  const touchStart = useRef<{ y: number; x: number } | null>(null)
  const goToRef = useRef<(index: number) => void>(() => {})

  const copyCa = async () => {
    try {
      await navigator.clipboard.writeText(CPAI_CA)
      setCaCopied(true)
      window.setTimeout(() => setCaCopied(false), 1800)
    } catch {
      setCaCopied(false)
    }
  }

  // Fade-style full-page section switching.
  // After each snap, eat trackpad inertia until the gesture fully stops —
  // a fixed cooldown is not enough for long Mac/Linux inertia tails.
  useEffect(() => {
    const root = homeRef.current
    if (!root) return

    // Jump immediately, then bloom enter (CSS .is-active).
    // Keep the input lock short — do not wait for the full bloom to finish.
    const SNAP_LOCK_MS = reduce ? 0 : 300
    const WHEEL_THRESHOLD = 100
    const GESTURE_GAP = 200
    const IDLE_MS = 220

    let idleTimer = 0
    let snapUnlockTimer = 0

    const sections = () =>
      Array.from(root.querySelectorAll<HTMLElement>(':scope > .home__snap'))

    const setActive = (index: number) => {
      sections().forEach((el, i) => {
        el.classList.toggle('is-active', i === index)
      })
      setActiveSection(index)
    }

    const currentIndex = () => {
      const list = sections()
      const active = list.findIndex((el) => el.classList.contains('is-active'))
      if (active >= 0) return active
      const y = root.scrollTop + 2
      let best = 0
      let bestDist = Infinity
      list.forEach((el, i) => {
        const d = Math.abs(el.offsetTop - y)
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      return best
    }

    const beginEatInertia = () => {
      eatInertia.current = true
      wheelAcc.current = 0
      lastWheelAt.current = 0
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        eatInertia.current = false
        wheelAcc.current = 0
        lastWheelAt.current = 0
      }, IDLE_MS)
    }

    const bumpEatInertia = () => {
      eatInertia.current = true
      wheelAcc.current = 0
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        eatInertia.current = false
        wheelAcc.current = 0
        lastWheelAt.current = 0
      }, IDLE_MS)
    }

    // Start on hero — ignore first-load wheel noise
    setActive(0)
    root.scrollTop = 0
    beginEatInertia()

    const goTo = (index: number) => {
      const list = sections()
      if (index < 0 || index >= list.length || snapLock.current) return
      const fromIdx = currentIndex()
      if (index === fromIdx) return

      snapLock.current = true
      eatInertia.current = false
      wheelAcc.current = 0
      window.clearTimeout(idleTimer)
      window.clearTimeout(snapUnlockTimer)

      const leaving = list[fromIdx]
      const entering = list[index]

      const leaveInner = leaving?.querySelector<HTMLElement>('.home__snap-inner')
      if (leaveInner) leaveInner.scrollTop = 0
      const enterInner = entering.querySelector<HTMLElement>('.home__snap-inner')
      if (enterInner) enterInner.scrollTop = 0

      root.scrollTop = entering.offsetTop
      leaving?.classList.remove('is-active')
      void entering.offsetHeight
      entering.classList.add('is-active')
      setActiveSection(index)

      // Unlock input quickly; bloom can keep playing without blocking scroll.
      snapUnlockTimer = window.setTimeout(() => {
        snapLock.current = false
        beginEatInertia()
      }, SNAP_LOCK_MS)
    }

    goToRef.current = goTo

    const onWheel = (e: WheelEvent) => {
      const now = performance.now()

      // Brief snap debounce only — don't keep eating wheels for the whole bloom.
      if (snapLock.current) {
        e.preventDefault()
        return
      }

      // Short post-snap inertia gate (trackpad tail), then release.
      if (eatInertia.current) {
        e.preventDefault()
        bumpEatInertia()
        return
      }

      const list = sections()
      const idx = currentIndex()
      const panel = list[idx]
      const inner = panel?.querySelector<HTMLElement>('.home__snap-inner')

      if (inner) {
        const top = inner.scrollTop <= 1
        const bottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2
        // Let the section scroll normally inside tall panels.
        if (e.deltaY < 0 && !top) {
          wheelAcc.current = 0
          return
        }
        if (e.deltaY > 0 && !bottom) {
          wheelAcc.current = 0
          return
        }
      }

      e.preventDefault()

      if (lastWheelAt.current && now - lastWheelAt.current > GESTURE_GAP) {
        wheelAcc.current = 0
      }
      lastWheelAt.current = now

      wheelAcc.current += e.deltaY
      if (Math.abs(wheelAcc.current) < WHEEL_THRESHOLD) return

      const dir = wheelAcc.current > 0 ? 1 : -1
      wheelAcc.current = 0
      goTo(idx + dir)
    }

    const onNavClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')?.slice(1)
      if (!id) return
      const target = root.querySelector<HTMLElement>(`#${id}`)
      if (!target) return
      const panel = target.classList.contains('home__snap')
        ? target
        : (target.closest('.home__snap') as HTMLElement | null)
      if (!panel) return
      const list = sections()
      const idx = list.indexOf(panel)
      if (idx < 0) return
      e.preventDefault()
      goTo(idx)
      setNavOpen(false)
    }

    // Keep section content visible after touch/native scroll (mobile).
    const syncActiveFromScroll = () => {
      if (snapLock.current) return
      const idx = currentIndex()
      const list = sections()
      list.forEach((el, i) => {
        el.classList.toggle('is-active', i === idx)
      })
      setActiveSection(idx)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      touchStart.current = { y: e.touches[0].clientY, x: e.touches[0].clientX }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || snapLock.current || eatInertia.current) {
        touchStart.current = null
        return
      }
      const t = e.changedTouches[0]
      if (!t) {
        touchStart.current = null
        return
      }
      const dy = touchStart.current.y - t.clientY
      const dx = touchStart.current.x - t.clientX
      touchStart.current = null

      // Ignore taps / horizontal gestures.
      if (Math.abs(dy) < 56 || Math.abs(dy) < Math.abs(dx) * 1.25) return

      const list = sections()
      const idx = currentIndex()
      const panel = list[idx]
      const inner = panel?.querySelector<HTMLElement>('.home__snap-inner')
      if (inner) {
        const top = inner.scrollTop <= 1
        const bottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 2
        if (dy > 0 && !bottom) return
        if (dy < 0 && !top) return
      }

      goTo(idx + (dy > 0 ? 1 : -1))
    }

    root.addEventListener('wheel', onWheel, { passive: false, capture: true })
    root.addEventListener('click', onNavClick)
    root.addEventListener('scroll', syncActiveFromScroll, { passive: true })
    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.clearTimeout(idleTimer)
      window.clearTimeout(snapUnlockTimer)
      root.removeEventListener('wheel', onWheel, true)
      root.removeEventListener('click', onNavClick)
      root.removeEventListener('scroll', syncActiveFromScroll)
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchend', onTouchEnd)
    }
  }, [reduce])

  return (
    <div className="home" ref={homeRef}>
      <nav className="home__progress" aria-label="Section progress">
        <span className="home__progress-track" aria-hidden="true" />
        {PROGRESS_SECTIONS.map((section, i) => (
          <button
            key={section.label}
            type="button"
            className={`home__progress-dot${i === activeSection ? ' is-active' : ''}${i < activeSection ? ' is-passed' : ''}`}
            aria-label={section.label}
            aria-current={i === activeSection ? 'true' : undefined}
            onClick={() => {
              setNavOpen(false)
              goToRef.current(i)
            }}
          />
        ))}
      </nav>

      <header className={`home__chrome is-scrolled${navOpen ? ' is-nav-open' : ''}`}>
        <div className="home__top">
          <a className="home__logo" href="/" aria-label="Chart Pilot AI home">
            <img className="home__logo-mark" src="/logo.png" alt="" width={40} height={40} />
            <span>Chart Pilot AI</span>
          </a>

          <nav className="home__nav-links" aria-label="Primary" id="home-primary-nav">
            <a href="#about">About</a>
            <a href="#analyzer">Analyzer</a>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#tokenomics">Tokenomics</a>
          </nav>

          <div className="home__top-right">
            <a
              className="home__x"
              href="https://x.com/ChartPilotAI"
              target="_blank"
              rel="noreferrer"
              aria-label="Chart Pilot AI on X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
            <div className="home__wallet-chip">
              {isConnected && address ? (
                <>
                  <span className="home__wallet-addr">{shorten(address)}</span>
                  <button type="button" className="home__wallet-btn" onClick={() => void disconnect()}>
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="home__wallet-btn home__wallet-btn--on"
                  onClick={() => void connect()}
                  disabled={connecting}
                >
                  {connecting ? 'Connecting…' : 'Connect wallet'}
                </button>
              )}
            </div>
            <button
              type="button"
              className={`home__menu-btn${navOpen ? ' is-open' : ''}`}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={navOpen}
              aria-controls="home-primary-nav"
              onClick={() => setNavOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="home__screen home__snap">
        <div className="home__section-bg home__section-bg--hero home__section-bg--static" aria-hidden="true">
          <div className="home__hero-grid" />
          <div className="home__field home__field--blue home__field--static">
            <div className="home__blob home__blob--a" />
            <div className="home__blob home__blob--b" />
          </div>
        </div>

        <section className="home__hero">
          <img
            className="home__hero-logo"
            src="/logo.png"
            alt="Chart Pilot AI"
            width={160}
            height={160}
          />
          <p className="home__eyebrow">Futures autopilot</p>
          <h1 className="home__title home__grad-title">Chart Pilot AI</h1>
          <p className="home__lead">
            Trade with take-profit and stop-loss rules locked in before you engage.
          </p>
          <div className="home__hero-actions">
            <button
              type="button"
              className="home__btn home__btn--primary"
              onClick={() => void connect()}
              disabled={connecting || isConnected}
            >
              {isConnected
                ? 'Wallet connected'
                : connecting
                  ? 'Connecting…'
                  : 'Connect wallet'}
            </button>
            <a className="home__btn home__btn--ghost" href="#about">
              About project
            </a>
          </div>
        </section>
      </div>

      <ScrollReveal id="about" className="home__about home__snap">
        <SectionBg tone="green" variant="about" />
        <div className="about-sys-wrap">
          <AboutSystem />
        </div>
      </ScrollReveal>

      <ScrollReveal id="analyzer" className="home__analyzer home__snap">
        <SectionBg tone="orange" variant="analyzer" />
        <ChartAnalyzer />
      </ScrollReveal>

      <ScrollReveal id="how" className="home__how home__snap">
        <SectionBg tone="blue" variant="how" />
        <HowItWorks />
      </ScrollReveal>

      <ScrollReveal id="features" className="home__features home__snap">
        <SectionBg tone="blue" variant="features" />
        <div className="home__section-head">
          <p className="home__section-kicker">Features</p>
          <h2>Nine systems on the deck</h2>
          <p>Everything you need from quote to flatten — nine focused capabilities.</p>
        </div>

        <div className="home__feat-grid">
          {FEATURES.map((f, i) => (
            <article key={f.title} className={`home__feat home__feat--${i + 1}`}>
              <span className="home__feat-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal id="tokenomics" className="home__tokenomics home__snap">
        <SectionBg tone="orange" variant="tokenomics" />
        <div className="home__section-head">
          <p className="home__section-kicker">Tokenomics</p>
          <h2>CPAI on Solana</h2>
          <p>Fair launch on pump.fun — zero tax, liquidity burned.</p>
        </div>

        <div className="tokenomics">
          <div className="tokenomics__hero">
            <img src="/logo.png" alt="" width={88} height={88} className="tokenomics__logo" />
            <div>
              <p className="tokenomics__name">Chart Pilot AI</p>
              <strong className="tokenomics__ticker">$CPAI</strong>
              <p className="tokenomics__tag">Solana · pump.fun · LP burned</p>
            </div>
            <div className="tokenomics__actions">
              <a
                className="home__btn home__btn--primary"
                href={CPAI_BUY_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Buy $CPAI
              </a>
              <a
                className="home__btn home__btn--ghost"
                href="https://pump.fun/profile/ChartPilotAI"
                target="_blank"
                rel="noreferrer noopener"
              >
                pump.fun
              </a>
            </div>
          </div>

          <div className="tokenomics__ca">
            <div className="tokenomics__ca-meta">
              <span>Contract address · CA</span>
              <code title={CPAI_CA}>{shortenCa(CPAI_CA)}</code>
            </div>
            <button
              type="button"
              className={`tokenomics__copy${caCopied ? ' is-copied' : ''}`}
              onClick={() => void copyCa()}
              aria-label="Copy contract address"
            >
              {caCopied ? 'Copied' : 'Copy CA'}
            </button>
          </div>

          <dl className="tokenomics__grid">
            {TOKENOMICS.map((row, i) => (
              <div key={row.label} className={`tokenomics__cell tokenomics__cell--${i + 1}`}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </ScrollReveal>

      <footer className="home__footer">
        <span>Chart Pilot AI</span>
      </footer>

      <AgentChat />
    </div>
  )
}
