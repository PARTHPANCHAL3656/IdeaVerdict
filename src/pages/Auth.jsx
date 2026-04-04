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

  // EMAIL/PASSWORD
  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSignIn) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        alert('Check your email for confirmation!')
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

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })

    if (error) setError(error.message)
  }

  // LINKEDIN LOGIN
  const handleLinkedInLogin = async () => {
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })

    if (error) setError(error.message)
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
        onGoogleLogin={handleGoogleLogin}
        onLinkedInLogin={handleLinkedInLogin}
      />
    </div>
  )
}
