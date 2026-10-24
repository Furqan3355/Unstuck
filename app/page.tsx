'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Mic, Pause, Play, RotateCcw, Sparkles } from 'lucide-react'

type Action = { action: string; ladder: string[] }
type Result = { deadline: string; do: string[]; must_include: string[]; steps: Action[] }

const ENABLE_AI = false
const SAMPLE = 'Submit a 1500-word essay on the causes of urban air pollution by Friday 6 November, 11:59 pm. You must include at least four academic sources and use APA referencing. Read chapter 5 before you start writing. Upload the final PDF to the course portal.'

const ladders: Record<string, string[]> = {
  write: ['Write the first paragraph', 'Write one sentence about the topic', 'Open a blank document and type the title', 'Open your laptop'],
  read: ['Read the whole section', 'Read the first page', 'Open the file or book', 'Find where the reading is'],
  research: ['Find four sources', 'Find one source', 'Search one keyword', 'Write one keyword on paper'],
  present: ['Build all slides', 'Write slide titles only', 'Open slides and name the deck', 'Open the slides app'],
  solve: ['Do all questions', 'Do question 1 only', 'Copy question 1 onto paper', 'Open the worksheet'],
  submit: ['Submit the file', 'Find the final file', 'Open the submission page', 'Open the course portal'],
  default: ['Do the first part', 'Write the first thing you already know', 'Write one word about the task', 'Open what you need for it'],
}

function decode(text: string): Result {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
  const deadline = text.match(/(?:by|due|before)\s+([^.!?]*(?:\d{1,2}[:/]\d{2}|\d{1,2}\s+[A-Za-z]+|Friday|Monday|Tuesday|Wednesday|Thursday|Saturday|Sunday)[^.!?]*)/i)?.[1]?.trim() || 'No deadline found, check your handout'
  const mustInclude = sentences.filter((s) => /\b(must|should|at least|minimum|required|\d+[- ]?word|\d+ pages?|sources?|apa)\b/i.test(s)).map((s) => s.replace(/^(you\s+)?must\s+/i, '').replace(/\.$/, '').trim())
  const steps: Action[] = []
  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase()
    if (/\b(must|should|at least|minimum|required)\b|\bAPA\b|\bacademic sources?\b/i.test(sentence)) return
    let key: keyof typeof ladders | null = null
    if (/\bread\b|chapter/.test(lower)) key = 'read'
    else if (/\bwrite\b|essay|report/.test(lower)) key = 'write'
    else if (/\bresearch\b|\bfind\b/.test(lower)) key = 'research'
    else if (/\bpresent\b|slides?/.test(lower)) key = 'present'
    else if (/\bsolve\b|\banswer\b|calculate/.test(lower)) key = 'solve'
    else if (/\bsubmit\b|\bupload\b/.test(lower)) key = 'submit'
    if (key && !steps.some((step) => step.action.toLowerCase().includes(key))) {
      let action = key === 'read' ? (sentence.match(/read\s+(.+)/i)?.[0] || sentence) : sentence.replace(/\.$/, '')
      if (key === 'write' || (key === 'submit' && /essay/i.test(action))) { key = 'write'; action = 'Write the essay' }
      if (key === 'submit' && /submit/i.test(action) && /essay/i.test(action)) return
      if (key === 'submit') action = 'Upload the final file'
      steps.push({ action: action.charAt(0).toUpperCase() + action.slice(1), ladder: ladders[key] })
    }
  })
  const order = ['read', 'write', 'research', 'present', 'solve', 'submit']
  steps.sort((a, b) => order.findIndex((key) => a.action.toLowerCase().includes(key)) - order.findIndex((key) => b.action.toLowerCase().includes(key)))
  return { deadline, do: steps.map((s) => s.action), must_include: mustInclude.length ? mustInclude.map((s) => s.replace(/^submit\s+.*?\.\s*/i, '').replace(/^include\s+/i, '')) : ['Nothing specific found'], steps }
}

