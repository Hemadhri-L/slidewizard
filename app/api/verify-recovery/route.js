import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Simple in-memory rate limiter
const attempts = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5 // max 5 attempts per 15 min

  if (!attempts.has(ip)) {
    attempts.set(ip, [])
  }

  const userAttempts = attempts.get(ip).filter(time => now - time < windowMs)
  attempts.set(ip, userAttempts)

  if (userAttempts.length >= maxAttempts) {
    return true
  }

  userAttempts.push(now)
  return false
}

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again after 15 minutes." },
        { status: 429 }
      )
    }

    const { token_hash, type } = await req.json()

    // Validate inputs
    if (!token_hash || !type) {
      return NextResponse.json(
        { error: "Invalid recovery link" },
        { status: 400 }
      )
    }

    // Reject obviously fake tokens
    if (token_hash.length < 20 || type !== "recovery") {
      return NextResponse.json(
        { error: "Invalid recovery link" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: "Invalid or expired recovery link" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user.id,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired recovery link" },
      { status: 500 }
    )
  }
}