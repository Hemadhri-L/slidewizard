import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Verify the email OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Return the session so the frontend can log them in
    return NextResponse.json({ 
      session: data.session 
    })
    
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}