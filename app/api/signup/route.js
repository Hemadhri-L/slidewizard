import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// 🔒 Security: Rate Limiter to prevent bot spam
const signupAttempts = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5 // Max 5 signups per IP per 15 mins

  if (!signupAttempts.has(ip)) {
    signupAttempts.set(ip, [])
  }

  const userAttempts = signupAttempts.get(ip).filter(time => now - time < windowMs)
  signupAttempts.set(ip, userAttempts)

  if (userAttempts.length >= maxAttempts) return true
  
  userAttempts.push(now)
  return false
}

export async function POST(req) {
  try {
    // 1. Get User IP
    const ip = req.headers.get("x-forwarded-for") || "unknown"

    // 2. Check Rate Limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    // 3. Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // 4. Trigger Secure OTP Email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // Force OTP mode
      }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
    
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}