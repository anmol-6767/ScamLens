import { useState } from 'react'
import { Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Glass, PillButton, ScoreRing, Bar, PageHeader, Chips, List, Spinner, DemoBadge, Empty, useRun } from '../components/ui'

export default function JobMatcher() {
  const [jd, setJd] = useState(''), [resume, setResume] = useState('')
  const [s, run] = useRun()
  const go = () => run(async () => { const r = await api.matchJob({ jd, resume }); toast.success('Match ready'); return r })
  const d = s.data
  return (<>
    <PageHeader title="Job Matcher" subtitle="Paste a job description and your resume text to see how well they match."/>
    <div className="grid gap-4 md:grid-cols-2">
      <Glass className="p-4"><label className="mb-2 block text-sm text-slate-300" htmlFor="jd">Job description</label><textarea id="jd" className="field h-48" value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description…"/></Glass>
      <Glass className="p-4"><label className="mb-2 block text-sm text-slate-300" htmlFor="rs">Your resume text</label><textarea id="rs" className="field h-48" value={resume} onChange={e => setResume(e.target.value)} placeholder="Paste your resume text…"/></Glass></div>
    <div className="mt-4"><PillButton onClick={go} disabled={s.loading}>{s.loading ? 'Matching…' : 'Check match'}</PillButton></div>
    <div className="mt-5">
      {s.loading && <Spinner text="Comparing…"/>}
      {s.error && <Glass className="border-red-400/30 p-4 text-sm text-red-300">{s.error}</Glass>}
      {!d && !s.loading && !s.error && <Empty icon={Target} text="Your match score and skill gaps will appear here."/>}
      {d && <div className="space-y-4"><DemoBadge show={d.demo}/>
        <div className="grid gap-4 lg:grid-cols-3">
          <Glass className="grid place-items-center p-5"><ScoreRing value={d.score} size={140} label="Match" color="#a855f7"/></Glass>
          <Glass className="space-y-3 p-5 lg:col-span-2"><div className="text-sm text-slate-300">Match breakdown</div>{d.breakdown.map(b => <Bar key={b.label} {...b}/>)}</Glass></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Glass className="p-5"><div className="mb-3 text-sm text-emerald-300">Matched skills</div>{d.matched.length ? <Chips items={d.matched}/> : <p className="text-sm text-slate-400">None found.</p>}</Glass>
          <Glass className="p-5"><div className="mb-3 text-sm text-amber-300">Missing skills</div>{d.missing.length ? <Chips items={d.missing}/> : <p className="text-sm text-slate-400">No gaps found.</p>}</Glass></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Recommended improvements</div><List items={d.improvements}/></Glass>
          <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Roles to look for</div><List items={d.internships}/></Glass></div>
        {d.note && <p className="text-xs text-slate-500">{d.note}</p>}</div>}
    </div></>)
}
