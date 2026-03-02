"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [accessToken, setAccessToken] = useState("")

  // Verify the recovery token via our API (server-side, bypasses ISP block)
  useEffect(() => {
    const verifyToken = async () => {
      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")

      if (!token_hash || type !== "recovery") {
        setIsChecking(false)
        return
      }

      try {
        const res = await fetch("/api/verify-recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token_hash, type }),
        })

        const data = await res.json()

        if (res.ok && data.access_token) {
          setAccessToken(data.access_token)
          setIsValidToken(true)
        }
      } catch (err) {
        console.error("Verification failed:", err)
      }

      setIsChecking(false)
    }

    verifyToken()
  }, [searchParams])

  const getPasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      alert("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.")
      return
    }

    setIsLoading(true)

    try {
      // Update password via our API (server-side, bypasses ISP block)
      const res = await fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
        setIsLoading(false)
        return
      }

      setIsSuccess(true)

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      alert("Something went wrong. Please try again.")
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleResetPassword()
  }

  // Loading State
  if (isChecking) {
    return (
      <main className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Verifying reset link...</p>
        </div>
      </main>
    )
  }

  // Invalid Token State
  if (!isValidToken && !isChecking) {
    return (
      <main className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0f] text-white flex items-center justify-center px-4">
        <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-red-600 rounded-full blur-[120px] md:blur-[180px] opacity-20 -top-20 -right-20 md:-top-40 md:-right-40" />

        <div className="relative z-10 w-full max-w-md text-center animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Invalid or Expired Link</h1>
          <p className="text-gray-400 text-sm mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/forgot-password"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Request New Reset Link
            </Link>
            <Link
              href="/login"
              className="py-3 px-6 rounded-2xl bg-white/[0.08] border border-white/15 text-sm font-medium text-gray-300 hover:bg-white/[0.12] transition-all duration-300"
            >
              Back to Sign In
            </Link>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-up { animation: fade-up 0.7s ease-out; }
        `}</style>
      </main>
    )
  }

  // Main Reset Form
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0f] text-white flex items-center justify-center px-4 py-6 md:px-5 md:py-10">

      <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600 rounded-full blur-[120px] md:blur-[180px] opacity-20 -top-20 -right-20 md:-top-40 md:-right-40 animate-pulse-slow" />
      <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-purple-600 rounded-full blur-[100px] md:blur-[160px] opacity-15 -bottom-20 -left-20 md:-bottom-32 md:-left-32 animate-pulse-slow2" />
      <div className="absolute w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-cyan-600 rounded-full blur-[90px] md:blur-[140px] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float" />

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

        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 mb-4 shadow-lg shadow-green-500/25 animate-float-logo">
            <span className="text-2xl md:text-3xl">{isSuccess ? "✅" : "🔒"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isSuccess ? "Password Updated!" : "Reset Password"}
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-2">
            {isSuccess
              ? "Your password has been successfully updated. Redirecting..."
              : "Enter your new password below."
            }
          </p>
        </div>

        <div className="bg-white/[0.06] border border-white/10 rounded-3xl backdrop-blur-2xl p-5 md:p-8 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-shadow duration-500">

          {isSuccess ? (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                You will be redirected to the login page in a few seconds...
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 font-semibold text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* New Password */}
                <div className="group">
                  <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
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

                  {password && (
                    <div className="mt-2 ml-1">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength >= level
                                ? strengthColors[passwordStrength]
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] ${
                        passwordStrength <= 1 ? "text-red-400" :
                        passwordStrength === 2 ? "text-yellow-400" :
                        passwordStrength === 3 ? "text-blue-400" :
                        "text-green-400"
                      }`}>
                        {strengthLabels[passwordStrength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className={`w-full bg-white/[0.06] border rounded-xl pl-11 pr-12 py-3.5 text-base md:text-sm text-white placeholder-gray-500 outline-none focus:ring-2 hover:border-white/20 transition-all duration-300 ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                          : confirmPassword && password === confirmPassword
                          ? "border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50"
                          : "border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? (
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-red-400 mt-1 ml-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[10px] text-green-400 mt-1 ml-1">Passwords match ✓</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-[length:200%_100%] animate-gradient font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Password
                    </>
                  )}
                </span>
              </button>
            </>
          )}
        </div>

        {!isSuccess && (
          <p className="text-center mt-6 text-sm text-gray-400">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline underline-offset-4 transition-colors inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
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

// Wrap in Suspense because of useSearchParams
export default function ResetPassword() {
  return (
    <Suspense fallback={
      <main className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}