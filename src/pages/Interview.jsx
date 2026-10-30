import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Mic } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Glass, PillButton, ScoreRing, PageHeader, List, Spinner, DemoBadge, Empty, useRun, useLocal } from '../components/ui'

export default function Interview() {
  const reduceMotion = useReducedMotion()
  const [role, setRole] = useState('Frontend Developer'), [i, setI] = useState(0), [answer, setAnswer] = useState('')
  const [hist, setHist] = useLocal('sb_hist', [])
  const [q, runQ] = useRun(), [e, runE] = useRun()
  const qs = q.data?.questions || [], cur = qs[i]
  const gen = () => { setI(0); setAnswer(''); runQ(() => api.generateQuestions({ role })) }
  const send = () => runE(async () => { const r = await api.evaluateAnswer({ role, question: cur.text, answer })
    setHist([{ q: cur.text, score: r.score, at: new Date().toLocaleDateString() }, ...hist].slice(0, 20)); toast.success('Feedback ready'); return r })
  return (<>
    <PageHeader title="Interview Studio" subtitle="Generate questions for a role, answer them, and get feedback.">
      <div className="flex flex-wrap gap-2"><input className="field w-56" aria-label="Role" value={role} onChange={x => setRole(x.target.value)}/><PillButton onClick={gen} disabled={q.loading}>Generate questions</PillButton></div></PageHeader>
    {q.loading && <Spinner text="Preparing questions…"/>}
    {q.error && <Glass className="border-red-400/30 p-4 text-sm text-red-300">{q.error}</Glass>}
    {!cur && !q.loading && <Empty icon={Mic} text="Choose a role and generate your questions."/>}
    {cur && <div className="grid gap-4 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2">
      <DemoBadge show={q.data.demo}/>
      <AnimatePresence mode="wait" initial={false}><motion.div key={cur.text} initial={reduceMotion ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -6 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}><Glass className="p-5"><div className="mb-2 flex items-center justify-between text-xs text-slate-400"><span className="chip">{cur.type}</span><span>Question {i + 1} of {qs.length}</span></div>
        <p className="font-display text-lg">{cur.text}</p>
        <textarea className="field mt-4 h-36" aria-label="Your answer" value={answer} onChange={x => setAnswer(x.target.value)} placeholder="Type your answer…"/>
        <div className="mt-3 flex flex-wrap gap-3"><PillButton onClick={send} disabled={e.loading}>{e.loading ? 'Evaluating…' : 'Get feedback'}</PillButton>
          <PillButton variant="ghost" arrow={false} onClick={() => { setI((i + 1) % qs.length); setAnswer(''); runE(async () => null) }}>Next question</PillButton></div></Glass></motion.div></AnimatePresence>
      {e.error && <Glass className="border-red-400/30 p-4 text-sm text-red-300">{e.error}</Glass>}
      {e.data && <Glass className="flex flex-wrap gap-6 p-5"><ScoreRing value={e.data.score} size={100} label="Score" color="#a855f7"/><div className="min-w-0 flex-1"><DemoBadge show={e.data.demo}/><p className="my-2 text-sm text-slate-200">{e.data.feedback}</p><List items={e.data.improvements}/></div></Glass>}</div>
      <Glass className="h-fit p-5"><div className="mb-3 text-sm text-slate-300">Performance history</div>
        {hist.length ? <ul className="space-y-3 text-sm">{hist.map((h, k) => <li key={k} className="flex justify-between gap-3"><span className="truncate text-slate-300">{h.q}</span><span className="shrink-0 text-cyan-300">{h.score}</span></li>)}</ul> : <p className="text-sm text-slate-500">Answered questions will be listed here.</p>}</Glass></div>}
  </>)
}
