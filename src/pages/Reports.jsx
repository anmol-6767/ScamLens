import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useReducedMotion } from 'framer-motion'
import { Glass, PageHeader } from '../components/ui'

const tip = { contentStyle: { background: '#14173d', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12 } }
const ax = { stroke: '#64748b', tickLine: false, axisLine: false }
const resume = [['Aug', 54], ['Sep', 61], ['Oct', 72]].map(([m, v]) => ({ m, v }))
const skills = [['Wk1', 20], ['Wk2', 34], ['Wk3', 47], ['Wk4', 62]].map(([m, v]) => ({ m, v }))
const matches = [['Frontend', 84], ['Data', 61], ['Backend', 48], ['QA', 40]].map(([m, v]) => ({ m, v }))
const scams = [['Aug', 1], ['Sep', 3], ['Oct', 2]].map(([m, v]) => ({ m, v }))
const Card = ({ title, children }) => <Glass className="p-5"><div className="mb-3 text-sm text-slate-300">{title}</div><div className="h-56"><ResponsiveContainer>{children}</ResponsiveContainer></div></Glass>

export default function Reports() {
  const reduceMotion = useReducedMotion()
  return (<>
    <PageHeader title="Reports" subtitle="Sample data. Your real history will appear here as you use the tools."/>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Resume score history"><LineChart data={resume}><CartesianGrid stroke="rgba(255,255,255,.06)"/><XAxis dataKey="m" {...ax}/><YAxis {...ax} width={28}/><Tooltip {...tip}/><Line dataKey="v" stroke="#6db9ad" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={!reduceMotion} animationDuration={850}/></LineChart></Card>
      <Card title="Skill growth"><AreaChart data={skills}><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#579d92" stopOpacity=".55"/><stop offset="1" stopColor="#579d92" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="m" {...ax}/><YAxis {...ax} width={28}/><Tooltip {...tip}/><Area dataKey="v" stroke="#579d92" strokeWidth={2} fill="url(#s)" isAnimationActive={!reduceMotion} animationDuration={850}/></AreaChart></Card>
      <Card title="Job match scores by role"><BarChart data={matches}><XAxis dataKey="m" {...ax}/><YAxis {...ax} width={28}/><Tooltip {...tip} cursor={{ fill: 'rgba(255,255,255,.05)' }}/><Bar dataKey="v" fill="#3b82f6" radius={[8, 8, 0, 0]} isAnimationActive={!reduceMotion} animationDuration={850}/></BarChart></Card>
      <Card title="Messages checked in ScamLens"><BarChart data={scams}><XAxis dataKey="m" {...ax}/><YAxis {...ax} width={28} allowDecimals={false}/><Tooltip {...tip} cursor={{ fill: 'rgba(255,255,255,.05)' }}/><Bar dataKey="v" fill="#ec4899" radius={[8, 8, 0, 0]} isAnimationActive={!reduceMotion} animationDuration={850}/></BarChart></Card>
    </div></>)
}
