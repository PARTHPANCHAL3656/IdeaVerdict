import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import html2pdf from 'html2pdf.js'

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

  const getVerdictHTMLColor = (verdict) => {
    switch (verdict) {
      case 'Build It': return '#22c55e';
      case 'Pivot It': return '#f59e0b';
      case 'Drop It': return '#ef4444';
      case 'Sleeper Hit': return '#6366f1';
      default: return '#64748b';
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysis) return;
    const item = analysis;

    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #1e293b; background: white;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0f172a;">IdeaVerdict Report</h1>
        <h2 style="font-size: 20px; color: #334155; margin-bottom: 30px;">${item.idea_title}</h2>
        
        <div style="padding: 20px; background-color: #f8fafc; border: 2px solid ${getVerdictHTMLColor(item.result.verdict)}; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 5px;">Verdict</div>
          <div style="font-size: 32px; font-weight: 900; color: ${getVerdictHTMLColor(item.result.verdict)}; margin-bottom: 5px;">${item.result.verdict}</div>
          <div style="font-size: 16px; font-weight: bold; color: #475569;">Score: ${item.total_score} / 60</div>
        </div>

        <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Score Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <tbody>
            ${Object.entries(item.result.scores || {}).map(([key, score]) => `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475569;">${key.replace(/_/g, ' ').toUpperCase()}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; text-align: right; color: #0f172a;">${score}/10</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${item.result.why_this_will_fail && item.result.why_this_will_fail.length > 0 ? `
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Why This Will Fail</h3>
          <ul style="color: #475569; margin-bottom: 30px; padding-left: 20px;">
            ${item.result.why_this_will_fail.map(r => `<li style="margin-bottom: 10px;">${r}</li>`).join('')}
          </ul>
        ` : ''}

        ${item.result.one_thing_to_validate_first ? `
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Validate This First</h3>
          <div style="padding: 15px; background: #e0e7ff; color: #3730a3; border-radius: 8px; font-weight: 500;">
            ${item.result.one_thing_to_validate_first}
          </div>
        ` : ''}

        ${item.result.timing_note ? `
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Market Timing Note</h3>
          <p style="color: #475569; margin-bottom: 30px; font-style: italic;">${item.result.timing_note}</p>
        ` : ''}

        ${item.result.similar_products_in_market && item.result.similar_products_in_market.length > 0 ? `
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">What Already Exists in This Market</h3>
          <ul style="color: #475569; margin-bottom: 30px; padding-left: 20px;">
            ${item.result.similar_products_in_market.map(p => {
              const [name, ...rest] = p.split(' — ')
              return `<li style="margin-bottom: 8px;"><strong>${name}</strong>${rest.length ? ' — ' + rest.join(' — ') : ''}</li>`
            }).join('')}
          </ul>
        ` : ''}

        ${item.result.action_plan && item.result.action_plan.length > 0 ? `
          <h3 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Your 5-Step Action Plan</h3>
          <ol style="color: #475569; margin-bottom: 30px; padding-left: 20px;">
            ${item.result.action_plan.map(s => 
              `<li style="margin-bottom: 12px;"><strong>${s.title}</strong><br/>${s.detail}</li>`
            ).join('')}
          </ol>
        ` : ''}
      </div>
    `;

    const opt = {
      margin:       0,
      filename:     `ideaverdict-${item.idea_title.substring(0, 20).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(container).save();
  };

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
    <div className="flex min-h-screen flex-col p-6 bg-slate-950 dark:bg-white text-white dark:text-slate-900 pb-24 transition-colors">
      <header className="flex items-center justify-between py-4 border-b border-slate-800 dark:border-slate-200 transition-colors">
        <h1 className="text-2xl font-bold tracking-tight text-white dark:text-slate-900 transition-colors">
          <Link to="/" className="hover:opacity-80 transition-opacity">IdeaVerdict</Link>
        </h1>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-slate-400 dark:text-slate-600 hover:text-slate-100 dark:hover:text-slate-900 transition-colors">
            Analyze
          </Link>
          <Link to="/history" className="text-sm font-medium text-slate-400 dark:text-slate-600 hover:text-slate-100 dark:hover:text-slate-900 transition-colors">
            Library
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-400 dark:text-slate-600 hover:text-slate-100 dark:hover:text-slate-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center flex-1 space-y-6 mt-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 dark:text-slate-900 transition-colors">
            {analysis.idea_title}
          </h2>
          <p className="text-slate-400 dark:text-slate-500 max-w-lg mt-2 mx-auto transition-colors">
             Analyzed on {new Date(analysis.scored_at).toLocaleDateString()}
          </p>
        </div>

        <div className="w-full max-w-2xl text-left bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-300 rounded-xl p-8 shadow-xl mt-8 space-y-10 relative transition-colors">
          
          <button 
            onClick={handleDownloadPDF}
            className="absolute top-4 right-4 text-slate-400 dark:text-slate-600 hover:text-white dark:hover:text-slate-900 flex items-center gap-1.5 text-xs font-semibold bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 px-3 py-1.5 rounded transition-colors shadow-sm"
            title="Download Report as PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download PDF
          </button>

          {/* VERDICT BADGE */}
          <div className={`flex flex-col items-center justify-center p-8 border rounded-xl ${getVerdictStyle(result.verdict)}`}>
            <span className="uppercase text-sm tracking-widest font-bold opacity-80 mb-2">Verdict</span>
            <span className="text-5xl font-black mb-2 tracking-tight">{result.verdict}</span>
            <span className="text-xl opacity-90 font-medium">Score: {result.total_score} / 60</span>
            {result.verdict === 'Sleeper Hit' && result.sleeper_hit_reason && (
              <p className="mt-5 text-center text-sm font-medium border-t border-current/20 pt-4 px-4 w-full max-w-md">{result.sleeper_hit_reason}</p>
            )}
            {result.timing_note && (
              <p className="mt-4 text-center text-xs italic text-slate-400 dark:text-slate-500 transition-colors">{result.timing_note}</p>
            )}
          </div>

          {/* SCORE BREAKDOWN */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-white dark:text-slate-900 border-b border-slate-800 dark:border-slate-300 pb-2 transition-colors">Score Breakdown</h3>
            <div className="space-y-5">
              {Object.entries(result.scores || {}).map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 dark:text-slate-700 font-medium transition-colors">{factorLabels[key] || key}</span>
                    <span className="text-slate-400 dark:text-slate-600 font-mono font-medium transition-colors">{score}/10</span>
                  </div>
                  <div className="w-full bg-slate-800 dark:bg-slate-300 rounded-full h-2 break-inside-avoid transition-colors">
                    <div className="bg-slate-400 dark:bg-slate-600 h-2 rounded-full transition-colors" style={{ width: `${(score / 10) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHY THIS WILL FAIL */}
          {(result.why_this_will_fail && result.why_this_will_fail.length > 0) && (
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight text-white dark:text-slate-900 border-b border-slate-800 dark:border-slate-300 pb-2 transition-colors">Why This Will Fail</h3>
              <div className="space-y-3">
                {result.why_this_will_fail.map((reason, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-950 dark:bg-slate-200 border border-slate-800 dark:border-slate-300 text-slate-300 dark:text-slate-700 text-sm leading-relaxed transition-colors">
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WHAT ALREADY EXISTS IN MARKET */}
          {(result.similar_products_in_market && result.similar_products_in_market.length > 0) && (
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight text-white dark:text-slate-900 border-b border-slate-800 dark:border-slate-300 pb-2 transition-colors">What Already Exists in This Market</h3>
              <div className="space-y-3">
                {result.similar_products_in_market.map((product, idx) => {
                  const [name, ...rest] = product.split('—');
                  const description = rest.join('—').trim();
                  return (
                    <div key={idx} className="p-4 rounded-lg bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-300 transition-colors flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">🏢</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-100 dark:text-slate-900 text-sm">
                          <span className="font-bold">{name.trim()}</span>
                          {description && <> — <span className="text-slate-400 dark:text-slate-600">{description}</span></>
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* YOUR ACTION PLAN */}
          {(result.action_plan && result.action_plan.length > 0) && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight text-white dark:text-slate-900 border-b border-slate-800 dark:border-slate-300 pb-2 transition-colors">Your 5-Step Action Plan</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic transition-colors">Only shown for ideas scoring 40+</p>
              </div>
              <div className="space-y-4">
                {result.action_plan.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white font-bold text-sm">
                        {step.step || idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-slate-100 dark:text-slate-900 font-bold text-sm transition-colors">{step.title}</p>
                      <p className="text-slate-400 dark:text-slate-600 text-sm mt-1 leading-relaxed transition-colors">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONE THING TO VALIDATE FIRST */}
          {result.one_thing_to_validate_first && (
            <div>
              <h3 className="text-lg font-bold mb-4 tracking-tight text-white dark:text-slate-900 border-b border-slate-800 dark:border-slate-300 pb-2 transition-colors">Validate This First</h3>
              <div className="p-5 rounded-lg bg-indigo-500/10 dark:bg-indigo-100/50 border border-indigo-500/20 dark:border-indigo-300/30 text-indigo-200 dark:text-indigo-900 text-base font-medium leading-relaxed shadow-inner transition-colors">
                {result.one_thing_to_validate_first}
              </div>
            </div>
          )}

          {/* CONFIDENCE METER */}
          <div>
            <h3 className="text-lg font-bold mb-5 tracking-tight text-white dark:text-slate-900 border-b border-slate-800 dark:border-slate-300 pb-2 transition-colors">Analysis Confidence: {result.confidence}%</h3>
            <div className="mb-5">
              <div className="w-full bg-slate-800 dark:bg-slate-300 rounded-full h-2 transition-colors">
                <div className={`h-2 rounded-full ${result.confidence >= 70 ? 'bg-green-500' : result.confidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${result.confidence}%` }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(result.confidence_breakdown || {}).map(([key, isTrue]) => (
                <span key={key} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${isTrue ? 'bg-green-500/10 dark:bg-green-100/50 text-green-400 dark:text-green-700 border-green-500/20 dark:border-green-300/30' : 'bg-slate-800 dark:bg-slate-300 text-slate-500 dark:text-slate-600 border-slate-700 dark:border-slate-400'}`}>
                  {confidenceLabels[key] || key}
                </span>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center rounded-md bg-transparent border border-slate-700 dark:border-slate-300 px-4 py-3 text-sm font-bold text-slate-300 dark:text-slate-700 transition-colors hover:bg-slate-800 dark:hover:bg-slate-200 hover:text-white dark:hover:text-slate-900 mt-8 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
          >
            ANALYSE ANOTHER IDEA
          </Link>
          
        </div>
      </main>
    </div>
  )
}
