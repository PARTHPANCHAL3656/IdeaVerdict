import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-950 text-white">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-slate-100">
          IdeaVerdict
        </h1>
        <p className="text-xl text-slate-400">
          The AI-powered startup idea stress-tester. Score your vision against 6 IVSM factors.
        </p>
        <Link
          to="/auth"
          className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
