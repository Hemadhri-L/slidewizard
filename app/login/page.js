"use client"

import { useState, useEffect } from "react"
// Import createClient to handle cookies properly
import { createClient } from "@/utils/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Login() {
  // Initialize the client component-side
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/")
      }
    }
    checkSession()
  }, [router, supabase])

  // Standard Email Login
  // Standard Email Login (Server Proxy Version)
const handleLogin = async () => {
  if (!email || !password) {
    alert("Please fill in all fields.")
    return
  }

  setIsLoading(true)

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()
  setIsLoading(false)

  if (!res.ok) {
    alert(data.error)
    return
  }

  const { error } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  })

  if (error) {
    alert(error.message)
    return
  }

  router.refresh()
  router.push("/")
}

  // ✅ Fixed Google Login using Server Route
const handleGoogleLogin = async () => {
  setIsGoogleLoading(true)

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://slidewizard-nine.vercel.app"
    }
  })

  if (error) {
    console.error(error)
    setIsGoogleLoading(false)
  }
}

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0f] text-white flex items-center justify-center px-4 py-6 md:px-5 md:py-10">

      {/* ── Background Effects ── */}
      <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600 rounded-full blur-[120px] md:blur-[180px] opacity-20 -top-20 -right-20 md:-top-40 md:-right-40 animate-pulse-slow" />
      <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-purple-600 rounded-full blur-[100px] md:blur-[160px] opacity-15 -bottom-20 -left-20 md:-bottom-32 md:-left-32 animate-pulse-slow2" />
      <div className="absolute w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-cyan-600 rounded-full blur-[90px] md:blur-[140px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" />

      {/* ── Particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-particle"
            style={{
              left: `${15 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">

        {/* ── Header ── */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/25 animate-float-logo">
            <span className="text-2xl md:text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-2">
            Sign in to continue to AI PPT Maker
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl backdrop-blur-2xl p-5 md:p-8 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow duration-500">

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/[0.08] border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300 group mb-6 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium text-gray-300">Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium text-gray-300">Continue with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-base md:text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-xs font-medium text-gray-400 group-focus-within:text-blue-400 transition-colors">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-base md:text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:border-white/20 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_100%] animate-gradient font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </>
              )}
            </span>
          </button>

          <p className="text-[10px] text-gray-500 text-center mt-4 leading-relaxed">
            By signing in, you agree to our{" "}
            <span className="text-purple-400 hover:underline cursor-pointer">Terms</span> and{" "}
            <span className="text-purple-400 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline underline-offset-4 transition-colors">
            Create Account
          </Link>
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: "⚡", label: "AI Powered" },
            { icon: "🎨", label: "8+ Themes" },
            { icon: "📥", label: "Free Export" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 transition-all duration-300 hover:scale-105"
            >
              <span className="text-lg">{feature.icon}</span>
              <span className="text-[10px] text-gray-400 font-medium">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 4s ease infinite; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.7s ease-out; }
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        @keyframes float-logo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-logo { animation: float-logo 3s ease-in-out infinite; }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-pulse-slow2 { animation: pulse-slow 8s ease-in-out infinite 2s; }
        @keyframes particle {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        .animate-particle { animation: particle 8s ease-in-out infinite; }
      `}</style>
    </main>
  )
}