

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
} from 'lucide-react'

/* ─── Design tokens ─────────────────────────────────────────── */
const TEAL = '#00C9A7'
const BG = '#0A0A0A'

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
    bg: 'rgba(0,201,167,0.06)',
  },
]

/* ─── Sub-components ─────────────────────────────────────────── */

function NavBar() {
  return (
    <nav
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="sticky top-0 z-50 w-full"
      aria-label="Site navigation"
    >
      <div
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(12px)' }}
        className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-white font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          style={{ textDecoration: 'none' }}
        >
          Idea<span style={{ color: TEAL }}>Verdict</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-medium transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => (e.target.style.color = '#fff')}
            onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.55)')}
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{ background: TEAL, color: '#0A0A0A' }}
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
      className="text-xs font-medium px-3 py-1.5 rounded-full"
      style={{
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'rgba(255,255,255,0.5)',
        background: 'rgba(255,255,255,0.04)',
        letterSpacing: '0.02em',
      }}
    >
      {text}
    </span>
  )
}

/* ─── Sections ───────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-28 pb-24 text-center">
      {/* Eyebrow */}
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-6"
        style={{ color: TEAL }}
      >
        AI-Powered Startup Stress-Tester
      </p>

      {/* Headline */}
      <h1
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.07] text-white mb-6"
      >
        Stop Guessing.<br />
        <span style={{ color: TEAL }}>Start Knowing.</span>
      </h1>

      {/* Subline */}
      <p
        className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        The AI-powered startup stress-tester for Indian founders.
      </p>

      {/* CTA */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-bold transition-all duration-200"
        style={{
          background: TEAL,
          color: '#0A0A0A',
          boxShadow: `0 0 36px rgba(0,201,167,0.35)`,
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 52px rgba(0,201,167,0.55)`; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 36px rgba(0,201,167,0.35)`; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        Stress-Test My Idea <ArrowRight size={17} />
      </Link>

      {/* Stat chips */}
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
    <section
      id="how-it-works"
      className="w-full py-24"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel>How It Works</SectionLabel>
        <SectionTitle>Four steps to a brutal verdict.</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px mt-14"
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}
        >
          {HOW_IT_WORKS.map(({ icon: Icon, step, label, sub }) => (
            <div
              key={step}
              className="flex flex-col gap-5 p-8 group transition-colors duration-200"
              style={{ background: BG }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,201,167,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = BG)}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,201,167,0.12)', color: TEAL }}
                >
                  <Icon size={19} />
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: 'rgba(255,255,255,0.18)' }}
                >
                  {step}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-base mb-1.5">{label}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {sub}
                </p>
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
    <section
      id="framework"
      className="w-full py-24"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel>The IVSM Framework</SectionLabel>
        <SectionTitle>Six factors. No padding.</SectionTitle>
        <p
          className="text-base mt-3 max-w-lg"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Every idea is stress-tested across six dimensions designed for the Indian startup context.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {IVSM_FACTORS.map(({ n, name, desc }, i) => {
            const Icon = icons[i]
            return (
              <div
                key={n}
                className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200"
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.025)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = `1px solid rgba(0,201,167,0.25)`
                  e.currentTarget.style.background = 'rgba(0,201,167,0.04)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(0,201,167,0.1)', color: TEAL }}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: 'rgba(255,255,255,0.15)' }}
                  >
                    {n}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1.5">{name}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    {desc}
                  </p>
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
    <section
      id="verdicts"
      className="w-full py-24"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <SectionLabel>Verdict Types</SectionLabel>
        <SectionTitle>Four outcomes. Complete honesty.</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-14">
          {VERDICTS.map(({ label, range, desc, border, text, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                border: `1px solid ${border}30`,
                background: bg,
              }}
            >
              <span
                className="text-xs font-black tracking-widest uppercase"
                style={{ color: text }}
              >
                {label}
              </span>
              <div>
                <p
                  className="text-xs font-semibold mb-2 tabular-nums"
                  style={{ color: `${text}99` }}
                >
                  {range}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {desc}
                </p>
              </div>
              {/* Score dot indicator */}
              <div
                className="h-0.5 w-10 rounded-full mt-auto"
                style={{ background: text }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTAStrip() {
  return (
    <section
      className="w-full py-28"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p
          className="text-sm font-semibold uppercase tracking-widest mb-6"
          style={{ color: TEAL }}
        >
          Ready?
        </p>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-8">
          Your idea deserves<br />an honest answer.
        </h2>
        <p
          className="text-base mb-10"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Free to use. No pitch decks. No jargon. Just the truth.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-200"
          style={{
            background: TEAL,
            color: '#0A0A0A',
            boxShadow: `0 0 40px rgba(0,201,167,0.38)`,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 56px rgba(0,201,167,0.6)`; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 40px rgba(0,201,167,0.38)`; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Stress-Test My Idea <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  )
}

/* ─── Shared typography helpers ──────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: TEAL }}
    >
      {children}
    </p>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
      {children}
    </h2>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div
      style={{
        background: BG,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        minHeight: '100vh',
        color: '#fff',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <NavBar />
      <Hero />
      <HowItWorks />
      <IVSMFramework />
      <VerdictTypes />
      <CTAStrip />
    </div>
  )
}
