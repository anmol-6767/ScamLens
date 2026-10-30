import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { LayoutDashboard, FileText, Target, ShieldAlert, Map, Mic, BarChart3, Briefcase, Menu, X, Bell, Search, Sparkles, UserRound, LogOut } from 'lucide-react'
import { pageVariants } from './motion'
import CareerAssistant from './CareerAssistant'
import { useAuth } from '../context/AuthContext'

const NAV = [
  ['/app', 'Dashboard', LayoutDashboard], ['/app/resume-builder', 'Resume Builder', FileText], ['/app/resume', 'Resume Analyzer', FileText],
  ['/app/match', 'Career Coach', Target], ['/app/scam', 'ScamLens', ShieldAlert], ['/app/roadmap', 'Career Roadmap', Map],
  ['/app/interview', 'AI Interview', Mic], ['/app/reports', 'Reports', BarChart3], ['/app/tracker', 'Applications', Briefcase]]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const nav = user ? [...NAV, ['/app/resumes', 'My Resumes', FileText], ['/app/profile', 'My Profile', UserRound]] : NAV
  const signOut = async () => { await logout(); navigate('/login') }
  return (
    <div className="min-h-screen p-2 md:p-5">
      <div className="frame mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1400px] overflow-hidden rounded-3xl md:min-h-[calc(100vh-2.5rem)]">
        <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0a0e27] p-4 transition-transform duration-300 ease-out md:static md:translate-x-0 md:bg-transparent`}>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold"><span className="vgrad grid h-8 w-8 place-items-center rounded-lg"><Sparkles size={16}/></span>SkillBridge</Link>
            <button className="md:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X/></button>
          </div>
          <div className="glass mt-5 flex items-center gap-3 p-3"><div className="vgrad grid h-9 w-9 place-items-center rounded-full text-sm font-semibold">{user ? user.fullName.slice(0, 1).toUpperCase() : 'G'}</div>
            <div className="min-w-0 text-sm"><div className="truncate font-medium">{user?.fullName || 'Guest workspace'}</div><div className="truncate text-xs text-slate-400">{user?.email || 'Sample data only'}</div></div></div>
          <nav className="mt-5 space-y-1">
            {nav.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} end={to === '/app'} onClick={() => setOpen(false)}
                className={({ isActive }) => `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                {({ isActive }) => <>{isActive && <motion.span layoutId="active-nav" className="absolute inset-0 rounded-xl bg-violet-500/20 ring-1 ring-violet-400/40" transition={{ type: 'spring', stiffness: 380, damping: 32 }}/>}
                  <Icon size={18} className="relative"/><span className="relative">{label}</span></>}</NavLink>))}
          </nav>
        </aside>
        <AnimatePresence>{open && <motion.button type="button" aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}/>}</AnimatePresence>
        <main className="min-w-0 flex-1 p-4 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu/></button>
            <div className="relative hidden flex-1 sm:block"><Search size={16} className="absolute left-3 top-3 text-slate-500"/>
              <input className="field max-w-md pl-9" placeholder="Search skills, roles…" aria-label="Search"/></div>
            <div className="ml-auto flex items-center gap-3">{user ? <details className="relative"><summary className="glass flex cursor-pointer list-none items-center gap-2 rounded-full px-3 py-2 text-sm"><span className="grid h-6 w-6 place-items-center rounded-full bg-teal-300/15 text-xs text-teal-100">{user.fullName.slice(0, 1).toUpperCase()}</span><span className="hidden max-w-36 truncate sm:inline">{user.fullName}</span></summary><div className="assistant-panel absolute right-0 top-12 z-30 min-w-48 rounded-xl border p-2 shadow-xl"><Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5" to="/app/profile"><UserRound size={15}/>My profile</Link><Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5" to="/app/resumes"><FileText size={15}/>My resumes</Link><button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-white/5" onClick={signOut}><LogOut size={15}/>Sign out</button></div></details> : <span className="chip hidden sm:inline-flex">Guest · Sample data</span>}
                <motion.button aria-label="Notifications" className="glass grid h-10 w-10 place-items-center transition-colors hover:border-cyan-300/40" whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}><Bell size={17}/></motion.button></div>
          </div>
              <AnimatePresence mode="wait"><motion.div key={pathname} variants={pageVariants} initial={false} animate="animate" exit={reduceMotion ? { opacity: 1 } : 'exit'}><Outlet/></motion.div></AnimatePresence>
        </main>
      </div>
      <CareerAssistant/>
    </div>)
}
