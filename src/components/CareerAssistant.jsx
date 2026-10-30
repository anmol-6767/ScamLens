import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Headphones, LoaderCircle, MessageCircle, Mic, MicOff, Send, Volume2, X } from 'lucide-react'
import { api } from '../services/api'

const SUGGESTIONS = [
  'How can I improve my resume?',
  'How should I prepare for an interview?',
  'What skills should I learn next?',
]

export default function CareerAssistant() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sampleAnswer, setSampleAnswer] = useState(api.isDemo)
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [voiceReply, setVoiceReply] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const panelRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => { if (open) panelRef.current?.focus() }, [open])

  useEffect(() => () => {
    recognitionRef.current?.abort()
    window.speechSynthesis?.cancel()
  }, [])

  const close = useCallback(() => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    window.speechSynthesis?.cancel()
    setOpen(false)
    setListening(false)
    setSpeaking(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = event => { if (event.key === 'Escape') close() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. You can type your question instead.')
      return
    }
    setError('')
    setVoiceReply(true)
    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = event => setQuestion(event.results[0][0].transcript)
    recognition.onerror = event => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') setError('Voice input stopped. You can try again or type your question.')
      setListening(false)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    setListening(true)
    try { recognition.start() }
    catch {
      setListening(false)
      setError('Voice input could not start. Check microphone access or type your question.')
    }
  }

  const speak = text => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setError('Spoken replies are not supported in this browser. The answer is available as text.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = navigator.language || 'en-US'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const submit = async event => {
    event.preventDefault()
    const prompt = question.trim()
    if (!prompt || busy) return
    setBusy(true)
    setError('')
    setAnswer('')
    try {
      const result = await api.askCareerAssistant({ question: prompt })
      const reply = result.answer || 'I could not prepare an answer. Please try asking another way.'
      setSampleAnswer(!!result.demo)
      setAnswer(reply)
      if (voiceReply) speak(reply)
    } catch (requestError) {
      setError(requestError.message || 'The assistant could not answer right now.')
    } finally {
      setBusy(false)
    }
  }

  return <>
    <motion.button type="button" aria-label={open ? 'Close career assistant' : 'Open career assistant'} aria-expanded={open} aria-controls="career-assistant-panel"
      className="assistant-launcher fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-xl"
      onClick={() => open ? close() : setOpen(true)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
      <Headphones size={19}/><span className="hidden sm:inline">Career guide</span><span className="sm:hidden">Ask AI</span>
    </motion.button>

    <AnimatePresence>
      {open && <motion.section ref={panelRef} tabIndex={-1} id="career-assistant-panel" role="dialog" aria-labelledby="career-assistant-title"
        className="assistant-panel fixed inset-x-3 bottom-[5.5rem] z-50 ml-auto flex max-h-[min(76vh,620px)] w-auto max-w-[410px] flex-col overflow-hidden rounded-2xl border p-4 shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[410px]"
        initial={false} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
        <header className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="assistant-mark grid h-10 w-10 place-items-center rounded-xl"><MessageCircle size={19}/></span>
            <div><h2 id="career-assistant-title" className="font-display font-semibold">Career guide</h2><p className="text-xs text-slate-400">Practical help for your next step</p></div>
          </div>
          <button type="button" className="icon-button" aria-label="Close career assistant" onClick={close}><X size={18}/></button>
        </header>

        <div className="assistant-transcript my-3 min-h-0 flex-1 overflow-y-auto rounded-xl p-3" aria-live="polite" aria-atomic="true">
          {!answer && !busy && <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-200">Tell me what you are working toward. I can help you plan, practise, or make sense of your options.</p>
            <div className="flex flex-wrap gap-2">{SUGGESTIONS.map(suggestion => <button key={suggestion} type="button" className="assistant-suggestion" onClick={() => setQuestion(suggestion)}>{suggestion}</button>)}</div>
          </div>}
          {busy && <div className="flex items-center gap-2 py-2 text-sm text-slate-300"><LoaderCircle size={17} className="animate-spin text-teal-300"/>Thinking through your question…</div>}
          {answer && <div className="space-y-3"><p className="text-xs font-medium uppercase tracking-wide text-teal-200">{sampleAnswer ? 'Sample guidance' : 'Career guide'}</p><p className="text-sm leading-6 text-slate-100">{answer}</p>
            <button type="button" className="assistant-suggestion inline-flex items-center gap-2" onClick={() => speak(answer)}><Volume2 size={15}/>{speaking ? 'Speaking…' : 'Read answer aloud'}</button>
          </div>}
          {error && <p className="mt-3 text-sm text-rose-300" role="alert">{error}</p>}
        </div>

        <form onSubmit={submit} className="space-y-2">
          <label htmlFor="assistant-question" className="sr-only">Ask a career question</label>
          <div className="flex items-end gap-2">
            <textarea id="assistant-question" className="field min-h-12 max-h-28 resize-y" rows={2} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ask a career question…" disabled={busy}/>
            <button type="button" className={`icon-button h-11 w-11 shrink-0 ${listening ? 'text-rose-300' : ''}`} onClick={listening ? () => recognitionRef.current?.stop() : startListening} aria-label={listening ? 'Stop voice input' : 'Ask using your voice'} aria-pressed={listening}>
              {listening ? <MicOff size={18}/> : <Mic size={18}/>}
            </button>
            <button type="submit" className="assistant-send grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" disabled={busy || !question.trim()} aria-label="Send question">
              {busy ? <LoaderCircle size={18} className="animate-spin"/> : <Send size={17}/>}
            </button>
          </div>
          <p className="text-[11px] leading-4 text-slate-500">{api.isDemo ? 'Sample guidance; questions stay in this browser.' : 'Questions are sent to the configured AI service. Do not share passwords or sensitive personal data.'} Voice input may use your browser’s speech service.</p>
        </form>
      </motion.section>}
    </AnimatePresence>
  </>
}