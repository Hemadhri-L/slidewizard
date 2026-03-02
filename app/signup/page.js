"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabaseClient"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Signup() {
  const router = useRouter()

  // Steps: 'signup' | 'verify'
  const [step, setStep] = useState("signup")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) router.push("/")
    }
    checkSession()
  }, [router])

  // Step 1: Request Signup (Send OTP)
  const handleSignup = async () => {
    if (!email || !password) return alert("Please fill in all fields.")
    if (password !== confirmPassword) return alert("Passwords do not match.")
    if (password.length < 6) return alert("Password must be at least 6 characters.")

    setIsLoading(true)

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setIsLoading(false)

    if (!res.ok) {
      alert(data.error)
    } else {
      setStep("verify")
    }
  }

  // Step 2: Verify OTP
  const handleVerify = async () => {
    if (!otp) return alert("Please enter the code.")
    
    setIsVerifying(true)

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: otp }),
    })

    const data = await res.json()
    setIsVerifying(false)

    if (!res.ok) {
      alert(data.error)
    } else {
      // Set session manually on client to persist login
      const { error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
      
      if (!error) {
        router.push("/")
      }
    }
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#0a0a0f] text-white flex items-center justify-center px-4 py-6 md:px-5 md:py-10">

      {/* ── Background Effects ── */}
      <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600 rounded-full blur-[120px] md:blur-[180px] opacity-20 -top-20 -left-20 animate-pulse-slow" />
      <div className="absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-600 rounded-full blur-[100px] md:blur-[160px] opacity-15 -bottom-20 -right-20 animate-pulse-slow2" />

      {/* ── Particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-particle" style={{ left: `${15 + i * 15}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${6 + i * 1.5}s` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-500/25 animate-float-logo">
            <span className="text-2xl">
              {step === "signup" ? "🤖" : "📧"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            {step === "signup" ? "Create Account" : "Verify Email"}
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-2">
            {step === "signup" ? "Join AI PPT Maker and start creating" : `Enter the code sent to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] border border-white/10 rounded-3xl backdrop-blur-2xl p-5 md:p-8 shadow-2xl shadow-purple-500/5">
          
          {step === "signup" ? (
            /* ── SIGNUP FORM ── */
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <button
                onClick={handleSignup}
                disabled={isLoading || !email || !password || password !== confirmPassword}
                className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-[length:200%_100%] animate-gradient font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                {isLoading ? "Sending Code..." : "Create Account"}
              </button>

              <p className="text-center mt-4 text-sm text-gray-400">
                Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300 hover:underline">Sign In</Link>
              </p>
            </div>
          ) : (
            /* ── VERIFY OTP FORM ── */
            <div className="space-y-4 animate-fade-in">
              <div className="group">
  <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">Verification Code</label>
  <input
    type="text"
    placeholder="123456" // changed placeholder
    value={otp}
    onChange={(e) => setOtp(e.target.value)}
    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 text-center text-2xl tracking-widest text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
    maxLength={8} // 👈 CHANGED FROM 6 TO 8
  />
</div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || otp.length < 6}
                className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              >
                {isVerifying ? "Verifying..." : "Verify & Login"}
              </button>

              <button 
                onClick={() => setStep("signup")}
                className="w-full text-xs text-gray-500 hover:text-gray-300 mt-2"
              >
                Wrong email? Go back
              </button>
            </div>
          )}

        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { animation: gradient 4s ease infinite; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 0.7s ease-out; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out; }
        @keyframes float-logo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .animate-float-logo { animation: float-logo 3s ease-in-out infinite; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.05); } }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-pulse-slow2 { animation: pulse-slow 8s ease-in-out infinite 2s; }
        @keyframes particle { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-10vh) scale(1); opacity: 0; } }
        .animate-particle { animation: particle 8s ease-in-out infinite; }
      `}</style>
    </main>
  )
}