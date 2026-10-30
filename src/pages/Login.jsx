import { Link } from 'react-router-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, FileText, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  [FileText, 'A clearer resume', 'See strengths and practical next steps.'],
  [BriefcaseBusiness, 'A focused career plan', 'Build skills around the roles you want.'],
  [ShieldCheck, 'Safer applications', 'Pause and check for common offer risks.'],
]

export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const next = params.get('next')?.startsWith('/app') ? params.get('next') : '/app'

  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('')
    try { await login({ email, password, remember }); navigate(next, { replace: true }) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  return <main className="login-page min-h-screen px-5 py-6 sm:px-8">
    <header className="mx-auto flex max-w-6xl items-center justify-between">
      <Link to="/" className="flex items-center gap-3 font-display text-lg font-semibold text-white"><span className="brand-mark grid h-10 w-10 place-items-center rounded-xl"><Sparkles size={18}/></span>SkillBridge AI</Link>
      <Link to="/" className="text-sm text-slate-400 transition-colors hover:text-white">Back to home</Link>
    </header>

    <section className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-12 py-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
      <div className="order-2 max-w-xl lg:order-1">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[.16em] text-teal-200">A considered next step</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">Build a career with more clarity.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Keep your preparation, progress, and application safety tools together in one calm workspace.</p>
        <ul className="mt-9 space-y-4">{FEATURES.map(([Icon, title, detail]) => <li key={title} className="flex items-start gap-3"><span className="login-feature-icon mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg"><Icon size={17}/></span><span><span className="block text-sm font-medium text-slate-100">{title}</span><span className="mt-1 block text-sm text-slate-400">{detail}</span></span></li>)}</ul>
      </div>

      <section className="login-access order-1 rounded-2xl border p-6 sm:p-8 lg:order-2">
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-teal-100"><span className="h-2 w-2 rounded-full bg-teal-300"/>Account access</div>
        <h2 className="font-display text-2xl font-semibold text-white">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Sign in to your verified SkillBridge account.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label htmlFor="login-email" className="block text-sm text-slate-300">Email address<input id="login-email" className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required/></label>
          <label htmlFor="login-password" className="block text-sm text-slate-300">Password<span className="relative mt-1.5 block"><input id="login-password" className="field pr-12" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required/><button type="button" className="icon-button absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
          <div className="flex items-center justify-between gap-3 text-xs"><label className="inline-flex items-center gap-2 text-slate-400"><input type="checkbox" className="accent-teal-400" checked={remember} onChange={event => setRemember(event.target.checked)}/>Remember me</label><Link to="/forgot-password" className="text-teal-200 hover:text-white">Forgot password?</Link></div>
          {error && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">{error}</p>}
          <button type="submit" className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17}/></button>
        </form>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-slate-500"><span className="h-px bg-white/10"/>or<span className="h-px bg-white/10"/></div>
        <Link to="/app" className="btn-ghost mt-4 flex w-full justify-center rounded-xl py-3 text-sm">Continue as guest / Explore demo</Link>
        <p className="mt-5 text-center text-sm text-slate-400">New to SkillBridge? <Link to="/register" className="font-medium text-teal-200 hover:text-white">Create an account</Link></p>
      </section>
    </section>
  </main>
}