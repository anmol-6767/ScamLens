import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ShieldCheck, Cloud, Settings, BarChart3, FileText, Target, Map, Mic, Sparkles, Upload, Cpu, Rocket } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import { PillButton, Glass } from '../components/ui'

const trend = [8, 14, 11, 20, 18, 30, 26, 41, 38, 55].map((v, i) => ({ i, v }))
const FEATURES = [
  [FileText, 'Resume Analyzer', 'Score your resume and see which keywords are missing.'],
  [Target, 'Job Matcher', 'Paste a job description and see exactly where you fit and where you don\'t.'],
  [ShieldCheck, 'ScamLens', 'Check offer messages for common scam patterns before you reply.'],
  [Map, 'Career Roadmap', 'A 30-day learning plan with daily tasks you can tick off.'],
  [Mic, 'Interview Studio', 'Practise technical and HR questions and get feedback on your answers.'],
  [BarChart3, 'Progress Reports', 'Track resume score, skills and applications in one place.']]
const STEPS = [[Upload, 'Add your resume', 'Upload a PDF or DOCX.'], [Cpu, 'Get your analysis', 'See your score, skill gaps and job match.'], [Rocket, 'Follow your plan', 'Work through the roadmap and practise interviews.']]
const NAVL = [['Features', '#features'], ['How it works', '#how'], ['ScamLens', '#features']]

const Float = ({ icon: I, className, d = 0 }) => (
  <motion.div initial={false} animate={{ y: 0 }} transition={{ duration: 0.35, delay: d }}
    className={`glass absolute grid h-14 w-14 place-items-center text-cyan-400 shadow-[0_8px_24px_-12px_rgba(50,120,115,.45)] ${className}`}><I size={24}/></motion.div>)

export default function Landing() {
  return (
    <motion.div initial={false} animate={{ y: 0 }} transition={{ duration: 0.32, ease: 'easeOut' }} className="mx-auto max-w-[1200px] px-4 pb-10 pt-5">
      <header className="glass sticky top-3 z-20 flex items-center justify-between rounded-full px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold"><span className="vgrad grid h-8 w-8 place-items-center rounded-full"><Sparkles size={15}/></span>SkillBridge AI</Link>
        <nav className="hidden gap-2 text-sm text-slate-300 md:flex">
          {NAVL.map(([l, h], i) => <a key={l} href={h} className={`rounded-full px-4 py-1.5 hover:text-white ${i === 0 ? 'border border-violet-400/60 text-white' : ''}`}>{l}</a>)}</nav>
        <PillButton to="/login" className="!py-1.5">Sign in</PillButton>
      </header>

      <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl md:text-6xl">Get career-ready. Stay scam-safe.</h1>
          <p className="mt-5 max-w-md text-slate-300">SkillBridge AI checks your resume, matches you to roles, builds a 30-day learning plan and flags suspicious job offers, so you can apply with confidence.</p>
          <div className="mt-8 flex flex-wrap gap-3"><PillButton to="/app">Open the app</PillButton><PillButton to="/app/scam" variant="ghost" arrow={false}>Try ScamLens</PillButton></div>
        </div>
        <div className="relative mx-auto h-[360px] w-full max-w-[520px]">
          <div className="absolute left-1/2 top-0 -translate-x-1/2"><div className="grid h-28 w-28 place-items-center rounded-full border border-teal-200/10 bg-teal-500/10 text-teal-100 shadow-[0_0_64px_-24px_rgba(82,154,144,.55)]"><Brain size={58}/></div></div>
          <Glass className="absolute inset-x-6 bottom-0 top-28 overflow-hidden p-4 shadow-[0_18px_48px_-34px_rgba(97,155,147,.55)]">
            <div className="mb-2 flex justify-between text-xs text-slate-400"><span>Career overview</span><span className="chip">Sample</span></div>
            <div className="h-28"><ResponsiveContainer><AreaChart data={trend}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#579d92" stopOpacity=".55"/><stop offset="1" stopColor="#579d92" stopOpacity="0"/></linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke="#83c3b9" strokeWidth={2} fill="url(#g)"/></AreaChart></ResponsiveContainer></div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">{[['72', 'Resume'], ['78%', 'Ready'], ['4', 'Matches']].map(([a, b]) => <div key={b} className="rounded-xl bg-white/5 py-2"><div className="font-display text-base font-semibold">{a}</div><div className="text-slate-400">{b}</div></div>)}</div>
          </Glass>
          <Float icon={ShieldCheck} className="right-0 top-6"/><Float icon={Cloud} className="-right-2 top-40" d={1}/><Float icon={Settings} className="-left-2 top-16" d={.5}/><Float icon={BarChart3} className="-left-4 bottom-10" d={1.5}/>
        </div>
      </section>

      <section id="features" className="py-10">
        <h2 className="text-2xl font-semibold md:text-3xl">Everything a student needs before applying</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([I, t, d]) => <Glass hover key={t} className="p-5"><span className="vgrad mb-3 grid h-10 w-10 place-items-center rounded-xl"><I size={19}/></span><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></Glass>)}
        </div>
      </section>

      <section id="how" className="py-10">
        <h2 className="text-2xl font-semibold md:text-3xl">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map(([I, t, d], i) => <Glass key={t} className="p-5"><div className="mb-3 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-400/50 text-sm text-cyan-300">{i + 1}</span><I size={20} className="text-violet-400"/></div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-400">{d}</p></Glass>)}
        </div>
      </section>

      <Glass className="my-10 flex flex-wrap items-center justify-between gap-4 p-7"><div><h2 className="text-xl font-semibold">Check an offer before you reply</h2><p className="text-sm text-slate-400">Paste the message into ScamLens. It takes a few seconds.</p></div><PillButton to="/app/scam">Open ScamLens</PillButton></Glass>

      <footer className="flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-sm text-slate-500">
        <span>© 2026 SkillBridge AI</span><span>AI suggestions are guidance, not verification. Always confirm companies yourself.</span></footer>
    </motion.div>)
}
