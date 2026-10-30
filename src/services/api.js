import axios from 'axios'
import * as demo from './demo'

const DEMO = import.meta.env.VITE_DEMO_MODE !== 'false'
const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 45000 })
const aiOnly = async (path, payload) => {
  try { return (await http.post(path, payload)).data }
  catch (error) { throw new Error(error.response?.data?.error || 'AI service is unavailable. Configure the Gemini server key and try again.') }
}

// Calls the backend; falls back to labelled demo data when demo mode is on or the server is unreachable.
async function call(path, payload, fallback, config) {
  if (DEMO) return { demo: true, ...(await fallback(payload)) }
  try { const { data } = await http.post(path, payload, config); return { demo: false, ...data } }
  catch (e) {
    if (!e.response) return { demo: true, ...(await fallback(payload)), note: 'Backend not reachable. Showing demo result.' }
    throw new Error(e.response.data?.error || `Request failed (${e.response.status})`)
  }
}
const need = (v, msg) => { if (!v || !String(v).trim()) throw new Error(msg) }

export const api = {
  isDemo: DEMO,
  analyzeResume: async file => { if (!file) throw new Error('Choose a PDF or DOCX resume first.')
    const fd = new FormData(); fd.append('resume', file); return call('/resume/analyze', fd, demo.demoResume, { headers: { 'Content-Type': 'multipart/form-data' } }) },
  generateResumeSummary: payload => aiOnly('/resume/summary', payload),
  rewriteResumeProject: payload => aiOnly('/resume/rewrite-project', payload),
  analyzeResumeDraft: payload => aiOnly('/resume/analyze-draft', payload),
  matchJob: async p => { need(p.jd, 'Paste the job description.'); need(p.resume, 'Paste your resume text.'); return call('/match', p, demo.demoMatch) },
  analyzeScam: async p => { need(p.text, 'Paste the message or offer text.'); return call('/scam/analyze', p, demo.demoScam) },
  verifyCompany: async p => { need(p.company, 'Enter a company name.'); return call('/company/verify', p, demo.demoCompany) },
  generateRoadmap: async p => { need(p.role, 'Enter a target role.'); return call('/career/roadmap', p, demo.demoRoadmap) },
  askCareerAssistant: async p => { need(p.question, 'Ask a career question first.'); return call('/career/assistant', p, demo.demoCareerAssistant) },
  generateQuestions: async p => { need(p.role, 'Enter a role.'); return call('/interview/generate', p, demo.demoQuestions) },
  evaluateAnswer: async p => { need(p.answer, 'Write an answer first.'); return call('/interview/evaluate', p, demo.demoEvaluate) },
}
