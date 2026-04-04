import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const { data, error: fetchError } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', id)
          .single()
        
        if (fetchError) throw fetchError
        if (!data) throw new Error("Analysis not found")
        
        setAnalysis(data)
      } catch (err) {
        console.error(err)
        setError("Could not load analysis details.")
      } finally {
        setLoading(false)
      }
    }
    
    if (id) fetchAnalysis()
  }, [id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'Build It': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Pivot It': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Drop It': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Sleeper Hit': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const factorLabels = {
    problem_clarity: "Problem Clarity",
    target_user_fit: "Target User Fit",
    india_market_fit: "India Market Fit",
    competition_differentiation: "Competition & Differentiation",
    domain_expertise_required: "Domain Expertise Required",
    first_revenue_likelihood: "First Revenue Likelihood"
  };

  const confidenceLabels = {
    problem_clearly_defined: "Problem Defined",
    target_user_specific: "User Specific",
    india_context_provided: "India Context",
    competitors_named: "Competitors Named",
    revenue_timeline_given: "Revenue Timeline",
    team_size_known: "Team Size Known",
    funding_stance_clear: "Funding Stance",
    idea_description_sufficient: "Description Sufficient"
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="animate-pulse text-lg text-slate-400">Loading analysis...</p>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
        <h2 className="text-2xl font-bold text-red-400 mb-4">{error || "Analysis not found"}</h2>
        <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const result = analysis.result;

  return (
    <div className="flex min-h-screen flex-col p-6 bg-slate-950 text-white pb-24">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <Link to="/dashboard">IdeaVerdict</Link>
        </h1>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">
            Analyze
          </Link>
          <Link to="/history" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">
            Library
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center flex-1 space-y-6 mt-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
            {analysis.idea_title}
          </h2>
          <p className="text-slate-400 max-w-lg mt-2 mx-auto">
             Analyzed on {new Date(analysis.scored_at).toLocaleDateString()}
          </p>
        </div>

        <div className="w-full max-w-2xl text-left bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl mt-8 space-y-10">

          {/* VERDICT BADGE */}
          <div className={`flex flex-col items-center justify-center p-8 border rounded-xl ${getVerdictStyle(result.verdict)}`}>
            <span className="uppercase text-sm tracking-widest font-bold opacity-80 mb-2">Verdict</span>
            <span className="text-5xl font-black mb-2 tracking-tight">{result.verdict}</span>
            <span className="text-xl opacity-90 font-medium">Score: {result.total_score} / 60</span>
            {result.verdict === 'Sleeper Hit' && result.sleeper_hit_reason && (
              <p className="mt-5 text-center text-sm font-medium border-t border-current/20 pt-4 px-4 w-full max-w-md">{result.sleeper_hit_reason}</p>
            )}
          </div>

          {/* SCORE BREAKDOWN */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-white border-b border-slate-800 pb-2">Score Breakdown</h3>
            <div className="space-y-5">
              {Object.entries(result.scores || {}).map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">{factorLabels[key] || key}</span>
                    <span className="text-slate-400 font-mono font-medium">{score}/10</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 break-inside-avoid">
                    <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${(score / 10) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY THIS WILL FAIL */}
          {(result.why_this_will_fail && result.why_this_will_fail.length > 0) && (
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight text-white border-b border-slate-800 pb-2">Why This Will Fail</h3>
              <div className="space-y-3">
                {result.why_this_will_fail.map((reason, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm leading-relaxed">
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONE THING TO VALIDATE FIRST */}
          {result.one_thing_to_validate_first && (
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight text-white border-b border-slate-800 pb-2">Validate This First</h3>
              <div className="p-5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-base font-medium leading-relaxed shadow-inner">
                {result.one_thing_to_validate_first}
              </div>
            </div>
          )}

          {/* CONFIDENCE METER */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-white border-b border-slate-800 pb-2">Analysis Confidence: {result.confidence}%</h3>
            <div className="mb-5">
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className={`h-2 rounded-full ${result.confidence >= 70 ? 'bg-green-500' : result.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${result.confidence}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(result.confidence_breakdown || {}).map(([key, isTrue]) => (
                <span key={key} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${isTrue ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                  {confidenceLabels[key] || key}
                </span>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center rounded-md bg-transparent border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white mt-8 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            ANALYSE ANOTHER IDEA
          </Link>
          
        </div>
      </main>
    </div>
  )
}