export default function Page() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [current, setCurrent] = useState(0)
  const [level, setLevel] = useState(1)
  const [done, setDone] = useState<string[]>([])
  const [size, setSize] = useState('normal')
  const [contrast, setContrast] = useState(false)
  const [dyslexia, setDyslexia] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [seconds, setSeconds] = useState(120)
  const [timerRunning, setTimerRunning] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)

  useEffect(() => setVoiceSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window), [])
  useEffect(() => { if (!timerRunning || seconds <= 0) return; const id = window.setInterval(() => setSeconds((s) => s - 1), 1000); return () => window.clearInterval(id) }, [timerRunning, seconds])
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.target instanceof HTMLTextAreaElement) return; if (e.key.toLowerCase() === 'n') handleDone(); if (e.key.toLowerCase() === 's') handleStuck() }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) })

  const active = result?.steps[current]
  const stepText = active?.ladder[level] || ''
  const progress = result ? Math.round((done.length / result.steps.length) * 100) : 0
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const appClass = `unstuck-app size-${size}${contrast ? ' high-contrast' : ''}${dyslexia ? ' dyslexia' : ''}${reduceMotion ? ' reduce-motion' : ''}`

  function makeClear() { const next = decode(text); setResult(next); setCurrent(0); setLevel(1); setDone([]) }
  function handleStuck() { if (!active) return; setLevel((l) => Math.min(l + 1, 3)) }
  function handleDone() { if (!active || !result) return; const nextDone = [...done, active.action]; if (current + 1 >= result.steps.length) { setDone(nextDone); return } setDone(nextDone); setCurrent((c) => c + 1); setLevel(1) }
  function startVoice() { const Recognition = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition || (window as any).webkitSpeechRecognition; if (!Recognition) return; const recognition = new Recognition(); recognition.lang = 'en-US'; recognition.onresult = (e: any) => setText((t) => `${t} ${e.results[0][0].transcript}`.trim()); recognition.start() }

  return <main className={appClass}>
    <div className="page-shell">
      <header className="topbar"><a className="brand" href="#top" aria-label="Unstuck home"><span className="brand-mark">U</span><span>Unstuck</span></a><div className="accessibility"><span className="access-label">Accessibility</span><div className="segmented" aria-label="Text size"><button className={size === 'normal' ? 'selected' : ''} onClick={() => setSize('normal')}>A</button><button className={size === 'large' ? 'selected' : ''} onClick={() => setSize('large')}>A<sup>+</sup></button><button className={size === 'extra' ? 'selected' : ''} onClick={() => setSize('extra')}>A<sup>++</sup></button></div><button className={`toggle ${contrast ? 'on' : ''}`} aria-pressed={contrast} onClick={() => setContrast(!contrast)}>Contrast</button><button className={`toggle ${dyslexia ? 'on' : ''}`} aria-pressed={dyslexia} onClick={() => setDyslexia(!dyslexia)}>Dyslexia font</button><button className={`toggle ${reduceMotion ? 'on' : ''}`} aria-pressed={reduceMotion} onClick={() => setReduceMotion(!reduceMotion)}>Reduce motion</button></div></header>
      <section id="top" className="hero"><p className="eyebrow">A softer way to begin</p><h1>Let&apos;s make this<br /><em>feel smaller.</em></h1><p className="intro">Paste your assignment below. We&apos;ll find the first tiny thing you can do right now.</p></section>
      <section className={`input-card ${result ? 'compact' : ''}`}><div className="label-row"><label htmlFor="assignment">Paste your assignment here</label><span>{text.length}/4,000</span></div><div className="textarea-wrap"><textarea id="assignment" value={text} maxLength={4000} onChange={(e) => setText(e.target.value)} placeholder="e.g. Submit a 1500-word essay by Friday..." />{voiceSupported && <button className="mic-button" aria-label="Dictate assignment" onClick={startVoice}><Mic size={19} /></button>}</div><div className="input-footer"><span className="privacy-note">Nothing leaves your browser.</span><button className="primary-button" onClick={makeClear} disabled={!text.trim()}><Sparkles size={18} /> Make it clear</button></div>{!voiceSupported && <p className="voice-note">Voice input isn&apos;t available in this browser.</p>}</section>
      {result && <div className="results" aria-live="polite"><div className="live-strip" role="status"><span className="live-dot" aria-hidden="true" /> <span>Plan ready</span><span className="live-divider" /> <span>{done.length} of {result.steps.length} steps complete</span><span className="live-progress" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></span></div><section className="plain-card"><div className="card-heading"><span className="number">01</span><h2>Here&apos;s what it says</h2></div><div className="plain-grid"><div><h3>What you need to do</h3><ul>{result.do.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Deadline</h3><p>{result.deadline}</p></div><div><h3>Must include</h3><ul>{result.must_include.map((item) => <li key={item}>{item}</li>)}</ul></div></div>{ENABLE_AI && <button className="ai-button"><Sparkles size={16} /> Improve with AI</button>}</section>
        <section className="next-card"><div className="card-heading"><span className="number">02</span><h2>Your next tiny step</h2><span className="shortcut-hint">N = done · S = smaller</span></div>{done.length >= result.steps.length ? <div className="finished"><Check size={32} /><h3>Nice. You started.</h3><p>That counts. You can come back when you&apos;re ready for the next thing.</p><button className="secondary-button" onClick={() => { setText(''); setResult(null); setDone([]) }}><RotateCcw size={17} /> Start another</button></div> : <><div className="step-display"><span className="step-kicker">Step {Math.min(current + 1, result.steps.length)} of {result.steps.length}</span><p>{stepText}</p><span className="step-status">{level === 3 ? 'This is as small as it gets. Just do this one thing.' : 'No rush. Smaller is fine.'}</span></div><div className="action-row"><button className="done-button" onClick={handleDone}><Check size={19} /> Done</button><button className="stuck-button" onClick={handleStuck}><span>↘</span> I&apos;m stuck</button></div><div className="timer"><button onClick={() => setTimerRunning(!timerRunning)}>{timerRunning ? <Pause size={16} /> : <Play size={16} />} {timerRunning ? 'Pause timer' : 'Start 2-minute timer'}</button><span>{minutes}:{secs}</span><button className="reset-timer" aria-label="Reset timer" onClick={() => { setTimerRunning(false); setSeconds(120) }}><RotateCcw size={14} /></button></div></>}</section></div>}
      <footer><span>Made for the moment before starting.</span><span>Press <b>N</b> for done · <b>S</b> for smaller</span></footer>
    </div>
  </main>
}

