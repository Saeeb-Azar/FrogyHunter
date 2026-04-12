import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

/* Nur Opacity: kein translateY auf dem Wrapper — sonst wird position:fixed relativ zum motion-Eltern (Viewport-Bruch). */
const variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useSettingsStore((s) => s.reduceMotion)

  if (reduce) {
    return <div>{children}</div>
  }

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={variants} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}
