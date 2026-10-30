import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Download, Plus, Save, Sparkles, WandSparkles } from 'lucide-react'
import { api } from '../services/api'
import { resumeApi } from '../services/auth'
import { useAuth } from '../context/AuthContext'
import { DemoBadge, Glass, PageHeader, useLocal } from '../components/ui'

const STEPS = ['Personal details', 'Career objective', 'Education', 'Skills', 'Projects', 'Experience', 'Other details', 'Resume preview']
const SECTIONS = ['summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'additional']
const SECTION_TITLES = { summary: 'Professional Summary', education: 'Education', skills: 'Skills', projects: 'Projects', experience: 'Experience', certifications: 'Certifications & Achievements', additional: 'Additional Information' }
const TEMPLATES = [['modern', 'Modern Professional'], ['minimal', 'Minimal ATS-Friendly'], ['technical', 'Technical / Software'], ['data', 'Data Analyst / Science'], ['fresher', 'Fresher / Student']]
const BLANK_EDUCATION = () => ({ id: crypto.randomUUID(), institution: '', degree: '', specialization: '', startYear: '', graduationYear: '', grade: '', coursework: '' })
const BLANK_PROJECT = () => ({ id: crypto.randomUUID(), name: '', description: '', technologies: '', contribution: '', features: '', achievements: '', url: '', suggestions: [] })
const BLANK_EXPERIENCE = () => ({ id: crypto.randomUUID(), company: '', title: '', type: 'Internship', startDate: '', endDate: '', responsibilities: '', achievements: '', technologies: '' })
const BLANK_CERTIFICATE = () => ({ id: crypto.randomUUID(), name: '', organization: '', date: '', url: '' })

const INITIAL = {
  personal: { fullName: '', email: '', phone: '', city: '', linkedin: '', github: '', portfolio: '' },
  objective: { targetRole: '', careerGoal: '', level: 'Student', industry: '', summary: '' },
  education: [BLANK_EDUCATION()],
  skills: { 'Programming languages': '', Databases: '', Frameworks: '', 'Data analytics tools': '', 'AI and machine learning': '', 'Cloud and development tools': '', 'Soft skills': '', 'Custom skills': '' },
  projects: [BLANK_PROJECT()], experience: [], certifications: [BLANK_CERTIFICATE()],
  additional: { awards: '', hackathons: '', leadership: '', languages: '', volunteer: '', publications: '', coursework: '', interests: '' },
  sectionOrder: SECTIONS, hiddenSections: [], template: 'modern', accent: '#397bff',
}

const clean = value => String(value || '').trim()
const skillsFrom = value => String(value || '').split(/[\n,;]/).map(item => item.trim()).filter(Boolean)

function resumeDraftText(data) {
  const sections = {
    summary: [data.objective.targetRole, data.objective.summary],
    education: data.education.flatMap(item => [item.degree, item.specialization, item.institution, item.startYear, item.graduationYear, item.grade, item.coursework]),
    skills: Object.entries(data.skills).flatMap(([category, value]) => skillsFrom(value).length ? [category, ...skillsFrom(value)] : []),
    projects: data.projects.flatMap(item => [item.name, item.description, item.contribution, item.features, item.technologies, item.achievements]),
    experience: data.experience.flatMap(item => [item.title, item.company, item.type, item.responsibilities, item.achievements, item.technologies]),
    certifications: [...data.certifications.flatMap(item => [item.name, item.organization, item.date]), data.additional.awards, data.additional.hackathons, data.additional.leadership],
    additional: Object.values(data.additional),
  }
  const visible = data.sectionOrder.filter(section => !data.hiddenSections.includes(section)).flatMap(section => sections[section] || [])
  return [data.personal.fullName, data.personal.email, data.personal.phone, data.personal.city, data.personal.linkedin, data.personal.github, data.personal.portfolio, ...visible].map(clean).filter(Boolean).join('\n').slice(0, 12000)
}

function Field({ label, value, onChange, type = 'text', placeholder = '', rows, ...props }) {
  const Control = rows ? 'textarea' : 'input'
  return <label className="block text-sm text-slate-300">{label}<Control className={`field mt-1.5 ${rows ? 'resize-y' : ''}`} type={rows ? undefined : type} rows={rows} value={value || ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} {...props}/></label>
}

function RepeatableCard({ title, onRemove, children }) {
  return <Glass className="relative space-y-4 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-200">{title}</h3>{onRemove && <button type="button" className="text-xs text-rose-200 hover:text-white" onClick={onRemove}>Remove</button>}</div>{children}</Glass>
}

function ResumePreview({ data, sectionOrder, hiddenSections }) {
  const { personal, objective } = data
  const sectionContent = section => {
    if (section === 'summary') return clean(objective.summary) && <p>{objective.summary}</p>
    if (section === 'education') return data.education.filter(item => item.institution || item.degree).map(item => <article key={item.id}><strong>{item.degree} {item.specialization && `· ${item.specialization}`}</strong><p>{item.institution}{item.startYear || item.graduationYear ? ` · ${item.startYear}–${item.graduationYear}` : ''}{item.grade ? ` · ${item.grade}` : ''}</p>{item.coursework && <p>Relevant coursework: {item.coursework}</p>}</article>)
    if (section === 'skills') return Object.entries(data.skills).filter(([, value]) => skillsFrom(value).length).map(([category, value]) => <p key={category}><strong>{category}: </strong>{skillsFrom(value).join(' · ')}</p>)
    if (section === 'projects') return data.projects.filter(item => item.name || item.description).map(item => <article key={item.id}><strong>{item.name}</strong>{item.url && <span> · {item.url}</span>}{item.description && <p>{item.description}</p>}{item.features && <p>{item.features}</p>}{item.contribution && <p>{item.contribution}</p>}{item.technologies && <p><strong>Technologies: </strong>{item.technologies}</p>}{item.achievements && <p>{item.achievements}</p>}</article>)
    if (section === 'experience') return data.experience.filter(item => item.company || item.title).map(item => <article key={item.id}><strong>{item.title}</strong>{item.company && ` · ${item.company}`}{item.type && ` · ${item.type}`}<p>{item.startDate}{item.endDate ? `–${item.endDate}` : ''}</p>{item.responsibilities && <p>{item.responsibilities}</p>}{item.achievements && <p>{item.achievements}</p>}{item.technologies && <p><strong>Tools: </strong>{item.technologies}</p>}</article>)
    if (section === 'certifications') {
      const certificates = data.certifications.filter(item => item.name)
      const highlights = [['Awards', data.additional.awards], ['Hackathons', data.additional.hackathons], ['Leadership', data.additional.leadership]].filter(([, value]) => value)
      if (!certificates.length && !highlights.length) return null
      return <>{certificates.map(item => <p key={item.id}><strong>{item.name}</strong>{item.organization && ` · ${item.organization}`}{item.date && ` · ${item.date}`}</p>)}{highlights.map(([label, value]) => <p key={label}><strong>{label}: </strong>{value}</p>)}</>
    }
    if (section === 'additional') return Object.entries({ Languages: data.additional.languages, Volunteer: data.additional.volunteer, Publications: data.additional.publications, 'Relevant coursework': data.additional.coursework, Interests: data.additional.interests }).filter(([, value]) => value).map(([label, value]) => <p key={label}><strong>{label}: </strong>{value}</p>)
    return null
  }
  return <article className={`resume-paper template-${data.template}`} style={{ '--resume-accent': data.accent }}>
    <header className="resume-heading"><h1>{personal.fullName || 'Your Name'}</h1>{objective.targetRole && <p className="resume-target">{objective.targetRole}</p>}<p>{[personal.email, personal.phone, personal.city, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join(' · ')}</p></header>
    {sectionOrder.filter(section => !hiddenSections.includes(section)).map(section => {
      const content = sectionContent(section)
      if (!content || (Array.isArray(content) && !content.length)) return null
      return <section className="resume-section" key={section}><h2>{SECTION_TITLES[section]}</h2>{content}</section>
    })}
  </article>
}

export default function ResumeBuilder() {
  const { id } = useParams()
  const { user } = useAuth()
  const [localDraft, setLocalDraft] = useLocal('sb_resume_draft', null)
  const [data, setData] = useState(() => !id && localDraft?.resumeData ? { ...INITIAL, ...localDraft.resumeData } : INITIAL)
  const [step, setStep] = useState(0)
  const [resumeName, setResumeName] = useState(() => !id && localDraft?.resumeName ? localDraft.resumeName : 'My Resume')
  const [resumeId, setResumeId] = useState(id || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [match, setMatch] = useState(null)
  const [aiSummary, setAiSummary] = useState(false)
  const [rewritingProject, setRewritingProject] = useState('')

  useEffect(() => {
    if (!id) return
    let active = true
    resumeApi.get(id).then(resume => {
      if (!active) return
      setResumeId(resume.id); setResumeName(resume.resumeName); setData({ ...INITIAL, ...resume.resumeData, template: resume.template, accent: resume.accent })
    }).catch(requestError => { if (active) setError(requestError.message) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    if (!user && !id) setLocalDraft({ resumeName, resumeData: data })
  }, [user, id, resumeName, data, setLocalDraft])
  const updateBlock = (block, patch) => setData(current => ({ ...current, [block]: { ...current[block], ...patch } }))
  const updateArray = (section, itemId, patch) => setData(current => ({ ...current, [section]: current[section].map(item => item.id === itemId ? { ...item, ...patch } : item) }))
  const removeArray = (section, itemId) => setData(current => ({ ...current, [section]: current[section].filter(item => item.id !== itemId) }))
  const addArray = (section, create) => setData(current => ({ ...current, [section]: [...current[section], create()] }))
  const resumeText = useMemo(() => resumeDraftText(data), [data])

  const save = async () => {
    if (!user) { setNotice('Create or sign in to a verified account to save resumes privately.'); return }
    setBusy(true); setError(''); setNotice('')
    const body = { resumeName, targetRole: data.objective.targetRole, template: data.template, accent: data.accent, resumeData: data }
    try {
      const saved = resumeId ? await resumeApi.update(resumeId, body) : await resumeApi.create(body)
      setResumeId(saved.id)
      setNotice('Resume saved to your account.')
      if (match && jobDescription.trim()) {
        try {
          setMatch(await api.matchJob({ jd: jobDescription, resume: resumeDraftText(data) }))
          setNotice('Resume saved. Career Coach recalculated the match from this version.')
        } catch { setError('Resume saved, but the match could not be recalculated. Run Career Coach again.') }
      }
    }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  const suggestSummary = async () => {
    setAiSummary(true); setError(''); setNotice('')
    try {
      const result = await api.generateResumeSummary({ profile: { ...data.personal, ...data.objective, education: data.education, skills: data.skills, experience: data.experience, projects: data.projects.map(({ name, description, technologies, contribution, achievements }) => ({ name, description, technologies, contribution, achievements })) } })
      updateBlock('objective', { summarySuggestion: result.summary || '' })
    } catch (requestError) { setError(requestError.message) }
    finally { setAiSummary(false) }
  }

  const rewriteProject = async project => {
    setRewritingProject(project.id); setError('')
    try { const result = await api.rewriteResumeProject({ project: { name: project.name, description: project.description, features: project.features, contribution: project.contribution, technologies: project.technologies, achievements: project.achievements } }); updateArray('projects', project.id, { suggestions: result.bullets || [] }) }
    catch (requestError) { setError(requestError.message) }
    finally { setRewritingProject('') }
  }

  const analyze = async () => {
    setBusy(true); setError(''); setAnalysis(null)
    try { setAnalysis(await api.analyzeResumeDraft({ resumeText, targetRole: data.objective.targetRole, jobDescription })) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  const compare = async () => {
    setBusy(true); setError(''); setMatch(null)
    try { setMatch(await api.matchJob({ jd: jobDescription, resume: resumeText })) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  const printResume = () => {
    document.body.classList.add('printing-resume')
    const cleanup = () => { document.body.classList.remove('printing-resume'); window.removeEventListener('afterprint', cleanup) }
    window.addEventListener('afterprint', cleanup)
    window.print()
  }

  const moveSection = (section, offset) => setData(current => {
    const order = [...current.sectionOrder]
    const index = order.indexOf(section), target = index + offset
    if (target < 0 || target >= order.length) return current
    ;[order[index], order[target]] = [order[target], order[index]]
    return { ...current, sectionOrder: order }
  })

  return <>
    <PageHeader title="Resume Builder" subtitle="Build an ATS-friendly resume from your own experience. AI suggestions never add unprovided facts."/>
    <div className="mb-5 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">{STEPS.map((label, index) => <button key={label} type="button" onClick={() => setStep(index)} className={`rounded-lg border px-2 py-2 text-left text-xs transition-colors ${step === index ? 'border-teal-300/50 bg-teal-300/10 text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}><span className="block text-[10px] text-teal-200">{String(index + 1).padStart(2, '0')}</span>{label}</button>)}</div>
    {(error || notice) && <Glass className={`mb-4 p-3 text-sm ${error ? 'border-rose-300/20 text-rose-200' : 'border-teal-300/20 text-teal-100'}`} role={error ? 'alert' : 'status'}>{error || notice}{notice.includes('verified account') && <span> <Link className="underline" to="/register">Create account</Link> · <Link className="underline" to="/login">Sign in</Link></span>}</Glass>}

    {step === 0 && <Glass className="grid gap-4 p-5 md:grid-cols-2"><Field label="Full name" value={data.personal.fullName} onChange={value => updateBlock('personal', { fullName: value })} autoComplete="name"/><Field label="Professional email" type="email" value={data.personal.email} onChange={value => updateBlock('personal', { email: value })}/><Field label="Phone" type="tel" value={data.personal.phone} onChange={value => updateBlock('personal', { phone: value })}/><Field label="City and state" value={data.personal.city} onChange={value => updateBlock('personal', { city: value })}/><Field label="LinkedIn URL (optional)" type="url" value={data.personal.linkedin} onChange={value => updateBlock('personal', { linkedin: value })}/><Field label="GitHub URL (optional)" type="url" value={data.personal.github} onChange={value => updateBlock('personal', { github: value })}/><Field label="Portfolio URL (optional)" type="url" value={data.personal.portfolio} onChange={value => updateBlock('personal', { portfolio: value })}/></Glass>}

    {step === 1 && <Glass className="space-y-4 p-5"><div className="grid gap-4 md:grid-cols-2"><Field label="Target job role" value={data.objective.targetRole} onChange={value => updateBlock('objective', { targetRole: value })}/><label className="block text-sm text-slate-300">Career stage<select className="field mt-1.5" value={data.objective.level} onChange={event => updateBlock('objective', { level: event.target.value })}>{['Student', 'Fresher', 'Experienced professional'].map(value => <option key={value} className="bg-slate-900">{value}</option>)}</select></label><Field label="Industry" value={data.objective.industry} onChange={value => updateBlock('objective', { industry: value })}/><Field label="Career goal" value={data.objective.careerGoal} onChange={value => updateBlock('objective', { careerGoal: value })}/></div>
      <Field label="Professional summary" value={data.objective.summary} onChange={value => updateBlock('objective', { summary: value })} rows={4} placeholder="Write your own summary or ask AI to draft one from the information you provided."/>
      <button type="button" className="btn-ghost inline-flex rounded-xl" onClick={suggestSummary} disabled={aiSummary}>{aiSummary ? 'Generating from your details…' : 'Draft summary with AI'}<Sparkles size={16}/></button>
      {data.objective.summarySuggestion && <div className="rounded-xl border border-teal-300/20 bg-teal-300/5 p-4"><p className="mb-2 text-xs font-medium uppercase text-teal-200">AI suggestion · review before use</p><p className="text-sm leading-6 text-slate-200">{data.objective.summarySuggestion}</p><button type="button" className="mt-3 text-xs text-teal-100 underline" onClick={() => updateBlock('objective', { summary: data.objective.summarySuggestion })}>Use this suggestion</button></div>}</Glass>}

    {step === 2 && <div className="space-y-3">{data.education.map((item, index) => <RepeatableCard key={item.id} title={`Education ${index + 1}`} onRemove={data.education.length > 1 ? () => removeArray('education', item.id) : null}><div className="grid gap-3 md:grid-cols-2">{[['Institution name', 'institution'], ['Degree or course', 'degree'], ['Specialization', 'specialization'], ['Start year', 'startYear'], ['Graduation year', 'graduationYear'], ['CGPA or percentage', 'grade'], ['Relevant coursework', 'coursework']].map(([label, key]) => <Field key={key} label={label} value={item[key]} onChange={value => updateArray('education', item.id, { [key]: value })}/>)}</div></RepeatableCard>)}<button className="btn-ghost rounded-xl" type="button" onClick={() => addArray('education', BLANK_EDUCATION)}><Plus size={16}/>Add education</button></div>}

    {step === 3 && <Glass className="grid gap-4 p-5 md:grid-cols-2">{Object.entries(data.skills).map(([category, value]) => <Field key={category} label={category} value={value} onChange={next => updateBlock('skills', { [category]: next })} rows={2} placeholder="Separate skills with commas"/>)}</Glass>}

    {step === 4 && <div className="space-y-3">{data.projects.map((project, index) => <RepeatableCard key={project.id} title={`Project ${index + 1}`} onRemove={data.projects.length > 1 ? () => removeArray('projects', project.id) : null}><div className="grid gap-3 md:grid-cols-2"><Field label="Project name" value={project.name} onChange={value => updateArray('projects', project.id, { name: value })}/><Field label="Technologies used" value={project.technologies} onChange={value => updateArray('projects', project.id, { technologies: value })}/><Field label="Project description" value={project.description} onChange={value => updateArray('projects', project.id, { description: value })} rows={3}/><Field label="Main features" value={project.features} onChange={value => updateArray('projects', project.id, { features: value })} rows={3}/><Field label="Your contribution" value={project.contribution} onChange={value => updateArray('projects', project.id, { contribution: value })} rows={3}/><Field label="Achievements or measurable results (optional)" value={project.achievements} onChange={value => updateArray('projects', project.id, { achievements: value })} rows={2}/><Field label="Project or GitHub URL (optional)" type="url" value={project.url} onChange={value => updateArray('projects', project.id, { url: value })}/></div>
        <button type="button" className="btn-ghost rounded-xl" disabled={rewritingProject === project.id || !project.contribution.trim()} onClick={() => rewriteProject(project)}>{rewritingProject === project.id ? 'Preparing suggestion…' : 'Suggest resume bullets'}<WandSparkles size={15}/></button>
        {!!project.suggestions.length && <div className="rounded-xl border border-teal-300/20 p-3"><p className="mb-2 text-xs uppercase text-teal-200">Suggestions · not applied</p><ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">{project.suggestions.map((bullet, itemIndex) => <li key={itemIndex}>{bullet}</li>)}</ul><button className="mt-3 text-xs text-teal-100 underline" type="button" onClick={() => updateArray('projects', project.id, { contribution: project.suggestions.join('\n'), suggestions: [] })}>Apply selected draft</button></div>}</RepeatableCard>)}<button className="btn-ghost rounded-xl" type="button" onClick={() => addArray('projects', BLANK_PROJECT)}><Plus size={16}/>Add project</button></div>}

    {step === 5 && <div className="space-y-3">{data.experience.map((item, index) => <RepeatableCard key={item.id} title={`Experience ${index + 1}`} onRemove={() => removeArray('experience', item.id)}><div className="grid gap-3 md:grid-cols-2"><Field label="Company" value={item.company} onChange={value => updateArray('experience', item.id, { company: value })}/><Field label="Job title" value={item.title} onChange={value => updateArray('experience', item.id, { title: value })}/><label className="block text-sm text-slate-300">Employment type<select className="field mt-1.5" value={item.type} onChange={event => updateArray('experience', item.id, { type: event.target.value })}>{['Internship', 'Full-time', 'Part-time', 'Contract', 'Volunteer'].map(value => <option key={value} className="bg-slate-900">{value}</option>)}</select></label><Field label="Technologies" value={item.technologies} onChange={value => updateArray('experience', item.id, { technologies: value })}/><Field label="Start date" type="month" value={item.startDate} onChange={value => updateArray('experience', item.id, { startDate: value })}/><Field label="End date" type="month" value={item.endDate} onChange={value => updateArray('experience', item.id, { endDate: value })}/><Field label="Responsibilities" value={item.responsibilities} onChange={value => updateArray('experience', item.id, { responsibilities: value })} rows={3}/><Field label="Achievements (only results you can support)" value={item.achievements} onChange={value => updateArray('experience', item.id, { achievements: value })} rows={3}/></div></RepeatableCard>)}<button className="btn-ghost rounded-xl" type="button" onClick={() => addArray('experience', BLANK_EXPERIENCE)}><Plus size={16}/>Add experience</button><p className="text-xs text-slate-500">This section is optional for students and freshers.</p></div>}

    {step === 6 && <div className="space-y-3">{data.certifications.map((item, index) => <RepeatableCard key={item.id} title={`Certification ${index + 1}`} onRemove={data.certifications.length > 1 ? () => removeArray('certifications', item.id) : null}><div className="grid gap-3 md:grid-cols-2"><Field label="Certification name" value={item.name} onChange={value => updateArray('certifications', item.id, { name: value })}/><Field label="Issuing organization" value={item.organization} onChange={value => updateArray('certifications', item.id, { organization: value })}/><Field label="Completion date" type="month" value={item.date} onChange={value => updateArray('certifications', item.id, { date: value })}/><Field label="Credential URL" type="url" value={item.url} onChange={value => updateArray('certifications', item.id, { url: value })}/></div></RepeatableCard>)}<button className="btn-ghost rounded-xl" type="button" onClick={() => addArray('certifications', BLANK_CERTIFICATE)}><Plus size={16}/>Add certification</button>
      <Glass className="grid gap-3 p-4 md:grid-cols-2">{[['Awards and achievements', 'awards'], ['Hackathons', 'hackathons'], ['Positions of responsibility', 'leadership'], ['Languages', 'languages'], ['Volunteer work', 'volunteer'], ['Publications', 'publications'], ['Relevant coursework', 'coursework'], ['Interests', 'interests']].map(([label, key]) => <Field key={key} label={label} value={data.additional[key]} onChange={value => updateBlock('additional', { [key]: value })} rows={2}/>)}</Glass>
    </div>}

    {step === 7 && <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0"><ResumePreview data={data} sectionOrder={data.sectionOrder} hiddenSections={data.hiddenSections}/></div>
      <div className="space-y-4 no-print">
        <Glass className="space-y-3 p-4"><h2 className="font-medium">Design & save</h2><Field label="Resume name" value={resumeName} onChange={setResumeName}/><label className="block text-sm text-slate-300">Template<select className="field mt-1.5" value={data.template} onChange={event => setData(current => ({ ...current, template: event.target.value }))}>{TEMPLATES.map(([value, label]) => <option key={value} value={value} className="bg-slate-900">{label}</option>)}</select></label><label className="flex items-center justify-between text-sm text-slate-300">Accent color<input type="color" aria-label="Resume accent color" value={data.accent} onChange={event => setData(current => ({ ...current, accent: event.target.value }))}/></label>
          <div className="space-y-2"><p className="text-xs text-slate-400">Show sections · use arrows to reorder</p>{data.sectionOrder.map((section, index) => <div key={section} className="flex items-center gap-2"><label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={!data.hiddenSections.includes(section)} onChange={event => setData(current => ({ ...current, hiddenSections: event.target.checked ? current.hiddenSections.filter(item => item !== section) : [...current.hiddenSections, section] }))} className="accent-teal-400"/>{SECTION_TITLES[section]}</label><button className="icon-button h-8 w-8" type="button" aria-label={`Move ${SECTION_TITLES[section]} up`} disabled={index === 0} onClick={() => moveSection(section, -1)}><ArrowUp size={14}/></button><button className="icon-button h-8 w-8" type="button" aria-label={`Move ${SECTION_TITLES[section]} down`} disabled={index === data.sectionOrder.length - 1} onClick={() => moveSection(section, 1)}><ArrowDown size={14}/></button></div>)}</div>
          {user ? <button className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm" type="button" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save to my resumes'}<Save size={16}/></button> : <div className="rounded-xl border border-teal-300/20 p-3 text-xs leading-5 text-slate-300">Guest drafts stay in this browser. Sign in to save privately to your account.<div className="mt-2 flex gap-3"><Link className="text-teal-100 underline" to="/register">Create account</Link><Link className="text-teal-100 underline" to="/login">Sign in</Link></div></div>}
          {resumeId && user && <Link className="block text-center text-xs text-teal-200 underline" to="/app/resumes">Manage saved resumes</Link>}
          <button type="button" className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm" onClick={printResume}>Print / Save PDF<Download size={16}/></button>
        </Glass>
        <Glass className="space-y-3 p-4"><h2 className="font-medium">Career Coach</h2><p className="text-xs leading-5 text-slate-400">Compare the facts in this draft against a job description. Suggestions stay separate until you choose to edit.</p><Field label="Job description" value={jobDescription} onChange={setJobDescription} rows={5}/><button type="button" className="btn-ghost rounded-xl" disabled={busy || !jobDescription.trim()} onClick={compare}>Compare resume to role<TargetIcon/></button>{match && <div className="space-y-2 border-t border-white/10 pt-3"><DemoBadge show={match.demo}/><p className="text-sm text-slate-200">Current match: <strong>{match.score}%</strong></p><p className="text-xs text-slate-400">Matched: {(match.matched || []).join(', ') || 'None found'}</p><p className="text-xs text-slate-400">Missing: {(match.missing || []).join(', ') || 'None found'}</p><ul className="list-disc space-y-1 pl-4 text-xs text-slate-300">{(match.improvements || []).map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
          <button type="button" className="btn-ghost rounded-xl" disabled={busy} onClick={analyze}>AI resume analysis<WandSparkles size={15}/></button>{analysis && <div className="space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300"><p>ATS readability: {analysis.atsCompatibility}% · not a hiring guarantee</p>{[['Missing keywords', analysis.missingKeywords], ['Grammar suggestions', analysis.grammarSuggestions], ['Weak bullets', analysis.weakBullets], ['Skill relevance', analysis.skillRelevance], ['Summary suggestions', analysis.summarySuggestions]].map(([label, list]) => <div key={label}><p className="font-medium text-teal-100">{label}</p><ul className="mt-1 list-disc space-y-1 pl-4">{(list || []).map((item, index) => <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul></div>)}<p className="text-slate-500">{analysis.disclaimer || 'ATS tools vary. This analysis does not predict selection.'}</p></div>}</Glass>
      </div>
    </div>}

    <div className="no-print mt-5 flex items-center justify-between gap-3"><button className="btn-ghost rounded-xl" type="button" disabled={step === 0} onClick={() => setStep(value => value - 1)}><ArrowLeft size={16}/>Previous</button><span className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</span><button className="btn-solid rounded-xl" type="button" disabled={step === STEPS.length - 1} onClick={() => setStep(value => value + 1)}>Next<ArrowRight size={16}/></button></div>
  </>
}

function TargetIcon() { return <ArrowRight size={15}/> }