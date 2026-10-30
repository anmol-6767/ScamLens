import { Link } from 'react-router-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Stagger, StaggerItem } from './motion'

export const Glass = ({ className = '', hover = false, children, ...p }) =>
  <GlassContent className={className} hover={hover} {...p}>{children}</GlassContent>

function GlassContent({ className, hover, children, ...props }) {
  const reduceMotion = useReducedMotion()
  return <motion.div initial={reduceMotion ? false : { y: 6 }} animate={{ y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }} className={`glass ${hover ? 'glass-hover' : ''} ${className}`} {...props}>{children}</motion.div>
}

export function PillButton({ children, to, onClick, variant = 'solid', arrow = true, className = '', ...p }) {
  const inner = <>
    {arrow && <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-teal-700"><ArrowRight size={14}/></span>}
    {children}</>
  const cls = `${variant === 'solid' ? 'btn-solid' : 'btn-ghost'} ${className}`
  return to ? <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="inline-flex"><Link to={to} className={cls} {...p}>{inner}</Link></motion.div>
    : <motion.button type="button" className={cls} onClick={onClick} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} {...p}>{inner}</motion.button>
}

export function ScoreRing({ value = 0, size = 120, label, color = '#00E5FF' }) {
  const r = size / 2 - 10, c = 2 * Math.PI * r
  const reduceMotion = useReducedMotion()
  const progress = useMotionValue(value)
  const spring = useSpring(progress, { stiffness: 65, damping: 18 })
  const displayedValue = useTransform(spring, v => `${Math.round(v)}%`)
  useEffect(() => { progress.set(value) }, [progress, value])
  return (<div className="relative grid place-items-center" style={{ width: size, height: size }}>
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,.1)" strokeWidth="9" fill="none"/>
      <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="9" fill="none" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c * (1 - value / 100) }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: reduceMotion ? 0 : 1.1, ease: 'easeOut' }}/>
    </svg>
    <div className="absolute text-center" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Score'}><div className="font-display text-2xl font-semibold">{reduceMotion ? `${value}%` : <motion.span>{displayedValue}</motion.span>}</div>{label && <div className="text-[11px] text-slate-400">{label}</div>}</div>
  </div>)
}

export const Bar = ({ label, value, color = 'from-cyan-400 to-blue-500' }) => (
  <BarProgress label={label} value={value} color={color}/>)

function BarProgress({ label, value, color }) {
  const reduceMotion = useReducedMotion()
  return <div><div className="mb-1 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="text-slate-400">{value}%</span></div>
    <div className="h-2 rounded-full bg-white/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}><motion.div className={`h-2 rounded-full bg-gradient-to-r ${color}`} initial={{ width: reduceMotion ? `${value}%` : 0 }} animate={{ width: `${value}%` }} transition={{ duration: reduceMotion ? 0 : .9, ease: 'easeOut' }}/></div></div>
}

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-semibold md:text-3xl">{title}</h1><p className="mt-1 max-w-xl text-sm text-slate-400">{subtitle}</p></div>{children}</div>)

export const DemoBadge = ({ show }) => show ? (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
    <FlaskConical size={12}/> Demo result, not real AI analysis</span>) : null

export const List = ({ items = [] }) => (
  <Stagger as="ul" className="space-y-2 text-sm text-slate-300">{items.map((t, i) => <StaggerItem as="li" key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"/>{t}</StaggerItem>)}</Stagger>)

export const Chips = ({ items = [], tone = '' }) => (
  <Stagger className="flex flex-wrap gap-2">{items.map(t => <StaggerItem as="span" key={t} className={`chip ${tone}`}>{t}</StaggerItem>)}</Stagger>)

export const Empty = ({ icon: Icon, text }) => (
  <Glass className="grid place-items-center gap-2 p-10 text-center text-sm text-slate-400"><Icon size={28} className="text-teal-300"/>{text}</Glass>)

export const Spinner = ({ text = 'Analysing…', scan = false }) => {
  const reduceMotion = useReducedMotion()
  return <Glass role="status" aria-live="polite" className={`relative flex items-center gap-3 overflow-hidden p-6 text-sm text-slate-300 ${scan ? 'border-cyan-400/25' : ''}`}>
    {scan && !reduceMotion && <motion.span aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-1 h-px bg-cyan-300/70 shadow-[0_0_10px_2px_rgba(109,185,173,.35)]" animate={{ y: [0, 40, 0] }} transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}/>}
    <span className={`h-4 w-4 shrink-0 rounded-full border-2 border-cyan-400 ${reduceMotion ? '' : 'animate-spin border-t-transparent'}`}/>{text}</Glass>
}
export function useLocal(key, init) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}

export function useRun() {
  const [s, set] = useState({ loading: false, data: null, error: null })
  const run = async fn => {
    set({ loading: true, data: null, error: null })
    try { const data = await fn(); set({ loading: false, data, error: null }) }
    catch (e) { set({ loading: false, data: null, error: e.message }) }
  }
  return [s, run]
}
