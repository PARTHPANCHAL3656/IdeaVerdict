import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()

  const [loadingSession, setLoadingSession] = useState(true)

  const [formData, setFormData] = useState({
    idea_title: '',
    idea_description: '',
    problem_statement: '',
    domain_expertise: '',
    technical_skills: '',
    target_user: '',
    india_market_context: '',
    expects_revenue: 'day_1',
    knows_competitors: false,
    named_competitors: '',
    team_size: 'Solo',
    needs_funding: false
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  // ✅ ADD THIS (IMPORTANT FIX)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        navigate('/auth')
      } else {
        // remove token from URL
        window.history.replaceState({}, document.title, '/dashboard')
      }

      setLoadingSession(false)
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ⛔ prevent blank screen
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col p-6 bg-slate-950 text-white pb-24">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold">IdeaVerdict</h1>

        <div className="flex items-center gap-6">
          <Link to="/history" className="text-slate-400 hover:text-white">
            Library
          </Link>

          <button onClick={handleLogout} className="text-slate-400 hover:text-white">
            Logout
          </button>
        </div>
      </header>

      {/* ✅ YOUR ORIGINAL UI CONTINUES BELOW */}
      <main className="flex flex-col items-center flex-1 space-y-6 mt-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-slate-100">
            Analyse Your Idea
          </h2>
          <p className="text-slate-400 mt-2">
            Test your startup idea using AI
          </p>
        </div>

        {/* KEEP YOUR FULL FORM HERE (NO CHANGE) */}
      </main>
    </div>
  )
}
