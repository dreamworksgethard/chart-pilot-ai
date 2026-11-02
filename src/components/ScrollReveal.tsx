import {
  Children,
  isValidElement,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'framer-motion'

type ScrollRevealProps = {
  children: ReactNode
  className?: string
  id?: string
}

function isSectionBg(child: ReactNode) {
  if (!isValidElement(child)) return false
  const cls = (child.props as { className?: string }).className ?? ''
  return cls.includes('home__section-bg')
}

/** Section shell for full-page fade scrolling — visibility driven by `.is-active`. */
export function ScrollReveal({ children, className, id }: ScrollRevealProps) {
  const reduce = useReducedMotion()
  const items = Children.toArray(children)
  const bgs = items.filter(isSectionBg)
  const content = items.filter((c) => !isSectionBg(c))

  return (
    <section id={id} className={className}>
      {bgs}
      <div className={`home__snap-inner${reduce ? ' is-reduced' : ''}`}>{content}</div>
    </section>
  )
}

export function ScrollParallaxBg({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className} aria-hidden="true">
      {children}
    </div>
  )
}
