"use client"

import { useState } from "react"
import { supabase } from "@/utils/supabaseClient"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email address.")
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setIsSent(true)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleResetPassword()
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
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-lg shadow-purple-500/25 animate-float-logo">
            <span className="text-2xl md:text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            {isSent ? "Check Your Email" : "Forgot Password"}
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-xs mx-auto">
            {isSent
              ? "We've sent a password reset link to your email address."
              : "Enter your email and we'll send you a link to reset your password."
            }
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl backdrop-blur-2xl p-5 md:p-8 shadow-2xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-shadow duration-500">

          {isSent ? (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                <p className="text-sm text-gray-300">Reset link sent to</p>
                <p className="text-sm font-semibold text-blue-400 mt-1 break-all">{email}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Didn&apos;t receive the email? Check your spam folder or
                </p>
                <button
                  onClick={() => {
                    setIsSent(false)
                    setEmail("")
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300 font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Try again with a different email
                </button>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-2 py-3 px-6 rounded-2xl bg-white/[0.08] border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium text-gray-300">Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 group-focus-within:text-purple-400 transition-colors">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
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
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-base md:text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={isLoading || !email}
                className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-[length:200%_100%] animate-gradient font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Reset Link
                    </>
                  )}
                </span>
              </button>
            </>
          )}
        </div>

        {!isSent && (
          <p className="text-center mt-6 text-sm text-gray-400">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline underline-offset-4 transition-colors">
              Sign In
            </Link>
          </p>
        )}
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