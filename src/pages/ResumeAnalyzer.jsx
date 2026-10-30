import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { Glass, PillButton, ScoreRing, PageHeader, Chips, List, Spinner, DemoBadge, Empty, useRun } from '../components/ui'

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [s, run] = useRun()
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ maxFiles: 1, maxSize: 5 * 1024 * 1024,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    onDropAccepted: f => setFile(f[0]), onDropRejected: () => toast.error('Use one PDF or DOCX file under 5 MB.') })
  const go = () => run(async () => { const r = await api.analyzeResume(file); toast.success('Resume analysed'); return r }).then(() => {})
  const d = s.data
  return (<>
    <PageHeader title="Resume Analyzer" subtitle="Upload your resume to see your score, skills, gaps and fixes."/>
    <Glass className="p-5"><div {...getRootProps()} className={`grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition duration-200 hover:border-cyan-300/50 ${isDragActive ? 'scale-[1.01] border-cyan-400 bg-cyan-400/5 shadow-[0_0_28px_-12px_rgba(34,211,238,.8)]' : 'border-white/15'}`}>
      <input {...getInputProps()} aria-label="Upload resume"/>{file ? <FileText className="text-cyan-400" size={30}/> : <Upload className="text-violet-400" size={30}/>}
      <div className="text-sm">{file ? file.name : 'Drop your resume here, or click to browse'}</div><div className="text-xs text-slate-500">PDF or DOCX, up to 5 MB</div></div>
      <div className="mt-4"><PillButton onClick={go} disabled={s.loading}>{s.loading ? 'Analysing…' : 'Analyze resume'}</PillButton></div></Glass>
    <div className="mt-5">
      {s.loading && <Spinner scan text="Analysing resume…"/>}
      {s.error && <Glass className="border-red-400/30 p-4 text-sm text-red-300">{s.error}</Glass>}
      {!d && !s.loading && !s.error && <Empty icon={FileText} text="Your analysis will appear here."/>}
      {d && <div className="space-y-4"><DemoBadge show={d.demo}/>
        <div className="grid gap-4 lg:grid-cols-3">
          <Glass className="grid place-items-center p-5"><ScoreRing value={d.score} size={140} label="Resume score"/></Glass>
          <Glass className="p-5 lg:col-span-2"><div className="mb-3 text-sm text-slate-300">Skills found</div><Chips items={d.skills}/><div className="mb-3 mt-5 text-sm text-slate-300">Missing keywords</div><Chips items={d.missingKeywords} tone="!border-amber-400/40 !text-amber-200"/></Glass></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Glass className="p-5"><div className="mb-3 text-sm text-emerald-300">Strengths</div><List items={d.strengths}/></Glass>
          <Glass className="p-5"><div className="mb-3 text-sm text-rose-300">Weaknesses</div><List items={d.weaknesses}/></Glass></div>
        <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">What to improve</div><List items={d.recommendations}/></Glass>
        {d.note && <p className="text-xs text-slate-500">{d.note}</p>}</div>}
    </div></>)
}
