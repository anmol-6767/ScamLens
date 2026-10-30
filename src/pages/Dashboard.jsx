import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { FileText, Target, ShieldAlert, Map, Mic, AlertTriangle } from 'lucide-react'
import { Glass, ScoreRing, Bar, PageHeader } from '../components/ui'
import { Stagger, StaggerItem } from '../components/motion'
import { useAuth } from '../context/AuthContext'

const weekly = [['Mon', 3], ['Tue', 5], ['Wed', 2], ['Thu', 6], ['Fri', 4], ['Sat', 7], ['Sun', 5]].map(([d, v]) => ({ d, v }))
const QUICK = [['/app/resume-builder', FileText, 'Build a resume'], ['/app/resume', FileText, 'Analyze resume'], ['/app/match', Target, 'Career Coach'], ['/app/scam', ShieldAlert, 'Check an offer'], ['/app/roadmap', Map, 'Open roadmap'], ['/app/interview', Mic, 'Practise interview']]

export default function Dashboard() {
  const reduceMotion = useReducedMotion()
  const { user } = useAuth()
  const actions = user ? [...QUICK, ['/app/resumes', FileText, 'My resumes']] : QUICK
  const profileCompletion = user ? Math.round([user.fullName, user.email, user.phone, user.college, user.educationLevel].filter(Boolean).length / 5 * 100) : 0
  return (<>
    <PageHeader title={user ? `Welcome back, ${user.fullName.split(' ')[0]}` : 'Welcome to SkillBridge'} subtitle={user ? 'Your career tools and progress, in one place.' : 'Explore the demo workspace. Sample data is clearly labeled.'}><span className="chip">Sample metrics · no activity recorded</span></PageHeader>
    {user && <Glass className="mb-4 flex flex-wrap items-center gap-4 p-4"><div className="min-w-0 flex-1"><p className="text-sm font-medium">Profile completion</p><p className="mt-1 text-xs text-slate-400">Add a college or phone number to round out your profile.</p></div><div className="w-32"><div className="mb-1 text-right text-xs text-slate-300">{profileCompletion}%</div><div className="h-1.5 rounded-full bg-white/10"><div className="h-1.5 rounded-full bg-cyan-400 transition-[width]" style={{ width: `${profileCompletion}%` }}/></div></div><Link className="text-xs text-cyan-200 hover:text-white" to="/app/profile">Complete profile</Link></Glass>}
    <div className="grid gap-4 lg:grid-cols-3">
      {[['Career readiness', 78, 'Up 6 points this month'], ['Resume score', 72, '3 fixes will lift it above 80']].map(([t, v, s]) => (
        <div key={t} className="vgrad flex items-center justify-between rounded-2xl p-5 shadow-[0_10px_36px_-18px_rgba(70,142,132,.65)]">
          <div><div className="text-sm text-white/80">{t}</div><div className="mt-1 text-xs text-white/70">{s}</div></div><ScoreRing value={v} size={96} color="#fff"/></div>))}
      <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Skill progress · sample</div><div className="space-y-3"><Bar label="React" value={70}/><Bar label="SQL" value={55} color="from-blue-500 to-cyan-400"/><Bar label="Docker" value={25} color="from-amber-400 to-cyan-500"/></div></Glass>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      <Glass className="p-5 lg:col-span-2"><div className="mb-3 text-sm text-slate-300">Learning tasks done this week · sample</div>
        <div className="h-52"><ResponsiveContainer><BarChart data={weekly}><XAxis dataKey="d" stroke="#64748b" tickLine={false} axisLine={false}/><YAxis stroke="#64748b" tickLine={false} axisLine={false} width={24}/>
          <Tooltip cursor={{ fill: 'rgba(255,255,255,.05)' }} contentStyle={{ background: '#14173d', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12 }}/>
          <defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00e5ff"/><stop offset="1" stopColor="#397bff"/></linearGradient></defs>
          <RBar dataKey="v" fill="url(#b)" radius={[8, 8, 0, 0]} isAnimationActive={!reduceMotion} animationDuration={850} animationEasing="ease-out"/></BarChart></ResponsiveContainer></div></Glass>
      <Glass className="p-5"><div className="mb-3 flex items-center gap-2 text-sm text-slate-300"><AlertTriangle size={15} className="text-amber-400"/>Scam alerts</div>
        <ul className="space-y-3 text-sm"><li className="rounded-xl bg-red-500/10 p-3 text-red-200">"Pay ₹999 to confirm your internship" matches a fee scam pattern.</li><li className="rounded-xl bg-amber-500/10 p-3 text-amber-200">Offer from a free email address. Check the company domain.</li></ul></Glass>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Recent job matches (sample)</div>
        {[['Frontend Intern', 84], ['Data Analyst Intern', 61], ['Backend Intern', 48]].map(([r, v]) => <div key={r} className="mb-3"><Bar label={r} value={v}/></div>)}</Glass>
      <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">Quick actions</div>
        <Stagger className="grid grid-cols-2 gap-3">{actions.map(([to, I, l]) => <StaggerItem key={to}><Link to={to} className="glass glass-hover flex items-center gap-2 p-3 text-sm"><I size={17} className="text-cyan-400"/>{l}</Link></StaggerItem>)}</Stagger></Glass>
    </div></>)
}
