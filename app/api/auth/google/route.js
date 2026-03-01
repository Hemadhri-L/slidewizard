import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({
            name,
            value,
            ...options,
            secure: true,
            sameSite: "lax",
          })
        },
        remove(name, options) {
          cookieStore.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${requestUrl.origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=google-auth-failed`
    )
  }

  return NextResponse.redirect(data.url)
}