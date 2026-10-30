import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ShieldAlert, ShieldCheck, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Glass, PillButton, ScoreRing, PageHeader, List, Spinner, DemoBadge, Empty, useRun } from '../components/ui'

export default function ScamLens() {
  const [text, setText] = useState(''), [domain, setDomain] = useState(''), [company, setCompany] = useState('')
  const [s, run] = useRun(), [v, runV] = useRun()
  const { getRootProps, getInputProps } = useDropzone({ maxFiles: 1, accept: { 'text/plain': ['.txt'] },
    onDropAccepted: async f => { setText(await f[0].text()); toast.success('Text loaded from file') }, onDropRejected: () => toast.error('Upload a .txt file, or paste the text.') })
  const go = () => run(async () => { const r = await api.analyzeScam({ text, domain }); toast.success('Check complete'); return r })
  const verify = () => runV(() => api.verifyCompany({ company, domain }))
  const d = s.data, tone = d && (d.risk >= 60 ? '#f43f5e' : d.risk >= 30 ? '#f59e0b' : '#22d3ee')
  return (<>
    <PageHeader title="ScamLens" subtitle="Paste a job message or offer letter. We look for common scam patterns. This is guidance, not proof."/>
    <Glass className="p-4"><label htmlFor="msg" className="mb-2 block text-sm text-slate-300">Message or offer text</label>
      <textarea id="msg" className="field h-40" value={text} onChange={e => setText(e.target.value)} placeholder="Paste the message you received…"/>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><input className="field" aria-label="Sender domain" placeholder="Sender email domain (optional), e.g. acme.com" value={domain} onChange={e => setDomain(e.target.value)}/>
        <div {...getRootProps()} className="field flex cursor-pointer items-center gap-2 text-slate-400"><input {...getInputProps()} aria-label="Upload text file"/><Paperclip size={15}/>Upload a .txt file</div></div>
      <div className="mt-4"><PillButton onClick={go} disabled={s.loading}>{s.loading ? 'Checking…' : 'Check for scam signs'}</PillButton></div></Glass>
    <div className="mt-5">
      {s.loading && <Spinner scan text="Checking message against common patterns…"/>}
      {s.error && <Glass className="border-red-400/30 p-4 text-sm text-red-300">{s.error}</Glass>}
      {!d && !s.loading && !s.error && <Empty icon={ShieldAlert} text="Your risk result will appear here."/>}
      {d && <div className="space-y-4"><DemoBadge show={d.demo}/>
        <div className="grid gap-4 lg:grid-cols-3">
          <Glass className="grid place-items-center gap-2 p-5"><ScoreRing value={d.risk} size={140} label="Risk" color={tone}/><div className="font-display font-semibold transition-colors duration-500" style={{ color: tone }}>{d.level}</div></Glass>
          <Glass className="p-5 lg:col-span-2"><div className="mb-1 text-sm text-slate-300">Scam stage</div><div className="mb-4 font-display text-lg">{d.stage}</div><div className="mb-3 text-sm text-slate-300">Suspicious evidence</div><List items={d.evidence}/></Glass></div>
        <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Stay safe</div><List items={d.recommendations}/></Glass>
        <Glass className="p-5"><div className="mb-2 flex items-center gap-2 text-sm text-slate-300"><ShieldCheck size={15}/>Company and domain</div>
          <p className="text-sm text-amber-200">{d.verification?.status}: {d.verification?.notes}</p></Glass>
        {d.note && <p className="text-xs text-slate-500">{d.note}</p>}</div>}
    </div>
    <Glass className="mt-5 p-4"><div className="mb-2 text-sm text-slate-300">Verify a company</div>
      <div className="flex flex-wrap gap-3"><input className="field max-w-xs" aria-label="Company name" placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)}/><PillButton variant="ghost" arrow={false} onClick={verify} disabled={v.loading}>Get verification checklist</PillButton></div>
      {v.error && <p className="mt-3 text-sm text-red-300">{v.error}</p>}
      {v.data && <div className="mt-4 space-y-2"><DemoBadge show={v.data.demo}/><p className="text-sm text-amber-200">Status: {v.data.status}</p><List items={v.data.checks}/><p className="text-xs text-slate-500">{v.data.note}</p></div>}</Glass></>)
}
