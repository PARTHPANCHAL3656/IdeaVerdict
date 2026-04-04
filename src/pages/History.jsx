import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import html2pdf from 'html2pdf.js'
import { Lightbulb, Library, Download, ArrowRight, AlertCircle } from 'lucide-react'
import { SwitchMode } from '../components/SwitchMode'

export default function History() {
  const navigate = useNavigate()
  
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) throw new Error("Authentication error. Please log in again.")

        const { data, error: fetchError } = await supabase
          .from('analyses')
          .select('id, idea_title, verdict, total_score, scored_at, result')
          .eq('user_id', userData.user.id)
          .order('scored_at', { ascending: false })
        
        if (fetchError) throw fetchError
        
        setAnalyses(data || [])
      } catch (err) {
        console.error(err)
        setError("Could not load your library.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchHistory()
  }, [])

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

  const handleDownloadPDF = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #1e293b; background: white;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0f172a;">IdeaVerdict Report</h1>
        <h2 style="font-size: 20px; color: #334155; margin-bottom: 30px;">${item.idea_title}</h2>
        
        <div style="padding: 20px; background-color: #f8fafc; border: 2px solid ${getVerdictHTMLColor(item.verdict)}; border-radius: 8px; margin-bottom: 30px; text-align: center;">
          <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 5px;">Verdict</div>
          <div style="font-size: 32px; font-weight: 900; color: ${getVerdictHTMLColor(item.verdict)}; margin-bottom: 5px;">${item.verdict}</div>
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

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'Build It': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Pivot It': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Drop It': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Sleeper Hit': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-50 dark:via-white dark:to-slate-50 text-white dark:text-slate-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 dark:border-slate-200/30 bg-slate-950/80 dark:bg-white/80 backdrop-blur-xl transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Lightbulb size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white dark:text-slate-900 transition-colors">IdeaVerdict</h1>
          </Link>
          <nav className="flex items-center gap-8">
            <Link to="/dashboard" className="text-sm font-medium text-slate-400 dark:text-slate-600 hover:text-slate-200 dark:hover:text-slate-900 transition-colors hover:underline">
              Analyze
            </Link>
            <span className="text-sm font-medium text-cyan-400 dark:text-cyan-600">Library</span>
            <SwitchMode />
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors text-slate-300 dark:text-slate-900"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-purple-950/50 dark:bg-purple-100 border border-purple-700/50 dark:border-purple-300">
            <span className="text-xs font-semibold text-purple-300 dark:text-purple-700 flex items-center gap-2 transition-colors">
              <Library size={14} /> Your Analysis Library
            </span>
          </div>
          <h2 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-slate-100 dark:from-slate-950 to-slate-400 dark:to-slate-700 bg-clip-text text-transparent">
            Your Ideas
          </h2>
          <p className="text-lg text-slate-400 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed transition-colors">
            Review all your past startup idea analyses. Track your verdicts, scores, and insights from IVSM.
          </p>
        </div>

        {/* Content */}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="space-y-4 text-center">
              <div className="flex justify-center mb-4">
                <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-slate-400 dark:text-slate-600 font-medium transition-colors">Loading your library...</p>
            </div>
          </div>
        ) : error ? (
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/10 dark:bg-red-600/5 rounded-2xl blur-xl transition-colors"></div>
            <div className="relative bg-red-950/40 dark:bg-red-100/60 backdrop-blur border border-red-800/50 dark:border-red-300/50 rounded-2xl p-8 flex items-start gap-4 transition-colors">
              <AlertCircle size={24} className="text-red-400 dark:text-red-600 flex-shrink-0 mt-1 transition-colors" />
              <div>
                <h3 className="font-semibold text-red-300 dark:text-red-700 mb-1 transition-colors">Error Loading Library</h3>
                <p className="text-red-300/80 dark:text-red-600/80 text-sm transition-colors">{error}</p>
              </div>
            </div>
          </div>
        ) : analyses.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 dark:from-cyan-600/5 to-blue-600/10 dark:to-blue-600/5 rounded-2xl blur-xl transition-colors"></div>
            <div className="relative bg-slate-900/60 dark:bg-slate-100/60 backdrop-blur border border-slate-800/50 dark:border-slate-200/30 rounded-2xl p-12 text-center transition-colors">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 dark:bg-slate-200/50 flex items-center justify-center mx-auto mb-6 transition-colors">
                <Library size={32} className="text-slate-600 dark:text-slate-400 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-200 dark:text-slate-900 mb-2 transition-colors">No Analyses Yet</h3>
              <p className="text-slate-400 dark:text-slate-600 mb-8 transition-colors">Start by analyzing your first startup idea to build your library of insights.</p>
              <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-semibold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/30 dark:shadow-cyan-500/20">
                Start Analyzing
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {analyses.map((item) => (
              <Link 
                to={`/results/${item.id}`} 
                key={item.id}
                className="group relative block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 dark:from-cyan-600/3 to-blue-600/5 dark:to-blue-600/3 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-slate-900/60 dark:bg-slate-100/60 backdrop-blur border border-slate-800/50 dark:border-slate-200/30 rounded-xl p-6 hover:border-slate-700/50 dark:hover:border-slate-200/50 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getVerdictBadge(item.verdict)} whitespace-nowrap`}>
                        {item.verdict}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 dark:text-slate-900 group-hover:text-white dark:group-hover:text-slate-800 transition-colors line-clamp-1">
                        {item.idea_title}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap ml-4 transition-colors">
                      {new Date(item.scored_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Score and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      {/* Score */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-cyan-400">{item.total_score}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 transition-colors">/ 60</span>
                      </div>

                      {/* Score Bar */}
                      <div className="flex-1">
                        <div className="w-40 h-2 bg-slate-800/50 dark:bg-slate-300/50 rounded-full overflow-hidden transition-colors">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all"
                            style={{ width: `${(item.total_score / 60) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-4">
                      <button 
                        onClick={(e) => handleDownloadPDF(e, item)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 dark:bg-slate-200/50 hover:bg-slate-700 dark:hover:bg-slate-300 text-slate-300 dark:text-slate-900 hover:text-white dark:hover:text-slate-950 text-xs font-medium transition-all hover:shadow-lg dark:shadow-slate-400/10"
                        title="Download PDF Report"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                      <ArrowRight size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-cyan-400 dark:group-hover:text-cyan-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-slate-500 dark:text-slate-400 pb-8 pt-8 border-t border-slate-800/30 dark:border-slate-200/30 transition-colors">
          <p>Powered by IVSM (Idea Viability Scoring Model)</p>
        </div>
      </main>
    </div>
  )
}

