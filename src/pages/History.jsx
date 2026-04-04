import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import html2pdf from 'html2pdf.js'

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
    <div className="flex min-h-screen flex-col p-6 bg-slate-950 text-white pb-24">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          <Link to="/dashboard">IdeaVerdict</Link>
        </h1>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors">
            Analyze
          </Link>
          <span className="text-sm font-medium text-slate-100">
            Library
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex flex-col items-center flex-1 space-y-6 mt-8 w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Your Library
          </h2>
          <p className="text-slate-400 mt-2">
             Past ideas you have analyzed with IVSM.
          </p>
        </div>

        {loading ? (
          <p className="animate-pulse text-lg text-slate-400">Loading library...</p>
        ) : error ? (
          <div className="p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-xl w-full">
            <h3 className="text-xl font-bold text-slate-300 mb-2">No analyses yet</h3>
            <p className="text-slate-500 mb-6">Start by analyzing your first startup idea.</p>
            <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {analyses.map((item) => (
              <Link 
                to={`/results/${item.id}`} 
                key={item.id}
                className="flex flex-col p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getVerdictBadge(item.verdict)}`}>
                    {item.verdict}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">
                    {new Date(item.scored_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-white mb-2 line-clamp-2">
                  {item.idea_title}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Score: <span className="font-mono text-white">{item.total_score}</span> / 60</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleDownloadPDF(e, item)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                      title="Download PDF"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      PDF
                    </button>
                    <span className="text-indigo-400 group-hover:text-indigo-300 font-medium flex items-center gap-1">
                      View Details <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
