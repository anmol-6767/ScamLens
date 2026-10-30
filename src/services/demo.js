// Demo layer: used when VITE_DEMO_MODE=true or the backend is unreachable.
// Results are local heuristics / sample data and are always labelled "Demo" in the UI.
const SK = ['python','javascript','typescript','react','node','sql','java','git','docker','aws','machine learning','html','css','figma','excel','tensorflow','flask','mongodb','c++','kubernetes','data structures','rest api','linux','tailwind','pandas','communication']
export const extractSkills = t => SK.filter(s => (t || '').toLowerCase().includes(s))
const wait = ms => new Promise(r => setTimeout(r, ms))

export const demoResume = async () => { await wait(900); return {
  score: 72, skills: ['Python','React','SQL','Git','HTML','CSS'],
  strengths: ['Clear project section with tech stack listed','Relevant coursework included','Concise one-page format'],
  weaknesses: ['Projects lack measurable outcomes','No links to GitHub or portfolio','Skills section is not grouped by category'],
  missingKeywords: ['REST API','Docker','Unit testing','CI/CD','TypeScript'],
  recommendations: ['Add numbers to each project (users, speed, accuracy)','Add a GitHub link and a live demo link','Group skills into Languages, Frameworks and Tools','Add one internship or open-source contribution if available'],
  note: 'Sample result. Connect the backend to analyse your uploaded file.' } }

export const demoCareerAssistant = async ({ question = '' }) => { await wait(450)
  const q = question.toLowerCase()
  const answer = q.includes('resume') ? 'Start by tailoring your summary and top skills to the role. For each project, add the problem, your contribution, and one measurable result. Keep the resume concise, then compare its keywords with the job description.'
    : q.includes('interview') ? 'Pick one relevant project and practise explaining the goal, your specific decisions, a challenge, and the outcome. Keep the answer structured and concrete; a short STAR outline is a useful starting point.'
    : q.includes('scam') || q.includes('offer') ? 'Pause before sharing documents or paying anything. Verify the role through the company website you find independently, check that the sender uses its official domain, and ask for a standard interview process. No automated check can prove an offer is genuine.'
    : q.includes('skill') || q.includes('learn') ? 'Choose one target role, then review several current job descriptions for repeated skills. Select one gap you can demonstrate with a small project, define a weekly milestone, and add the finished work to your portfolio.'
    : 'A practical next step is to choose one role you are targeting, compare your current evidence against a few job descriptions, and focus this week on one visible improvement: a stronger project, a tailored resume, or a short interview practice session.'
  return { answer, demo: true, note: 'Sample guidance. Ask a specific question for more relevant advice.' } }

export const demoMatch = async ({ jd = '', resume = '' }) => { await wait(700)
  const need = extractSkills(jd), have = extractSkills(resume)
  const matched = need.filter(s => have.includes(s)), missing = need.filter(s => !have.includes(s))
  const score = need.length ? Math.round(matched.length / need.length * 100) : 0
  return { score, matched, missing,
    breakdown: [{ label: 'Skills overlap', value: score }, { label: 'Keyword coverage', value: Math.min(100, score + 8) }, { label: 'Tools & frameworks', value: Math.max(0, score - 10) }],
    improvements: missing.length ? missing.slice(0, 4).map(s => `Add a project or course that shows ${s}`) : ['Strong overlap. Tailor your summary to the role title.'],
    internships: ['Frontend / Web Developer Intern','Software Engineering Intern','Junior Data Analyst Intern'],
    note: 'Keyword comparison only, calculated in your browser. Not an AI judgement.' } }

const FLAGS = [
  [/(registration|training|security|processing|refundable)\s*(fee|deposit)|pay\s+(rs\.?|inr|₹|\$)/i, 35, 'Asks you to pay money before starting work'],
  [/no interview|without (an )?interview|guaranteed (job|placement|salary)/i, 20, 'Offers a job without a real interview'],
  [/whatsapp|telegram/i, 12, 'Moves the conversation to WhatsApp or Telegram'],
  [/@(gmail|yahoo|outlook|hotmail)\./i, 12, 'Offer sent from a free email address, not a company domain'],
  [/urgent|within 24 hours|limited (slots|seats)|last chance/i, 10, 'Creates time pressure'],
  [/(like|subscribe|rate|review).{0,30}(earn|paid)|per task|daily (income|earning)|earn.{0,12}per day/i, 25, 'Pays for simple online tasks (common task-scam pattern)'],
  [/bank (details|account)|aadhaar|pan card|otp/i, 18, 'Asks for sensitive personal or bank details early'] ]
