import { useEffect, useState } from 'react'

export type ScrollDirection = 'up' | 'down' | null

export function useScrollDirection(threshold = 16) {
  const [direction, setDirection] = useState<ScrollDirection>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let lastDir: ScrollDirection = null
    let lastScrolled = false
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY
        const nextScrolled = y > 40
        if (nextScrolled !== lastScrolled) {
          lastScrolled = nextScrolled
          setScrolled(nextScrolled)
        }
        if (Math.abs(delta) >= threshold) {
          const nextDir: ScrollDirection = delta > 0 ? 'down' : 'up'
          if (nextDir !== lastDir) {
            lastDir = nextDir
            setDirection(nextDir)
          }
          lastY = y
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { direction, scrolled }
}
