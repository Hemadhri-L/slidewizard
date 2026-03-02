import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Rate limiter for password updates
const updateAttempts = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxAttempts = 3 // only 3 password updates per 15 min

  if (!updateAttempts.has(ip)) {
    updateAttempts.set(ip, [])
  }

  const userAttempts = updateAttempts.get(ip).filter(time => now - time < windowMs)
  updateAttempts.set(ip, userAttempts)

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
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { access_token, password } = await req.json()

    if (!access_token || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (password.length > 72) {
      return NextResponse.json(
        { error: "Password is too long" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token)

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please request a new reset link." },
        { status: 401 }
      )
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      { password }
    )

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}