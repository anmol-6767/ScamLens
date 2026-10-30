import { motion, useReducedMotion } from 'framer-motion'

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.16, ease: 'easeIn' } },
}

export const staggerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
}

export const itemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } },
}

export function Stagger({ as = 'div', children, className = '', ...props }) {
  const reduceMotion = useReducedMotion()
  const Element = motion[as] || motion.div
  return <Element variants={staggerVariants} initial={reduceMotion ? false : 'initial'} animate="animate" className={className} {...props}>{children}</Element>
}

export function StaggerItem({ as = 'div', children, className = '', ...props }) {
  const reduceMotion = useReducedMotion()
  const Element = motion[as] || motion.div
  return <Element variants={itemVariants} initial={reduceMotion ? false : undefined} className={className} {...props}>{children}</Element>
}