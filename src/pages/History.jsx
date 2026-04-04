import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
          .select('id, idea_title, verdict, total_score, scored_at')
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
                  <span className="text-indigo-400 group-hover:text-indigo-300 font-medium flex items-center gap-1">
                    View Details <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
