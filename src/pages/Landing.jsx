

import { Link } from 'react-router-dom'
import {
  FileText,
  Cpu,
  BadgeCheck,
  BookMarked,
  ArrowRight,
  Target,
  Users,
  MapPin,
  Swords,
  GraduationCap,
  CircleDollarSign,
  Lightbulb,
} from 'lucide-react'

/* ─── Design tokens ─────────────────────────────────────────── */
const TEAL = '#06B6D4'
const CYAN = '#00D9FF'
const BG = '#0F172A'

/* ─── Data ───────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  { icon: FileText, step: '01', label: 'Describe Your Idea', sub: 'Tell us what you are building in plain language.' },
  { icon: Cpu, step: '02', label: 'AI Scores It', sub: 'Six factors analysed instantly against the Indian market.' },
  { icon: BadgeCheck, step: '03', label: 'Get Your Verdict', sub: 'Build It, Pivot It, Drop It, or Sleeper Hit — no fluff.' },
  { icon: BookMarked, step: '04', label: 'Save & Revisit', sub: 'Every analysis saved to your dashboard for reference.' },
]

const IVSM_FACTORS = [
  { n: '01', name: 'Problem Clarity', desc: 'Is the problem real, specific, and painful enough to solve?' },
  { n: '02', name: 'Target User Fit', desc: 'Can you identify and reach the exact people who will pay?' },
  { n: '03', name: 'India Market Fit', desc: 'Does the unit economics work in an Indian price-sensitivity context?' },
  { n: '04', name: 'Competition & Diff.', desc: 'Is there a defensible angle against existing or likely competitors?' },
  { n: '05', name: 'Domain Expertise Req.', desc: 'How much specialised knowledge does execution actually demand?' },
  { n: '06', name: 'First Revenue Likelihood', desc: 'How quickly can you get someone to pay — in 90 days or less?' },
]

const VERDICTS = [
  {
    label: 'BUILD IT',
    range: 'Score 50 – 60',
    desc: 'Strong signal. Start validating with real users this week.',
    border: '#22c55e',
    text: '#22c55e',
    bg: 'rgba(34,197,94,0.06)',
  },
  {
    label: 'PIVOT IT',
    range: 'Score 40 – 49',
    desc: 'Core insight is there, but the execution angle needs a rethink.',
    border: '#f59e0b',
    text: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
  },
  {
    label: 'DROP IT',
    range: 'Score 25 – 39',
    desc: 'Too many red flags. Save 18 months of your life and move on.',
    border: '#ef4444',
    text: '#ef4444',
    bg: 'rgba(239,68,68,0.06)',
  },
  {
    label: 'SLEEPER HIT',
    range: 'Score override',
    desc: 'Contrarian but compelling. Ahead of the curve — watch this space.',
    border: TEAL,
    text: TEAL,
    bg: 'rgba(6,182,212,0.06)',
  },
]

/* ─── Sub-components ─────────────────────────────────────────── */

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Lightbulb size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">IdeaVerdict</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition-all hover:shadow-lg hover:shadow-cyan-500/30"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

function StatChip({ text }) {
  return (
    <span
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-700/50 bg-slate-800/30 text-slate-400"
    >
      {text}
    </span>
  )
}

/* ─── Sections ───────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
      <div className="inline-block mb-6 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-700/50">
        <span className="text-xs font-semibold text-cyan-300">AI-Powered Startup Evaluation</span>
      </div>

      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.07] mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
        Stop Guessing.<br />
        Start Knowing.
      </h1>

      <p className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed text-slate-400">
        The AI-powered startup stress-tester for Indian founders. Get brutally honest feedback in seconds.
      </p>

      <Link
        to="/auth"
        className="inline-flex items-center gap-2 px-7 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/30"
      >
        Stress-Test My Idea <ArrowRight size={17} />
      </Link>

      <div className="flex flex-wrap justify-center gap-3 mt-10">
        <StatChip text="90% startups fail" />
        <StatChip text="₹12L+ avg burn" />
        <StatChip text="18 months wasted" />
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="w-full py-24 border-t border-slate-800/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-700/50">
          <span className="text-xs font-semibold text-blue-300">Process</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-12">
          Four steps to a brutal verdict.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map(({ icon: Icon, step, label, sub }) => (
            <div
              key={step}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-slate-900/60 backdrop-blur border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Icon size={19} />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{step}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-base mb-2">{label}</p>
                  <p className="text-sm text-slate-400">{sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IVSMFramework() {
  const icons = [Target, Users, MapPin, Swords, GraduationCap, CircleDollarSign]

  return (
    <section className="w-full py-24 border-t border-slate-800/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-700/50">
          <span className="text-xs font-semibold text-purple-300">Framework</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-3">
          Six factors. No padding.
        </h2>
        <p className="text-base text-slate-400 max-w-lg mb-12">
          Every idea is stress-tested across six dimensions designed for the Indian startup context.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IVSM_FACTORS.map(({ n, name, desc }, i) => {
            const Icon = icons[i]
            return (
              <div
                key={n}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-slate-900/60 backdrop-blur border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{n}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">{name}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function VerdictTypes() {
  return (
    <section className="w-full py-24 border-t border-slate-800/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-green-950/50 border border-green-700/50">
          <span className="text-xs font-semibold text-green-300">Outcomes</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-12">
          Four outcomes. Complete honesty.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {VERDICTS.map(({ label, range, desc, border, text, bg }) => (
            <div
              key={label}
              className="group relative"
            >
              <div className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${text}20` }}></div>
              <div
                className="relative rounded-xl p-6 flex flex-col gap-4 backdrop-blur border transition-all"
                style={{
                  border: `1px solid ${border}30`,
                  background: bg,
                }}
              >
                <span className="text-xs font-black tracking-widest uppercase" style={{ color: text }}>
                  {label}
                </span>
                <div>
                  <p className="text-xs font-semibold mb-2 tabular-nums" style={{ color: `${text}99` }}>
                    {range}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300">{desc}</p>
                </div>
                <div className="h-0.5 w-10 rounded-full mt-auto" style={{ background: text }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAStrip() {
  return (
    <section className="w-full py-28 border-t border-slate-800/30">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full bg-orange-950/50 border border-orange-700/50">
          <span className="text-xs font-semibold text-orange-300">Ready?</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
          Your idea deserves<br />an honest answer.
        </h2>
        <p className="text-base text-slate-400 mb-10">
          Free to use. No pitch decks. No jargon. Just the truth.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold transition-all hover:shadow-lg hover:shadow-cyan-500/30"
        >
          Stress-Test My Idea <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <NavBar />
      <Hero />
      <HowItWorks />
      <IVSMFramework />
      <VerdictTypes />
      <CTAStrip />
      
      {/* Footer */}
      <div className="w-full py-8 border-t border-slate-800/30">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>Powered by IVSM (Idea Viability Scoring Model)</p>
        </div>
      </div>
    </div>
  )
}
