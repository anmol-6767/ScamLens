import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, FilePlus2, FileText, Pencil, Trash2 } from 'lucide-react'
import { Glass, PageHeader } from '../components/ui'
import { resumeApi } from '../services/auth'

export default function MyResumes() {
  const [resumes, setResumes] = useState([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const reload = async () => {
    setBusy(true); setError('')
    try { setResumes(await resumeApi.list()) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  useEffect(() => { reload() }, [])

  const rename = async (resume, name) => {
    const full = await resumeApi.get(resume.id)
    await resumeApi.update(resume.id, { ...full, resumeName: name })
    setEditing(null); await reload()
  }
  const duplicate = async id => { try { await resumeApi.duplicate(id); await reload() } catch (requestError) { setError(requestError.message) } }
  const remove = async resume => {
    if (!window.confirm(`Delete “${resume.resumeName}”? This cannot be undone.`)) return
    try { await resumeApi.remove(resume.id); await reload() } catch (requestError) { setError(requestError.message) }
  }

  return <>
    <PageHeader title="My resumes" subtitle="Resumes saved to your verified account."/>
    {error && <Glass className="mb-4 border-rose-300/20 p-4 text-sm text-rose-200" role="alert">{error}</Glass>}
    {busy ? <Glass className="p-6 text-sm text-slate-400">Loading your resumes…</Glass> : !resumes.length ? <Glass className="grid justify-items-center gap-3 p-10 text-center"><FileText className="text-teal-300"/><p className="text-sm text-slate-300">No saved resumes yet.</p><Link className="btn-solid rounded-full px-4 py-2 text-sm" to="/app/resume-builder">Create your first resume</Link></Glass> : <div className="space-y-3">{resumes.map(resume => <Glass key={resume.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-300/10 text-teal-200"><FileText size={18}/></span>
      <div className="min-w-0 flex-1">{editing?.id === resume.id ? <form onSubmit={event => { event.preventDefault(); rename(resume, editing.name).catch(reason => setError(reason.message)) }} className="flex gap-2"><input className="field max-w-sm" autoFocus value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })}/><button className="btn-solid rounded-lg px-3 text-sm">Save</button></form> : <h2 className="truncate font-medium">{resume.resumeName}</h2>}<p className="mt-1 text-xs text-slate-400">{resume.targetRole || 'No target role'} · Updated {new Date(resume.updatedAt).toLocaleDateString()}</p></div>
      <div className="flex items-center gap-1"><Link to={`/app/resume-builder/${resume.id}`} className="icon-button" aria-label={`Edit ${resume.resumeName}`} title="Edit"><Pencil size={16}/></Link><button type="button" className="icon-button" aria-label={`Rename ${resume.resumeName}`} title="Rename" onClick={() => setEditing({ id: resume.id, name: resume.resumeName })}><Pencil size={14}/></button><button type="button" className="icon-button" aria-label={`Duplicate ${resume.resumeName}`} title="Duplicate" onClick={() => duplicate(resume.id)}><Copy size={16}/></button><button type="button" className="icon-button text-rose-200" aria-label={`Delete ${resume.resumeName}`} title="Delete" onClick={() => remove(resume)}><Trash2 size={16}/></button></div>
    </Glass>)}</div>}
    <Link to="/app/resume-builder" className="btn-solid mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><FilePlus2 size={16}/>Create resume</Link>
  </>
}