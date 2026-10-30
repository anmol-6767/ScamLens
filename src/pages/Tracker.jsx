import { useState } from 'react'
import { Briefcase, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Glass, PillButton, PageHeader, Empty, useLocal } from '../components/ui'

const STATUS = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected']
const COLOR = { Saved: 'text-slate-300', Applied: 'text-cyan-300', Interview: 'text-violet-300', Offer: 'text-emerald-300', Rejected: 'text-rose-300' }
const blank = { company: '', role: '', status: 'Applied', date: '', notes: '' }

export default function Tracker() {
  const [rows, setRows] = useLocal('sb_apps', [])
  const [f, setF] = useState(blank)
  const add = () => { if (!f.company.trim() || !f.role.trim()) return toast.error('Add a company and a role.')
    setRows([{ ...f, id: Date.now() }, ...rows]); setF(blank); toast.success('Application added') }
  const upd = (id, k, v) => setRows(rows.map(r => r.id === id ? { ...r, [k]: v } : r))
  return (<>
    <PageHeader title="Applications" subtitle="Track where you applied, interview dates and notes. Saved in this browser."/>
    <Glass className="grid gap-3 p-4 md:grid-cols-6">
      <input className="field md:col-span-1" aria-label="Company" placeholder="Company" value={f.company} onChange={e => setF({ ...f, company: e.target.value })}/>
      <input className="field" aria-label="Role" placeholder="Role" value={f.role} onChange={e => setF({ ...f, role: e.target.value })}/>
      <select className="field" aria-label="Status" value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{STATUS.map(s => <option key={s} className="bg-slate-900">{s}</option>)}</select>
      <input className="field" type="date" aria-label="Interview date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })}/>
      <input className="field" aria-label="Notes" placeholder="Notes or reminder" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })}/>
      <PillButton onClick={add}>Add</PillButton></Glass>
    <div className="mt-4 space-y-3">
      {!rows.length && <Empty icon={Briefcase} text="No applications yet. Add your first one above."/>}
      {rows.map(r => <Glass key={r.id} hover className="grid items-center gap-3 p-4 md:grid-cols-6">
        <div className="font-medium">{r.company}</div><div className="text-sm text-slate-300">{r.role}</div>
        <select className={`field ${COLOR[r.status]}`} aria-label="Status" value={r.status} onChange={e => upd(r.id, 'status', e.target.value)}>{STATUS.map(s => <option key={s} className="bg-slate-900">{s}</option>)}</select>
        <input className="field" type="date" aria-label="Interview date" value={r.date} onChange={e => upd(r.id, 'date', e.target.value)}/>
        <input className="field" aria-label="Notes" value={r.notes} onChange={e => upd(r.id, 'notes', e.target.value)}/>
        <button aria-label="Delete" className="justify-self-end text-slate-500 hover:text-rose-400" onClick={() => setRows(rows.filter(x => x.id !== r.id))}><Trash2 size={17}/></button></Glass>)}
    </div></>)
}
