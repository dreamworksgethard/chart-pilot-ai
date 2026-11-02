import { useReducedMotion } from 'framer-motion'

const AI_PLATFORMS = [
  { name: 'OpenAI', logo: '/platforms/openai.svg', href: 'https://openai.com' },
  { name: 'Claude', logo: '/platforms/anthropic.svg', href: 'https://www.anthropic.com' },
  { name: 'Gemini', logo: '/platforms/gemini.svg', href: 'https://gemini.google.com' },
  { name: 'Grok', logo: '/platforms/xai.svg', href: 'https://x.ai' },
  { name: 'DeepSeek', logo: '/platforms/deepseek.svg', href: 'https://www.deepseek.com' },
  { name: 'Llama', logo: '/platforms/meta.svg', href: 'https://llama.meta.com' },
  { name: 'Mistral', logo: '/platforms/mistral.svg', href: 'https://mistral.ai' },
  { name: 'Perplexity', logo: '/platforms/perplexity.svg', href: 'https://www.perplexity.ai' },
]

const PIPELINE = [
  {
    step: '01',
    title: 'Collect',
    body: 'Ingest market structure, order-flow context, and reasoning traces from frontier AI platforms alongside live futures feeds.',
    tag: 'AI · market feeds',
    skin: 'collect',
  },
  {
    step: '02',
    title: 'Train',
    body: 'Distill signals into Chart Pilot AI’s chart-native model — structure, momentum, liquidity, and brackets scored until confidence clears.',
    tag: 'Model · distillation',
    skin: 'train',
  },
  {
    step: '03',
    title: 'Integrate',
    body: 'Push inference onto the live chart HUD so entry, take-profit, and stop-loss land in one pass before autopilot engages.',
    tag: 'HUD · brackets',
    skin: 'integrate',
  },
  {
    step: '04',
    title: 'Live read',
    body: 'Structure mapped, bias armed, bracket ready — the analyzer surfaces a locked OCO route you can review and arm.',
    tag: 'Output · armed',
    skin: 'output',
  },
] as const

function AiMarquee() {
  const reduce = useReducedMotion()
  const loop = [...AI_PLATFORMS, ...AI_PLATFORMS]

  return (
    <div className="how__ai">
      <p className="how__ai-kicker">AI platforms in the loop</p>
      <div className="how__ai-banner" aria-label="AI platforms Chart Pilot AI learns from">
        <div
          className={`how__ai-track${reduce ? ' is-static' : ''}`}
          style={{ animationDuration: reduce ? undefined : `${AI_PLATFORMS.length * 3.4}s` }}
        >
          {loop.map((p, i) => (
            <a
              key={`${p.name}-${i}`}
              className="how__ai-item"
              href={p.href}
              target="_blank"
              rel="noreferrer noopener"
              title={p.name}
            >
              <img src={p.logo} alt="" width={32} height={32} loading="lazy" decoding="async" />
              <span>{p.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepVisual({ skin }: { skin: (typeof PIPELINE)[number]['skin'] }) {
  if (skin === 'collect') {
    return (
      <div className="how__viz how__viz--collect" aria-hidden="true">
        <span className="how__viz-orbit" />
        <span className="how__viz-orbit how__viz-orbit--2" />
        <span className="how__viz-node" />
        <span className="how__viz-node how__viz-node--2" />
        <span className="how__viz-node how__viz-node--3" />
        <span className="how__viz-node how__viz-node--4" />
      </div>
    )
  }

  if (skin === 'train') {
    return (
      <div className="how__viz how__viz--train" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    )
  }

  if (skin === 'integrate') {
    return (
      <div className="how__viz how__viz--integrate" aria-hidden="true">
        <span className="how__viz-scan" />
        <span className="how__viz-cross" />
      </div>
    )
  }

  return (
    <div className="how__viz how__viz--output" aria-hidden="true">
      <ul>
        <li>
          <em>Structure</em>
          <strong>Mapped</strong>
        </li>
        <li>
          <em>Bias</em>
          <strong>Armed</strong>
        </li>
        <li>
          <em>Bracket</em>
          <strong>Ready</strong>
        </li>
      </ul>
    </div>
  )
}

export function HowItWorks() {
  return (
    <div className="how">
      <div className="home__section-head">
        <p className="home__section-kicker">How it works</p>
        <h2>From AI platforms to live chart reads</h2>
        <p>
          Chart Pilot AI collects intelligence from leading AI systems, trains a chart-first
          model, then integrates that read into the analyzer before autopilot engages.
        </p>
      </div>

      <AiMarquee />

      <ol className="how__pipeline" aria-label="Chart Pilot AI data pipeline">
        {PIPELINE.map((item, i) => (
          <li key={item.title} className={`how__step how__step--${item.skin}`}>
            <div className="how__step-top">
              <span className="how__step-num">{item.step}</span>
              <p className="how__step-tag">{item.tag}</p>
            </div>
            <StepVisual skin={item.skin} />
            <div className="how__step-body">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            {i < PIPELINE.length - 1 ? <span className="how__step-flow" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}

export { AI_PLATFORMS }
