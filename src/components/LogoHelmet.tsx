import { motion, type Variants } from 'framer-motion'
import helmetTop from '../assets/helmet-top.png'
import helmetVisor from '../assets/helmet-visor.png'
import helmetBottom from '../assets/helmet-bottom.png'

type LogoHelmetProps = {
  open?: boolean
  className?: string
}

const topVariants: Variants = {
  idle: { y: 0, x: 0 },
  open: {
    y: '-20%',
    x: 0,
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
  },
}

const visorVariants: Variants = {
  idle: { y: 0, x: 0 },
  open: {
    y: '-10%',
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 },
  },
}

const bottomVariants: Variants = {
  idle: { y: 0, x: 0 },
  open: {
    y: '14%',
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.07 },
  },
}

/**
 * Original Chart Pilot AI logo, split into three layers for the open animation.
 * Artwork is from ChartPilot.jpg — not a redraw.
 */
export function LogoHelmet({ open = false, className }: LogoHelmetProps) {
  const state = open ? 'open' : 'idle'

  return (
    <div className={`logo-helmet ${className ?? ''}`.trim()} aria-hidden="true">
      <motion.img
        className="logo-helmet__layer logo-helmet__layer--top"
        src={helmetTop}
        alt=""
        draggable={false}
        variants={topVariants}
        animate={state}
        style={{ transformOrigin: '50% 50%' }}
      />
      <motion.img
        className="logo-helmet__layer logo-helmet__layer--visor"
        src={helmetVisor}
        alt=""
        draggable={false}
        variants={visorVariants}
        animate={state}
        style={{ transformOrigin: '50% 50%' }}
      />
      <motion.img
        className="logo-helmet__layer logo-helmet__layer--bottom"
        src={helmetBottom}
        alt=""
        draggable={false}
        variants={bottomVariants}
        animate={state}
        style={{ transformOrigin: '50% 50%' }}
      />
    </div>
  )
}
