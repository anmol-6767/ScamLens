import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, Hexagon } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Glass, PillButton, ScoreRing, PageHeader, List, Spinner, DemoBadge, Empty, useRun, useLocal } from '../components/ui'

export default function Roadmap() {
  const [role, setRole] = useState('Frontend Developer')
  const [plan, setPlan] = useLocal('sb_plan', null)
  const [done, setDone] = useLocal('sb_done', {})
  const [s, run] = useRun()
  const go = () => run(async () => { const r = await api.generateRoadmap({ role }); setPlan(r); setDone({}); toast.success('Roadmap created'); return r })
  const all = plan ? plan.weeks.flatMap(w => w.tasks) : [], n = all.filter(t => done[t.id]).length
  const pct = all.length ? Math.round(n / all.length * 100) : 0
  return (<>
    <PageHeader title="Career Roadmap" subtitle="A 30-day plan for your target role. Tick tasks as you finish them.">
      <div className="flex flex-wrap gap-2"><input className="field w-56" aria-label="Target role" value={role} onChange={e => setRole(e.target.value)} placeholder="Target role"/><PillButton onClick={go} disabled={s.loading}>{s.loading ? 'Building…' : 'Generate plan'}</PillButton></div></PageHeader>
    {s.loading && <Spinner text="Building your plan…"/>}
    {s.error && <Glass className="border-red-400/30 p-4 text-sm text-red-300">{s.error}</Glass>}
    {!plan && !s.loading && <Empty icon={Map} text="Enter a role and generate your 30-day plan."/>}
    {plan && !s.loading && <div className="space-y-4">
      <DemoBadge show={plan.demo}/>
      <Glass className="flex flex-wrap items-center gap-6 p-5"><ScoreRing value={pct} size={110} label="Complete" color="#a855f7"/>
        <div><div className="font-display text-lg">{plan.role}</div><div className="text-sm text-slate-400">{n} of {all.length} tasks done</div></div>
        <div className="ml-auto hidden gap-3 sm:flex">{plan.weeks.map((w, i) => { const t = w.tasks, p = Math.round(t.filter(x => done[x.id]).length / t.length * 100)
          return <div key={i} className="relative grid h-16 w-16 place-items-center text-xs"><Hexagon size={64} className={p === 100 ? 'text-cyan-400' : 'text-violet-400/60'}/><span className="absolute">W{i + 1}</span></div> })}</div></Glass>
      <div className="grid gap-4 md:grid-cols-2">{plan.weeks.map(w => <Glass key={w.title} className="p-5"><h3 className="mb-3 font-semibold">{w.title}</h3>
        <ul className="space-y-2">{w.tasks.map(t => <motion.li key={t.id} layout animate={{ opacity: done[t.id] ? 0.62 : 1 }} transition={{ duration: 0.2 }}><label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" className="mt-1 accent-violet-500 transition-transform checked:scale-110" checked={!!done[t.id]} onChange={() => setDone({ ...done, [t.id]: !done[t.id] })}/><span className="transition-colors duration-200">{done[t.id] ? <span className="text-slate-500 line-through">{t.text}</span> : <span className="text-slate-200">{t.text}</span>}</span></label></motion.li>)}</ul></Glass>)}</div>
      <div className="grid gap-4 md:grid-cols-2"><Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Project ideas</div><List items={plan.projects}/></Glass><Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Course suggestions</div><List items={plan.courses}/></Glass></div>
      {plan.note && <p className="text-xs text-slate-500">{plan.note}</p>}</div>}
  </>)
}
