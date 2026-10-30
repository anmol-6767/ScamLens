import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import JobMatcher from './pages/JobMatcher'
import ScamLens from './pages/ScamLens'
import Roadmap from './pages/Roadmap'
import Interview from './pages/Interview'
import Reports from './pages/Reports'
import Tracker from './pages/Tracker'
import Login from './pages/Login'
import { ForgotPassword, Privacy, Register, ResetPassword, Terms, VerifyEmail } from './pages/AccountPages'
import Profile from './pages/Profile'
import MyResumes from './pages/MyResumes'
import ResumeBuilder from './pages/ResumeBuilder'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="grid min-h-screen place-items-center text-sm text-slate-400">Restoring your account session…</main>
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace/>
}

export default function App(){
  return (<MotionConfig reducedMotion="user"><Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/verify-email" element={<VerifyEmail/>}/>
    <Route path="/reset-password" element={<ResetPassword/>}/>
    <Route path="/terms" element={<Terms/>}/>
    <Route path="/privacy" element={<Privacy/>}/>
    <Route path="/app" element={<Layout/>}>
      <Route index element={<Dashboard/>}/>
      <Route path="resume-builder/:id?" element={<ResumeBuilder/>}/>
      <Route path="resume" element={<ResumeAnalyzer/>}/>
      <Route path="match" element={<JobMatcher/>}/>
      <Route path="scam" element={<ScamLens/>}/>
      <Route path="roadmap" element={<Roadmap/>}/>
      <Route path="interview" element={<Interview/>}/>
      <Route path="reports" element={<Reports/>}/>
      <Route path="tracker" element={<Tracker/>}/>
      <Route path="profile" element={<RequireAuth><Profile/></RequireAuth>}/>
      <Route path="resumes" element={<RequireAuth><MyResumes/></RequireAuth>}/>
    </Route>
    <Route path="*" element={<Navigate to="/"/>}/>
  </Routes></MotionConfig>)
}
