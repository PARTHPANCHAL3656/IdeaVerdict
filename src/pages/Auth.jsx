import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SwapForm from '../components/SwapForm'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // ✅ EMAIL/PASSWORD AUTH
  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSignIn) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        alert('Check your email for the confirmation link!')
        setEmail('')
        setPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ GOOGLE AUTH (NEW)
  const handleGoogleLogin = async () => {
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/dashboard',
      },
    })

    if (error) {
      console.error(error.message)
      setError(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white dark:bg-zinc-950">
      <SwapForm
        isSignIn={isSignIn}
        onModeChange={setIsSignIn}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handleAuth}
        loading={loading}
        error={error}

        // ✅ PASS GOOGLE FUNCTION TO COMPONENT
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  )
}
