import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogoHelmet } from './LogoHelmet'

type LoadingScreenProps = {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [open, setOpen] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const hold = new URLSearchParams(window.location.search).get('hold')
    if (hold === 'idle') return
    if (hold === 'open') {
      setOpen(true)
      return
    }

    const openTimer = window.setTimeout(() => setOpen(true), 650)
    const exitTimer = window.setTimeout(() => setExiting(true), 1750)
    const doneTimer = window.setTimeout(() => onComplete(), 2800)

    return () => {
      window.clearTimeout(openTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Loading Chart Pilot AI"
      role="status"
      style={{ pointerEvents: exiting ? 'none' : 'auto' }}
    >
      <div className="loading-screen__glow" aria-hidden="true" />

      <motion.div
        className="loading-screen__stage"
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{
          scale: exiting ? 1.4 : 1,
          opacity: exiting ? 0 : 1,
        }}
        transition={
          exiting
            ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div className="loading-screen__logo-slot">
          <LogoHelmet open={open} className="loading-screen__logo" />
        </div>

        <motion.div
          className="loading-screen__copy"
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: exiting ? 0 : 1,
            y: exiting ? -8 : 0,
          }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <p className="loading-screen__brand">Chart Pilot AI</p>
          <p className="loading-screen__tag">Autopilot engaging…</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
