import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { authApi } from '../services/auth'

const EDUCATION_LEVELS = ['High school', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctorate', 'Other']

function AccountShell({ title, description, children }) {
  return <main className="login-page min-h-screen px-5 py-6 sm:px-8">
    <header className="mx-auto flex max-w-6xl items-center justify-between">
      <Link to="/" className="flex items-center gap-3 font-display text-lg font-semibold text-white"><span className="brand-mark grid h-10 w-10 place-items-center rounded-xl"><ShieldCheck size={18}/></span>SkillBridge AI</Link>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"><ArrowLeft size={15}/>Sign in</Link>
    </header>
    <section className="mx-auto max-w-xl py-10 sm:py-14">
      <div className="login-access rounded-2xl border p-6 sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        {children}
      </div>
    </section>
  </main>
}

function Field({ label, id, type = 'text', ...props }) {
  return <label className="block text-sm text-slate-300" htmlFor={id}>{label}<input id={id} type={type} className="field mt-1.5" {...props}/></label>
}

function PasswordField({ label, id, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return <label className="block text-sm text-slate-300" htmlFor={id}>{label}<span className="relative mt-1.5 block">
    <input id={id} className="field pr-12" type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} required/>
    <button type="button" className="icon-button absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2" onClick={() => setVisible(state => !state)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
  </span></label>
}

function Feedback({ error, success }) {
  return <>{error && <p role="alert" className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-3 text-sm text-rose-200">{error}</p>}{success && <p role="status" className="rounded-lg border border-teal-300/20 bg-teal-400/5 p-3 text-sm text-teal-100">{success}</p>}</>
}

export function Register() {
  const [values, setValues] = useState({ fullName: '', email: '', password: '', confirm: '', phone: '', college: '', educationLevel: '' })
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const strength = useMemo(() => [values.password.length >= 12, /[a-z]/.test(values.password) && /[A-Z]/.test(values.password), /\d/.test(values.password), /[^A-Za-z0-9]/.test(values.password)].filter(Boolean).length, [values.password])
  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async event => {
    event.preventDefault()
    setError('')
    setResult(null)
    if (values.password !== values.confirm) return setError('Passwords do not match.')
    if (!accepted) return setError('Agree to the Terms and Privacy Notice to create an account.')
    setBusy(true)
    try { setResult(await authApi.register({ ...values, acceptedTerms: accepted })) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }

  return <AccountShell title="Create your account" description="Set up a private workspace for your career plans and resumes.">
    {result ? <div className="mt-6 space-y-4">
      <Feedback success={result.message}/>
      {result.developmentVerificationUrl && <a className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium" href={result.developmentVerificationUrl}>Verify development email<ArrowRight size={16}/></a>}
      <Link className="btn-ghost flex w-full justify-center rounded-xl py-3 text-sm" to="/login">Return to sign in</Link>
    </div> : <form onSubmit={submit} className="mt-6 space-y-4">
      <Field id="register-name" label="Full name" name="fullName" value={values.fullName} onChange={update} autoComplete="name" required maxLength={120}/>
      <Field id="register-email" label="Email address" name="email" value={values.email} onChange={update} type="email" autoComplete="email" required maxLength={254}/>
      <PasswordField id="register-password" label="Password" value={values.password} onChange={event => setValues(current => ({ ...current, password: event.target.value }))} autoComplete="new-password"/>
      <div aria-label={`Password strength ${strength} of 4`} className="flex gap-1.5" role="meter" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength}>{[0, 1, 2, 3].map(step => <span key={step} className={`h-1.5 flex-1 rounded-full ${step < strength ? 'bg-teal-300' : 'bg-white/10'}`}/>)}</div>
      <p className="-mt-2 text-xs text-slate-500">Use 12 or more characters, with a mix of cases, numbers, and symbols.</p>
      <PasswordField id="register-confirm" label="Confirm password" value={values.confirm} onChange={event => setValues(current => ({ ...current, confirm: event.target.value }))} autoComplete="new-password"/>
      <div className="grid gap-4 sm:grid-cols-2"><Field id="register-phone" label="Phone (optional)" name="phone" value={values.phone} onChange={update} type="tel" autoComplete="tel" maxLength={40}/><Field id="register-college" label="College or university (optional)" name="college" value={values.college} onChange={update} autoComplete="organization" maxLength={180}/></div>
      <label className="block text-sm text-slate-300" htmlFor="register-education">Current education level<select id="register-education" className="field mt-1.5" name="educationLevel" value={values.educationLevel} onChange={update} required><option value="">Select your level</option>{EDUCATION_LEVELS.map(level => <option key={level} value={level} className="bg-slate-900">{level}</option>)}</select></label>
      <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-400"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1 accent-teal-400"/><span>I agree to the <Link className="text-teal-200 underline underline-offset-2" to="/terms">Terms</Link> and <Link className="text-teal-200 underline underline-offset-2" to="/privacy">Privacy Notice</Link>.</span></label>
      <Feedback error={error}/>
      <button type="submit" className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}<ArrowRight size={16}/></button>
      <p className="text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-medium text-teal-200 hover:text-white">Sign in</Link></p>
    </form>}
  </AccountShell>
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('')
    try { setSuccess((await authApi.requestPasswordReset(email)).message) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  return <AccountShell title="Reset your password" description="We’ll send a one-time reset link to the address on your account.">
    <form onSubmit={submit} className="mt-6 space-y-4"><Field id="reset-email" label="Email address" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required/>
      <Feedback error={error} success={success}/><button type="submit" className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold" disabled={busy}>{busy ? 'Requesting link…' : 'Send reset link'}<Mail size={16}/></button>
    </form>
  </AccountShell>
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const [password, setPassword] = useState(''), [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState('')
  const submit = async event => {
    event.preventDefault(); setError(''); setSuccess('')
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    try { setSuccess((await authApi.resetPassword({ token: params.get('token'), password })).message) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  return <AccountShell title="Choose a new password" description="Reset links can only be used once and expire after one hour.">
    <form onSubmit={submit} className="mt-6 space-y-4"><PasswordField id="new-password" label="New password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password"/><PasswordField id="confirm-new-password" label="Confirm new password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password"/><Feedback error={error} success={success}/><button type="submit" className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold" disabled={busy || !params.get('token')}>{busy ? 'Updating…' : 'Update password'}<KeyRound size={16}/></button><Link to="/login" className="block text-center text-sm text-teal-200">Return to sign in</Link></form>
  </AccountShell>
}

export function VerifyEmail() {
  const [params] = useSearchParams()
  const [state, setState] = useState({ busy: true, error: '', message: '' })
  useEffect(() => {
    const token = params.get('token')
    if (!token) { setState({ busy: false, error: 'The verification link is missing.' , message: '' }); return }
    authApi.verifyEmail(token).then(result => setState({ busy: false, error: '', message: result.message })).catch(error => setState({ busy: false, error: error.message, message: '' }))
  }, [params])
  return <AccountShell title="Verify your email" description="Email verification helps protect your account.">
    <div className="mt-6 space-y-4">{state.busy ? <p className="text-sm text-slate-300">Verifying your email…</p> : <Feedback error={state.error} success={state.message}/>}<Link to="/login" className="btn-solid flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold">Continue to sign in<ArrowRight size={16}/></Link></div>
  </AccountShell>
}

export function Terms() {
  return <AccountShell title="Terms of use" description="Use SkillBridge AI as career guidance, not a guarantee of hiring outcomes."><div className="mt-6 space-y-4 text-sm leading-6 text-slate-300"><p>You are responsible for the accuracy of information you add to resumes and profiles. AI-generated suggestions should be reviewed before use.</p><p>ScamLens and company checklists provide general safety guidance and do not verify a company or offer.</p><p>Do not submit passwords, government identifiers, or sensitive financial information to career tools.</p><Link className="text-teal-200 underline" to="/register">Back to account creation</Link></div></AccountShell>
}

export function Privacy() {
  return <AccountShell title="Privacy notice" description="Your account data is stored for the career features you choose to use."><div className="mt-6 space-y-4 text-sm leading-6 text-slate-300"><p>Account details and saved resumes are associated with your user ID and are not available to other accounts through the application APIs.</p><p>Career guidance requests are sent to the configured AI provider when AI mode is enabled. Avoid sharing sensitive personal information.</p><p>Guest mode uses local sample data. Account email verification and password reset use the configured mail provider.</p><Link className="text-teal-200 underline" to="/register">Back to account creation</Link></div></AccountShell>
}