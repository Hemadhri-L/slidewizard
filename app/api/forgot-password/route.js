import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Rate limiter — prevent email spam
const emailAttempts = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxAttempts = 3 // only 3 reset emails per 15 min per IP

  if (!emailAttempts.has(ip)) {
    emailAttempts.set(ip, [])
  }

  const userAttempts = emailAttempts.get(ip).filter(time => now - time < windowMs)
  emailAttempts.set(ip, userAttempts)

  if (userAttempts.length >= maxAttempts) {
    return true
  }

  userAttempts.push(now)
  return false
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again after 15 minutes." },
        { status: 429 }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}