import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()

  const [loadingSession, setLoadingSession] = useState(true)

  // ✅ IMPORTANT: HANDLE SESSION AFTER OAUTH
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        navigate('/auth')
        return
      }

      if (!data.session) {
        navigate('/auth')
      } else {
        // ✅ CLEAN URL (remove token)
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

  // ⛔ PREVENT BLANK SCREEN
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold">IdeaVerdict</h1>

        <div className="flex gap-4">
          <Link to="/history" className="text-slate-400 hover:text-white">
            Library
          </Link>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mt-10 text-center">
        <h2 className="text-3xl font-bold">Dashboard Loaded ✅</h2>
        <p className="text-slate-400 mt-2">
          Your authentication and routing are working perfectly.
        </p>
      </div>
    </div>
  )
}
