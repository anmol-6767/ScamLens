import { useMemo, useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/auth'
import { Glass, PageHeader } from '../components/ui'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [values, setValues] = useState({ fullName: user.fullName, phone: user.phone || '', college: user.college || '', educationLevel: user.educationLevel || '' })
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [saved, setSaved] = useState(false)
  const complete = useMemo(() => Math.round(Object.values({ ...values, email: user.email }).filter(value => String(value).trim()).length / 5 * 100), [values, user.email])
  const update = event => { setSaved(false); setValues(current => ({ ...current, [event.target.name]: event.target.value })) }
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false)
    try { const result = await authApi.updateProfile(values); updateUser(result.user); setSaved(true) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  return <>
    <PageHeader title="My profile" subtitle="Your private account details and career profile."/>
    <div className="mb-4 grid gap-4 sm:grid-cols-2"><Glass className="p-5"><p className="text-sm text-slate-400">Profile completion</p><p className="mt-2 font-display text-3xl font-semibold text-white">{complete}%</p><div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-teal-400 transition-[width]" style={{ width: `${complete}%` }}/></div></Glass><Glass className="flex items-center gap-3 p-5"><CheckCircle2 className="text-teal-300"/><div><p className="text-sm font-medium">Email verified</p><p className="text-xs text-slate-400">{user.email}</p></div></Glass></div>
    <Glass className="max-w-3xl p-5 sm:p-7"><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm text-slate-300">Full name<input className="field mt-1.5" name="fullName" value={values.fullName} onChange={update} required maxLength={120}/></label>
      <label className="text-sm text-slate-300">Email address<input className="field mt-1.5" value={user.email} disabled readOnly/></label>
      <label className="text-sm text-slate-300">Phone (optional)<input className="field mt-1.5" name="phone" type="tel" value={values.phone} onChange={update} maxLength={40}/></label>
      <label className="text-sm text-slate-300">College or university<input className="field mt-1.5" name="college" value={values.college} onChange={update} maxLength={180}/></label>
      <label className="text-sm text-slate-300 sm:col-span-2">Current education level<select className="field mt-1.5" name="educationLevel" value={values.educationLevel} onChange={update} required><option value="">Select your level</option>{['High school','Diploma','Undergraduate','Postgraduate','Doctorate','Other'].map(level => <option key={level} value={level} className="bg-slate-900">{level}</option>)}</select></label>
      {(error || saved) && <p className={`text-sm sm:col-span-2 ${error ? 'text-rose-300' : 'text-teal-200'}`} role={error ? 'alert' : 'status'}>{error || 'Profile updated.'}</p>}
      <button className="btn-solid flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium sm:col-span-2" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}<Save size={16}/></button>
    </form></Glass>
  </>
}