export const demoScam = async ({ text = '', domain = '' }) => { await wait(800)
  let risk = 0; const evidence = []
  FLAGS.forEach(([re, w, msg]) => { if (re.test(text)) { risk += w; evidence.push(msg) } })
  risk = Math.min(100, risk)
  const level = risk >= 60 ? 'High risk' : risk >= 30 ? 'Medium risk' : 'Low signals found'
  const pay = evidence.some(e => e.includes('pay money')), task = evidence.some(e => e.includes('task'))
  return { risk, level, evidence: evidence.length ? evidence : ['No common scam phrases found. This does not prove the offer is genuine.'],
    stage: pay ? 'Payment request' : task ? 'Task and trust building' : evidence.length ? 'Initial contact' : 'No clear scam stage detected',
    recommendations: ['Never pay a fee to get a job or internship','Look up the company on its official website and LinkedIn page yourself','Ask for an interview on a known platform and an offer on company letterhead','Report scams at cybercrime.gov.in or call 1930 (India)'],
    verification: { status: 'Not verified', notes: domain ? `Domain "${domain}" was not checked. Use WHOIS and the company's official site to confirm.` : 'No domain provided.' },
    note: 'Pattern check calculated in your browser. It cannot confirm a company is real or fake.' } }

export const demoRoadmap = async ({ role = 'Frontend Developer' }) => { await wait(900)
  const w = (n, title, tasks) => ({ title, tasks: tasks.map((t, i) => ({ id: `w${n}t${i}`, text: t })) })
  return { role, weeks: [
    w(1, 'Week 1: Foundations', ['HTML & CSS refresher (3 hrs)','JavaScript: functions, arrays, objects','Set up Git and push a first repo','Build a responsive landing page']),
    w(2, 'Week 2: Core skills', ['JavaScript async and fetch','React components and props','React state and hooks','Mini project: to-do app']),
    w(3, 'Week 3: Build', ['React Router and forms','Call a public API and show data','Add tests for one component','Deploy the project online']),
    w(4, 'Week 4: Job-ready', ['Polish portfolio and README files','Update resume with project results','Do 2 mock interviews','Apply to 5 internships'])],
    projects: ['Weather dashboard with charts','Expense tracker with local storage','Portfolio site with blog'], courses: ['freeCodeCamp: Responsive Web Design','The Odin Project: JavaScript path','React docs: Learn React'],
    note: 'Sample plan. Course names are suggestions, not live listings.' } }

const QS = { technical: ['Explain the difference between let, const and var.','How does the virtual DOM help React performance?','What is a REST API and how do you design one?','How would you debug a slow web page?'], hr: ['Tell me about yourself.','Describe a time you worked in a team and faced a conflict.','Why do you want this role?','Where do you see yourself in two years?'] }
export const demoQuestions = async ({ role }) => { await wait(500)
  return { questions: [...QS.technical.map((t, i) => ({ id: `t${i}`, type: 'Technical', text: t })), ...QS.hr.map((t, i) => ({ id: `h${i}`, type: 'HR', text: t }))].slice(0, 6), role, note: 'Sample question bank.' } }
export const demoEvaluate = async ({ answer = '' }) => { await wait(600)
  const words = answer.trim().split(/\s+/).filter(Boolean).length
  const score = Math.min(90, 30 + words * 2)
  return { score, feedback: words < 25 ? 'Your answer is short. Add a concrete example.' : 'Good length. Make the structure clearer: situation, action, result.',
    improvements: ['Open with a one-line direct answer','Add one real example from a project','Close with what you learned'], note: 'Scored on answer length only (demo).' } }
export const demoCompany = async ({ company = '', domain = '' }) => { await wait(500)
  return { status: 'Not verified', checks: [`Search "${company}" on the MCA company registry`, `Check that ${domain || 'the website'} is the same domain used in the offer email`, 'Look for employees on LinkedIn with a history at the company', 'Search the company name with the word "scam" or "reviews"'], note: 'Checklist only. No live company lookup was done.' } }
